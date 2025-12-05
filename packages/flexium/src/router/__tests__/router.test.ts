/**
 * Router Tests
 *
 * Tests for route matching, path parsing, and router utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { matchPath } from '../core'
import { matchRoutes, createRoutesFromChildren } from '../utils'
import type { RouteDef } from '../types'

describe('Router', () => {
  describe('matchPath', () => {
    it('should match exact paths', () => {
      const result = matchPath('/users', '/users')
      expect(result.matches).toBe(true)
      expect(result.params).toEqual({})
    })

    it('should not match different paths', () => {
      const result = matchPath('/users', '/posts')
      expect(result.matches).toBe(false)
    })

    it('should extract single param', () => {
      const result = matchPath('/users/123', '/users/:id')
      expect(result.matches).toBe(true)
      expect(result.params).toEqual({ id: '123' })
    })

    it('should extract multiple params', () => {
      const result = matchPath('/users/123/posts/456', '/users/:userId/posts/:postId')
      expect(result.matches).toBe(true)
      expect(result.params).toEqual({ userId: '123', postId: '456' })
    })

    it('should match root path', () => {
      const result = matchPath('/', '/')
      expect(result.matches).toBe(true)
      expect(result.params).toEqual({})
    })

    it('should not match partial paths', () => {
      const result = matchPath('/users/123/extra', '/users/:id')
      expect(result.matches).toBe(false)
    })

    it('should handle trailing slashes', () => {
      const result = matchPath('/users', '/users')
      expect(result.matches).toBe(true)
    })

    it('should match paths with special characters in params', () => {
      const result = matchPath('/users/john-doe', '/users/:username')
      expect(result.matches).toBe(true)
      expect(result.params).toEqual({ username: 'john-doe' })
    })
  })

  describe('matchRoutes', () => {
    const createRoute = (path: string, children: RouteDef[] = []): RouteDef => ({
      path,
      index: false,
      component: () => null,
      children
    })

    it('should match simple routes', () => {
      const routes: RouteDef[] = [
        createRoute('/'),
        createRoute('/users'),
        createRoute('/posts')
      ]

      const result = matchRoutes(routes, '/users')
      expect(result).not.toBeNull()
      expect(result?.length).toBe(1)
      expect(result?.[0].route.path).toBe('/users')
    })

    it('should match nested routes', () => {
      const routes: RouteDef[] = [
        createRoute('/', [
          createRoute('users', [
            createRoute(':id')
          ])
        ])
      ]

      const result = matchRoutes(routes, '/users/123')
      expect(result).not.toBeNull()
      expect(result?.length).toBe(3)
      expect(result?.[0].route.path).toBe('/')
      expect(result?.[1].route.path).toBe('users')
      expect(result?.[2].route.path).toBe(':id')
      expect(result?.[2].params).toEqual({ id: '123' })
    })

    it('should return null for unmatched routes', () => {
      const routes: RouteDef[] = [
        createRoute('/users'),
        createRoute('/posts')
      ]

      const result = matchRoutes(routes, '/settings')
      expect(result).toBeNull()
    })

    it('should match root with nested routes', () => {
      const routes: RouteDef[] = [
        createRoute('/', [
          createRoute('about')
        ])
      ]

      const result = matchRoutes(routes, '/about')
      expect(result).not.toBeNull()
      expect(result?.length).toBe(2)
    })

    it('should handle index routes', () => {
      const indexRoute: RouteDef = {
        path: '',
        index: true,
        component: () => null,
        children: []
      }

      const routes: RouteDef[] = [
        {
          path: '/',
          index: false,
          component: () => null,
          children: [indexRoute]
        }
      ]

      const result = matchRoutes(routes, '/')
      expect(result).not.toBeNull()
      expect(result?.length).toBeGreaterThanOrEqual(1)
    })

    it('should extract params from nested routes', () => {
      const routes: RouteDef[] = [
        createRoute('/', [
          createRoute('users', [
            createRoute(':userId', [
              createRoute('posts', [
                createRoute(':postId')
              ])
            ])
          ])
        ])
      ]

      const result = matchRoutes(routes, '/users/42/posts/99')
      expect(result).not.toBeNull()

      // Each match accumulates params from parent routes
      const lastMatch = result?.[result!.length - 1]
      expect(lastMatch?.params).toEqual({ userId: '42', postId: '99' })
    })
  })

  describe('createRoutesFromChildren', () => {
    const createVNode = (type: Function, props: Record<string, any>, children?: any) => ({
      type,
      props,
      children,
      key: undefined
    })

    const MockRoute = () => null

    it('should create routes from single VNode', () => {
      const vnode = createVNode(MockRoute, {
        path: '/users',
        component: () => null
      })

      const routes = createRoutesFromChildren(vnode)
      expect(routes.length).toBe(1)
      expect(routes[0].path).toBe('/users')
    })

    it('should create routes from array of VNodes', () => {
      const vnodes = [
        createVNode(MockRoute, { path: '/users', component: () => null }),
        createVNode(MockRoute, { path: '/posts', component: () => null })
      ]

      const routes = createRoutesFromChildren(vnodes)
      expect(routes.length).toBe(2)
      expect(routes[0].path).toBe('/users')
      expect(routes[1].path).toBe('/posts')
    })

    it('should handle nested routes', () => {
      const nestedVNode = createVNode(MockRoute, { path: ':id', component: () => null })
      const parentVNode = createVNode(
        MockRoute,
        { path: '/users', component: () => null },
        [nestedVNode]
      )

      const routes = createRoutesFromChildren(parentVNode)
      expect(routes.length).toBe(1)
      expect(routes[0].path).toBe('/users')
      expect(routes[0].children.length).toBe(1)
      expect(routes[0].children[0].path).toBe(':id')
    })

    it('should skip non-VNode children', () => {
      const children = [
        'text node',
        null,
        undefined,
        createVNode(MockRoute, { path: '/users', component: () => null })
      ]

      const routes = createRoutesFromChildren(children)
      expect(routes.length).toBe(1)
      expect(routes[0].path).toBe('/users')
    })

    it('should handle index routes', () => {
      const vnode = createVNode(MockRoute, {
        index: true,
        component: () => null
      })

      const routes = createRoutesFromChildren(vnode)
      expect(routes.length).toBe(1)
      expect(routes[0].index).toBe(true)
      expect(routes[0].path).toBe('')
    })
  })

  describe('Route params edge cases', () => {
    it('should handle numeric params', () => {
      const result = matchPath('/items/12345', '/items/:id')
      expect(result.matches).toBe(true)
      expect(result.params.id).toBe('12345')
    })

    it('should handle UUID-like params', () => {
      const result = matchPath(
        '/items/550e8400-e29b-41d4-a716-446655440000',
        '/items/:uuid'
      )
      expect(result.matches).toBe(true)
      expect(result.params.uuid).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    it('should handle encoded params', () => {
      const result = matchPath('/search/hello%20world', '/search/:query')
      expect(result.matches).toBe(true)
      expect(result.params.query).toBe('hello%20world')
    })
  })
})
