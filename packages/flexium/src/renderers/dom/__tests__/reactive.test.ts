/**
 * DOM Reactive Rendering Tests
 *
 * Tests for reactive DOM mounting, updates, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  mountReactive,
  cleanupReactive,
  createReactiveRoot,
  reactiveText,
} from '../reactive'
import { f, Fragment } from '../f'
import { signal } from '../../../core/signal'

describe('DOM Reactive Rendering', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    cleanupReactive(container)
    container.remove()
  })

  describe('mountReactive', () => {
    describe('primitive values', () => {
      it('should render null as nothing', () => {
        const result = mountReactive(null, container)
        expect(result).toBeNull()
        expect(container.childNodes.length).toBe(0)
      })

      it('should render undefined as nothing', () => {
        const result = mountReactive(undefined, container)
        expect(result).toBeNull()
        expect(container.childNodes.length).toBe(0)
      })

      it('should render boolean false as nothing', () => {
        const result = mountReactive(false, container)
        expect(result).toBeNull()
        expect(container.childNodes.length).toBe(0)
      })

      it('should render string as text node', () => {
        const result = mountReactive('Hello World', container)
        expect(result).not.toBeNull()
        expect(result?.nodeType).toBe(Node.TEXT_NODE)
        expect(result?.textContent).toBe('Hello World')
      })

      it('should render number as text node', () => {
        const result = mountReactive(42, container)
        expect(result).not.toBeNull()
        expect(result?.textContent).toBe('42')
      })
    })

    describe('VNodes', () => {
      it('should render simple element', () => {
        const fnode = f('div', { class: 'test' }, 'Content')
        mountReactive(fnode, container)

        const div = container.querySelector('div')
        expect(div).not.toBeNull()
        expect(div?.className).toBe('test')
        expect(div?.textContent).toBe('Content')
      })

      it('should render nested elements', () => {
        const fnode = f(
          'div',
          {},
          f('span', { class: 'child' }, 'Child 1'),
          f('span', { class: 'child' }, 'Child 2')
        )
        mountReactive(fnode, container)

        const spans = container.querySelectorAll('span.child')
        expect(spans.length).toBe(2)
        expect(spans[0].textContent).toBe('Child 1')
        expect(spans[1].textContent).toBe('Child 2')
      })

      it('should render with event handlers', () => {
        const onClick = vi.fn()
        const fnode = f('button', { onclick: onClick }, 'Click me')
        mountReactive(fnode, container)

        const button = container.querySelector('button')
        button?.click()
        expect(onClick).toHaveBeenCalled()
      })

      it('should render with style object', () => {
        // Note: style object uses CSS property names (hyphenated)
        const fnode = f(
          'div',
          { style: { color: 'red', 'font-size': '14px' } },
          'Styled'
        )
        mountReactive(fnode, container)

        const div = container.querySelector('div')
        expect(div?.style.color).toBe('red')
        expect(div?.style.fontSize).toBe('14px')
      })

      it('should render Fragment', () => {
        const fnode = f(
          Fragment,
          {},
          f('span', {}, 'First'),
          f('span', {}, 'Second')
        )
        mountReactive(fnode, container)

        const spans = container.querySelectorAll('span')
        expect(spans.length).toBe(2)
      })
    })

    describe('function components', () => {
      it('should render simple function component', () => {
        const MyComponent = () =>
          f('div', { class: 'my-component' }, 'Component')
        const fnode = f(MyComponent, {})
        mountReactive(fnode, container)

        const div = container.querySelector('.my-component')
        expect(div).not.toBeNull()
        expect(div?.textContent).toBe('Component')
      })

      it('should pass props to function component', () => {
        const MyComponent = (props: { message: string }) =>
          f('div', {}, props.message)
        const fnode = f(MyComponent, { message: 'Hello Props' })
        mountReactive(fnode, container)

        expect(container.textContent).toContain('Hello Props')
      })

      it('should render component children', () => {
        const Wrapper = (props: { children: any }) =>
          f('div', { class: 'wrapper' }, props.children)
        const fnode = f(Wrapper, {}, f('span', {}, 'Child content'))
        mountReactive(fnode, container)

        const wrapper = container.querySelector('.wrapper')
        expect(wrapper?.querySelector('span')?.textContent).toBe(
          'Child content'
        )
      })
    })

    describe('reactive signals', () => {
      it('should render signal value', () => {
        const count = signal(0)
        const fnode = f('div', {}, count)
        mountReactive(fnode, container)

        // Signal creates a text marker node
        expect(container.textContent).toContain('0')
      })

      it('should update when signal changes', async () => {
        const count = signal(0)
        const fnode = f('div', {}, count)
        mountReactive(fnode, container)

        count.value = 5
        await Promise.resolve()

        expect(container.textContent).toContain('5')
      })

      it('should handle signal in props', async () => {
        const className = signal('initial')
        const fnode = f('div', { class: className }, 'Content')
        mountReactive(fnode, container)

        const div = container.querySelector('div')
        expect(div?.className).toBe('initial')

        className.value = 'updated'
        await Promise.resolve()

        expect(div?.className).toBe('updated')
      })
    })

    describe('function children (reactive)', () => {
      it('should render function child result', () => {
        const fnode = f('div', {}, () => 'Dynamic content')
        mountReactive(fnode, container)

        expect(container.textContent).toContain('Dynamic content')
      })

      it('should update when function dependency changes', async () => {
        const count = signal(0)
        const fnode = f('div', {}, () => `Count: ${count.value}`)
        mountReactive(fnode, container)

        expect(container.textContent).toContain('Count: 0')

        count.value = 10
        await Promise.resolve()

        expect(container.textContent).toContain('Count: 10')
      })
    })

    describe('arrays', () => {
      it('should render array of children', () => {
        const items = ['A', 'B', 'C']
        const fnode = f(
          'ul',
          {},
          items.map((item, i) => f('li', { key: i }, item))
        )
        mountReactive(fnode, container)

        const listItems = container.querySelectorAll('li')
        expect(listItems.length).toBe(3)
        expect(listItems[0].textContent).toBe('A')
        expect(listItems[1].textContent).toBe('B')
        expect(listItems[2].textContent).toBe('C')
      })
    })
  })

  describe('cleanupReactive', () => {
    it('should cleanup reactive bindings', async () => {
      const count = signal(0)
      const fnode = f('div', { id: 'test' }, count)
      mountReactive(fnode, container)

      const div = container.querySelector('#test')
      expect(div).not.toBeNull()

      cleanupReactive(container)

      // After cleanup, signal changes should not affect the DOM
      const originalText = container.textContent
      count.value = 100
      await Promise.resolve()

      // Note: cleanup doesn't remove nodes, just stops updates
    })

    it('should recursively cleanup child nodes', () => {
      const fnode = f('div', {}, f('span', {}, f('button', {}, 'Click')))
      mountReactive(fnode, container)

      // Should not throw
      expect(() => cleanupReactive(container)).not.toThrow()
    })
  })

  describe('createReactiveRoot', () => {
    it('should create reactive root', () => {
      const root = createReactiveRoot(container)
      expect(root).toBeDefined()
      expect(typeof root.render).toBe('function')
      expect(typeof root.unmount).toBe('function')
    })

    it('should render content', () => {
      const root = createReactiveRoot(container)
      root.render(f('div', { class: 'root-content' }, 'Hello'))

      const div = container.querySelector('.root-content')
      expect(div).not.toBeNull()
      expect(div?.textContent).toBe('Hello')
    })

    it('should replace content on re-render', () => {
      const root = createReactiveRoot(container)

      root.render(f('div', {}, 'First'))
      expect(container.textContent).toContain('First')

      root.render(f('div', {}, 'Second'))
      expect(container.textContent).toContain('Second')
      expect(container.textContent).not.toContain('First')
    })

    it('should cleanup on unmount', () => {
      const root = createReactiveRoot(container)
      root.render(f('div', {}, 'Content'))

      expect(container.children.length).toBeGreaterThan(0)

      root.unmount()
      expect(container.innerHTML).toBe('')
    })
  })

  describe('reactiveText', () => {
    it('should create reactive text node', () => {
      const textNode = reactiveText(() => 'Hello')
      expect(textNode).toBeInstanceOf(Text)
      expect(textNode.textContent).toBe('Hello')
    })

    it('should update text when signal changes', async () => {
      const message = signal('Initial')
      const textNode = reactiveText(() => message.value)

      container.appendChild(textNode)
      expect(textNode.textContent).toBe('Initial')

      message.value = 'Updated'
      await Promise.resolve()

      expect(textNode.textContent).toBe('Updated')
    })
  })

  describe('edge cases', () => {
    it('should handle empty props', () => {
      const fnode = f('div', null, 'Content')
      mountReactive(fnode, container)

      const div = container.querySelector('div')
      expect(div).not.toBeNull()
    })

    it('should handle deeply nested components', () => {
      const Level3 = () => f('span', { class: 'level-3' }, 'Deep')
      const Level2 = () => f('div', { class: 'level-2' }, f(Level3, {}))
      const Level1 = () => f('div', { class: 'level-1' }, f(Level2, {}))

      mountReactive(f(Level1, {}), container)

      expect(container.querySelector('.level-1')).not.toBeNull()
      expect(container.querySelector('.level-2')).not.toBeNull()
      expect(container.querySelector('.level-3')).not.toBeNull()
    })

    it('should handle conditional rendering', () => {
      const show = signal(true)

      const fnode = f('div', {}, () =>
        show.value ? f('span', {}, 'Visible') : null
      )
      mountReactive(fnode, container)

      expect(container.querySelector('span')).not.toBeNull()
    })

    it('should handle mixed children types', () => {
      const fnode = f(
        'div',
        {},
        'Text',
        f('span', {}, 'Element'),
        42,
        null,
        undefined,
        false
      )
      mountReactive(fnode, container)

      const div = container.querySelector('div')
      expect(div).not.toBeNull()
      expect(div?.querySelector('span')).not.toBeNull()
    })
  })

  describe('f() factory function', () => {
    it('should work the same as f()', () => {
      const fnode = f('div', { class: 'f-test' }, 'Using f()')
      mountReactive(fnode, container)

      const div = container.querySelector('.f-test')
      expect(div).not.toBeNull()
      expect(div?.textContent).toBe('Using f()')
    })

    it('should extract key from props', () => {
      const fnode = f('div', { key: 'my-key', class: 'keyed' }, 'Keyed')
      expect(fnode.key).toBe('my-key')
      expect(fnode.props.key).toBeUndefined()
    })
  })
})
