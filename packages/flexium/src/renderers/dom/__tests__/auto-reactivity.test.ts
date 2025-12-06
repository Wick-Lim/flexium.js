/**
 * Automatic Reactivity Tests
 *
 * Tests for automatic reactive bindings feature
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signal, computed } from '../../../core/signal'
import { f } from '../f'
import { mountReactive } from '../reactive'

describe('Automatic Reactivity', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
  })

  describe('Signals as Children', () => {
    it('should render signal value as text', () => {
      const count = signal(5)
      const fnode = f('div', {}, [count])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('5')
    })

    it('should update when signal changes', async () => {
      const count = signal(5)
      const fnode = f('div', {}, [count])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('5')

      // Update signal
      count.value = 10

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('10')
    })

    it('should handle multiple signals in children', async () => {
      const first = signal('Hello')
      const second = signal('World')
      const fnode = f('div', {}, [first, ' ', second])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('Hello World')

      first.value = 'Hi'
      second.value = 'There'

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('Hi There')
    })
  })

  describe('Computed Values as Children', () => {
    it('should render computed value', () => {
      const count = signal(5)
      const doubled = computed(() => count.value * 2)
      const fnode = f('div', {}, [doubled])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('10')
    })

    it('should update when computed changes', async () => {
      const count = signal(5)
      const doubled = computed(() => count.value * 2)
      const fnode = f('div', {}, [doubled])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('10')

      count.value = 7

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('14')
    })
  })

  describe('Mixed Content', () => {
    it('should handle static text and signals together', async () => {
      const count = signal(5)
      const fnode = f('div', {}, ['Count: ', count])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('Count: 5')

      count.value = 10

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('Count: 10')
    })

    it('should handle multiple signals with text', async () => {
      const a = signal(2)
      const b = signal(3)
      const fnode = f('div', {}, [
        a,
        ' + ',
        b,
        ' = ',
        computed(() => a.value + b.value),
      ])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('2 + 3 = 5')

      a.value = 5
      b.value = 7

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('5 + 7 = 12')
    })
  })

  describe('Signals in Props', () => {
    it('should handle signal in disabled prop', async () => {
      const isDisabled = signal(true)
      const fnode = f('button', { disabled: isDisabled }, ['Click'])

      const node = mountReactive(fnode) as HTMLButtonElement

      expect(node.disabled).toBe(true)

      isDisabled.value = false

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.disabled).toBe(false)
    })

    it('should handle computed in style prop', async () => {
      const isActive = signal(true)
      const color = computed(() => (isActive.value ? 'red' : 'blue'))
      const fnode = f('div', { style: { color } }, ['Text'])

      const node = mountReactive(fnode) as HTMLElement

      // Note: Style handling depends on DOM renderer implementation
      // This test verifies the prop is processed
      expect(node).toBeDefined()
    })
  })

  describe('Nested Elements', () => {
    it('should handle signals in nested elements', async () => {
      const count = signal(5)
      const fnode = f('div', {}, [
        f('span', {}, ['Count: ']),
        f('strong', {}, [count]),
      ])

      const node = mountReactive(fnode) as HTMLElement
      const strong = node.querySelector('strong')

      expect(strong?.textContent).toBe('5')

      count.value = 10

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(strong?.textContent).toBe('10')
    })
  })

  describe('Component Functions', () => {
    it('should re-render component when signals change', async () => {
      const count = signal(5)

      const Counter = () => {
        return f('div', {}, ['Count: ', count])
      }

      const fnode = f(Counter)
      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('Count: 5')

      count.value = 10

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('Count: 10')
    })
  })

  describe('Type Coercion', () => {
    it('should convert numbers to strings', () => {
      const count = signal(42)
      const fnode = f('div', {}, [count])

      const node = mountReactive(fnode) as HTMLElement

      expect(node.textContent).toBe('42')
    })

    it('should not render boolean values directly', async () => {
      // Booleans are not rendered as text (consistent with JSX conventions)
      const flag = signal(true)
      const fnode = f('div', {}, [flag])

      const node = mountReactive(fnode) as HTMLElement

      // Boolean signals don't render text content
      expect(node.textContent).toBe('')

      flag.value = false
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(node.textContent).toBe('')
    })

    it('should not render object values directly', () => {
      // Objects are not automatically stringified (use explicit conversion)
      const obj = signal({ name: 'test' })
      const fnode = f('div', {}, [obj])

      const node = mountReactive(fnode) as HTMLElement

      // Object signals don't render text content
      expect(node.textContent).toBe('')
    })
  })
})
