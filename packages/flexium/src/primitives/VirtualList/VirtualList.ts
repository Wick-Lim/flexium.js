import { signal, effect, onCleanup } from '../../core/signal';
import type { VNode } from '../../core/renderer';
import type {
  VirtualListProps,
  VirtualListComponent,
  VirtualListCacheEntry,
  SizeConfig,
} from './types';

/** Marker symbol for VirtualList components */
export const VIRTUALLIST_MARKER = Symbol('flexium.virtuallist');

/**
 * Check if a value is a VirtualListComponent
 */
export function isVirtualListComponent<T>(
  value: unknown
): value is VirtualListComponent<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    VIRTUALLIST_MARKER in value &&
    (value as Record<symbol, unknown>)[VIRTUALLIST_MARKER] === true
  );
}

/**
 * VirtualList - Efficiently render large lists
 *
 * Only renders items visible in the viewport, plus overscan items
 * for smooth scrolling.
 *
 * @example
 * ```tsx
 * const items = signal(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })));
 *
 * <VirtualList
 *   items={items}
 *   height={400}
 *   itemSize={50}
 * >
 *   {(item, index) => <div>{index()}: {item.name}</div>}
 * </VirtualList>
 * ```
 */
export function VirtualList<T>(
  props: VirtualListProps<T>
): VirtualListComponent<T> {
  const {
    items,
    children,
    height,
    width,
    itemSize,
    overscan = 3,
    getKey,
    onScroll,
    onVisibleRangeChange,
  } = props;

  const component: VirtualListComponent<T> = {
    [VIRTUALLIST_MARKER]: true,
    items,
    renderItem: children,
    height,
    width,
    itemSize,
    overscan,
    getKey,
    onScroll,
    onVisibleRangeChange,
  };

  return component;
}

/**
 * Get item height based on configuration
 */
function getItemHeight(config: number | SizeConfig, index: number): number {
  if (typeof config === 'number') {
    return config;
  }
  if (config.mode === 'fixed') {
    return config.itemHeight;
  }
  // Variable mode - use estimated height
  return config.estimatedItemHeight;
}

/**
 * Calculate visible range for fixed-height items
 */
function calculateVisibleRangeFixed(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number
): { startIndex: number; endIndex: number; totalHeight: number } {
  const totalHeight = totalItems * itemHeight;

  if (totalItems === 0) {
    return { startIndex: 0, endIndex: -1, totalHeight: 0 };
  }

  const start = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(viewportHeight / itemHeight);
  const end = start + visibleCount;

  return {
    startIndex: Math.max(0, start - overscan),
    endIndex: Math.min(totalItems - 1, end + overscan),
    totalHeight,
  };
}

/**
 * Mount a VirtualList component to the DOM
 */
export function mountVirtualListComponent<T>(
  comp: VirtualListComponent<T>,
  parent: Node,
  mountFn: (vnode: VNode) => Node | null,
  cleanupFn: (node: Node) => void
): () => void {
  const {
    items,
    renderItem,
    height,
    width,
    itemSize,
    overscan,
    getKey,
    onScroll,
    onVisibleRangeChange,
  } = comp;

  // Create container structure
  const container = document.createElement('div');
  container.style.height = typeof height === 'number' ? `${height}px` : height;
  container.style.width = width
    ? typeof width === 'number'
      ? `${width}px`
      : width
    : '100%';
  container.style.overflow = 'auto';
  container.style.position = 'relative';

  // Accessibility attributes
  container.setAttribute('role', 'list');
  container.setAttribute('tabindex', '0');

  const innerContainer = document.createElement('div');
  innerContainer.style.position = 'relative';
  innerContainer.style.width = '100%';
  innerContainer.style.willChange = 'transform';

  container.appendChild(innerContainer);
  parent.appendChild(container);

  // Reactive state
  const scrollTopSig = signal(0);
  const cache = new Map<string | number, VirtualListCacheEntry<T>>();

  // Track previous visible range
  let prevStartIndex = -1;
  let prevEndIndex = -1;

  // Scroll handler
  const handleScroll = () => {
    scrollTopSig.set(container.scrollTop);
    onScroll?.(container.scrollTop);
  };

  container.addEventListener('scroll', handleScroll, { passive: true });

  // Get key for item
  const getItemKey = (item: T, index: number): string | number => {
    if (getKey) {
      return getKey(item, index);
    }
    return index;
  };

  // Main render effect
  const disposeEffect = effect(() => {
    const list = items() || [];
    const currentScrollTop = scrollTopSig();
    const viewportHeight = container.clientHeight || parseFloat(String(height));
    const itemHeight = getItemHeight(itemSize, 0);

    // Calculate visible range
    const { startIndex, endIndex, totalHeight } = calculateVisibleRangeFixed(
      currentScrollTop,
      viewportHeight,
      itemHeight,
      list.length,
      overscan
    );

    // Update spacer height
    innerContainer.style.height = `${totalHeight}px`;

    // Update ARIA attributes
    container.setAttribute('aria-rowcount', String(list.length));

    // Notify visible range change
    if (startIndex !== prevStartIndex || endIndex !== prevEndIndex) {
      onVisibleRangeChange?.(startIndex, endIndex);
      prevStartIndex = startIndex;
      prevEndIndex = endIndex;
    }

    // Track which keys are currently visible
    const visibleKeys = new Set<string | number>();

    // Render visible items
    for (let i = startIndex; i <= endIndex && i < list.length; i++) {
      const item = list[i];
      const key = getItemKey(item, i);
      visibleKeys.add(key);

      let entry = cache.get(key);

      if (!entry) {
        // Create new item
        const indexSig = signal(i);
        const vnode = renderItem(item, () => indexSig());
        const node = mountFn(vnode);

        if (node && node instanceof HTMLElement) {
          // Position the item
          node.style.position = 'absolute';
          node.style.top = '0';
          node.style.left = '0';
          node.style.right = '0';
          node.style.transform = `translateY(${i * itemHeight}px)`;
          node.style.height = `${itemHeight}px`;
          node.style.boxSizing = 'border-box';
          node.setAttribute('role', 'listitem');
          node.setAttribute('aria-rowindex', String(i + 1));

          innerContainer.appendChild(node);

          entry = {
            item,
            key,
            node,
            indexSig,
            dispose: () => {
              try {
                cleanupFn(node);
              } catch {
                // Ignore cleanup errors
              }
            },
          };
          cache.set(key, entry);
        }
      } else {
        // Update existing item position
        if (entry.indexSig.peek() !== i) {
          entry.indexSig.set(i);
        }
        const node = entry.node as HTMLElement;
        node.style.transform = `translateY(${i * itemHeight}px)`;
        node.setAttribute('aria-rowindex', String(i + 1));
      }
    }

    // Remove items no longer visible
    for (const [key, entry] of cache) {
      if (!visibleKeys.has(key)) {
        entry.dispose();
        if (entry.node.parentNode === innerContainer) {
          innerContainer.removeChild(entry.node);
        }
        cache.delete(key);
      }
    }
  });

  // Cleanup function
  return () => {
    disposeEffect();
    container.removeEventListener('scroll', handleScroll);

    for (const entry of cache.values()) {
      entry.dispose();
    }
    cache.clear();

    if (container.parentNode === parent) {
      parent.removeChild(container);
    }
  };
}

export default VirtualList;
