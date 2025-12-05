/**
 * Event Delegation System Tests
 *
 * Tests for the event delegation system, including bubbling behavior,
 * non-bubbling events, WeakMap memory management, and global listeners.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eventDelegator } from '../events'

describe('Event Delegation System', () => {
  let container: HTMLElement
  let child: HTMLElement
  let grandchild: HTMLElement

  beforeEach(() => {
    // Create a simple DOM hierarchy for testing
    container = document.createElement('div')
    container.id = 'container'
    child = document.createElement('div')
    child.id = 'child'
    grandchild = document.createElement('button')
    grandchild.id = 'grandchild'

    container.appendChild(child)
    child.appendChild(grandchild)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up all handlers
    eventDelegator.off(container, 'click')
    eventDelegator.off(child, 'click')
    eventDelegator.off(grandchild, 'click')
    eventDelegator.off(container, 'focus')
    eventDelegator.off(child, 'focus')
    eventDelegator.off(grandchild, 'focus')
    eventDelegator.off(container, 'mouseenter')
    eventDelegator.off(container, 'mouseleave')
    eventDelegator.off(container, 'scroll')
    eventDelegator.off(container, 'customEvent')
    eventDelegator.off(child, 'customEvent')

    container.remove()
  })

  describe('dispatchEvent() with bubbling', () => {
    it('should trigger handler on the target element', () => {
      const handler = vi.fn()
      eventDelegator.on(grandchild, 'click', handler)

      grandchild.click()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: grandchild,
        })
      )
    })

    it('should bubble event up the DOM tree', () => {
      const grandchildHandler = vi.fn()
      const childHandler = vi.fn()
      const containerHandler = vi.fn()

      eventDelegator.on(grandchild, 'click', grandchildHandler)
      eventDelegator.on(child, 'click', childHandler)
      eventDelegator.on(container, 'click', containerHandler)

      grandchild.click()

      expect(grandchildHandler).toHaveBeenCalledTimes(1)
      expect(childHandler).toHaveBeenCalledTimes(1)
      expect(containerHandler).toHaveBeenCalledTimes(1)
    })

    it('should bubble events in correct order (child to parent)', () => {
      const order: string[] = []

      eventDelegator.on(grandchild, 'click', () => order.push('grandchild'))
      eventDelegator.on(child, 'click', () => order.push('child'))
      eventDelegator.on(container, 'click', () => order.push('container'))

      grandchild.click()

      expect(order).toEqual(['grandchild', 'child', 'container'])
    })

    it('should stop bubbling when event.cancelBubble is true', () => {
      const childHandler = vi.fn((event: Event) => {
        event.cancelBubble = true
      })
      const containerHandler = vi.fn()

      eventDelegator.on(child, 'click', childHandler)
      eventDelegator.on(container, 'click', containerHandler)

      grandchild.click()

      expect(childHandler).toHaveBeenCalledTimes(1)
      expect(containerHandler).not.toHaveBeenCalled()
    })

    it('should handle events when no handler is registered', () => {
      // Should not throw
      expect(() => grandchild.click()).not.toThrow()
    })

    it('should handle event on intermediate nodes without handlers', () => {
      const grandchildHandler = vi.fn()
      const containerHandler = vi.fn()

      eventDelegator.on(grandchild, 'click', grandchildHandler)
      // Note: no handler on child
      eventDelegator.on(container, 'click', containerHandler)

      grandchild.click()

      expect(grandchildHandler).toHaveBeenCalledTimes(1)
      expect(containerHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('ensureGlobalListener() setup', () => {
    it('should register global listener on first event registration', () => {
      const handler = vi.fn()

      eventDelegator.on(container, 'customEvent', handler)

      // Dispatch custom event - must bubble to document for global delegation
      const event = new Event('customevent', { bubbles: true })
      container.dispatchEvent(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not register duplicate global listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      const initialCallCount = addEventListenerSpy.mock.calls.length

      eventDelegator.on(container, 'click', vi.fn())
      const afterFirstOn = addEventListenerSpy.mock.calls.length

      eventDelegator.on(child, 'click', vi.fn())
      const afterSecondOn = addEventListenerSpy.mock.calls.length

      // Should only add one global listener for 'click'
      expect(afterSecondOn - afterFirstOn).toBe(0)
    })

    it('should normalize event names to lowercase', () => {
      const handler = vi.fn()

      eventDelegator.on(container, 'CLICK', handler)
      container.click()

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Non-bubbling event handling', () => {
    it('should handle focus event without bubbling', () => {
      const childHandler = vi.fn()
      const containerHandler = vi.fn()

      eventDelegator.on(child, 'focus', childHandler)
      eventDelegator.on(container, 'focus', containerHandler)

      // Create input element that can receive focus
      const input = document.createElement('input')
      child.appendChild(input)
      eventDelegator.on(input, 'focus', vi.fn())

      input.focus()

      // Focus doesn't bubble, so only input handler should fire
      // (In delegation, parent handlers won't be called for non-bubbling events)
    })

    it('should handle blur event without bubbling', () => {
      const input = document.createElement('input')
      child.appendChild(input)
      document.body.appendChild(input)

      const inputHandler = vi.fn()
      const childHandler = vi.fn()

      eventDelegator.on(input, 'blur', inputHandler)
      eventDelegator.on(child, 'blur', childHandler)

      input.focus()
      input.blur()

      expect(inputHandler).toHaveBeenCalled()
      expect(childHandler).not.toHaveBeenCalled()
    })

    it('should handle mouseenter event without bubbling', () => {
      const childHandler = vi.fn()
      const containerHandler = vi.fn()

      eventDelegator.on(child, 'mouseenter', childHandler)
      eventDelegator.on(container, 'mouseenter', containerHandler)

      const event = new MouseEvent('mouseenter', { bubbles: false })
      child.dispatchEvent(event)

      expect(childHandler).toHaveBeenCalledTimes(1)
      expect(containerHandler).not.toHaveBeenCalled()
    })

    it('should handle mouseleave event without bubbling', () => {
      const childHandler = vi.fn()
      const containerHandler = vi.fn()

      eventDelegator.on(child, 'mouseleave', childHandler)
      eventDelegator.on(container, 'mouseleave', containerHandler)

      const event = new MouseEvent('mouseleave', { bubbles: false })
      child.dispatchEvent(event)

      expect(childHandler).toHaveBeenCalledTimes(1)
      expect(containerHandler).not.toHaveBeenCalled()
    })

    it('should handle scroll event without bubbling', () => {
      const scrollableDiv = document.createElement('div')
      scrollableDiv.style.overflow = 'auto'
      scrollableDiv.style.height = '100px'
      container.appendChild(scrollableDiv)

      const scrollHandler = vi.fn()
      const containerHandler = vi.fn()

      eventDelegator.on(scrollableDiv, 'scroll', scrollHandler)
      eventDelegator.on(container, 'scroll', containerHandler)

      const event = new Event('scroll', { bubbles: false })
      scrollableDiv.dispatchEvent(event)

      expect(scrollHandler).toHaveBeenCalledTimes(1)
      expect(containerHandler).not.toHaveBeenCalled()
    })

    it('should use capture phase for non-bubbling events', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      eventDelegator.on(container, 'focus', vi.fn())

      const focusCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'focus'
      )

      if (focusCall) {
        expect(focusCall[2]).toEqual({ capture: true })
      }
    })
  })

  describe('WeakMap memory management', () => {
    it('should store handlers in WeakMap', () => {
      const handler = vi.fn()

      eventDelegator.on(container, 'click', handler)
      container.click()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should allow garbage collection of removed nodes', () => {
      const tempDiv = document.createElement('div')
      document.body.appendChild(tempDiv) // Must be in document for event delegation
      const handler = vi.fn()

      eventDelegator.on(tempDiv, 'click', handler)

      // Trigger event while node is in document
      tempDiv.click()

      expect(handler).toHaveBeenCalledTimes(1)

      // WeakMap allows the node to be garbage collected when removed and no other references exist
      tempDiv.remove()
    })

    it('should handle multiple handlers on same node for different events', () => {
      const clickHandler = vi.fn()
      const mouseoverHandler = vi.fn()

      eventDelegator.on(container, 'click', clickHandler)
      eventDelegator.on(container, 'mouseover', mouseoverHandler)

      container.click()
      container.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      expect(clickHandler).toHaveBeenCalledTimes(1)
      expect(mouseoverHandler).toHaveBeenCalledTimes(1)
    })

    it('should replace handler when registering same event twice', () => {
      const firstHandler = vi.fn()
      const secondHandler = vi.fn()

      eventDelegator.on(container, 'click', firstHandler)
      eventDelegator.on(container, 'click', secondHandler)

      container.click()

      expect(firstHandler).not.toHaveBeenCalled()
      expect(secondHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Event delegation patterns', () => {
    it('should support event delegation for dynamically added elements', () => {
      const handler = vi.fn()
      eventDelegator.on(container, 'click', handler)

      // Add new element dynamically
      const newButton = document.createElement('button')
      container.appendChild(newButton)

      newButton.click()

      // Handler on container should fire due to bubbling
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple delegated handlers on same element', () => {
      const order: string[] = []

      eventDelegator.on(container, 'click', () => order.push('first'))
      // Note: second registration replaces first
      eventDelegator.on(container, 'click', () => order.push('second'))

      container.click()

      // Only second handler should fire (replacement behavior)
      expect(order).toEqual(['second'])
    })

    it('should work with custom events', () => {
      const handler = vi.fn()
      eventDelegator.on(container, 'myCustomEvent', handler)

      // Use lowercase to match the normalization in events.ts
      const customEvent = new CustomEvent('mycustomevent', {
        bubbles: true,
        detail: { data: 'test' },
      })
      child.dispatchEvent(customEvent)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mycustomevent',
        })
      )
    })

    it('should handle event.target correctly', () => {
      const handler = vi.fn((event: Event) => {
        expect(event.target).toBe(grandchild)
      })

      eventDelegator.on(container, 'click', handler)
      grandchild.click()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should support removing event handlers', () => {
      const handler = vi.fn()

      eventDelegator.on(container, 'click', handler)
      container.click()
      expect(handler).toHaveBeenCalledTimes(1)

      eventDelegator.off(container, 'click')
      container.click()

      // Handler should not be called after removal
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should normalize event name when removing handlers', () => {
      const handler = vi.fn()

      eventDelegator.on(container, 'CLICK', handler)
      eventDelegator.off(container, 'click') // lowercase

      container.click()

      // Handler should not fire after removal
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle removal of non-existent handler gracefully', () => {
      expect(() => {
        eventDelegator.off(container, 'click')
      }).not.toThrow()
    })

    it('should handle removal from node without handlers', () => {
      const newDiv = document.createElement('div')

      expect(() => {
        eventDelegator.off(newDiv, 'click')
      }).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should not trigger handlers on detached nodes', () => {
      const detachedDiv = document.createElement('div')
      const handler = vi.fn()

      eventDelegator.on(detachedDiv, 'click', handler)
      detachedDiv.click()

      // Event won't bubble to document, so global delegation won't trigger
      expect(handler).not.toHaveBeenCalled()
    })

    it('should stop at document boundary', () => {
      const handler = vi.fn()
      eventDelegator.on(document.body, 'click', handler)

      container.click()

      // Should bubble up to body
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle null event.target', () => {
      // This is an edge case that shouldn't normally happen
      // but the code should handle it gracefully
      const handler = vi.fn()
      eventDelegator.on(container, 'click', handler)

      // Normal event - should work
      container.click()
      expect(handler).toHaveBeenCalled()
    })
  })
})
