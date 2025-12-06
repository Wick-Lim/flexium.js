import { FNode } from '../core/renderer'
import { signal, effect, Signal } from './signal'

/** Getter type for reactive arrays (signal or function) */
type ArrayGetter<T> = Signal<T[]> | (() => T[])

interface ForProps<T> {
  each: ArrayGetter<T>
  children:
    | ((item: T, index: () => number) => FNode)
    | ((item: T, index: () => number) => FNode)[]
}

/**
 * Item cache entry for DOM-direct rendering
 */
interface ForCacheEntry<T> {
  item: T
  node: Node
  indexSig: Signal<number>
  dispose: () => void
}

/**
 * Marker symbol to identify For components
 */
export const FOR_MARKER = Symbol('flexium.for')

/**
 * <For> component for efficient list rendering.
 * Uses direct DOM caching - no FNode intermediate layer.
 *
 * Performance characteristics:
 * - O(1) for append/prepend
 * - O(1) for item reuse (by reference)
 * - O(n) for reorder with minimal DOM moves
 *
 * @example
 * <For each={items}>
 *   {(item, index) => <div>{item.name}</div>}
 * </For>
 *
 * For conditional rendering, use native JS:
 * @example
 * {() => isLoggedIn() ? <Dashboard /> : <Login />}
 * {() => user() && <Profile user={user()} />}
 */
export function For<T>(props: ForProps<T>): ForComponent<T> {
  const component = {
    [FOR_MARKER]: true,
    each: props.each,
    renderItem: Array.isArray(props.children)
      ? props.children[0]
      : props.children,
  } as ForComponent<T>

  return component
}

export interface ForComponent<T> {
  [FOR_MARKER]: true
  each: ArrayGetter<T>
  renderItem: (item: T, index: () => number) => FNode
}

/**
 * Check if value is a For component
 */
export function isForComponent(value: unknown): value is ForComponent<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    FOR_MARKER in value &&
    value[FOR_MARKER] === true
  )
}

/**
 * Mount a For component with direct DOM caching.
 * Called from reactive.ts when For marker is detected.
 *
 * @param forComp - The For component descriptor
 * @param parent - Parent DOM node
 * @param mountFn - Function to mount an FNode to DOM (from reactive.ts)
 * @param cleanupFn - Function to cleanup a DOM node (from reactive.ts)
 * @returns Dispose function
 */
export function mountForComponent<T>(
  forComp: ForComponent<T>,
  parent: Node,
  startMarker: Node,
  mountFn: (vnode: FNode) => Node | null,
  cleanupFn: (node: Node) => void
): () => void {
  const { each, renderItem } = forComp

  // Direct DOM cache: item reference -> { node, indexSig, dispose }
  let cache = new Map<T, ForCacheEntry<T>>()

  const dispose = effect(() => {
    const list = each() || []
    const newCache = new Map<T, ForCacheEntry<T>>()
    const newNodes: Node[] = []

    // Phase 1: Create/reuse nodes
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      let entry = cache.get(item)

      if (!entry) {
        // New item: create index signal, render, mount
        const indexSig = signal(i)
        const vnode = renderItem(item, indexSig)
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
          entry.indexSig.set(i)
        }
      }

      if (entry) {
        newCache.set(item, entry)
        newNodes.push(entry.node)
      }
    }

    // Phase 2: Remove nodes no longer in list
    for (const [item, entry] of cache) {
      if (!newCache.has(item)) {
        entry.dispose()
        if (entry.node.parentNode === parent) {
          parent.removeChild(entry.node)
        }
      }
    }

    // Phase 3: Reorder nodes efficiently
    // Use insertBefore to move nodes into correct position
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i]

      // Find where this node should be inserted (before which sibling)
      // We need to find the correct position after the previous node in newNodes
      const expectedPosition =
        i === 0 ? startMarker.nextSibling : newNodes[i - 1].nextSibling

      if (node !== expectedPosition) {
        // Node is not in correct position, move it
        if (node.parentNode === parent) {
          // Already in parent, just move
          parent.insertBefore(node, expectedPosition)
        } else {
          // Not yet in parent, insert
          parent.insertBefore(node, expectedPosition)
        }
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
