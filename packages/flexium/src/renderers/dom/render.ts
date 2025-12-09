/**
 * DOM Render Function
 *
 * This module provides the main render function for mounting components to the DOM.
 * It includes simple reconciliation logic for mounting and unmounting components.
 *
 * Note: This module uses reactive rendering internally via mountReactive.
 * For root-level rendering with cleanup support, use createReactiveRoot.
 */

import type { FNode, FNodeChild } from '../../core/renderer'
import { domRenderer } from './index'
import { isFNode } from './f'
import { mountReactive, createReactiveRoot } from './reactive'

/**
 * Internal node data stored on DOM nodes
 */
interface NodeData {
  vnode: FNode | null
  props: Record<string, unknown>
}

const NODE_DATA = new WeakMap<Node, NodeData>()

/**
 * Render a component to a DOM container with automatic reactivity
 *
 * This function uses reactive rendering by default, which means:
 * - Signals passed as children automatically update the DOM
 * - Signals in props automatically update element properties
 * - Component functions automatically re-render when signals change
 *
 * @param vnode - Flexium node to render
 * @returns The rendered DOM node
 *
 * @example
 * const count = signal(0);
 * render(f('div', {}, [count]), document.body);
 * // The div will automatically update when count changes
 */
/**
 * Mounts a Flexium node to a container
 * @param node - Flexium node to render
 * @param container - DOM element to mount to
 */
export function render(
  node: FNode | string | number | null | undefined | Function,
  container: HTMLElement
): Node | null {
  // Clear container
  container.innerHTML = ''
  return mountReactive(node, container)
}

/**
 * Internal function to mount a node
 */
function mountNode(node: FNodeChild | Function): Node | null {
  // Handle primitives
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null
  }

  // Handle arrays (fragments)
  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment()
    for (const child of node) {
      const childNode = mountNode(child)
      if (childNode) {
        domRenderer.appendChild(fragment, childNode)
      }
    }
    return fragment
  }

  // Handle functions (signals or components returning functions)
  if (typeof node === 'function') {
    return mountNode(node())
  }

  // Handle strings/numbers
  if (typeof node === 'string' || typeof node === 'number') {
    return domRenderer.createTextNode(String(node))
  }

  // Handle FNodes
  if (isFNode(node)) {
    // Handle function components
    if (typeof node.type === 'function') {
      const component = node.type
      const result = component({ ...node.props, children: node.children })
      return mountNode(result)
    }

    // Handle fragments
    if (node.type === 'fragment') {
      const fragment = document.createDocumentFragment()
      for (const child of node.children) {
        const childNode = mountNode(child)
        if (childNode) {
          domRenderer.appendChild(fragment, childNode)
        }
      }
      return fragment
    }

    // Handle DOM elements
    const domNode = domRenderer.createNode(node.type, node.props)

    // Handle children
    for (const child of node.children) {
      const childNode = mountNode(child)
      if (childNode) {
        domRenderer.appendChild(domNode, childNode)
      }
    }

    return domNode
  }

  return null
}

/**
 * Unmount a DOM node and clean up
 */
function unmount(node: Node): void {
  // Clean up children first
  const childNodes = Array.from(node.childNodes)
  for (const child of childNodes) {
    unmount(child)
  }

  // Remove from parent
  if (node.parentNode) {
    node.parentNode.removeChild(node)
  }

  // Clean up stored data
  NODE_DATA.delete(node)
}

/**
 * Update an existing DOM node with a new flexium node
 * (Simple implementation - will be enhanced with proper reconciliation later)
 */
export function update(
  node: HTMLElement,
  oldVNode: FNode,
  newVNode: FNode
): void {
  // If types don't match, replace the node
  if (oldVNode.type !== newVNode.type) {
    const newNode = mountNode(newVNode)
    if (newNode && node.parentNode) {
      node.parentNode.replaceChild(newNode, node)
    }
    unmount(node)
    return
  }

  // Update props
  domRenderer.updateNode(node, oldVNode.props, newVNode.props)

  // Update stored data
  NODE_DATA.set(node, {
    vnode: newVNode,
    props: newVNode.props,
  })

  // Update children (simple approach for now)
  const oldChildren = oldVNode.children
  const newChildren = newVNode.children

  // Simple reconciliation: update/add/remove based on index
  const maxLength = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i]
    const newChild = newChildren[i]
    const childNode = node.childNodes[i]

    if (!newChild) {
      // Remove old child
      if (childNode) {
        unmount(childNode)
      }
    } else if (!oldChild) {
      // Add new child
      const newChildNode = mountNode(newChild)
      if (newChildNode) {
        domRenderer.appendChild(node, newChildNode)
      }
    } else if (typeof oldChild === 'string' || typeof oldChild === 'number') {
      // Update text node
      if (typeof newChild === 'string' || typeof newChild === 'number') {
        if (oldChild !== newChild && childNode) {
          domRenderer.updateTextNode(childNode as Text, String(newChild))
        }
      } else {
        // Replace text with element
        const newChildNode = mountNode(newChild)
        if (newChildNode && childNode) {
          node.replaceChild(newChildNode, childNode)
          unmount(childNode)
        }
      }
    } else if (isFNode(oldChild)) {
      if (typeof newChild === 'string' || typeof newChild === 'number') {
        // Replace element with text
        const newChildNode = mountNode(newChild)
        if (newChildNode && childNode) {
          node.replaceChild(newChildNode, childNode)
          unmount(childNode)
        }
      } else if (isFNode(newChild)) {
        // Update element
        if (childNode instanceof HTMLElement) {
          update(childNode, oldChild, newChild)
        }
      }
    }
  }
}

/**
 * Create a root for rendering with automatic reactivity
 *
 * This creates a root that supports fine-grained reactive updates.
 * Signals are automatically tracked and only the affected DOM nodes are updated.
 *
 * @param container - DOM element to render into
 * @returns Root object with render and unmount methods
 *
 * @example
 * const root = createRoot(document.body);
 * const count = signal(0);
 * root.render(f('div', {}, [count]));
 * // Later: count.value++ will automatically update the DOM
 */
export function createRoot(container: HTMLElement) {
  // Use reactive root for automatic signal tracking
  return createReactiveRoot(container)
}

