import { signal, computed as createComputed, createResource } from './signal'
import type { Signal, Computed, Resource } from './signal'

/** Symbol to identify StateProxy and access underlying signal */
// Use Symbol.for() to ensure the symbol is shared across module boundaries
// This is important for Vite dev mode where modules may be loaded separately
export const STATE_SIGNAL = Symbol.for('flexium.stateSignal')

/** Internal state object that may be a Signal, Computed, or Resource */
interface StateObject {
  value: unknown
  peek: () => unknown
  loading?: boolean
  error?: unknown
  state?: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  latest?: unknown
  read?: () => unknown
  _stateActions?: StateActions
  _signal?: Signal<unknown> | Computed<unknown> | Resource<unknown>
  _isComputed?: boolean
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
function createStateProxy<T>(sig: Signal<T> | Computed<T>): StateValue<T> {
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
 * Unified State API
 *
 * One function for all reactive state needs - always returns an array for consistency:
 * 1. Simple state: const [count, setCount] = state(0)
 * 2. Derived state: const [doubled] = state(() => count * 2)
 * 3. Async state: const [data, refetch, loading, error] = state(async () => fetch(...))
 * 4. Global state: const [theme, setTheme] = state('light', { key: 'theme' })
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = state(0)
 *   const [doubled] = state(() => count * 2)
 *   return <Button onPress={() => setCount(count + 1)}>{doubled}</Button>
 * }
 * ```
 */
// Overload 1: Value → [StateValue, Setter]
export function state<T>(
  initialValue: T,
  options?: { key?: string }
): [StateValue<T>, StateSetter<T>]

// Overload 2: Sync function → [StateValue] (derived, no setter)
export function state<T>(
  computeFn: () => T,
  options?: { key?: string }
): [StateValue<T>]

// Overload 3: Async function → [StateValue, refetch, loading, error]
export function state<T>(
  fetcher: () => Promise<T>,
  options?: { key?: string }
): [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>]

export function state<T>(
  initialValueOrFetcher: T | (() => T) | (() => Promise<T>),
  options?: { key?: string }
): [StateValue<T>] | [StateValue<T>, StateSetter<T>] | [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>] {
  const key = options?.key

  // 1. Check Global Registry for keyed state
  if (key && globalStateRegistry.has(key)) {
    const cached = globalStateRegistry.get(key)!
    const isAsync = 'loading' in cached && cached._stateActions?.refetch !== undefined
    const isComputed = cached._isComputed

    const proxy = createStateProxy(cached._signal as Signal<T>)

    if (isComputed) {
      return [proxy] as [StateValue<T>]
    }

    if (isAsync) {
      const refetch = cached._stateActions?.refetch || (() => {})
      const loadingProxy = createStateProxy(
        { get value() { return cached.loading || false }, peek: () => cached.loading || false } as Signal<boolean>
      )
      const errorProxy = createStateProxy(
        { get value() { return cached.error }, peek: () => cached.error } as Signal<unknown>
      )
      return [proxy, refetch, loadingProxy, errorProxy] as [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>]
    }

    const setter: StateSetter<T> = (newValue) => {
      if (typeof newValue === 'function') {
        cached.value = (newValue as (prev: T) => T)(cached.peek() as T)
      } else {
        cached.value = newValue
      }
    }
    return [proxy, setter] as [StateValue<T>, StateSetter<T>]
  }

  // 2. Handle function input (computed or async)
  if (typeof initialValueOrFetcher === 'function') {
    const fn = initialValueOrFetcher as () => T | Promise<T>

    // Try to detect if it's async by checking constructor name
    // This handles `async () => ...` functions
    const isAsyncFn = fn.constructor.name === 'AsyncFunction'

    if (isAsyncFn) {
      // Async function → Resource
      const [res, resActions] = createResource(fn, async (val) => val)
      const s = res as unknown as StateObject
      s._signal = res as unknown as Resource<unknown>
      s._stateActions = resActions as StateActions

      if (key) {
        globalStateRegistry.set(key, s)
      }

      const proxy = createStateProxy(s._signal as Signal<T>)
      const loadingProxy = createStateProxy(
        { get value() { return s.loading || false }, peek: () => s.loading || false } as Signal<boolean>
      )
      const errorProxy = createStateProxy(
        { get value() { return s.error }, peek: () => s.error } as Signal<unknown>
      )

      return [proxy, resActions.refetch, loadingProxy, errorProxy] as [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>]
    }

    // Sync function → Computed
    // First, try running to check if it returns a Promise (for non-async functions that return Promise)
    let testResult: T | Promise<T>
    try {
      testResult = fn()
    } catch {
      // If it throws during initial call, treat as computed (will throw on access)
      const comp = createComputed(fn as () => T)
      const s = { _signal: comp, _isComputed: true } as unknown as StateObject
      if (key) {
        globalStateRegistry.set(key, s)
      }
      return [createStateProxy(comp)] as [StateValue<T>]
    }

    if (testResult instanceof Promise) {
      // It's a Promise-returning function → Resource
      const [res, resActions] = createResource(fn, async (val) => val)
      const s = res as unknown as StateObject
      s._signal = res as unknown as Resource<unknown>
      s._stateActions = resActions as StateActions

      if (key) {
        globalStateRegistry.set(key, s)
      }

      const proxy = createStateProxy(s._signal as Signal<T>)
      const loadingProxy = createStateProxy(
        { get value() { return s.loading || false }, peek: () => s.loading || false } as Signal<boolean>
      )
      const errorProxy = createStateProxy(
        { get value() { return s.error }, peek: () => s.error } as Signal<unknown>
      )

      return [proxy, resActions.refetch, loadingProxy, errorProxy] as [StateValue<T | undefined>, () => void, StateValue<boolean>, StateValue<unknown>]
    }

    // Sync function → Computed (memoized derived value)
    const comp = createComputed(fn as () => T)
    const s = { _signal: comp, _isComputed: true } as unknown as StateObject
    if (key) {
      globalStateRegistry.set(key, s)
    }
    return [createStateProxy(comp)] as [StateValue<T>]
  }

  // 3. Plain value → Signal with setter
  const sig = signal<T>(initialValueOrFetcher)
  const s = sig as unknown as StateObject
  s._signal = sig as unknown as Signal<unknown>

  if (key) {
    globalStateRegistry.set(key, s)
  }

  const proxy = createStateProxy(sig)
  const setter: StateSetter<T> = (newValue) => {
    if (typeof newValue === 'function') {
      sig.value = (newValue as (prev: T) => T)(sig.peek())
    } else {
      sig.value = newValue
    }
  }

  return [proxy, setter] as [StateValue<T>, StateSetter<T>]
}

/**
 * Clear all global states (useful for testing or resetting app)
 */
export function clearGlobalState() {
  globalStateRegistry.clear()
}
