/**
 * Stream - Unified streaming data source for server and client
 *
 * On Server:
 *   - Declares a streaming data source with callback
 *   - Compiler transforms this into SSE endpoints
 *   - toJSON() serializes for transmission to client
 *
 * On Client:
 *   - Restored via Stream.fromJSON()
 *   - Extends Useable for use() integration
 *   - Subscribes to SSE endpoint for real-time updates
 *
 * @example Server-side declaration
 * ```tsx
 * export default async function Page({ params }) {
 *   const Messages = new Stream(() => db.messages.subscribe(params.roomId))
 *
 *   return () => {
 *     const [messages] = use(Messages)
 *     return <ul>{messages.map(m => <li>{m.text}</li>)}</ul>
 *   }
 * }
 * ```
 *
 * @example Sendable stream (request-response)
 * ```tsx
 * const Chat = new Stream(
 *   async function* (p) { yield* generateResponse(p.message) },
 *   { sendable: true, initial: "" }
 * )
 *
 * return () => {
 *   const [response, send] = use(Chat)
 *   send({ message: "Hello" })
 * }
 * ```
 */

import { Useable } from 'flexium/core'
import { SSEClient, type SSEClientOptions } from './SSEClient'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StreamCallback<T, P = void> =
  | (() => AsyncIterable<T>)
  | (() => Promise<AsyncIterable<T>>)
  | ((params: P) => AsyncIterable<T>)
  | ((params: P) => Promise<AsyncIterable<T>>)

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
   * If true, stream is sendable - requires params to trigger
   * Client gets [value, send] tuple from use()
   */
  sendable?: boolean

  /**
   * SSE connection options (client-side only)
   */
  sse?: Omit<SSEClientOptions, 'once' | 'onMessage'>
}

export interface SerializedStream<T = unknown> {
  __type: 'flexism:stream'
  id: string
  url: string
  options: StreamOptions<T>
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Stream Registry (Server-side)
// ─────────────────────────────────────────────────────────────────────────────

export type RuntimeStreamHandler<P = unknown> = (
  params: P
) => AsyncIterable<unknown> | AsyncGenerator<unknown, void, unknown>

interface RuntimeStream {
  id: string
  callback: RuntimeStreamHandler<any>
  options: StreamOptions<any>
}

const runtimeStreamRegistry = new Map<string, RuntimeStream>()

export function registerRuntimeStream<T, P>(
  id: string,
  callback: StreamCallback<T, P>,
  options: StreamOptions<T>
): void {
  runtimeStreamRegistry.set(id, { id, callback: callback as RuntimeStreamHandler, options })
}

export function getRuntimeStream(id: string): RuntimeStream | undefined {
  return runtimeStreamRegistry.get(id)
}

export function hasRuntimeStream(id: string): boolean {
  return runtimeStreamRegistry.has(id)
}

export function clearRuntimeStreams(): void {
  runtimeStreamRegistry.clear()
}

// ─────────────────────────────────────────────────────────────────────────────
// Stream Class
// ─────────────────────────────────────────────────────────────────────────────

export class Stream<T, P = void> extends Useable<T | null, P> {
  readonly __type = 'flexism:stream' as const

  /** Unique identifier for this stream */
  readonly id: string

  /** SSE endpoint URL (set on client after fromJSON) */
  readonly url: string | null

  /** Stream options */
  readonly options: StreamOptions<T>

  /**
   * The callback that produces the async iterable
   * Only present on server-side instances
   */
  readonly callback: StreamCallback<T, P> | null

  /**
   * Captured parameters from closure (server-side)
   */
  private capturedParams: Record<string, unknown> = {}

  // Client-side SSE state
  private client: SSEClient<T> | null = null
  private currentCallback: ((value: T) => void) | null = null

  /**
   * Create a new Stream (server-side)
   */
  constructor(
    callback: StreamCallback<T, P>,
    options?: StreamOptions<T>,
    id?: string
  )

