/**
 * Flexism Static File Server
 *
 * Serves static files from the public/ directory
 */

import * as fs from 'fs'
import * as path from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StaticFileOptions {
  /** Public directory path */
  publicDir: string
  /** URL prefix for static files (default: '/') */
  prefix?: string
  /** Enable caching headers (default: true in prod) */
  cache?: boolean
  /** Max age for cache in seconds (default: 31536000 = 1 year) */
  maxAge?: number
  /** Immutable cache (for hashed assets) */
  immutable?: boolean
  /** Index file for directories (default: 'index.html') */
  index?: string
  /** Enable directory listing (default: false) */
  listing?: boolean
  /** Custom headers */
  headers?: Record<string, string>
}

interface ServeResult {
  response: Response
  served: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// MIME Types
// ─────────────────────────────────────────────────────────────────────────────

const MIME_TYPES: Record<string, string> = {
  // Text
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',

  // Images
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',

  // Fonts
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',

  // Media
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',

  // Documents
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',

  // Data
  '.wasm': 'application/wasm',
  '.map': 'application/json',
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

// ─────────────────────────────────────────────────────────────────────────────
// Static File Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a static file handler
 *
 * @example
 * ```ts
 * const staticHandler = createStaticHandler({
 *   publicDir: './public',
 *   cache: true,
 *   maxAge: 86400,
 * })
 *
 * // In request handler
 * const result = await staticHandler(request)
 * if (result.served) {
 *   return result.response
 * }
 * ```
 */
export function createStaticHandler(options: StaticFileOptions) {
  const {
    publicDir,
    prefix = '/',
    cache = process.env.NODE_ENV === 'production',
    maxAge = 31536000,
    immutable = false,
    index = 'index.html',
    listing = false,
    headers: customHeaders = {},
  } = options

  // Normalize prefix
  const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/'

  return async (request: Request): Promise<ServeResult> => {
    const url = new URL(request.url)
    let pathname = decodeURIComponent(url.pathname)

    // Only handle GET/HEAD requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return { response: new Response(null), served: false }
    }

    // Check if path matches prefix
    if (!pathname.startsWith(prefix)) {
      return { response: new Response(null), served: false }
    }

    // Remove prefix from path
    if (prefix !== '/') {
      pathname = pathname.slice(prefix.length) || '/'
    }

    // Prevent directory traversal
    const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '')
    const filePath = path.join(publicDir, safePath)

    // Check if path is within public dir
    const resolvedPath = path.resolve(filePath)
    const resolvedPublicDir = path.resolve(publicDir)
    if (!resolvedPath.startsWith(resolvedPublicDir)) {
      return {
        response: new Response('Forbidden', { status: 403 }),
        served: true,
      }
    }

    // Check if file exists
    try {
      const stat = await fs.promises.stat(filePath)

      if (stat.isDirectory()) {
        // Try index file
        const indexPath = path.join(filePath, index)
        try {
          const indexStat = await fs.promises.stat(indexPath)
          if (indexStat.isFile()) {
            return serveFile(indexPath, indexStat, request, {
              cache,
              maxAge,
              immutable,
              customHeaders,
            })
          }
        } catch {
          // No index file
        }

        // Directory listing
        if (listing) {
          return serveDirectoryListing(filePath, pathname)
        }

        return { response: new Response(null), served: false }
      }

      if (stat.isFile()) {
        return serveFile(filePath, stat, request, {
          cache,
          maxAge,
          immutable,
          customHeaders,
        })
      }

      return { response: new Response(null), served: false }
    } catch {
      // File not found
      return { response: new Response(null), served: false }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// File Serving
// ─────────────────────────────────────────────────────────────────────────────

interface ServeOptions {
  cache: boolean
  maxAge: number
  immutable: boolean
  customHeaders: Record<string, string>
}

async function serveFile(
  filePath: string,
  stat: fs.Stats,
  request: Request,
  options: ServeOptions
): Promise<ServeResult> {
  const { cache, maxAge, immutable, customHeaders } = options
  const mimeType = getMimeType(filePath)
  const etag = `"${stat.size}-${stat.mtime.getTime()}"`
  const lastModified = stat.mtime.toUTCString()
  const fileSize = stat.size

  // Check conditional headers
  const ifNoneMatch = request.headers.get('If-None-Match')
  const ifModifiedSince = request.headers.get('If-Modified-Since')

  if (ifNoneMatch === etag) {
    return {
      response: new Response(null, { status: 304 }),
      served: true,
    }
  }

  if (ifModifiedSince && new Date(ifModifiedSince) >= stat.mtime) {
    return {
      response: new Response(null, { status: 304 }),
      served: true,
    }
  }

  // Parse Range header
  const rangeHeader = request.headers.get('Range')
  let start = 0
  let end = fileSize - 1
  let isRangeRequest = false

  if (rangeHeader) {
    const range = parseRangeHeader(rangeHeader, fileSize)
    if (range === null) {
      // Invalid range - return 416 Range Not Satisfiable
      return {
        response: new Response(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        }),
        served: true,
      }
    }
    start = range.start
    end = range.end
    isRangeRequest = true
  }

  const contentLength = end - start + 1

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': mimeType,
    'Content-Length': String(contentLength),
    'ETag': etag,
    'Last-Modified': lastModified,
    'Accept-Ranges': 'bytes',
    ...customHeaders,
  }

  if (isRangeRequest) {
    headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`
  }

  // Cache headers
  if (cache) {
    const cacheControl = immutable
      ? `public, max-age=${maxAge}, immutable`
      : `public, max-age=${maxAge}`
    headers['Cache-Control'] = cacheControl
  } else {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  }

  // HEAD request - no body
  if (request.method === 'HEAD') {
    return {
      response: new Response(null, { status: isRangeRequest ? 206 : 200, headers }),
      served: true,
    }
  }

  // Read and serve file (full or partial)
  const fd = await fs.promises.open(filePath, 'r')
  try {
    const buffer = Buffer.alloc(contentLength)
    await fd.read(buffer, 0, contentLength, start)
    return {
      response: new Response(buffer, { status: isRangeRequest ? 206 : 200, headers }),
      served: true,
    }
  } finally {
    await fd.close()
  }
}

/**
 * Parse Range header and return start/end bytes
 * Returns null if range is invalid or unsatisfiable
 */
function parseRangeHeader(
  rangeHeader: string,
  fileSize: number
): { start: number; end: number } | null {
  // Only support single byte ranges
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)
  if (!match) return null

  const [, startStr, endStr] = match

  let start: number
  let end: number

  if (startStr === '' && endStr !== '') {
    // Suffix range: bytes=-500 (last 500 bytes)
    const suffix = parseInt(endStr, 10)
    if (suffix === 0) return null
    start = Math.max(0, fileSize - suffix)
    end = fileSize - 1
  } else if (startStr !== '' && endStr === '') {
    // Open-ended range: bytes=500-
    start = parseInt(startStr, 10)
    end = fileSize - 1
  } else if (startStr !== '' && endStr !== '') {
    // Explicit range: bytes=0-499
    start = parseInt(startStr, 10)
    end = parseInt(endStr, 10)
  } else {
    return null
  }

  // Validate range
  if (start > end || start >= fileSize) {
    return null
  }

  // Clamp end to file size
  end = Math.min(end, fileSize - 1)

  return { start, end }
}

async function serveDirectoryListing(
  dirPath: string,
  urlPath: string
): Promise<ServeResult> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

  const items = entries
    .map(entry => {
      const name = entry.isDirectory() ? entry.name + '/' : entry.name
      const href = path.join(urlPath, entry.name)
      return `<li><a href="${href}">${name}</a></li>`
    })
    .join('\n')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Index of ${urlPath}</title>
  <style>
    body { font-family: monospace; padding: 20px; }
    a { text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Index of ${urlPath}</h1>
  <ul>
    ${urlPath !== '/' ? '<li><a href="..">..</a></li>' : ''}
    ${items}
  </ul>
</body>
</html>`

  return {
    response: new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }),
    served: true,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serve a single static file
 */
export async function serveStatic(
  filePath: string,
  options: Partial<ServeOptions> = {}
): Promise<Response> {
  const stat = await fs.promises.stat(filePath)
  const result = await serveFile(
    filePath,
    stat,
    new Request('http://localhost/'),
    {
      cache: options.cache ?? true,
      maxAge: options.maxAge ?? 31536000,
      immutable: options.immutable ?? false,
      customHeaders: options.customHeaders ?? {},
    }
  )
  return result.response
}
