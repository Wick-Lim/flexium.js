/**
 * DOM Hydration Tests
 *
 * Comprehensive test suite for server-side rendering (SSR) hydration functionality.
 * Tests ensure client-side interactivity is correctly attached to pre-rendered HTML
 * while validating that DOM structure matches virtual node expectations.
 *
 * Test Coverage (71 test cases):
 *
 * 1. Main Hydration Function (hydrate):
 *    - Basic element hydration
 *    - Event handler attachment
 *    - Mismatch callbacks and recovery options
 *    - Empty container handling
 *
 * 2. hydrateNode() - Core Recursion:
 *    - Text nodes: matching/mismatching content, number conversion
 *    - Null/undefined/false: proper handling of falsy values
 *    - Signals: reactive text binding and updates
 *    - Computed/function values: reactive effects with dependencies
 *    - Function components: props, children, nesting, events
 *    - Fragments: multiple children, mixed content, empty fragments
 *    - Elements: basic, nested, multiple children, tag mismatches
 *
 * 3. hydrateProps() - Property & Attribute Binding:
 *    - Event handlers: click, focus, blur, change, custom events
 *    - Special props: children, key, ref callbacks
 *    - Reactive props (signals): class, className, style objects, value, custom attributes
 *    - Static prop validation: class mismatch detection (dev mode)
 *
 * 4. Mismatch Detection & Recovery:
 *    - Multiple mismatch types in single tree
 *    - Missing DOM nodes
 *    - Extra DOM nodes
 *    - Continued hydration after errors
 *
 * 5. Edge Cases:
 *    - Empty strings, zero values
 *    - Deeply nested structures
 *    - Mixed content types (text, elements, numbers)
 *    - Array children with null/undefined/false values
 *    - Components returning null or fragments
 *    - Whitespace in server-rendered HTML
 *
 * 6. Complex Integration Scenarios:
 *    - Apps with signals and events
 *    - Multiple reactive props
 *    - Reactive lists
 *    - Nested components with signals
 *    - Multiple reactive form inputs
 *
 * 7. Development vs Production:
 *    - Console warnings in development mode
 *    - Suppressed warnings in production
 *    - Custom onMismatch callbacks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { hydrate, type HydrateOptions } from '../hydrate'
import { f, Fragment } from '../h'
import { signal, effect } from '../../../core/signal'

describe('DOM Hydration', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  describe('hydrate() - main function', () => {
    it('should hydrate simple element', () => {
      container.innerHTML = '<div class="test">Hello</div>'
      const fnode = f('div', { class: 'test' }, 'Hello')

      expect(() => hydrate(fnode, container)).not.toThrow()

      const div = container.querySelector('div')
      expect(div).not.toBeNull()
      expect(div?.className).toBe('test')
      expect(div?.textContent).toBe('Hello')
    })

    it('should attach event handlers during hydration', () => {
      container.innerHTML = '<button>Click me</button>'
      const onClick = vi.fn()
      const fnode = f('button', { onclick: onClick }, 'Click me')

      hydrate(fnode, container)

      const button = container.querySelector('button')
      button?.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should call onMismatch callback when provided', () => {
      container.innerHTML = '<div>Wrong</div>'
      const onMismatch = vi.fn()
      const fnode = f('div', {}, 'Correct')

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('Text mismatch'),
        expect.anything(),
        expect.anything()
      )
    })

    it('should not throw when recoverMismatch is false', () => {
      container.innerHTML = '<div>Wrong</div>'
      const fnode = f('div', {}, 'Correct')

      expect(() => {
        hydrate(fnode, container, { recoverMismatch: false })
      }).not.toThrow()
    })

    it('should handle empty container', () => {
      container.innerHTML = ''
      const onMismatch = vi.fn()
      const fnode = f('div', {}, 'Content')

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('No DOM node found'),
        null,
        expect.anything()
      )
    })
  })

  describe('hydrateNode() - text nodes', () => {
    it('should hydrate text node with matching content', () => {
      container.innerHTML = 'Hello World'
      const fnode = 'Hello World'

      expect(() => hydrate(fnode, container)).not.toThrow()
      expect(container.textContent).toBe('Hello World')
    })

    it('should hydrate number as text', () => {
      container.innerHTML = '42'
      const fnode = 42

      expect(() => hydrate(fnode, container)).not.toThrow()
      expect(container.textContent).toBe('42')
    })

    it('should detect text mismatch', () => {
      container.innerHTML = 'Wrong Text'
      const onMismatch = vi.fn()
      const fnode = 'Correct Text'

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('Text mismatch'),
        expect.anything(),
        'Correct Text'
      )
    })

    it('should correct text mismatch automatically', () => {
      container.innerHTML = 'Wrong Text'
      const fnode = 'Correct Text'

      hydrate(fnode, container)

      expect(container.textContent).toBe('Correct Text')
    })

    it('should detect wrong node type for text', () => {
      container.innerHTML = '<div>Element</div>'
      const onMismatch = vi.fn()
      const fnode = 'Text'

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('Expected text node'),
        expect.anything(),
        'Text'
      )
    })
  })

  describe('hydrateNode() - null/undefined/false', () => {
    it('should handle null fnode', () => {
      container.innerHTML = '<div>Content</div>'

      expect(() => hydrate(null, container)).not.toThrow()
    })

    it('should handle undefined fnode', () => {
      container.innerHTML = '<div>Content</div>'

      expect(() => hydrate(undefined, container)).not.toThrow()
    })

    it('should handle false fnode', () => {
      container.innerHTML = '<div>Content</div>'

      expect(() => hydrate(false, container)).not.toThrow()
    })
  })

  describe('hydrateNode() - signals', () => {
    it('should hydrate signal as text node', () => {
      const count = signal(5)
      container.innerHTML = '5'

      hydrate(count, container)

      expect(container.textContent).toBe('5')
    })

    it('should set up reactive effect for signal', async () => {
      const count = signal(5)
      container.innerHTML = '5'

      hydrate(count, container)

      count.value = 10
      await Promise.resolve()

      expect(container.textContent).toBe('10')
    })

    it('should handle signal with initial mismatch', async () => {
      const count = signal(5)
      container.innerHTML = '999' // Wrong initial value

      hydrate(count, container)

      // Signal effect should update it
      await Promise.resolve()
      expect(container.textContent).toBe('5')
    })

    it('should update multiple times as signal changes', async () => {
      const message = signal('First')
      container.innerHTML = 'First'

      hydrate(message, container)

      message.value = 'Second'
      await Promise.resolve()
      expect(container.textContent).toBe('Second')

      message.value = 'Third'
      await Promise.resolve()
      expect(container.textContent).toBe('Third')
    })
  })

  describe('hydrateNode() - computed/function values', () => {
    it('should hydrate computed function', () => {
      const getValue = () => 'Computed Value'
      container.innerHTML = 'Computed Value'

      expect(() => hydrate(getValue, container)).not.toThrow()
      expect(container.textContent).toBe('Computed Value')
    })

    it('should set up reactive effect for computed', async () => {
      const count = signal(3)
      const doubled = () => count.value * 2
      container.innerHTML = '6'

      hydrate(doubled, container)

      count.value = 5
      await Promise.resolve()

      expect(container.textContent).toBe('10')
    })

    it('should handle computed with signal dependencies', async () => {
      const firstName = signal('John')
      const lastName = signal('Doe')
      const fullName = () => `${firstName.value} ${lastName.value}`

      container.innerHTML = 'John Doe'
      hydrate(fullName, container)

      firstName.value = 'Jane'
      await Promise.resolve()
      expect(container.textContent).toBe('Jane Doe')

      lastName.value = 'Smith'
      await Promise.resolve()
      expect(container.textContent).toBe('Jane Smith')
    })
  })

  describe('hydrateNode() - function components', () => {
    it('should hydrate simple function component', () => {
      const MyComponent = () => f('div', { class: 'component' }, 'Component')
      container.innerHTML = '<div class="component">Component</div>'

      hydrate(f(MyComponent, {}), container)

      const div = container.querySelector('.component')
      expect(div).not.toBeNull()
      expect(div?.textContent).toBe('Component')
    })

    it('should pass props to function component', () => {
      const Greeting = (props: { name: string }) =>
        f('div', {}, `Hello, ${props.name}!`)

      container.innerHTML = '<div>Hello, World!</div>'

      hydrate(f(Greeting, { name: 'World' }), container)

      expect(container.textContent).toBe('Hello, World!')
    })

    it('should hydrate component with children', () => {
      const Wrapper = (props: { children: any }) =>
        f('div', { class: 'wrapper' }, props.children)

      container.innerHTML = '<div class="wrapper"><span>Child</span></div>'

      hydrate(f(Wrapper, {}, f('span', {}, 'Child')), container)

      const wrapper = container.querySelector('.wrapper')
      expect(wrapper?.querySelector('span')).not.toBeNull()
    })

    it('should hydrate nested components', () => {
      const Inner = () => f('span', {}, 'Inner')
      const Outer = () => f('div', {}, f(Inner, {}))

      container.innerHTML = '<div><span>Inner</span></div>'

      hydrate(f(Outer, {}), container)

      expect(container.querySelector('span')?.textContent).toBe('Inner')
    })

    it('should attach events in function components', () => {
      const onClick = vi.fn()
      const Button = () => f('button', { onclick: onClick }, 'Click')

      container.innerHTML = '<button>Click</button>'
      hydrate(f(Button, {}), container)

      container.querySelector('button')?.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('hydrateNode() - fragments', () => {
    it('should hydrate fragment with multiple children', () => {
      container.innerHTML = '<span>First</span><span>Second</span>'

      const fnode = f(
        Fragment,
        {},
        f('span', {}, 'First'),
        f('span', {}, 'Second')
      )

      hydrate(fnode, container)

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
      expect(spans[0].textContent).toBe('First')
      expect(spans[1].textContent).toBe('Second')
    })

    it('should hydrate fragment with mixed children', () => {
      container.innerHTML = 'Text<div>Element</div>More text'

      const fnode = f(
        Fragment,
        {},
        'Text',
        f('div', {}, 'Element'),
        'More text'
      )

      hydrate(fnode, container)

      expect(container.querySelector('div')?.textContent).toBe('Element')
    })

    it('should hydrate null fragment type', () => {
      container.innerHTML = '<span>A</span><span>B</span>'

      const fnode = {
        type: null,
        props: {},
        children: [f('span', {}, 'A'), f('span', {}, 'B')],
      }

      hydrate(fnode, container)

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
    })

    it('should handle empty fragment', () => {
      container.innerHTML = '<div>Before</div>'

      const fnode = f(Fragment, {})

      expect(() => hydrate(fnode, container)).not.toThrow()
    })
  })

  describe('hydrateNode() - elements', () => {
    it('should hydrate basic element', () => {
      container.innerHTML = '<div>Content</div>'
      const fnode = f('div', {}, 'Content')

      hydrate(fnode, container)

      expect(container.querySelector('div')).not.toBeNull()
    })

    it('should detect tag name mismatch', () => {
      container.innerHTML = '<div>Content</div>'
      const onMismatch = vi.fn()
      const fnode = f('span', {}, 'Content')

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('Tag mismatch'),
        expect.anything(),
        expect.anything()
      )
    })

    it('should handle case-insensitive tag matching', () => {
      container.innerHTML = '<DIV>Content</DIV>'
      const fnode = f('div', {}, 'Content')

      expect(() => hydrate(fnode, container)).not.toThrow()
    })

    it('should detect element expected but got text', () => {
      container.innerHTML = 'Just text'
      const onMismatch = vi.fn()
      const fnode = f('div', {}, 'Content')

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('Expected element node'),
        expect.anything(),
        expect.anything()
      )
    })

    it('should hydrate nested elements', () => {
      container.innerHTML = '<div><span><em>Nested</em></span></div>'

      const fnode = f('div', {}, f('span', {}, f('em', {}, 'Nested')))

      hydrate(fnode, container)

      expect(container.querySelector('em')?.textContent).toBe('Nested')
    })

    it('should hydrate elements with multiple children', () => {
      container.innerHTML = '<ul><li>A</li><li>B</li><li>C</li></ul>'

      const fnode = f(
        'ul',
        {},
        f('li', {}, 'A'),
        f('li', {}, 'B'),
        f('li', {}, 'C')
      )

      hydrate(fnode, container)

      const items = container.querySelectorAll('li')
      expect(items.length).toBe(3)
      expect(items[0].textContent).toBe('A')
      expect(items[1].textContent).toBe('B')
      expect(items[2].textContent).toBe('C')
    })
  })

  describe('hydrateProps() - event handlers', () => {
    it('should attach click event', () => {
      container.innerHTML = '<button>Click</button>'
      const onClick = vi.fn()
      const fnode = f('button', { onclick: onClick }, 'Click')

      hydrate(fnode, container)

      container.querySelector('button')?.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should attach multiple event types', () => {
      container.innerHTML = '<input type="text" />'
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const onChange = vi.fn()

      const fnode = f('input', {
        type: 'text',
        onfocus: onFocus,
        onblur: onBlur,
        onchange: onChange,
      })

      hydrate(fnode, container)

      const input = container.querySelector('input')!
      input.dispatchEvent(new Event('focus'))
      input.dispatchEvent(new Event('blur'))
      input.dispatchEvent(new Event('change'))

      expect(onFocus).toHaveBeenCalledTimes(1)
      expect(onBlur).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('should handle custom event names', () => {
      container.innerHTML = '<div>Custom</div>'
      const onCustom = vi.fn()
      const fnode = f('div', { oncustom: onCustom }, 'Custom')

      hydrate(fnode, container)

      container.querySelector('div')?.dispatchEvent(new Event('custom'))
      expect(onCustom).toHaveBeenCalledTimes(1)
    })

    it('should normalize event names to lowercase', () => {
      container.innerHTML = '<button>Click</button>'
      const onClick = vi.fn()
      // JSX often produces onClick, should become click
      const fnode = f('button', { onClick: onClick }, 'Click')

      hydrate(fnode, container)

      container.querySelector('button')?.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('hydrateProps() - special props', () => {
    it('should skip children prop', () => {
      container.innerHTML = '<div>Content</div>'
      const fnode = f('div', { children: 'ignored' }, 'Content')

      expect(() => hydrate(fnode, container)).not.toThrow()
    })

    it('should skip key prop', () => {
      container.innerHTML = '<div>Content</div>'
      const fnode = f('div', { key: 'my-key' }, 'Content')

      expect(() => hydrate(fnode, container)).not.toThrow()
    })

    it('should call ref callback with element', () => {
      container.innerHTML = '<div>Content</div>'
      const ref = vi.fn()
      const fnode = f('div', { ref }, 'Content')

      hydrate(fnode, container)

      expect(ref).toHaveBeenCalledWith(container.querySelector('div'))
    })

    it('should not call ref if not a function', () => {
      container.innerHTML = '<div>Content</div>'
      const fnode = f('div', { ref: 'not-a-function' }, 'Content')

      expect(() => hydrate(fnode, container)).not.toThrow()
    })
  })

  describe('hydrateProps() - reactive props (signals)', () => {
    it('should set up reactive class attribute', async () => {
      container.innerHTML = '<div class="initial">Content</div>'
      const className = signal('initial')
      const fnode = f('div', { class: className }, 'Content')

      hydrate(fnode, container)

      const div = container.querySelector('div')!
      expect(div.className).toBe('initial')

      className.value = 'updated'
      await Promise.resolve()

      expect(div.className).toBe('updated')
    })

    it('should handle className prop as class attribute', async () => {
      container.innerHTML = '<div class="initial">Content</div>'
      const className = signal('initial')
      const fnode = f('div', { className }, 'Content')

      hydrate(fnode, container)

      const div = container.querySelector('div')!

      className.value = 'updated'
      await Promise.resolve()

      expect(div.className).toBe('updated')
    })

    it('should set up reactive style object', async () => {
      container.innerHTML = '<div style="color: red;">Content</div>'
      const styleSignal = signal({ color: 'red' })
      const fnode = f('div', { style: styleSignal }, 'Content')

      hydrate(fnode, container)

      const div = container.querySelector('div') as HTMLElement

      styleSignal.value = { color: 'blue', fontSize: '16px' }
      await Promise.resolve()

      expect(div.style.color).toBe('blue')
      expect(div.style.fontSize).toBe('16px')
    })

    it('should set up reactive value property', async () => {
      container.innerHTML = '<input type="text" value="initial" />'
      const value = signal('initial')
      const fnode = f('input', { type: 'text', value })

      hydrate(fnode, container)

      const input = container.querySelector('input') as HTMLInputElement

      value.value = 'updated'
      await Promise.resolve()

      expect(input.value).toBe('updated')
    })

    it('should set up reactive custom attribute', async () => {
      container.innerHTML = '<div data-value="initial">Content</div>'
      const dataValue = signal('initial')
      const fnode = f('div', { 'data-value': dataValue }, 'Content')

      hydrate(fnode, container)

      const div = container.querySelector('div')!

      dataValue.value = 'updated'
      await Promise.resolve()

      expect(div.getAttribute('data-value')).toBe('updated')
    })
  })

  describe('hydrateProps() - static prop validation', () => {
    it('should detect class mismatch in development', () => {
      const originalDev = (globalThis as any).__DEV__
      ;(globalThis as any).__DEV__ = true

      container.innerHTML = '<div class="wrong">Content</div>'
      const onMismatch = vi.fn()
      const fnode = f('div', { class: 'correct' }, 'Content')

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('Class mismatch'),
        expect.anything(),
        expect.anything()
      )
      ;(globalThis as any).__DEV__ = originalDev
    })

    it('should not validate in production mode', () => {
      const originalDev = (globalThis as any).__DEV__
      ;(globalThis as any).__DEV__ = false

      container.innerHTML = '<div class="wrong">Content</div>'
      const onMismatch = vi.fn()
      const fnode = f('div', { class: 'correct' }, 'Content')

      hydrate(fnode, container, { onMismatch })

      // Should only be called for text mismatch, not class mismatch
      expect(onMismatch).not.toHaveBeenCalledWith(
        expect.stringContaining('Class mismatch'),
        expect.anything(),
        expect.anything()
      )
      ;(globalThis as any).__DEV__ = originalDev
    })

    it('should handle className in development', () => {
      const originalDev = (globalThis as any).__DEV__
      ;(globalThis as any).__DEV__ = true

      container.innerHTML = '<div class="test">Content</div>'
      const fnode = f('div', { className: 'test' }, 'Content')

      expect(() => hydrate(fnode, container)).not.toThrow()
      ;(globalThis as any).__DEV__ = originalDev
    })
  })

  describe('hydration - mismatch detection', () => {
    it('should detect and report all mismatches', () => {
      container.innerHTML = '<span class="wrong">Wrong text</span>'
      const onMismatch = vi.fn()
      const fnode = f('div', { class: 'correct' }, 'Correct text')

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalled()
    })

    it('should continue hydration after mismatch', () => {
      container.innerHTML = '<div>Wrong</div><div>Correct</div>'
      const onMismatch = vi.fn()

      const fnode = f(
        Fragment,
        {},
        f('div', {}, 'Wrong'),
        f('div', {}, 'Correct')
      )

      hydrate(fnode, container, { onMismatch })

      // Should still hydrate the second div
      expect(container.querySelectorAll('div').length).toBe(2)
    })

    it('should handle missing DOM nodes', () => {
      container.innerHTML = '<div>Only one</div>'
      const onMismatch = vi.fn()

      const fnode = f(
        Fragment,
        {},
        f('div', {}, 'Only one'),
        f('div', {}, 'Missing')
      )

      hydrate(fnode, container, { onMismatch })

      expect(onMismatch).toHaveBeenCalledWith(
        expect.stringContaining('No DOM node found'),
        null,
        expect.anything()
      )
    })

    it('should handle extra DOM nodes gracefully', () => {
      container.innerHTML = '<div>One</div><div>Two</div><div>Three</div>'

      const fnode = f(Fragment, {}, f('div', {}, 'One'))

      expect(() => hydrate(fnode, container)).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle empty string text node', () => {
      container.innerHTML = ''
      const textNode = document.createTextNode('')
      container.appendChild(textNode)

      const fnode = ''

      expect(() => hydrate(fnode, container)).not.toThrow()
    })

    it('should handle zero as text', () => {
      container.innerHTML = '0'
      const fnode = 0

      expect(() => hydrate(fnode, container)).not.toThrow()
      expect(container.textContent).toBe('0')
    })

    it('should handle deeply nested structure', () => {
      container.innerHTML = `
        <div>
          <div>
            <div>
              <div>
                <span>Deep</span>
              </div>
            </div>
          </div>
        </div>
      `.trim()

      const fnode = f(
        'div',
        {},
        f('div', {}, f('div', {}, f('div', {}, f('span', {}, 'Deep'))))
      )

      hydrate(fnode, container)

      expect(container.querySelector('span')?.textContent).toBe('Deep')
    })

    it('should handle mixed content types', () => {
      container.innerHTML = 'Text<div>Element</div>42<span>More</span>'

      const fnode = f(
        Fragment,
        {},
        'Text',
        f('div', {}, 'Element'),
        42,
        f('span', {}, 'More')
      )

      hydrate(fnode, container)

      expect(container.querySelector('div')?.textContent).toBe('Element')
      expect(container.querySelector('span')?.textContent).toBe('More')
    })

    it('should handle array children', () => {
      container.innerHTML = '<div><span>A</span><span>B</span></div>'

      const fnode = f('div', {}, [f('span', {}, 'A'), f('span', {}, 'B')])

      hydrate(fnode, container)

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
    })

    it('should handle null/undefined/false in children array', () => {
      container.innerHTML = '<div><span>A</span><span>B</span></div>'

      const fnode = f('div', {}, [
        f('span', {}, 'A'),
        null,
        undefined,
        false,
        f('span', {}, 'B'),
      ])

      hydrate(fnode, container)

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
    })

    it('should handle component returning null', () => {
      const NullComponent = () => null
      container.innerHTML = '<div>Before</div>'

      const fnode = f(NullComponent, {})

      expect(() => hydrate(fnode, container)).not.toThrow()
    })

    it('should handle component returning fragment', () => {
      const FragmentComponent = () =>
        f(Fragment, {}, f('span', {}, 'A'), f('span', {}, 'B'))

      container.innerHTML = '<span>A</span><span>B</span>'

      hydrate(f(FragmentComponent, {}), container)

      expect(container.querySelectorAll('span').length).toBe(2)
    })

    it('should handle whitespace in HTML', () => {
      container.innerHTML = `
        <div>
          <span>Content</span>
        </div>
      `

      // Note: Real browser parsing creates text nodes for whitespace
      // This test verifies we handle that gracefully
      const fnode = f('div', {}, f('span', {}, 'Content'))

      // May have mismatches due to whitespace text nodes
      const onMismatch = vi.fn()
      hydrate(fnode, container, { onMismatch })

      expect(container.querySelector('span')?.textContent).toBe('Content')
    })
  })

  describe('complex integration scenarios', () => {
    it('should hydrate app with signals and events', async () => {
      const count = signal(0)
      const increment = vi.fn(() => count.value++)

      container.innerHTML = '<div><button>+</button><span>0</span></div>'

      const fnode = f(
        'div',
        {},
        f('button', { onclick: increment }, '+'),
        f('span', {}, count)
      )

      hydrate(fnode, container)

      const button = container.querySelector('button')!
      const span = container.querySelector('span')!

      expect(span.textContent).toBe('0')

      button.click()
      await Promise.resolve()

      expect(increment).toHaveBeenCalled()
      expect(span.textContent).toBe('1')

      button.click()
      await Promise.resolve()

      expect(span.textContent).toBe('2')
    })

    it('should hydrate component with multiple reactive props', async () => {
      const title = signal('Title')
      const description = signal('Description')

      container.innerHTML = '<div><h1>Title</h1><p>Description</p></div>'

      const fnode = f('div', {}, f('h1', {}, title), f('p', {}, description))

      hydrate(fnode, container)

      const h1 = container.querySelector('h1')!
      const p = container.querySelector('p')!

      title.value = 'New Title'
      await Promise.resolve()
      expect(h1.textContent).toBe('New Title')

      description.value = 'New Description'
      await Promise.resolve()
      expect(p.textContent).toBe('New Description')
    })

    it('should hydrate list with reactive items', async () => {
      const items = signal(['A', 'B', 'C'])

      container.innerHTML = '<ul><li>A</li><li>B</li><li>C</li></ul>'

      const List = () =>
        f(
          'ul',
          {},
          items.value.map((item) => f('li', {}, item))
        )

      hydrate(f(List, {}), container)

      expect(container.querySelectorAll('li').length).toBe(3)
    })

    it('should handle nested components with signals', async () => {
      const name = signal('World')

      const Greeting = () => f('span', {}, () => `Hello, ${name.value}!`)
      const Container = () => f('div', {}, f(Greeting, {}))

      container.innerHTML = '<div><span>Hello, World!</span></div>'

      hydrate(f(Container, {}), container)

      name.value = 'Flexium'
      await Promise.resolve()

      expect(container.querySelector('span')?.textContent).toBe(
        'Hello, Flexium!'
      )
    })

    it('should hydrate form with multiple reactive inputs', async () => {
      const username = signal('user')
      const email = signal('user@example.com')

      container.innerHTML =
        '<input id="user-input" value="user" /><input id="email-input" value="user@example.com" />'

      const fnode = f(
        Fragment,
        {},
        f('input', { id: 'user-input', value: username }),
        f('input', { id: 'email-input', value: email })
      )

      hydrate(fnode, container)

      const usernameInput = container.querySelector(
        '#user-input'
      ) as HTMLInputElement
      const emailInput = container.querySelector(
        '#email-input'
      ) as HTMLInputElement

      // Verify initial values match
      expect(usernameInput.value).toBe('user')
      expect(emailInput.value).toBe('user@example.com')

      username.value = 'newuser'
      await Promise.resolve()
      expect(usernameInput.value).toBe('newuser')

      email.value = 'new@example.com'
      await Promise.resolve()
      expect(emailInput.value).toBe('new@example.com')
    })
  })

  describe('console warnings in development', () => {
    it('should log warning to console if no onMismatch provided', () => {
      const originalDev = (globalThis as any).__DEV__
      const originalWarn = console.warn
      ;(globalThis as any).__DEV__ = true
      const consoleWarnSpy = vi.fn()
      console.warn = consoleWarnSpy

      container.innerHTML = '<div>Wrong</div>'
      const fnode = f('div', {}, 'Correct')

      hydrate(fnode, container)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Flexium Hydration]')
      )
      ;(globalThis as any).__DEV__ = originalDev
      console.warn = originalWarn
    })

    it('should not log in production mode', () => {
      const originalDev = (globalThis as any).__DEV__
      const originalWarn = console.warn
      ;(globalThis as any).__DEV__ = false
      const consoleWarnSpy = vi.fn()
      console.warn = consoleWarnSpy

      container.innerHTML = '<div>Wrong</div>'
      const fnode = f('div', {}, 'Correct')

      hydrate(fnode, container)

      // May still correct the mismatch, but shouldn't log
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      ;(globalThis as any).__DEV__ = originalDev
      console.warn = originalWarn
    })
  })
})
