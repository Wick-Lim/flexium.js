/**
 * StreamRef - Client-side Stream Reference
 *
 * Extends Useable so it works with use() from flexium/core
 * Created by the compiler from server-side Stream declarations
 */

import { Useable } from 'flexium/core'
import { SSEClient, SSEClientOptions } from './SSEClient'

export interface StreamRefOptions<T> {
  /**
   * Initial value before first data arrives
   */
  initial?: T

  /**
   * If true, stream ends after first complete response
   */
  once?: boolean

  /**
   * SSE connection options
   */
  sse?: Omit<SSEClientOptions, 'once' | 'onMessage'>
}

export interface SerializedStreamRef<T = unknown> {
  __type: 'flexism:streamref'
  id: string
  url: string
  options: StreamRefOptions<T>
}

/**
 * StreamRef - Client-side reactive SSE subscription
 *
 * Created from serialized stream data passed from server to client.
 * Works with flexium's use() hook for reactive updates.
 *
 * @example
 * ```tsx
 * // In client component (after hydration)
 * const streamRef = new StreamRef('/sse/messages', { initial: [] })
 * const [messages] = use(streamRef)
 * ```
 */
export class StreamRef<T> extends Useable<T | null> {
  readonly __type = 'flexism:streamref' as const
  readonly id: string
  readonly url: string
  readonly options: StreamRefOptions<T>

  constructor(id: string, url: string, options: StreamRefOptions<T> = {}) {
    super()
    this.id = id
    this.url = url
    this.options = options
  }

  /**
   * Get initial value (null or provided initial)
   */
  getInitial(): T | null {
    return this.options.initial ?? null
  }

  /**
   * Subscribe to SSE updates
   */
  subscribe(
    _params: void | undefined,
    callback: (value: T) => void
  ): () => void {
    const client = new SSEClient<T>(this.url, {
      ...this.options.sse,
      once: this.options.once,
      onMessage: (data) => {
        callback(data)
      },
    })

    client.connect()

    return () => {
      client.close()
    }
  }

  /**
   * Serialize for transmission from server to client
   */
  toJSON(): SerializedStreamRef<T> {
    return {
      __type: 'flexism:streamref',
      id: this.id,
      url: this.url,
      options: this.options,
    }
  }

  /**
   * Create StreamRef from serialized data with validation
   */
  static fromJSON<T>(data: unknown): StreamRef<T> {
    // Type guard validation
    if (!StreamRef.isSerializedStreamRef(data)) {
      throw new Error('[flexism] Invalid StreamRef data: missing or invalid __type')
    }

    // Validate id (alphanumeric and underscore only)
    if (typeof data.id !== 'string' || !/^[a-zA-Z0-9_]+$/.test(data.id)) {
      throw new Error('[flexism] Invalid StreamRef id')
    }

    // Validate url (must be /_flexism/sse/ path)
    if (typeof data.url !== 'string' || !data.url.startsWith('/_flexism/sse/')) {
      throw new Error('[flexism] Invalid StreamRef url')
    }

    // Validate options
    const options = data.options
    if (options !== null && typeof options !== 'object') {
      throw new Error('[flexism] Invalid StreamRef options')
    }

    return new StreamRef<T>(data.id, data.url, (options ?? {}) as StreamRefOptions<T>)
  }

  /**
   * Check if value is a serialized StreamRef
   */
  static isSerializedStreamRef(value: unknown): value is SerializedStreamRef {
    return (
      value !== null &&
      typeof value === 'object' &&
      '__type' in value &&
      (value as any).__type === 'flexism:streamref'
    )
  }
}
