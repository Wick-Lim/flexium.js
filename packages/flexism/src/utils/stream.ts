/**
 * Zero-Copy Streaming Utilities
 *
 * Stream manipulation without unnecessary buffer copies
 */

import { Readable, Transform, PassThrough, pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ConcatStreamOptions {
  /** Separator between streams */
  separator?: string | Uint8Array
}

// ─────────────────────────────────────────────────────────────────────────────
// Stream Concatenation (Zero-Copy)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Concatenate multiple streams without buffering
 * Streams are piped sequentially with optional separators
 *
 * @example
 * ```ts
 * const hmrScript = stringToStream('// HMR\n')
 * const appBundle = response.body
 * const combined = concatStreams([hmrScript, appBundle])
 * ```
 */
export function concatStreams(
  streams: (ReadableStream<Uint8Array> | Readable | string | Uint8Array)[],
  options: ConcatStreamOptions = {}
): ReadableStream<Uint8Array> {
  const { separator } = options
  const encoder = new TextEncoder()
  const sepBytes = separator
    ? typeof separator === 'string'
      ? encoder.encode(separator)
      : separator
    : null

  let currentIndex = 0
  let currentReader: ReadableStreamDefaultReader<Uint8Array> | null = null
  let sentSeparator = false

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      // Check if we're done first
      if (!currentReader && currentIndex >= streams.length) {
        controller.close()
        return
      }

      // Send separator between streams (only if there's more content)
      if (sepBytes && currentIndex > 0 && currentIndex < streams.length && !sentSeparator) {
        controller.enqueue(sepBytes)
        sentSeparator = true
        return
      }

      // Get or create reader for current stream
      if (!currentReader) {

        const source = streams[currentIndex]

        if (typeof source === 'string') {
          controller.enqueue(encoder.encode(source))
          currentIndex++
          sentSeparator = false
          return
        }

        if (source instanceof Uint8Array) {
          controller.enqueue(source)
          currentIndex++
          sentSeparator = false
          return
        }

        // Convert Node Readable to Web ReadableStream if needed
        const webStream =
          source instanceof Readable
            ? Readable.toWeb(source) as ReadableStream<Uint8Array>
            : source

        currentReader = webStream.getReader()
      }

      // Read from current stream
      const { done, value } = await currentReader.read()

      if (done) {
        currentReader.releaseLock()
        currentReader = null
        currentIndex++
        sentSeparator = false

        // Continue to next stream
        if (currentIndex < streams.length) {
          return this.pull!(controller)
        }

        controller.close()
        return
      }

      controller.enqueue(value)
    },

    cancel() {
      currentReader?.releaseLock()
    },
  })
}

/**
 * Prepend data to a stream without copying
 */
export function prependToStream(
  prefix: string | Uint8Array,
  stream: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  return concatStreams([prefix, stream])
}

/**
 * Append data to a stream without copying
 */
export function appendToStream(
  stream: ReadableStream<Uint8Array>,
  suffix: string | Uint8Array
): ReadableStream<Uint8Array> {
  return concatStreams([stream, suffix])
}

// ─────────────────────────────────────────────────────────────────────────────
// Transform Streams
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a transform stream that injects content before a marker
 * Uses minimal buffering - only buffers enough to detect the marker
 *
 * @example
 * ```ts
 * const injector = createInjectorStream('</body>', '<script>hmr()</script>')
 * const result = response.body.pipeThrough(injector)
 * ```
 */
