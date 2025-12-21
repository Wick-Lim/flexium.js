import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isUseable } from 'flexium/core'
import { Stream, StreamRef } from '../stream/Stream'
import { SSEClient } from '../stream/SSEClient'
import { analyzeStreams } from '../compiler/stream-analyzer'

describe('Stream (server-side)', () => {
  it('should create stream with callback', () => {
    const callback = async function* () {
      yield 'hello'
      yield 'world'
    }
    const stream = new Stream(callback)
    expect(stream).toBeInstanceOf(Stream)
    expect(stream.callback).toBe(callback)
  })

  it('should create stream with options', () => {
    const stream = new Stream<string>(
      async function* () { yield 'test' },
      { initial: 'loading', once: true }
    )
    expect(stream.options.initial).toBe('loading')
    expect(stream.options.once).toBe(true)
  })

  it('should capture parameters', () => {
    const stream = new Stream<string>(async function* () { yield 'test' })
    const result = stream.capture({ roomId: '123' })
    expect(result).toBe(stream) // Returns this for chaining
  })

  it('should convert to StreamRef with toRef', () => {
    const stream = new Stream<string>(
      async function* () { yield 'test' },
      { initial: 'init', once: true }
    )
    stream.capture({ userId: 'abc' })
    const ref = stream.toRef()

    expect(ref).toBeInstanceOf(StreamRef)
    expect(ref.url).toContain('/_flexism/sse/')
    expect(ref.url).toContain('userId=abc')
    expect(ref.options.initial).toBe('init')
    expect(ref.options.once).toBe(true)
  })

  it('should identify stream instances', () => {
    const stream = new Stream<string>(async function* () { yield 'test' })
    expect(Stream.isStream(stream)).toBe(true)
    expect(Stream.isStream({})).toBe(false)
    expect(Stream.isStream(null)).toBe(false)
  })
})

describe('StreamRef (client-side)', () => {
  it('should extend Useable', () => {
    const ref = new StreamRef<string>('test-id', '/sse/test')
    expect(isUseable(ref)).toBe(true)
  })

  it('should return initial value from getInitial', () => {
    const ref = new StreamRef<string>('test-id', '/sse/test', { initial: 'hello' })
    expect(ref.getInitial()).toBe('hello')
  })

  it('should return null if no initial value', () => {
    const ref = new StreamRef<string>('test-id', '/sse/test')
    expect(ref.getInitial()).toBe(null)
  })

  it('should serialize to JSON', () => {
    const ref = new StreamRef<string>('test-id', '/sse/test', { initial: 'hi' })
    const json = ref.toJSON()

    expect(json.__type).toBe('flexism:streamref')
    expect(json.id).toBe('test-id')
    expect(json.url).toBe('/sse/test')
    expect(json.options.initial).toBe('hi')
  })

  it('should deserialize from JSON', () => {
    const json = {
      __type: 'flexism:streamref' as const,
      id: 'test-id',
      url: '/sse/test',
      options: { initial: 'hi' as string }
    }
    const ref = StreamRef.fromJSON(json)

    expect(ref).toBeInstanceOf(StreamRef)
    expect(ref.id).toBe('test-id')
    expect(ref.url).toBe('/sse/test')
    expect(ref.getInitial()).toBe('hi')
  })

  it('should identify serialized StreamRef', () => {
    expect(StreamRef.isSerializedStreamRef({
      __type: 'flexism:streamref',
      id: 'test',
      url: '/test',
      options: {}
    })).toBe(true)
    expect(StreamRef.isSerializedStreamRef({})).toBe(false)
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

describe('Stream Analyzer', () => {
  it('should analyze simple stream declaration', async () => {
    const source = 'const Messages = new Stream(() => db.subscribe())'
    const streams = await analyzeStreams(source, '/app/page.tsx')

    expect(streams).toHaveLength(1)
    expect(streams[0].variableName).toBe('Messages')
    expect(streams[0].callbackCode).toContain('db.subscribe')
  })

  it('should extract captured variables', async () => {
    const source = 'const Messages = new Stream(() => db.messages.subscribe(params.roomId))'
    const streams = await analyzeStreams(source, '/app/page.tsx')

    expect(streams).toHaveLength(1)
    expect(streams[0].capturedVars).toContainEqual(
      expect.objectContaining({
        base: 'params',
        properties: ['roomId']
      })
    )
  })

  it('should analyze stream with options', async () => {
    const source = 'const Chat = new Stream(() => getMessages(), { once: true })'
    const streams = await analyzeStreams(source, '/app/page.tsx')

    expect(streams).toHaveLength(1)
    expect(streams[0].options).toBeDefined()
  })

  it('should handle multiple streams in one file', async () => {
    const source = 'const Stream1 = new Stream(() => source1())\nconst Stream2 = new Stream(() => source2())'
    const streams = await analyzeStreams(source, '/app/page.tsx')

    expect(streams).toHaveLength(2)
    expect(streams[0].variableName).toBe('Stream1')
    expect(streams[1].variableName).toBe('Stream2')
  })

  it('should generate unique IDs per file', async () => {
    const source = `const S = new Stream(() => data())`
    const streams1 = await analyzeStreams(source, '/app/page1.tsx')
    const streams2 = await analyzeStreams(source, '/app/page2.tsx')

    expect(streams1[0].id).not.toBe(streams2[0].id)
  })
})
