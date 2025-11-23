import { VNode } from '../../core/renderer';
import { domRenderer } from './index';
import { mountReactive, cleanupReactive } from './reactive';

/**
 * Reconcile two arrays of VNodes using keyed diffing.
 * This implementation is inspired by standard reconciliation algorithms (like in React/Preact/Vue).
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
  let oldStartIdx = 0;
  let oldEndIdx = oldVNodes.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newVNodes.length - 1;

  let oldStartVNode = oldVNodes[0];
  let oldEndVNode = oldVNodes[oldEndIdx];
  let newStartVNode = newVNodes[0];
  let newEndVNode = newVNodes[newEndIdx];

  let oldKeyToIdx: Map<string | number, number> | undefined;

  // While both lists have unvisited nodes
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // Skip nulls in old list (from previous moves)
    if (oldStartVNode == null) {
      oldStartVNode = oldVNodes[++oldStartIdx];
    } else if (oldEndVNode == null) {
      oldEndVNode = oldVNodes[--oldEndIdx];
    } 
    
    // 1. Same Start: Key matches at the beginning
    else if (isSameKey(oldStartVNode, newStartVNode)) {
      // Patch/Update node if needed (omitted for now, assuming signals handle deep updates)
      // In a full VDOM, we would call patch(oldStartVNode, newStartVNode) here.
      // For now, we just keep the DOM node reference.
      newStartVNode._node = oldStartVNode._node;
      
      oldStartVNode = oldVNodes[++oldStartIdx];
      newStartVNode = newVNodes[++newStartIdx];
    }

    // 2. Same End: Key matches at the end
    else if (isSameKey(oldEndVNode, newEndVNode)) {
      newEndVNode._node = oldEndVNode._node;
      
      oldEndVNode = oldVNodes[--oldEndIdx];
      newEndVNode = newVNodes[--newEndIdx];
    }

    // 3. Reversed: Old Start matches New End (Move Right)
    else if (isSameKey(oldStartVNode, newEndVNode)) {
      newEndVNode._node = oldStartVNode._node;
      // Move the old start node to AFTER the old end node
      domRenderer.insertBefore(parent, oldStartVNode._node!, domRenderer.nextSibling(oldEndVNode._node!));
      
      oldStartVNode = oldVNodes[++oldStartIdx];
      newEndVNode = newVNodes[--newEndIdx];
    }

    // 4. Reversed: Old End matches New Start (Move Left)
    else if (isSameKey(oldEndVNode, newStartVNode)) {
      newStartVNode._node = oldEndVNode._node;
      // Move the old end node to BEFORE the old start node
      domRenderer.insertBefore(parent, oldEndVNode._node!, oldStartVNode._node!);
      
      oldEndVNode = oldVNodes[--oldEndIdx];
      newStartVNode = newVNodes[++newStartIdx];
    }

    // 5. Keyed Mode: Search in map
    else {
      if (!oldKeyToIdx) {
        oldKeyToIdx = createKeyMap(oldVNodes, oldStartIdx, oldEndIdx);
      }

      const key = newStartVNode.key;
      const idxInOld = key != null ? oldKeyToIdx.get(key) : undefined;

      if (idxInOld === undefined) {
        // New node: Create and insert
        const newNode = mountReactive(newStartVNode, undefined); // Don't append yet
        if (newNode) {
          newStartVNode._node = newNode;
          domRenderer.insertBefore(parent, newNode, oldStartVNode._node!);
        }
      } else {
        // Node exists: Move it
        const vnodeToMove = oldVNodes[idxInOld];
        // Mark as processed in old list
        oldVNodes[idxInOld] = undefined as any; 
        
        newStartVNode._node = vnodeToMove._node;
        domRenderer.insertBefore(parent, vnodeToMove._node!, oldStartVNode._node!);
      }
      
      newStartVNode = newVNodes[++newStartIdx];
    }
  }

  // Add remaining new nodes
  if (oldStartIdx > oldEndIdx) {
    const before = newVNodes[newEndIdx + 1] == null ? nextSibling : newVNodes[newEndIdx + 1]._node;
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const newNode = mountReactive(newVNodes[i], undefined);
      if (newNode) {
        newVNodes[i]._node = newNode;
        domRenderer.insertBefore(parent, newNode, before!);
      }
    }
  }

  // Remove remaining old nodes
  else if (newStartIdx > newEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      const nodeToRemove = oldVNodes[i];
      if (nodeToRemove && nodeToRemove._node) {
        cleanupReactive(nodeToRemove._node);
        domRenderer.removeChild(parent, nodeToRemove._node);
      }
    }
  }
}

function isSameKey(n1: VNode, n2: VNode): boolean {
  return n1.key === n2.key && n1.type === n2.type;
}

function createKeyMap(children: VNode[], start: number, end: number): Map<string | number, number> {
  const map = new Map<string | number, number>();
  for (let i = start; i <= end; i++) {
    const key = children[i].key;
    if (key != null) {
      map.set(key, i);
    }
  }
  return map;
}
