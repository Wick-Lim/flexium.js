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
import { createVNode } from './core/vnode';

/**
 * Flatten nested children arrays
 */
function flattenChildren(children: any[]): any[] {
  const result: any[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (Array.isArray(child)) {
      const flattened = flattenChildren(child);
      for (let j = 0; j < flattened.length; j++) {
        result.push(flattened[j]);
      }
    } else {
      result.push(child);
    }
  }

  return result;
}

/**
 * Filter out null, undefined, and false children
 * Optimized for performance using a simple loop
 */
function filterChildren(children: any[]): any[] {
  const result: any[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child !== null && child !== undefined && child !== false) {
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
  // Manual extraction is faster than destructuring
  const key = props.key;
  const restProps: Record<string, any> = {};
  
  for (const k in props) {
    if (k !== 'key' && k !== 'children') {
      restProps[k] = props[k];
    }
  }

  let children = props.children;
  let normalizedChildren: any[] = [];

  if (children !== undefined) {
    if (Array.isArray(children)) {
      // Recursively flatten and then filter
      normalizedChildren = filterChildren(flattenChildren(children));
    } else if (children !== null && children !== false) {
      // Single child optimization
      normalizedChildren = [children];
    }
  }

  return createVNode(type, restProps, normalizedChildren, key);
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
  // For jsxs, we know children is an array passed as a prop
  // We can skip flattening, but we still need to filter
  
  const key = props.key;
  const restProps: Record<string, any> = {};
  
  for (const k in props) {
    if (k !== 'key' && k !== 'children') {
      restProps[k] = props[k];
    }
  }

  let normalizedChildren: any[] = [];
  const children = props.children;

  if (Array.isArray(children)) {
    // Skip recursive flattening for jsxs, just filter
    normalizedChildren = filterChildren(children);
  } else if (children !== undefined && children !== null && children !== false) {
    normalizedChildren = [children];
  }

  return createVNode(type, restProps, normalizedChildren, key);
}

/**
 * Fragment component for JSX
 * Renders children without a wrapper element
 */
export function Fragment(props: { children?: any[] }): VNode {
  return createVNode('fragment', {}, props.children || []);
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
