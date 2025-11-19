/**
 * JSX Factory Function (h)
 *
 * This module provides the JSX factory function for creating virtual nodes.
 * It's used by the JSX transpiler to convert JSX syntax into function calls.
 *
 * Usage in tsconfig.json:
 * {
 *   "compilerOptions": {
 *     "jsx": "react",
 *     "jsxFactory": "h",
 *     "jsxFragmentFactory": "Fragment"
 *   }
 * }
 */

import type { VNode } from '../../core/renderer';

/**
 * JSX factory function
 * Creates a virtual node from JSX syntax
 *
 * @param type - Element type (string for built-in, function for components)
 * @param props - Element properties
 * @param children - Child elements
 * @returns Virtual node
 */
export function h(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): VNode {
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

  return {
    type,
    props: normalizedProps,
    children: normalizedChildren,
    key,
  };
}

/**
 * Fragment component
 * Renders children without a wrapper element
 */
export function Fragment(props: { children?: any[] }): VNode {
  return {
    type: 'fragment',
    props: {},
    children: props.children || [],
  };
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
 * Check if a value is a VNode
 */
export function isVNode(value: any): value is VNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    'props' in value &&
    'children' in value
  );
}

/**
 * Create a text node
 */
export function createTextVNode(text: string | number): string {
  return String(text);
}
