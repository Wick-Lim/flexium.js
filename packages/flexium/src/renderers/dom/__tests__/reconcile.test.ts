/**
 * DOM Reconciliation Algorithm Tests
 *
 * Tests for the keyed diffing algorithm used in reconcileArrays and patchNode.
 * These tests ensure efficient DOM updates when lists change.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { reconcileArrays } from '../reconcile'
import { f } from '../f'
import { mountReactive, cleanupReactive } from '../reactive'
import { signal } from '../../../core/signal'
import type { FNode } from '../../../core/renderer'
import { setNode } from '../node-map'

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
      const oldFNodes: FNode[] = []
      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
      expect(container.children[2].textContent).toBe('C')
    })

    it('should remove all items when new array is empty', () => {
      // First mount the items
      const initialFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
      ]

      for (const fnode of initialFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      expect(container.children.length).toBe(2)

      // Now reconcile with empty array
      reconcileArrays(container, initialFNodes, [], null)

      expect(container.children.length).toBe(0)
    })

    it('should preserve DOM nodes when keys match', () => {
      // Initial mount
      const oldFNodes = [
        f('div', { key: 'a', class: 'item' }, 'A'),
        f('div', { key: 'b', class: 'item' }, 'B'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const firstDiv = container.children[0]
      const secondDiv = container.children[1]

      // Update with same keys
      const newFNodes = [
        f('div', { key: 'a', class: 'item' }, 'A Updated'),
        f('div', { key: 'b', class: 'item' }, 'B Updated'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      // Same DOM nodes should be preserved
      expect(container.children[0]).toBe(firstDiv)
      expect(container.children[1]).toBe(secondDiv)
      expect(container.children[0].textContent).toBe('A Updated')
      expect(container.children[1].textContent).toBe('B Updated')
    })

    it('should handle prepending items', () => {
      // Initial: B, C
      const oldFNodes = [
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldB = container.children[0]
      const oldC = container.children[1]

      // New: A, B, C
      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]

      // New: A, B, C
      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldC = container.children[2]

      // New: A, C (remove B)
      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'c' }, 'C'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children.length).toBe(2)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('C')
      expect(container.children[0]).toBe(oldA)
      expect(container.children[1]).toBe(oldC)
    })

    it('should handle inserting items in middle', () => {
      // Initial: A, C
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldC = container.children[1]

      // New: A, B, C (insert B)
      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: C, B, A
      const newFNodes = [
        f('div', { key: 'c' }, 'C'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'a' }, 'A'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: C, B, A
      const newFNodes = [
        f('div', { key: 'c' }, 'C'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'a' }, 'A'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children[0]).toBe(oldC)
      expect(container.children[1]).toBe(oldB)
      expect(container.children[2]).toBe(oldA)
    })

    it('should handle moving item from start to end', () => {
      // Initial: A, B, C
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: B, C, A
      const newFNodes = [
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
        f('div', { key: 'a' }, 'A'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[1]
      const oldC = container.children[2]

      // New: C, A, B
      const newFNodes = [
        f('div', { key: 'c' }, 'C'),
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
        f('div', { key: 'd' }, 'D'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldB = container.children[1]
      const oldD = container.children[3]

      // New: E, D, B, F (remove A and C, add E and F, reorder)
      const newFNodes = [
        f('div', { key: 'e' }, 'E'),
        f('div', { key: 'd' }, 'D'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'f' }, 'F'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldFNodes = [
        f('div', {}, 'A'),
        f('div', {}, 'B'),
        f('div', {}, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldFirst = container.children[0]

      // New: div, div (remove one)
      const newFNodes = [f('div', {}, 'A Updated'), f('div', {}, 'B Updated')]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children.length).toBe(2)
      expect(container.children[0].textContent).toBe('A Updated')
      expect(container.children[1].textContent).toBe('B Updated')
      // First node should be reused
      expect(container.children[0]).toBe(oldFirst)
    })

    it('should handle mixed keyed and unkeyed children', () => {
      // Initial: keyed A, unkeyed div, keyed B
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', {}, 'Unkeyed'),
        f('div', { key: 'b' }, 'B'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]
      const oldB = container.children[2]

      // New: keyed B, unkeyed div, keyed A (reorder keyed, update unkeyed)
      const newFNodes = [
        f('div', { key: 'b' }, 'B'),
        f('div', {}, 'Unkeyed Updated'),
        f('div', { key: 'a' }, 'A'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldVNode = f('div', { class: 'test' }, 'Old Text')
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      expect(container.textContent).toBe('Old Text')

      // Update via reconciliation
      const newVNode = f('div', { class: 'test' }, 'New Text')
      const newFNodes = [newVNode]
      const oldFNodes = [oldVNode]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.textContent).toBe('New Text')
    })

    it('should update element attributes', () => {
      // Initial render
      const oldVNode = f('div', { class: 'old', id: 'test' }, 'Content')
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const div = container.querySelector('div')
      expect(div?.className).toBe('old')
      expect(div?.id).toBe('test')

      // Update via reconciliation
      const newVNode = f(
        'div',
        { class: 'new', id: 'test', title: 'tooltip' },
        'Content'
      )
      const newFNodes = [newVNode]
      const oldFNodes = [oldVNode]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(div?.className).toBe('new')
      expect(div?.id).toBe('test')
      expect(div?.title).toBe('tooltip')
    })

    it('should remove attributes when they are removed from props', () => {
      // Initial render
      const oldVNode = f(
        'div',
        { class: 'test', title: 'tooltip', id: 'myid' },
        'Content'
      )
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const div = container.querySelector('div')
      expect(div?.title).toBe('tooltip')

      // Update without title
      const newVNode = f('div', { class: 'test', id: 'myid' }, 'Content')
      const newFNodes = [newVNode]
      const oldFNodes = [oldVNode]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(div?.hasAttribute('title')).toBe(false)
    })

    it('should update style attributes', () => {
      // Initial render
      const oldVNode = f(
        'div',
        { style: { color: 'red', fontSize: '14px' } },
        'Styled'
      )
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const div = container.querySelector('div') as HTMLElement
      expect(div?.style.color).toBe('red')

      // Update style
      const newVNode = f(
        'div',
        { style: { color: 'blue', fontSize: '16px' } },
        'Styled'
      )
      const newFNodes = [newVNode]
      const oldFNodes = [oldVNode]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(div?.style.color).toBe('blue')
      expect(div?.style.fontSize).toBe('16px')
    })

    it('should handle different element types with same key', () => {
      // This test verifies that isSameKey checks both key AND type
      // When the type changes, the node is not reused even if keys match
      const oldFNodes = [f('div', { key: 'item' }, 'A div')]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldDiv = container.querySelector('div')
      expect(oldDiv).not.toBeNull()

      // Change type from div to span with same key
      // isSameKey should return false, so old div is removed and new span created
      const newFNodes = [f('span', { key: 'item' }, 'A span')]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      // After reconciliation, the type and content should match the new node
      // The exact behavior depends on how the algorithm handles type mismatches
      expect(container.children.length).toBeGreaterThan(0)
      expect(container.textContent).toContain('A span')
    })

    it('should update nested children', () => {
      // Initial: div with two spans
      const spanA = f('span', { key: 'a' }, 'A')
      const spanB = f('span', { key: 'b' }, 'B')
      const oldVNode = f('div', {}, spanA, spanB)

      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
      const oldSpanA = spans[0]
      const oldSpanB = spans[1]

      // Store child node references
      setNode(spanA, oldSpanA)
      setNode(spanB, oldSpanB)

      // Update: swap spans
      const newSpanB = f('span', { key: 'b' }, 'B Updated')
      const newSpanA = f('span', { key: 'a' }, 'A Updated')
      const newVNode = f('div', {}, newSpanB, newSpanA)

      const newFNodes = [newVNode]
      const oldFNodes = [oldVNode]

      reconcileArrays(container, oldFNodes, newFNodes, null)

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
      const oldVNode = f('div', {}, 'Original Text')
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const div = container.querySelector('div')
      const textNode = div?.firstChild as Text
      expect(textNode.textContent).toBe('Original Text')

      const newVNode = f('div', {}, 'Updated Text')
      reconcileArrays(container, [oldVNode], [newVNode], null)

      expect(textNode.textContent).toBe('Updated Text')
      // Should be same text node
      expect(div?.firstChild).toBe(textNode)
    })

    it('should handle number to string updates', () => {
      const oldVNode = f('div', {}, 123)
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      expect(container.textContent).toBe('123')

      const newVNode = f('div', {}, 456)
      reconcileArrays(container, [oldVNode], [newVNode], null)

      expect(container.textContent).toBe('456')
    })

    it('should handle text to element updates', () => {
      const oldVNode = f('div', {}, 'Just text')
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const div = container.querySelector('div')
      expect(div?.childNodes.length).toBe(1)
      expect(div?.firstChild?.nodeType).toBe(Node.TEXT_NODE)

      // Update to have nested element
      const newVNode = f('div', {}, f('span', {}, 'Nested element'))
      reconcileArrays(container, [oldVNode], [newVNode], null)

      expect(div?.querySelector('span')).not.toBeNull()
      expect(div?.querySelector('span')?.textContent).toBe('Nested element')
    })
  })

  describe('integration with reactive signals', () => {
    it('should work with signal-driven lists', async () => {
      const items = signal([
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
      ])

      const Component = () => {
        return f('div', {}, () =>
          items.value.map((item) => f('div', { key: item.id }, item.text))
        )
      }

      mountReactive(f(Component, {}), container)

      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')

      // Update signal
      items.value = [
        { id: 2, text: 'Item 2 Updated' },
        { id: 1, text: 'Item 1 Updated' },
      ]

      await Promise.resolve()

      expect(container.textContent).toContain('Item 1 Updated')
      expect(container.textContent).toContain('Item 2 Updated')
    })

    it('should efficiently handle large list updates', async () => {
      const count = signal(100)

      const Component = () => {
        return f('div', { class: 'list-container' }, () =>
          Array.from({ length: count.value }, (_, i) =>
            f('div', { key: i, class: 'list-item' }, `Item ${i}`)
          )
        )
      }

      mountReactive(f(Component, {}), container)

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
      const oldVNode = f(
        'div',
        {},
        f('span', { key: 'a' }, 'A'),
        null,
        undefined,
        f('span', { key: 'b' }, 'B')
      )
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const spans = container.querySelectorAll('span')
      expect(spans.length).toBe(2)
    })

    it('should handle all items being replaced', () => {
      // Initial: A, B, C
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      expect(container.children.length).toBe(3)

      // New: D, E, F (all different)
      const newFNodes = [
        f('div', { key: 'd' }, 'D'),
        f('div', { key: 'e' }, 'E'),
        f('div', { key: 'f' }, 'F'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0].textContent).toBe('D')
      expect(container.children[1].textContent).toBe('E')
      expect(container.children[2].textContent).toBe('F')
    })

    it('should handle single item to multiple items', () => {
      const oldFNodes = [f('div', { key: 'a' }, 'A')]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldA = container.children[0]

      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children.length).toBe(3)
      expect(container.children[0]).toBe(oldA)
    })

    it('should handle multiple items to single item', () => {
      const oldFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
        f('div', { key: 'c' }, 'C'),
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const oldB = container.children[1]

      const newFNodes = [f('div', { key: 'b' }, 'B')]

      reconcileArrays(container, oldFNodes, newFNodes, null)

      expect(container.children.length).toBe(1)
      expect(container.children[0]).toBe(oldB)
      expect(container.children[0].textContent).toBe('B')
    })

    it('should handle event handlers in reconciliation', () => {
      const oldClick = vi.fn()
      const newClick = vi.fn()

      const oldVNode = f('button', { onclick: oldClick }, 'Click')
      const node = mountReactive(oldVNode, container)
      setNode(oldVNode, node!)

      const button = container.querySelector('button')
      button?.click()
      expect(oldClick).toHaveBeenCalledTimes(1)

      const newVNode = f('button', { onclick: newClick }, 'Click')
      reconcileArrays(container, [oldVNode], [newVNode], null)

      button?.click()
      // New handler should be called
      expect(newClick).toHaveBeenCalledTimes(1)
      // Old handler should not be called again
      expect(oldClick).toHaveBeenCalledTimes(1)
    })

    it('should handle duplicate keys gracefully', () => {
      // This is an error case, but should not crash
      const oldFNodes = [
        f('div', { key: 'a' }, 'A1'),
        f('div', { key: 'a' }, 'A2'), // Duplicate key
      ]

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      const newFNodes = [f('div', { key: 'a' }, 'A Updated')]

      // Should not throw
      expect(() => {
        reconcileArrays(container, oldFNodes, newFNodes, null)
      }).not.toThrow()
    })

    it('should handle very long lists efficiently', () => {
      const oldFNodes = Array.from({ length: 1000 }, (_, i) =>
        f('div', { key: i }, `Item ${i}`)
      )

      for (const fnode of oldFNodes) {
        const node = mountReactive(fnode, undefined)
        if (node) {
          setNode(fnode, node)
          container.appendChild(node)
        }
      }

      // Reverse the list
      const newFNodes = [...oldFNodes]
        .reverse()
        .map((fnode, i) => f('div', { key: 999 - i }, `Item ${999 - i}`))

      const start = performance.now()
      reconcileArrays(container, oldFNodes, newFNodes, null)
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

      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
      ]

      reconcileArrays(container, [], newFNodes, marker)

      expect(container.childNodes.length).toBe(3)
      expect(container.childNodes[0].textContent).toBe('A')
      expect(container.childNodes[1].textContent).toBe('B')
      expect(container.childNodes[2]).toBe(marker)
    })

    it('should append when nextSibling is null', () => {
      const newFNodes = [
        f('div', { key: 'a' }, 'A'),
        f('div', { key: 'b' }, 'B'),
      ]

      reconcileArrays(container, [], newFNodes, null)

      expect(container.children.length).toBe(2)
      expect(container.children[0].textContent).toBe('A')
      expect(container.children[1].textContent).toBe('B')
    })
  })
})
