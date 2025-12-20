import { describe, it, expect } from 'vitest'
import {
  concatStreams,
  prependToStream,
  appendToStream,
  createInjectorStream,
  stringToStream,
  bytesToStream,
  createByteCounter,
  limitStream,
} from '../utils/stream'

describe('Zero-Copy Streaming Utilities', () => {
  describe('concatStreams', () => {
    it('should concatenate multiple strings', async () => {
      const stream = concatStreams(['Hello', ' ', 'World'])
      const result = await streamToString(stream)

      expect(result).toBe('Hello World')
    })

    it('should concatenate streams and strings', async () => {
      const stream1 = stringToStream('Start-')
      const stream = concatStreams([stream1, 'Middle-', 'End'])
      const result = await streamToString(stream)

      expect(result).toBe('Start-Middle-End')
    })

    it('should concatenate Uint8Arrays', async () => {
      const encoder = new TextEncoder()
      const bytes1 = encoder.encode('Hello')
      const bytes2 = encoder.encode(' World')

      const stream = concatStreams([bytes1, bytes2])
      const result = await streamToString(stream)

      expect(result).toBe('Hello World')
    })

    it('should handle empty array', async () => {
      const stream = concatStreams([])
      const result = await streamToString(stream)

      expect(result).toBe('')
    })

    it('should use separator between streams', async () => {
      const stream = concatStreams(['a', 'b', 'c'], { separator: ',' })
      const result = await streamToString(stream)

      expect(result).toBe('a,b,c')
    })
  })

  describe('prependToStream', () => {
    it('should prepend string to stream', async () => {
      const original = stringToStream('World')
      const stream = prependToStream('Hello ', original)
      const result = await streamToString(stream)

      expect(result).toBe('Hello World')
    })

    it('should prepend Uint8Array to stream', async () => {
      const encoder = new TextEncoder()
      const prefix = encoder.encode('Prefix-')
      const original = stringToStream('Content')
      const stream = prependToStream(prefix, original)
      const result = await streamToString(stream)

      expect(result).toBe('Prefix-Content')
    })
  })

  describe('appendToStream', () => {
    it('should append string to stream', async () => {
      const original = stringToStream('Hello')
      const stream = appendToStream(original, ' World')
      const result = await streamToString(stream)

      expect(result).toBe('Hello World')
    })
  })

  describe('createInjectorStream', () => {
    it('should inject content before marker', async () => {
      const html = '<html><body><div>Content</div></body></html>'
      const input = stringToStream(html)
      const injector = createInjectorStream('</body>', '<script>injected</script>')
      const output = input.pipeThrough(injector)
      const result = await streamToString(output)

      expect(result).toBe('<html><body><div>Content</div><script>injected</script></body></html>')
    })

    it('should be case insensitive', async () => {
      const html = '<HTML><BODY></BODY></HTML>'
      const input = stringToStream(html)
      const injector = createInjectorStream('</body>', '<script>x</script>')
      const output = input.pipeThrough(injector)
      const result = await streamToString(output)

      expect(result).toBe('<HTML><BODY><script>x</script></BODY></HTML>')
    })

    it('should append at end if marker not found', async () => {
      const html = '<html><head></head></html>'
      const input = stringToStream(html)
      const injector = createInjectorStream('</body>', '<script>x</script>')
      const output = input.pipeThrough(injector)
      const result = await streamToString(output)

      expect(result).toBe('<html><head></head></html><script>x</script>')
    })

    it('should handle chunked input', async () => {
      // Simulate chunked stream where marker spans chunks
      const chunks = ['<html><bo', 'dy></bo', 'dy></html>']
      const stream = createChunkedStream(chunks)
      const injector = createInjectorStream('</body>', '<script>x</script>')
      const output = stream.pipeThrough(injector)
      const result = await streamToString(output)

      expect(result).toBe('<html><body><script>x</script></body></html>')
    })

    it('should only inject once', async () => {
      const html = '<body></body><body></body>'
      const input = stringToStream(html)
      const injector = createInjectorStream('</body>', 'X')
      const output = input.pipeThrough(injector)
      const result = await streamToString(output)

      // Should only inject before first </body>
      expect(result).toBe('<body>X</body><body></body>')
    })
  })

  describe('stringToStream', () => {
    it('should convert string to stream', async () => {
      const stream = stringToStream('Hello World')
      const result = await streamToString(stream)

      expect(result).toBe('Hello World')
    })

    it('should handle empty string', async () => {
      const stream = stringToStream('')
      const result = await streamToString(stream)

      expect(result).toBe('')
    })

    it('should handle unicode', async () => {
      const stream = stringToStream('Hello 世界 🌍')
      const result = await streamToString(stream)

      expect(result).toBe('Hello 世界 🌍')
    })
  })

  describe('bytesToStream', () => {
    it('should convert Uint8Array to stream', async () => {
      const encoder = new TextEncoder()
      const bytes = encoder.encode('Hello World')
      const stream = bytesToStream(bytes)
      const result = await streamToString(stream)

      expect(result).toBe('Hello World')
    })
  })

  describe('createByteCounter', () => {
    it('should count bytes passing through', async () => {
      const { stream, getCount } = createByteCounter()
      const input = stringToStream('Hello World') // 11 bytes
      const output = input.pipeThrough(stream)

      await streamToString(output)

      expect(getCount()).toBe(11)
    })

    it('should pass data unchanged', async () => {
      const { stream } = createByteCounter()
      const input = stringToStream('Test Data')
      const output = input.pipeThrough(stream)
      const result = await streamToString(output)

      expect(result).toBe('Test Data')
    })
  })

  describe('limitStream', () => {
    it('should pass through data under limit', async () => {
      const input = stringToStream('Hello')
      const limited = limitStream(input, 100)
      const result = await streamToString(limited)

      expect(result).toBe('Hello')
    })

    it('should error when limit exceeded', async () => {
      const input = stringToStream('Hello World - this is longer than 10 bytes')
      const limited = limitStream(input, 10)

      await expect(streamToString(limited)).rejects.toThrow('exceeded')
    })
  })
})

// Helper functions
async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let result = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += decoder.decode(value, { stream: true })
    }
    result += decoder.decode()
  } finally {
    reader.releaseLock()
  }

  return result
}

function createChunkedStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let index = 0

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close()
        return
      }
      controller.enqueue(encoder.encode(chunks[index++]))
    },
  })
}
