/**
 * Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeMiddlewareChain, redirect, json } from '../server/middleware'

describe('Middleware', () => {
  describe('executeMiddlewareChain', () => {
    it('should execute handler when no middleware', async () => {
      const handler = vi.fn().mockResolvedValue(new Response('OK'))
      const request = new Request('http://localhost/')

      const response = await executeMiddlewareChain({
        request,
        params: {},
        middlewarePaths: [],
        handler,
      })

      expect(handler).toHaveBeenCalled()
      expect(await response.text()).toBe('OK')
    })

    it('should pass params to middleware context', async () => {
      const handler = vi.fn().mockResolvedValue(new Response('OK'))
      const request = new Request('http://localhost/users/123')

      await executeMiddlewareChain({
        request,
        params: { id: '123' },
        middlewarePaths: [],
        handler,
      })

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('redirect', () => {
    it('should create redirect response with default 302 status', () => {
      const response = redirect('/login')

      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe('/login')
    })

    it('should create redirect with custom status', () => {
      const response = redirect('/new-page', 301)

      expect(response.status).toBe(301)
      expect(response.headers.get('Location')).toBe('/new-page')
    })
  })

  describe('json', () => {
    it('should create JSON response', async () => {
      const data = { name: 'John', age: 30 }
      const response = json(data)

      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(await response.json()).toEqual(data)
    })

    it('should merge custom headers', async () => {
      const response = json({ ok: true }, {
        headers: { 'X-Custom': 'value' },
      })

      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('X-Custom')).toBe('value')
    })

    it('should use custom status', async () => {
      const response = json({ error: 'Not found' }, { status: 404 })

      expect(response.status).toBe(404)
    })
  })
})
