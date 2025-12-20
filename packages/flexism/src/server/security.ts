/**
 * Flexism Security Middleware
 *
 * CORS and CSRF protection for API routes
 */

import * as crypto from 'crypto'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CorsOptions {
  /** Allowed origins (string, array, or function) */
  origin?: string | string[] | ((origin: string) => boolean) | boolean
  /** Allowed HTTP methods */
  methods?: string[]
  /** Allowed headers */
  allowedHeaders?: string[]
  /** Headers to expose to client */
  exposedHeaders?: string[]
  /** Allow credentials */
  credentials?: boolean
  /** Preflight cache max age in seconds */
  maxAge?: number
}

export interface CsrfOptions {
  /** Cookie name for CSRF token */
  cookie?: string
  /** Header name for CSRF token */
  header?: string
  /** Token length in bytes */
  tokenLength?: number
  /** Safe methods that don't require CSRF check */
  safeMethods?: string[]
  /** Paths to exclude from CSRF check */
  excludePaths?: string[]
}

export interface SecurityHeaders {
  /** X-Content-Type-Options */
  contentTypeOptions?: boolean
  /** X-Frame-Options */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | false
  /** X-XSS-Protection */
  xssProtection?: boolean
  /** Referrer-Policy */
  referrerPolicy?: string
  /** Content-Security-Policy */
  csp?: string | false
  /** Strict-Transport-Security */
  hsts?: { maxAge: number; includeSubDomains?: boolean; preload?: boolean } | false
}

// ─────────────────────────────────────────────────────────────────────────────
// CORS Middleware
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CORS: Required<CorsOptions> = {
  origin: false,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: [],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400,
}

/**
 * Create CORS middleware
 *
 * @example
 * ```ts
 * const cors = createCorsMiddleware({
 *   origin: ['https://example.com', 'https://app.example.com'],
 *   credentials: true,
 * })
 *
 * // In handler
 * const response = cors(request, () => handleRequest(request))
 * ```
 */
