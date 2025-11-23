/**
 * Flexium JSX Runtime
 *
 * This module provides the automatic JSX runtime for Flexium.
 * It implements the new JSX transform introduced in React 17+.
 *
 * With automatic JSX runtime, you no longer need to import `h`:
 *
 * Before (classic):
 * ```tsx
 * import { h } from 'flexium/dom'
 * function App() {
 *   return <div>Hello</div>
 * }
 * ```
 *
 * After (automatic):
 * ```tsx
 * function App() {
 *   return <div>Hello</div>
 * }
 * ```
 *
 * Usage in tsconfig.json:
 * ```json
 * {
 *   "compilerOptions": {
 *     "jsx": "react-jsx",
 *     "jsxImportSource": "flexium"
 *   }
 * }
 * ```
 */

import type { VNode } from './core/renderer';

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
 * JSX runtime function for elements with multiple children
 *
 * @param type - Element type (string for built-in, function for components)
 * @param props - Element properties including children
 * @returns Virtual node
 */
export function jsx(
  type: string | Function,
  props: Record<string, any>
): VNode {
  // Extract children from props
  const { children, key, ...restProps } = props || {};

  // Normalize children
  let normalizedChildren: any[] = [];
  if (children !== undefined) {
    if (Array.isArray(children)) {
      normalizedChildren = flattenChildren(children);
    } else {
      normalizedChildren = [children];
    }
  }

  // Filter out null, undefined, and false
  normalizedChildren = normalizedChildren.filter(
    (child) => child !== null && child !== undefined && child !== false
  );

  return {
    type,
    props: restProps,
    children: normalizedChildren,
    key,
  };
}

/**
 * JSX runtime function for elements with static children
 * (optimization hint from the compiler)
 *
 * @param type - Element type
 * @param props - Element properties
 * @returns Virtual node
 */
export function jsxs(
  type: string | Function,
  props: Record<string, any>
): VNode {
  // For Flexium, we treat jsxs the same as jsx
  // (could add optimizations later)
  return jsx(type, props);
}

/**
 * Fragment component for JSX
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
 * JSX runtime for development (same as production for now)
 */
export { jsx as jsxDEV };

export namespace JSX {
  export interface IntrinsicElements {
    [elemName: string]: any;
  }
  export type Element = any;
  export interface ElementClass {
    render: any;
  }
  export interface ElementAttributesProperty {
    props: any;
  }
  export interface ElementChildrenAttribute {
    children: {};
  }
}
