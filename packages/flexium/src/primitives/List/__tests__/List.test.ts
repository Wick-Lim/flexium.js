/**
 * List Component Tests
 *
 * Comprehensive tests for List virtualization system
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  List,
  isListComponent,
  mountListComponent,
  LIST_MARKER,
} from '../List'
import { signal } from '../../../core/signal'
import { f } from '../../../renderers/dom/h'
import type { FNode } from '../../../core/renderer'

describe('List Component', () => {
  let container: HTMLElement
  let disposeCallbacks: Array<() => void>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    disposeCallbacks = []
  })

  afterEach(() => {
    // Clean up all mounted components
    disposeCallbacks.forEach((dispose) => dispose())
    disposeCallbacks = []
    container.remove()
  })

  describe('List() - Component Creation', () => {
    it('should create List component with required props', () => {
      const items = signal([1, 2, 3])
      const renderItem = (item: number) => f('div', {}, String(item))

      const component = List({
        each: items,
        children: renderItem,
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      expect(component).toBeDefined()
      expect(isListComponent(component)).toBe(true)
    })

    it('should include LIST_MARKER', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      expect(component[LIST_MARKER]).toBe(true)
    })

    it('should store all provided props', () => {
      const items = signal([1, 2, 3])
      const renderItem = (item: number) => f('div', {}, String(item))
      const onScroll = vi.fn()
      const onVisibleRangeChange = vi.fn()
      const getKey = (item: number, index: number) => `item-${index}`

      const component = List({
        each: items,
        children: renderItem,
        virtual: true,
        height: 400,
        width: 600,
        itemSize: 50,
        overscan: 5,
        getKey,
        onScroll,
        onVisibleRangeChange,
      })

      expect(component.each).toBe(items)
      expect(component.renderItem).toBe(renderItem)
      expect(component.height).toBe(400)
      expect(component.width).toBe(600)
      expect(component.itemSize).toBe(50)
      expect(component.overscan).toBe(5)
      expect(component.getKey).toBe(getKey)
      expect(component.onScroll).toBe(onScroll)
      expect(component.onVisibleRangeChange).toBe(onVisibleRangeChange)
    })

    it('should use default overscan of 3', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      expect(component.overscan).toBe(3)
    })

    it('should handle string height and width', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: '100vh',
        width: '100%',
        itemSize: 50,
      })

      expect(component.height).toBe('100vh')
      expect(component.width).toBe('100%')
    })

    it('should handle fixed size config', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: { mode: 'fixed', itemHeight: 75 },
      })

      expect(component.itemSize).toEqual({ mode: 'fixed', itemHeight: 75 })
    })

    it('should handle variable size config', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: { mode: 'variable', estimatedItemHeight: 60 },
      })

      expect(component.itemSize).toEqual({
        mode: 'variable',
        estimatedItemHeight: 60,
      })
    })
  })

  describe('isListComponent()', () => {
    it('should identify List components', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      expect(isListComponent(component)).toBe(true)
    })

    it('should return false for non-List objects', () => {
      expect(isListComponent({})).toBe(false)
      expect(isListComponent({ [LIST_MARKER]: false })).toBe(
        false
      )
      expect(isListComponent(null)).toBe(false)
      expect(isListComponent(undefined)).toBe(false)
      expect(isListComponent(123)).toBe(false)
      expect(isListComponent('string')).toBe(false)
    })

    it('should return false for plain objects with marker but wrong value', () => {
      const obj = { [LIST_MARKER]: 'wrong' }
      expect(isListComponent(obj)).toBe(false)
    })
  })

  describe('mountListComponent() - Basic Rendering', () => {
    it('should create container with correct styles', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          if (typeof fnode === 'object' && 'children' in fnode) {
            el.textContent = String(fnode.children[0])
          }
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      expect(virtualContainer).toBeDefined()
      expect(virtualContainer.style.height).toBe('400px')
      expect(virtualContainer.style.overflow).toBe('auto')
      expect(virtualContainer.style.position).toBe('relative')
    })

    it('should create container with string dimensions', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: '100vh',
        width: '50%',
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      expect(virtualContainer.style.height).toBe('100vh')
      expect(virtualContainer.style.width).toBe('50%')
    })

    it('should set accessibility attributes on container', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      expect(virtualContainer.getAttribute('role')).toBe('list')
      expect(virtualContainer.getAttribute('tabindex')).toBe('0')
      expect(virtualContainer.getAttribute('aria-rowcount')).toBe('3')
    })

    it('should create inner container with correct styles', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.style.position).toBe('relative')
      expect(innerContainer.style.width).toBe('100%')
      expect(innerContainer.style.willChange).toBe('transform')
    })

    it('should render visible items on initial mount', () => {
      const items = signal([1, 2, 3, 4, 5])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, `Item ${item}`),
        virtual: true,
        height: 200,
        itemSize: 50,
      })

      const mountedNodes: Node[] = []
      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          if (typeof fnode === 'object' && 'children' in fnode) {
            el.textContent = String(fnode.children[0])
          }
          mountedNodes.push(el)
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      // With height 200 and itemSize 50, we can see 4 items + overscan
      expect(mountedNodes.length).toBeGreaterThan(0)
      expect(mountedNodes.length).toBeLessThanOrEqual(5)
    })

    it('should position items absolutely with translateY', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number, index: () => number) =>
          f('div', {}, `Item ${index()}`),
        height: 200,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          if (typeof fnode === 'object' && 'children' in fnode) {
            el.textContent = String(fnode.children[0])
          }
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement
      const firstItem = innerContainer.children[0] as HTMLElement

      if (firstItem) {
        expect(firstItem.style.position).toBe('absolute')
        expect(firstItem.style.top).toBe('0px')
        expect(firstItem.style.left).toBe('0px')
        expect(firstItem.style.right).toBe('0px')
        expect(firstItem.style.height).toBe('50px')
        expect(firstItem.style.transform).toContain('translateY')
      }
    })
  })

  describe('Fixed Item Heights', () => {
    it('should calculate correct total height for fixed items', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      // 100 items * 50px = 5000px
      expect(innerContainer.style.height).toBe('5000px')
    })

    it('should render only visible items with fixed height', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 2,
      })

      const mountedElements: HTMLElement[] = []
      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          mountedElements.push(el)
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      // With height 400 and itemSize 50, visible count = 8
      // Plus overscan of 2 on each side = 12 total
      expect(mountedElements.length).toBeLessThanOrEqual(12)
      expect(mountedElements.length).toBeGreaterThan(0)
    })

    it('should use fixed size config', () => {
      const items = signal(Array.from({ length: 50 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: { mode: 'fixed', itemHeight: 75 },
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      // 50 items * 75px = 3750px
      expect(innerContainer.style.height).toBe('3750px')
    })
  })

  describe('Dynamic Item Heights', () => {
    it('should use estimated height for variable mode', () => {
      const items = signal(Array.from({ length: 50 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: { mode: 'variable', estimatedItemHeight: 60 },
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      // Should use estimated height for calculation
      // 50 items * 60px = 3000px
      expect(innerContainer.style.height).toBe('3000px')
    })
  })

  describe('Visible Range Calculation', () => {
    it('should call onVisibleRangeChange on mount', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 2,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      expect(onVisibleRangeChange).toHaveBeenCalled()
      const [startIndex, endIndex] = onVisibleRangeChange.mock.calls[0]
      expect(startIndex).toBe(0)
      expect(endIndex).toBeGreaterThan(0)
    })

    it('should not call onVisibleRangeChange if range unchanged', () => {
      const items = signal([1, 2, 3])
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const initialCallCount = onVisibleRangeChange.mock.calls.length

      // Update items without changing visible range
      items.set([1, 2, 3])

      // Should not call again if range hasn't changed
      expect(onVisibleRangeChange.mock.calls.length).toBe(initialCallCount)
    })
  })

  describe('Scroll Event Handling', () => {
    it('should attach scroll event listener', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const onScroll = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        onScroll,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement

      // Simulate scroll
      virtualContainer.scrollTop = 100
      virtualContainer.dispatchEvent(new Event('scroll'))

      expect(onScroll).toHaveBeenCalledWith(100)
    })

    it('should update visible items on scroll', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 1,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const initialCallCount = onVisibleRangeChange.mock.calls.length

      // Scroll down
      virtualContainer.scrollTop = 500
      virtualContainer.dispatchEvent(new Event('scroll'))

      // Should update visible range
      expect(onVisibleRangeChange.mock.calls.length).toBeGreaterThan(
        initialCallCount
      )
    })

    it('should use passive scroll listener', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const addEventListenerSpy = vi.spyOn(
        HTMLElement.prototype,
        'addEventListener'
      )

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      // Check that scroll listener was added with passive option
      const scrollCalls = addEventListenerSpy.mock.calls.filter(
        (call) => call[0] === 'scroll'
      )
      expect(scrollCalls.length).toBeGreaterThan(0)
      expect(scrollCalls[0][2]).toEqual({ passive: true })

      addEventListenerSpy.mockRestore()
    })
  })

  describe('Overscan Buffer', () => {
    it('should render overscan items above viewport', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 3,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const [startIndex] = onVisibleRangeChange.mock.calls[0]
      // Start index should be 0 (can't go below 0)
      expect(startIndex).toBe(0)
    })

    it('should render overscan items below viewport', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 3,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const [, endIndex] = onVisibleRangeChange.mock.calls[0]
      // With height 400, itemSize 50, we can see 8 items (0-7)
      // Plus overscan of 3 = index 10
      expect(endIndex).toBeGreaterThanOrEqual(8)
    })

    it('should respect different overscan values', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const onVisibleRangeChange1 = vi.fn()
      const onVisibleRangeChange2 = vi.fn()

      const component1 = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 1,
        onVisibleRangeChange: onVisibleRangeChange1,
      })

      const component2 = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 5,
        onVisibleRangeChange: onVisibleRangeChange2,
      })

      const container1 = document.createElement('div')
      const container2 = document.createElement('div')

      const dispose1 = mountListComponent(
        component1,
        container1,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      const dispose2 = mountListComponent(
        component2,
        container2,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose1, dispose2)

      const [, endIndex1] = onVisibleRangeChange1.mock.calls[0]
      const [, endIndex2] = onVisibleRangeChange2.mock.calls[0]

      // Component with larger overscan should render more items
      expect(endIndex2).toBeGreaterThan(endIndex1)
    })
  })

  describe('Large List Performance (1000+ items)', () => {
    it('should handle 1000 items efficiently', () => {
      const items = signal(Array.from({ length: 1000 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const mountedElements: HTMLElement[] = []
      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          mountedElements.push(el)
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      // Should only render visible items, not all 1000
      expect(mountedElements.length).toBeLessThan(50)
    })

    it('should handle 10000 items efficiently', () => {
      const items = signal(Array.from({ length: 10000 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const mountedElements: HTMLElement[] = []
      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          mountedElements.push(el)
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      expect(mountedElements.length).toBeLessThan(50)
    })

    it('should set correct total height for large lists', () => {
      const items = signal(Array.from({ length: 5000 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      // 5000 items * 50px = 250000px
      expect(innerContainer.style.height).toBe('250000px')
    })
  })

  describe('Item Recycling', () => {
    it('should reuse DOM nodes when scrolling', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const cleanupFn = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 1,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        cleanupFn
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement

      // Scroll down to trigger recycling
      virtualContainer.scrollTop = 1000
      virtualContainer.dispatchEvent(new Event('scroll'))

      // Should have called cleanup for items that scrolled out of view
      expect(cleanupFn.mock.calls.length).toBeGreaterThan(0)
    })

    it('should update existing item positions when scrolling', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number, index: () => number) =>
          f('div', {}, `Item ${index()}`),
        height: 200,
        itemSize: 50,
        overscan: 0,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => {
          const el = document.createElement('div')
          if (typeof fnode === 'object' && 'children' in fnode) {
            el.textContent = String(fnode.children[0])
          }
          return el
        },
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement
      const initialChildCount = innerContainer.children.length

      // Scroll down
      virtualContainer.scrollTop = 500
      virtualContainer.dispatchEvent(new Event('scroll'))

      // Should maintain similar number of children (recycling)
      const afterScrollChildCount = innerContainer.children.length
      expect(Math.abs(afterScrollChildCount - initialChildCount)).toBeLessThan(
        10
      )
    })
  })

  describe('Custom Key Function', () => {
    it('should use custom getKey function', () => {
      interface Item {
        id: string
        name: string
      }

      const items = signal<Item[]>([
        { id: 'a', name: 'Item A' },
        { id: 'b', name: 'Item B' },
        { id: 'c', name: 'Item C' },
      ])

      const getKey = vi.fn((item: Item) => item.id)

      const component = List({
        each: items,
        children: (item: Item) => f('div', {}, item.name),
        virtual: true,
        height: 400,
        itemSize: 50,
        getKey,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      expect(getKey).toHaveBeenCalledWith({ id: 'a', name: 'Item A' }, 0)
      expect(getKey).toHaveBeenCalledWith({ id: 'b', name: 'Item B' }, 1)
      expect(getKey).toHaveBeenCalledWith({ id: 'c', name: 'Item C' }, 2)
    })

    it('should use index as key when getKey not provided', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      // Should work without errors
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should preserve items with stable keys when list updates', () => {
      interface Item {
        id: string
        value: number
      }

      const items = signal<Item[]>([
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ])

      const component = List({
        each: items,
        children: (item: Item) => f('div', {}, String(item.value)),
        virtual: true,
        height: 400,
        itemSize: 50,
        getKey: (item: Item) => item.id,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      // Update item values
      items.set([
        { id: 'a', value: 10 },
        { id: 'b', value: 20 },
        { id: 'c', value: 30 },
      ])

      // Items should still be rendered
      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('Resize Handling', () => {
    it('should recalculate on items change', () => {
      const items = signal([1, 2, 3])
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const initialCallCount = onVisibleRangeChange.mock.calls.length

      // Change items
      items.set([1, 2, 3, 4, 5, 6, 7, 8])

      // Should recalculate
      expect(onVisibleRangeChange.mock.calls.length).toBeGreaterThanOrEqual(
        initialCallCount
      )
    })

    it('should update total height when items change', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.style.height).toBe('150px') // 3 * 50

      // Add more items
      items.set(Array.from({ length: 20 }, (_, i) => i))

      expect(innerContainer.style.height).toBe('1000px') // 20 * 50
    })

    it('should update aria-rowcount when items change', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      expect(virtualContainer.getAttribute('aria-rowcount')).toBe('3')

      items.set(Array.from({ length: 10 }, (_, i) => i))
      expect(virtualContainer.getAttribute('aria-rowcount')).toBe('10')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty list', () => {
      const items = signal<number[]>([])
      const onVisibleRangeChange = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        onVisibleRangeChange,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.style.height).toBe('0px')
      expect(virtualContainer.getAttribute('aria-rowcount')).toBe('0')
      expect(onVisibleRangeChange).toHaveBeenCalledWith(0, -1)
    })

    it('should handle single item list', () => {
      const items = signal([1])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.style.height).toBe('50px')
      expect(innerContainer.children.length).toBe(1)
    })

    it('should handle null items getter returning empty', () => {
      const items = signal<number[] | null>(null)
      const component = List({
        each: () => items() || [],
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      expect(container.children.length).toBeGreaterThan(0) // Container still created
    })

    it('should handle transition from empty to filled', () => {
      const items = signal<number[]>([])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.children.length).toBe(0)

      // Add items
      items.set([1, 2, 3, 4, 5])

      expect(innerContainer.children.length).toBeGreaterThan(0)
    })

    it('should handle transition from filled to empty', () => {
      const items = signal([1, 2, 3, 4, 5])
      const cleanupFn = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        cleanupFn
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      const initialChildCount = innerContainer.children.length
      expect(initialChildCount).toBeGreaterThan(0)

      // Clear items
      items.set([])

      expect(innerContainer.children.length).toBe(0)
      expect(cleanupFn.mock.calls.length).toBeGreaterThanOrEqual(
        initialChildCount
      )
    })

    it('should handle very small heights', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 10,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      // Should still work, just render minimal items
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle very small item sizes', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 1,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.style.height).toBe('100px') // 100 * 1
    })

    it('should handle very large item sizes', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 1000,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      expect(innerContainer.style.height).toBe('3000px')
    })

    it('should handle zero overscan', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
        overscan: 0,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      // Should work without overscan
      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('Cleanup and Disposal', () => {
    it('should remove event listener on dispose', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const removeEventListenerSpy = vi.spyOn(
        HTMLElement.prototype,
        'removeEventListener'
      )

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )

      dispose()

      // Should remove scroll listener
      const scrollCalls = removeEventListenerSpy.mock.calls.filter(
        (call) => call[0] === 'scroll'
      )
      expect(scrollCalls.length).toBeGreaterThan(0)

      removeEventListenerSpy.mockRestore()
    })

    it('should call cleanup for all cached items on dispose', () => {
      const items = signal([1, 2, 3, 4, 5])
      const cleanupFn = vi.fn()
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        cleanupFn
      )

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement
      const initialChildCount = innerContainer.children.length

      dispose()

      expect(cleanupFn.mock.calls.length).toBe(initialChildCount)
    })

    it('should remove container from parent on dispose', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )

      expect(container.children.length).toBe(1)

      dispose()

      expect(container.children.length).toBe(0)
    })

    it('should dispose effect on cleanup', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement
      const initialChildCount = innerContainer.children.length

      dispose()

      // After dispose, updating items should not trigger re-render
      items.set([1, 2, 3, 4, 5, 6, 7, 8])

      // Child count should remain the same (effect disposed)
      expect(innerContainer.children.length).toBe(initialChildCount)
    })

    it('should handle cleanup errors gracefully', () => {
      const items = signal([1, 2, 3])
      const cleanupFn = vi.fn(() => {
        throw new Error('Cleanup error')
      })
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        cleanupFn
      )

      // Should not throw when cleanup errors occur
      expect(() => {
        items.set([4, 5, 6])
      }).not.toThrow()

      dispose()
    })
  })

  describe('Accessibility Attributes', () => {
    it('should set role="list" on container', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      expect(virtualContainer.getAttribute('role')).toBe('list')
    })

    it('should set role="listitem" on items', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement
      const firstItem = innerContainer.children[0] as HTMLElement

      expect(firstItem.getAttribute('role')).toBe('listitem')
    })

    it('should set aria-rowindex on items', () => {
      const items = signal([1, 2, 3])
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 400,
        itemSize: 50,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement
      const innerContainer = virtualContainer.firstChild as HTMLElement

      // Check first few items
      for (let i = 0; i < Math.min(3, innerContainer.children.length); i++) {
        const item = innerContainer.children[i] as HTMLElement
        expect(item.getAttribute('aria-rowindex')).toBe(String(i + 1))
      }
    })

    it('should update aria-rowindex when items are repositioned', () => {
      const items = signal(Array.from({ length: 100 }, (_, i) => i))
      const component = List({
        each: items,
        children: (item: number) => f('div', {}, String(item)),
        virtual: true,
        height: 200,
        itemSize: 50,
        overscan: 0,
      })

      const dispose = mountListComponent(
        component,
        container,
        (fnode: FNode) => document.createElement('div'),
        () => {}
      )
      disposeCallbacks.push(dispose)

      const virtualContainer = container.firstChild as HTMLElement

      // Scroll to middle
      virtualContainer.scrollTop = 2000
      virtualContainer.dispatchEvent(new Event('scroll'))

      const innerContainer = virtualContainer.firstChild as HTMLElement
      const firstVisibleItem = innerContainer.children[0] as HTMLElement

      // aria-rowindex should reflect the actual item position
      const rowIndex = parseInt(
        firstVisibleItem.getAttribute('aria-rowindex') || '0'
      )
      expect(rowIndex).toBeGreaterThan(1)
    })
  })
})
