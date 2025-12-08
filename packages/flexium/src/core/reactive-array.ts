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
 */
interface ArrayCacheEntry<T> {
  item: T
  node: Node
  indexSig: Signal<number>
  dispose: () => void
}

/**
 * Mount a ReactiveArrayResult with optimized DOM caching.
 * Similar to For component but triggered by .map() syntax.
 *
 * Performance characteristics:
 * - O(1) for append/prepend
 * - O(1) for item reuse (by reference or key)
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
  const { source, mapFn, keyFn } = result

  // Cache: identity -> { node, indexSig, dispose }
  // Use keyFn result or item reference as identity
  let cache = new Map<unknown, ArrayCacheEntry<T>>()

  const getKey = (item: T): unknown => {
    if (keyFn) return keyFn(item)
    // For objects, use reference identity
    // For primitives, use value (may cause issues with duplicates)
    return item
  }

  const dispose = effect(() => {
    const list = source.value || []
    const newCache = new Map<unknown, ArrayCacheEntry<T>>()
    const newNodes: Node[] = []

    // Phase 1: Create/reuse nodes
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const key = getKey(item)
      let entry = cache.get(key)

      if (!entry) {
        // New item: create index signal, render, mount
        const indexSig = signal(i)
        // Call mapFn with item and reactive index getter
        const vnode = mapFn(item, () => indexSig.value) as FNode
        const node = mountFn(vnode)

        if (node) {
          entry = {
            item,
            node,
            indexSig,
            dispose: () => cleanupFn(node),
          }
        }
      } else {
        // Existing item: update index if changed
        if (entry.indexSig.peek() !== i) {
          entry.indexSig.value = i
        }
      }

      if (entry) {
        newCache.set(key, entry)
        newNodes.push(entry.node)
      }
    }

    // Phase 2: Remove nodes no longer in list
    for (const [key, entry] of cache) {
      if (!newCache.has(key)) {
        entry.dispose()
        if (entry.node.parentNode === parent) {
          parent.removeChild(entry.node)
        }
      }
    }

    // Phase 3: Reorder nodes efficiently
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i]
      const expectedPosition =
        i === 0 ? startMarker.nextSibling : newNodes[i - 1].nextSibling

      if (node !== expectedPosition) {
        parent.insertBefore(node, expectedPosition)
      }
    }

    // Update cache
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
