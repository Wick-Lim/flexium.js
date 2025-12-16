/**
 * Router API Tests
 *
 * Tests for: Routes, Route, Link, Outlet, router()
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, f } from '../dom'
import { Routes, Route, Link, Outlet } from '../router'
import { state } from '../core'

const tick = () => new Promise(r => setTimeout(r, 50))

describe('Routes & Route', () => {
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
      return f('div', { 'data-testid': 'home' }, 'Home')
    }

    function App() {
      return f(Routes, {}, [
        f(Route, { path: '/', component: Home })
      ])
    }

    render(f(App), container)
    expect(container.children.length).toBeGreaterThan(0)
  })

  it('should render matching route', () => {
    function Home() {
      return f('div', { 'data-testid': 'home' }, 'Home Page')
    }

    function App() {
      return f(Routes, {}, [
        f(Route, { path: '/', component: Home })
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="home"]')).not.toBeNull()
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
    expect(container.querySelector('[data-testid="home"]')).not.toBeNull()
  })

  it('should support multiple routes', () => {
    function Home() {
      return f('div', { 'data-testid': 'home' }, 'Home')
    }

    function About() {
      return f('div', { 'data-testid': 'about' }, 'About')
    }

    function Contact() {
      return f('div', { 'data-testid': 'contact' }, 'Contact')
    }

    function App() {
      return f(Routes, {}, [
        f(Route, { path: '/', component: Home }),
        f(Route, { path: '/about', component: About }),
        f(Route, { path: '/contact', component: Contact })
      ])
    }

    render(f(App), container)
    // Default path "/" should match
    expect(container.querySelector('[data-testid="home"]')).not.toBeNull()
  })
})

describe('Link', () => {
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
    expect(container.querySelector('a')?.textContent).toBe('Test Link')
  })

  it('should support class prop', () => {
    function App() {
      return f(Routes, {}, [
        f(Route, {
          path: '/',
          component: () => f(Link, { to: '/test', class: 'nav-link' }, 'Nav')
        })
      ])
    }

    render(f(App), container)
    expect(container.querySelector('a')?.className).toContain('nav-link')
  })

  it('should support multiple links', () => {
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
    expect(container.querySelectorAll('a').length).toBe(3)
  })
})

describe('State-based navigation patterns', () => {
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
      const [tab, setTab] = state<'home' | 'about' | 'contact'>('home')

      const tabs = {
        home: f('div', { 'data-testid': 'home-tab' }, 'Home'),
        about: f('div', { 'data-testid': 'about-tab' }, 'About'),
        contact: f('div', { 'data-testid': 'contact-tab' }, 'Contact')
      }

      return f('div', {}, [
        f('nav', {}, [
          f('button', { 'data-testid': 'nav-home', onclick: () => setTab('home') }, 'Home'),
          f('button', { 'data-testid': 'nav-about', onclick: () => setTab('about') }, 'About'),
          f('button', { 'data-testid': 'nav-contact', onclick: () => setTab('contact') }, 'Contact')
        ]),
        f('main', {}, tabs[tab])
      ])
    }

    render(f(TabNav), container)
    expect(container.querySelector('[data-testid="home-tab"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="nav-about"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="about-tab"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="home-tab"]')).toBeNull()
  })

  it('should support protected routes pattern', async () => {
    function ProtectedContent({ loggedIn }: { loggedIn: boolean }) {
      if (!loggedIn) {
        return f('div', { 'data-testid': 'login-prompt' }, 'Please login')
      }
      return f('div', { 'data-testid': 'protected' }, 'Protected content')
    }

    function App() {
      const [loggedIn, setLoggedIn] = state(false)

      return f('div', {}, [
        f(ProtectedContent, { loggedIn }),
        f('button', { 'data-testid': 'login', onclick: () => setLoggedIn(true) }, 'Login'),
        f('button', { 'data-testid': 'logout', onclick: () => setLoggedIn(false) }, 'Logout')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="login-prompt"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="login"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="protected"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="logout"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="login-prompt"]')).not.toBeNull()
  })

  it('should support role-based content', async () => {
    function App() {
      const [role, setRole] = state<'guest' | 'user' | 'admin'>('guest')

      const content = {
        guest: f('div', { 'data-testid': 'guest' }, 'Guest view'),
        user: f('div', { 'data-testid': 'user' }, 'User view'),
        admin: f('div', { 'data-testid': 'admin' }, 'Admin view')
      }

      return f('div', {}, [
        f('select', {
          'data-testid': 'role-select',
          onchange: (e: Event) => setRole((e.target as HTMLSelectElement).value as any)
        }, [
          f('option', { value: 'guest' }, 'Guest'),
          f('option', { value: 'user' }, 'User'),
          f('option', { value: 'admin' }, 'Admin')
        ]),
        content[role]
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="guest"]')).not.toBeNull()

    const select = container.querySelector('[data-testid="role-select"]') as HTMLSelectElement
    select.value = 'admin'
    select.dispatchEvent(new Event('change'))
    await tick()

    expect(container.querySelector('[data-testid="admin"]')).not.toBeNull()
  })
})
