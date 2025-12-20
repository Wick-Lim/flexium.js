/**
 * P1 Server Features Tests
 * - Static file serving
 * - Security middleware (CORS, CSRF, headers)
 * - Cache control
 * - Streaming SSR
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Static
import { createStaticHandler } from '../server/static'

// Security
import {
  createCorsMiddleware,
  createCsrfMiddleware,
  createSecurityHeadersMiddleware,
  generateCsrfToken,
} from '../server/security'

// Cache
import {
  buildCacheControl,
  withCache,
  withETag,
  CACHE_NO_STORE,
  CACHE_SHORT,
  CACHE_STATIC,
  CACHE_ISR,
} from '../server/cache'

// Streaming
import {
  createStreamingContext,
  streamingPlaceholder,
} from '../server/streaming'

const TEST_DIR = path.join(__dirname, '__static_test__')

describe('Static File Serving', () => {
  beforeEach(async () => {
    await fs.promises.mkdir(TEST_DIR, { recursive: true })
    await fs.promises.writeFile(path.join(TEST_DIR, 'test.txt'), 'Hello World')
    await fs.promises.writeFile(path.join(TEST_DIR, 'test.html'), '<h1>Hello</h1>')
    await fs.promises.mkdir(path.join(TEST_DIR, 'subdir'), { recursive: true })
    await fs.promises.writeFile(path.join(TEST_DIR, 'subdir', 'nested.js'), 'console.log("hi")')
  })

  afterEach(async () => {
    await fs.promises.rm(TEST_DIR, { recursive: true, force: true })
  })

  it('should serve static files with correct MIME type', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR })
    const request = new Request('http://localhost/test.txt')
    const result = await handler(request)

    expect(result.served).toBe(true)
    expect(result.response.status).toBe(200)
    expect(result.response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')

    const text = await result.response.text()
    expect(text).toBe('Hello World')
  })

  it('should return 304 for conditional requests with matching ETag', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR })

    // First request to get ETag
    const req1 = new Request('http://localhost/test.txt')
    const res1 = await handler(req1)
    const etag = res1.response.headers.get('ETag')

    // Second request with If-None-Match
    const req2 = new Request('http://localhost/test.txt', {
      headers: { 'If-None-Match': etag! },
    })
    const res2 = await handler(req2)

    expect(res2.response.status).toBe(304)
  })

  it('should return 206 for Range requests', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR })
    const request = new Request('http://localhost/test.txt', {
      headers: { Range: 'bytes=0-4' },
    })
    const result = await handler(request)

    expect(result.served).toBe(true)
    expect(result.response.status).toBe(206)
    expect(result.response.headers.get('Content-Range')).toMatch(/^bytes 0-4\/\d+$/)

    const text = await result.response.text()
    expect(text).toBe('Hello')
  })

  it('should return 416 for invalid Range requests', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR })
    const request = new Request('http://localhost/test.txt', {
      headers: { Range: 'bytes=1000-2000' },
    })
    const result = await handler(request)

    expect(result.served).toBe(true)
    expect(result.response.status).toBe(416)
  })

  it('should prevent directory traversal attacks', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR })
    // URL-encoded path traversal: %2e%2e = ..
    const request = new Request('http://localhost/%2e%2e/%2e%2e/etc/passwd')
    const result = await handler(request)

    // Path traversal attempts should be safely handled:
    // - Either blocked with 403 (if path escapes publicDir)
    // - Or not served (normalized path doesn't match any file)
    if (result.served) {
      expect(result.response.status).toBe(403)
    } else {
      // Path was sanitized and file doesn't exist - this is safe
      expect(result.served).toBe(false)
    }
  })

  it('should serve files from subdirectories', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR })
    const request = new Request('http://localhost/subdir/nested.js')
    const result = await handler(request)

    expect(result.served).toBe(true)
    expect(result.response.headers.get('Content-Type')).toBe('text/javascript; charset=utf-8')
  })

  it('should handle prefix option', async () => {
    const handler = createStaticHandler({ publicDir: TEST_DIR, prefix: '/static' })

    // Request without prefix should not be served
    const req1 = new Request('http://localhost/test.txt')
    const res1 = await handler(req1)
    expect(res1.served).toBe(false)

    // Request with prefix should be served
    const req2 = new Request('http://localhost/static/test.txt')
    const res2 = await handler(req2)
    expect(res2.served).toBe(true)
  })
})

describe('Security Middleware', () => {
  describe('CORS', () => {
    it('should add CORS headers for allowed origins', async () => {
      const cors = createCorsMiddleware({
        origin: 'https://example.com',
        credentials: true,
      })

      const request = new Request('http://localhost/api', {
        headers: { Origin: 'https://example.com' },
      })

      const response = await cors(request, async () => new Response('OK'))

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('should handle preflight requests', async () => {
      const cors = createCorsMiddleware({
        origin: 'https://example.com',
        methods: ['GET', 'POST'],
      })

      const request = new Request('http://localhost/api', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://example.com',
          'Access-Control-Request-Method': 'POST',
        },
      })

      const response = await cors(request, async () => new Response('OK'))

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    it('should allow array of origins', async () => {
      const cors = createCorsMiddleware({
        origin: ['https://a.com', 'https://b.com'],
      })

      const req1 = new Request('http://localhost/', {
        headers: { Origin: 'https://a.com' },
      })
      const res1 = await cors(req1, async () => new Response('OK'))
      expect(res1.headers.get('Access-Control-Allow-Origin')).toBe('https://a.com')

      const req2 = new Request('http://localhost/', {
        headers: { Origin: 'https://c.com' },
      })
      const res2 = await cors(req2, async () => new Response('OK'))
      expect(res2.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('should support origin as function', async () => {
      const cors = createCorsMiddleware({
        origin: (origin) => origin.endsWith('.example.com'),
      })

      const req1 = new Request('http://localhost/', {
        headers: { Origin: 'https://app.example.com' },
      })
      const res1 = await cors(req1, async () => new Response('OK'))
      expect(res1.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com')
    })
  })

  describe('CSRF', () => {
    it('should generate secure tokens', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()

      expect(token1).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token1).not.toBe(token2)
    })

    it('should skip safe methods', async () => {
      const csrf = createCsrfMiddleware()

      const request = new Request('http://localhost/api', { method: 'GET' })
      const response = await csrf(request, async () => new Response('OK'))

      expect(response.status).toBe(200)
    })

    it('should reject POST without CSRF token', async () => {
      const csrf = createCsrfMiddleware()

      const request = new Request('http://localhost/api', { method: 'POST' })
      const response = await csrf(request, async () => new Response('OK'))

      expect(response.status).toBe(403)
    })

    it('should accept valid CSRF token', async () => {
      const csrf = createCsrfMiddleware()
      const token = generateCsrfToken()

      const request = new Request('http://localhost/api', {
        method: 'POST',
        headers: {
          Cookie: `_csrf=${token}`,
          'X-CSRF-Token': token,
        },
      })

      const response = await csrf(request, async () => new Response('OK'))
      expect(response.status).toBe(200)
    })

    it('should exclude specified paths', async () => {
      const csrf = createCsrfMiddleware({
        excludePaths: ['/api/webhook'],
      })

      const request = new Request('http://localhost/api/webhook', { method: 'POST' })
      const response = await csrf(request, async () => new Response('OK'))

      expect(response.status).toBe(200)
    })
  })

  describe('Security Headers', () => {
    it('should add default security headers', async () => {
      const middleware = createSecurityHeadersMiddleware()

      const request = new Request('http://localhost/')
      const response = await middleware(request, async () => new Response('OK'))

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    })

    it('should add HSTS header when configured', async () => {
      const middleware = createSecurityHeadersMiddleware({
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      })

      const request = new Request('http://localhost/')
      const response = await middleware(request, async () => new Response('OK'))

      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      )
    })

    it('should add CSP header when configured', async () => {
      const middleware = createSecurityHeadersMiddleware({
        csp: "default-src 'self'",
      })

      const request = new Request('http://localhost/')
      const response = await middleware(request, async () => new Response('OK'))

      expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'")
    })
  })
})

describe('Cache Control', () => {
  describe('buildCacheControl', () => {
    it('should build Cache-Control header from options', () => {
      expect(buildCacheControl({ public: true, maxAge: 3600 })).toBe('public, max-age=3600')
      expect(buildCacheControl({ private: true, noCache: true })).toBe('private, no-cache')
      expect(buildCacheControl(CACHE_STATIC)).toBe('public, immutable, max-age=31536000')
    })

    it('should build ISR-style cache header', () => {
      const header = buildCacheControl(CACHE_ISR)
      expect(header).toContain('public')
      expect(header).toContain('max-age=60')
      expect(header).toContain('s-maxage=3600')
      expect(header).toContain('stale-while-revalidate=86400')
    })
  })

  describe('withCache', () => {
    it('should add Cache-Control header to response', () => {
      const original = new Response('Hello')
      const cached = withCache(original, CACHE_SHORT)

      expect(cached.headers.get('Cache-Control')).toContain('max-age=60')
    })
  })

  describe('withETag', () => {
    it('should add ETag header', () => {
      const response = withETag(new Response('Hello'), 'Hello')
      expect(response.headers.get('ETag')).toBeTruthy()
    })

    it('should return 304 for matching ETag', () => {
      const content = 'Hello World'
      const response1 = withETag(new Response(content), content)
      const etag = response1.headers.get('ETag')!

      const request = new Request('http://localhost/', {
        headers: { 'If-None-Match': etag },
      })
      const response2 = withETag(new Response(content), content, request)

      expect(response2.status).toBe(304)
    })
  })

  describe('Presets', () => {
    it('should have correct NO_STORE preset', () => {
      expect(CACHE_NO_STORE.noStore).toBe(true)
      expect(CACHE_NO_STORE.noCache).toBe(true)
      expect(CACHE_NO_STORE.mustRevalidate).toBe(true)
    })

    it('should have correct STATIC preset for immutable assets', () => {
      expect(CACHE_STATIC.public).toBe(true)
      expect(CACHE_STATIC.maxAge).toBe(31536000)
      expect(CACHE_STATIC.immutable).toBe(true)
    })
  })
})

describe('Streaming SSR', () => {
  describe('createStreamingContext', () => {
    it('should create a streaming context', () => {
      const ctx = createStreamingContext()

      expect(ctx.hasPendingChunks()).toBe(false)
      expect(ctx.getPendingChunks()).toEqual([])
    })

    it('should register and track chunks', () => {
      const ctx = createStreamingContext()

      const id = ctx.registerChunk({
        id: 'test-chunk',
        loader: async () => ({ type: 'div', props: {}, children: ['Hello'] }),
      })

      expect(id).toBe('test-chunk')
      expect(ctx.hasPendingChunks()).toBe(true)
      expect(ctx.getPendingChunks()).toHaveLength(1)
    })

    it('should auto-generate chunk IDs', () => {
      const ctx = createStreamingContext()

      const id1 = ctx.registerChunk({
        id: '',
        loader: async () => null,
      })
      const id2 = ctx.registerChunk({
        id: '',
        loader: async () => null,
      })

      expect(id1).toMatch(/^chunk-\d+$/)
      expect(id2).toMatch(/^chunk-\d+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('streamingPlaceholder', () => {
    it('should create a placeholder element', () => {
      const placeholder = streamingPlaceholder({
        id: 'my-chunk',
        loader: async () => null,
      })

      expect(placeholder).toMatchObject({
        type: 'div',
        props: {
          id: 'flexism-chunk-my-chunk',
          'data-streaming': 'true',
        },
      })
    })
  })
})
