/**
 * state() API Tests
 *
 * 공개 API 동작에 집중 - 내부 구현이 바뀌어도 테스트는 유지되어야 함
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { state } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('state() - Signal', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render initial value', () => {
    function App() {
      const [count] = state(0)
      return f('div', { 'data-testid': 'count' }, String(count))
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0')
  })

  it('should update when setter is called', async () => {
    function App() {
      const [count, setCount] = state(0)
      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', { 'data-testid': 'btn', onclick: () => setCount(count + 1) }, '+')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0')

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')
  })

  it('should support functional setter', async () => {
    function App() {
      const [count, setCount] = state(0)
      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', { 'data-testid': 'btn', onclick: () => setCount((c: number) => c + 10) }, '+10')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('10')

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('20')
  })

  it('should preserve state across re-renders', async () => {
    function App() {
      const [a, setA] = state(1)
      const [b, setB] = state(100)

      return f('div', {}, [
        f('span', { 'data-testid': 'a' }, String(a)),
        f('span', { 'data-testid': 'b' }, String(b)),
        f('button', { 'data-testid': 'btn-a', onclick: () => setA(a + 1) }, 'A+'),
        f('button', { 'data-testid': 'btn-b', onclick: () => setB(b + 1) }, 'B+')
      ])
    }

    render(f(App), container)

    // 초기값 확인
    expect(container.querySelector('[data-testid="a"]')?.textContent).toBe('1')
    expect(container.querySelector('[data-testid="b"]')?.textContent).toBe('100')

    // A만 증가
    container.querySelector<HTMLButtonElement>('[data-testid="btn-a"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="a"]')?.textContent).toBe('2')
    expect(container.querySelector('[data-testid="b"]')?.textContent).toBe('100') // B는 유지

    // B만 증가
    container.querySelector<HTMLButtonElement>('[data-testid="btn-b"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="a"]')?.textContent).toBe('2') // A는 유지
    expect(container.querySelector('[data-testid="b"]')?.textContent).toBe('101')
  })

  it('should handle object state', async () => {
    function App() {
      const [user, setUser] = state({ name: 'John', age: 20 })

      return f('div', {}, [
        f('span', { 'data-testid': 'name' }, user.name),
        f('span', { 'data-testid': 'age' }, String(user.age)),
        f('button', {
          'data-testid': 'btn',
          onclick: () => setUser({ name: 'Jane', age: 25 })
        }, 'Change')
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('John')
    expect(container.querySelector('[data-testid="age"]')?.textContent).toBe('20')

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('Jane')
    expect(container.querySelector('[data-testid="age"]')?.textContent).toBe('25')
  })

  it('should handle array state', async () => {
    function App() {
      const [items, setItems] = state<string[]>([])

      return f('div', {}, [
        f('ul', { 'data-testid': 'list' },
          items.map((item: string, i: number) => f('li', { key: i }, item))
        ),
        f('button', {
          'data-testid': 'add',
          onclick: () => setItems([...items, `Item ${items.length + 1}`])
        }, 'Add')
      ])
    }

    render(f(App), container)

    expect(container.querySelectorAll('li').length).toBe(0)

    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await nextTick()
    expect(container.querySelectorAll('li').length).toBe(1)

    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await nextTick()
    expect(container.querySelectorAll('li').length).toBe(2)
  })
})

describe('state() - Resource (async)', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should show loading state initially', () => {
    function App() {
      const [data, { loading }] = state(async () => {
        await new Promise(r => setTimeout(r, 100))
        return 'loaded'
      })

      return f('div', { 'data-testid': 'result' }, loading ? 'Loading...' : data)
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe('Loading...')
  })

  it('should show data after loading', async () => {
    function App() {
      const [data, { loading }] = state(async () => {
        await new Promise(r => setTimeout(r, 10))
        return 'Hello World'
      })

      return f('div', { 'data-testid': 'result' }, loading ? 'Loading...' : (data || ''))
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe('Loading...')

    await new Promise(r => setTimeout(r, 50))

    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe('Hello World')
  })

  it('should handle errors', async () => {
    function App() {
      const [data, { loading, error }] = state(async () => {
        await new Promise(r => setTimeout(r, 10))
        throw new Error('Failed!')
      })

      if (loading) return f('div', { 'data-testid': 'result' }, 'Loading...')
      if (error) return f('div', { 'data-testid': 'result' }, `Error: ${(error as Error).message}`)
      return f('div', { 'data-testid': 'result' }, data)
    }

    render(f(App), container)

    await new Promise(r => setTimeout(r, 50))

    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe('Error: Failed!')
  })

  it('should support refetch', async () => {
    let fetchCount = 0

    function App() {
      const [data, { loading, refetch }] = state(async () => {
        fetchCount++
        await new Promise(r => setTimeout(r, 10))
        return `Fetch #${fetchCount}`
      })

      return f('div', {}, [
        f('span', { 'data-testid': 'result' }, loading ? 'Loading...' : (data || '')),
        f('button', { 'data-testid': 'refetch', onclick: refetch }, 'Refetch')
      ])
    }

    render(f(App), container)

    await new Promise(r => setTimeout(r, 50))
    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe('Fetch #1')

    container.querySelector<HTMLButtonElement>('[data-testid="refetch"]')?.click()
    await new Promise(r => setTimeout(r, 50))

    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe('Fetch #2')
  })
})

describe('state() - Computed (with deps)', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should compute value based on deps', async () => {
    let computeCount = 0

    function App() {
      const [a, setA] = state(2)
      const [b, setB] = state(3)
      const [product] = state(() => {
        computeCount++
        return a * b
      }, { deps: [a, b] })

      return f('div', {}, [
        f('span', { 'data-testid': 'product' }, String(product)),
        f('button', { 'data-testid': 'inc-a', onclick: () => setA(a + 1) }, 'A+'),
        f('button', { 'data-testid': 'inc-b', onclick: () => setB(b + 1) }, 'B+')
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="product"]')?.textContent).toBe('6')
    expect(computeCount).toBe(1)

    container.querySelector<HTMLButtonElement>('[data-testid="inc-a"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="product"]')?.textContent).toBe('9') // 3 * 3
  })

  it('should memoize when deps are empty', async () => {
    let computeCount = 0

    function App() {
      const [trigger, setTrigger] = state(0)
      const [expensive] = state(() => {
        computeCount++
        return 'computed'
      }, { deps: [] })

      return f('div', {}, [
        f('span', { 'data-testid': 'value' }, expensive),
        f('span', { 'data-testid': 'trigger' }, String(trigger)),
        f('button', { 'data-testid': 'btn', onclick: () => setTrigger(trigger + 1) }, 'Trigger')
      ])
    }

    render(f(App), container)
    expect(computeCount).toBe(1)

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    container.querySelector<HTMLButtonElement>('[data-testid="btn"]')?.click()
    await nextTick()

    // deps=[] 이므로 다시 계산되지 않아야 함
    expect(computeCount).toBe(1)
  })
})

describe('state() - Global (with key)', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should share state between components with same key', async () => {
    function Counter({ id }: { id: string }) {
      const [count, setCount] = state(0, { key: ['global', 'counter'] })

      return f('div', { 'data-testid': id }, [
        f('span', { 'data-testid': `${id}-count` }, String(count)),
        f('button', { 'data-testid': `${id}-btn`, onclick: () => setCount(count + 1) }, '+')
      ])
    }

    function App() {
      return f('div', {}, [
        f(Counter, { id: 'a' }),
        f(Counter, { id: 'b' })
      ])
    }

    render(f(App), container)

    // 둘 다 같은 값
    expect(container.querySelector('[data-testid="a-count"]')?.textContent).toBe('0')
    expect(container.querySelector('[data-testid="b-count"]')?.textContent).toBe('0')

    // A에서 증가
    container.querySelector<HTMLButtonElement>('[data-testid="a-btn"]')?.click()
    await nextTick()

    // 둘 다 업데이트됨
    expect(container.querySelector('[data-testid="a-count"]')?.textContent).toBe('1')
    expect(container.querySelector('[data-testid="b-count"]')?.textContent).toBe('1')
  })

  it('should isolate state with different keys', async () => {
    function Counter({ id, storeKey }: { id: string; storeKey: string }) {
      const [count, setCount] = state(0, { key: ['counter', storeKey] })

      return f('div', {}, [
        f('span', { 'data-testid': `${id}-count` }, String(count)),
        f('button', { 'data-testid': `${id}-btn`, onclick: () => setCount(count + 1) }, '+')
      ])
    }

    function App() {
      return f('div', {}, [
        f(Counter, { id: 'a', storeKey: 'store-a' }),
        f(Counter, { id: 'b', storeKey: 'store-b' })
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="a-btn"]')?.click()
    await nextTick()

    // A만 증가, B는 그대로
    expect(container.querySelector('[data-testid="a-count"]')?.textContent).toBe('1')
    expect(container.querySelector('[data-testid="b-count"]')?.textContent).toBe('0')
  })
})