export function createCorsMiddleware(options: CorsOptions = {}) {
  const config = { ...DEFAULT_CORS, ...options }

  return async (
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> => {
    const origin = request.headers.get('Origin')
    const isPreflight = request.method === 'OPTIONS'

    // No Origin header = same-origin request
    if (!origin) {
      return next()
    }

    // Check if origin is allowed
    const allowedOrigin = getOriginValue(origin, config.origin)

    // Preflight request
    if (isPreflight) {
      const headers: Record<string, string> = {}

      if (allowedOrigin) {
        headers['Access-Control-Allow-Origin'] = allowedOrigin
        headers['Access-Control-Allow-Methods'] = config.methods.join(', ')

        const requestHeaders = request.headers.get('Access-Control-Request-Headers')
        if (requestHeaders) {
          headers['Access-Control-Allow-Headers'] =
            config.allowedHeaders.length > 0
              ? config.allowedHeaders.join(', ')
              : requestHeaders
        }

        if (config.credentials) {
          headers['Access-Control-Allow-Credentials'] = 'true'
        }

        if (config.maxAge > 0) {
          headers['Access-Control-Max-Age'] = String(config.maxAge)
        }
      }

      return new Response(null, { status: 204, headers })
    }

    // Actual request
    const response = await next()

    if (allowedOrigin) {
      const headers = new Headers(response.headers)
      headers.set('Access-Control-Allow-Origin', allowedOrigin)

      if (config.credentials) {
        headers.set('Access-Control-Allow-Credentials', 'true')
      }

      if (config.exposedHeaders.length > 0) {
        headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '))
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    return response
  }
}

function getOriginValue(
  origin: string,
  allowed: CorsOptions['origin']
): string | null {
  if (allowed === true || allowed === '*') {
    return '*'
  }

  if (allowed === false) {
    return null
  }

  if (typeof allowed === 'string') {
    return allowed === origin ? origin : null
  }

  if (Array.isArray(allowed)) {
    return allowed.includes(origin) ? origin : null
  }

  if (typeof allowed === 'function') {
    return allowed(origin) ? origin : null
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// CSRF Protection
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CSRF: Required<CsrfOptions> = {
  cookie: '_csrf',
  header: 'X-CSRF-Token',
  tokenLength: 32,
  safeMethods: ['GET', 'HEAD', 'OPTIONS'],
  excludePaths: [],
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Create CSRF protection middleware
 *
 * @example
 * ```ts
 * const csrf = createCsrfMiddleware({
 *   excludePaths: ['/api/webhook'],
 * })
 *
 * // Generate token for forms
 * const token = generateCsrfToken()
 * // Set cookie: _csrf=token
 * // Include in form: <input type="hidden" name="_csrf" value="token">
 * ```
 */
export function createCsrfMiddleware(options: CsrfOptions = {}) {
  const config = { ...DEFAULT_CSRF, ...options }

  return async (
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> => {
    const url = new URL(request.url)

    // Skip safe methods
    if (config.safeMethods.includes(request.method)) {
      return next()
    }

    // Skip excluded paths
    if (config.excludePaths.some(p => url.pathname.startsWith(p))) {
      return next()
    }

    // Get token from cookie
    const cookies = parseCookies(request.headers.get('Cookie') || '')
    const cookieToken = cookies[config.cookie]

    if (!cookieToken) {
      return new Response('CSRF token missing', { status: 403 })
    }

    // Get token from header or body
    let requestToken = request.headers.get(config.header)

    // If not in header, check body for form submissions
    if (!requestToken && request.headers.get('Content-Type')?.includes('form')) {
      try {
        const formData = await request.clone().formData()
        requestToken = formData.get('_csrf') as string
      } catch {
        // Not form data
      }
    }

    // Validate token
    if (!requestToken || !timingSafeEqual(cookieToken, requestToken)) {
      return new Response('CSRF token invalid', { status: 403 })
    }

    return next()
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies

  for (const pair of cookieHeader.split(';')) {
    const trimmed = pair.trim()
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()

    if (key && value) {
      try {
        cookies[key] = decodeURIComponent(value)
      } catch {
        // Invalid encoding, use raw value
        cookies[key] = value
      }
    }
  }

  return cookies
}

function timingSafeEqual(a: string, b: string): boolean {
  // Pad to same length to avoid leaking length information via timing
  const maxLen = Math.max(a.length, b.length, 1)
  const bufA = Buffer.alloc(maxLen)
  const bufB = Buffer.alloc(maxLen)
  Buffer.from(a).copy(bufA)
  Buffer.from(b).copy(bufB)

  // Compare in constant time, then check length match
  // Length check is done after to ensure constant-time comparison always runs
  const contentsEqual = crypto.timingSafeEqual(bufA, bufB)
  return contentsEqual && a.length === b.length
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SECURITY_HEADERS: Required<SecurityHeaders> = {
  contentTypeOptions: true,
  frameOptions: 'SAMEORIGIN',
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  csp: false,
  hsts: false,
}

/**
 * Create security headers middleware
 *
 * @example
 * ```ts
 * const securityHeaders = createSecurityHeadersMiddleware({
 *   hsts: { maxAge: 31536000, includeSubDomains: true },
 *   csp: "default-src 'self'",
 * })
 * ```
 */
export function createSecurityHeadersMiddleware(options: SecurityHeaders = {}) {
  const config = { ...DEFAULT_SECURITY_HEADERS, ...options }

  return async (
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> => {
    const response = await next()
    const headers = new Headers(response.headers)

    if (config.contentTypeOptions) {
      headers.set('X-Content-Type-Options', 'nosniff')
    }

    if (config.frameOptions) {
      headers.set('X-Frame-Options', config.frameOptions)
    }

    if (config.xssProtection) {
      headers.set('X-XSS-Protection', '1; mode=block')
    }

    if (config.referrerPolicy) {
      headers.set('Referrer-Policy', config.referrerPolicy)
    }

    if (config.csp) {
      headers.set('Content-Security-Policy', config.csp)
    }

    if (config.hsts) {
      let value = `max-age=${config.hsts.maxAge}`
      if (config.hsts.includeSubDomains) {
        value += '; includeSubDomains'
      }
      if (config.hsts.preload) {
        value += '; preload'
      }
      headers.set('Strict-Transport-Security', value)
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Security Middleware
// ─────────────────────────────────────────────────────────────────────────────

export interface SecurityOptions {
  cors?: CorsOptions | false
  csrf?: CsrfOptions | false
  headers?: SecurityHeaders | false
}

/**
 * Create combined security middleware
 *
 * @example
 * ```ts
 * const security = createSecurityMiddleware({
 *   cors: { origin: 'https://example.com', credentials: true },
 *   csrf: { excludePaths: ['/api/webhook'] },
 *   headers: { hsts: { maxAge: 31536000 } },
 * })
 * ```
 */
export function createSecurityMiddleware(options: SecurityOptions = {}) {
  const middlewares: Array<(req: Request, next: () => Promise<Response>) => Promise<Response>> = []

  if (options.cors !== false) {
    middlewares.push(createCorsMiddleware(options.cors || {}))
  }

  if (options.csrf !== false) {
    middlewares.push(createCsrfMiddleware(options.csrf || {}))
  }

  if (options.headers !== false) {
    middlewares.push(createSecurityHeadersMiddleware(options.headers || {}))
  }

  return async (
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> => {
    let index = 0

    const runNext = async (): Promise<Response> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++]
        return middleware(request, runNext)
      }
      return next()
    }

    return runNext()
  }
}
