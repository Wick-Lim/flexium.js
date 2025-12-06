import { signal, createResource } from './signal'
import type { Signal, Resource } from './signal'

/** Internal state object that may be a Signal or Resource */
interface StateObject {
  value: unknown
  peek: () => unknown
  loading?: boolean
  error?: unknown
  state?: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  latest?: unknown
  read?: () => unknown
  _stateActions?: StateActions
  _signal?: Signal<unknown> | Resource<unknown>
}

/** Actions available for state mutation */
interface StateActions {
  mutate?: (value: unknown) => void
  refetch?: () => void
}

// Global registry for keyed states
const globalStateRegistry = new Map<string, StateObject>()

/** Setter function type */
export type StateSetter<T> = (newValue: T | ((prev: T) => T)) => void

/**
 * Unified State API (React-style)
 *
 * Returns value directly - no .value needed!
 * Component will re-render when state changes (if called inside effect/component).
 *
 * Usage:
 * 1. Simple state: const [count, setCount] = state(0)
 * 2. Async state: const [data, refetch, isLoading, error] = state(async () => fetch(...))
 * 3. Global state: const [theme, setTheme] = state('light', { key: 'theme' })
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = state(0)
 *   return <Button onPress={() => setCount(count + 1)}>{count}</Button>
 * }
 * ```
 */
export function state<T>(
  initialValue: T,
  options?: { key?: string }
): [T, StateSetter<T>]

export function state<T>(
  fetcher: () => Promise<T>,
  options?: { key?: string }
): [T | undefined, () => void, boolean, unknown]

export function state<T>(
  initialValueOrFetcher: T | (() => T | Promise<T>),
  options?: { key?: string }
): [T, StateSetter<T>] | [T | undefined, () => void, boolean, unknown] {
  let s: StateObject
  let actions: StateActions = {}
  let isAsync = false

  const key = options?.key

  // 1. Check Global Registry
  if (key && typeof key === 'string' && globalStateRegistry.has(key)) {
    const cached = globalStateRegistry.get(key)!
    s = cached
    isAsync = 'loading' in cached && cached._stateActions?.refetch !== undefined
  }

  // 2. Create New (if not in registry)
  else {
    if (typeof initialValueOrFetcher === 'function') {
      const fn = initialValueOrFetcher as () => T | Promise<T>

      // Check if it's async by looking at return type
      // We'll treat all functions as potential async for simplicity
      const [res, resActions] = createResource(
        fn,
        async (val) => val
      )

      s = res as unknown as StateObject
      s._signal = res as unknown as Resource<unknown>
      actions = resActions as StateActions
      isAsync = true
    } else {
      // It's a value -> Create Signal
      const sig = signal<T>(initialValueOrFetcher)
      s = sig as unknown as StateObject
      s._signal = sig as unknown as Signal<unknown>
    }

    // Save to registry if key provided
    if (key && typeof key === 'string') {
      s._stateActions = actions
      globalStateRegistry.set(key, s)
    }
  }

  // If we retrieved from cache, retrieve actions
  if (!actions.refetch && s._stateActions) {
    actions = s._stateActions
  }

  // 3. Read current value (this creates subscription if inside effect)
  const value = s.value as T

  if (isAsync) {
    // Async state: [value, refetch, isLoading, error]
    const refetch = actions.refetch || (() => {})
    const isLoading = s.loading || false
    const error = s.error

    return [value, refetch, isLoading, error] as [T | undefined, () => void, boolean, unknown]
  }

  // Sync state: [value, setter]
  const setter: StateSetter<T> = (newValue) => {
    if (typeof newValue === 'function') {
      const fn = newValue as (prev: T) => T
      s.value = fn(s.peek() as T)
    } else {
      s.value = newValue
    }
  }

  return [value, setter]
}

/**
 * Clear all global states (useful for testing or resetting app)
 */
export function clearGlobalState() {
  globalStateRegistry.clear()
}
