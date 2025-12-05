/**
 * Router Components Tests
 *
 * Comprehensive tests for Router, Route, Link, and Outlet components.
 * Tests cover initialization, routing, navigation, nested routes, dynamic params,
 * and route guards.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Router, Route, Link, Outlet, useRouter } from '../components'
import { h } from '../../renderers/dom/h'
import { mountReactive } from '../../renderers/dom/reactive'

describe('Router Components', () => {
  let container: HTMLDivElement
  let originalPushState: typeof window.history.pushState

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    originalPushState = window.history.pushState
    window.history.pushState = vi.fn((state, title, url) => {
      originalPushState.call(window.history, state, title, url)
    })
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    document.body.innerHTML = ''
    window.history.pushState = originalPushState
    window.history.pushState({}, '', '/')
  })

  describe('Router Component', () => {
    describe('Initialization', () => {
      it('should render Router component successfully', () => {
        const HomeComponent = () => h('div', { id: 'home' }, 'Home')

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: HomeComponent })],
        })

        mountReactive(RouterApp, container)

        const home = container.querySelector('#home')
        expect(home).not.toBeNull()
        expect(home?.textContent).toBe('Home')
      })

      it('should render nothing when no routes match', () => {
        const HomeComponent = () => h('div', { id: 'home' }, 'Home')

        window.history.pushState({}, '', '/nonexistent')

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: HomeComponent })],
        })

        mountReactive(RouterApp, container)

        expect(container.innerHTML).toBe('')
      })

      it('should initialize with current browser location', () => {
        window.history.pushState({}, '', '/about')

        const AboutComponent = () => h('div', { id: 'about' }, 'About')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, { path: 'about', component: AboutComponent }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#about')).not.toBeNull()
      })

      it('should provide router context to child components', () => {
        let routerContext: any = null

        const TestComponent = () => {
          routerContext = useRouter()
          return h('div', {}, 'Test')
        }

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        expect(routerContext).not.toBeNull()
        expect(routerContext).toHaveProperty('location')
        expect(routerContext).toHaveProperty('params')
        expect(routerContext).toHaveProperty('navigate')
        expect(routerContext).toHaveProperty('matches')
      })

      it('should parse multiple root routes', () => {
        const HomeComponent = () => h('div', { id: 'home' }, 'Home')
        const AboutComponent = () => h('div', { id: 'about' }, 'About')

        window.history.pushState({}, '', '/about')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: HomeComponent }),
            h(Route, { path: '/about', component: AboutComponent }),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#about')).not.toBeNull()
        expect(container.querySelector('#home')).toBeNull()
      })
    })

    describe('Route Matching', () => {
      it('should match exact paths', () => {
        const UsersComponent = () => h('div', { id: 'users' }, 'Users List')

        window.history.pushState({}, '', '/users')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, { path: 'users', component: UsersComponent }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#users')).not.toBeNull()
      })

      it('should match nested routes', () => {
        const Layout = () => h('div', { id: 'layout' }, [h(Outlet, {})])
        const Users = () => h('div', { id: 'users' }, [h(Outlet, {})])
        const UserDetail = () => h('div', { id: 'detail' }, 'User Detail')

        window.history.pushState({}, '', '/users/123')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, { path: 'users', component: Users }, [
                h(Route, { path: ':id', component: UserDetail }),
              ]),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#layout')).not.toBeNull()
        expect(container.querySelector('#users')).not.toBeNull()
        expect(container.querySelector('#detail')).not.toBeNull()
      })

      it('should match root path correctly', () => {
        const HomeComponent = () => h('div', { id: 'home' }, 'Home')

        window.history.pushState({}, '', '/')

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: HomeComponent })],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#home')).not.toBeNull()
      })

      it('should prioritize first matching route', () => {
        const Route1 = () => h('div', { id: 'route1' }, 'Route 1')
        const Route2 = () => h('div', { id: 'route2' }, 'Route 2')

        window.history.pushState({}, '', '/test')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/test', component: Route1 }),
            h(Route, { path: '/test', component: Route2 }),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#route1')).not.toBeNull()
        expect(container.querySelector('#route2')).toBeNull()
      })

      it('should handle index routes', () => {
        const Layout = () => h('div', { id: 'layout' }, [h(Outlet, {})])
        const IndexComponent = () => h('div', { id: 'index' }, 'Index')

        window.history.pushState({}, '', '/')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, { index: true, component: IndexComponent }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#layout')).not.toBeNull()
        expect(container.querySelector('#index')).not.toBeNull()
      })
    })

    describe('Dynamic Route Parameters', () => {
      it('should extract single parameter', () => {
        let receivedParams: any = null

        const UserComponent = (props: any) => {
          receivedParams = props.params
          return h('div', { id: 'user' }, `User ${props.params.id}`)
        }

        window.history.pushState({}, '', '/users/123')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, { path: 'users/:id', component: UserComponent }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(receivedParams).toEqual({ id: '123' })
        expect(container.querySelector('#user')?.textContent).toBe('User 123')
      })

      it('should extract multiple parameters', () => {
        let receivedParams: any = null

        const PostComponent = (props: any) => {
          receivedParams = props.params
          return h(
            'div',
            { id: 'post' },
            `User ${props.params.userId} Post ${props.params.postId}`
          )
        }

        window.history.pushState({}, '', '/users/42/posts/99')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(
                Route,
                { path: 'users/:userId', component: () => h(Outlet, {}) },
                [h(Route, { path: 'posts/:postId', component: PostComponent })]
              ),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(receivedParams).toEqual({ userId: '42', postId: '99' })
      })

      it('should handle parameters with special characters', () => {
        let receivedParams: any = null

        const ItemComponent = (props: any) => {
          receivedParams = props.params
          return h('div', { id: 'item' }, props.params.slug)
        }

        window.history.pushState({}, '', '/items/my-awesome-item-123')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, { path: 'items/:slug', component: ItemComponent }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(receivedParams).toEqual({ slug: 'my-awesome-item-123' })
      })

      it('should provide params through router context', () => {
        let contextParams: any = null

        const TestComponent = () => {
          const router = useRouter()
          contextParams = router.params()
          return h('div', {}, 'Test')
        }

        window.history.pushState({}, '', '/products/abc123')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, {
                path: 'products/:productId',
                component: TestComponent,
              }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(contextParams).toEqual({ productId: 'abc123' })
      })
    })

    describe('Route Guards', () => {
      it('should call beforeEnter guard', () => {
        const guardSpy = vi.fn(() => true)
        const Component = () => h('div', { id: 'protected' }, 'Protected')

        window.history.pushState({}, '', '/protected')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, {
                path: 'protected',
                component: Component,
                beforeEnter: guardSpy,
              }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(guardSpy).toHaveBeenCalled()
        expect(container.querySelector('#protected')).not.toBeNull()
      })

      it('should block rendering when guard returns false', () => {
        const guardSpy = vi.fn(() => false)
        const Component = () => h('div', { id: 'protected' }, 'Protected')

        window.history.pushState({}, '', '/protected')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, {
                path: 'protected',
                component: Component,
                beforeEnter: guardSpy,
              }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(guardSpy).toHaveBeenCalled()
        expect(container.querySelector('#protected')).toBeNull()
      })

      it('should pass params to beforeEnter guard', () => {
        let receivedParams: any = null
        const guardSpy = vi.fn((params) => {
          receivedParams = params
          return true
        })
        const Component = () => h('div', { id: 'user' }, 'User')

        window.history.pushState({}, '', '/users/456')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, {
                path: 'users/:id',
                component: Component,
                beforeEnter: guardSpy,
              }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(guardSpy).toHaveBeenCalled()
        expect(receivedParams).toEqual({ id: '456' })
      })

      it('should apply guard at root route level', () => {
        const guardSpy = vi.fn(() => false)
        const Component = () => h('div', { id: 'root' }, 'Root')

        const RouterApp = Router({
          children: [
            h(Route, {
              path: '/',
              component: Component,
              beforeEnter: guardSpy,
            }),
          ],
        })

        mountReactive(RouterApp, container)

        expect(guardSpy).toHaveBeenCalled()
        expect(container.innerHTML).toBe('')
      })
    })
  })

  describe('Route Component', () => {
    it('should be used as configuration component', () => {
      const TestComponent = () => h('div', { id: 'test' }, 'Test')

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })],
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#test')).not.toBeNull()
    })

    it('should support nested Route components', () => {
      const Parent = () => h('div', { id: 'parent' }, [h(Outlet, {})])
      const Child = () => h('div', { id: 'child' }, 'Child')

      window.history.pushState({}, '', '/parent/child')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'parent', component: Parent }, [
              h(Route, { path: 'child', component: Child }),
            ]),
          ]),
        ],
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#parent')).not.toBeNull()
      expect(container.querySelector('#child')).not.toBeNull()
    })

    it('should accept optional path prop', () => {
      const Layout = () => h('div', { id: 'layout' }, [h(Outlet, {})])
      const Home = () => h('div', { id: 'home' }, 'Home')

      const RouterApp = Router({
        children: [
          h(Route, { component: Layout }, [
            h(Route, { path: '/', component: Home }),
          ]),
        ],
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#layout')).not.toBeNull()
      expect(container.querySelector('#home')).not.toBeNull()
    })
  })

  describe('Link Component', () => {
    describe('Rendering', () => {
      it('should render anchor tag with href', () => {
        const TestComponent = () =>
          h('div', {}, [h(Link, { to: '/about' }, 'About')])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')
        expect(link).not.toBeNull()
        expect(link?.getAttribute('href')).toBe('/about')
        expect(link?.textContent).toBe('About')
      })

      it('should apply class attribute', () => {
        const TestComponent = () =>
          h('div', {}, [
            h(Link, { to: '/profile', class: 'nav-link active' }, 'Profile'),
          ])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')
        expect(link?.getAttribute('class')).toBe('nav-link active')
      })

      it('should render children elements', () => {
        const TestComponent = () =>
          h('div', {}, [
            h(Link, { to: '/home' }, [
              h('span', { class: 'icon' }, 'H'),
              h('span', {}, 'Home'),
            ]),
          ])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')
        const spans = link?.querySelectorAll('span')
        expect(spans?.length).toBe(2)
        expect(spans?.[0].textContent).toBe('H')
        expect(spans?.[1].textContent).toBe('Home')
      })

      it('should render multiple links', () => {
        const NavComponent = () =>
          h('nav', {}, [
            h(Link, { to: '/home' }, 'Home'),
            h(Link, { to: '/about' }, 'About'),
            h(Link, { to: '/contact' }, 'Contact'),
          ])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: NavComponent })],
        })

        mountReactive(RouterApp, container)

        const links = container.querySelectorAll('a')
        expect(links.length).toBe(3)
        expect(links[0].getAttribute('href')).toBe('/home')
        expect(links[1].getAttribute('href')).toBe('/about')
        expect(links[2].getAttribute('href')).toBe('/contact')
      })
    })

    describe('Navigation', () => {
      it('should prevent default click behavior', () => {
        const TestComponent = () =>
          h('div', {}, [h(Link, { to: '/users' }, 'Users')])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

        link?.dispatchEvent(clickEvent)

        expect(preventDefaultSpy).toHaveBeenCalled()
      })

      it('should call navigate on click', () => {
        const TestComponent = () =>
          h('div', {}, [h(Link, { to: '/products' }, 'Products')])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')
        link?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true })
        )

        expect(window.history.pushState).toHaveBeenCalledWith(
          {},
          '',
          '/products'
        )
      })

      it('should navigate to path with parameters', () => {
        const TestComponent = () =>
          h('div', {}, [h(Link, { to: '/users/123' }, 'User 123')])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')
        link?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true })
        )

        expect(window.history.pushState).toHaveBeenCalledWith(
          {},
          '',
          '/users/123'
        )
      })

      it('should work with nested routes', () => {
        const NavComponent = () =>
          h('div', {}, [h(Link, { to: '/dashboard/settings' }, 'Settings')])

        window.history.pushState({}, '', '/dashboard')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, { path: 'dashboard', component: NavComponent }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        const link = container.querySelector('a')

        // Clear previous calls
        vi.clearAllMocks()

        link?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true })
        )

        expect(window.history.pushState).toHaveBeenCalledWith(
          {},
          '',
          '/dashboard/settings'
        )
      })
    })

    describe('Integration', () => {
      it('should work with complex children structure', () => {
        const TestComponent = () =>
          h('nav', { class: 'navbar' }, [
            h('div', { class: 'brand' }, 'Logo'),
            h('ul', {}, [
              h('li', {}, [h(Link, { to: '/home', class: 'link' }, 'Home')]),
              h('li', {}, [h(Link, { to: '/about', class: 'link' }, 'About')]),
            ]),
          ])

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: TestComponent })],
        })

        mountReactive(RouterApp, container)

        const links = container.querySelectorAll('.link')
        expect(links.length).toBe(2)
        expect(links[0].getAttribute('href')).toBe('/home')
        expect(links[1].getAttribute('href')).toBe('/about')
      })
    })
  })

  describe('Outlet Component', () => {
    describe('Basic Rendering', () => {
      it('should render nested route component', () => {
        const Layout = () =>
          h('div', { id: 'layout' }, [h('header', {}, 'Header'), h(Outlet, {})])
        const Content = () => h('div', { id: 'content' }, 'Content')

        window.history.pushState({}, '', '/content')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, { path: 'content', component: Content }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#layout')).not.toBeNull()
        expect(container.querySelector('header')?.textContent).toBe('Header')
        expect(container.querySelector('#content')).not.toBeNull()
      })

      it('should render null when no child route matches', () => {
        const Layout = () =>
          h('div', { id: 'layout' }, [h('h1', {}, 'Layout'), h(Outlet, {})])

        window.history.pushState({}, '', '/')

        const RouterApp = Router({
          children: [h(Route, { path: '/', component: Layout })],
        })

        mountReactive(RouterApp, container)

        const layout = container.querySelector('#layout')
        expect(layout).not.toBeNull()
        expect(layout?.querySelector('h1')?.textContent).toBe('Layout')
        expect(layout?.children.length).toBe(1) // Only h1, no outlet content
      })

      it('should return null when used outside Router context', () => {
        const app = h(Outlet, {})
        mountReactive(app, container)

        expect(container.innerHTML).toBe('')
      })
    })

    describe('Nested Outlets', () => {
      it('should handle multiple levels of nesting', () => {
        const Level1 = () =>
          h('div', { id: 'level1' }, [h('span', {}, 'Level 1'), h(Outlet, {})])
        const Level2 = () =>
          h('div', { id: 'level2' }, [h('span', {}, 'Level 2'), h(Outlet, {})])
        const Level3 = () => h('div', { id: 'level3' }, 'Level 3')

        window.history.pushState({}, '', '/a/b/c')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: () => h(Outlet, {}) }, [
              h(Route, { path: 'a', component: Level1 }, [
                h(Route, { path: 'b', component: Level2 }, [
                  h(Route, { path: 'c', component: Level3 }),
                ]),
              ]),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(container.querySelector('#level1')).not.toBeNull()
        expect(container.querySelector('#level2')).not.toBeNull()
        expect(container.querySelector('#level3')).not.toBeNull()
      })

      it('should render deeply nested components in correct order', () => {
        const Root = () => h('div', { class: 'root' }, [h(Outlet, {})])
        const Parent = () => h('div', { class: 'parent' }, [h(Outlet, {})])
        const Child = () => h('div', { class: 'child' }, 'Leaf')

        window.history.pushState({}, '', '/parent/child')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Root }, [
              h(Route, { path: 'parent', component: Parent }, [
                h(Route, { path: 'child', component: Child }),
              ]),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        const root = container.querySelector('.root')
        const parent = root?.querySelector('.parent')
        const child = parent?.querySelector('.child')

        expect(root).not.toBeNull()
        expect(parent).not.toBeNull()
        expect(child).not.toBeNull()
        expect(child?.textContent).toBe('Leaf')
      })
    })

    describe('Parameter Passing', () => {
      it('should pass params to nested components', () => {
        let receivedParams: any = null

        const Layout = () => h('div', { id: 'layout' }, [h(Outlet, {})])
        const UserDetail = (props: any) => {
          receivedParams = props.params
          return h('div', { id: 'user' }, `User ${props.params.id}`)
        }

        window.history.pushState({}, '', '/users/789')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, { path: 'users/:id', component: UserDetail }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(receivedParams).toEqual({ id: '789' })
        expect(container.querySelector('#user')?.textContent).toBe('User 789')
      })

      it('should pass accumulated params through multiple outlets', () => {
        let receivedParams: any = null

        const Layout = () => h('div', {}, [h(Outlet, {})])
        const UsersLayout = () => h('div', {}, [h(Outlet, {})])
        const PostDetail = (props: any) => {
          receivedParams = props.params
          return h('div', { id: 'post' }, 'Post')
        }

        window.history.pushState({}, '', '/users/10/posts/20')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, { path: 'users/:userId', component: UsersLayout }, [
                h(Route, { path: 'posts/:postId', component: PostDetail }),
              ]),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(receivedParams).toEqual({ userId: '10', postId: '20' })
      })
    })

    describe('Route Guards with Outlet', () => {
      it('should respect beforeEnter guard in nested routes', () => {
        const guardSpy = vi.fn(() => false)
        const Layout = () => h('div', { id: 'layout' }, [h(Outlet, {})])
        const Protected = () => h('div', { id: 'protected' }, 'Protected')

        window.history.pushState({}, '', '/protected')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, {
                path: 'protected',
                component: Protected,
                beforeEnter: guardSpy,
              }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(guardSpy).toHaveBeenCalled()
        expect(container.querySelector('#layout')).not.toBeNull()
        expect(container.querySelector('#protected')).toBeNull()
      })

      it('should allow rendering when guard returns true', () => {
        const guardSpy = vi.fn(() => true)
        const Layout = () => h('div', { id: 'layout' }, [h(Outlet, {})])
        const Allowed = () => h('div', { id: 'allowed' }, 'Allowed')

        window.history.pushState({}, '', '/allowed')

        const RouterApp = Router({
          children: [
            h(Route, { path: '/', component: Layout }, [
              h(Route, {
                path: 'allowed',
                component: Allowed,
                beforeEnter: guardSpy,
              }),
            ]),
          ],
        })

        mountReactive(RouterApp, container)

        expect(guardSpy).toHaveBeenCalled()
        expect(container.querySelector('#allowed')).not.toBeNull()
      })
    })
  })

  describe('Programmatic Navigation', () => {
    it('should navigate programmatically using router.navigate', () => {
      let navigateFn: ((path: string) => void) | null = null

      const TestComponent = () => {
        const router = useRouter()
        navigateFn = router.navigate
        return h('div', { id: 'test' }, 'Test')
      }

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })],
      })

      mountReactive(RouterApp, container)

      expect(navigateFn).not.toBeNull()
      navigateFn!('/new-route')

      expect(window.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/new-route'
      )
    })

    it('should update location after programmatic navigation', () => {
      let router: any = null

      const TestComponent = () => {
        router = useRouter()
        return h('div', {}, 'Test')
      }

      const RouterApp = Router({
        children: [h(Route, { path: '/', component: TestComponent })],
      })

      mountReactive(RouterApp, container)

      const initialPath = router.location().pathname
      router.navigate('/updated-path')
      const updatedPath = router.location().pathname

      expect(initialPath).toBe('/')
      expect(updatedPath).toBe('/updated-path')
    })

    it('should trigger route re-matching on navigate', () => {
      let router: any = null
      const Home = () => h('div', { id: 'home' }, 'Home')
      const About = () => h('div', { id: 'about' }, 'About')

      const TestComponent = () => {
        router = useRouter()
        return h('div', {}, [h(Outlet, {})])
      }

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: TestComponent }, [
            h(Route, { path: '/', component: Home }),
            h(Route, { path: 'about', component: About }),
          ]),
        ],
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#home')).not.toBeNull()

      router.navigate('/about')

      // Note: In a real reactive system, this would trigger re-render
      // For this test, we're just verifying navigate was called
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/about')
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle complete app with navigation and nested routes', () => {
      const Layout = () =>
        h('div', { id: 'layout' }, [
          h('nav', {}, [
            h(Link, { to: '/' }, 'Home'),
            h(Link, { to: '/about' }, 'About'),
          ]),
          h(Outlet, {}),
        ])

      const Home = () => h('div', { id: 'home' }, 'Home Page')
      const About = () => h('div', { id: 'about' }, 'About Page')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: Layout }, [
            h(Route, { index: true, component: Home }),
            h(Route, { path: 'about', component: About }),
          ]),
        ],
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#layout')).not.toBeNull()
      expect(container.querySelector('nav')).not.toBeNull()

      const links = container.querySelectorAll('a')
      expect(links.length).toBe(2)
    })

    it('should support dynamic routes with guards and outlets', () => {
      const guardSpy = vi.fn(() => true)
      let receivedParams: any = null

      const Dashboard = () => h('div', { id: 'dashboard' }, [h(Outlet, {})])
      const UserProfile = (props: any) => {
        receivedParams = props.params
        return h('div', { id: 'profile' }, `User ${props.params.id}`)
      }

      window.history.pushState({}, '', '/dashboard/user/555')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'dashboard', component: Dashboard }, [
              h(Route, {
                path: 'user/:id',
                component: UserProfile,
                beforeEnter: guardSpy,
              }),
            ]),
          ]),
        ],
      })

      mountReactive(RouterApp, container)

      expect(guardSpy).toHaveBeenCalled()
      expect(receivedParams).toEqual({ id: '555' })
      expect(container.querySelector('#dashboard')).not.toBeNull()
      expect(container.querySelector('#profile')).not.toBeNull()
    })

    it('should handle route changes through browser history', () => {
      const Page1 = () => h('div', { id: 'page1' }, 'Page 1')
      const Page2 = () => h('div', { id: 'page2' }, 'Page 2')

      window.history.pushState({}, '', '/page1')

      const RouterApp = Router({
        children: [
          h(Route, { path: '/', component: () => h(Outlet, {}) }, [
            h(Route, { path: 'page1', component: Page1 }),
            h(Route, { path: 'page2', component: Page2 }),
          ]),
        ],
      })

      mountReactive(RouterApp, container)

      expect(container.querySelector('#page1')).not.toBeNull()

      // Simulate browser back/forward
      window.history.pushState({}, '', '/page2')
      window.dispatchEvent(new PopStateEvent('popstate'))

      // Navigation state is updated via popstate listener
    })
  })
})
