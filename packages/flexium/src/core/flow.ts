import { FNode } from '../core/renderer'
import { StateGetter } from '../core/state'
import { signal, effect, Signal } from './signal'

interface ForProps<T> {
  each: StateGetter<T[]>
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
  each: StateGetter<T[]>
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

interface ShowProps<T> {
  when: StateGetter<T | undefined | null | false>
  fallback?: FNode | (() => FNode)
  children: FNode[] | ((item: T) => FNode)[]
}

/**
 * <Show> component for conditional rendering.
 * Renders children when the condition is truthy, otherwise renders fallback.
 *
 * @example
 * <Show when={isLoggedIn} fallback={<div>Login</div>}>
 *   <Dashboard />
 * </Show>
 *
 * // With callback to access truthy value
 * <Show when={user}>
 *   {(u) => <div>Hello {u.name}</div>}
 * </Show>
 */
export function Show<T>(props: ShowProps<T>) {
  return () => {
    const value = props.when()
    if (value) {
      const child = props.children[0]
      return typeof child === 'function' && props.children.length === 1
        ? (child as (item: T) => FNode)(value)
        : child
    }
    if (props.fallback) {
      return typeof props.fallback === 'function'
        ? (props.fallback as () => FNode)()
        : props.fallback
    }
    return null
  }
}

interface SwitchProps {
  fallback?: FNode
  children: FNode[]
}

interface MatchProps<T> {
  when: StateGetter<T | undefined | null | false>
  children: FNode | ((item: T) => FNode)
}

/**
 * <Match> component to be used within <Switch>.
 * It does not render anything on its own.
 */
export function Match<T>(props: MatchProps<T>): FNode {
  return props as unknown as FNode
}

/**
 * <Switch> component for mutually exclusive conditional rendering.
 * Renders the first <Match> child whose `when` condition is truthy.
 *
 * @example
 * <Switch fallback={<div>Not Found</div>}>
 *   <Match when={isLoading}>Loading...</Match>
 *   <Match when={error}>Error: {error}</Match>
 *   <Match when={data}>
 *     {(d) => <DataView data={d} />}
 *   </Match>
 * </Switch>
 */
export function Switch(props: SwitchProps) {
  return () => {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children]

    for (const child of children.flat()) {
      if (
        child &&
        typeof child === 'object' &&
        'type' in child &&
        child.type === Match
      ) {
        const matchNode = child as FNode & {
          props: { when: StateGetter<unknown> }
          children?: unknown[]
        }
        const when = matchNode.props.when
        // Check condition (track dependency)
        const value = typeof when === 'function' ? when() : when

        if (value) {
          const matchChildren = matchNode.children
          if (matchChildren && matchChildren.length > 0) {
            const content = matchChildren[0]
            return typeof content === 'function'
              ? (content as (val: unknown) => FNode | null)(value)
              : (content as FNode | null)
          }
          return null
        }
      }
    }
    return props.fallback || null
  }
}
