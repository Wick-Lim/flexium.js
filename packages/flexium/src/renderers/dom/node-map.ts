/**
 * FNode to DOM Node mapping using WeakMap
 *
 * This replaces the _node property on FNode with a clean separation.
 * WeakMap ensures nodes are garbage collected when FNodes are no longer referenced.
 */

import type { FNode } from '../../core/renderer'

const fnodeToNode = new WeakMap<FNode, Node>()

/**
 * Get the DOM node associated with an FNode
 */
export function getNode(fnode: FNode): Node | undefined {
  return fnodeToNode.get(fnode)
}

/**
 * Set the DOM node associated with an FNode
 */
export function setNode(fnode: FNode, node: Node): void {
  fnodeToNode.set(fnode, node)
}

/**
 * Check if an FNode has an associated DOM node
 */
export function hasNode(fnode: FNode): boolean {
  return fnodeToNode.has(fnode)
}

/**
 * Remove the DOM node association from an FNode
 */
export function deleteNode(fnode: FNode): boolean {
  return fnodeToNode.delete(fnode)
}
