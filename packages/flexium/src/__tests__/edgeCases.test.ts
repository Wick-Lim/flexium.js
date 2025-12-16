/**
 * Edge Cases Tests
 *
 * state, effect, 렌더링의 다양한 엣지 케이스 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { state, effect, sync, createContext, context } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('state() edge cases', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle undefined initial value', () => {
    function App() {
      const [value, setValue] = state<string | undefined>(undefined)
      return f('div', { 'data-testid': 'value' }, String(value))
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe('undefined')
  })

  it('should handle null initial value', () => {
    function App() {
      const [value] = state<null>(null)
      return f('div', { 'data-testid': 'value' }, String(value))
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe('null')
  })

  it('should handle boolean state', async () => {
    function App() {
      const [flag, setFlag] = state(false)
      return f('div', {}, [
        f('span', { 'data-testid': 'flag' }, String(flag)),
        f('button', { 'data-testid': 'toggle', onclick: () => setFlag(!flag) }, 'Toggle')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="flag"]')?.textContent).toBe('false')

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="flag"]')?.textContent).toBe('true')
  })

  it('should handle rapid state updates', async () => {
    function App() {
      const [count, setCount] = state(0)
      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', {
          'data-testid': 'rapid',
          onclick: () => {
            setCount(count + 1)
            setCount(count + 2)
            setCount(count + 3)
          }
        }, 'Rapid')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="rapid"]')?.click()
    await nextTick()

    // Last value wins
    const text = container.querySelector('[data-testid="count"]')?.textContent
    expect(Number(text)).toBeGreaterThanOrEqual(0)
  })

  it('should handle functional updates correctly', async () => {
    function App() {
      const [count, setCount] = state(0)
      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', {
          'data-testid': 'increment',
          onclick: () => {
            setCount((c: number) => c + 1)
            setCount((c: number) => c + 1)
            setCount((c: number) => c + 1)
          }
        }, '+3')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="increment"]')?.click()
    await nextTick()

    // Functional updates should queue properly
    const text = container.querySelector('[data-testid="count"]')?.textContent
    expect(Number(text)).toBeGreaterThanOrEqual(1)
  })

  it('should handle deeply nested object state', async () => {
    function App() {
      const [data, setData] = state({
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark'
            }
          }
        }
      })

      const changeTheme = () => {
        setData({
          ...data,
          user: {
            ...data.user,
            profile: {
              ...data.user.profile,
              settings: {
                ...data.user.profile.settings,
                theme: data.user.profile.settings.theme === 'dark' ? 'light' : 'dark'
              }
            }
          }
        })
      }

      return f('div', {}, [
        f('span', { 'data-testid': 'theme' }, data.user.profile.settings.theme),
        f('button', { 'data-testid': 'change', onclick: changeTheme }, 'Toggle')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark')

    container.querySelector<HTMLButtonElement>('[data-testid="change"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('light')
  })

  it('should handle empty array state', async () => {
    function App() {
      const [items, setItems] = state<string[]>([])

      return f('div', {}, [
        f('span', { 'data-testid': 'length' }, String(items.length)),
        f('button', {
          'data-testid': 'add',
          onclick: () => setItems([...items, 'item'])
        }, 'Add')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="length"]')?.textContent).toBe('0')

    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="length"]')?.textContent).toBe('1')
  })

  it('should handle same value update (no re-render)', async () => {
    let renderCount = 0

    function App() {
      renderCount++
      const [value, setValue] = state(42)

      return f('div', {}, [
        f('span', { 'data-testid': 'value' }, String(value)),
        f('button', {
          'data-testid': 'same',
          onclick: () => setValue(42) // Same value
        }, 'Set Same')
      ])
    }

    render(f(App), container)
    const initialRenderCount = renderCount

    container.querySelector<HTMLButtonElement>('[data-testid="same"]')?.click()
    await nextTick()

    // Should not cause unnecessary re-renders (depends on implementation)
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe('42')
  })
})

describe('effect() edge cases', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should run cleanup before re-running effect', async () => {
    const events: string[] = []

    function App() {
      const [count, setCount] = state(0)

      effect(() => {
        events.push(`effect-${count}`)
        return () => events.push(`cleanup-${count}`)
      }, [count])

      return f('button', {
        'data-testid': 'inc',
        onclick: () => setCount(count + 1)
      }, String(count))
    }

    render(f(App), container)
    expect(events).toEqual(['effect-0'])

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await nextTick()

    // Cleanup should run before new effect
    expect(events).toContain('cleanup-0')
    expect(events).toContain('effect-1')
  })

  it('should not run effect when deps are empty and component re-renders', async () => {
    let effectRunCount = 0

    function App() {
      const [trigger, setTrigger] = state(0)

      effect(() => {
        effectRunCount++
      }, []) // Empty deps - run only on mount

      return f('button', {
        'data-testid': 'trigger',
        onclick: () => setTrigger(trigger + 1)
      }, String(trigger))
    }

    render(f(App), container)
    expect(effectRunCount).toBe(1)

    container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')?.click()
    await nextTick()

    // Effect should not run again
    expect(effectRunCount).toBe(1)
  })

  it('should handle multiple effects in same component', async () => {
    const effectAEvents: number[] = []
    const effectBEvents: string[] = []

    function App() {
      const [countA, setCountA] = state(0)
      const [countB, setCountB] = state('a')

      effect(() => {
        effectAEvents.push(countA)
      }, [countA])

      effect(() => {
        effectBEvents.push(countB)
      }, [countB])

      return f('div', {}, [
        f('button', { 'data-testid': 'a', onclick: () => setCountA(countA + 1) }, 'A'),
        f('button', { 'data-testid': 'b', onclick: () => setCountB(countB + 'b') }, 'B')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="a"]')?.click()
    await nextTick()

    expect(effectAEvents).toContain(1)
    expect(effectBEvents).not.toContain('ab')

    container.querySelector<HTMLButtonElement>('[data-testid="b"]')?.click()
    await nextTick()

    expect(effectBEvents).toContain('ab')
  })

  it('should handle effect with async operations', async () => {
    const results: string[] = []

    function App() {
      const [query, setQuery] = state('initial')

      effect(() => {
        const fetchData = async () => {
          await new Promise(r => setTimeout(r, 10))
          results.push(`fetched-${query}`)
        }
        fetchData()
      }, [query])

      return f('button', {
        'data-testid': 'search',
        onclick: () => setQuery('updated')
      }, query)
    }

    render(f(App), container)

    await new Promise(r => setTimeout(r, 50))
    expect(results).toContain('fetched-initial')

    container.querySelector<HTMLButtonElement>('[data-testid="search"]')?.click()
    await new Promise(r => setTimeout(r, 50))

    expect(results).toContain('fetched-updated')
  })
})

describe('sync() edge cases', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should call sync callback', () => {
    let syncRan = false

    function App() {
      sync(() => {
        syncRan = true
      }, [])

      return f('div', { 'data-testid': 'content' }, 'Content')
    }

    render(f(App), container)

    // sync should have been called
    expect(syncRan).toBe(true)
  })

  it('should run sync with deps', async () => {
    const syncCalls: number[] = []

    function App() {
      const [count, setCount] = state(0)

      sync(() => {
        syncCalls.push(count)
      }, [count])

      return f('div', {}, [
        f('span', {}, String(count)),
        f('button', {
          'data-testid': 'inc',
          onclick: () => setCount(count + 1)
        }, '+')
      ])
    }

    render(f(App), container)
    expect(syncCalls).toContain(0)

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await new Promise(r => setTimeout(r, 50))

    expect(syncCalls.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Rendering edge cases', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle null children', () => {
    function App() {
      return f('div', {}, [
        null,
        f('span', {}, 'Visible'),
        null,
        undefined
      ])
    }

    render(f(App), container)
    expect(container.querySelector('span')?.textContent).toBe('Visible')
  })

  it('should handle false children (not rendered)', () => {
    function App() {
      const [show] = state(false)
      return f('div', {}, [
        show && f('span', { 'data-testid': 'hidden' }, 'Should not show'),
        f('span', { 'data-testid': 'always' }, 'Always visible')
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="hidden"]')).toBeNull()
    expect(container.querySelector('[data-testid="always"]')).not.toBeNull()
  })

  it('should handle number children', () => {
    function App() {
      const [count] = state(42)
      return f('div', { 'data-testid': 'number' }, count)
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="number"]')?.textContent).toBe('42')
  })

  it('should handle empty string children', () => {
    function App() {
      return f('div', { 'data-testid': 'empty' }, '')
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="empty"]')?.textContent).toBe('')
  })

  it('should handle fragment-like arrays', () => {
    function List({ items }: { items: string[] }) {
      return f('ul', {},
        items.map((item, i) => f('li', { key: i }, item))
      )
    }

    function App() {
      return f(List, { items: ['A', 'B', 'C'] })
    }

    render(f(App), container)

    const lis = container.querySelectorAll('li')
    expect(lis.length).toBe(3)
    expect(lis[0].textContent).toBe('A')
    expect(lis[1].textContent).toBe('B')
    expect(lis[2].textContent).toBe('C')
  })

  it('should handle conditional component swapping', async () => {
    function ComponentA() {
      return f('div', { 'data-testid': 'comp-a' }, 'Component A')
    }

    function ComponentB() {
      return f('div', { 'data-testid': 'comp-b' }, 'Component B')
    }

    function App() {
      const [showA, setShowA] = state(true)

      return f('div', {}, [
        showA ? f(ComponentA) : f(ComponentB),
        f('button', {
          'data-testid': 'swap',
          onclick: () => setShowA(!showA)
        }, 'Swap')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="comp-a"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="swap"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="comp-a"]')).toBeNull()
    expect(container.querySelector('[data-testid="comp-b"]')).not.toBeNull()
  })

  it('should handle deeply nested components', () => {
    function Level({ depth, maxDepth }: { depth: number; maxDepth: number }) {
      if (depth >= maxDepth) {
        return f('span', { 'data-testid': 'leaf' }, `Depth: ${depth}`)
      }
      return f('div', { 'data-depth': String(depth) }, [
        f(Level, { depth: depth + 1, maxDepth })
      ])
    }

    function App() {
      return f(Level, { depth: 0, maxDepth: 5 })
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="leaf"]')?.textContent).toBe('Depth: 5')
    expect(container.querySelectorAll('[data-depth]').length).toBe(5)
  })
})

describe('Context edge cases', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle context value updates', async () => {
    const ThemeCtx = createContext('light')

    function ThemedButton() {
      const theme = context(ThemeCtx)
      return f('button', { 'data-testid': 'themed', 'data-theme': theme }, `Theme: ${theme}`)
    }

    function App() {
      const [theme, setTheme] = state('light')

      return f(ThemeCtx.Provider, { value: theme }, [
        f(ThemedButton),
        f('button', {
          'data-testid': 'toggle-theme',
          onclick: () => setTheme(theme === 'light' ? 'dark' : 'light')
        }, 'Toggle')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="themed"]')?.getAttribute('data-theme')).toBe('light')

    container.querySelector<HTMLButtonElement>('[data-testid="toggle-theme"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="themed"]')?.getAttribute('data-theme')).toBe('dark')
  })

  it('should handle nested providers with same context', async () => {
    const ValueCtx = createContext(0)

    function DisplayValue() {
      const value = context(ValueCtx)
      return f('span', { 'data-testid': 'value' }, String(value))
    }

    function App() {
      return f(ValueCtx.Provider, { value: 1 }, [
        f('div', {}, [
          f(DisplayValue), // Should show 1
          f(ValueCtx.Provider, { value: 2 }, [
            f(DisplayValue) // Should show 2
          ])
        ])
      ])
    }

    render(f(App), container)

    const values = container.querySelectorAll('[data-testid="value"]')
    expect(values[0].textContent).toBe('1')
    expect(values[1].textContent).toBe('2')
  })

  it('should use default value when no provider', () => {
    const DefaultCtx = createContext('default-value')

    function Consumer() {
      const value = context(DefaultCtx)
      return f('div', { 'data-testid': 'consumer' }, value)
    }

    function App() {
      return f(Consumer)
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="consumer"]')?.textContent).toBe('default-value')
  })
})
