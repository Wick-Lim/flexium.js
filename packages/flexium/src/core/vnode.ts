import type { FNode, FNodeChild } from './renderer'

/**
 * Creates an FNode ensuring consistent object shape (Monomorphism).
 * This is crucial for JS engine optimization (Hidden Classes).
 */
export function createFNode(
  type: string | Function,
  props: Record<string, unknown>,
  children: FNodeChild[],
  key?: string | number | null
): FNode {
  return {
    type,
    props,
    children,
    key: key ?? undefined,
  }
}
