/**
 * Unit tests for key-based reconciliation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { state } from '../core/state'
import { createContext } from '../core/context'

describe('Key-based Reconciliation', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Router-like Scenario - Manual Re-render', () => {
    it('should replace old component with new one when key changes', async () => {
      function PageA() {
        return f('main', { class: 'page-a' }, [
          f('h1', {}, 'Page A'),
          f('div', { class: 'content-a' }, 'Content A')
        ])
      }

      function PageB() {
        return f('main', { class: 'page-b' }, [
          f('h1', {}, 'Page B'),
          f('div', { class: 'content-b' }, 'Content B')
        ])
      }

      // Initial render with PageA (key='/')
      render(f(PageA, { key: '/' }), container)

      expect(container.querySelectorAll('main').length).toBe(1)
      expect(container.querySelector('.page-a')).toBeTruthy()
      expect(container.textContent).toContain('Page A')

      // Re-render with PageB (key='/new') - should replace PageA
      render(f(PageB, { key: '/new' }), container)

      // Should only have ONE main element
      expect(container.querySelectorAll('main').length).toBe(1)
      expect(container.querySelector('.page-a')).toBeNull()
      expect(container.querySelector('.page-b')).toBeTruthy()
      expect(container.textContent).toContain('Page B')
      expect(container.textContent).not.toContain('Page A')
    })

    it('should handle array of keyed components', () => {
      function Item({ id }: { id: number }) {
        return f('div', { class: 'item', 'data-id': String(id) }, `Item ${id}`)
      }

      // Render array of items with keys
      const items1 = [1, 2, 3].map(id => f(Item, { key: id, id }))
      render(f('div', {}, items1), container)

      expect(container.querySelectorAll('.item').length).toBe(3)
      expect(container.textContent).toBe('Item 1Item 2Item 3')

      // Re-render with different items
      const items2 = [1, 3].map(id => f(Item, { key: id, id }))
      render(f('div', {}, items2), container)

      // Note: Without reactive system, render() clears and re-creates all
      // This tests that keys don't cause errors
      expect(container.querySelectorAll('.item').length).toBe(2)
    })
  })

  describe('Provider with Array Children', () => {
    it('should handle provider re-rendering with changed child keys', () => {
      const TestContext = createContext('test')

      function Item({ id }: { id: string }) {
        return f('div', { class: 'item', 'data-id': id }, `Item ${id}`)
      }

      // Initial render
      const app1 = f(TestContext.Provider, {
        value: 'test',
        children: [
          f('div', { class: 'static' }, 'Static'),
          f(Item, { key: 'child-a', id: 'child-a' })
        ]
      })

      render(app1, container)
      expect(container.querySelector('[data-id="child-a"]')).toBeTruthy()

      // Re-render with different child key
      const app2 = f(TestContext.Provider, {
        value: 'test',
        children: [
          f('div', { class: 'static' }, 'Static'),
          f(Item, { key: 'child-b', id: 'child-b' })
        ]
      })

      render(app2, container)

      // After full re-render, should have new child
      expect(container.querySelector('[data-id="child-b"]')).toBeTruthy()
    })
  })

  describe('Reactive Component with State', () => {
    it('should handle component with internal state re-rendering', async () => {
      let renderCount = 0

      function Counter() {
        renderCount++
        const [count, setCount] = state(0)

        return f('div', { class: 'counter' }, [
          f('span', { class: 'count' }, String(count)),
          f('button', {
            class: 'increment',
            onclick: () => setCount(count + 1)
          }, 'Increment')
        ])
      }

      render(f(Counter), container)

      expect(renderCount).toBe(1)
      expect(container.querySelector('.count')?.textContent).toBe('0')

      // Simulate click
      const button = container.querySelector('.increment') as HTMLButtonElement
      button?.click()

      // Wait for re-render
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(container.querySelector('.count')?.textContent).toBe('1')
    })

    it('should handle list rendering with reactive state', async () => {
      function App() {
        const [items, setItems] = state([1, 2, 3])

        function removeItem() {
          setItems([1, 3])
        }

        return f('div', {}, [
          f('button', { class: 'remove', onclick: removeItem }, 'Remove'),
          ...items.map((id: number) =>
            f('div', { key: id, class: 'item', 'data-id': String(id) }, `Item ${id}`)
          )
        ])
      }

      render(f(App), container)

      expect(container.querySelectorAll('.item').length).toBe(3)
      expect(container.textContent).toContain('Item 2')

      // Simulate click to remove item
      const button = container.querySelector('.remove') as HTMLButtonElement
      button?.click()

      // Wait for re-render
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(container.querySelectorAll('.item').length).toBe(2)
      expect(container.querySelector('[data-id="2"]')).toBeNull()
      expect(container.textContent).not.toContain('Item 2')
    })
  })
})
