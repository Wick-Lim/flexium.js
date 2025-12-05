/**
 * Control Flow Component Tests
 *
 * Tests for For, Show, Switch, and Match components
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { signal } from '../signal'
import { For, Show, Switch, Match, isForComponent, FOR_MARKER } from '../flow'
import { h } from '../../renderers/dom/h'
import { mountReactive } from '../../renderers/dom/reactive'

describe('Control Flow Components', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('For Component', () => {
    it('should create a ForComponent with marker', () => {
      const items = signal([1, 2, 3])
      const result = For({
        each: items,
        children: (item) => h('div', {}, [String(item)]),
      })

      expect(isForComponent(result)).toBe(true)
      expect(result[FOR_MARKER]).toBe(true)
    })

    it('should render list items', async () => {
      const items = signal(['a', 'b', 'c'])

      const List = () => {
        return h('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => h('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(h(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(3)
      expect(spans[0].textContent).toBe('a')
      expect(spans[1].textContent).toBe('b')
      expect(spans[2].textContent).toBe('c')
    })

    it('should update when items are added', async () => {
      const items = signal(['a', 'b'])

      const List = () => {
        return h('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => h('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(h(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(container.querySelectorAll('span').length).toBe(2)

      items.value = ['a', 'b', 'c', 'd']

      await new Promise((resolve) => setTimeout(resolve, 10))

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(4)
      expect(spans[3].textContent).toBe('d')
    })

    it('should update when items are removed', async () => {
      const items = signal(['a', 'b', 'c'])

      const List = () => {
        return h('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => h('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(h(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(container.querySelectorAll('span').length).toBe(3)

      items.value = ['a']

      await new Promise((resolve) => setTimeout(resolve, 10))

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(1)
      expect(spans[0].textContent).toBe('a')
    })

    it('should provide reactive index', async () => {
      const items = signal(['first', 'second', 'third'])

      const List = () => {
        return h('div', { id: 'list' }, [
          For({
            each: items,
            children: (item, index) => h('span', {}, [`${index()}: ${item}`]),
          }) as any,
        ])
      }

      mountReactive(h(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      const spans = container.querySelectorAll('span')
      expect(spans[0].textContent).toBe('0: first')
      expect(spans[1].textContent).toBe('1: second')
      expect(spans[2].textContent).toBe('2: third')
    })

    it('should handle empty array', async () => {
      const items = signal<string[]>([])

      const List = () => {
        return h('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => h('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(h(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      // Check container for spans since For with empty array renders nothing
      expect(container.querySelectorAll('span').length).toBe(0)
    })
  })

  describe('Show Component', () => {
    it('should render children when condition is truthy', () => {
      const isVisible = signal(true)

      const showFn = Show({
        when: isVisible,
        children: [h('div', {}, ['visible'])],
      })

      const result = showFn()
      expect(result).not.toBeNull()
    })

    it('should not render when condition is falsy', () => {
      const isVisible = signal(false)

      const showFn = Show({
        when: isVisible,
        children: [h('div', {}, ['visible'])],
      })

      const result = showFn()
      expect(result).toBeNull()
    })

    it('should render fallback when condition is falsy', () => {
      const isVisible = signal(false)
      const fallback = h('div', {}, ['fallback'])

      const showFn = Show({
        when: isVisible,
        fallback,
        children: [h('div', {}, ['visible'])],
      })

      const result = showFn()
      expect(result).toBe(fallback)
    })

    it('should pass truthy value to callback child', () => {
      const user = signal({ name: 'Alice' })

      const showFn = Show({
        when: user,
        children: [(u: { name: string }) => h('div', {}, [`Hello ${u.name}`])],
      })

      const result = showFn() as any
      expect(result.children[0]).toBe('Hello Alice')
    })

    it('should update when condition changes', async () => {
      const isVisible = signal(true)

      // Test the function behavior directly
      const showFn = Show({
        when: isVisible,
        fallback: h('div', {}, ['hidden']),
        children: [h('div', {}, ['visible'])],
      })

      // Initial state - visible
      let result = showFn() as any
      expect(result.children[0]).toBe('visible')

      // Change to false
      isVisible.value = false
      result = showFn() as any
      expect(result.children[0]).toBe('hidden')

      // Change back to true
      isVisible.value = true
      result = showFn() as any
      expect(result.children[0]).toBe('visible')
    })

    it('should handle null value', () => {
      const value = signal<string | null>(null)

      const showFn = Show({
        when: value,
        children: [h('div', {}, ['content'])],
      })

      const result = showFn()
      expect(result).toBeNull()
    })

    it('should handle undefined value', () => {
      const value = signal<string | undefined>(undefined)

      const showFn = Show({
        when: value,
        children: [h('div', {}, ['content'])],
      })

      const result = showFn()
      expect(result).toBeNull()
    })

    it('should support fallback function', () => {
      const isVisible = signal(false)
      let fallbackCalled = false

      const showFn = Show({
        when: isVisible,
        fallback: () => {
          fallbackCalled = true
          return h('div', {}, ['fallback'])
        },
        children: [h('div', {}, ['visible'])],
      })

      showFn()
      expect(fallbackCalled).toBe(true)
    })
  })

  describe('Switch and Match Components', () => {
    it('should render first truthy match', () => {
      const status = signal('loading')

      const switchFn = Switch({
        children: [
          h(Match as any, { when: () => status.value === 'loading' }, [
            h('div', {}, ['Loading...']),
          ]),
          h(Match as any, { when: () => status.value === 'error' }, [
            h('div', {}, ['Error!']),
          ]),
          h(Match as any, { when: () => status.value === 'success' }, [
            h('div', {}, ['Success!']),
          ]),
        ],
      })

      const result = switchFn() as any
      expect(result.children[0]).toBe('Loading...')
    })

    it('should render fallback when no match', () => {
      const status = signal('unknown')
      const fallback = h('div', {}, ['Unknown status'])

      const switchFn = Switch({
        fallback,
        children: [
          h(Match as any, { when: () => status.value === 'loading' }, [
            h('div', {}, ['Loading...']),
          ]),
          h(Match as any, { when: () => status.value === 'error' }, [
            h('div', {}, ['Error!']),
          ]),
        ],
      })

      const result = switchFn()
      expect(result).toBe(fallback)
    })

    it('should return null when no match and no fallback', () => {
      const status = signal('unknown')

      const switchFn = Switch({
        children: [
          h(Match as any, { when: () => status.value === 'loading' }, [
            h('div', {}, ['Loading...']),
          ]),
        ],
      })

      const result = switchFn()
      expect(result).toBeNull()
    })

    it('should only render first truthy match', () => {
      const a = signal(true)
      const b = signal(true)

      const switchFn = Switch({
        children: [
          h(Match as any, { when: a }, [h('div', {}, ['First'])]),
          h(Match as any, { when: b }, [h('div', {}, ['Second'])]),
        ],
      })

      const result = switchFn() as any
      expect(result.children[0]).toBe('First')
    })

    it('should update when conditions change', () => {
      const status = signal<'loading' | 'success' | 'error'>('loading')

      const switchFn = Switch({
        fallback: h('div', {}, ['Unknown']),
        children: [
          h(Match as any, { when: () => status.value === 'loading' }, [
            h('div', {}, ['Loading...']),
          ]),
          h(Match as any, { when: () => status.value === 'success' }, [
            h('div', {}, ['Success!']),
          ]),
          h(Match as any, { when: () => status.value === 'error' }, [
            h('div', {}, ['Error!']),
          ]),
        ],
      })

      // Initial state - loading
      let result = switchFn() as any
      expect(result.children[0]).toBe('Loading...')

      // Change to success
      status.value = 'success'
      result = switchFn() as any
      expect(result.children[0]).toBe('Success!')

      // Change to error
      status.value = 'error'
      result = switchFn() as any
      expect(result.children[0]).toBe('Error!')
    })

    it('should support callback children for Match', () => {
      const user = signal({ name: 'Bob' })

      const switchFn = Switch({
        children: [
          h(Match as any, { when: user }, [
            (u: { name: string }) => h('div', {}, [`User: ${u.name}`]),
          ]),
        ],
      })

      const result = switchFn() as any
      expect(result.children[0]).toBe('User: Bob')
    })
  })

  describe('isForComponent', () => {
    it('should return true for For components', () => {
      const items = signal([1, 2, 3])
      const result = For({
        each: items,
        children: (item) => h('div', {}, [String(item)]),
      })

      expect(isForComponent(result)).toBe(true)
    })

    it('should return false for regular objects', () => {
      expect(isForComponent({})).toBe(false)
      expect(isForComponent({ type: 'div' })).toBe(false)
      expect(isForComponent(null)).toBeFalsy()
      expect(isForComponent(undefined)).toBeFalsy()
    })

    it('should return false for VNodes', () => {
      const vnode = h('div', {}, ['test'])
      expect(isForComponent(vnode)).toBe(false)
    })
  })
})
