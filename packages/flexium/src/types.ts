/**
 * Core Flexium types
 */

/**
 * Virtual Node - internal representation of UI elements
 */
export interface VNode {
  type: string
  props: Record<string, any>
  children: VNode[]
}
