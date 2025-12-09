/**
 * Reactive Array System
 *
 * Enables `items.map(fn)` syntax to work reactively with For-like optimizations.
 * When a StateValue<T[]>.map() is called, it returns a ReactiveArrayResult
 * that the renderer can detect and handle with optimized DOM caching.
 */

import type { Signal, Computed } from './signal'
import { signal, effect } from './signal'
import type { FNode } from './renderer'

/** Symbol to identify ReactiveArrayResult */
export const REACTIVE_ARRAY_MARKER = Symbol.for('flexium.reactiveArray')

/**
 * Result of calling .map() on a reactive array state.
 * Contains the source signal and mapping function for deferred execution.
 */
export interface ReactiveArrayResult<T, R> {
  [REACTIVE_ARRAY_MARKER]: true
  /** The source signal containing the array */
  source: Signal<T[]> | Computed<T[]>
  /** The mapping function to apply to each item */
  mapFn: (item: T, index: () => number) => R
  /** Optional key function for stable identity */
  keyFn?: (item: T) => string | number
}

/**
 * Check if a value is a ReactiveArrayResult
 */
export function isReactiveArrayResult(
  value: unknown
): value is ReactiveArrayResult<unknown, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    REACTIVE_ARRAY_MARKER in value &&
    (value as ReactiveArrayResult<unknown, unknown>)[REACTIVE_ARRAY_MARKER] ===
      true
  )
}

/**
 * Create a ReactiveArrayResult from a signal and map function.
 * This is used internally when .map() is called on a StateValue<T[]>.
 *
 * @param source - The signal or computed containing the array
 * @param mapFn - Function to map each item to a renderable element
 * @param keyFn - Optional function to extract a unique key from each item
 * @returns A ReactiveArrayResult that the renderer can detect and handle
 *
 * @example
 * ```tsx
 * // This is typically called automatically via items.map() syntax:
 * const items = state([{ id: 1, name: 'Item 1' }])
 *
 * // In JSX, this becomes a ReactiveArrayResult:
 * <Column>
 *   {items.map((item, index) => (
 *     <Row key={item.id}>
 *       <Text>{index()}: {item.name}</Text>
 *     </Row>
 *   ))}
 * </Column>
 * ```
 */
export function createReactiveArrayResult<T, R>(
  source: Signal<T[]> | Computed<T[]>,
  mapFn: (item: T, index: () => number) => R,
  keyFn?: (item: T) => string | number
): ReactiveArrayResult<T, R> {
  return {
    [REACTIVE_ARRAY_MARKER]: true,
    source,
    mapFn,
    keyFn,
  }
}

/**
 * Cache entry for reactive array DOM rendering
 * Now keyed by FNode.key (from rendered element) instead of source item
 */
interface ArrayCacheEntry {
  node: Node
  indexSig: Signal<number>
  dispose: () => void
}

/**
 * Get key from FNode - uses FNode.key if available, otherwise index
 */
function getFNodeKey(vnode: FNode, index: number): string | number {
  if (vnode && typeof vnode === 'object' && 'key' in vnode && vnode.key != null) {
    return vnode.key
  }
  // Fallback to index-based key with type for uniqueness
  return `__idx_${index}_${vnode?.type || 'unknown'}`
}

/**
 * Mount a ReactiveArrayResult with FNode.key based reconciliation.
 * Uses FNode.key for stable identity matching instead of source item reference.
 *
 * Performance characteristics:
 * - O(1) for item reuse (by FNode.key)
 * - O(n) for reorder with minimal DOM moves
 *
 * @param result - The ReactiveArrayResult from items.map()
 * @param parent - Parent DOM node
 * @param startMarker - Marker node for positioning
 * @param mountFn - Function to mount an FNode to DOM
 * @param cleanupFn - Function to cleanup a DOM node
 * @returns Dispose function
 */
export function mountReactiveArray<T, R>(
  result: ReactiveArrayResult<T, R>,
  parent: Node,
  startMarker: Node,
  mountFn: (vnode: FNode) => Node | null,
  cleanupFn: (node: Node) => void
): () => void {
  const { source, mapFn } = result

  // Cache: FNode.key -> { node, indexSig, dispose }
  let cache = new Map<string | number, ArrayCacheEntry>()

  const dispose = effect(() => {
    const list = source.value || []
    const newCache = new Map<string | number, ArrayCacheEntry>()
    const newNodes: Node[] = []

    // Phase 1: Remove ALL old nodes first (clean slate approach)
    // This ensures correct behavior when keys are index-based
    for (const [, entry] of cache) {
      entry.dispose()
      if (entry.node.parentNode === parent) {
        parent.removeChild(entry.node)
      }
    }
    cache.clear()

    // Phase 2: Create fresh nodes for current list
    for (let i = 0; i < list.length; i++) {
      const item = list[i]

      // Create index signal for reactive index access
      const indexSig = signal(i)

      // Call mapFn to get FNode (late binding - called at render time)
      const vnode = mapFn(item, () => indexSig.value) as FNode

      // Get key from FNode
      const key = getFNodeKey(vnode, i)

      // Mount new node
      const node = mountFn(vnode)

      if (node) {
        const entry: ArrayCacheEntry = {
          node,
          indexSig,
          dispose: () => cleanupFn(node),
        }
        newCache.set(key, entry)
        newNodes.push(entry.node)
      }
    }

    // Phase 3: Insert nodes in correct order
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i]
      const expectedPosition =
        i === 0 ? startMarker.nextSibling : newNodes[i - 1].nextSibling

      if (node !== expectedPosition) {
        parent.insertBefore(node, expectedPosition)
      }
    }

    // Update cache for next render
    cache = newCache
  })

  // Cleanup function
  return () => {
    dispose()
    for (const entry of cache.values()) {
      entry.dispose()
      if (entry.node.parentNode === parent) {
        parent.removeChild(entry.node)
      }
    }
    cache.clear()
  }
}

/**
 * Array methods that should return ReactiveArrayResult when called on StateValue
 */
export const REACTIVE_ARRAY_METHODS = ['map'] as const

/**
 * Check if a method name should be wrapped for reactive arrays
 */
export function isReactiveArrayMethod(
  methodName: string | symbol
): methodName is 'map' {
  return (
    typeof methodName === 'string' &&
    REACTIVE_ARRAY_METHODS.includes(methodName as 'map')
  )
}
