import type { VNode, VNodeChild } from './renderer';

/**
 * Creates a VNode ensuring consistent object shape (Monomorphism).
 * This is crucial for JS engine optimization (Hidden Classes).
 *
 * @param type - Element type
 * @param props - Element properties
 * @param children - Element children
 * @param key - Optional key for reconciliation
 */
export function createVNode(
  type: string | Function,
  props: Record<string, unknown>,
  children: VNodeChild[],
  key?: string | number | null
): VNode {
  // Always create the object with the exact same properties in the exact same order.
  // `key` is included even if undefined/null to maintain shape.
  return {
    type,
    props,
    children,
    key: key ?? undefined
  };
}
