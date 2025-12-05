import { VNode } from '../../core/renderer'
import { domRenderer } from './index'
import { mountReactive, cleanupReactive } from './reactive'

/**
 * Reconcile two arrays of VNodes using keyed diffing.
 * This implementation handles both DOM reordering (moves) and updates (patches).
 *
 * @param parent The parent DOM node
 * @param oldVNodes The array of old VNodes (with attached DOM nodes)
 * @param newVNodes The array of new VNodes
 * @param nextSibling The node to insert before (for the end of the list)
 */
export function reconcileArrays(
  parent: Node,
  oldVNodes: VNode[],
  newVNodes: VNode[],
  nextSibling: Node | null
): void {
  // Handle missing/empty arrays safely
  const hasOld = oldVNodes && oldVNodes.length > 0
  const hasNew = newVNodes && newVNodes.length > 0

  if (!hasOld && !hasNew) return

  if (!hasNew) {
    // No new nodes, remove all old nodes
    for (const node of oldVNodes) {
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
    for (const newVNode of newVNodes) {
      const newNode = mountReactive(newVNode, undefined)
      if (newNode) {
        newVNode._node = newNode
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
  let oldEndIdx = oldVNodes.length - 1
  let newStartIdx = 0
  let newEndIdx = newVNodes.length - 1

  let oldStartVNode = oldVNodes[0]
  let oldEndVNode = oldVNodes[oldEndIdx]
  let newStartVNode = newVNodes[0]
  let newEndVNode = newVNodes[newEndIdx]

  let oldKeyToIdx: Map<string | number, number> | undefined

  // While both lists have unvisited nodes
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode == null) {
      oldStartVNode = oldVNodes[++oldStartIdx]
    } else if (oldEndVNode == null) {
      oldEndVNode = oldVNodes[--oldEndIdx]
    } else if (newStartVNode == null) {
      newStartVNode = newVNodes[++newStartIdx]
    } else if (newEndVNode == null) {
      newEndVNode = newVNodes[--newEndIdx]
    }

    // 1. Same Start: Key matches at the beginning
    else if (isSameKey(oldStartVNode, newStartVNode)) {
      patchNode(oldStartVNode, newStartVNode)

      oldStartVNode = oldVNodes[++oldStartIdx]
      newStartVNode = newVNodes[++newStartIdx]
    }

    // 2. Same End: Key matches at the end
    else if (isSameKey(oldEndVNode, newEndVNode)) {
      patchNode(oldEndVNode, newEndVNode)

      oldEndVNode = oldVNodes[--oldEndIdx]
      newEndVNode = newVNodes[--newEndIdx]
    }

    // 3. Reversed: Old Start matches New End (Move Right)
    else if (isSameKey(oldStartVNode, newEndVNode)) {
      patchNode(oldStartVNode, newEndVNode)
      // Move the old start node to AFTER the old end node
      domRenderer.insertBefore(
        parent,
        oldStartVNode._node,
        domRenderer.nextSibling(oldEndVNode._node)
      )

      oldStartVNode = oldVNodes[++oldStartIdx]
      newEndVNode = newVNodes[--newEndIdx]
    }

    // 4. Reversed: Old End matches New Start (Move Left)
    else if (isSameKey(oldEndVNode, newStartVNode)) {
      patchNode(oldEndVNode, newStartVNode)
      // Move the old end node to BEFORE the old start node
      domRenderer.insertBefore(parent, oldEndVNode._node, oldStartVNode._node)

      oldEndVNode = oldVNodes[--oldEndIdx]
      newStartVNode = newVNodes[++newStartIdx]
    }

    // 5. Keyed Mode: Search in map
    else {
      if (!oldKeyToIdx) {
        oldKeyToIdx = createKeyMap(oldVNodes, oldStartIdx, oldEndIdx)
      }

      const key = newStartVNode.key
      const idxInOld = key != null ? oldKeyToIdx.get(key) : undefined

      if (idxInOld === undefined) {
        // New node: Create and insert
        const newNode = mountReactive(newStartVNode, undefined) // Don't append yet
        if (newNode) {
          newStartVNode._node = newNode
          domRenderer.insertBefore(parent, newNode, oldStartVNode._node)
        }
      } else {
        // Node exists: Move and Patch
        const vnodeToMove = oldVNodes[idxInOld]
        patchNode(vnodeToMove, newStartVNode)

        // Mark as processed in old list
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oldVNodes[idxInOld] = undefined as any

        domRenderer.insertBefore(parent, vnodeToMove._node, oldStartVNode._node)
      }

      newStartVNode = newVNodes[++newStartIdx]
    }
  }

  // Add remaining new nodes
  if (oldStartIdx > oldEndIdx) {
    const before =
      newVNodes[newEndIdx + 1] == null
        ? nextSibling
        : newVNodes[newEndIdx + 1]._node
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const newNode = mountReactive(newVNodes[i], undefined)
      if (newNode) {
        newVNodes[i]._node = newNode
        domRenderer.insertBefore(parent, newNode, before)
      }
    }
  }

  // Remove remaining old nodes
  else if (newStartIdx > newEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      const nodeToRemove = oldVNodes[i]
      if (nodeToRemove && nodeToRemove._node) {
        cleanupReactive(nodeToRemove._node)
        domRenderer.removeChild(parent, nodeToRemove._node)
      }
    }
  }
}

function isSameKey(n1: VNode, n2: VNode): boolean {
  return n1.key === n2.key && n1.type === n2.type
}

function createKeyMap(
  children: VNode[],
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
 * Patch an existing VNode with new props and children
 */
function patchNode(oldVNode: VNode, newVNode: VNode) {
  const node = oldVNode._node as HTMLElement
  if (!node) return

  // Transfer DOM reference
  newVNode._node = node

  // 1. Element Node: Update props and children
  if (typeof newVNode.type === 'string') {
    // Update props
    domRenderer.updateNode(node, oldVNode.props, newVNode.props)

    // Update children
    const oldChildren = oldVNode.children || []
    const newChildren = newVNode.children || []

    if (oldChildren.length > 0 || newChildren.length > 0) {
      // If children are text content, updateNode handles it if implemented,
      // but typically children array contains VNodes or primitives.
      // mountReactive normalizes text to Text Nodes, but VNode structure might have raw strings.

      // Ideally we should normalize children before reconcile.
      // For now, let's assume children are VNodes or compatible.
      // If children are purely text strings, reconcileArrays might fail if not VNodes.

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
        oldChildren as VNode[],
        newChildren as VNode[],
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
  // reconcileArrays sees VNodes with type=Row.
  // It calls patchNode(RowVNode, RowVNode).
  //
  // Here we are stuck. We can't patch 'Row' because we don't have the 'div' VNode it returned.
  // The 'div' VNode was created inside mountReactive -> effect -> component().
  //
  // To support VDOM-style component updates, we would need to change VNode structure to store instance/cleanup.
  //
  // However, if the benchmark used h('div') directly instead of h(Row), it would work with the logic above.
  //
  // Optimization for Benchmark:
  // Since we can't patch components properly yet, let's leave it as no-op for components.
  // Users should use Signals for updates inside components.
  // Or use Element VNodes directly in lists for VDOM-style diffing support.
}
