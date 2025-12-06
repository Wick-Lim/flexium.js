/**
 * StateProxy DOM Reactivity Test
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { state, clearGlobalState } from '../../../core/state'
import { effect } from '../../../core/signal'
import { f } from '../f'
import { mountReactive } from '../reactive'

describe('StateProxy DOM Reactivity', () => {
  beforeEach(() => {
    clearGlobalState()
  })

  it('should render StateProxy initial value', () => {
    const [count] = state(5, { key: 'render-test' })
    const fnode = f('div', {}, [count])

    const node = mountReactive(fnode) as HTMLElement
    console.log('Initial textContent:', node.textContent)

    expect(node.textContent).toBe('5')
  })

  it('should update DOM when state changes via setter', async () => {
    const [count, setCount] = state(5, { key: 'update-test' })

    // Create FNode with StateProxy as child
    const fnode = f('div', {}, [count])

    const node = mountReactive(fnode) as HTMLElement
    console.log('Initial textContent:', node.textContent)

    // Check initial value
    expect(node.textContent).toBe('5')

    // Update via setter
    setCount(10)

    // Wait for effect to run
    await new Promise(resolve => setTimeout(resolve, 10))

    console.log('After update textContent:', node.textContent)
    expect(node.textContent).toBe('10')
  })

  it('should work with string state', async () => {
    const [name, setName] = state('Alice', { key: 'string-test' })
    const fnode = f('span', {}, [name])

    const node = mountReactive(fnode) as HTMLElement
    expect(node.textContent).toBe('Alice')

    setName('Bob')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(node.textContent).toBe('Bob')
  })

  it('should work with multiple state updates', async () => {
    const [count, setCount] = state(0, { key: 'multi-update-test' })
    const fnode = f('div', {}, [count])

    const node = mountReactive(fnode) as HTMLElement
    expect(node.textContent).toBe('0')

    setCount(1)
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(node.textContent).toBe('1')

    setCount(2)
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(node.textContent).toBe('2')

    setCount(3)
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(node.textContent).toBe('3')
  })

  it('should work inside a function component', async () => {
    // Store setter externally to call it later
    let setCountExternal: ((v: number) => void) | null = null

    // Function component
    function Counter() {
      const [count, setCount] = state(0)
      setCountExternal = setCount
      return f('div', { class: 'counter' }, [count])
    }

    // Mount the component
    const fnode = f(Counter, {}, [])
    const container = document.createElement('div')
    mountReactive(fnode, container)

    await new Promise(resolve => setTimeout(resolve, 10))

    // Find the rendered div
    const counterDiv = container.querySelector('.counter')
    console.log('Component initial:', counterDiv?.textContent)
    expect(counterDiv?.textContent).toBe('0')

    // Update via external setter
    setCountExternal!(5)

    await new Promise(resolve => setTimeout(resolve, 10))

    console.log('Component after update:', counterDiv?.textContent)
    expect(counterDiv?.textContent).toBe('5')
  })

  it('should work with setter using functional update', async () => {
    const [count, setCount] = state(10, { key: 'functional-update-test' })
    const fnode = f('div', {}, [count])

    const node = mountReactive(fnode) as HTMLElement
    expect(node.textContent).toBe('10')

    // Use functional update
    setCount(prev => prev + 5)

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(node.textContent).toBe('15')
  })

  it('should work with For component and StateProxy array', async () => {
    const { For } = await import('../../../core/flow')

    const [items, setItems] = state<number[]>([1, 2, 3], { key: 'for-test' })

    // Create For component
    const forComp = For({
      each: items, // StateProxy as each
      children: [(item: number) => f('span', {}, [String(item)])],
    })

    const container = document.createElement('div')
    mountReactive(forComp, container)

    await new Promise(resolve => setTimeout(resolve, 10))

    console.log('For initial:', container.textContent)
    expect(container.textContent).toBe('123')

    // Update the array
    setItems([4, 5, 6, 7])

    await new Promise(resolve => setTimeout(resolve, 10))

    console.log('For after update:', container.textContent)
    expect(container.textContent).toBe('4567')
  })

  it('should update same proxy after setter call', async () => {
    const [count, setCount] = state(0, { key: 'same-proxy-test' })

    console.log('Initial count():', count())
    expect(+count).toBe(0)

    setCount(5)
    await new Promise(resolve => setTimeout(resolve, 10))

    console.log('After setCount(5), count():', count())
    expect(+count).toBe(5)

    setCount(c => c + 1)
    await new Promise(resolve => setTimeout(resolve, 10))

    console.log('After functional update, count():', count())
    expect(+count).toBe(6)
  })

  it('should work with onclick handler updating state', async () => {
    const { STATE_SIGNAL } = await import('../../../core/state')

    let setCountExternal: ((v: number | ((p: number) => number)) => void) | null = null
    let countProxies: any[] = []

    function Counter() {
      const [count, setCount] = state(0)
      setCountExternal = setCount
      countProxies.push(count)

      // Get underlying signal
      const sig = (count as any)[STATE_SIGNAL]
      console.log('Counter render, count():', count(), 'signal._value:', sig?._value)

      return f('div', {}, [
        f('span', { class: 'count' }, [count]),
        f('button', {
          class: 'increment',
          onclick: () => {
            console.log('onclick: count():', count())
            setCount(5)
            console.log('onclick after direct set: count():', count())
          }
        }, ['+']),
      ])
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    mountReactive(f(Counter, {}, []), container)

    await new Promise(resolve => setTimeout(resolve, 10))

    const countSpan = container.querySelector('.count')
    const button = container.querySelector('.increment') as HTMLButtonElement

    console.log('Before click:')
    console.log('  DOM:', countSpan?.textContent)
    console.log('  First proxy():', countProxies[0]?.())
    expect(countSpan?.textContent).toBe('0')

    button?.click()

    await new Promise(resolve => setTimeout(resolve, 50))

    console.log('After click:')
    console.log('  DOM:', countSpan?.textContent)
    console.log('  First proxy():', countProxies[0]?.())
    console.log('  Latest proxy():', countProxies[countProxies.length - 1]?.())
    console.log('  Num proxies created:', countProxies.length)

    // Check if both proxies point to same signal
    const sig0 = (countProxies[0] as any)?.[STATE_SIGNAL]
    const sigLast = (countProxies[countProxies.length - 1] as any)?.[STATE_SIGNAL]
    console.log('  Same signal?:', sig0 === sigLast)
    console.log('  Signal value:', sig0?.value)

    expect(countSpan?.textContent).toBe('5')
  })
})
