/**
 * Flexism Streaming SSR
 *
 * Progressive HTML streaming with suspense-like boundaries
 */

import { renderToString } from 'flexium/server'
import type { FNodeChild } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamingOptions {
  /** Enable streaming (default: true) */
  enabled?: boolean
  /** Flush shell immediately (default: true) */
  flushShell?: boolean
  /** Timeout for pending chunks in ms (default: 10000) */
  timeout?: number
  /** Bootstrap script path */
  bootstrapScript?: string
  /** Error handling strategy */
  onError?: 'skip' | 'fallback' | 'throw'
  /** Error fallback HTML */
  errorFallback?: string
}

export interface StreamingChunk {
  /** Chunk ID */
  id: string
  /** Async content loader */
  loader: () => Promise<FNodeChild>
  /** Fallback content while loading */
  fallback?: FNodeChild
}

export interface StreamingContext {
  /** Register a streaming chunk */
  registerChunk: (chunk: StreamingChunk) => string
  /** Get pending chunks */
  getPendingChunks: () => StreamingChunk[]
  /** Check if any chunks are pending */
  hasPendingChunks: () => boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Streaming Context
// ─────────────────────────────────────────────────────────────────────────────

let chunkIdCounter = 0

/**
 * Create a streaming context for collecting async boundaries
 */
export function createStreamingContext(): StreamingContext {
  const chunks: StreamingChunk[] = []

  return {
    registerChunk(chunk: StreamingChunk): string {
      const id = chunk.id || `chunk-${++chunkIdCounter}`
      chunks.push({ ...chunk, id })
      return id
    },

    getPendingChunks(): StreamingChunk[] {
      return [...chunks]
    },

    hasPendingChunks(): boolean {
      return chunks.length > 0
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Streaming Renderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render to a readable stream with progressive HTML
 *
 * @example
 * ```ts
 * const stream = renderToStream(
 *   <App />,
 *   {
 *     bootstrapScript: '/client.js',
 *     onError: 'fallback',
 *   }
 * )
 *
 * return new Response(stream, {
 *   headers: { 'Content-Type': 'text/html' },
 * })
 * ```
 */
export function renderToStream(
  content: FNodeChild,
  options: StreamingOptions = {}
): ReadableStream<Uint8Array> {
  const {
    enabled = true,
    flushShell = true,
    timeout = 10000,
    bootstrapScript,
    onError = 'fallback',
    errorFallback = '<div style="color:red">Error loading content</div>',
  } = options

  const encoder = new TextEncoder()

  // Non-streaming fallback
  if (!enabled) {
    const { html } = renderToString(content, { hydrate: true })
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(html))
        controller.close()
      },
    })
  }

  // Create streaming context
  const context = createStreamingContext()

