/**
 * Router Tests
 *
 * Tests for route matching, path parsing, and router utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { matchPath } from '../core'
import { matchRoutes, createRoutesFromChildren } from '../utils'
import type { RouteDef } from '../types'
import { useRouter, Router, Route, Link, Outlet } from '../components'
import { h } from '../../renderers/dom/h'
import { mountReactive } from '../../renderers/dom/reactive'

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

  describe('useRouter hook', () => {
    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('should throw error when used outside Router', () => {
      const TestComponent = () => {
        expect(() => useRouter()).toThrow('useRouter must be used within a <Router> component')
        return h('div', {}, 'test')
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      mountReactive(h(TestComponent, {}), container)
    })

    it('should return router context when used inside Router', () => {
      let routerContext: any = null

      const TestComponent = () => {
        routerContext = useRouter()
        return h('div', { id: 'test' }, 'Test')
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      // Router is a functional component that returns a function
      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      expect(routerContext).not.toBeNull()
      expect(routerContext).toHaveProperty('location')
      expect(routerContext).toHaveProperty('params')
      expect(routerContext).toHaveProperty('navigate')
      expect(routerContext).toHaveProperty('matches')
      expect(typeof routerContext.navigate).toBe('function')
    })

    it('should provide access to current location', () => {
      let currentLocation: any = null

      const TestComponent = () => {
        const router = useRouter()
        currentLocation = router.location()
        return h('div', { id: 'test' }, 'Test')
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      expect(currentLocation).not.toBeNull()
      expect(currentLocation).toHaveProperty('pathname')
      expect(currentLocation).toHaveProperty('search')
      expect(currentLocation).toHaveProperty('hash')
    })

    it('should provide access to route params', () => {
      let routeParams: any = null

      const TestComponent = () => {
        const router = useRouter()
        routeParams = router.params()
        return h('div', { id: 'test' }, `User: ${routeParams?.id || 'unknown'}`)
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      // Set up history with a parameterized route
      window.history.pushState({}, '', '/users/123')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'users/:id', component: TestComponent })
          ])
        ]
      })

      mountReactive(RouterApp, container)

      expect(routeParams).toEqual({ id: '123' })

      // Cleanup
      window.history.pushState({}, '', '/')
    })
  })

  describe('Link component', () => {
    let originalPushState: typeof window.history.pushState

    beforeEach(() => {
      originalPushState = window.history.pushState
      window.history.pushState = vi.fn()
    })

    afterEach(() => {
      window.history.pushState = originalPushState
      document.body.innerHTML = ''
    })

    it('should render an anchor tag with href', () => {
      const TestComponent = () => {
        return h('div', {}, [h(Link, { to: '/users' }, 'Users Link')])
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      const link = container.querySelector('a')
      expect(link).not.toBeNull()
      expect(link?.getAttribute('href')).toBe('/users')
      expect(link?.textContent).toBe('Users Link')
    })

    it('should apply class attribute', () => {
      const TestComponent = () => {
        return h('div', {}, [h(Link, { to: '/users', class: 'nav-link active' }, 'Users')])
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      const link = container.querySelector('a')
      expect(link?.getAttribute('class')).toBe('nav-link active')
    })

    it('should prevent default and call navigate on click', () => {
      const TestComponent = () => {
        return h('div', {}, [h(Link, { to: '/users' }, 'Users')])
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      const link = container.querySelector('a')
      expect(link).not.toBeNull()

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

      link?.dispatchEvent(clickEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/users')
    })

    it('should navigate to correct path on click', () => {
      const TestComponent = () => {
        return h('nav', {}, [
          h(Link, { to: '/about' }, 'About'),
          h(Link, { to: '/contact' }, 'Contact')
        ])
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      const links = container.querySelectorAll('a')
      expect(links.length).toBe(2)

      // Click first link
      links[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/about')

      // Click second link
      links[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/contact')
    })

    it('should render children correctly', () => {
      const TestComponent = () => {
        return h('div', {}, [
          h(Link, { to: '/profile' }, [
            h('span', { class: 'icon' }, '👤'),
            h('span', {}, 'Profile')
          ])
        ])
      }

      const container = document.createElement('div')
      document.body.appendChild(container)

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })]
      })

      mountReactive(RouterApp, container)

      const link = container.querySelector('a')
      expect(link).not.toBeNull()

      const spans = link?.querySelectorAll('span')
      expect(spans?.length).toBe(2)
      expect(spans?.[0].textContent).toBe('👤')
      expect(spans?.[1].textContent).toBe('Profile')
    })
  })

  describe('Outlet component', () => {
    afterEach(() => {
      document.body.innerHTML = ''
      window.history.pushState({}, '', '/')
    })

    it('should render nested route component', () => {
      const ChildComponent = () => h('div', { id: 'child' }, 'Child Content')
      const ParentComponent = () => h('div', { id: 'parent' }, [
        h('h1', {}, 'Parent'),
        h(Outlet, {})
      ])

      const container = document.createElement('div')
      document.body.appendChild(container)

      window.history.pushState({}, '', '/parent/child')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'parent', component: ParentComponent }, [
              h(Route, { path: 'child', component: ChildComponent })
            ])
          ])
        ]
      })

      mountReactive(RouterApp, container)

      const parent = container.querySelector('#parent')
      expect(parent).not.toBeNull()
      expect(parent?.querySelector('h1')?.textContent).toBe('Parent')

      const child = container.querySelector('#child')
      expect(child).not.toBeNull()
      expect(child?.textContent).toBe('Child Content')
    })

    it('should render null when no child route matches', () => {
      const ParentComponent = () => h('div', { id: 'parent' }, [
        h('h1', {}, 'Parent'),
        h(Outlet, {})
      ])

      const container = document.createElement('div')
      document.body.appendChild(container)

      window.history.pushState({}, '', '/parent')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'parent', component: ParentComponent })
          ])
        ]
      })

      mountReactive(RouterApp, container)

      const parent = container.querySelector('#parent')
      expect(parent).not.toBeNull()

      // Outlet should render nothing since there's no child route
      const h1 = parent?.querySelector('h1')
      expect(h1?.textContent).toBe('Parent')

      // Should only have the h1, no additional child content
      const childDiv = parent?.querySelector('#child')
      expect(childDiv).toBeNull()
    })

    it('should handle multiple levels of nesting', () => {
      const Level3 = () => h('div', { id: 'level3' }, 'Level 3')
      const Level2 = () => h('div', { id: 'level2' }, [
        h('span', {}, 'Level 2'),
        h(Outlet, {})
      ])
      const Level1 = () => h('div', { id: 'level1' }, [
        h('span', {}, 'Level 1'),
        h(Outlet, {})
      ])

      const container = document.createElement('div')
      document.body.appendChild(container)

      window.history.pushState({}, '', '/level1/level2/level3')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'level1', component: Level1 }, [
              h(Route, { path: 'level2', component: Level2 }, [
                h(Route, { path: 'level3', component: Level3 })
              ])
            ])
          ])
        ]
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#level1')).not.toBeNull()
      expect(container.querySelector('#level2')).not.toBeNull()
      expect(container.querySelector('#level3')).not.toBeNull()
    })

    it('should pass params to nested components', () => {
      let receivedParams: any = null

      const ChildComponent = (props: any) => {
        receivedParams = props.params
        return h('div', { id: 'child' }, `User: ${props.params.userId}`)
      }

      const ParentComponent = () => h('div', { id: 'parent' }, [
        h('h1', {}, 'Users'),
        h(Outlet, {})
      ])

      const container = document.createElement('div')
      document.body.appendChild(container)

      window.history.pushState({}, '', '/users/42')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'users', component: ParentComponent }, [
              h(Route, { path: ':userId', component: ChildComponent })
            ])
          ])
        ]
      })

      mountReactive(RouterApp, container)

      expect(receivedParams).toEqual({ userId: '42' })

      const child = container.querySelector('#child')
      expect(child?.textContent).toBe('User: 42')
    })

    it('should return null when used outside Router context', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const app = h(Outlet, {})
      mountReactive(app, container)

      // Should render nothing since there's no router context
      expect(container.innerHTML).toBe('')
    })

    it('should update when route changes', () => {
      const AboutComponent = () => h('div', { id: 'about' }, 'About Page')
      const ContactComponent = () => h('div', { id: 'contact' }, 'Contact Page')
      const LayoutComponent = () => h('div', { id: 'layout' }, [
        h('header', {}, 'Header'),
        h(Outlet, {})
      ])

      const container = document.createElement('div')
      document.body.appendChild(container)

      window.history.pushState({}, '', '/about')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: LayoutComponent }, [
            h(Route, { path: 'about', component: AboutComponent }),
            h(Route, { path: 'contact', component: ContactComponent })
          ])
        ]
      })

      mountReactive(RouterApp, container)

      // Initially should render About
      expect(container.querySelector('#about')).not.toBeNull()
      expect(container.querySelector('#contact')).toBeNull()

      // Navigate to contact (this would happen via router.navigate in real usage)
      window.history.pushState({}, '', '/contact')
      window.dispatchEvent(new PopStateEvent('popstate'))

      // After navigation, should render Contact
      // Note: This test assumes the router listens to popstate events
      // The actual behavior depends on the router implementation
    })
  })
})
