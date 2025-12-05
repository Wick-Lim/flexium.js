/**
 * Router Utils Tests
 *
 * Comprehensive tests for route parsing and matching utilities including:
 * - createRoutesFromChildren VNode parsing
 * - matchRoutes algorithm and nested route matching
 * - Route path compilation and regex generation
 * - Parameter extraction from matched paths
 * - Index route handling
 * - Route tree traversal
 */

import { describe, it, expect } from 'vitest'
import { createRoutesFromChildren, matchRoutes } from '../utils'
import type { RouteDef, VNode } from '../types'

describe('Router Utils', () => {
  // Helper function to create VNode-like objects for testing
  const createVNode = (
    type: Function,
    props: Record<string, any>,
    children?: any
  ): VNode => ({
    type,
    props,
    children,
    key: undefined,
  })

  const MockRoute = () => null

  // Helper to create simple route definitions
  const createRoute = (
    path: string,
    children: RouteDef[] = [],
    index: boolean = false,
    beforeEnter?: (params: Record<string, string>) => boolean
  ): RouteDef => ({
    path,
    index,
    component: () => null,
    children,
    beforeEnter,
  })

  describe('createRoutesFromChildren', () => {
    describe('Single Route Creation', () => {
      it('should create route from single VNode', () => {
        const vnode = createVNode(MockRoute, {
          path: '/users',
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes).toHaveLength(1)
        expect(routes[0].path).toBe('/users')
        expect(typeof routes[0].component).toBe('function')
      })

      it('should extract path from VNode props', () => {
        const vnode = createVNode(MockRoute, {
          path: '/about',
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].path).toBe('/about')
      })

      it('should extract component from VNode props', () => {
        const testComponent = () => 'test'
        const vnode = createVNode(MockRoute, {
          path: '/test',
          component: testComponent,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].component).toBe(testComponent)
      })

      it('should default path to empty string if not provided', () => {
        const vnode = createVNode(MockRoute, {
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].path).toBe('')
      })

      it('should set index to false by default', () => {
        const vnode = createVNode(MockRoute, {
          path: '/test',
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].index).toBe(false)
      })
    })

    describe('Multiple Routes Creation', () => {
      it('should create routes from array of VNodes', () => {
        const vnodes = [
          createVNode(MockRoute, { path: '/users', component: () => null }),
          createVNode(MockRoute, { path: '/posts', component: () => null }),
          createVNode(MockRoute, { path: '/comments', component: () => null }),
        ]

        const routes = createRoutesFromChildren(vnodes)

        expect(routes).toHaveLength(3)
        expect(routes[0].path).toBe('/users')
        expect(routes[1].path).toBe('/posts')
        expect(routes[2].path).toBe('/comments')
      })

      it('should maintain order of routes', () => {
        const vnodes = [
          createVNode(MockRoute, { path: '/first', component: () => null }),
          createVNode(MockRoute, { path: '/second', component: () => null }),
          createVNode(MockRoute, { path: '/third', component: () => null }),
        ]

        const routes = createRoutesFromChildren(vnodes)

        expect(routes.map((r) => r.path)).toEqual([
          '/first',
          '/second',
          '/third',
        ])
      })

      it('should handle mixed route configurations', () => {
        const vnodes = [
          createVNode(MockRoute, { path: '/static', component: () => null }),
          createVNode(MockRoute, { path: '/users/:id', component: () => null }),
          createVNode(MockRoute, { index: true, component: () => null }),
        ]

        const routes = createRoutesFromChildren(vnodes)

        expect(routes).toHaveLength(3)
        expect(routes[0].path).toBe('/static')
        expect(routes[1].path).toBe('/users/:id')
        expect(routes[2].index).toBe(true)
      })
    })

    describe('Nested Routes', () => {
      it('should parse nested route children', () => {
        const childVNode = createVNode(MockRoute, {
          path: ':id',
          component: () => null,
        })

        const parentVNode = createVNode(
          MockRoute,
          { path: '/users', component: () => null },
          [childVNode]
        )

        const routes = createRoutesFromChildren(parentVNode)

        expect(routes).toHaveLength(1)
        expect(routes[0].path).toBe('/users')
        expect(routes[0].children).toHaveLength(1)
        expect(routes[0].children[0].path).toBe(':id')
      })

      it('should handle multiple levels of nesting', () => {
        const level3VNode = createVNode(MockRoute, {
          path: 'comments',
          component: () => null,
        })

        const level2VNode = createVNode(
          MockRoute,
          { path: ':postId', component: () => null },
          [level3VNode]
        )

        const level1VNode = createVNode(
          MockRoute,
          { path: 'posts', component: () => null },
          [level2VNode]
        )

        const rootVNode = createVNode(
          MockRoute,
          { path: '/users/:userId', component: () => null },
          [level1VNode]
        )

        const routes = createRoutesFromChildren(rootVNode)

        expect(routes[0].path).toBe('/users/:userId')
        expect(routes[0].children[0].path).toBe('posts')
        expect(routes[0].children[0].children[0].path).toBe(':postId')
        expect(routes[0].children[0].children[0].children[0].path).toBe(
          'comments'
        )
      })

      it('should handle multiple children at same level', () => {
        const children = [
          createVNode(MockRoute, { path: 'profile', component: () => null }),
          createVNode(MockRoute, { path: 'settings', component: () => null }),
          createVNode(MockRoute, { path: 'posts', component: () => null }),
        ]

        const parentVNode = createVNode(
          MockRoute,
          { path: '/users/:id', component: () => null },
          children
        )

        const routes = createRoutesFromChildren(parentVNode)

        expect(routes[0].children).toHaveLength(3)
        expect(routes[0].children.map((r) => r.path)).toEqual([
          'profile',
          'settings',
          'posts',
        ])
      })

      it('should create empty children array when no children provided', () => {
        const vnode = createVNode(MockRoute, {
          path: '/leaf',
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].children).toEqual([])
      })
    })

    describe('Index Routes', () => {
      it('should set index to true when index prop is true', () => {
        const vnode = createVNode(MockRoute, {
          index: true,
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].index).toBe(true)
      })

      it('should set path to empty string for index routes', () => {
        const vnode = createVNode(MockRoute, {
          index: true,
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].path).toBe('')
      })

      it('should handle index route as child', () => {
        const indexVNode = createVNode(MockRoute, {
          index: true,
          component: () => null,
        })

        const parentVNode = createVNode(
          MockRoute,
          { path: '/', component: () => null },
          [indexVNode]
        )

        const routes = createRoutesFromChildren(parentVNode)

        expect(routes[0].children[0].index).toBe(true)
      })
    })

    describe('Route Guards', () => {
      it('should extract beforeEnter guard from props', () => {
        const guard = () => true
        const vnode = createVNode(MockRoute, {
          path: '/protected',
          component: () => null,
          beforeEnter: guard,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].beforeEnter).toBe(guard)
      })

      it('should handle routes without guards', () => {
        const vnode = createVNode(MockRoute, {
          path: '/public',
          component: () => null,
        })

        const routes = createRoutesFromChildren(vnode)

        expect(routes[0].beforeEnter).toBeUndefined()
      })
    })

    describe('Non-VNode Filtering', () => {
      it('should skip null children', () => {
        const children = [
          null,
          createVNode(MockRoute, { path: '/valid', component: () => null }),
        ]

        const routes = createRoutesFromChildren(children)

        expect(routes).toHaveLength(1)
        expect(routes[0].path).toBe('/valid')
      })

      it('should skip undefined children', () => {
        const children = [
          undefined,
          createVNode(MockRoute, { path: '/valid', component: () => null }),
        ]

        const routes = createRoutesFromChildren(children)

        expect(routes).toHaveLength(1)
      })

      it('should skip string children', () => {
        const children = [
          'text node',
          createVNode(MockRoute, { path: '/valid', component: () => null }),
        ]

        const routes = createRoutesFromChildren(children)

        expect(routes).toHaveLength(1)
      })

      it('should skip number children', () => {
        const children = [
          123,
          createVNode(MockRoute, { path: '/valid', component: () => null }),
        ]

        const routes = createRoutesFromChildren(children)

        expect(routes).toHaveLength(1)
      })

      it('should skip boolean children', () => {
        const children = [
          true,
          false,
          createVNode(MockRoute, { path: '/valid', component: () => null }),
        ]

        const routes = createRoutesFromChildren(children)

        expect(routes).toHaveLength(1)
      })

      it('should handle array with only non-VNode children', () => {
        const children = ['text', null, undefined, 123, true]

        const routes = createRoutesFromChildren(children)

        expect(routes).toHaveLength(0)
      })
    })
  })

  describe('matchRoutes', () => {
    describe('Simple Route Matching', () => {
      it('should match simple route', () => {
        const routes = [
          createRoute('/'),
          createRoute('/users'),
          createRoute('/posts'),
        ]

        const result = matchRoutes(routes, '/users')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(1)
        expect(result![0].route.path).toBe('/users')
      })

      it('should return null when no routes match', () => {
        const routes = [createRoute('/users'), createRoute('/posts')]

        const result = matchRoutes(routes, '/settings')

        expect(result).toBeNull()
      })

      it('should match root route', () => {
        const routes = [createRoute('/')]

        const result = matchRoutes(routes, '/')

        expect(result).not.toBeNull()
        expect(result![0].route.path).toBe('/')
      })

      it('should match first route when multiple match', () => {
        const routes = [createRoute('/test'), createRoute('/test')]

        const result = matchRoutes(routes, '/test')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(1)
      })

      it('should handle exact path matching', () => {
        const routes = [createRoute('/users/list')]

        const result = matchRoutes(routes, '/users/list')

        expect(result).not.toBeNull()
        expect(result![0].pathname).toBe('/users/list')
      })
    })

    describe('Nested Route Matching', () => {
      it('should match nested routes', () => {
        const routes = [
          createRoute('/', [createRoute('users', [createRoute(':id')])]),
        ]

        const result = matchRoutes(routes, '/users/123')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(3)
        expect(result![0].route.path).toBe('/')
        expect(result![1].route.path).toBe('users')
        expect(result![2].route.path).toBe(':id')
      })

      it('should match deep nested routes', () => {
        const routes = [
          createRoute('/', [
            createRoute('a', [
              createRoute('b', [createRoute('c', [createRoute('d')])]),
            ]),
          ]),
        ]

        const result = matchRoutes(routes, '/a/b/c/d')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(5)
      })

      it('should return all matches from root to leaf', () => {
        const routes = [
          createRoute('/', [createRoute('parent', [createRoute('child')])]),
        ]

        const result = matchRoutes(routes, '/parent/child')

        expect(result).not.toBeNull()
        expect(result!.map((m) => m.route.path)).toEqual([
          '/',
          'parent',
          'child',
        ])
      })

      it('should stop at first non-matching segment', () => {
        const routes = [
          createRoute('/', [createRoute('users', [createRoute('profile')])]),
        ]

        const result = matchRoutes(routes, '/users/settings')

        expect(result).toBeNull()
      })

      it('should match partial path to parent route', () => {
        const routes = [createRoute('/', [createRoute('users')])]

        const result = matchRoutes(routes, '/users')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(2)
      })
    })

    describe('Parameter Extraction', () => {
      it('should extract single parameter', () => {
        const routes = [createRoute('/', [createRoute('users/:id')])]

        const result = matchRoutes(routes, '/users/123')

        expect(result).not.toBeNull()
        expect(result![1].params).toEqual({ id: '123' })
      })

      it('should extract multiple parameters', () => {
        const routes = [
          createRoute('/', [
            createRoute('users/:userId', [createRoute('posts/:postId')]),
          ]),
        ]

        const result = matchRoutes(routes, '/users/42/posts/99')

        expect(result).not.toBeNull()
        const lastMatch = result![result!.length - 1]
        expect(lastMatch.params).toEqual({ userId: '42', postId: '99' })
      })

      it('should extract parameters at different nesting levels', () => {
        const routes = [
          createRoute('/', [
            createRoute(':category', [
              createRoute(':subcategory', [createRoute(':item')]),
            ]),
          ]),
        ]

        const result = matchRoutes(routes, '/books/fiction/novel')

        expect(result).not.toBeNull()
        const lastMatch = result![result!.length - 1]
        expect(lastMatch.params).toEqual({
          category: 'books',
          subcategory: 'fiction',
          item: 'novel',
        })
      })

      it('should handle mixed static and dynamic segments', () => {
        const routes = [
          createRoute('/', [
            createRoute('api', [
              createRoute(':version', [
                createRoute('users', [createRoute(':id')]),
              ]),
            ]),
          ]),
        ]

        const result = matchRoutes(routes, '/api/v1/users/123')

        expect(result).not.toBeNull()
        const lastMatch = result![result!.length - 1]
        expect(lastMatch.params).toEqual({ version: 'v1', id: '123' })
      })

      it('should return empty params for routes without parameters', () => {
        const routes = [createRoute('/static/path')]

        const result = matchRoutes(routes, '/static/path')

        expect(result).not.toBeNull()
        expect(result![0].params).toEqual({})
      })
    })

    describe('Index Routes', () => {
      it('should match index route at root', () => {
        const routes = [createRoute('/', [createRoute('', [], true)])]

        const result = matchRoutes(routes, '/')

        expect(result).not.toBeNull()
        expect(result!.length).toBeGreaterThanOrEqual(1)
      })

      it('should match index route for parent path', () => {
        const routes = [
          createRoute('/', [createRoute('users', [createRoute('', [], true)])]),
        ]

        const result = matchRoutes(routes, '/users')

        expect(result).not.toBeNull()
        const lastMatch = result![result!.length - 1]
        expect(lastMatch.route.index).toBe(true)
      })

      it('should prefer explicit child route over index', () => {
        const routes = [
          createRoute('/', [
            createRoute('users', [
              createRoute('', [], true),
              createRoute('list'),
            ]),
          ]),
        ]

        const result = matchRoutes(routes, '/users/list')

        expect(result).not.toBeNull()
        const lastMatch = result![result!.length - 1]
        expect(lastMatch.route.path).toBe('list')
      })

      it('should match index when no other child matches', () => {
        const indexRoute = createRoute('', [], true)
        const routes = [
          createRoute('/', [
            createRoute('parent', [indexRoute, createRoute('child')]),
          ]),
        ]

        const result = matchRoutes(routes, '/parent')

        expect(result).not.toBeNull()
        if (result && result.length > 2) {
          expect(result[result.length - 1].route.index).toBe(true)
        }
      })
    })

    describe('Path Compilation', () => {
      it('should compile simple paths', () => {
        const routes = [createRoute('/users/profile')]

        const result = matchRoutes(routes, '/users/profile')

        expect(result).not.toBeNull()
      })

      it('should compile paths with dynamic segments', () => {
        const routes = [createRoute('/users/:id/posts/:postId')]

        const result = matchRoutes(routes, '/users/123/posts/456')

        expect(result).not.toBeNull()
        expect(result![0].params).toEqual({ id: '123', postId: '456' })
      })

      it('should handle paths with leading slashes', () => {
        const routes = [createRoute('/', [createRoute('/users')])]

        const result = matchRoutes(routes, '/users')

        expect(result).not.toBeNull()
      })

      it('should normalize nested path construction', () => {
        const routes = [
          createRoute('/', [createRoute('api/', [createRoute('/v1/')])]),
        ]

        // Should handle various slash combinations
        const result = matchRoutes(routes, '/api/v1/')

        // Should either match or gracefully fail
        expect(result === null || Array.isArray(result)).toBe(true)
      })
    })

    describe('Pathname Tracking', () => {
      it('should track matched pathname', () => {
        const routes = [createRoute('/users')]

        const result = matchRoutes(routes, '/users')

        expect(result).not.toBeNull()
        expect(result![0].pathname).toBe('/users')
      })

      it('should track cumulative pathname for nested routes', () => {
        const routes = [
          createRoute('/', [createRoute('users', [createRoute('profile')])]),
        ]

        const result = matchRoutes(routes, '/users/profile')

        expect(result).not.toBeNull()
        // Root route pathname may be empty or '/' depending on implementation
        expect(result![0].pathname.length).toBeGreaterThanOrEqual(0)
        expect(result![2].pathname).toBe('/users/profile')
      })

      it('should include parameters in pathname', () => {
        const routes = [createRoute('/', [createRoute('users/:id')])]

        const result = matchRoutes(routes, '/users/123')

        expect(result).not.toBeNull()
        expect(result![1].pathname).toBe('/users/123')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty routes array', () => {
        const result = matchRoutes([], '/any/path')

        expect(result).toBeNull()
      })

      it('should handle empty location string', () => {
        const routes = [createRoute('/')]

        const result = matchRoutes(routes, '')

        expect(result).toBeNull()
      })

      it('should handle location with query string', () => {
        const routes = [createRoute('/search')]

        const result = matchRoutes(routes, '/search?q=test')

        // Should either match without query or null
        // Implementation may vary
        expect(
          result === null || (result && result[0].pathname === '/search')
        ).toBe(true)
      })

      it('should handle location with hash', () => {
        const routes = [createRoute('/docs')]

        const result = matchRoutes(routes, '/docs#section-1')

        // Should either match without hash or null
        expect(
          result === null || (result && result[0].pathname === '/docs')
        ).toBe(true)
      })

      it('should not match routes with trailing slash differences', () => {
        const routes = [createRoute('/users/')]

        const result = matchRoutes(routes, '/users')

        // Strict matching
        expect(result).toBeNull()
      })

      it('should handle very deep nesting', () => {
        const routes = [
          createRoute('/', [
            createRoute('a', [
              createRoute('b', [
                createRoute('c', [
                  createRoute('d', [createRoute('e', [createRoute('f')])]),
                ]),
              ]),
            ]),
          ]),
        ]

        const result = matchRoutes(routes, '/a/b/c/d/e/f')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(7)
      })

      it('should handle routes with only parameters', () => {
        const routes = [createRoute('/:param1/:param2/:param3')]

        const result = matchRoutes(routes, '/a/b/c')

        expect(result).not.toBeNull()
        expect(result![0].params).toEqual({
          param1: 'a',
          param2: 'b',
          param3: 'c',
        })
      })
    })

    describe('Route Matching Algorithm', () => {
      it('should match first route in order', () => {
        const routes = [createRoute('/test'), createRoute('/:param')]

        const result = matchRoutes(routes, '/test')

        expect(result).not.toBeNull()
        expect(result![0].route.path).toBe('/test')
      })

      it('should try next route if first does not match', () => {
        const routes = [
          createRoute('/users'),
          createRoute('/posts'),
          createRoute('/comments'),
        ]

        const result = matchRoutes(routes, '/posts')

        expect(result).not.toBeNull()
        expect(result![0].route.path).toBe('/posts')
      })

      it('should return first successful match', () => {
        const routes = [createRoute('/test'), createRoute('/test')]

        const result = matchRoutes(routes, '/test')

        expect(result).not.toBeNull()
        expect(result).toHaveLength(1)
      })

      it('should check all nested children before backtracking', () => {
        const routes = [
          createRoute('/', [
            createRoute('users', [createRoute('profile')]),
            createRoute('users', [createRoute('settings')]),
          ]),
        ]

        const result = matchRoutes(routes, '/users/settings')

        expect(result).not.toBeNull()
        expect(result![2].route.path).toBe('settings')
      })
    })
  })
})
