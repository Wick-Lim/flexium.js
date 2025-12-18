/**
 * Server API Tests
 *
 * Tests for: renderToString, renderToStaticMarkup, hydrate, getIsServer
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { f, hydrate } from '../dom'
import { renderToString, renderToStaticMarkup, getIsServer } from '../server'
import { useState } from '../core'
import { createContext, useContext } from '../advanced'

const tick = () => new Promise(r => setTimeout(r, 50))

describe('renderToString()', () => {
  it('should render element to HTML string', () => {
    const result = renderToString(f('div', {}, 'Hello'))
    expect(result.html).toContain('Hello')
    expect(result.html).toContain('<div')
    expect(result.html).toContain('</div>')
  })

  it('should render with attributes', () => {
    const result = renderToString(f('div', { class: 'test', id: 'main' }, 'Content'))
    expect(result.html).toContain('class="test"')
    expect(result.html).toContain('id="main"')
  })

  it('should render nested elements', () => {
    const result = renderToString(
      f('div', { class: 'outer' }, [
        f('span', { class: 'inner' }, 'Text')
      ])
    )
    expect(result.html).toContain('<div')
    expect(result.html).toContain('<span')
    expect(result.html).toContain('Text')
  })

  it('should render function components', () => {
    function Greeting({ name }: { name: string }) {
      return f('h1', {}, `Hello, ${name}!`)
    }

    const result = renderToString(f(Greeting, { name: 'World' }))
    expect(result.html).toContain('Hello, World!')
    expect(result.html).toContain('<h1')
  })

  it('should render with state (initial value)', () => {
    function Counter() {
      const [count] = useState(42)
      return f('span', {}, String(count))
    }

    const result = renderToString(f(Counter))
    expect(result.html).toContain('42')
  })

  it('should render with context', () => {
    const ThemeCtx = createContext('light')

    function ThemedDiv() {
      const theme = useContext(ThemeCtx)
      return f('div', { class: theme }, 'Content')
    }

    const result = renderToString(
      f(ThemeCtx.Provider, { value: 'dark' }, [
        f(ThemedDiv)
      ])
    )
    expect(result.html).toContain('class="dark"')
  })

  it('should handle conditional rendering', () => {
    function App({ show }: { show: boolean }) {
      return f('div', {}, [
        show ? f('span', {}, 'Visible') : null
      ])
    }

    const resultWithContent = renderToString(f(App, { show: true }))
    expect(resultWithContent.html).toContain('Visible')

    const resultWithoutContent = renderToString(f(App, { show: false }))
    expect(resultWithoutContent.html).not.toContain('Visible')
  })

  it('should render lists', () => {
    function List({ items }: { items: string[] }) {
      return f('ul', {},
        items.map((item, i) => f('li', { key: i }, item))
      )
    }

    const result = renderToString(f(List, { items: ['A', 'B', 'C'] }))
    expect(result.html).toContain('<ul')
    expect(result.html).toContain('<li')
    expect(result.html).toContain('A')
    expect(result.html).toContain('B')
    expect(result.html).toContain('C')
  })

  it('should escape special characters', () => {
    const result = renderToString(f('div', {}, '<script>alert("xss")</script>'))
    expect(result.html).not.toContain('<script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('should render style objects', () => {
    const result = renderToString(
      f('div', { style: { color: 'red', fontSize: '16px' } }, 'Styled')
    )
    expect(result.html).toContain('style=')
    expect(result.html).toContain('color')
    expect(result.html).toContain('red')
  })
})

describe('renderToStaticMarkup()', () => {
  it('should render without hydration markers', () => {
    const html = renderToStaticMarkup(f('div', {}, 'Static'))
    expect(html).toContain('Static')
    expect(html).not.toContain('data-fid')
  })

  it('should render complete HTML structure', () => {
    function Page() {
      return f('html', {}, [
        f('head', {}, [
          f('title', {}, 'My Page')
        ]),
        f('body', {}, [
          f('h1', {}, 'Welcome')
        ])
      ])
    }

    const html = renderToStaticMarkup(f(Page))
    expect(html).toContain('<html')
    expect(html).toContain('<head')
    expect(html).toContain('<title')
    expect(html).toContain('<body')
    expect(html).toContain('Welcome')
  })
})

describe('hydrate()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should hydrate server-rendered HTML', () => {
    // Simulate server-rendered HTML
    container.innerHTML = '<div data-testid="app">Server content</div>'

    function App() {
      return f('div', { 'data-testid': 'app' }, 'Server content')
    }

    hydrate(f(App), container)
    expect(container.querySelector('[data-testid="app"]')).not.toBeNull()
  })

  it('should attach event handlers after hydration', async () => {
    let clicked = false
    container.innerHTML = '<button data-testid="btn">Click</button>'

    function App() {
      return f('button', {
        'data-testid': 'btn',
        onclick: () => { clicked = true }
      }, 'Click')
    }

    hydrate(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    expect(clicked).toBe(true)
  })
})

describe('getIsServer()', () => {
  it('should return false in browser environment', () => {
    // In jsdom, window is defined
    expect(getIsServer()).toBe(false)
  })
})
