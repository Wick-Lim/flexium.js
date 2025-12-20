/**
 * Flexism Compression Middleware
 *
 * Gzip and Brotli compression for HTTP responses
 */

import * as zlib from 'zlib'
import { Readable } from 'stream'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CompressionOptions {
  /** Minimum size in bytes to compress (default: 1024) */
  threshold?: number
  /** Compression level for gzip (0-9, default: 6) */
  gzipLevel?: number
  /** Compression level for brotli (0-11, default: 4) */
  brotliLevel?: number
  /** Preferred encoding order (default: ['br', 'gzip', 'deflate']) */
  encodings?: CompressionEncoding[]
  /** Content types to compress (default: text/*, application/json, application/javascript, etc.) */
  mimeTypes?: string[]
  /** Skip compression for these paths */
  excludePaths?: string[]
}

export type CompressionEncoding = 'br' | 'gzip' | 'deflate'

interface EncodingPreference {
  encoding: CompressionEncoding
  quality: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_THRESHOLD = 1024 // 1KB minimum

const DEFAULT_MIME_TYPES = [
  'text/html',
  'text/css',
  'text/plain',
  'text/javascript',
  'text/xml',
  'text/markdown',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/xhtml+xml',
  'application/rss+xml',
  'application/atom+xml',
  'application/x-javascript',
  'image/svg+xml',
  'font/ttf',
  'font/otf',
  'application/wasm',
]

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  threshold: DEFAULT_THRESHOLD,
  gzipLevel: 6,
  brotliLevel: 4,
  encodings: ['br', 'gzip', 'deflate'],
  mimeTypes: DEFAULT_MIME_TYPES,
  excludePaths: [],
}

// ─────────────────────────────────────────────────────────────────────────────
// Accept-Encoding Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse Accept-Encoding header and return preferred encoding
 *
 * @example
 * parseAcceptEncoding('gzip, deflate, br')
 * // => [{ encoding: 'gzip', quality: 1 }, { encoding: 'deflate', quality: 1 }, { encoding: 'br', quality: 1 }]
 *
 * parseAcceptEncoding('br;q=1.0, gzip;q=0.8, *;q=0.1')
 * // => [{ encoding: 'br', quality: 1 }, { encoding: 'gzip', quality: 0.8 }]
 */
export function parseAcceptEncoding(header: string): EncodingPreference[] {
  if (!header) return []

  const preferences: EncodingPreference[] = []

  for (const part of header.split(',')) {
    const [encoding, ...params] = part.trim().split(';')
    const normalizedEncoding = encoding.trim().toLowerCase()

    // Skip identity and wildcard
    if (normalizedEncoding === 'identity' || normalizedEncoding === '*') {
      continue
    }

    // Only accept supported encodings
    if (!['br', 'gzip', 'deflate'].includes(normalizedEncoding)) {
      continue
    }

    // Parse quality value
    let quality = 1
    for (const param of params) {
      const [key, value] = param.trim().split('=')
      if (key.trim().toLowerCase() === 'q' && value) {
        quality = parseFloat(value) || 0
      }
    }

    if (quality > 0) {
      preferences.push({
        encoding: normalizedEncoding as CompressionEncoding,
        quality,
      })
    }
  }

  // Sort by quality (highest first)
  return preferences.sort((a, b) => b.quality - a.quality)
}

/**
 * Select best encoding based on Accept-Encoding header and server preferences
 */
