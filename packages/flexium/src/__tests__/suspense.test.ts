/**
 * Suspense & lazy() Tests
 *
 * 코드 스플리팅과 로딩 상태 처리 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, f, Suspense, lazy } from '../dom'
import { state } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 50))

describe('Suspense', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render children when no lazy components', () => {
    function RegularComponent() {
      return f('div', { 'data-testid': 'regular' }, 'Regular content')
    }

    function App() {
      return f(Suspense, {
        fallback: f('div', {}, 'Loading...')
      }, [
        f(RegularComponent)
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="regular"]')).not.toBeNull()
    expect(container.textContent).toBe('Regular content')
  })

  it('should render children immediately without lazy', () => {
    function App() {
      return f(Suspense, {
        fallback: f('div', { 'data-testid': 'loading' }, 'Loading...')
      }, [
        f('div', { 'data-testid': 'content' }, 'Content')
      ])
    }

    render(f(App), container)

    // Without lazy, content should render immediately
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
  })

  it('should support custom loading UI', () => {
    function Spinner() {
      return f('div', { class: 'spinner', 'data-testid': 'spinner' }, '⏳')
    }

    function App() {
      return f(Suspense, {
        fallback: f(Spinner)
      }, [
        f('div', {}, 'Main content')
      ])
    }

    render(f(App), container)

    expect(container.textContent).toBe('Main content')
  })

  it('should handle nested Suspense boundaries', () => {
    function App() {
      return f(Suspense, {
        fallback: f('div', { 'data-testid': 'outer-loading' }, 'Outer loading...')
      }, [
        f('div', {}, [
          f('h1', {}, 'Title'),
          f(Suspense, {
            fallback: f('div', { 'data-testid': 'inner-loading' }, 'Inner loading...')
          }, [
            f('p', { 'data-testid': 'inner-content' }, 'Inner content')
          ])
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('h1')?.textContent).toBe('Title')
    expect(container.querySelector('[data-testid="inner-content"]')?.textContent).toBe('Inner content')
  })

  it('should support multiple children', () => {
    function App() {
      return f(Suspense, {
        fallback: f('div', {}, 'Loading...')
      }, [
        f('div', { 'data-testid': 'child-1' }, 'First'),
        f('div', { 'data-testid': 'child-2' }, 'Second'),
        f('div', { 'data-testid': 'child-3' }, 'Third')
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="child-1"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="child-2"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="child-3"]')).not.toBeNull()
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

  it('should create a lazy component function', () => {
    const LazyComponent = lazy(() =>
      Promise.resolve({
        default: () => f('div', { 'data-testid': 'lazy' }, 'Lazy loaded!')
      })
    )

    expect(LazyComponent).toBeDefined()
    expect(typeof LazyComponent).toBe('function')
  })

  it('should be callable', () => {
    const LazyComponent = lazy(() =>
      Promise.resolve({
        default: () => f('div', {}, 'Test')
      })
    )

    // Lazy components should be callable
    expect(() => LazyComponent({})).not.toThrow()
  })
})

describe('Suspense - Loading patterns', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle conditional rendering inside Suspense', async () => {
    function App() {
      const [show, setShow] = state(false)

      return f('div', {}, [
        f('button', {
          'data-testid': 'toggle',
          onclick: () => setShow(!show)
        }, 'Toggle'),
        f(Suspense, {
          fallback: f('div', {}, 'Loading...')
        }, [
          show
            ? f('div', { 'data-testid': 'shown' }, 'Shown content')
            : f('div', { 'data-testid': 'hidden' }, 'Hidden content')
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="hidden"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="shown"]')).not.toBeNull()
  })

  it('should support skeleton UI pattern', () => {
    function Skeleton() {
      return f('div', { class: 'skeleton' }, [
        f('div', { class: 'skeleton-avatar', 'data-testid': 'skeleton-avatar' }),
        f('div', { class: 'skeleton-text', 'data-testid': 'skeleton-text' }),
        f('div', { class: 'skeleton-text' })
      ])
    }

    function Profile() {
      return f('div', { class: 'profile' }, [
        f('img', { class: 'avatar', 'data-testid': 'real-avatar' }),
        f('h1', { 'data-testid': 'real-name' }, 'John Doe')
      ])
    }

    function App() {
      const [isLoading, setIsLoading] = state(true)

      return f('div', {}, [
        f('button', {
          'data-testid': 'load',
          onclick: () => setIsLoading(false)
        }, 'Load'),
        isLoading ? f(Skeleton) : f(Profile)
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="skeleton-avatar"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="real-avatar"]')).toBeNull()
  })

  it('should handle list with loading states', async () => {
    function App() {
      const [items, setItems] = state<string[]>([])
      const [loading, setLoading] = state(true)

      const load = async () => {
        setLoading(true)
        await new Promise(r => setTimeout(r, 10))
        setItems(['Item 1', 'Item 2', 'Item 3'])
        setLoading(false)
      }

      return f('div', {}, [
        f('button', {
          'data-testid': 'load-btn',
          onclick: load
        }, 'Load Items'),
        f(Suspense, {
          fallback: f('div', { 'data-testid': 'list-loading' }, 'Loading list...')
        }, [
          loading
            ? f('div', { 'data-testid': 'empty' }, 'No items')
            : f('ul', { 'data-testid': 'list' },
                items.map((item, i) => f('li', { key: i }, item))
              )
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="empty"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="load-btn"]')?.click()
    await new Promise(r => setTimeout(r, 100))

    expect(container.querySelector('[data-testid="list"]')).not.toBeNull()
    expect(container.querySelectorAll('li').length).toBe(3)
  })
})
