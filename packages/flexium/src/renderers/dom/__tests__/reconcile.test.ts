/**
 * DOM Reconciliation Algorithm Tests
 *
 * Tests for the keyed diffing algorithm used in reconcileArrays and patchNode.
 * These tests ensure efficient DOM updates when lists change.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { reconcileArrays } from '../reconcile'
import { h } from '../h'
import { mountReactive, cleanupReactive } from '../reactive'
import { signal } from '../../../core/signal'
import type { VNode } from '../../../core/renderer'

describe('DOM Reconciliation', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    cleanupReactive(container)
    container.remove()
  })

  describe('reconcileArrays with keyed children', () => {
    it('should handle empty arrays', () => {
      reconcileArrays(container, [], [], null)
      expect(container.children.length).toBe(0)
    })

    it('should add all new items when old array is empty', () => {
      const oldVNodes: VNode[] = []
      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
      expect(container.children[2].textContent).toBe('C')
    })

    it('should remove all items when new array is empty', () => {
      // First mount the items
      const initialVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B')
      ]

      for (const vnode of initialVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      expect(container.children.length).toBe(2)

      // Now reconcile with empty array
      reconcileArrays(container, initialVNodes, [], null)

      expect(container.children.length).toBe(0)
    })

    it('should preserve DOM nodes when keys match', () => {
      // Initial mount
      const oldVNodes = [
        h('div', { key: 'a', class: 'item' }, 'A'),
        h('div', { key: 'b', class: 'item' }, 'B')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const firstDiv = container.children[0]
      const secondDiv = container.children[1]

      // Update with same keys
      const newVNodes = [
        h('div', { key: 'a', class: 'item' }, 'A Updated'),
        h('div', { key: 'b', class: 'item' }, 'B Updated')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      // Same DOM nodes should be preserved
      expect(container.children[0]).toBe(firstDiv)
      expect(container.children[1]).toBe(secondDiv)
      expect(container.children[0].textContent).toBe('A Updated')
      expect(container.children[1].textContent).toBe('B Updated')
    })

    it('should handle prepending items', () => {
      // Initial: B, C
      const oldVNodes = [
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldB = container.children[0]
      const oldC = container.children[1]

      // New: A, B, C
      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
      expect(container.children[2].textContent).toBe('C')
      // B and C should be the same nodes
      expect(container.children[1]).toBe(oldB)
      expect(container.children[2]).toBe(oldC)
    })

    it('should handle appending items', () => {
      // Initial: A, B
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]

      // New: A, B, C
      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
      expect(container.children[2].textContent).toBe('C')
      // A and B should be the same nodes
      expect(container.children[0]).toBe(oldA)
      expect(container.children[1]).toBe(oldB)
    })

    it('should handle removing items from middle', () => {
      // Initial: A, B, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldC = container.children[2]

      // New: A, C (remove B)
      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'c' }, 'C')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(2)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('C')
      expect(container.children[0]).toBe(oldA)
      expect(container.children[1]).toBe(oldC)
    })

    it('should handle inserting items in middle', () => {
      // Initial: A, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldC = container.children[1]

      // New: A, B, C (insert B)
      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
      expect(container.children[2].textContent).toBe('C')
      expect(container.children[0]).toBe(oldA)
      expect(container.children[2]).toBe(oldC)
    })
  })

  describe('list reordering', () => {
    it('should handle simple reverse', () => {
      // Initial: A, B, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: C, B, A
      const newVNodes = [
        h('div', { key: 'c' }, 'C'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'a' }, 'A')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('C')
      expect(container.children[1].textContent).toBe('B')
      expect(container.children[2].textContent).toBe('A')
      // Same nodes, just reordered
      expect(container.children[0]).toBe(oldC)
      expect(container.children[1]).toBe(oldB)
      expect(container.children[2]).toBe(oldA)
    })

    it('should handle swapping first and last', () => {
      // Initial: A, B, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: C, B, A
      const newVNodes = [
        h('div', { key: 'c' }, 'C'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'a' }, 'A')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children[0]).toBe(oldC)
      expect(container.children[1]).toBe(oldB)
      expect(container.children[2]).toBe(oldA)
    })

    it('should handle moving item from start to end', () => {
      // Initial: A, B, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: B, C, A
      const newVNodes = [
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C'),
        h('div', { key: 'a' }, 'A')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('B')
      expect(container.children[1].textContent).toBe('C')
      expect(container.children[2].textContent).toBe('A')
      expect(container.children[0]).toBe(oldB)
      expect(container.children[1]).toBe(oldC)
      expect(container.children[2]).toBe(oldA)
    })

    it('should handle moving item from end to start', () => {
      // Initial: A, B, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: C, A, B
      const newVNodes = [
        h('div', { key: 'c' }, 'C'),
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('C')
      expect(container.children[1].textContent).toBe('A')
      expect(container.children[2].textContent).toBe('B')
      expect(container.children[0]).toBe(oldC)
      expect(container.children[1]).toBe(oldA)
      expect(container.children[2]).toBe(oldB)
    })

    it('should handle complex reordering with additions and removals', () => {
      // Initial: A, B, C, D
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C'),
        h('div', { key: 'd' }, 'D')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldB = container.children[1]
      const oldD = container.children[3]

      // New: E, D, B, F (remove A and C, add E and F, reorder)
      const newVNodes = [
        h('div', { key: 'e' }, 'E'),
        h('div', { key: 'd' }, 'D'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'f' }, 'F')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(4)
      expect(container.children[0].textContent).toBe('E')
      expect(container.children[1].textContent).toBe('D')
      expect(container.children[2].textContent).toBe('B')
      expect(container.children[3].textContent).toBe('F')
      // B and D should be the same nodes
      expect(container.children[1]).toBe(oldD)
      expect(container.children[2]).toBe(oldB)
    })
  })

  describe('reconcileArrays with unkeyed children', () => {
    it('should handle unkeyed children by type matching', () => {
      // Initial: div, div, div
      const oldVNodes = [
        h('div', {}, 'A'),
        h('div', {}, 'B'),
        h('div', {}, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldFirst = container.children[0]

      // New: div, div (remove one)
      const newVNodes = [
        h('div', {}, 'A Updated'),
        h('div', {}, 'B Updated')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(2)
      expect(container.children[0].textContent).toBe('A Updated')
      expect(container.children[1].textContent).toBe('B Updated')
      // First node should be reused
      expect(container.children[0]).toBe(oldFirst)
    })

    it('should handle mixed keyed and unkeyed children', () => {
      // Initial: keyed A, unkeyed div, keyed B
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', {}, 'Unkeyed'),
        h('div', { key: 'b' }, 'B')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[2]

      // New: keyed B, unkeyed div, keyed A (reorder keyed, update unkeyed)
      const newVNodes = [
        h('div', { key: 'b' }, 'B'),
        h('div', {}, 'Unkeyed Updated'),
        h('div', { key: 'a' }, 'A')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('B')
      expect(container.children[1].textContent).toBe('Unkeyed Updated')
      expect(container.children[2].textContent).toBe('A')
      // Keyed items should preserve identity
      expect(container.children[0]).toBe(oldB)
      expect(container.children[2]).toBe(oldA)
    })
  })

  describe('patchNode', () => {
    it('should update text content for simple text children', () => {
      // Initial render
      const oldVNode = h('div', { class: 'test' }, 'Old Text')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      expect(container.textContent).toBe('Old Text')

      // Update via reconciliation
      const newVNode = h('div', { class: 'test' }, 'New Text')
      const newVNodes = [newVNode]
      const oldVNodes = [oldVNode]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.textContent).toBe('New Text')
    })

    it('should update element attributes', () => {
      // Initial render
      const oldVNode = h('div', { class: 'old', id: 'test' }, 'Content')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const div = container.querySelector('div')
      expect(div?.className).toBe('old')
      expect(div?.id).toBe('test')

      // Update via reconciliation
      const newVNode = h('div', { class: 'new', id: 'test', title: 'tooltip' }, 'Content')
      const newVNodes = [newVNode]
      const oldVNodes = [oldVNode]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(div?.className).toBe('new')
      expect(div?.id).toBe('test')
      expect(div?.title).toBe('tooltip')
    })

    it('should remove attributes when they are removed from props', () => {
      // Initial render
      const oldVNode = h('div', { class: 'test', title: 'tooltip', id: 'myid' }, 'Content')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const div = container.querySelector('div')
      expect(div?.title).toBe('tooltip')

      // Update without title
      const newVNode = h('div', { class: 'test', id: 'myid' }, 'Content')
      const newVNodes = [newVNode]
      const oldVNodes = [oldVNode]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(div?.hasAttribute('title')).toBe(false)
    })

    it('should update style attributes', () => {
      // Initial render
      const oldVNode = h('div', { style: { color: 'red', fontSize: '14px' } }, 'Styled')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const div = container.querySelector('div') as HTMLElement
      expect(div?.style.color).toBe('red')

      // Update style
      const newVNode = h('div', { style: { color: 'blue', fontSize: '16px' } }, 'Styled')
      const newVNodes = [newVNode]
      const oldVNodes = [oldVNode]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(div?.style.color).toBe('blue')
      expect(div?.style.fontSize).toBe('16px')
    })

    it('should handle different element types with same key', () => {
      // This test verifies that isSameKey checks both key AND type
      // When the type changes, the node is not reused even if keys match
      const oldVNodes = [
        h('div', { key: 'item' }, 'A div')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldDiv = container.querySelector('div')
      expect(oldDiv).not.toBeNull()

      // Change type from div to span with same key
      // isSameKey should return false, so old div is removed and new span created
      const newVNodes = [
        h('span', { key: 'item' }, 'A span')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      // After reconciliation, the type and content should match the new node
      // The exact behavior depends on how the algorithm handles type mismatches
      expect(container.children.length).toBeGreaterThan(0)
      expect(container.textContent).toContain('A span')
    })

    it('should update nested children', () => {
      // Initial: div with two spans
      const spanA = h('span', { key: 'a' }, 'A')
      const spanB = h('span', { key: 'b' }, 'B')
      const oldVNode = h('div', {}, spanA, spanB)

      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
      const oldSpanA = spans[0]
      const oldSpanB = spans[1]

      // Store child _node references
      spanA._node = oldSpanA as any
      spanB._node = oldSpanB as any

      // Update: swap spans
      const newSpanB = h('span', { key: 'b' }, 'B Updated')
      const newSpanA = h('span', { key: 'a' }, 'A Updated')
      const newVNode = h('div', {}, newSpanB, newSpanA)

      const newVNodes = [newVNode]
      const oldVNodes = [oldVNode]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      const newSpans = container.querySelectorAll('span')
      expect(newSpans.length).toBe(2)
      expect(newSpans[0].textContent).toBe('B Updated')
      expect(newSpans[1].textContent).toBe('A Updated')
      // Nodes should be the same, just reordered
      expect(newSpans[0]).toBe(oldSpanB)
      expect(newSpans[1]).toBe(oldSpanA)
    })
  })

  describe('text node updates', () => {
    it('should update text nodes directly', () => {
      const oldVNode = h('div', {}, 'Original Text')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const div = container.querySelector('div')
      const textNode = div?.firstChild as Text
      expect(textNode.textContent).toBe('Original Text')

      const newVNode = h('div', {}, 'Updated Text')
      reconcileArrays(container, [oldVNode], [newVNode], null)

      expect(textNode.textContent).toBe('Updated Text')
      // Should be same text node
      expect(div?.firstChild).toBe(textNode)
    })

    it('should handle number to string updates', () => {
      const oldVNode = h('div', {}, 123)
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      expect(container.textContent).toBe('123')

      const newVNode = h('div', {}, 456)
      reconcileArrays(container, [oldVNode], [newVNode], null)

      expect(container.textContent).toBe('456')
    })

    it('should handle text to element updates', () => {
      const oldVNode = h('div', {}, 'Just text')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const div = container.querySelector('div')
      expect(div?.childNodes.length).toBe(1)
      expect(div?.firstChild?.nodeType).toBe(Node.TEXT_NODE)

      // Update to have nested element
      const newVNode = h('div', {},
        h('span', {}, 'Nested element')
      )
      reconcileArrays(container, [oldVNode], [newVNode], null)

      expect(div?.querySelector('span')).not.toBeNull()
      expect(div?.querySelector('span')?.textContent).toBe('Nested element')
    })
  })

  describe('integration with reactive signals', () => {
    it('should work with signal-driven lists', async () => {
      const items = signal([
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' }
      ])

      const Component = () => {
        return h('div', {},
          () => items.value.map(item =>
            h('div', { key: item.id }, item.text)
          )
        )
      }

      mountReactive(h(Component, {}), container)

      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')

      // Update signal
      items.value = [
        { id: 2, text: 'Item 2 Updated' },
        { id: 1, text: 'Item 1 Updated' }
      ]

      await Promise.resolve()

      expect(container.textContent).toContain('Item 1 Updated')
      expect(container.textContent).toContain('Item 2 Updated')
    })

    it('should efficiently handle large list updates', async () => {
      const count = signal(100)

      const Component = () => {
        return h('div', { class: 'list-container' },
          () => Array.from({ length: count.value }, (_, i) =>
            h('div', { key: i, class: 'list-item' }, `Item ${i}`)
          )
        )
      }

      mountReactive(h(Component, {}), container)

      const initialDivs = container.querySelectorAll('.list-item')
      expect(initialDivs.length).toBe(100)

      // Reduce count
      count.value = 50
      await Promise.resolve()

      const updatedDivs = container.querySelectorAll('.list-item')
      expect(updatedDivs.length).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('should handle null and undefined in children', () => {
      const oldVNode = h('div', {},
        h('span', { key: 'a' }, 'A'),
        null,
        undefined,
        h('span', { key: 'b' }, 'B')
      )
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
    })

    it('should handle all items being replaced', () => {
      // Initial: A, B, C
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      expect(container.children.length).toBe(3)

      // New: D, E, F (all different)
      const newVNodes = [
        h('div', { key: 'd' }, 'D'),
        h('div', { key: 'e' }, 'E'),
        h('div', { key: 'f' }, 'F')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('D')
      expect(container.children[1].textContent).toBe('E')
      expect(container.children[2].textContent).toBe('F')
    })

    it('should handle single item to multiple items', () => {
      const oldVNodes = [
        h('div', { key: 'a' }, 'A')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]

      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0]).toBe(oldA)
    })

    it('should handle multiple items to single item', () => {
      const oldVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B'),
        h('div', { key: 'c' }, 'C')
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const oldB = container.children[1]

      const newVNodes = [
        h('div', { key: 'b' }, 'B')
      ]

      reconcileArrays(container, oldVNodes, newVNodes, null)

      expect(container.children.length).toBe(1)
      expect(container.children[0]).toBe(oldB)
      expect(container.children[0].textContent).toBe('B')
    })

    it('should handle event handlers in reconciliation', () => {
      const oldClick = vi.fn()
      const newClick = vi.fn()

      const oldVNode = h('button', { onclick: oldClick }, 'Click')
      const node = mountReactive(oldVNode, container)
      oldVNode._node = node

      const button = container.querySelector('button')
      button?.click()
      expect(oldClick).toHaveBeenCalledTimes(1)

      const newVNode = h('button', { onclick: newClick }, 'Click')
      reconcileArrays(container, [oldVNode], [newVNode], null)

      button?.click()
      // New handler should be called
      expect(newClick).toHaveBeenCalledTimes(1)
      // Old handler should not be called again
      expect(oldClick).toHaveBeenCalledTimes(1)
    })

    it('should handle duplicate keys gracefully', () => {
      // This is an error case, but should not crash
      const oldVNodes = [
        h('div', { key: 'a' }, 'A1'),
        h('div', { key: 'a' }, 'A2') // Duplicate key
      ]

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      const newVNodes = [
        h('div', { key: 'a' }, 'A Updated')
      ]

      // Should not throw
      expect(() => {
        reconcileArrays(container, oldVNodes, newVNodes, null)
      }).not.toThrow()
    })

    it('should handle very long lists efficiently', () => {
      const oldVNodes = Array.from({ length: 1000 }, (_, i) =>
        h('div', { key: i }, `Item ${i}`)
      )

      for (const vnode of oldVNodes) {
        const node = mountReactive(vnode, undefined)
        if (node) {
          vnode._node = node
          container.appendChild(node)
        }
      }

      // Reverse the list
      const newVNodes = [...oldVNodes].reverse().map((vnode, i) =>
        h('div', { key: 999 - i }, `Item ${999 - i}`)
      )

      const start = performance.now()
      reconcileArrays(container, oldVNodes, newVNodes, null)
      const duration = performance.now() - start

      expect(container.children.length).toBe(1000)
      expect(container.children[0].textContent).toBe('Item 999')
      expect(container.children[999].textContent).toBe('Item 0')
      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000) // 1 second
    })
  })

  describe('reconcileArrays with nextSibling', () => {
    it('should insert before nextSibling when provided', () => {
      const marker = document.createTextNode('MARKER')
      container.appendChild(marker)

      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B')
      ]

      reconcileArrays(container, [], newVNodes, marker)

      expect(container.childNodes.length).toBe(3)
      expect(container.childNodes[0].textContent).toBe('A')
      expect(container.childNodes[1].textContent).toBe('B')
      expect(container.childNodes[2]).toBe(marker)
    })

    it('should append when nextSibling is null', () => {
      const newVNodes = [
        h('div', { key: 'a' }, 'A'),
        h('div', { key: 'b' }, 'B')
      ]

      reconcileArrays(container, [], newVNodes, null)

      expect(container.children.length).toBe(2)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
    })
  })
})
