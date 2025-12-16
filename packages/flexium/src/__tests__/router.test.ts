/**
 * Router Tests
 *
 * Routes, Route, Link 컴포넌트 기본 테스트
 * Note: jsdom에서 window.location mocking이 복잡하므로 기본 기능 위주로 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { Routes, Route, Link } from '../router'
import { state } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 50))

describe('Routes & Route - Basic', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render Routes container', () => {
    function Home() {
      return f('div', { 'data-testid': 'home' }, 'Home Page')
    }

    function App() {
      return f(Routes, {}, [
        f(Route, { path: '/', component: Home })
      ])
    }

    render(f(App), container)

    // Routes should render something
    expect(container.children.length).toBeGreaterThan(0)
  })

  it('should render Route component', () => {
    function Page() {
      return f('div', { 'data-testid': 'page' }, 'Page Content')
    }

    function App() {
      return f(Routes, {}, [
        f(Route, { path: '/', component: Page })
      ])
    }

    render(f(App), container)

    // Should have rendered the page
    expect(container.querySelector('[data-testid="page"]')).not.toBeNull()
  })

  it('should render home route by default', () => {
    function Home() {
      return f('div', { 'data-testid': 'home' }, 'Home')
    }

    function About() {
      return f('div', { 'data-testid': 'about' }, 'About')
    }

    function App() {
      return f(Routes, {}, [
        f(Route, { path: '/', component: Home }),
        f(Route, { path: '/about', component: About })
      ])
    }

    render(f(App), container)

    // Default path "/" should match
    expect(container.querySelector('[data-testid="home"]')).not.toBeNull()
  })
})

describe('Link component', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.spyOn(history, 'pushState').mockImplementation(() => {})
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('should render anchor element with href', () => {
    function App() {
      return f(Routes, {}, [
        f(Route, {
          path: '/',
          component: () => f(Link, { to: '/about' }, 'Go to About')
        })
      ])
    }

    render(f(App), container)

    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('/about')
  })

  it('should render children text', () => {
    function App() {
      return f(Routes, {}, [
        f(Route, {
          path: '/',
          component: () => f(Link, { to: '/test' }, 'Test Link')
        })
      ])
    }

    render(f(App), container)

    const link = container.querySelector('a')
    expect(link?.textContent).toBe('Test Link')
  })

  it('should support className prop', () => {
    function App() {
      return f(Routes, {}, [
        f(Route, {
          path: '/',
          component: () => f(Link, { to: '/test', class: 'nav-link' }, 'Nav')
        })
      ])
    }

    render(f(App), container)

    const link = container.querySelector('a')
    expect(link?.className).toContain('nav-link')
  })

  it('should support multiple Link components', () => {
    function App() {
      return f(Routes, {}, [
        f(Route, {
          path: '/',
          component: () => f('nav', {}, [
            f(Link, { to: '/' }, 'Home'),
            f(Link, { to: '/about' }, 'About'),
            f(Link, { to: '/contact' }, 'Contact')
          ])
        })
      ])
    }

    render(f(App), container)

    const links = container.querySelectorAll('a')
    expect(links.length).toBe(3)
  })
})

describe('Router - State-based patterns', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should support tab navigation with state', async () => {
    function TabNav() {
      const [activeTab, setActiveTab] = state('home')

      const tabs = {
        home: f('div', { 'data-testid': 'home-tab' }, 'Home Content'),
        about: f('div', { 'data-testid': 'about-tab' }, 'About Content'),
        contact: f('div', { 'data-testid': 'contact-tab' }, 'Contact Content'),
      }

      return f('div', {}, [
        f('nav', {}, [
          f('button', {
            'data-testid': 'nav-home',
            onclick: () => setActiveTab('home')
          }, 'Home'),
          f('button', {
            'data-testid': 'nav-about',
            onclick: () => setActiveTab('about')
          }, 'About'),
          f('button', {
            'data-testid': 'nav-contact',
            onclick: () => setActiveTab('contact')
          }, 'Contact')
        ]),
        f('main', { 'data-testid': 'content' }, tabs[activeTab as keyof typeof tabs])
      ])
    }

    render(f(TabNav), container)

    expect(container.querySelector('[data-testid="home-tab"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="nav-about"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="about-tab"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="home-tab"]')).toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="nav-contact"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="contact-tab"]')).not.toBeNull()
  })

  it('should support protected routes pattern', async () => {
    function ProtectedContent({ isLoggedIn }: { isLoggedIn: boolean }) {
      if (!isLoggedIn) {
        return f('div', { 'data-testid': 'login-prompt' }, 'Please login first')
      }
      return f('div', { 'data-testid': 'protected-content' }, 'Secret content!')
    }

    function App() {
      const [isLoggedIn, setIsLoggedIn] = state(false)

      return f('div', {}, [
        f(ProtectedContent, { isLoggedIn }),
        f('button', {
          'data-testid': 'login-btn',
          onclick: () => setIsLoggedIn(true)
        }, 'Login'),
        f('button', {
          'data-testid': 'logout-btn',
          onclick: () => setIsLoggedIn(false)
        }, 'Logout')
      ])
    }

    render(f(App), container)

    // Initially not logged in
    expect(container.querySelector('[data-testid="login-prompt"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="protected-content"]')).toBeNull()

    // Login
    container.querySelector<HTMLButtonElement>('[data-testid="login-btn"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="protected-content"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="login-prompt"]')).toBeNull()

    // Logout
    container.querySelector<HTMLButtonElement>('[data-testid="logout-btn"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="login-prompt"]')).not.toBeNull()
  })

  it('should support conditional route rendering', async () => {
    function ConditionalRoutes() {
      const [userRole, setUserRole] = state<'guest' | 'user' | 'admin'>('guest')

      const roleContent = {
        guest: f('div', { 'data-testid': 'guest-view' }, 'Welcome, Guest'),
        user: f('div', { 'data-testid': 'user-view' }, 'Welcome, User'),
        admin: f('div', { 'data-testid': 'admin-view' }, 'Admin Dashboard'),
      }

      return f('div', {}, [
        f('select', {
          'data-testid': 'role-select',
          onchange: (e: Event) => setUserRole((e.target as HTMLSelectElement).value as any)
        }, [
          f('option', { value: 'guest' }, 'Guest'),
          f('option', { value: 'user' }, 'User'),
          f('option', { value: 'admin' }, 'Admin')
        ]),
        roleContent[userRole]
      ])
    }

    render(f(ConditionalRoutes), container)

    expect(container.querySelector('[data-testid="guest-view"]')).not.toBeNull()

    const select = container.querySelector('[data-testid="role-select"]') as HTMLSelectElement
    select.value = 'admin'
    select.dispatchEvent(new Event('change'))
    await nextTick()

    expect(container.querySelector('[data-testid="admin-view"]')).not.toBeNull()
  })
})
