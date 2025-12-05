/**
 * Core Renderer Interface
 *
 * This interface defines the contract that all platform-specific renderers must implement.
 * It provides a unified API for creating, updating, and managing nodes across different
 * rendering targets (DOM, Canvas, React Native, WebGL, etc.).
 */

/**
 * Base node type - platform-specific implementations will extend this
 * Using any intentionally for cross-platform flexibility (DOM Node, Canvas, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RenderNode = any

/**
 * Event handler function type
 */
export type EventHandler = (event: Event) => void

/**
 * Core renderer interface that all platform renderers must implement
 */
export interface Renderer {
  /**
   * Create a new platform-specific node
   * @param type - The type of node to create (e.g., 'div', 'Row', 'Text')
   * @param props - Properties to apply to the node
   * @returns The created node
   */
  createNode(type: string, props: Record<string, unknown>): RenderNode

  /**
   * Update the properties of an existing node
   * @param node - The node to update
   * @param oldProps - Previous properties (for diffing)
   * @param newProps - New properties to apply
   */
  updateNode(
    node: RenderNode,
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): void

  /**
   * Append a child node to a parent node
   * @param parent - The parent node
   * @param child - The child node to append
   */
  appendChild(parent: RenderNode, child: RenderNode): void

  /**
   * Insert a child node before a reference node
   * @param parent - The parent node
   * @param child - The child node to insert
   * @param beforeChild - The reference node to insert before
   */
  insertBefore(
    parent: RenderNode,
    child: RenderNode,
    beforeChild: RenderNode | null
  ): void

  /**
   * Remove a child node from a parent node
   * @param parent - The parent node
   * @param child - The child node to remove
   */
  removeChild(parent: RenderNode, child: RenderNode): void

  /**
   * Create a text node
   * @param text - The text content
   * @returns The created text node
   */
  createTextNode(text: string): RenderNode

  /**
   * Update the text content of a text node
   * @param node - The text node to update
   * @param text - The new text content
   */
  updateTextNode(node: RenderNode, text: string): void

  /**
   * Add an event listener to a node
   * @param node - The node to attach the listener to
   * @param event - The event name (e.g., 'click', 'press')
   * @param handler - The event handler function
   */
  addEventListener(node: RenderNode, event: string, handler: EventHandler): void

  /**
   * Remove an event listener from a node
   * @param node - The node to remove the listener from
   * @param event - The event name
   * @param handler - The event handler function
   */
  removeEventListener(
    node: RenderNode,
    event: string,
    handler: EventHandler
  ): void
}

/**
 * Platform-agnostic props that should be supported across all renderers
 */
export interface CommonProps {
  // Layout
  width?: number | string
  height?: number | string
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  margin?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number

  // Flexbox
  flexDirection?: 'row' | 'column'
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  gap?: number
  flex?: number
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'

  // Visual
  bg?: string // background color
  color?: string // text color
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  opacity?: number

  // Typography (for text nodes)
  fontSize?: number
  fontWeight?: number | string
  fontFamily?: string
  lineHeight?: number
  textAlign?: 'left' | 'center' | 'right'

  // Events (platform-agnostic event names)
  onPress?: EventHandler // Maps to click/touch
  onHover?: EventHandler
  onChange?: EventHandler
  onFocus?: EventHandler
  onBlur?: EventHandler
}

/**
 * Child types that can be rendered
 */
export type FNodeChild =
  | FNode
  | string
  | number
  | boolean
  | null
  | undefined
  | FNodeChild[]

/**
 * Flexium Node - lightweight element descriptor for JSX
 * (Not a Virtual DOM - just a simple descriptor that gets immediately converted to real DOM)
 */
export interface FNode {
  type: string | Function
  props: Record<string, unknown>
  children: FNodeChild[]
  key?: string | number
  _node?: RenderNode // Internal reference to the rendered node
}

// Legacy aliases for backward compatibility (deprecated)
/** @deprecated Use FNode instead */
export type VNode = FNode
/** @deprecated Use FNodeChild instead */
export type VNodeChild = FNodeChild
