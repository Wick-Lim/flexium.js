import { Useable } from 'flexium/core'
import { SSEClient, SSEClientOptions } from './SSEClient'

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

  /**
   * SSE connection options
   */
  sse?: SSEClientOptions
}

export type StreamSource<T, P> =
  | string // URL endpoint
  | ((params: P) => string) // Dynamic URL

/**
 * Stream - Reactive data source for server-sent events
 *
 * @example
 * ```tsx
 * // Server subscription (stays open)
 * const Posts = new Stream<Post[]>('/api/posts')
 * const [posts] = use(Posts)
 *
 * // One-time streaming (like LLM response)
 * const Chat = new Stream<string>('/api/chat', { once: true })
 * const [response] = use(Chat, { body: { prompt: '...' } })
 *
 * // Dynamic URL with params
 * const UserPosts = new Stream<Post[]>((p) => `/api/users/${p.userId}/posts`)
 * const [posts] = use(UserPosts, { userId: '123' })
 * ```
 */
export class Stream<T, P = void> extends Useable<T | null, P> {
  private source: StreamSource<T, P>
  private options: StreamOptions<T>

  constructor(source: StreamSource<T, P>, options: StreamOptions<T> = {}) {
    super()
    this.source = source
    this.options = options
  }

  /**
   * Get initial value (null or provided initial)
   */
  getInitial(_params?: P): T | null {
    return this.options.initial ?? null
  }

  /**
   * Subscribe to SSE updates
   */
  subscribe(
    params: P | undefined,
    callback: (value: T) => void
  ): () => void {
    const url = typeof this.source === 'function'
      ? this.source(params as P)
      : this.source

    const client = new SSEClient<T>(url, {
      ...this.options.sse,
      once: this.options.once,
      onMessage: (data) => {
        callback(data)
      },
    })

    client.connect(params)

    return () => {
      client.close()
    }
  }
}
