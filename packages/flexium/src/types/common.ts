/**
 * Common shared types for Flexium
 * These types are used across multiple modules to ensure consistency
 */

import type { FNode } from '../core/renderer'
import type { Signal, Computed } from '../core/signal'

/**
 * Valid child types that can be rendered
 */
export type Child = FNode | string | number | boolean | null | undefined

/**
 * Array of children
 */
export type Children = Child | Child[]

/**
 * Function that returns renderable content
 */
export type RenderFunction = () => Child | Children

/**
 * Component function type
 */
export type Component<P = Record<string, unknown>> = (props: P) => FNode | null

/**
 * Renderable node types for reactive rendering
 */
export type RenderableNode =
  | FNode
  | string
  | number
  | boolean
  | null
  | undefined
  | Signal<unknown>
  | Computed<unknown>
  | RenderFunction
  | RenderableNode[]

/**
 * Props that can contain signals
 */
export type ReactiveProps = Record<string, Signal<unknown> | Computed<unknown>>

/**
 * Style value type
 */
export type StyleValue = string | number | undefined

/**
 * Style properties object
 */
export type StyleProps = Record<string, StyleValue>

/**
 * Event handler type
 */
export type EventHandler<E = Event> = (event: E) => void

/**
 * Generic props with children
 */
export interface PropsWithChildren<P = unknown> {
  children?: Children
  [key: string]: P | Children | undefined
}

/**
 * Error info passed to error boundaries
 */
export interface ErrorInfo {
  componentStack?: string
  timestamp: number
}
