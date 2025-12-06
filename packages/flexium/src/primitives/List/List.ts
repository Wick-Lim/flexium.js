import { signal, effect } from '../../core/signal'
import type { FNode } from '../../core/renderer'
import type {
  ListProps,
  ListComponent,
  ListCacheEntry,
  SizeConfig,
} from './types'

/** Marker symbol for List components */
export const LIST_MARKER = Symbol('flexium.list')

/**
 * Check if a value is a ListComponent
 */
export function isListComponent<T>(
  value: unknown
): value is ListComponent<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    LIST_MARKER in value &&
    (value as Record<symbol, unknown>)[LIST_MARKER] === true
  )
}


/**
 * List - Render lists with optional virtualization
 *
 * By default, renders all items. Set `virtual` to true for large lists
 * to only render visible items.
 *
 * @example
 * ```tsx
 * // Simple list (renders all items)
 * <List each={items}>
 *   {(item, index) => <div>{item.name}</div>}
 * </List>
 *
 * // Virtual list (for large datasets)
 * <List
 *   each={items}
 *   virtual
 *   height={400}
 *   itemSize={50}
 * >
 *   {(item, index) => <div>{index()}: {item.name}</div>}
 * </List>
 * ```
 */
export function List<T>(props: ListProps<T>): ListComponent<T> {
  const {
    each,
    children,
    virtual = false,
    height,
    width,
    itemSize,
    overscan = 3,
    getKey,
    onScroll,
    onVisibleRangeChange,
    class: className,
    style,
  } = props

  const component: ListComponent<T> = {
    [LIST_MARKER]: true,
    each,
    renderItem: children,
    virtual,
    height,
    width,
    itemSize,
    overscan,
    getKey,
    onScroll,
    onVisibleRangeChange,
    class: className,
    style,
  }

  return component
}

/**
 * Get item height based on configuration
 */
function getItemHeight(config: number | SizeConfig, _index: number): number {
  if (typeof config === 'number') {
    return config
  }
  if (config.mode === 'fixed') {
    return config.itemHeight
  }
  // Variable mode - use estimated height
  return config.estimatedItemHeight
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
  const totalHeight = totalItems * itemHeight

  if (totalItems === 0) {
    return { startIndex: 0, endIndex: -1, totalHeight: 0 }
  }

  const start = Math.floor(scrollTop / itemHeight)
  const visibleCount = Math.ceil(viewportHeight / itemHeight)
  const end = start + visibleCount

  return {
    startIndex: Math.max(0, start - overscan),
    endIndex: Math.min(totalItems - 1, end + overscan),
    totalHeight,
  }
}

/**
 * Mount a List component to the DOM
 */
export function mountListComponent<T>(
  comp: ListComponent<T>,
  parent: Node,
  mountFn: (vnode: FNode) => Node | null,
  cleanupFn: (node: Node) => void
): () => void {
  if (comp.virtual) {
    return mountVirtualList(comp, parent, mountFn, cleanupFn)
  } else {
    return mountSimpleList(comp, parent, mountFn, cleanupFn)
  }
}

/**
 * Mount a simple (non-virtual) list
 */
function mountSimpleList<T>(
  comp: ListComponent<T>,
  parent: Node,
  mountFn: (vnode: FNode) => Node | null,
  cleanupFn: (node: Node) => void
): () => void {
  const { each, renderItem, getKey, class: className, style } = comp

  // Create container
  const container = document.createElement('div')
  container.setAttribute('role', 'list')
  if (className) container.className = className
  if (style) {
    Object.entries(style).forEach(([key, value]) => {
      ;(container.style as unknown as Record<string, string>)[key] =
        typeof value === 'number' ? `${value}px` : value
    })
  }

  parent.appendChild(container)

  // Cache for rendered items
  const cache = new Map<string | number, { node: Node; dispose: () => void }>()

  // Get key for item
  const getItemKey = (item: T, index: number): string | number => {
    if (getKey) {
      return getKey(item, index)
    }
    return index
  }

  // Render effect
  const disposeEffect = effect(() => {
    const list = each() || []
    const currentKeys = new Set<string | number>()

    // Render items
    list.forEach((item, index) => {
      const key = getItemKey(item, index)
      currentKeys.add(key)

      if (!cache.has(key)) {
        const indexSig = signal(index)
        const vnode = renderItem(item, () => indexSig())
        const node = mountFn(vnode)

        if (node && node instanceof HTMLElement) {
          node.setAttribute('role', 'listitem')
          container.appendChild(node)

          cache.set(key, {
            node,
            dispose: () => {
              try {
                cleanupFn(node)
              } catch {
                // Ignore cleanup errors
              }
            },
          })
        }
      }
    })

    // Remove items no longer in list
    for (const [key, entry] of cache) {
      if (!currentKeys.has(key)) {
        entry.dispose()
        if (entry.node.parentNode === container) {
          container.removeChild(entry.node)
        }
        cache.delete(key)
      }
    }
  })

  // Cleanup
  return () => {
    disposeEffect()
    for (const entry of cache.values()) {
      entry.dispose()
    }
    cache.clear()
    if (container.parentNode === parent) {
      parent.removeChild(container)
    }
  }
}

