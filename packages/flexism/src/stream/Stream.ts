/**
 * Stream - Server-side reactive data source declaration
 *
 * Declares a streaming data source in server code.
 * The compiler transforms this into SSE endpoints and StreamRef for client.
 *
 * @example
 * ```tsx
 * export default async function Page({ params }) {
 *   // Server: declare stream with callback
 *   const Messages = new Stream(() => db.messages.subscribe(params.roomId))
 *
 *   // Client: use stream reactively
 *   return () => {
 *     const [messages] = use(Messages)
 *     return <ul>{messages.map(m => <li>{m.text}</li>)}</ul>
 *   }
 * }
 * ```
 */

import { StreamRef, type StreamRefOptions } from './StreamRef'

export type StreamCallback<T> =
  | (() => AsyncIterable<T>)
  | (() => Promise<AsyncIterable<T>>)

export interface StreamOptions<T> {
  /**
   * Initial value before first data arrives
   */
  initial?: T

  /**
   * If true, stream ends after first complete response (like LLM streaming)
   * If false (default), stream stays open for continuous updates
   */
  once?: boolean
}

/**
 * Stream - Server-side stream declaration
 *
 * At build time, the compiler:
 * 1. Extracts the callback code
 * 2. Generates an SSE endpoint
 * 3. Replaces Stream with StreamRef in client code
 *
 * At runtime (server):
 * 1. Stream.toRef() creates a StreamRef with the generated endpoint URL
 * 2. StreamRef is serialized and sent to client
 *
 * At runtime (client):
 * 1. StreamRef is deserialized
 * 2. use(streamRef) subscribes to SSE endpoint
 */
export class Stream<T> {
  readonly __type = 'flexism:stream' as const

  /**
   * Unique identifier for this stream
   * Set by compiler based on file path and position
   */
  readonly id: string

  /**
   * The callback that produces the async iterable
   * Executed on the server when SSE endpoint is called
   */
  readonly callback: StreamCallback<T>

  /**
   * Stream options
   */
  readonly options: StreamOptions<T>

  /**
   * Captured parameters from closure
   * Populated at runtime by server code
   */
  private capturedParams: Record<string, unknown> = {}

  constructor(
    callback: StreamCallback<T>,
    options: StreamOptions<T> = {},
    id?: string
  ) {
    this.callback = callback
    this.options = options
    // ID is set by compiler, fallback to random for dynamic usage
    this.id = id ?? `stream_${Math.random().toString(36).slice(2)}`
  }

  /**
   * Capture parameters for URL generation
   * Called internally when stream is created in server context
   */
  capture(params: Record<string, unknown>): this {
    this.capturedParams = { ...this.capturedParams, ...params }
    return this
  }

  /**
   * Convert to client-side StreamRef
   * Called by the server when preparing data for client
   */
  toRef(baseUrl = '/_flexism/sse'): StreamRef<T> {
    // Build URL with captured params as query string
    const queryParams = new URLSearchParams()
    for (const [key, value] of Object.entries(this.capturedParams)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value))
      }
    }

    const query = queryParams.toString()
    const url = query ? `${baseUrl}/${this.id}?${query}` : `${baseUrl}/${this.id}`

    return new StreamRef<T>(this.id, url, {
      initial: this.options.initial,
      once: this.options.once,
    })
  }

  /**
   * Execute the callback to get async iterable
   * Called by SSE endpoint handler
   */
  async execute(): Promise<AsyncIterable<T>> {
    const result = this.callback()
    if (result instanceof Promise) {
      return await result
    }
    return result
  }

  /**
   * Check if value is a Stream instance
   */
  static isStream(value: unknown): value is Stream<unknown> {
    return (
      value !== null &&
      typeof value === 'object' &&
      '__type' in value &&
      (value as any).__type === 'flexism:stream'
    )
  }
}

// Re-export types and classes
export { StreamRef, type StreamRefOptions, type SerializedStreamRef } from './StreamRef'
export { SSEClient, type SSEClientOptions } from './SSEClient'