export function selectEncoding(
  acceptEncoding: string,
  serverPreference: CompressionEncoding[] = ['br', 'gzip', 'deflate']
): CompressionEncoding | null {
  const clientPrefs = parseAcceptEncoding(acceptEncoding)
  if (clientPrefs.length === 0) return null

  // Find first server-preferred encoding that client accepts
  for (const serverEnc of serverPreference) {
    const clientPref = clientPrefs.find(p => p.encoding === serverEnc)
    if (clientPref) {
      return serverEnc
    }
  }

  // Fallback to client's top preference if supported
  const topClient = clientPrefs[0]
  if (serverPreference.includes(topClient.encoding)) {
    return topClient.encoding
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// MIME Type Checking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if content type should be compressed
 */
function shouldCompressContentType(
  contentType: string | null,
  allowedTypes: string[]
): boolean {
  if (!contentType) return false

  // Extract base MIME type (remove charset, etc.)
  const mimeType = contentType.split(';')[0].trim().toLowerCase()

  for (const allowed of allowedTypes) {
    if (allowed.endsWith('/*')) {
      // Wildcard match (e.g., 'text/*')
      const prefix = allowed.slice(0, -1)
      if (mimeType.startsWith(prefix)) {
        return true
      }
    } else if (mimeType === allowed || mimeType.startsWith(allowed + ';')) {
      return true
    }
  }

  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Compression Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compress a buffer with the specified encoding
 */
export function compressBuffer(
  buffer: Buffer,
  encoding: CompressionEncoding,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const { gzipLevel = 6, brotliLevel = 4 } = options

  return new Promise((resolve, reject) => {
    const callback = (err: Error | null, result: Buffer) => {
      if (err) reject(err)
      else resolve(result)
    }

    switch (encoding) {
      case 'br':
        zlib.brotliCompress(
          buffer,
          {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: brotliLevel,
            },
          },
          callback
        )
        break
      case 'gzip':
        zlib.gzip(buffer, { level: gzipLevel }, callback)
        break
      case 'deflate':
        zlib.deflate(buffer, { level: gzipLevel }, callback)
        break
      default:
        resolve(buffer)
    }
  })
}

/**
 * Create a compression transform stream
 */
export function createCompressionStream(
  encoding: CompressionEncoding,
  options: CompressionOptions = {}
): zlib.BrotliCompress | zlib.Gzip | zlib.Deflate {
  const { gzipLevel = 6, brotliLevel = 4 } = options

  switch (encoding) {
    case 'br':
      return zlib.createBrotliCompress({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: brotliLevel,
        },
      })
    case 'gzip':
      return zlib.createGzip({ level: gzipLevel })
    case 'deflate':
      return zlib.createDeflate({ level: gzipLevel })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Compression Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create compression middleware
 *
 * @example
 * ```ts
 * const compress = createCompressionMiddleware({
 *   threshold: 1024,
 *   encodings: ['br', 'gzip'],
 * })
 *
 * // In handler
 * const response = await compress(request, () => handleRequest(request))
 * ```
 */
export function createCompressionMiddleware(options: CompressionOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  return async (
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> => {
    // Skip non-GET/HEAD requests (POST responses usually shouldn't be cached/compressed)
    // Actually, we should compress all responses, just check Accept-Encoding
    const acceptEncoding = request.headers.get('Accept-Encoding') || ''

    // Select encoding
    const encoding = selectEncoding(acceptEncoding, config.encodings)
    if (!encoding) {
      return next()
    }

    // Check excluded paths
    const url = new URL(request.url)
    if (config.excludePaths.some(p => url.pathname.startsWith(p))) {
      return next()
    }

    // Get response
    const response = await next()

    // Skip if already encoded
    if (response.headers.get('Content-Encoding')) {
      return response
    }

    // Skip non-successful responses
    if (response.status < 200 || response.status >= 300) {
      return response
    }

    // Check content type
    const contentType = response.headers.get('Content-Type')
    if (!shouldCompressContentType(contentType, config.mimeTypes)) {
      return response
    }

    // Check content length if available
    const contentLength = response.headers.get('Content-Length')
    if (contentLength && parseInt(contentLength, 10) < config.threshold) {
      return response
    }

    // Compress the response
    return compressResponse(response, encoding, config)
  }
}

/**
 * Compress a response with the specified encoding
 */
async function compressResponse(
  response: Response,
  encoding: CompressionEncoding,
  options: CompressionOptions
): Promise<Response> {
  const headers = new Headers(response.headers)
  headers.set('Content-Encoding', encoding)
  headers.delete('Content-Length') // Length changes after compression
  headers.append('Vary', 'Accept-Encoding')

  // If response has no body, return as-is with encoding header
  if (!response.body) {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  // For streaming responses, use transform stream
  const compressStream = createCompressionStream(encoding, options)

  // Convert Web ReadableStream to Node stream, compress, convert back
  const nodeReadable = Readable.fromWeb(response.body as any)
  const compressedNodeStream = nodeReadable.pipe(compressStream)
  const webStream = Readable.toWeb(compressedNodeStream) as ReadableStream<Uint8Array>

  return new Response(webStream, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compress and return a response (one-shot, for small responses)
 *
 * @example
 * ```ts
 * const html = '<html>...</html>'
 * return compressedResponse(html, request, {
 *   contentType: 'text/html',
 * })
 * ```
 */
export async function compressedResponse(
  content: string | Buffer,
  request: Request,
  options: {
    contentType?: string
    status?: number
    headers?: Record<string, string>
  } & CompressionOptions = {}
): Promise<Response> {
  const {
    contentType = 'text/plain',
    status = 200,
    headers: customHeaders = {},
    threshold = DEFAULT_THRESHOLD,
    ...compressionOptions
  } = options

  const buffer = typeof content === 'string' ? Buffer.from(content) : content
  const acceptEncoding = request.headers.get('Accept-Encoding') || ''
  const encoding = selectEncoding(acceptEncoding, compressionOptions.encodings)

  // Build base headers
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    ...customHeaders,
  }

  // Check if we should compress
  if (!encoding || buffer.length < threshold) {
    headers['Content-Length'] = String(buffer.length)
    return new Response(buffer, { status, headers })
  }

  // Check if content type should be compressed
  if (!shouldCompressContentType(contentType, compressionOptions.mimeTypes || DEFAULT_MIME_TYPES)) {
    headers['Content-Length'] = String(buffer.length)
    return new Response(buffer, { status, headers })
  }

  // Compress
  const compressed = await compressBuffer(buffer, encoding, compressionOptions)

  headers['Content-Encoding'] = encoding
  headers['Content-Length'] = String(compressed.length)
  headers['Vary'] = 'Accept-Encoding'

  return new Response(compressed, { status, headers })
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-compressed Static File Support
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check for pre-compressed versions of a file
 * Returns the path to use and the encoding, or null if no compressed version exists
 *
 * @example
 * ```ts
 * // If file.js.br exists
 * findPrecompressed('/public/file.js', 'br, gzip')
 * // => { path: '/public/file.js.br', encoding: 'br' }
 * ```
 */
export function getPrecompressedPath(
  filePath: string,
  acceptEncoding: string,
  checkExists: (path: string) => boolean
): { path: string; encoding: CompressionEncoding } | null {
  const encoding = selectEncoding(acceptEncoding)
  if (!encoding) return null

  const extensions: Record<CompressionEncoding, string> = {
    br: '.br',
    gzip: '.gz',
    deflate: '.zz',
  }

  const compressedPath = filePath + extensions[encoding]
  if (checkExists(compressedPath)) {
    return { path: compressedPath, encoding }
  }

  return null
}
