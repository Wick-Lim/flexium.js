/**
 * JSX Factory Function (f)
 *
 * This module provides the JSX factory function for creating Flexium nodes.
 * It's used by the JSX transpiler to convert JSX syntax into function calls.
 *
 * Usage in tsconfig.json:
 * {
 *   "compilerOptions": {
 *     "jsx": "react",
 *     "jsxFactory": "f",
 *     "jsxFragmentFactory": "Fragment"
 *   }
 * }
 */

import type { FNode } from '../../core/renderer';
import { createFNode } from '../../core/vnode';

/**
 * JSX factory function for Flexium
 * Creates a Flexium node from JSX syntax
 *
 * @param type - Element type (string for built-in, function for components)
 * @param props - Element properties
 * @param children - Child elements
 * @returns Flexium node
 */
export function f(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): FNode {
  // Normalize props
  const normalizedProps = props || {};

  // Extract key if present
  const key = normalizedProps.key;
  if (key !== undefined) {
    delete normalizedProps.key;
  }

  // Flatten and filter children
  const normalizedChildren = flattenChildren(children).filter(
    (child) => child !== null && child !== undefined && child !== false
  );

  return createFNode(type, normalizedProps, normalizedChildren, key);
}

/** @deprecated Use f() instead */
export const h = f;

/**
 * Fragment component
 * Renders children without a wrapper element
 */
export function Fragment(props: { children?: any[] }): FNode {
  return createFNode('fragment', {}, props.children || []);
}

/**
 * Flatten nested children arrays
 */
function flattenChildren(children: any[]): any[] {
  const result: any[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }

  return result;
}

/**
 * Check if a value is an FNode
 */
export function isFNode(value: any): value is FNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    'props' in value &&
    'children' in value
  );
}

/** @deprecated Use isFNode instead */
export const isVNode = isFNode;

/**
 * Create a text node
 */
export function createTextVNode(text: string | number): string {
  return String(text);
}
