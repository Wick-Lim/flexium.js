/**
 * Portal Component Tests
 *
 * Tests for the Portal component that renders children into different
 * parts of the DOM, including cleanup, nested portals, and dynamic targets.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Portal } from '../portal'
import { mountReactive, cleanupReactive } from '../reactive'
import { h } from '../h'
import { signal } from '../../../core/signal'

describe('Portal Component', () => {
  let container: HTMLElement
  let portalTarget: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'container'
    document.body.appendChild(container)

    portalTarget = document.createElement('div')
    portalTarget.id = 'portal-target'
    document.body.appendChild(portalTarget)
  })

  afterEach(() => {
    cleanupReactive(container)
    cleanupReactive(portalTarget)
    container.remove()
    portalTarget.remove()
  })

  describe('Portal rendering to different container', () => {
    it('should render children to specified mount point', () => {
      // Portal must be used as a component, not called directly
      const App = () =>
        Portal({
          mount: portalTarget,
          children: h('div', { class: 'portal-content' }, 'Portal Content'),
        })

      mountReactive(h(App, {}), container)

      // Portal content should be in target, not in container
      expect(portalTarget.querySelector('.portal-content')).not.toBeNull()
      expect(container.querySelector('.portal-content')).toBeNull()
      expect(portalTarget.textContent).toContain('Portal Content')
    })

    it('should render to document.body by default', () => {
      const App = () =>
        Portal({
          children: h('div', { class: 'portal-default' }, 'Default Target'),
        })

      mountReactive(h(App, {}), container)

      // Should render to body
      expect(document.body.querySelector('.portal-default')).not.toBeNull()
      expect(container.querySelector('.portal-default')).toBeNull()

      // Cleanup
      const portalContent = document.body.querySelector('.portal-default')
      if (portalContent) {
        portalContent.remove()
      }
    })

    it('should leave placeholder comment in original location', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: h('div', {}, 'Content'),
        })

      mountReactive(h(App, {}), container)

      // Portal content should be in target
      expect(portalTarget.querySelector('div')).not.toBeNull()

      // Portal should not render its content in the container
      expect(container.querySelector('div')).toBeNull()

      // The container should have some marker node (comment or text) from the Portal
      // but not the actual portal content
      expect(container.childNodes.length).toBeGreaterThan(0)
    })

    it('should render multiple children to portal target', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: [
            h('div', { class: 'child-1' }, 'Child 1'),
            h('div', { class: 'child-2' }, 'Child 2'),
            h('div', { class: 'child-3' }, 'Child 3'),
          ],
        })

      mountReactive(h(App, {}), container)

      expect(
        portalTarget.querySelectorAll('div').length
      ).toBeGreaterThanOrEqual(3)
      expect(portalTarget.querySelector('.child-1')).not.toBeNull()
      expect(portalTarget.querySelector('.child-2')).not.toBeNull()
      expect(portalTarget.querySelector('.child-3')).not.toBeNull()
    })

    it('should render text content to portal target', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: 'Simple text content',
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.textContent).toContain('Simple text content')
    })

    it('should render component children to portal target', () => {
      const PortalChild = () =>
        h('div', { class: 'component-child' }, 'Component')

      const App = () =>
        Portal({
          mount: portalTarget,
          children: h(PortalChild, {}),
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.querySelector('.component-child')).not.toBeNull()
      expect(portalTarget.textContent).toContain('Component')
    })
  })

  describe('Portal cleanup on unmount', () => {
    it('should remove portal content when container is cleaned up', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: h('div', { class: 'cleanup-test' }, 'Test'),
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.querySelector('.cleanup-test')).not.toBeNull()

      // Cleanup the container triggers cleanup of all children including Portal
      cleanupReactive(container)
      container.innerHTML = ''

      // Content should be removed from portal target
      expect(portalTarget.querySelector('.cleanup-test')).toBeNull()
    })

    it('should cleanup reactive bindings in portal content', async () => {
      const count = signal(0)

      const App = () =>
        Portal({
          mount: portalTarget,
          children: h('div', { class: 'reactive-content' }, count),
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.textContent).toContain('0')

      count.value = 5
      await Promise.resolve()
      expect(portalTarget.textContent).toContain('5')

      // Cleanup portal
      cleanupReactive(container)
      container.innerHTML = ''

      // After cleanup, content should be removed
      const stillExists = portalTarget.querySelector('.reactive-content')
      expect(stillExists).toBeNull()
    })

    it('should cleanup nested elements in portal', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: h(
            'div',
            { class: 'outer' },
            h(
              'div',
              { class: 'middle' },
              h('div', { class: 'inner' }, 'Nested')
            )
          ),
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.querySelector('.inner')).not.toBeNull()

      cleanupReactive(container)
      container.innerHTML = ''

      // All nested content should be cleaned up
      expect(portalTarget.querySelector('.outer')).toBeNull()
      expect(portalTarget.querySelector('.middle')).toBeNull()
      expect(portalTarget.querySelector('.inner')).toBeNull()
    })
  })

  describe('Nested portals', () => {
    it('should support portal within portal', () => {
      const innerTarget = document.createElement('div')
      innerTarget.id = 'inner-target'
      document.body.appendChild(innerTarget)

      const App = () =>
        Portal({
          mount: portalTarget,
          children: h(
            'div',
            { class: 'outer-content' },
            h(
              () =>
                Portal({
                  mount: innerTarget,
                  children: h(
                    'div',
                    { class: 'inner-content' },
                    'Nested Portal'
                  ),
                }),
              {}
            )
          ),
        })

      mountReactive(h(App, {}), container)

      // Outer portal should be in portalTarget
      expect(portalTarget.querySelector('.outer-content')).not.toBeNull()

      // Inner portal should be in innerTarget
      expect(innerTarget.querySelector('.inner-content')).not.toBeNull()
      expect(innerTarget.textContent).toContain('Nested Portal')

      // Inner content should NOT be in outer portal target
      expect(portalTarget.querySelector('.inner-content')).toBeNull()

      cleanupReactive(innerTarget)
      innerTarget.remove()
    })

    it('should cleanup nested portals correctly', () => {
      const innerTarget = document.createElement('div')
      innerTarget.id = 'inner-target'
      document.body.appendChild(innerTarget)

      const App = () =>
        Portal({
          mount: portalTarget,
          children: h(
            () =>
              Portal({
                mount: innerTarget,
                children: h('div', { class: 'nested' }, 'Content'),
              }),
            {}
          ),
        })

      mountReactive(h(App, {}), container)

      expect(innerTarget.querySelector('.nested')).not.toBeNull()

      cleanupReactive(container)
      container.innerHTML = ''

      expect(innerTarget.querySelector('.nested')).toBeNull()

      cleanupReactive(innerTarget)
      innerTarget.remove()
    })

    it('should handle multiple sibling portals', () => {
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')
      document.body.appendChild(target1)
      document.body.appendChild(target2)

      const App = () =>
        h(
          'div',
          {},
          h(
            () =>
              Portal({
                mount: target1,
                children: h('div', { class: 'portal-1' }, 'Portal 1'),
              }),
            {}
          ),
          h(
            () =>
              Portal({
                mount: target2,
                children: h('div', { class: 'portal-2' }, 'Portal 2'),
              }),
            {}
          )
        )

      mountReactive(h(App, {}), container)

      expect(target1.querySelector('.portal-1')).not.toBeNull()
      expect(target2.querySelector('.portal-2')).not.toBeNull()
      expect(target1.textContent).toContain('Portal 1')
      expect(target2.textContent).toContain('Portal 2')

      cleanupReactive(target1)
      cleanupReactive(target2)
      target1.remove()
      target2.remove()
    })
  })

  describe('Portal with dynamic target', () => {
    it('should render to specific target at creation time', () => {
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')
      target1.id = 'target-1'
      target2.id = 'target-2'
      document.body.appendChild(target1)
      document.body.appendChild(target2)

      const currentTarget = signal(target1)

      const DynamicPortal = () =>
        Portal({
          mount: currentTarget.value,
          children: h('div', { class: 'dynamic' }, 'Dynamic Content'),
        })

      mountReactive(h(DynamicPortal, {}), container)

      // Should render to target1 initially
      expect(target1.querySelector('.dynamic')).not.toBeNull()
      expect(target2.querySelector('.dynamic')).toBeNull()

      // Note: Changing the signal won't automatically move the content
      // Portal mount point is determined at component creation time

      cleanupReactive(target1)
      cleanupReactive(target2)
      target1.remove()
      target2.remove()
    })
  })

  describe('Cross-document mounting', () => {
    it('should handle portal to same document', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: h('div', { class: 'same-doc' }, 'Same Document'),
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.querySelector('.same-doc')).not.toBeNull()
      expect(portalTarget.ownerDocument).toBe(document)
    })

    it('should render portal with event handlers', () => {
      const clickHandler = vi.fn()

      const App = () =>
        Portal({
          mount: portalTarget,
          children: h(
            'button',
            { onclick: clickHandler, class: 'portal-button' },
            'Click Me'
          ),
        })

      mountReactive(h(App, {}), container)

      const button = portalTarget.querySelector(
        '.portal-button'
      ) as HTMLButtonElement
      expect(button).not.toBeNull()

      button.click()
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    it('should maintain reactivity across portal boundary', async () => {
      const text = signal('Initial')

      const App = () =>
        Portal({
          mount: portalTarget,
          children: h('div', { class: 'reactive' }, text),
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.textContent).toContain('Initial')

      text.value = 'Updated'
      await Promise.resolve()

      expect(portalTarget.textContent).toContain('Updated')
    })

    it('should support conditional rendering in portal', async () => {
      const show = signal(true)

      const App = () =>
        Portal({
          mount: portalTarget,
          children: () =>
            show.value ? h('div', { class: 'conditional' }, 'Visible') : null,
        })

      mountReactive(h(App, {}), container)

      expect(portalTarget.querySelector('.conditional')).not.toBeNull()

      show.value = false
      await Promise.resolve()

      expect(portalTarget.querySelector('.conditional')).toBeNull()
    })
  })

  describe('Edge cases', () => {
    it('should handle null children', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: null,
        })

      expect(() => mountReactive(h(App, {}), container)).not.toThrow()
    })

    it('should handle undefined children', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: undefined as any,
        })

      expect(() => mountReactive(h(App, {}), container)).not.toThrow()
    })

    it('should handle empty array children', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: [],
        })

      mountReactive(h(App, {}), container)

      // Portal target may have the content, but it should be empty
      expect(portalTarget.children.length).toBe(0)
    })

    it('should handle mixed children types', () => {
      const App = () =>
        Portal({
          mount: portalTarget,
          children: [
            'Text',
            h('span', {}, 'Element'),
            42,
            null,
            undefined,
            false,
            h('div', {}, 'Another element'),
          ],
        })

      mountReactive(h(App, {}), container)

      // Should render truthy values
      expect(portalTarget.textContent).toContain('Text')
      expect(portalTarget.textContent).toContain('Element')
      expect(portalTarget.textContent).toContain('42')
      expect(portalTarget.textContent).toContain('Another element')
    })

    it('should handle portal as child of component', () => {
      const Wrapper = (props: { children: any }) =>
        h('div', { class: 'wrapper' }, props.children)

      const App = () =>
        h(
          Wrapper,
          {},
          h(
            () =>
              Portal({
                mount: portalTarget,
                children: h(
                  'div',
                  { class: 'in-portal' },
                  'Portal in Component'
                ),
              }),
            {}
          )
        )

      mountReactive(h(App, {}), container)

      expect(container.querySelector('.wrapper')).not.toBeNull()
      expect(portalTarget.querySelector('.in-portal')).not.toBeNull()
    })
  })
})
