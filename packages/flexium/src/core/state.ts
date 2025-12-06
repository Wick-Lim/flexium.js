import { signal, createResource } from './signal'
import type { Signal, Resource } from './signal'

/** Symbol to identify StateProxy and access underlying signal */
// Use Symbol.for() to ensure the symbol is shared across module boundaries
// This is important for Vite dev mode where modules may be loaded separately
export const STATE_SIGNAL = Symbol.for('flexium.stateSignal')

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

// ============================================
// Component Scope Tracking (React-like hooks)
// ============================================
let currentComponentId: string | null = null
let currentHookIndex = 0
let componentIdCounter = 0

/**
 * Begin a component render scope.
 * Called by the renderer before executing a component function.
 * @internal
 */
export function beginComponentScope(id?: string): string {
  currentComponentId = id || `__comp_${++componentIdCounter}`
  currentHookIndex = 0
  return currentComponentId
}

/**
 * End a component render scope.
 * Called by the renderer after executing a component function.
 * @internal
 */
export function endComponentScope(): void {
  currentComponentId = null
  currentHookIndex = 0
}

/**
 * Get current component scope info (for debugging)
 * @internal
 */
export function getCurrentScope(): { componentId: string | null; hookIndex: number } {
  return { componentId: currentComponentId, hookIndex: currentHookIndex }
}

/** Setter function type */
export type StateSetter<T> = (newValue: T | ((prev: T) => T)) => void

/**
 * StateValue type - a value-like proxy that behaves like T.
 * Can be used directly in expressions and JSX.
 */
export type StateValue<T> = T & (() => T)

/**
 * Check if a value is a StateValue
 * @internal
 */
export function isStateValue(value: unknown): boolean {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    STATE_SIGNAL in value
  )
}

/**
 * Get the underlying signal from a StateValue
 * @internal
 */
export function getStateSignal(stateValue: unknown): Signal<unknown> | null {
  if (isStateValue(stateValue)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (stateValue as any)[STATE_SIGNAL]
  }
  return null
}

/**
 * Create a reactive proxy that behaves like a value but stays reactive.
 * The proxy is also callable - calling it returns the current value.
 * This ensures compatibility with code expecting getter functions.
 */
function createStateProxy<T>(sig: Signal<T>): StateValue<T> {
  // Use a function as the target so the proxy is callable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target = function() { return sig.value } as any

  const proxy = new Proxy(target, {
    // Make the proxy callable - returns current value
    apply() {
      return sig.value
    },

    get(_target, prop) {
      // Return underlying signal for reactive binding detection
      if (prop === STATE_SIGNAL) {
        return sig
      }

      // Symbol.toPrimitive - called for +, -, ==, template literals, etc.
      if (prop === Symbol.toPrimitive) {
        return (_hint: string) => sig.value
      }

      // valueOf - called for numeric operations
      if (prop === 'valueOf') {
        return () => sig.value
      }

      // toString - called for string concatenation
      if (prop === 'toString') {
        return () => String(sig.value)
      }

      // toJSON - called for JSON.stringify
      if (prop === 'toJSON') {
        return () => sig.value
      }

      // For object/array values, access properties on current value
      const currentValue = sig.value
      if (currentValue !== null && typeof currentValue === 'object') {
        const propValue = (currentValue as Record<string | symbol, unknown>)[prop]
        // If it's a function (like array methods), bind it to the current value
        if (typeof propValue === 'function') {
          return propValue.bind(currentValue)
        }
        return propValue
      }

      return undefined
    },

    // For property checks (like 'length' in array)
    has(_target, prop) {
      if (prop === STATE_SIGNAL) return true
      const currentValue = sig.value
      if (currentValue !== null && typeof currentValue === 'object') {
        return prop in (currentValue as object)
      }
      return false
    },

    // For Object.keys, for...in loops
    ownKeys(_target) {
      const currentValue = sig.value
      if (currentValue !== null && typeof currentValue === 'object') {
        return Reflect.ownKeys(currentValue as object)
      }
      return []
    },

    getOwnPropertyDescriptor(_target, prop) {
      if (prop === STATE_SIGNAL) {
        return { configurable: true, enumerable: false, value: sig }
      }
      const currentValue = sig.value
      if (currentValue !== null && typeof currentValue === 'object') {
        const desc = Object.getOwnPropertyDescriptor(currentValue as object, prop)
        if (desc) {
          // Make it configurable to satisfy Proxy invariants
          return { ...desc, configurable: true }
        }
      }
      return undefined
    },
  })

  return proxy as StateValue<T>
}

/**
 * Unified State API (React-style)
 *
 * Returns a tuple of [value, setter] like React's useState.
 * The value is a reactive proxy - use it like a regular value!
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
): [StateValue<T>, StateSetter<T>]

export function state<T>(
  fetcher: () => Promise<T>,
  options?: { key?: string }
): [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>]

export function state<T>(
  initialValueOrFetcher: T | (() => T | Promise<T>),
  options?: { key?: string }
): [StateValue<T>, StateSetter<T>] | [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>] {
  let s: StateObject
  let actions: StateActions = {}
  let isAsync = false

  // Determine the key: explicit key OR auto-generated from component scope
  let key = options?.key
  if (!key && currentComponentId) {
    key = `${currentComponentId}:${currentHookIndex++}`
  }

  // 1. Check Global Registry
  if (key && globalStateRegistry.has(key)) {
    const cached = globalStateRegistry.get(key)!
    s = cached
    isAsync = 'loading' in cached && cached._stateActions?.refetch !== undefined

    // Retrieve actions from cache
    if (cached._stateActions) {
      actions = cached._stateActions
    }
  }
  // 2. Create New (if not in registry)
  else {
    if (typeof initialValueOrFetcher === 'function') {
      const fn = initialValueOrFetcher as () => T | Promise<T>

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

    // Save to registry if key exists
    if (key) {
      s._stateActions = actions
      globalStateRegistry.set(key, s)
    }
  }

  // Create reactive proxy (behaves like the value itself)
  const proxy = createStateProxy(s._signal as Signal<T>)

  // Setter function
  const setter: StateSetter<T> = (newValue) => {
    if (typeof newValue === 'function') {
      const fn = newValue as (prev: T) => T
      s.value = fn(s.peek() as T)
    } else {
      s.value = newValue
    }
  }

  if (isAsync) {
    // Async state: [value, refetch, isLoading, error]
    const refetch = actions.refetch || (() => {})
    // These need to be reactive too - create proxies
    const loadingProxy = createStateProxy(
      { get value() { return s.loading || false }, peek: () => s.loading || false } as Signal<boolean>
    )
    const errorProxy = createStateProxy(
      { get value() { return s.error }, peek: () => s.error } as Signal<unknown>
    )

    return [proxy, refetch, loadingProxy, errorProxy] as [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>]
  }

  return [proxy, setter] as [StateValue<T>, StateSetter<T>]
}

/**
 * Clear all global states (useful for testing or resetting app)
 */
export function clearGlobalState() {
  globalStateRegistry.clear()
  componentIdCounter = 0
}