  return new ReadableStream({
    async start(controller) {
      try {
        // Render initial shell with placeholders
        // Note: streamingContext is collected via component registration, not passed to renderToString
        const { html: shellHtml, state } = renderToString(content, {
          hydrate: true,
        })

        // Send the shell
        if (flushShell) {
          controller.enqueue(encoder.encode(shellHtml))
        }

        // Process pending chunks
        const chunks = context.getPendingChunks()

        if (chunks.length > 0) {
          // Add streaming runtime script
          controller.enqueue(encoder.encode(getStreamingRuntime()))

          // Process each chunk
          const chunkPromises = chunks.map(async chunk => {
            try {
              const resolvedContent = await Promise.race([
                chunk.loader(),
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('Chunk timeout')), timeout)
                ),
              ])

              const { html: chunkHtml } = renderToString(resolvedContent, {
                hydrate: true,
              })

              return {
                id: chunk.id,
                html: chunkHtml,
                error: null,
              }
            } catch (error) {
              if (onError === 'throw') {
                throw error
              }
              return {
                id: chunk.id,
                html: onError === 'fallback' ? errorFallback : '',
                error,
              }
            }
          })

          // Stream results as they complete
          for (const promise of chunkPromises) {
            const result = await promise
            const script = getChunkScript(result.id, result.html)
            controller.enqueue(encoder.encode(script))
          }
        }

        // Add bootstrap script if provided
        if (bootstrapScript) {
          controller.enqueue(
            encoder.encode(`<script type="module" src="${bootstrapScript}"></script>`)
          )
        }

        // Add state script
        if (state) {
          controller.enqueue(
            encoder.encode(`<script>window.__FLEXISM_STATE__=${JSON.stringify(state)}</script>`)
          )
        }

        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

/**
 * Render to stream and return a Response
 */
export function streamingResponse(
  content: FNodeChild,
  options: StreamingOptions & { status?: number; headers?: Record<string, string> } = {}
): Response {
  const { status = 200, headers = {}, ...streamOptions } = options

  const stream = renderToStream(content, streamOptions)

  return new Response(stream, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      ...headers,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Streaming Scripts
// ─────────────────────────────────────────────────────────────────────────────

function getStreamingRuntime(): string {
  return `<script>
window.__flexism_replaceChunk = function(id, html) {
  var placeholder = document.getElementById('flexism-chunk-' + id);
  if (placeholder) {
    var template = document.createElement('template');
    template.innerHTML = html;
    placeholder.replaceWith(template.content);
  }
};
</script>`
}

function getChunkScript(id: string, html: string): string {
  const escapedHtml = html
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/<\/script>/gi, '<\\/script>')

  return `<script>__flexism_replaceChunk("${id}", "${escapedHtml}")</script>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Suspense-like Component Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a placeholder for streaming content
 *
 * @example
 * ```tsx
 * // In your component:
 * const UserList = streamingPlaceholder({
 *   id: 'user-list',
 *   fallback: <div>Loading users...</div>,
 *   loader: async () => {
 *     const users = await fetchUsers()
 *     return <UserListComponent users={users} />
 *   },
 * })
 * ```
 */
export function streamingPlaceholder(chunk: StreamingChunk): FNodeChild {
  // Return a placeholder div with the chunk ID
  // The streaming runtime will replace this with the actual content
  const fallbackHtml = chunk.fallback
    ? renderToString(chunk.fallback, { hydrate: false }).html
    : '<div class="loading">Loading...</div>'

  return {
    type: 'div',
    props: {
      id: `flexism-chunk-${chunk.id}`,
      'data-streaming': 'true',
    },
    children: [fallbackHtml],
  } as unknown as FNodeChild
}

// ─────────────────────────────────────────────────────────────────────────────
// Out-of-Order Streaming
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render multiple chunks in parallel, streaming as they complete
 *
 * @example
 * ```ts
 * const stream = renderChunksParallel([
 *   { id: 'header', loader: async () => <Header /> },
 *   { id: 'content', loader: async () => <Content /> },
 *   { id: 'sidebar', loader: async () => <Sidebar /> },
 * ])
 * ```
 */
export function renderChunksParallel(
  chunks: StreamingChunk[],
  options: StreamingOptions = {}
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const { timeout = 10000, onError = 'fallback', errorFallback = '' } = options

  return new ReadableStream({
    async start(controller) {
      // Send runtime
      controller.enqueue(encoder.encode(getStreamingRuntime()))

      // Create promises for all chunks
      const promises = chunks.map(async chunk => {
        try {
          const content = await Promise.race([
            chunk.loader(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout)
            ),
          ])

          const { html } = renderToString(content, { hydrate: true })
          return { id: chunk.id, html, error: null }
        } catch (error) {
          if (onError === 'throw') throw error
          return {
            id: chunk.id,
            html: onError === 'fallback' ? errorFallback : '',
            error,
          }
        }
      })

      // Stream results as they complete (out-of-order)
      const pending = new Map<Promise<{ id: string; html: string; error: unknown }>, boolean>()
      for (const p of promises) {
        pending.set(p, true)
      }

      while (pending.size > 0) {
        // Race all pending promises, but track which one completed
        const winner = await Promise.race(
          [...pending.keys()].map(p => p.then(result => ({ result, originalPromise: p })))
        )

        pending.delete(winner.originalPromise)

        const script = getChunkScript(winner.result.id, winner.result.html)
        controller.enqueue(encoder.encode(script))
      }

      controller.close()
    },
  })
}
