import { FNode } from '../../core/renderer'
import { domRenderer } from './index'
import { mountReactive, cleanupReactive } from './reactive'
import { getNode, setNode } from './node-map'

/**
 * Reconcile two arrays of FNodes using hybrid key-based approach.
 * Simple Map lookup + position check for optimal DOM operations.
 *
 * @param parent The parent DOM node
 * @param oldFNodes The array of old FNodes (with attached DOM nodes)
 * @param newFNodes The array of new FNodes
 * @param nextSibling The node to insert before (for the end of the list)
 */
export function reconcileArrays(
  parent: Node,
  oldFNodes: FNode[],
  newFNodes: FNode[],
  nextSibling: Node | null
): void {
  const hasOld = oldFNodes && oldFNodes.length > 0
  const hasNew = newFNodes && newFNodes.length > 0

  // Fast path: both empty
  if (!hasOld && !hasNew) return

  // Fast path: remove all
  if (!hasNew) {
    for (const fnode of oldFNodes) {
      const node = fnode && getNode(fnode)
      if (node) {
        cleanupReactive(node)
        domRenderer.removeChild(parent, node)
      }
    }
    return
  }

  // Fast path: add all
  if (!hasOld) {
    const fragment = document.createDocumentFragment()
    for (const newFNode of newFNodes) {
      const node = mountReactive(newFNode, undefined)
      if (node) {
        setNode(newFNode, node)
        fragment.appendChild(node)
      }
    }
    if (nextSibling) {
      parent.insertBefore(fragment, nextSibling)
    } else {
      parent.appendChild(fragment)
    }
    return
  }

  // Build key → FNode map from old nodes
  const keyToOldFNode = new Map<string | number | undefined, FNode>()
  for (let i = 0; i < oldFNodes.length; i++) {
    const fnode = oldFNodes[i]
    // Use key if available, otherwise use index with type prefix for uniqueness
    const key = fnode.key ?? `__idx_${i}_${fnode.type}`
    keyToOldFNode.set(key, fnode)
  }

  const seen = new Set<string | number | undefined>()

  // Forward pass: process new nodes
  for (let i = 0; i < newFNodes.length; i++) {
    const newFNode = newFNodes[i]
    const key = newFNode.key ?? `__idx_${i}_${newFNode.type}`
    seen.add(key)

    const oldFNode = keyToOldFNode.get(key)
    const refNode = nextSibling
      ? (i < parent.childNodes.length ? parent.childNodes[i] : nextSibling)
      : parent.childNodes[i] || null

    if (!oldFNode || oldFNode.type !== newFNode.type) {
      // New node or type changed: create and insert
      const node = mountReactive(newFNode, undefined)
      if (node) {
        setNode(newFNode, node)
        parent.insertBefore(node, refNode)
      }
      // If type changed, old node will be removed in cleanup pass
    } else {
      // Existing node: patch and maybe move
      patchNode(oldFNode, newFNode)

      const node = getNode(newFNode)
      if (node && parent.childNodes[i] !== node) {
        // Position wrong: move to correct position
        parent.insertBefore(node, refNode)
      }
    }
  }

  // Cleanup pass: remove nodes not in new list
  for (const [key, fnode] of keyToOldFNode) {
    const node = getNode(fnode)
    if (!seen.has(key) && node) {
      cleanupReactive(node)
      domRenderer.removeChild(parent, node)
    }
  }
}

/**
 * Patch an existing FNode with new props and children
 */
function patchNode(oldFNode: FNode, newFNode: FNode) {
  const node = getNode(oldFNode) as HTMLElement
  if (!node) return

  // Transfer DOM reference
  setNode(newFNode, node)

  // Only patch element nodes (not components)
  if (typeof newFNode.type !== 'string') return

  // Update props
  domRenderer.updateNode(node, oldFNode.props, newFNode.props)

  // Update children
  const oldChildren = oldFNode.children || []
  const newChildren = newFNode.children || []

  if (oldChildren.length === 0 && newChildren.length === 0) return

  // Fast path: single text/number child
  if (
    newChildren.length === 1 &&
    (typeof newChildren[0] === 'string' || typeof newChildren[0] === 'number') &&
    node.firstChild?.nodeType === Node.TEXT_NODE &&
    node.childNodes.length === 1
  ) {
    const newText = String(newChildren[0])
    const oldText = String(oldChildren[0])
    if (oldText !== newText) {
      domRenderer.updateTextNode(node.firstChild as Text, newText)
    }
    return
  }

  // Recursive reconciliation for nested children
  reconcileArrays(
    node,
    oldChildren as FNode[],
    newChildren as FNode[],
    null
  )
}
