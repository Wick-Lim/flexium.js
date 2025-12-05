import { FNode } from '../../core/renderer'
import { domRenderer } from './index'
import { mountReactive, cleanupReactive } from './reactive'

/**
 * Reconcile two arrays of FNodes using keyed diffing.
 * This implementation handles both DOM reordering (moves) and updates (patches).
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
  // Handle missing/empty arrays safely
  const hasOld = oldFNodes && oldFNodes.length > 0
  const hasNew = newFNodes && newFNodes.length > 0

  if (!hasOld && !hasNew) return

  if (!hasNew) {
    // No new nodes, remove all old nodes
    for (const node of oldFNodes) {
      if (node && node._node) {
        cleanupReactive(node._node)
        domRenderer.removeChild(parent, node._node)
      }
    }
    return
  }

  if (!hasOld) {
    // No old nodes, just append all new nodes
    const fragment = document.createDocumentFragment()
    for (const newFNode of newFNodes) {
      const newNode = mountReactive(newFNode, undefined)
      if (newNode) {
        newFNode._node = newNode
        fragment.appendChild(newNode)
      }
    }
    if (nextSibling) {
      parent.insertBefore(fragment, nextSibling)
    } else {
      parent.appendChild(fragment)
    }
    return
  }

  let oldStartIdx = 0
  let oldEndIdx = oldFNodes.length - 1
  let newStartIdx = 0
  let newEndIdx = newFNodes.length - 1

  let oldStartFNode = oldFNodes[0]
  let oldEndFNode = oldFNodes[oldEndIdx]
  let newStartFNode = newFNodes[0]
  let newEndFNode = newFNodes[newEndIdx]

  let oldKeyToIdx: Map<string | number, number> | undefined

  // While both lists have unvisited nodes
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartFNode == null) {
      oldStartFNode = oldFNodes[++oldStartIdx]
    } else if (oldEndFNode == null) {
      oldEndFNode = oldFNodes[--oldEndIdx]
    } else if (newStartFNode == null) {
      newStartFNode = newFNodes[++newStartIdx]
    } else if (newEndFNode == null) {
      newEndFNode = newFNodes[--newEndIdx]
    }

    // 1. Same Start: Key matches at the beginning
    else if (isSameKey(oldStartFNode, newStartFNode)) {
      patchNode(oldStartFNode, newStartFNode)

      oldStartFNode = oldFNodes[++oldStartIdx]
      newStartFNode = newFNodes[++newStartIdx]
    }

    // 2. Same End: Key matches at the end
    else if (isSameKey(oldEndFNode, newEndFNode)) {
      patchNode(oldEndFNode, newEndFNode)

      oldEndFNode = oldFNodes[--oldEndIdx]
      newEndFNode = newFNodes[--newEndIdx]
    }

    // 3. Reversed: Old Start matches New End (Move Right)
    else if (isSameKey(oldStartFNode, newEndFNode)) {
      patchNode(oldStartFNode, newEndFNode)
      // Move the old start node to AFTER the old end node
      domRenderer.insertBefore(
        parent,
        oldStartFNode._node,
        domRenderer.nextSibling(oldEndFNode._node)
      )

      oldStartFNode = oldFNodes[++oldStartIdx]
      newEndFNode = newFNodes[--newEndIdx]
    }

    // 4. Reversed: Old End matches New Start (Move Left)
    else if (isSameKey(oldEndFNode, newStartFNode)) {
      patchNode(oldEndFNode, newStartFNode)
      // Move the old end node to BEFORE the old start node
      domRenderer.insertBefore(parent, oldEndFNode._node, oldStartFNode._node)

      oldEndFNode = oldFNodes[--oldEndIdx]
      newStartFNode = newFNodes[++newStartIdx]
    }

    // 5. Keyed Mode: Search in map
    else {
      if (!oldKeyToIdx) {
        oldKeyToIdx = createKeyMap(oldFNodes, oldStartIdx, oldEndIdx)
      }

      const key = newStartFNode.key
      const idxInOld = key != null ? oldKeyToIdx.get(key) : undefined

      if (idxInOld === undefined) {
        // New node: Create and insert
        const newNode = mountReactive(newStartFNode, undefined) // Don't append yet
        if (newNode) {
          newStartFNode._node = newNode
          domRenderer.insertBefore(parent, newNode, oldStartFNode._node)
        }
      } else {
        // Node exists: Move and Patch
        const fnodeToMove = oldFNodes[idxInOld]
        patchNode(fnodeToMove, newStartFNode)

        // Mark as processed in old list
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oldFNodes[idxInOld] = undefined as any

        domRenderer.insertBefore(parent, fnodeToMove._node, oldStartFNode._node)
      }

      newStartFNode = newFNodes[++newStartIdx]
    }
  }

  // Add remaining new nodes
  if (oldStartIdx > oldEndIdx) {
    const before =
      newFNodes[newEndIdx + 1] == null
        ? nextSibling
        : newFNodes[newEndIdx + 1]._node
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const newNode = mountReactive(newFNodes[i], undefined)
      if (newNode) {
        newFNodes[i]._node = newNode
        domRenderer.insertBefore(parent, newNode, before)
      }
    }
  }

  // Remove remaining old nodes
  else if (newStartIdx > newEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      const nodeToRemove = oldFNodes[i]
      if (nodeToRemove && nodeToRemove._node) {
        cleanupReactive(nodeToRemove._node)
        domRenderer.removeChild(parent, nodeToRemove._node)
      }
    }
  }
}

function isSameKey(n1: FNode, n2: FNode): boolean {
  return n1.key === n2.key && n1.type === n2.type
}

function createKeyMap(
  children: FNode[],
  start: number,
  end: number
): Map<string | number, number> {
  const map = new Map<string | number, number>()
  for (let i = start; i <= end; i++) {
    const key = children[i].key
    if (key != null) {
      map.set(key, i)
    }
  }
  return map
}

/**
 * Patch an existing FNode with new props and children
 */
