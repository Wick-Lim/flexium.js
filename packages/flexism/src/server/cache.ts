/**
 * Flexism Cache Control
 *
 * HTTP caching utilities for responses
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CacheControlOptions {
  /** Public or private cache */
  public?: boolean
  /** Private cache (browser only) */
  private?: boolean
  /** Max age in seconds */
  maxAge?: number
  /** Shared cache max age (CDN) */
  sMaxAge?: number
  /** Stale while revalidate */
  staleWhileRevalidate?: number
  /** Stale if error */
  staleIfError?: number
  /** Must revalidate */
  mustRevalidate?: boolean
  /** Proxy revalidate */
  proxyRevalidate?: boolean
  /** No cache (always revalidate) */
  noCache?: boolean
  /** No store (don't cache at all) */
  noStore?: boolean
  /** No transform */
  noTransform?: boolean
  /** Immutable */
  immutable?: boolean
}

export interface CachePreset {
  name: string
  options: CacheControlOptions
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache Control Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build Cache-Control header value from options
 *
 * @example
 * ```ts
 * buildCacheControl({ public: true, maxAge: 3600 })
 * // => "public, max-age=3600"
 *
 * buildCacheControl({ private: true, noCache: true })
 * // => "private, no-cache"
 * ```
 */
export function buildCacheControl(options: CacheControlOptions): string {
  const directives: string[] = []

  if (options.public) directives.push('public')
  if (options.private) directives.push('private')
  if (options.noCache) directives.push('no-cache')
  if (options.noStore) directives.push('no-store')
  if (options.noTransform) directives.push('no-transform')
  if (options.mustRevalidate) directives.push('must-revalidate')
  if (options.proxyRevalidate) directives.push('proxy-revalidate')
  if (options.immutable) directives.push('immutable')

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`)
  }
  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`)
  }
  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
  }
  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`)
  }

  return directives.join(', ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Presets
// ─────────────────────────────────────────────────────────────────────────────

/** No caching - always fetch from server */
export const CACHE_NO_STORE: CacheControlOptions = {
  noStore: true,
  noCache: true,
  mustRevalidate: true,
}

/** Private cache - browser only, revalidate */
export const CACHE_PRIVATE: CacheControlOptions = {
  private: true,
  noCache: true,
}

/** Short cache - 1 minute */
export const CACHE_SHORT: CacheControlOptions = {
  public: true,
  maxAge: 60,
  staleWhileRevalidate: 60,
}

/** Medium cache - 1 hour */
export const CACHE_MEDIUM: CacheControlOptions = {
  public: true,
  maxAge: 3600,
  staleWhileRevalidate: 3600,
}

/** Long cache - 1 day */
export const CACHE_LONG: CacheControlOptions = {
  public: true,
  maxAge: 86400,
  staleWhileRevalidate: 86400,
}

/** Static assets - 1 year, immutable */
export const CACHE_STATIC: CacheControlOptions = {
  public: true,
  maxAge: 31536000,
  immutable: true,
}

/** ISR-style cache - short browser, long CDN with revalidation */
export const CACHE_ISR: CacheControlOptions = {
  public: true,
  maxAge: 60,
  sMaxAge: 3600,
  staleWhileRevalidate: 86400,
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add cache headers to response
 *
 * @example
 * ```ts
 * const response = new Response('Hello')
 * return withCache(response, CACHE_MEDIUM)
 * ```
 */
export function withCache(
  response: Response,
  options: CacheControlOptions
): Response {
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', buildCacheControl(options))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Add ETag and conditional response handling
 *
 * @example
 * ```ts
 * const content = JSON.stringify(data)
 * return withETag(new Response(content), content, request)
 * ```
 */
export function withETag(
  response: Response,
  content: string | Buffer,
  request?: Request
): Response {
  const hash = simpleHash(content)
  const etag = `"${hash}"`

  // Check if client has current version
  if (request) {
    const ifNoneMatch = request.headers.get('If-None-Match')
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 })
    }
  }

  const headers = new Headers(response.headers)
  headers.set('ETag', etag)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Add Last-Modified header and conditional response handling
 */
export function withLastModified(
  response: Response,
  date: Date,
  request?: Request
): Response {
  const lastModified = date.toUTCString()

  // Check if client has current version
  if (request) {
    const ifModifiedSince = request.headers.get('If-Modified-Since')
    if (ifModifiedSince && new Date(ifModifiedSince) >= date) {
      return new Response(null, { status: 304 })
    }
  }

  const headers = new Headers(response.headers)
  headers.set('Last-Modified', lastModified)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Create a cached JSON response
 *
 * @example
 * ```ts
 * return cachedJson({ users: [] }, CACHE_SHORT)
 * ```
 */
export function cachedJson(
  data: unknown,
  options: CacheControlOptions = CACHE_SHORT
): Response {
  const body = JSON.stringify(data)
  const response = new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': buildCacheControl(options),
    },
  })
  return response
}

/**
 * Create a cached HTML response
 */
export function cachedHtml(
  html: string,
  options: CacheControlOptions = CACHE_SHORT
): Response {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': buildCacheControl(options),
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Route-level Cache Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface RouteCacheConfig {
  /** Route path pattern */
  path: string | RegExp
  /** Cache options */
  cache: CacheControlOptions
}

/**
 * Create a cache middleware from route configs
 *
 * @example
 * ```ts
 * const cacheMiddleware = createCacheMiddleware([
 *   { path: '/api/users', cache: CACHE_SHORT },
 *   { path: /^\/static\//, cache: CACHE_STATIC },
 * ])
 * ```
 */
export function createCacheMiddleware(configs: RouteCacheConfig[]) {
  return async (
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> => {
    const url = new URL(request.url)
    const response = await next()

    // Find matching config
    for (const config of configs) {
      const matches =
        typeof config.path === 'string'
          ? url.pathname === config.path || url.pathname.startsWith(config.path + '/')
          : config.path.test(url.pathname)

      if (matches) {
        return withCache(response, config.cache)
      }
    }

    return response
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FNV-1a hash - better distribution than djb2
 * @see https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 */
function simpleHash(content: string | Buffer): string {
  // FNV-1a 32-bit parameters
  let hash = 2166136261

  if (typeof content === 'string') {
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i)
      hash = (hash * 16777619) >>> 0
    }
  } else {
    // Buffer: iterate bytes directly without toString() copy
    for (let i = 0; i < content.length; i++) {
      hash ^= content[i]
      hash = (hash * 16777619) >>> 0
    }
  }

  return hash.toString(36)
}
