/**
 * Router Core Module Tests
 *
 * Comprehensive tests for core routing functionality including:
 * - createLocation function and reactive location tracking
 * - matchPath algorithm and pattern matching
 * - Query string parsing
 * - Navigation state management
 * - Browser history integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLocation, matchPath } from '../core'

describe('Router Core', () => {
  let popstateListeners: Array<() => void> = []
  let originalAddEventListener: typeof window.addEventListener
  let originalRemoveEventListener: typeof window.removeEventListener

  beforeEach(() => {
    popstateListeners = []
    originalAddEventListener = window.addEventListener
    originalRemoveEventListener = window.removeEventListener

    // Mock addEventListener to track popstate listeners
    window.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'popstate') {
        popstateListeners.push(handler)
      }
    })

    window.removeEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'popstate') {
        const index = popstateListeners.indexOf(handler)
        if (index > -1) {
          popstateListeners.splice(index, 1)
        }
      }
    })

    // Reset to root path
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    window.history.replaceState({}, '', '/')
  })

  describe('createLocation', () => {
    describe('Initialization', () => {
      it('should create location signal with current pathname', () => {
        window.history.replaceState({}, '', '/users')
        const [location] = createLocation()

        expect(location().pathname).toBe('/users')
      })

      it('should create location signal with current search params', () => {
        window.history.replaceState({}, '', '/search?q=test&page=2')
        const [location] = createLocation()

        expect(location().search).toBe('?q=test&page=2')
      })

      it('should create location signal with current hash', () => {
        window.history.replaceState({}, '', '/docs#section-1')
        const [location] = createLocation()

        expect(location().hash).toBe('#section-1')
      })

      it('should parse query string into query object', () => {
        window.history.replaceState({}, '', '/items?category=books&sort=price')
        const [location] = createLocation()

        expect(location().query).toEqual({
          category: 'books',
          sort: 'price',
        })
      })

      it('should handle empty query string', () => {
        window.history.replaceState({}, '', '/home')
        const [location] = createLocation()

        expect(location().query).toEqual({})
        expect(location().search).toBe('')
      })

      it('should return navigate function', () => {
        const [, navigate] = createLocation()

        expect(typeof navigate).toBe('function')
      })
    })

    describe('Navigation', () => {
      it('should update location when navigate is called', () => {
        const [location, navigate] = createLocation()

        navigate('/about')

        expect(location().pathname).toBe('/about')
      })

      it('should update search params when navigating', () => {
        const [location, navigate] = createLocation()

        navigate('/search?q=router')

        expect(location().search).toBe('?q=router')
        expect(location().query).toEqual({ q: 'router' })
      })

      it('should update hash when navigating', () => {
        const [location, navigate] = createLocation()

        navigate('/docs#api')

        expect(location().hash).toBe('#api')
      })

      it('should push to browser history when navigating', () => {
        const pushStateSpy = vi.spyOn(window.history, 'pushState')
        const [, navigate] = createLocation()

        navigate('/new-path')

        expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/new-path')
      })

      it('should handle navigation with complex paths', () => {
        const [location, navigate] = createLocation()

        navigate('/users/123/posts/456?view=details#comments')

        expect(location().pathname).toBe('/users/123/posts/456')
        expect(location().search).toBe('?view=details')
        expect(location().hash).toBe('#comments')
        expect(location().query).toEqual({ view: 'details' })
      })

      it('should handle multiple navigations', () => {
        const [location, navigate] = createLocation()

        navigate('/page1')
        expect(location().pathname).toBe('/page1')

        navigate('/page2')
        expect(location().pathname).toBe('/page2')

        navigate('/page3')
        expect(location().pathname).toBe('/page3')
      })

      it('should handle navigation to root path', () => {
        window.history.replaceState({}, '', '/some/deep/path')
        const [location, navigate] = createLocation()

        navigate('/')

        expect(location().pathname).toBe('/')
      })
    })

    describe('Browser History Integration', () => {
      it('should register popstate event listener', () => {
        createLocation()

        expect(window.addEventListener).toHaveBeenCalledWith(
          'popstate',
          expect.any(Function)
        )
      })

      it('should update location on popstate event', () => {
        const [location] = createLocation()

        // Simulate navigation
        window.history.pushState({}, '', '/new-page')

        // Trigger popstate listeners
        popstateListeners.forEach((listener) => listener())

        expect(location().pathname).toBe('/new-page')
      })

      it('should handle multiple popstate events', () => {
        const [location] = createLocation()

        window.history.pushState({}, '', '/page1')
        popstateListeners.forEach((listener) => listener())
        expect(location().pathname).toBe('/page1')

        window.history.pushState({}, '', '/page2')
        popstateListeners.forEach((listener) => listener())
        expect(location().pathname).toBe('/page2')
      })

      it('should update query params on popstate', () => {
        const [location] = createLocation()

        window.history.pushState({}, '', '/search?filter=active')
        popstateListeners.forEach((listener) => listener())

        expect(location().query).toEqual({ filter: 'active' })
      })
    })

    describe('Query Parsing', () => {
      it('should parse single query parameter', () => {
        window.history.replaceState({}, '', '/?id=123')
        const [location] = createLocation()

        expect(location().query).toEqual({ id: '123' })
      })

      it('should parse multiple query parameters', () => {
        window.history.replaceState({}, '', '/?name=john&age=30&city=NYC')
        const [location] = createLocation()

        expect(location().query).toEqual({
          name: 'john',
          age: '30',
          city: 'NYC',
        })
      })

      it('should handle URL-encoded query values', () => {
        window.history.replaceState({}, '', '/?message=hello%20world')
        const [location] = createLocation()

        expect(location().query).toEqual({ message: 'hello world' })
      })

      it('should handle special characters in query params', () => {
        window.history.replaceState({}, '', '/?email=test%40example.com')
        const [location] = createLocation()

        expect(location().query).toEqual({ email: 'test@example.com' })
      })

      it('should handle empty query parameter values', () => {
        window.history.replaceState({}, '', '/?key=')
        const [location] = createLocation()

        expect(location().query).toEqual({ key: '' })
      })

      it('should handle query parameters without values', () => {
        window.history.replaceState({}, '', '/?standalone')
        const [location] = createLocation()

        expect(location().query).toEqual({ standalone: '' })
      })

      it('should handle duplicate query parameter keys (last wins)', () => {
        window.history.replaceState({}, '', '/?tag=javascript&tag=typescript')
        const [location] = createLocation()

        // URLSearchParams takes the last value for duplicate keys
        expect(location().query.tag).toBe('typescript')
      })
    })

    describe('Signal Reactivity', () => {
      it('should return signal that tracks changes', () => {
        const [location, navigate] = createLocation()

        const initialPath = location().pathname
        navigate('/changed')
        const newPath = location().pathname

        expect(initialPath).toBe('/')
        expect(newPath).toBe('/changed')
      })

      it('should update all location properties on navigate', () => {
        const [location, navigate] = createLocation()

        navigate('/new?foo=bar#baz')

        const loc = location()
        expect(loc.pathname).toBe('/new')
        expect(loc.search).toBe('?foo=bar')
        expect(loc.hash).toBe('#baz')
        expect(loc.query).toEqual({ foo: 'bar' })
      })

      it('should maintain signal reference across navigations', () => {
        const [location, navigate] = createLocation()

        const signal1 = location
        navigate('/page1')
        const signal2 = location

        expect(signal1).toBe(signal2)
      })
    })
  })

  describe('matchPath', () => {
    describe('Exact Path Matching', () => {
      it('should match exact paths', () => {
        const result = matchPath('/users', '/users')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({})
      })

      it('should not match different paths', () => {
        const result = matchPath('/users', '/posts')

        expect(result.matches).toBe(false)
        expect(result.params).toEqual({})
      })

      it('should match root path', () => {
        const result = matchPath('/', '/')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({})
      })

      it('should match nested paths exactly', () => {
        const result = matchPath('/users/profile', '/users/profile')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({})
      })

      it('should be case-sensitive', () => {
        const result = matchPath('/Users', '/users')

        expect(result.matches).toBe(false)
      })

      it('should not match partial paths', () => {
        const result = matchPath('/users/123', '/users')

        expect(result.matches).toBe(false)
      })

      it('should not match paths with extra segments', () => {
        const result = matchPath('/users/profile/settings', '/users/profile')

        expect(result.matches).toBe(false)
      })
    })

    describe('Dynamic Parameter Matching', () => {
      it('should extract single parameter', () => {
        const result = matchPath('/users/123', '/users/:id')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ id: '123' })
      })

      it('should extract multiple parameters', () => {
        const result = matchPath(
          '/users/42/posts/99',
          '/users/:userId/posts/:postId'
        )

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ userId: '42', postId: '99' })
      })

      it('should extract parameter at the end of path', () => {
        const result = matchPath('/profile/john', '/profile/:username')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ username: 'john' })
      })

      it('should extract parameter at the beginning of path', () => {
        const result = matchPath('/123/details', '/:id/details')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ id: '123' })
      })

      it('should extract parameter in the middle of path', () => {
        const result = matchPath('/api/v1/users', '/api/:version/users')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ version: 'v1' })
      })

      it('should handle consecutive parameters', () => {
        const result = matchPath('/users/123/456', '/users/:id/:subId')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ id: '123', subId: '456' })
      })

      it('should extract all parameters in correct order', () => {
        const result = matchPath('/a/b/c/d', '/:first/:second/:third/:fourth')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({
          first: 'a',
          second: 'b',
          third: 'c',
          fourth: 'd',
        })
      })
    })

    describe('Parameter Value Variations', () => {
      it('should match numeric parameter values', () => {
        const result = matchPath('/items/12345', '/items/:id')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ id: '12345' })
      })

      it('should match alphanumeric parameter values', () => {
        const result = matchPath('/items/abc123def', '/items/:slug')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ slug: 'abc123def' })
      })

      it('should match parameter values with hyphens', () => {
        const result = matchPath('/posts/my-awesome-post', '/posts/:slug')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ slug: 'my-awesome-post' })
      })

      it('should match parameter values with underscores', () => {
        const result = matchPath('/users/john_doe', '/users/:username')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ username: 'john_doe' })
      })

      it('should match UUID-like parameter values', () => {
        const result = matchPath(
          '/items/550e8400-e29b-41d4-a716-446655440000',
          '/items/:uuid'
        )

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({
          uuid: '550e8400-e29b-41d4-a716-446655440000',
        })
      })

      it('should match URL-encoded parameter values', () => {
        const result = matchPath('/search/hello%20world', '/search/:query')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ query: 'hello%20world' })
      })

      it('should not match parameters with forward slashes', () => {
        const result = matchPath('/users/john/doe', '/users/:username')

        expect(result.matches).toBe(false)
      })

      it('should match single character parameters', () => {
        const result = matchPath('/items/a', '/items/:id')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ id: 'a' })
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty pathname', () => {
        const result = matchPath('', '/')

        expect(result.matches).toBe(false)
      })

      it('should handle empty route path', () => {
        const result = matchPath('/users', '')

        expect(result.matches).toBe(false)
      })

      it('should not match when parameter segment is missing', () => {
        const result = matchPath('/users/', '/users/:id')

        expect(result.matches).toBe(false)
      })

      it('should handle route path with trailing slash', () => {
        const result = matchPath('/users', '/users/')

        expect(result.matches).toBe(false)
      })

      it('should handle pathname with trailing slash', () => {
        const result = matchPath('/users/', '/users')

        expect(result.matches).toBe(false)
      })

      it('should match when both have trailing slashes', () => {
        const result = matchPath('/users/', '/users/')

        expect(result.matches).toBe(true)
      })

      it('should handle very long paths', () => {
        const longPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p'
        const routePath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p'
        const result = matchPath(longPath, routePath)

        expect(result.matches).toBe(true)
      })

      it('should handle multiple parameters in long paths', () => {
        const result = matchPath(
          '/api/v1/users/123/posts/456/comments/789',
          '/api/:version/users/:userId/posts/:postId/comments/:commentId'
        )

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({
          version: 'v1',
          userId: '123',
          postId: '456',
          commentId: '789',
        })
      })
    })

    describe('Parameter Names', () => {
      it('should handle parameter names with underscores', () => {
        const result = matchPath('/users/123', '/users/:user_id')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ user_id: '123' })
      })

      it('should handle parameter names with numbers', () => {
        const result = matchPath('/items/abc', '/items/:id1')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ id1: 'abc' })
      })

      it('should handle CamelCase parameter names', () => {
        const result = matchPath('/users/123', '/users/:userId')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ userId: '123' })
      })

      it('should preserve parameter name exactly as specified', () => {
        const result = matchPath('/data/test', '/data/:MyParamName')

        expect(result.matches).toBe(true)
        expect(result.params).toEqual({ MyParamName: 'test' })
      })
    })

    describe('Return Value Structure', () => {
      it('should always return an object with matches and params', () => {
        const result = matchPath('/test', '/test')

        expect(result).toHaveProperty('matches')
        expect(result).toHaveProperty('params')
      })

      it('should return false matches with empty params on no match', () => {
        const result = matchPath('/foo', '/bar')

        expect(result.matches).toBe(false)
        expect(result.params).toEqual({})
      })

      it('should return true matches with params object on match', () => {
        const result = matchPath('/users/123', '/users/:id')

        expect(result.matches).toBe(true)
        expect(typeof result.params).toBe('object')
        expect(result.params).not.toBeNull()
      })
    })
  })
})
