/**
 * Control Flow Component Tests
 *
 * Tests for For component (the only control flow primitive)
 * For conditionals, use native JS: ternary or &&
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { signal } from '../signal'
import { For, isForComponent, FOR_MARKER } from '../flow'
import { f } from '../../renderers/dom/f'
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
        children: (item) => f('div', {}, [String(item)]),
      })

      expect(isForComponent(result)).toBe(true)
      expect(result[FOR_MARKER]).toBe(true)
    })

    it('should render list items', async () => {
      const items = signal(['a', 'b', 'c'])

      const List = () => {
        return f('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => f('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(f(List), container)

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
        return f('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => f('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(f(List), container)

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
        return f('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => f('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(f(List), container)

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
        return f('div', { id: 'list' }, [
          For({
            each: items,
            children: (item, index) => f('span', {}, [`${index()}: ${item}`]),
          }) as any,
        ])
      }

      mountReactive(f(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      const spans = container.querySelectorAll('span')
      expect(spans[0].textContent).toBe('0: first')
      expect(spans[1].textContent).toBe('1: second')
      expect(spans[2].textContent).toBe('2: third')
    })

    it('should handle empty array', async () => {
      const items = signal<string[]>([])

      const List = () => {
        return f('div', { id: 'list' }, [
          For({
            each: items,
            children: (item) => f('span', {}, [item]),
          }) as any,
        ])
      }

      mountReactive(f(List), container)

      await new Promise((resolve) => setTimeout(resolve, 10))

      // Check container for spans since For with empty array renders nothing
      expect(container.querySelectorAll('span').length).toBe(0)
    })
  })

  describe('Native JS Conditionals (recommended pattern)', () => {
    it('should render with ternary operator', async () => {
      const isVisible = signal(true)

      const Component = () => {
        return f('div', {}, [
          () => isVisible() ? f('span', {}, ['visible']) : f('span', {}, ['hidden'])
        ])
      }

      mountReactive(f(Component), container)
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(container.textContent).toBe('visible')

      isVisible.value = false
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(container.textContent).toBe('hidden')
    })

    it('should render with && operator', async () => {
      const user = signal<{ name: string } | null>({ name: 'Alice' })

      const Component = () => {
        return f('div', {}, [
          () => user() && f('span', {}, [`Hello ${user()!.name}`])
        ])
      }

      mountReactive(f(Component), container)
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(container.textContent).toBe('Hello Alice')

      user.value = null
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(container.querySelector('span')).toBeNull()
    })
  })

  describe('isForComponent', () => {
    it('should return true for For components', () => {
      const items = signal([1, 2, 3])
      const result = For({
        each: items,
        children: (item) => f('div', {}, [String(item)]),
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
      const fnode = f('div', {}, ['test'])
      expect(isForComponent(fnode)).toBe(false)
    })
  })
})
