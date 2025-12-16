/**
 * Lifecycle API Tests (effect, sync)
 *
 * 공개 API 동작에 집중 - 내부 구현이 바뀌어도 테스트는 유지되어야 함
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { state, effect, sync } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('effect()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should run effect on mount', () => {
    const effectFn = vi.fn()

    function App() {
      effect(effectFn)
      return f('div', {}, 'Hello')
    }

    render(f(App), container)
    expect(effectFn).toHaveBeenCalledTimes(1)
  })

  it('should run effect on every render without deps', async () => {
    const effectFn = vi.fn()

    function App() {
      const [count, setCount] = state(0)
      effect(effectFn)

      return f('div', {}, [
        f('span', {}, String(count)),
        f('button', { 'data-testid': 'btn', onclick: () => setCount(count + 1) }, '+')
      ])
    }

    render(f(App), container)
    expect(effectFn).toHaveBeenCalledTimes(1)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(effectFn).toHaveBeenCalledTimes(2)
  })

  it('should run effect only once with empty deps', async () => {
    const effectFn = vi.fn()

    function App() {
      const [count, setCount] = state(0)
      effect(effectFn, [])

      return f('div', {}, [
        f('span', {}, String(count)),
        f('button', { 'data-testid': 'btn', onclick: () => setCount(count + 1) }, '+')
      ])
    }

    render(f(App), container)
    expect(effectFn).toHaveBeenCalledTimes(1)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    // deps=[] 이므로 다시 실행되지 않음
    expect(effectFn).toHaveBeenCalledTimes(1)
  })

  it('should run effect when deps change', async () => {
    const effectFn = vi.fn()

    function App() {
      const [count, setCount] = state(0)
      effect(() => {
        effectFn(count)
      }, [count])

      return f('button', { 'data-testid': 'btn', onclick: () => setCount(count + 1) }, String(count))
    }

    render(f(App), container)
    expect(effectFn).toHaveBeenCalledTimes(1)
    expect(effectFn).toHaveBeenLastCalledWith(0)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(effectFn).toHaveBeenCalledTimes(2)
    expect(effectFn).toHaveBeenLastCalledWith(1)
  })

  it('should not run effect when deps are same', async () => {
    const effectFn = vi.fn()

    function App() {
      const [a, setA] = state(0)
      const [b] = state('constant')

      effect(() => {
        effectFn(b)
      }, [b]) // b는 변하지 않음

      return f('button', { 'data-testid': 'btn', onclick: () => setA(a + 1) }, String(a))
    }

    render(f(App), container)
    expect(effectFn).toHaveBeenCalledTimes(1)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    // b가 변하지 않았으므로 effect 재실행 안됨
    expect(effectFn).toHaveBeenCalledTimes(1)
  })

  it('should call cleanup function before re-run', async () => {
    const calls: string[] = []

    function App() {
      const [count, setCount] = state(0)

      effect(() => {
        calls.push(`effect-${count}`)
        return () => {
          calls.push(`cleanup-${count}`)
        }
      }, [count])

      return f('button', { 'data-testid': 'btn', onclick: () => setCount(count + 1) }, String(count))
    }

    render(f(App), container)
    expect(calls).toEqual(['effect-0'])

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(calls).toEqual(['effect-0', 'cleanup-0', 'effect-1'])
  })

  it('should work with DOM side effects', async () => {
    function App() {
      const [title, setTitle] = state('Initial')

      effect(() => {
        document.title = title
      }, [title])

      return f('button', {
        'data-testid': 'btn',
        onclick: () => setTitle('Updated')
      }, title)
    }

    render(f(App), container)
    expect(document.title).toBe('Initial')

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(document.title).toBe('Updated')
  })

  it('should handle multiple effects independently', async () => {
    const effect1 = vi.fn()
    const effect2 = vi.fn()

    function App() {
      const [a, setA] = state(0)
      const [b, setB] = state(0)

      effect(() => effect1(a), [a])
      effect(() => effect2(b), [b])

      return f('div', {}, [
        f('button', { 'data-testid': 'btn-a', onclick: () => setA(a + 1) }, 'A'),
        f('button', { 'data-testid': 'btn-b', onclick: () => setB(b + 1) }, 'B')
      ])
    }

    render(f(App), container)
    expect(effect1).toHaveBeenCalledTimes(1)
    expect(effect2).toHaveBeenCalledTimes(1)

    container.querySelector<HTMLButtonElement>('[data-testid="btn-a"]')?.click()
    await nextTick()

    expect(effect1).toHaveBeenCalledTimes(2)
    expect(effect2).toHaveBeenCalledTimes(1) // b는 변하지 않음
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

  it('should force immediate update', async () => {
    let setValue: any

    function App() {
      const [count, setCount] = state(0)
      setValue = setCount
      return f('div', { 'data-testid': 'count' }, String(count))
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0')

    setValue(1)
    // 동기적으로 flush
    sync()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')
  })
})
