/**
 * Flexium JSX Runtime
 *
 * This module provides the automatic JSX runtime for Flexium.
 * It implements the new JSX transform introduced in React 17+.
 *
 * With automatic JSX runtime, you no longer need to import `f`:
 *
 * Before (classic):
 * ```tsx
 * import { f } from 'flexium/dom'
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

import type { FNode } from './core/renderer'
import { createFNode } from './core/vnode'

/**
 * Flatten nested children arrays
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenChildren(children: any[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = []

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (Array.isArray(child)) {
      const flattened = flattenChildren(child)
      for (let j = 0; j < flattened.length; j++) {
        result.push(flattened[j])
      }
    } else {
      result.push(child)
    }
  }

  return result
}

/**
 * Filter out null, undefined, and false children
 * Optimized for performance using a simple loop
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterChildren(children: any[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = []
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child !== null && child !== undefined && child !== false) {
      result.push(child)
    }
  }
  return result
}

/**
 * JSX runtime function for elements with multiple children
 *
 * @param type - Element type (string for built-in, function for components)
 * @param props - Element properties including children
 * @returns Flexium node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsx(
  type: string | Function,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
): FNode {
  // Extract children from props
  // Manual extraction is faster than destructuring
  const key = props.key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restProps: Record<string, any> = {}

  for (const k in props) {
    if (k !== 'key' && k !== 'children') {
      restProps[k] = props[k]
    }
  }

  const children = props.children
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let normalizedChildren: any[] = []

  if (children !== undefined) {
    if (Array.isArray(children)) {
      // Recursively flatten and then filter
      normalizedChildren = filterChildren(flattenChildren(children))
    } else if (children !== null && children !== false) {
      // Single child optimization
      normalizedChildren = [children]
    }
  }

  return createFNode(type, restProps, normalizedChildren, key)
}

/**
 * JSX runtime function for elements with static children
 * (optimization hint from the compiler)
 *
 * @param type - Element type
 * @param props - Element properties
 * @returns Flexium node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsxs(
  type: string | Function,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
): FNode {
  // For jsxs, we know children is an array passed as a prop
  // We can skip flattening, but we still need to filter

  const key = props.key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restProps: Record<string, any> = {}

  for (const k in props) {
    if (k !== 'key' && k !== 'children') {
      restProps[k] = props[k]
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let normalizedChildren: any[] = []
  const children = props.children

  if (Array.isArray(children)) {
    // Skip recursive flattening for jsxs, just filter
    normalizedChildren = filterChildren(children)
  } else if (
    children !== undefined &&
    children !== null &&
    children !== false
  ) {
    normalizedChildren = [children]
  }

  return createFNode(type, restProps, normalizedChildren, key)
}

/**
 * Fragment component for JSX
 * Renders children without a wrapper element
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Fragment(props: { children?: any[] }): FNode {
  return createFNode('fragment', {}, props.children || [])
}

/**
 * JSX runtime for development (same as production for now)
 */
export { jsx as jsxDEV }

export namespace JSX {
  export interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Element = any
  export interface ElementClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any
  }
  export interface ElementAttributesProperty {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any
  }
  export interface ElementChildrenAttribute {
    children: {}
  }
}
