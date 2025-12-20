/**
 * Router Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Router, createRouter } from '../server/router'

// Mock manifest for testing
const mockManifest = {
  routes: [
    { path: '/', exportName: 'default', type: 'component', fileType: 'page', hydrateProps: [], middlewares: [], layouts: [] },
    { path: '/about', exportName: 'default', type: 'component', fileType: 'page', hydrateProps: [], middlewares: [], layouts: [] },
    { path: '/users/:id', exportName: 'default', type: 'component', fileType: 'page', hydrateProps: [], middlewares: [], layouts: [] },
    { path: '/blog/:...slug', exportName: 'default', type: 'component', fileType: 'page', hydrateProps: [], middlewares: [], layouts: [] },
    { path: '/api/users', exportName: 'GET', type: 'api', fileType: 'route', hydrateProps: [], middlewares: [], layouts: [] },
    { path: '/api/users/:id', exportName: 'GET', type: 'api', fileType: 'route', hydrateProps: [], middlewares: [], layouts: [] },
  ],
}

describe('Router', () => {
  describe('Pattern Matching', () => {
    it('should match static routes', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore - accessing private for testing
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/')
      expect(match).not.toBeNull()
      expect(match?.route.path).toBe('/')
      expect(match?.params).toEqual({})
    })

    it('should match static routes with path', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/about')
      expect(match).not.toBeNull()
      expect(match?.route.path).toBe('/about')
    })

    it('should match dynamic routes with single param', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/users/123')
      expect(match).not.toBeNull()
      expect(match?.route.path).toBe('/users/:id')
      expect(match?.params).toEqual({ id: '123' })
    })

    it('should match catch-all routes', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/blog/2024/01/hello-world')
      expect(match).not.toBeNull()
      expect(match?.route.path).toBe('/blog/:...slug')
      expect(match?.params).toEqual({ slug: '2024/01/hello-world' })
    })

    it('should return null for non-matching routes', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/nonexistent')
      expect(match).toBeNull()
    })

    it('should decode URL-encoded params', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/users/hello%20world')
      expect(match?.params).toEqual({ id: 'hello world' })
    })

    it('should normalize trailing slashes', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/about/')
      expect(match).not.toBeNull()
      expect(match?.route.path).toBe('/about')
    })

    it('should match API routes', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest
      // @ts-ignore
      router.compilePatterns()

      const match = router.match('/api/users')
      expect(match).not.toBeNull()
      expect(match?.route.type).toBe('api')

      const matchWithParam = router.match('/api/users/456')
      expect(matchWithParam).not.toBeNull()
      expect(matchWithParam?.params).toEqual({ id: '456' })
    })
  })

  describe('getRoutes', () => {
    it('should return all routes', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      // @ts-ignore
      router.manifest = mockManifest

      const routes = router.getRoutes()
      expect(routes).toHaveLength(6)
    })

    it('should return empty array when no manifest', () => {
      const router = new Router({ manifestPath: '/test/manifest.json' })
      const routes = router.getRoutes()
      expect(routes).toEqual([])
    })
  })

  describe('createRouter factory', () => {
    it('should create a router instance', () => {
      const router = createRouter({ manifestPath: '/test/manifest.json' })
      expect(router).toBeInstanceOf(Router)
    })
  })
})
