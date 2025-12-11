import type { SignalNode } from '../../core/signal'
import type { FNode } from '../../core/renderer'

/**
 * Getter function that returns the current value (signal-like)
 */
export type ItemsGetter<T> = () => T[]

/**
 * Fixed-height item configuration
 */
export interface FixedSizeConfig {
  mode: 'fixed'
  itemHeight: number
}

/**
 * Variable-height item configuration
 */
export interface VariableSizeConfig {
  mode: 'variable'
  estimatedItemHeight: number
  getItemHeight?: (index: number, item: unknown) => number
}

export type SizeConfig = FixedSizeConfig | VariableSizeConfig

/**
 * List component props
 */
export interface ListProps<T> {
  /** Data source - reactive array or getter function (same as For's each prop) */
  each: ItemsGetter<T>

  /** Render function for each item */
  children: (item: T, index: () => number) => FNode

  /** Enable virtualization for large lists (default: false) */
  virtual?: boolean

  /** Container height (required when virtual is true) */
  height?: number | string

  /** Width (optional, defaults to 100%) */
  width?: number | string

  /** Item height - required when virtual is true */
  itemSize?: number | SizeConfig

  /** Number of extra items to render above/below viewport (default: 3, only for virtual mode) */
  overscan?: number

  /** Key extractor for stable identity */
  getKey?: (item: T, index: number) => string | number

  /** Scroll event callback (only for virtual mode) */
  onScroll?: (scrollTop: number) => void

  /** Visible range change callback (only for virtual mode) */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void

  /** CSS class name */
  class?: string

  /** Inline styles */
  style?: Record<string, string | number>
}

/**
 * Internal cache entry for rendered items
 */
export interface ListCacheEntry<T> {
  item: T
  key: string | number
  node: Node
  indexSig: SignalNode<number>
  dispose: () => void
  measuredHeight?: number
  state?: SignalNode<T>
}

/**
 * List component marker
 */
export interface ListComponent<T> {
  [key: symbol]: true
  each: ItemsGetter<T>
  renderItem: (item: T, index: () => number) => FNode
  virtual: boolean
  height?: number | string
  width?: number | string
  itemSize?: number | SizeConfig
  overscan: number
  getKey?: (item: T, index: number) => string | number
  onScroll?: (scrollTop: number) => void
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void
  class?: string
  style?: Record<string, string | number>
}

