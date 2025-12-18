/**
 * Core API Tests
 *
 * Tests for: useState, useEffect, sync, useRef, createContext, useContext
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { useState, useEffect, sync, useRef } from '../core'
import { createContext, useContext } from '../advanced'

const tick = () => new Promise(r => setTimeout(r, 50))

describe('useState()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create reactive state with initial value', () => {
    let capturedValue: number | null = null

    function App() {
      const [count] = useState(0)
      capturedValue = count
      return f('div', {}, String(count))
    }

    render(f(App), container)
    expect(capturedValue).toBe(0)
    expect(container.textContent).toBe('0')
  })

  it('should update state and re-render', async () => {
    function Counter() {
      const [count, setCount] = useState(0)

      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', { 'data-testid': 'inc', onclick: () => setCount(count + 1) }, '+')
      ])
    }

    render(f(Counter), container)
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0')

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')
  })

  it('should support functional updates', async () => {
    function Counter() {
      const [count, setCount] = useState(0)

      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', { 'data-testid': 'inc', onclick: () => setCount(c => c + 1) }, '+')
      ])
    }

    render(f(Counter), container)

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('2')
  })

  it('should handle object state', async () => {
    function UserForm() {
      const [user, setUser] = useState({ name: '', email: '' })

      return f('div', {}, [
        f('span', { 'data-testid': 'name' }, user.name),
        f('button', {
          'data-testid': 'set-name',
          onclick: () => setUser({ ...user, name: 'John' })
        }, 'Set Name')
      ])
    }

    render(f(UserForm), container)
    expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('')

    container.querySelector<HTMLButtonElement>('[data-testid="set-name"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('John')
  })

  it('should handle array state', async () => {
    function TodoList() {
      const [items, setItems] = useState<string[]>([])

      return f('div', {}, [
        f('ul', { 'data-testid': 'list' },
          items.map((item, i) => f('li', { key: i }, item))
        ),
        f('button', {
          'data-testid': 'add',
          onclick: () => setItems([...items, `Item ${items.length + 1}`])
        }, 'Add')
      ])
    }

    render(f(TodoList), container)
    expect(container.querySelectorAll('li').length).toBe(0)

    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await tick()
    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await tick()

    expect(container.querySelectorAll('li').length).toBe(2)
  })
})

describe('useEffect()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should run effect after render', async () => {
    let effectRan = false

    function App() {
      useEffect(() => {
        effectRan = true
      }, [])

      return f('div', {}, 'Hello')
    }

    render(f(App), container)
    await tick()

    expect(effectRan).toBe(true)
  })

  it('should run effect when dependencies change', async () => {
    const effectCalls: number[] = []

    function App() {
      const [count, setCount] = useState(0)

      useEffect(() => {
        effectCalls.push(count)
      }, [count])

      return f('button', { 'data-testid': 'inc', onclick: () => setCount(count + 1) }, String(count))
    }

    render(f(App), container)
    await tick()
    expect(effectCalls).toContain(0)

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await tick()

    expect(effectCalls.length).toBeGreaterThanOrEqual(2)
  })

  it('should support cleanup function', async () => {
    // Test that cleanup function can be returned without error
    function App() {
      useEffect(() => {
        const handler = () => {}
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
      }, [])

      return f('div', { 'data-testid': 'app' }, 'App')
    }

    render(f(App), container)
    await tick()

    expect(container.querySelector('[data-testid="app"]')).not.toBeNull()
  })
})

describe('sync()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should run synchronously during render', () => {
    let syncRan = false

    function App() {
      sync(() => {
        syncRan = true
      })

      return f('div', {}, 'Hello')
    }

    render(f(App), container)
    expect(syncRan).toBe(true)
  })

  it('should run on each render', async () => {
    const syncCalls: number[] = []

    function App() {
      const [count, setCount] = useState(0)

      sync(() => {
        syncCalls.push(count)
      })

      return f('button', { 'data-testid': 'inc', onclick: () => setCount(count + 1) }, String(count))
    }

    render(f(App), container)
    expect(syncCalls).toContain(0)

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await tick()

    expect(syncCalls.length).toBeGreaterThanOrEqual(2)
  })
})

describe('useRef()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create ref with initial value', () => {
    let capturedValue: number | null = null

    function App() {
      const myRef = useRef(42)
      capturedValue = myRef.current
      return f('div', {}, String(myRef.current ?? 0))
    }

    render(f(App), container)
    expect(capturedValue).toBe(42)
  })

  it('should attach ref to DOM element', async () => {
    let element: HTMLInputElement | null = null

    function App() {
      const inputRef = useRef<HTMLInputElement | null>(null)

      return f('div', {}, [
        f('input', { ref: inputRef, 'data-testid': 'input' }),
        f('button', {
          'data-testid': 'focus',
          onclick: () => {
            element = inputRef.current
            inputRef.current?.focus()
          }
        }, 'Focus')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="focus"]')?.click()
    await tick()

    expect(element).not.toBeNull()
    expect(document.activeElement).toBe(element)
  })

  it('should persist value across renders', async () => {
    function App() {
      const renderCount = useRef<number>(0)
      const [, setTrigger] = useState(0)

      renderCount.current = (renderCount.current ?? 0) + 1

      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(renderCount.current)),
        f('button', { 'data-testid': 'rerender', onclick: () => setTrigger(t => t + 1) }, 'Re-render')
      ])
    }

    render(f(App), container)
    const initial = container.querySelector('[data-testid="count"]')?.textContent

    container.querySelector<HTMLButtonElement>('[data-testid="rerender"]')?.click()
    await tick()

    const afterRerender = container.querySelector('[data-testid="count"]')?.textContent
    expect(Number(afterRerender)).toBeGreaterThan(Number(initial))
  })
})

describe('createContext() & useContext()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should provide and consume context', () => {
    const ThemeCtx = createContext('light')

    function ThemedButton() {
      const theme = useContext(ThemeCtx)
      return f('button', { 'data-testid': 'btn' }, `Theme: ${theme}`)
    }

    function App() {
      return f(ThemeCtx.Provider, { value: 'dark' }, [
        f(ThemedButton)
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="btn"]')?.textContent).toBe('Theme: dark')
  })

  it('should use default value when no provider', () => {
    const CountCtx = createContext(100)

    function Display() {
      const count = useContext(CountCtx)
      return f('span', { 'data-testid': 'count' }, String(count))
    }

    render(f(Display), container)
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('100')
  })

  it('should support nested providers', () => {
    const LevelCtx = createContext(0)

    function ShowLevel() {
      const level = useContext(LevelCtx)
      return f('span', { 'data-testid': 'level' }, String(level))
    }

    function App() {
      return f(LevelCtx.Provider, { value: 1 }, [
        f('div', {}, [
          f(LevelCtx.Provider, { value: 2 }, [
            f(ShowLevel)
          ])
        ])
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="level"]')?.textContent).toBe('2')
  })

  it('should update when context value changes', async () => {
    const UserCtx = createContext({ name: 'Guest' })

    function Greeting() {
      const user = useContext(UserCtx)
      return f('span', { 'data-testid': 'greeting' }, `Hello, ${user.name}`)
    }

    function App() {
      const [user, setUser] = useState({ name: 'Guest' })

      return f('div', {}, [
        f(UserCtx.Provider, { value: user }, [
          f(Greeting)
        ]),
        f('button', {
          'data-testid': 'login',
          onclick: () => setUser({ name: 'John' })
        }, 'Login')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="greeting"]')?.textContent).toBe('Hello, Guest')

    container.querySelector<HTMLButtonElement>('[data-testid="login"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="greeting"]')?.textContent).toBe('Hello, John')
  })
})
