import { FNode } from '../../core/renderer'
import { domRenderer } from './index'
import { mountReactive, cleanupReactive } from './reactive'
import { getNode, setNode } from './node-map'

/**
 * Object pool for Map/Set used in reconciliation to reduce GC pressure
 * Performance: Reuse Map and Set instances instead of creating new ones
 */
namespace ReconciliationPool {
  const mapPool: Map<string | number | undefined, FNode>[] = []
  const setPool: Set<string | number | undefined>[] = []
  const MAX_POOL_SIZE = 10

  export function getMap(): Map<string | number | undefined, FNode> {
    if (mapPool.length > 0) {
      const map = mapPool.pop()!
      map.clear()
      return map
    }
    return new Map()
  }

  export function getSet(): Set<string | number | undefined> {
    if (setPool.length > 0) {
      const set = setPool.pop()!
      set.clear()
      return set
    }
    return new Set()
  }

  export function release(
    map: Map<string | number | undefined, FNode>,
    set: Set<string | number | undefined>
  ): void {
    if (mapPool.length < MAX_POOL_SIZE) {
      mapPool.push(map)
    }
    if (setPool.length < MAX_POOL_SIZE) {
      setPool.push(set)
    }
  }
}

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

  // Performance: Fast path for small lists (5 or fewer items) - avoid Map/Set overhead
  const oldLen = oldFNodes.length
  const newLen = newFNodes.length
  const SMALL_LIST_THRESHOLD = 5

  if (oldLen <= SMALL_LIST_THRESHOLD && newLen <= SMALL_LIST_THRESHOLD) {
    // Simple linear reconciliation for small lists
    let oldIdx = 0
    let newIdx = 0
    let currentChild = parent.firstChild

    while (oldIdx < oldLen || newIdx < newLen) {
      if (newIdx >= newLen) {
        // Remove remaining old nodes
        while (oldIdx < oldLen) {
          const oldFNode = oldFNodes[oldIdx++]
          const node = oldFNode && getNode(oldFNode)
          if (node) {
            cleanupReactive(node)
            domRenderer.removeChild(parent, node)
          }
        }
        break
      }

      if (oldIdx >= oldLen) {
        // Add remaining new nodes
        const fragment = document.createDocumentFragment()
        while (newIdx < newLen) {
          const newFNode = newFNodes[newIdx++]
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
        break
      }

      const oldFNode = oldFNodes[oldIdx]
      const newFNode = newFNodes[newIdx]
      const oldKey = oldFNode.key ?? `__idx_${oldIdx}_${oldFNode.type}`
      const newKey = newFNode.key ?? `__idx_${newIdx}_${newFNode.type}`

      if (oldKey === newKey && oldFNode.type === newFNode.type) {
        // Same node: patch and advance both
        patchNode(oldFNode, newFNode)
        currentChild = currentChild?.nextSibling || null
        oldIdx++
        newIdx++
      } else {
        // Different: check if we can find matching old node
        let found = false
        for (let searchIdx = oldIdx + 1; searchIdx < oldLen; searchIdx++) {
          const searchFNode = oldFNodes[searchIdx]
          const searchKey = searchFNode.key ?? `__idx_${searchIdx}_${searchFNode.type}`
          if (searchKey === newKey && searchFNode.type === newFNode.type) {
            // Found match: remove nodes between oldIdx and searchIdx, then patch
            for (let removeIdx = oldIdx; removeIdx < searchIdx; removeIdx++) {
              const removeFNode = oldFNodes[removeIdx]
              const node = removeFNode && getNode(removeFNode)
              if (node) {
                cleanupReactive(node)
                domRenderer.removeChild(parent, node)
              }
            }
            patchNode(searchFNode, newFNode)
            oldIdx = searchIdx + 1
            newIdx++
            found = true
            break
          }
        }
        if (!found) {
          // No match: insert new node
          const node = mountReactive(newFNode, undefined)
          if (node) {
            setNode(newFNode, node)
            parent.insertBefore(node, currentChild)
          }
          newIdx++
        }
      }
    }
    return
  }

  // Performance: Reuse Map/Set from pool to reduce GC pressure
  const keyToOldFNode = ReconciliationPool.getMap()
  const seen = ReconciliationPool.getSet()

  // Build key-to-node mapping
  for (let i = 0; i < oldLen; i++) {
    const fnode = oldFNodes[i]
    // Use key if available, otherwise use index with type prefix for uniqueness
    const key = fnode.key ?? `__idx_${i}_${fnode.type}`
    keyToOldFNode.set(key, fnode)
  }

  // Forward pass: process new nodes
  let currentChild = parent.firstChild

  for (let i = 0; i < newFNodes.length; i++) {
    const newFNode = newFNodes[i]
    const key = newFNode.key ?? `__idx_${i}_${newFNode.type}`
    seen.add(key)

    const oldFNode = keyToOldFNode.get(key)

    // Determine the reference node for insertion
    // If currentChild is valid, insert before it. Otherwise append (refNode is null).
    const refNode = currentChild

    if (!oldFNode || oldFNode.type !== newFNode.type) {
      // New node or type changed: create and insert
      const node = mountReactive(newFNode, undefined)
      if (node) {
        setNode(newFNode, node)
        parent.insertBefore(node, refNode)
        // We inserted a new node before currentChild, so currentChild is still the next one to process
      }
      // If type changed, old node will be removed in cleanup pass
    } else {
      // Existing node: patch and maybe move
      patchNode(oldFNode, newFNode)

      const node = getNode(newFNode)
      if (node) {
        if (currentChild !== node) {
          // Position wrong: move to correct position (before currentChild)
          parent.insertBefore(node, refNode)
          // We moved the node here. currentChild is still the next one to process.
        } else {
          // Position correct: match!
          // Advance pointer since we consumed this node
          currentChild = currentChild?.nextSibling || null
        }
      }
    }
  }

  // Cleanup pass: remove nodes not in new list
  for (const [key, fnode] of keyToOldFNode) {
    const node = getNode(fnode)
    if (!seen.has(key) && node) {
      cleanupReactive(node)
      // Check if node is still attached before removing
      if (node.parentNode === parent) {
        domRenderer.removeChild(parent, node)
      }
    }
  }

  // Performance: Return Map/Set to pool for reuse
  ReconciliationPool.release(keyToOldFNode, seen)
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