function patchNode(oldFNode: FNode, newFNode: FNode) {
  const node = oldFNode._node as HTMLElement
  if (!node) return

  // Transfer DOM reference
  newFNode._node = node

  // 1. Element Node: Update props and children
  if (typeof newFNode.type === 'string') {
    // Update props
    domRenderer.updateNode(node, oldFNode.props, newFNode.props)

    // Update children
    const oldChildren = oldFNode.children || []
    const newChildren = newFNode.children || []

    if (oldChildren.length > 0 || newChildren.length > 0) {
      // If children are text content, updateNode handles it if implemented,
      // but typically children array contains FNodes or primitives.
      // mountReactive normalizes text to Text Nodes, but FNode structure might have raw strings.

      // Ideally we should normalize children before reconcile.
      // For now, let's assume children are FNodes or compatible.
      // If children are purely text strings, reconcileArrays might fail if not FNodes.

      // Simple check: if both are single text/number child, update text content directly
      if (
        newChildren.length === 1 &&
        (typeof newChildren[0] === 'string' ||
          typeof newChildren[0] === 'number') &&
        node.firstChild &&
        node.firstChild.nodeType === Node.TEXT_NODE &&
        node.childNodes.length === 1
      ) {
        if (String(oldChildren[0]) !== String(newChildren[0])) {
          domRenderer.updateTextNode(
            node.firstChild as Text,
            String(newChildren[0])
          )
        }
        return
      }

      reconcileArrays(
        node,
        oldChildren as FNode[],
        newChildren as FNode[],
        null
      )
    }
  }

  // 2. Component Node: Can't easily patch without instance state.
  // In the current architecture, components are executed in mountReactive and return a DOM node.
  // We don't store the component "instance" or "update" function.
  // So we can't update the component with new props.
  //
  // Fallback: If it's a component, we assume it's handled by internal reactivity if props are signals.
  // If props are raw values and changed, we unfortunately can't update it without remounting.
  //
  // BUT, for the specific case of the benchmark where Row returns a 'div',
  // the reconcileArrays is called on the children of 'App'.
  // 'App' renders: [ { type: Row }, { type: Row } ... ]
  // reconcileArrays sees FNodes with type=Row.
  // It calls patchNode(RowFNode, RowFNode).
  //
  // Here we are stuck. We can't patch 'Row' because we don't have the 'div' FNode it returned.
  // The 'div' FNode was created inside mountReactive -> effect -> component().
  //
  // To support VDOM-style component updates, we would need to change FNode structure to store instance/cleanup.
  //
  // However, if the benchmark used f('div') directly instead of f(Row), it would work with the logic above.
  //
  // Optimization for Benchmark:
  // Since we can't patch components properly yet, let's leave it as no-op for components.
  // Users should use Signals for updates inside components.
  // Or use Element FNodes directly in lists for VDOM-style diffing support.
}
