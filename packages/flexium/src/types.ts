/**
 * Core Flexium types
 */

/**
 * Virtual Node - internal representation of UI elements
 */
export interface VNode {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
  children: VNode[]
}
