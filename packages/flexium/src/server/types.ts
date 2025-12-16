import type { FNodeChild } from '../dom/types'

export interface SSROptions {
  /**
   * Whether to include hydration markers (data-fid attributes)
   * @default true
   */
  hydrate?: boolean
}

export interface SSRResult {
  /** Generated HTML string */
  html: string
  /** State snapshot for hydration transfer */
  state: SerializedState
}

export interface SerializedState {
  /** Map of serialized key -> value for keyed states */
  states: Record<string, unknown>
}

export interface RenderToStringOptions extends SSROptions {
  /** The app to render */
  app: FNodeChild | (() => FNodeChild)
}
