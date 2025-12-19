import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isUseable } from 'flexium/core'
import { Stream } from '../stream/Stream'
import { SSEClient } from '../stream/SSEClient'

describe('Stream', () => {
  it('should extend Useable', () => {
    const stream = new Stream<string>('/api/test')
    expect(isUseable(stream)).toBe(true)
  })

  it('should return initial value from getInitial', () => {
    const stream = new Stream<string>('/api/test', { initial: 'hello' })
    expect(stream.getInitial()).toBe('hello')
  })

  it('should return null if no initial value', () => {
    const stream = new Stream<string>('/api/test')
    expect(stream.getInitial()).toBe(null)
  })

  it('should create stream with string URL', () => {
    const stream = new Stream<string>('/api/test')
    expect(stream).toBeInstanceOf(Stream)
  })

  it('should create stream with dynamic URL function', () => {
    const stream = new Stream<string, { id: string }>(
      (params) => `/api/users/${params.id}`
    )
    expect(stream).toBeInstanceOf(Stream)
  })

  it('should support once option', () => {
    const stream = new Stream<string>('/api/chat', { once: true })
    expect(stream).toBeInstanceOf(Stream)
  })
})

describe('SSEClient', () => {
  let originalEventSource: typeof EventSource

  beforeEach(() => {
    originalEventSource = globalThis.EventSource
  })

  afterEach(() => {
    globalThis.EventSource = originalEventSource
  })

  it('should create client with URL', () => {
    const client = new SSEClient('/api/test')
    expect(client).toBeInstanceOf(SSEClient)
  })

  it('should start as not connected', () => {
    const client = new SSEClient('/api/test')
    expect(client.isConnected).toBe(false)
  })

  it('should close connection', () => {
    const client = new SSEClient('/api/test')
    client.close()
    expect(client.isConnected).toBe(false)
  })

  it('should warn when EventSource not available', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-ignore - remove EventSource for test
    delete globalThis.EventSource

    const client = new SSEClient('/api/test')
    client.connect()

    expect(consoleSpy).toHaveBeenCalledWith('EventSource not supported in this environment')
    consoleSpy.mockRestore()
  })
})

describe('sse server helper', () => {
  it('should export sse function from server', async () => {
    const { sse } = await import('../server/sse')
    expect(typeof sse).toBe('function')
  })

  it('should create SSE response with headers', async () => {
    const { sse } = await import('../server/sse')

    const response = sse(async function* () {
      yield { test: true }
    })

    expect(response.headers['Content-Type']).toBe('text/event-stream')
    expect(response.headers['Cache-Control']).toBe('no-cache')
    expect(response.body).toBeInstanceOf(ReadableStream)
  })

  it('should support sse.from with async iterable', async () => {
    const { sse } = await import('../server/sse')

    async function* generator() {
      yield 1
      yield 2
    }

    const response = sse.from(generator())
    expect(response.headers['Content-Type']).toBe('text/event-stream')
  })
})