export function createInjectorStream(
  marker: string,
  injection: string
): TransformStream<Uint8Array, Uint8Array> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const markerBytes = encoder.encode(marker)
  const injectionBytes = encoder.encode(injection)

  let buffer = new Uint8Array(0)
  let injected = false
  const markerLen = markerBytes.length

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      if (injected) {
        // Already injected, pass through
        controller.enqueue(chunk)
        return
      }

      // Combine buffer with new chunk
      const combined = new Uint8Array(buffer.length + chunk.length)
      combined.set(buffer)
      combined.set(chunk, buffer.length)

      // Search for marker
      const text = decoder.decode(combined, { stream: true })
      const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase())

      if (markerIndex !== -1) {
        // Found marker - inject before it
        const beforeMarker = encoder.encode(text.slice(0, markerIndex))
        const afterMarker = encoder.encode(text.slice(markerIndex))

        controller.enqueue(beforeMarker)
        controller.enqueue(injectionBytes)
        controller.enqueue(afterMarker)

        injected = true
        buffer = new Uint8Array(0)
      } else {
        // No marker found - output safe portion, keep potential partial match
        const safeLen = Math.max(0, combined.length - markerLen)
        if (safeLen > 0) {
          controller.enqueue(combined.slice(0, safeLen))
          buffer = combined.slice(safeLen)
        } else {
          buffer = combined
        }
      }
    },

    flush(controller) {
      // Output remaining buffer
      if (buffer.length > 0) {
        if (!injected) {
          // Marker not found - append injection at end
          controller.enqueue(buffer)
          controller.enqueue(injectionBytes)
        } else {
          controller.enqueue(buffer)
        }
      } else if (!injected) {
        // No remaining buffer but didn't inject - append at end
        controller.enqueue(injectionBytes)
      }
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Stream Conversion (Zero-Copy where possible)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert string to ReadableStream without intermediate buffer
 */
export function stringToStream(str: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let sent = false

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (!sent) {
        controller.enqueue(encoder.encode(str))
        sent = true
      }
      controller.close()
    },
  })
}

/**
 * Convert Uint8Array to ReadableStream (zero-copy reference)
 */
export function bytesToStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  let sent = false

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (!sent) {
        // Enqueue reference, not copy
        controller.enqueue(bytes)
        sent = true
      }
      controller.close()
    },
  })
}

/**
 * Pipe Web ReadableStream to Node.js ServerResponse without buffering
 */
export async function pipeToResponse(
  stream: ReadableStream<Uint8Array>,
  res: { write: (chunk: Uint8Array) => boolean; end: () => void }
): Promise<void> {
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
  } finally {
    reader.releaseLock()
  }

  res.end()
}

/**
 * Convert Node.js Readable to Web ReadableStream (zero-copy)
 */
export function nodeToWebStream(readable: Readable): ReadableStream<Uint8Array> {
  return Readable.toWeb(readable) as ReadableStream<Uint8Array>
}

/**
 * Convert Web ReadableStream to Node.js Readable (zero-copy)
 */
export function webToNodeStream(stream: ReadableStream<Uint8Array>): Readable {
  return Readable.fromWeb(stream as any)
}

// ─────────────────────────────────────────────────────────────────────────────
// Stream Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a pass-through stream that counts bytes without copying
 */
export function createByteCounter(): {
  stream: TransformStream<Uint8Array, Uint8Array>
  getCount: () => number
} {
  let count = 0

  const stream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      count += chunk.length
      controller.enqueue(chunk)
    },
  })

  return {
    stream,
    getCount: () => count,
  }
}

/**
 * Tee a stream and consume one branch without buffering
 * Useful for calculating hash while streaming
 */
export function teeWithConsumer<T>(
  stream: ReadableStream<T>,
  consumer: (value: T) => void
): ReadableStream<T> {
  const [branch1, branch2] = stream.tee()

  // Consume branch2 in background
  ;(async () => {
    const reader = branch2.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        consumer(value)
      }
    } finally {
      reader.releaseLock()
    }
  })()

  return branch1
}

/**
 * Limit stream to max bytes (for DoS prevention)
 */
export function limitStream(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number
): ReadableStream<Uint8Array> {
  let totalBytes = 0

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          totalBytes += value.length

          if (totalBytes > maxBytes) {
            controller.error(new Error(`Stream exceeded ${maxBytes} bytes limit`))
            return
          }

          controller.enqueue(value)
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      } finally {
        reader.releaseLock()
      }
    },
  })
}

/**
 * Check if stream is empty without consuming it
 * Returns the stream and whether it has content
 */
export async function peekStream(
  stream: ReadableStream<Uint8Array>
): Promise<{ isEmpty: boolean; stream: ReadableStream<Uint8Array> }> {
  const reader = stream.getReader()
  const { done, value } = await reader.read()
  reader.releaseLock()

  if (done || !value || value.length === 0) {
    return { isEmpty: true, stream: new ReadableStream() }
  }

  // Reconstruct stream with peeked value
  return {
    isEmpty: false,
    stream: concatStreams([value, stream]),
  }
}
