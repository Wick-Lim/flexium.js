/**
 * Fragment Tests
 *
 * Tests for Fragment component that renders children without wrapper element
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { Fragment } from '../jsx-runtime'

describe('Fragment', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Basic Rendering', () => {
    it('should render Fragment children without wrapper element', () => {
      render(f(Fragment, {},
        f('span', {}, 'First'),
        f('span', {}, 'Second')
      ), container)

      expect(container.children.length).toBe(2)
      expect(container.children[0].tagName).toBe('SPAN')
      expect(container.children[1].tagName).toBe('SPAN')
      expect(container.textContent).toBe('FirstSecond')
    })

    it('should handle single child Fragment', () => {
      render(f(Fragment, {}, f('div', {}, 'Only child')), container)

      expect(container.children.length).toBe(1)
      expect(container.textContent).toBe('Only child')
    })

    it('should handle empty Fragment', () => {
      render(f(Fragment, {}), container)
      expect(container.innerHTML).toBe('')
    })

    it('should handle Fragment with text children', () => {
      render(f(Fragment, {}, 'Hello', ' ', 'World'), container)
      expect(container.textContent).toBe('Hello World')
    })
  })

  describe('Nested Fragments', () => {
    it('should handle nested Fragments', () => {
      render(f('div', {},
        f(Fragment, {},
          f('span', {}, 'A'),
          f(Fragment, {},
            f('span', {}, 'B'),
            f('span', {}, 'C')
          ),
          f('span', {}, 'D')
        )
      ), container)

      const div = container.querySelector('div')!
      expect(div.children.length).toBe(4)
      expect(div.textContent).toBe('ABCD')
    })

    it('should handle deeply nested Fragments', () => {
      render(f(Fragment, {},
        f(Fragment, {},
          f(Fragment, {},
            f('span', {}, 'Deep')
          )
        )
      ), container)

      expect(container.querySelector('span')?.textContent).toBe('Deep')
    })
  })

  describe('Fragment with Components', () => {
    it('should work with function components', () => {
      function Item({ text }: { text: string }) {
        return f('li', {}, text)
      }

      render(f('ul', {},
        f(Fragment, {},
          f(Item, { text: 'One' }),
          f(Item, { text: 'Two' }),
          f(Item, { text: 'Three' })
        )
      ), container)

      const items = container.querySelectorAll('li')
      expect(items.length).toBe(3)
      expect(items[0].textContent).toBe('One')
      expect(items[1].textContent).toBe('Two')
      expect(items[2].textContent).toBe('Three')
    })

    it('should work inside function components', () => {
      function MultipleItems() {
        return f(Fragment, {},
          f('span', {}, 'A'),
          f('span', {}, 'B')
        )
      }

      render(f('div', {}, f(MultipleItems)), container)

      expect(container.querySelectorAll('span').length).toBe(2)
    })
  })

  describe('Fragment with Mixed Content', () => {
    it('should handle mixed elements, text, and nulls', () => {
      render(f(Fragment, {},
        'Text before',
        f('span', {}, 'Element'),
        null,
        'Text after',
        undefined,
        f('span', {}, 'Last')
      ), container)

      expect(container.textContent).toBe('Text beforeElementText afterLast')
      expect(container.querySelectorAll('span').length).toBe(2)
    })

    it('should handle conditional children', () => {
      const showMiddle = false

      render(f(Fragment, {},
        f('span', {}, 'First'),
        showMiddle && f('span', {}, 'Middle'),
        f('span', {}, 'Last')
      ), container)

      expect(container.querySelectorAll('span').length).toBe(2)
      expect(container.textContent).toBe('FirstLast')
    })
  })

  describe('Fragment with Arrays', () => {
    it('should handle array of children', () => {
      const items = ['One', 'Two', 'Three']

      render(f(Fragment, {},
        ...items.map(item => f('div', {}, item))
      ), container)

      expect(container.children.length).toBe(3)
      expect(container.textContent).toBe('OneTwoThree')
    })

    it('should handle nested arrays', () => {
      render(f('div', {},
        f(Fragment, {},
          f('span', {}, 'A'),
          [
            f('span', {}, 'B'),
            f('span', {}, 'C')
          ],
          f('span', {}, 'D')
        )
      ), container)

      const div = container.querySelector('div')!
      expect(div.children.length).toBe(4)
      expect(div.textContent).toBe('ABCD')
    })
  })

  describe('Fragment in Lists', () => {
    it('should work as list items', () => {
      function ListItems() {
        return f(Fragment, {},
          f('li', {}, 'Item 1'),
          f('li', {}, 'Item 2'),
          f('li', {}, 'Item 3')
        )
      }

      render(f('ul', {}, f(ListItems)), container)

      const items = container.querySelectorAll('li')
      expect(items.length).toBe(3)
    })

    it('should work with mapped items', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]

      render(f('div', {},
        f(Fragment, {},
          ...data.map(item =>
            f(Fragment, { key: item.id },
              f('span', {}, item.name),
              f('span', {}, ' - '),
              f('span', {}, item.id)
            )
          )
        )
      ), container)

      expect(container.querySelectorAll('span').length).toBe(6)
      expect(container.textContent).toBe('Alice - 1Bob - 2')
    })
  })
})
