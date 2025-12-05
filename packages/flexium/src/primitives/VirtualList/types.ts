import type { Signal } from '../../core/signal';
import type { VNode } from '../../core/renderer';

/**
 * Getter function that returns the current value (signal-like)
 */
export type ItemsGetter<T> = () => T[];

/**
 * Fixed-height item configuration
 */
export interface FixedSizeConfig {
  mode: 'fixed';
  itemHeight: number;
}

/**
 * Variable-height item configuration
 */
export interface VariableSizeConfig {
  mode: 'variable';
  estimatedItemHeight: number;
  getItemHeight?: (index: number, item: unknown) => number;
}

export type SizeConfig = FixedSizeConfig | VariableSizeConfig;

/**
 * VirtualList component props
 */
export interface VirtualListProps<T> {
  /** Data source - reactive array or getter function */
  items: ItemsGetter<T>;

  /** Render function for each item */
  children: (item: T, index: () => number) => VNode;

  /** Container height (required for viewport calculation) */
  height: number | string;

  /** Width (optional, defaults to 100%) */
  width?: number | string;

  /** Item height (number for fixed, config for variable) */
  itemSize: number | SizeConfig;

  /** Number of extra items to render above/below viewport (default: 3) */
  overscan?: number;

  /** Key extractor for stable identity */
  getKey?: (item: T, index: number) => string | number;

  /** Scroll event callback */
  onScroll?: (scrollTop: number) => void;

  /** Visible range change callback */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void;
}

/**
 * Internal cache entry for rendered items
 */
export interface VirtualListCacheEntry<T> {
  item: T;
  key: string | number;
  node: Node;
  indexSig: Signal<number>;
  dispose: () => void;
  measuredHeight?: number;
}

/**
 * VirtualList component marker
 */
export interface VirtualListComponent<T> {
  [key: symbol]: true;
  items: ItemsGetter<T>;
  renderItem: (item: T, index: () => number) => VNode;
  height: number | string;
  width?: number | string;
  itemSize: number | SizeConfig;
  overscan: number;
  getKey?: (item: T, index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void;
}
