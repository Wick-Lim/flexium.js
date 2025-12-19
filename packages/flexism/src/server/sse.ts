/**
 * SSE Server Utilities
 *
 * Easy creation of Server-Sent Events endpoints
 */

export interface SSEContext {
  /**
   * Send data to the client
   */
  send: (data: unknown) => void

  /**
   * Send named event
   */
  event: (name: string, data: unknown) => void

  /**
   * Close the connection
   */
  close: () => void

  /**
   * Check if connection is still open
   */
  readonly isOpen: boolean
}

export type SSEHandler =
  | ((ctx: SSEContext) => void | Promise<void>)
  | AsyncIterable<unknown>
  | (() => AsyncIterable<unknown>)

export interface SSEResponse {
  headers: Record<string, string>
  body: ReadableStream<Uint8Array>
}

/**
 * Create SSE response from a handler
 *
 * @example
 * ```ts
 * // With callback
 * app.get('/api/time', (req, res) => {
 *   const { headers, body } = sse((ctx) => {
 *     setInterval(() => ctx.send(new Date()), 1000)
 *   })
 *   // Set headers and stream body
 * })
 *
 * // With async generator
 * app.post('/api/chat', async (req, res) => {
 *   const { headers, body } = sse(async function* () {
 *     for await (const token of llm.stream(req.body.prompt)) {
 *       yield token
 *     }
 *   })
 * })
 *
 * // With async iterable
 * app.get('/api/posts', (req, res) => {
 *   const { headers, body } = sse(db.posts.subscribe())
 * })
 * ```
 */
export function sse(handler: SSEHandler): SSEResponse {
  const encoder = new TextEncoder()
  let isOpen = true
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null

  const ctx: SSEContext = {
    send: (data) => {
      if (!isOpen || !controller) return
      const message = `data: ${JSON.stringify(data)}\n\n`
      controller.enqueue(encoder.encode(message))
    },
    event: (name, data) => {
      if (!isOpen || !controller) return
      const message = `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`
      controller.enqueue(encoder.encode(message))
    },
    close: () => {
      if (!isOpen) return
      isOpen = false
      controller?.close()
    },
    get isOpen() {
      return isOpen
    },
  }

  const body = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      controller = ctrl

      try {
        // Check if handler is async iterable
        if (isAsyncIterable(handler)) {
          for await (const data of handler) {
            if (!isOpen) break
            ctx.send(data)
          }
          ctx.close()
        }
        // Check if handler is a function that returns async iterable
        else if (typeof handler === 'function') {
          const result = handler(ctx)

          // If it returned an async iterable
          if (result && isAsyncIterable(result)) {
            for await (const data of result) {
              if (!isOpen) break
              ctx.send(data)
            }
            ctx.close()
          }
          // Otherwise it's a callback that manages its own lifecycle
          else if (result instanceof Promise) {
            await result
          }
        }
      } catch (error) {
        console.error('SSE handler error:', error)
        ctx.close()
      }
    },
    cancel() {
      isOpen = false
    },
  })

  return {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
    body,
  }
}

/**
 * Create SSE response from an async iterable
 */
sse.from = function <T>(source: AsyncIterable<T>): SSEResponse {
  return sse(source)
}

/**
 * Create SSE response from a generator function
 */
sse.generator = function <T>(
  fn: () => AsyncGenerator<T, void, unknown>
): SSEResponse {
  return sse(fn())
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Symbol.asyncIterator in value
  )
}

/**
 * Express/Connect middleware helper
 */
export function sseMiddleware(handler: SSEHandler) {
  return (
    _req: unknown,
    res: { setHeader: (k: string, v: string) => void; write: (d: unknown) => void; end: () => void }
  ) => {
    const { headers, body } = sse(handler)

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    // Pipe stream to response
    const reader = body.getReader()

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            res.end()
            break
          }
          res.write(value)
        }
      } catch {
        res.end()
      }
    }

    pump()
  }
}
