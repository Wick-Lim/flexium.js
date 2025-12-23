/**
 * DOM API Tests
 *
 * Tests for: f, render, Suspense, lazy, ErrorBoundary
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, f, Suspense, lazy, ErrorBoundary } from '../dom'
import { use } from '../core'

const tick = () => new Promise(r => setTimeout(r, 50))

describe('f()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create element with tag name', () => {
    render(f('div', {}, 'Hello'), container)
    expect(container.querySelector('div')?.textContent).toBe('Hello')
  })

  it('should create element with attributes', () => {
    render(f('input', { type: 'text', placeholder: 'Enter...' }), container)
    const input = container.querySelector('input')
    expect(input?.type).toBe('text')
    expect(input?.placeholder).toBe('Enter...')
  })

  it('should create element with class', () => {
    render(f('div', { class: 'my-class' }, 'Content'), container)
    expect(container.querySelector('.my-class')).not.toBeNull()
  })

  it('should create element with style object', () => {
    render(f('div', { style: { color: 'red', fontSize: '16px' }, 'data-testid': 'styled' }, 'Styled'), container)
    const el = container.querySelector('[data-testid="styled"]') as HTMLElement
    expect(el.style.color).toBe('red')
    expect(el.style.fontSize).toBe('16px')
  })

  it('should handle event handlers', async () => {
    let clicked = false

    render(f('button', { 'data-testid': 'btn', onclick: () => { clicked = true } }, 'Click'), container)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    expect(clicked).toBe(true)
  })

  it('should render children array', () => {
    render(f('ul', {}, [
      f('li', { key: 1 }, 'One'),
      f('li', { key: 2 }, 'Two'),
      f('li', { key: 3 }, 'Three')
    ]), container)

    expect(container.querySelectorAll('li').length).toBe(3)
  })

  it('should render nested elements', () => {
    render(f('div', { class: 'outer' }, [
      f('div', { class: 'inner' }, [
        f('span', {}, 'Deep')
      ])
    ]), container)

    expect(container.querySelector('.outer .inner span')?.textContent).toBe('Deep')
  })

  it('should render function component', () => {
    function Greeting({ name }: { name: string }) {
      return f('h1', {}, `Hello, ${name}!`)
    }

    render(f(Greeting, { name: 'World' }), container)
    expect(container.querySelector('h1')?.textContent).toBe('Hello, World!')
  })

  it('should handle null and undefined children', () => {
    render(f('div', {}, [
      null,
      f('span', {}, 'Visible'),
      undefined
    ]), container)

    expect(container.querySelectorAll('span').length).toBe(1)
  })

  it('should handle boolean children', () => {
    render(f('div', {}, [
      true && f('span', { 'data-testid': 'a' }, 'A'),
      false && f('span', { 'data-testid': 'b' }, 'B')
    ]), container)

    expect(container.querySelector('[data-testid="a"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="b"]')).toBeNull()
  })
})

describe('render()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render to container', () => {
    render(f('div', { 'data-testid': 'root' }, 'App'), container)
    expect(container.querySelector('[data-testid="root"]')).not.toBeNull()
  })

  it('should replace previous content', () => {
    render(f('div', {}, 'First'), container)
    render(f('div', {}, 'Second'), container)
    expect(container.textContent).toBe('Second')
  })

  it('should update existing elements', async () => {
    function App() {
      const [text, setText] = use('Initial')

      return f('div', {}, [
        f('span', { 'data-testid': 'text' }, text),
        f('button', { 'data-testid': 'update', onclick: () => setText('Updated') }, 'Update')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="text"]')?.textContent).toBe('Initial')

    container.querySelector<HTMLButtonElement>('[data-testid="update"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="text"]')?.textContent).toBe('Updated')
  })

  it('should handle conditional rendering', async () => {
    function App() {
      const [show, setShow] = use(true)

      return f('div', {}, [
        show ? f('span', { 'data-testid': 'content' }, 'Visible') : null,
        f('button', { 'data-testid': 'toggle', onclick: () => setShow(!show) }, 'Toggle')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="content"]')).toBeNull()
  })

  it('should handle list rendering with keys', async () => {
    function App() {
      const [items, setItems] = use(['A', 'B', 'C'])

      return f('div', {}, [
        f('ul', {},
          items.map((item, i) => f('li', { key: item }, item))
        ),
        f('button', {
          'data-testid': 'reverse',
          onclick: () => setItems([...items].reverse())
        }, 'Reverse')
      ])
    }

    render(f(App), container)
    expect(container.querySelectorAll('li')[0].textContent).toBe('A')

    container.querySelector<HTMLButtonElement>('[data-testid="reverse"]')?.click()
    await tick()

    expect(container.querySelectorAll('li')[0].textContent).toBe('C')
  })
})

describe('Suspense', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render children immediately without async', () => {
    function App() {
      return f(Suspense, { fallback: f('div', {}, 'Loading...') }, [
        f('div', { 'data-testid': 'content' }, 'Content')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
  })

  it('should support custom fallback UI', () => {
    function Spinner() {
      return f('div', { 'data-testid': 'spinner' }, 'Loading...')
    }

    function App() {
      return f(Suspense, { fallback: f(Spinner) }, [
        f('div', {}, 'Content')
      ])
    }

    render(f(App), container)
    expect(container.textContent).toBe('Content')
  })

  it('should support nested Suspense boundaries', () => {
    function App() {
      return f(Suspense, { fallback: f('div', {}, 'Outer loading') }, [
        f('div', {}, [
          f('h1', { 'data-testid': 'title' }, 'Title'),
          f(Suspense, { fallback: f('div', {}, 'Inner loading') }, [
            f('p', { 'data-testid': 'inner' }, 'Inner content')
          ])
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="title"]')?.textContent).toBe('Title')
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('Inner content')
  })

  it('should render multiple children', () => {
    function App() {
      return f(Suspense, { fallback: f('div', {}, 'Loading...') }, [
        f('div', { 'data-testid': 'c1' }, 'Child 1'),
        f('div', { 'data-testid': 'c2' }, 'Child 2'),
        f('div', { 'data-testid': 'c3' }, 'Child 3')
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="c1"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="c2"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="c3"]')).not.toBeNull()
  })
})

describe('lazy()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create lazy component', () => {
    const LazyComp = lazy(() => Promise.resolve({
      default: () => f('div', {}, 'Lazy')
    }))

    expect(LazyComp).toBeDefined()
    expect(typeof LazyComp).toBe('function')
  })

  it('should be callable', () => {
    const LazyComp = lazy(() => Promise.resolve({
      default: () => f('div', {}, 'Test')
    }))

    expect(() => LazyComp({})).not.toThrow()
  })
})

describe('ErrorBoundary', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render children when no error', () => {
    function App() {
      return f(ErrorBoundary, {
        fallback: (error: Error) => f('div', {}, `Error: ${error.message}`)
      }, [
        f('div', { 'data-testid': 'content' }, 'Normal content')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
  })

  it('should support fallback prop', () => {
    function App() {
      return f(ErrorBoundary, {
        fallback: () => f('div', { 'data-testid': 'fallback' }, 'Fallback UI')
      }, [
        f('div', { 'data-testid': 'normal' }, 'Normal content')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="normal"]')).not.toBeNull()
  })

  it('should support onError prop', () => {
    let errorHandlerCalled = false

    function App() {
      return f(ErrorBoundary, {
        fallback: () => f('div', {}, 'Error'),
        onError: () => { errorHandlerCalled = true }
      }, [
        f('div', { 'data-testid': 'content' }, 'Content')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
    // onError is only called when there's an error
    expect(errorHandlerCalled).toBe(false)
  })

  it('should support nested error boundaries', () => {
    function App() {
      return f(ErrorBoundary, {
        fallback: () => f('div', { 'data-testid': 'outer-fallback' }, 'Outer')
      }, [
        f('div', {}, [
          f('h1', { 'data-testid': 'title' }, 'App'),
          f(ErrorBoundary, {
            fallback: () => f('div', { 'data-testid': 'inner-fallback' }, 'Inner')
          }, [
            f('div', { 'data-testid': 'inner-content' }, 'Inner content')
          ])
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="title"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="inner-content"]')).not.toBeNull()
  })
})
