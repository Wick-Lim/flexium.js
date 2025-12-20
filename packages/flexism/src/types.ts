/**
 * Virtual DOM element node structure
 */
export interface FNode {
  type: string | ((...args: unknown[]) => FNodeChild)
  props: Record<string, unknown>
  children: FNodeChild[]
}

/**
 * Flexium node child type (any renderable content)
 * Note: Using union type for better type inference while maintaining flexibility
 */
export type FNodeChild = FNode | string | number | boolean | null | undefined | FNodeChild[]

/**
 * Serialized state for SSR -> client transfer
 */
export interface FlexismState {
  /** Signal states keyed by ID */
  signals: Record<string, unknown>
  /** Hydration version for mismatch detection */
  version: string
}

/**
 * SSR render options
 */
export interface RenderOptions {
  /** Include hydration markers (data-fid) */
  hydrate?: boolean
  /** Custom state serializer */
  serializer?: (value: unknown) => unknown
}

/**
 * SSR render result
 */
export interface RenderResult {
  /** Generated HTML string */
  html: string
  /** Serialized state for client hydration */
  state: FlexismState
  /** State as JSON string for embedding */
  stateScript: string
}

/**
 * Hydration options
 */
export interface HydrateOptions {
  /** Custom state deserializer */
  deserializer?: (value: unknown) => unknown
  /** Called when hydration completes */
  onHydrated?: () => void
  /** Called on hydration error */
  onError?: (error: Error) => void
}

/**
 * App configuration for flexism
 */
export interface FlexismApp {
  /** Root component */
  component: () => FNodeChild
  /** Root DOM element or selector */
  target: HTMLElement | string
}

/**
 * Global state key for window object
 */
export const FLEXISM_STATE_KEY = '__FLEXISM_STATE__' as const

declare global {
  interface Window {
    [FLEXISM_STATE_KEY]?: FlexismState
  }
}
