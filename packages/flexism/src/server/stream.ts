import type { FNodeChild, RenderOptions, FlexismState } from '../types'
import {
  setIsServer,
  resetSignalCounter,
  getCollectedSignals,
  createStateScript,
  serializeValue,
} from '../runtime'
import { renderToString } from './render'

const FLEXISM_VERSION = '0.1.0'

export interface StreamOptions extends RenderOptions {
  /** Called when shell (initial HTML) is ready */
  onShellReady?: () => void
  /** Called when all content is ready */
  onAllReady?: () => void
  /** Called on error */
  onError?: (error: Error) => void
  /** Abort signal for cancellation */
  signal?: AbortSignal
}

export interface StreamResult {
  /** Readable stream of HTML chunks */
  stream: ReadableStream<Uint8Array>
  /** Promise that resolves when streaming is complete */
  done: Promise<void>
  /** Abort the stream */
  abort: () => void
}

export interface PipeableStream {
  /** Pipe to Node.js writable stream */
  pipe: <T extends NodeJS.WritableStream>(destination: T) => T
  /** Abort the stream */
  abort: () => void
}

/**
 * Render to a ReadableStream (Web Streams API)
 *
 * Ideal for edge runtimes (Cloudflare Workers, Vercel Edge, Deno)
 *
 * @example
 * ```ts
 * // Cloudflare Workers / Vercel Edge
 * export default {
 *   async fetch(request) {
 *     const { stream } = renderToStream(<App />)
 *     return new Response(stream, {
 *       headers: { 'Content-Type': 'text/html' }
 *     })
 *   }
 * }
 * ```
 */
export function renderToStream(
  app: FNodeChild | (() => FNodeChild),
  options: StreamOptions = {}
): StreamResult {
  const { onShellReady, onAllReady, onError, signal, ...renderOptions } = options

  let aborted = false
  let resolvePromise: () => void
  let rejectPromise: (error: Error) => void

  const done = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const abort = () => {
    aborted = true
  }

  // Handle abort signal
  signal?.addEventListener('abort', abort)

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        if (aborted) {
          controller.close()
          resolvePromise()
          return
        }

        // For now, do a simple chunked render
        // Future: implement true streaming with Suspense boundaries
        const result = renderToString(app, renderOptions)

        onShellReady?.()

        // Send HTML in chunks for better streaming
        const html = result.html
        const chunkSize = 16 * 1024 // 16KB chunks

        for (let i = 0; i < html.length; i += chunkSize) {
          if (aborted) break
          const chunk = html.slice(i, i + chunkSize)
          controller.enqueue(encoder.encode(chunk))
        }

        // Send state script at the end
        if (!aborted) {
          controller.enqueue(encoder.encode(result.stateScript))
        }

        onAllReady?.()
        controller.close()
        resolvePromise()
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        controller.error(err)
        rejectPromise(err)
      }
    },
  })

  return { stream, done, abort }
}

/**
 * Render to a pipeable Node.js stream
 *
 * @example
 * ```ts
 * // Express.js
 * app.get('/', (req, res) => {
 *   res.setHeader('Content-Type', 'text/html')
 *   const { pipe } = renderToPipeableStream(<App />)
 *   pipe(res)
 * })
 *
 * // Fastify
 * fastify.get('/', (request, reply) => {
 *   const { pipe } = renderToPipeableStream(<App />)
 *   reply.type('text/html')
 *   pipe(reply.raw)
 * })
 * ```
 */
export function renderToPipeableStream(
  app: FNodeChild | (() => FNodeChild),
  options: StreamOptions = {}
): PipeableStream {
  const { stream, abort } = renderToStream(app, options)

  const pipe = <T extends NodeJS.WritableStream>(destination: T): T => {
    const reader = stream.getReader()

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            destination.end()
            break
          }
          destination.write(Buffer.from(value))
        }
      } catch (error) {
        // Use type assertion for destroy method (exists on most writable streams)
        const err = error instanceof Error ? error : new Error(String(error))
        if ('destroy' in destination && typeof destination.destroy === 'function') {
          (destination as any).destroy(err)
        } else {
          destination.end()
        }
      }
    }

    pump()
    return destination
  }

  return { pipe, abort }
}

/**
 * Render full HTML document as a stream
 *
 * @example
 * ```ts
 * const { stream } = renderToHtmlStream(<App />, {
 *   title: 'My App',
 *   scripts: ['/client.js']
 * })
 * return new Response(stream, { headers: { 'Content-Type': 'text/html' } })
 * ```
 */
export function renderToHtmlStream(
  app: FNodeChild | (() => FNodeChild),
  options: StreamOptions & {
    title?: string
    lang?: string
    head?: string
    bodyAttrs?: string
    scripts?: string[]
    styles?: string[]
  } = {}
): StreamResult {
  const {
    title = '',
    lang = 'en',
    head = '',
    bodyAttrs = '',
    scripts = [],
    styles = [],
    onShellReady,
    onAllReady,
    onError,
    signal,
    ...renderOptions
  } = options

  let aborted = false
  let resolvePromise: () => void
  let rejectPromise: (error: Error) => void

  const done = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const abort = () => {
    aborted = true
  }

  signal?.addEventListener('abort', abort)

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        // Send head immediately (shell)
        const styleLinks = styles
          .map(href => `<link rel="stylesheet" href="${escapeAttr(href)}">`)
          .join('\n    ')

        const headHtml = `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${title ? `<title>${escapeHtml(title)}</title>` : ''}
    ${styleLinks}
    ${head}
  </head>
  <body${bodyAttrs ? ' ' + bodyAttrs : ''}>
    <div id="app">`

        controller.enqueue(encoder.encode(headHtml))
        onShellReady?.()

        if (aborted) {
          controller.close()
          resolvePromise()
          return
        }

        // Render content
        const result = renderToString(app, renderOptions)

        // Send content in chunks
        const chunkSize = 16 * 1024
        for (let i = 0; i < result.html.length; i += chunkSize) {
          if (aborted) break
          controller.enqueue(encoder.encode(result.html.slice(i, i + chunkSize)))
        }

        if (aborted) {
          controller.close()
          resolvePromise()
          return
        }

        // Send tail
        const scriptTags = scripts
          .map(src => `<script type="module" src="${escapeAttr(src)}"></script>`)
          .join('\n    ')

        const tailHtml = `</div>
    ${result.stateScript}
    ${scriptTags}
  </body>
</html>`

        controller.enqueue(encoder.encode(tailHtml))

        onAllReady?.()
        controller.close()
        resolvePromise()
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        controller.error(err)
        rejectPromise(err)
      }
    },
  })

  return { stream, done, abort }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