/**
 * Mount a virtual (windowed) list
 */
function mountVirtualList<T>(
  comp: ListComponent<T>,
  parent: Node,
  mountFn: (vnode: FNode) => Node | null,
  cleanupFn: (node: Node) => void
): () => void {
  const {
    each,
    renderItem,
    height,
    width,
    itemSize,
    overscan,
    getKey,
    onScroll,
    onVisibleRangeChange,
  } = comp

  if (!height || !itemSize) {
    console.warn('List: height and itemSize are required when virtual is true')
    return () => {}
  }

  // Create container structure
  const container = document.createElement('div')
  container.style.height = typeof height === 'number' ? `${height}px` : height
  container.style.width = width
    ? typeof width === 'number'
      ? `${width}px`
      : width
    : '100%'
  container.style.overflow = 'auto'
  container.style.position = 'relative'

  // Accessibility attributes
  container.setAttribute('role', 'list')
  container.setAttribute('tabindex', '0')

  const innerContainer = document.createElement('div')
  innerContainer.style.position = 'relative'
  innerContainer.style.width = '100%'
  innerContainer.style.willChange = 'transform'

  container.appendChild(innerContainer)
  parent.appendChild(container)

  // Reactive state
  const scrollTopSig = signal(0)
  const cache = new Map<string | number, ListCacheEntry<T>>()

  // Track previous visible range
  let prevStartIndex = -1
  let prevEndIndex = -1

  // Scroll handler
  const handleScroll = () => {
    scrollTopSig.set(container.scrollTop)
    onScroll?.(container.scrollTop)
  }

  container.addEventListener('scroll', handleScroll, { passive: true })

  // Get key for item
  const getItemKey = (item: T, index: number): string | number => {
    if (getKey) {
      return getKey(item, index)
    }
    return index
  }

  // Main render effect
  const disposeEffect = effect(() => {
    const list = each() || []
    const currentScrollTop = scrollTopSig()
    const viewportHeight = container.clientHeight || parseFloat(String(height))
    const itemHeight = getItemHeight(itemSize, 0)

    // Calculate visible range
    const { startIndex, endIndex, totalHeight } = calculateVisibleRangeFixed(
      currentScrollTop,
      viewportHeight,
      itemHeight,
      list.length,
      overscan
    )

    // Update spacer height
    innerContainer.style.height = `${totalHeight}px`

    // Update ARIA attributes
    container.setAttribute('aria-rowcount', String(list.length))

    // Notify visible range change
    if (startIndex !== prevStartIndex || endIndex !== prevEndIndex) {
      onVisibleRangeChange?.(startIndex, endIndex)
      prevStartIndex = startIndex
      prevEndIndex = endIndex
    }

    // Track which keys are currently visible
    const visibleKeys = new Set<string | number>()

    // Render visible items
    for (let i = startIndex; i <= endIndex && i < list.length; i++) {
      const item = list[i]
      const key = getItemKey(item, i)
      visibleKeys.add(key)

      let entry = cache.get(key)

      if (!entry) {
        // Create new item
        const indexSig = signal(i)
        const vnode = renderItem(item, () => indexSig())
        const node = mountFn(vnode)

        if (node && node instanceof HTMLElement) {
          // Position the item
          node.style.position = 'absolute'
          node.style.top = '0'
          node.style.left = '0'
          node.style.right = '0'
          node.style.transform = `translateY(${i * itemHeight}px)`
          node.style.height = `${itemHeight}px`
          node.style.boxSizing = 'border-box'
          node.setAttribute('role', 'listitem')
          node.setAttribute('aria-rowindex', String(i + 1))

          innerContainer.appendChild(node)

          entry = {
            item,
            key,
            node,
            indexSig,
            dispose: () => {
              try {
                cleanupFn(node)
              } catch {
                // Ignore cleanup errors
              }
            },
          }
          cache.set(key, entry)
        }
      } else {
        // Update existing item position
        if (entry.indexSig.peek() !== i) {
          entry.indexSig.set(i)
        }
        const node = entry.node as HTMLElement
        node.style.transform = `translateY(${i * itemHeight}px)`
        node.setAttribute('aria-rowindex', String(i + 1))
      }
    }

    // Remove items no longer visible
    for (const [key, entry] of cache) {
      if (!visibleKeys.has(key)) {
        entry.dispose()
        if (entry.node.parentNode === innerContainer) {
          innerContainer.removeChild(entry.node)
        }
        cache.delete(key)
      }
    }
  })

  // Cleanup function
  return () => {
    disposeEffect()
    container.removeEventListener('scroll', handleScroll)

    for (const entry of cache.values()) {
      entry.dispose()
    }
    cache.clear()

    if (container.parentNode === parent) {
      parent.removeChild(container)
    }
  }
}

export default List