  /**
   * Create a Stream from serialized data (client-side, internal)
   */
  constructor(
    callback: null,
    options: StreamOptions<T>,
    id: string,
    url: string
  )

  constructor(
    callback: StreamCallback<T, P> | null,
    options: StreamOptions<T> = {},
    id?: string,
    url?: string
  ) {
    super()
    this.callback = callback
    this.options = options
    this.id = id ?? `stream_${Math.random().toString(36).slice(2)}`
    this.url = url ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Server-side methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Capture parameters for URL generation (server-side)
   */
  capture(params: Record<string, unknown>): this {
    this.capturedParams = { ...this.capturedParams, ...params }
    return this
  }

  /**
   * Convert to serializable reference (server-side)
   * Returns a new Stream instance that can be serialized
   */
  toRef(baseUrl = '/_flexism/sse'): Stream<T, P> {
    if (this.callback && typeof window === 'undefined') {
      registerRuntimeStream(this.id, this.callback, this.options)
    }

    // Build URL with captured params
    const queryParams = new URLSearchParams()
    for (const [key, value] of Object.entries(this.capturedParams)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value))
      }
    }

    const query = queryParams.toString()
    const url = query ? `${baseUrl}/${this.id}?${query}` : `${baseUrl}/${this.id}`

    // Return a new Stream with URL for client
    return new Stream<T, P>(null, this.options, this.id, url)
  }

  /**
   * Serialize for transmission to client
   */
  toJSON(): SerializedStream<T> {
    const url = this.url ?? `/_flexism/sse/${this.id}`
    return {
      __type: 'flexism:stream',
      id: this.id,
      url,
      options: this.options,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Useable interface (client-side)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get initial value (null or provided initial)
   */
  getInitial(): T | null {
    return this.options.initial ?? null
  }

  /**
   * Subscribe to SSE updates
   * For sendable streams, just registers callback.
   * For regular streams, connects immediately.
   */
  subscribe(
    _params: P | undefined,
    callback: (value: T) => void
  ): () => void {
    console.log('[flexism] Stream.subscribe called', { url: this.url, sendable: this.options.sendable })
    if (!this.url) {
      console.warn('[flexism] Stream.subscribe called on server-side Stream')
      return () => {}
    }

    if (this.options.sendable) {
      // Sendable: just store callback, connection starts on send()
      this.currentCallback = callback
      console.log('[flexism] Stream.subscribe - stored callback for sendable stream')

      return () => {
        this.currentCallback = null
        this.client?.close()
        this.client = null
      }
    }

    // Regular: connect immediately
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
   * Send triggers a new SSE connection with params (sendable streams only)
   */
  send(params: P): void {
    console.log('[flexism] Stream.send called', { params, sendable: this.options.sendable, url: this.url, hasCallback: !!this.currentCallback })

    if (!this.options.sendable) {
      console.warn('[flexism] send() called on non-sendable Stream')
      return
    }

    if (!this.url) {
      console.warn('[flexism] send() called on server-side Stream')
      return
    }

    // Close existing connection
    this.client?.close()

    console.log('[flexism] Stream.send - creating SSEClient for url:', this.url)

    // Create new SSE connection (use base URL, params go in POST body)
    this.client = new SSEClient<T>(this.url, {
      ...this.options.sse,
      once: this.options.once,
      onMessage: (data) => {
        console.log('[flexism] Stream.send - received data:', data, 'hasCallback:', !!this.currentCallback)
        this.currentCallback?.(data)
      },
      onError: (error) => {
        console.error('[flexism] Stream.send - SSE error:', error)
      },
      onOpen: () => {
        console.log('[flexism] Stream.send - SSE connection opened')
      },
    })

    // Connect with params in POST body for sendable streams
    console.log('[flexism] Stream.send - connecting with body:', params)
    this.client.connect({ body: params })
  }

  /**
   * Get additional actions for use() tuple
   * For type-safe sendable streams, use SendableStream instead
   */
  getActions(): [] | undefined {
    return undefined
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Static methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create Stream from serialized data (client-side)
   */
  static fromJSON<T, P = void>(data: unknown): Stream<T, P> {
    // Validate data - accept both stream and legacy streamref formats
    if (!Stream.isSerializedStream(data) && !Stream.isLegacyStreamRef(data)) {
      throw new Error('[flexism] Invalid Stream data: missing or invalid __type')
    }

    const typed = data as SerializedStream<T>

    // Validate id
    if (typeof typed.id !== 'string' || !/^[a-zA-Z0-9_]+$/.test(typed.id)) {
      throw new Error('[flexism] Invalid Stream id')
    }

    // Validate url
    if (typeof typed.url !== 'string' || !typed.url.startsWith('/_flexism/sse/')) {
      throw new Error('[flexism] Invalid Stream url')
    }

    // Handle legacy sendablestreamref
    const options = { ...((typed.options ?? {}) as StreamOptions<T>) }
    if ((data as any).__type === 'flexism:sendablestreamref') {
      options.sendable = true
    }

    return new Stream<T, P>(null, options, typed.id, typed.url)
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

  /**
   * Check if value is a serialized Stream
   */
  static isSerializedStream(value: unknown): value is SerializedStream {
    return (
      value !== null &&
      typeof value === 'object' &&
      '__type' in value &&
      (value as any).__type === 'flexism:stream'
    )
  }

  /**
   * Check for legacy StreamRef format (backwards compatibility)
   */
  static isLegacyStreamRef(value: unknown): boolean {
    return (
      value !== null &&
      typeof value === 'object' &&
      '__type' in value &&
      ((value as any).__type === 'flexism:streamref' ||
       (value as any).__type === 'flexism:sendablestreamref')
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SendableStream - Type-safe wrapper for sendable streams
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SendableStream - A Stream where client can send params to trigger server response
 *
 * This is a type-safe wrapper that extends Stream with proper type inference.
 * When used with use(), it returns [value, send] with correctly typed send function.
 *
 * @example
 * ```tsx
 * const Chat = new SendableStream<string, { message: string }>(
 *   async function* (p) {
 *     yield* generateResponse(p.message)
 *   },
 *   { initial: '' }
 * )
 *
 * return () => {
 *   const [response, send] = use(Chat)  // send is typed as (p: { message: string }) => void
 *   send({ message: 'Hello' })
 * }
 * ```
 */
export class SendableStream<T, P> extends Useable<T | null, P, [(p: P) => void]> {
  private readonly stream: Stream<T, P>

  constructor(
    callback: StreamCallback<T, P>,
    options?: Omit<StreamOptions<T>, 'sendable'>
  ) {
    super()
    this.stream = new Stream<T, P>(callback, { ...options, sendable: true })
  }

  get __type() {
    return this.stream.__type
  }

  get id() {
    return this.stream.id
  }

  get url() {
    return this.stream.url
  }

  get options() {
    return this.stream.options
  }

  capture(params: Record<string, unknown>): this {
    this.stream.capture(params)
    return this
  }

  toRef(baseUrl = '/_flexism/sse'): SendableStream<T, P> {
    const ref = this.stream.toRef(baseUrl)
    const sendable = new SendableStream<T, P>(null as any, ref.options)
    ;(sendable as any).stream = ref
    return sendable
  }

  toJSON(): SerializedStream<T> {
    return this.stream.toJSON()
  }

  getInitial(): T | null {
    return this.stream.getInitial()
  }

  subscribe(params: P | undefined, callback: (value: T | null) => void): () => void {
    return this.stream.subscribe(params, callback)
  }

  send(params: P): void {
    this.stream.send(params)
  }

  getActions(): [(p: P) => void] {
    return [this.send.bind(this)]
  }

  static fromJSON<T, P>(data: unknown): SendableStream<T, P> {
    const stream = Stream.fromJSON<T, P>(data)
    const sendable = new SendableStream<T, P>(null as any, stream.options)
    ;(sendable as any).stream = stream
    return sendable
  }
}

