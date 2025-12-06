/**
 * Core Flexium types
 */

/**
 * Flexium Node - internal representation of UI elements
 */
export interface FNode {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
  children: FNode[]
}
