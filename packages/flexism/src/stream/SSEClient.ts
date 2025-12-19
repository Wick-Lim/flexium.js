export interface SSEClientOptions {
  /**
   * If true, close connection after stream ends
   */
  once?: boolean

  /**
   * Retry connection on error
   */
  retry?: boolean

  /**
   * Retry delay in ms (default: 3000)
   */
  retryDelay?: number

  /**
   * Maximum retry attempts (default: 5)
   */
  maxRetries?: number

  /**
   * Custom headers for the request
   */
  headers?: Record<string, string>

  /**
   * Callback when message received
   */
  onMessage?: (data: any) => void

  /**
   * Callback when connection opens
   */
  onOpen?: () => void

  /**
   * Callback on error
   */
  onError?: (error: Error) => void

  /**
   * Callback when connection closes
   */
  onClose?: () => void
}

/**
 * SSE Client - Manages Server-Sent Events connection
 *
 * Supports both GET (EventSource) and POST (fetch with streaming) requests
 */
export class SSEClient<T = unknown> {
  private url: string
  private options: SSEClientOptions
  private eventSource: EventSource | null = null
  private abortController: AbortController | null = null
  private retryCount = 0
  private closed = false

  constructor(url: string, options: SSEClientOptions = {}) {
    this.url = url
    this.options = {
      retry: true,
      retryDelay: 3000,
      maxRetries: 5,
      ...options,
    }
  }

  /**
   * Connect to SSE endpoint
   * Uses EventSource for GET, fetch streaming for POST
   */
  connect(params?: unknown): void {
    if (this.closed) return

    // If params with body, use POST with fetch streaming
    if (params && typeof params === 'object' && 'body' in params) {
      this.connectWithFetch(params as { body: unknown })
    } else {
      this.connectWithEventSource()
    }
  }

  /**
   * Connect using EventSource (GET requests)
   */
  private connectWithEventSource(): void {
    if (typeof EventSource === 'undefined') {
      console.warn('EventSource not supported in this environment')
      return
    }

    this.eventSource = new EventSource(this.url)

    this.eventSource.onopen = () => {
      this.retryCount = 0
      this.options.onOpen?.()
    }

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T
        this.options.onMessage?.(data)

        if (this.options.once) {
          this.close()
        }
      } catch {
        // If not JSON, pass as string
        this.options.onMessage?.(event.data as T)
      }
    }

    this.eventSource.onerror = () => {
      if (this.closed) return

      this.options.onError?.(new Error('EventSource connection error'))

      if (this.options.retry && this.retryCount < (this.options.maxRetries ?? 5)) {
        this.retryCount++
        setTimeout(() => {
          if (!this.closed) {
            this.eventSource?.close()
            this.connectWithEventSource()
          }
        }, this.options.retryDelay)
      } else {
        this.close()
      }
    }
  }

  /**
   * Connect using fetch with streaming (POST requests)
   */
  private async connectWithFetch(params: { body: unknown }): Promise<void> {
    this.abortController = new AbortController()

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...this.options.headers,
        },
        body: JSON.stringify(params.body),
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      this.options.onOpen?.()
      this.retryCount = 0

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          if (buffer.trim()) {
            this.processSSELine(buffer)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          this.processSSELine(line)
        }
      }

      this.options.onClose?.()
    } catch (error) {
      if (this.closed) return
      if ((error as Error).name === 'AbortError') return

      this.options.onError?.(error as Error)

      if (this.options.retry && this.retryCount < (this.options.maxRetries ?? 5)) {
        this.retryCount++
        setTimeout(() => {
          if (!this.closed) {
            this.connectWithFetch(params)
          }
        }, this.options.retryDelay)
      }
    }
  }

  /**
   * Process a single SSE line
   */
  private processSSELine(line: string): void {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith(':')) return

    if (trimmed.startsWith('data:')) {
      const data = trimmed.slice(5).trim()
      try {
        const parsed = JSON.parse(data) as T
        this.options.onMessage?.(parsed)
      } catch {
        this.options.onMessage?.(data as T)
      }
    }
  }

  /**
   * Close the connection
   */
  close(): void {
    this.closed = true
    this.eventSource?.close()
    this.eventSource = null
    this.abortController?.abort()
    this.abortController = null
    this.options.onClose?.()
  }

  /**
   * Check if connection is active
   */
  get isConnected(): boolean {
    if (this.closed) return false
    if (this.abortController !== null) return true
    if (typeof EventSource !== 'undefined' && this.eventSource) {
      return this.eventSource.readyState === EventSource.OPEN
    }
    return false
  }
}
