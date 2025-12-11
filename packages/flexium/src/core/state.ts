import { signal, computed, createResource } from './signal'
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

  _stateActions?: StateActions
  _signal?: Signal<unknown> | Computed<unknown> | Resource<unknown>
  _isComputed?: boolean
}

/** Actions available for state mutation */
interface StateActions {
  mutate?: (value: unknown) => void
  refetch?: () => void
}

/**
 * Type-safe helper to wrap Resource as StateObject.
 * Consolidates unsafe type assertions in one place.
 * @internal
 */
function toStateObject<T>(
  res: Resource<T>,
  actions: { mutate: (v: T | undefined) => void; refetch: () => void }
): StateObject {
  const s = res as unknown as StateObject
  s._signal = res as Resource<unknown>
  s._stateActions = actions as StateActions
  return s
}

/**
 * Type-safe helper to create a computed StateObject.
 * @internal
 */
function toComputedStateObject<T>(comp: Computed<T>): StateObject {
  return {
    value: undefined,
    peek: comp.peek,
    _signal: comp as Computed<unknown>,
    _isComputed: true,
  }
}

/**
 * Type-safe helper to wrap Signal as StateObject.
 * @internal
 */
function toSignalStateObject<T>(sig: Signal<T>): StateObject {
  const s = sig as unknown as StateObject
  s._signal = sig as Signal<unknown>
  return s
}

// Global registry for keyed states
const globalStateRegistry = new Map<string, StateObject>()

// Namespace registry: maps namespace to set of state keys
const namespaceRegistry = new Map<string, Set<string>>()

// State metadata for monitoring and auto-cleanup
interface StateMetadata {
  key: string
  namespace?: string
  createdAt: number
  lastAccessed: number
  accessCount: number
  // Reference counting for auto-cleanup
  referenceCount: number
  // Weak reference to signal for auto-cleanup detection
  // WeakRef is available in ES2021+
  signalRef?: WeakRef<Signal<unknown> | Computed<unknown> | Resource<unknown>> | undefined
}

const stateMetadata = new Map<string, StateMetadata>()

// Auto-cleanup configuration
interface AutoCleanupConfig {
  enabled: boolean
  maxIdleTime: number // milliseconds
  checkInterval: number // milliseconds
  minAccessCount: number // minimum accesses before considering for cleanup
}

let autoCleanupConfig: AutoCleanupConfig = {
  enabled: true, // Default: enabled
  maxIdleTime: 5 * 60 * 1000, // 5 minutes default
  checkInterval: 60 * 1000, // 1 minute default
  minAccessCount: 0,
}

let autoCleanupInterval: ReturnType<typeof setInterval> | null = null

// Initialize auto-cleanup on module load (if in browser environment)
if (typeof window !== 'undefined' || typeof globalThis !== 'undefined') {
  // Use setTimeout to ensure module is fully loaded
  setTimeout(() => {
    if (autoCleanupConfig.enabled && !autoCleanupInterval) {
      autoCleanupInterval = setInterval(() => {
        performAutoCleanup()
      }, autoCleanupConfig.checkInterval)
    }
  }, 0)
}

// Dev mode warning thresholds
const DEV_WARNING_THRESHOLD = 10000
let hasWarnedAboutSize = false

// ============================================================================
// Component Hook System - enables state() inside components
// ============================================================================

interface ComponentInstance {
  id: symbol
  hookIndex: number
  hooks: unknown[]
}

let currentComponent: ComponentInstance | null = null

/**
 * Set the current component context for hook tracking.
 * Called by the renderer before executing a component function.
 * @internal
 */
export function setCurrentComponent(instance: ComponentInstance | null): void {
  currentComponent = instance
}

/**
 * Get the current component context.
 * @internal
 */
export function getCurrentComponent(): ComponentInstance | null {
  return currentComponent
}

/**
 * Create a new component instance for hook tracking.
 * @internal
 */
export function createComponentInstance(): ComponentInstance {
  return {
    id: Symbol('component'),
    hookIndex: 0,
    hooks: [],
  }
}

/**
 * Reset hook index for re-renders.
 * @internal
 */
export function resetHookIndex(instance: ComponentInstance): void {
  instance.hookIndex = 0
}

/** Key type - string or array of serializable values */
export type StateKey = string | readonly (string | number | boolean | null | undefined | object)[]

/**
 * Statistics about global states
 */
export interface StateStats {
  /** Total number of global states */
  total: number
  /** Number of states by namespace */
  byNamespace: Record<string, number>
  /** Namespaces with most states */
  topNamespaces: Array<{ namespace: string; count: number }>
  /** Average access count per state */
  averageAccessCount: number
}

/**
 * Statistics for a specific namespace
 */
export interface NamespaceStats {
  /** Namespace name */
  namespace: string
  /** Number of states in this namespace */
  count: number
  /** Total access count for all states in namespace */
  totalAccessCount: number
  /** Average access count per state */
  averageAccessCount: number
  /** States in this namespace */
  states: Array<{ key: string; accessCount: number; createdAt: number }>
}

// Cache for array key serialization to avoid repeated JSON.stringify calls
const keyCache = new WeakMap<readonly unknown[], string>()

/**
 * Serialize a key to a string for registry lookup.
 * Arrays are JSON-stringified for consistent comparison.
 * Uses WeakMap cache to avoid repeated serialization of array keys.
 */
function serializeKey(key: StateKey): string {
  if (typeof key === 'string') {
    return key
  }

  // Check cache first for array keys
  const cached = keyCache.get(key)
  if (cached !== undefined) {
    return cached
  }

  try {
    const serialized = JSON.stringify(key)
    keyCache.set(key, serialized)
    return serialized
  } catch (error) {
    // Handle circular references or other serialization errors
    console.warn('[Flexium] Failed to serialize state key, using fallback:', error)
    const fallback = String(key)
    return fallback
  }
}

/**
 * Register a state in the namespace registry
 * @internal
 */
function registerStateInNamespace(key: string, namespace?: string): void {
  if (!namespace) return

  if (!namespaceRegistry.has(namespace)) {
    namespaceRegistry.set(namespace, new Set())
  }
  namespaceRegistry.get(namespace)!.add(key)
}

/**
 * Unregister a state from the namespace registry
 * @internal
 */
function unregisterStateFromNamespace(key: string, namespace?: string): void {
  if (!namespace) return

  const namespaceSet = namespaceRegistry.get(namespace)
  if (namespaceSet) {
    namespaceSet.delete(key)
    if (namespaceSet.size === 0) {
      namespaceRegistry.delete(namespace)
    }
  }
}

/**
 * Update state metadata (for monitoring and auto-cleanup)
 * @internal
 */
function updateStateMetadata(
  key: string,
  namespace?: string,
  signal?: Signal<unknown> | Computed<unknown> | Resource<unknown>
): void {
  const now = Date.now()
  const existing = stateMetadata.get(key)
  
  if (existing) {
    existing.lastAccessed = now
    existing.accessCount++
    existing.referenceCount++
    if (namespace && existing.namespace !== namespace) {
      // Namespace changed - update it
      if (existing.namespace) {
        unregisterStateFromNamespace(key, existing.namespace)
      }
      existing.namespace = namespace
      registerStateInNamespace(key, namespace)
    }
    if (signal && typeof WeakRef !== 'undefined') {
      existing.signalRef = new WeakRef(signal)
    }
  } else {
    stateMetadata.set(key, {
      key,
      namespace,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      referenceCount: 1,
      signalRef: signal && typeof WeakRef !== 'undefined' ? new WeakRef(signal) : undefined,
    })
    registerStateInNamespace(key, namespace)
  }
}

/**
 * Decrement reference count for a state
 * @internal
 */
function decrementReferenceCount(key: string): void {
  const metadata = stateMetadata.get(key)
  if (metadata) {
    metadata.referenceCount = Math.max(0, metadata.referenceCount - 1)
  }
}

/**
 * Auto-cleanup: Remove states that haven't been accessed recently
 * @internal
 */
function performAutoCleanup(): void {
  if (!autoCleanupConfig.enabled) return

  const now = Date.now()
  const keysToRemove: string[] = []

  for (const [key, metadata] of stateMetadata.entries()) {
    // Check if signal is still alive (if WeakRef is available)
    if (metadata.signalRef && typeof WeakRef !== 'undefined') {
      const signal = metadata.signalRef.deref()
      if (!signal) {
        // Signal was garbage collected, safe to remove
        keysToRemove.push(key)
        continue
      }
    }

    // Check if state is idle and has low reference count
    const idleTime = now - metadata.lastAccessed
    if (
      idleTime > autoCleanupConfig.maxIdleTime &&
      metadata.referenceCount === 0 &&
      metadata.accessCount >= autoCleanupConfig.minAccessCount
    ) {
      keysToRemove.push(key)
    }
  }

  // Remove idle states
  for (const key of keysToRemove) {
    const metadata = stateMetadata.get(key)
    if (metadata?.namespace) {
      unregisterStateFromNamespace(key, metadata.namespace)
    }
    stateMetadata.delete(key)
    globalStateRegistry.delete(key)
  }

  if (keysToRemove.length > 0 && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.log(`[Flexium] Auto-cleaned ${keysToRemove.length} idle states`)
  }
}

/**
 * Enable automatic cleanup of idle states
 * Auto-cleanup is enabled by default. Use this to reconfigure or re-enable after disabling.
 * @param config - Configuration for auto-cleanup
 *
 * @example
 * ```ts
 * state.enableAutoCleanup({
 *   maxIdleTime: 10 * 60 * 1000, // 10 minutes
 *   checkInterval: 2 * 60 * 1000, // Check every 2 minutes
 * })
 * ```
 */
function enableAutoCleanup(config?: Partial<AutoCleanupConfig>): void {
  autoCleanupConfig = { ...autoCleanupConfig, ...config, enabled: true }

  // Clear existing interval if any
  if (autoCleanupInterval) {
    clearInterval(autoCleanupInterval)
  }

  // Start auto-cleanup interval
  autoCleanupInterval = setInterval(() => {
    performAutoCleanup()
  }, autoCleanupConfig.checkInterval)

  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.log('[Flexium] Auto-cleanup enabled')
  }
}

/**
 * Disable automatic cleanup
 * Note: Auto-cleanup is enabled by default. Use this only if you need to disable it.
 *
 * @example
 * ```ts
 * // Disable auto-cleanup (not recommended for production)
 * state.disableAutoCleanup()
 * ```
 */
function disableAutoCleanup(): void {
  autoCleanupConfig.enabled = false
  if (autoCleanupInterval) {
    clearInterval(autoCleanupInterval)
    autoCleanupInterval = null
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.log('[Flexium] Auto-cleanup disabled')
  }
}

/**
 * Check global state registry size and warn in development mode.
 * Does not enforce hard limits - use state.delete() or state.clear() for cleanup.
 * @internal
 */
function checkRegistrySize(): void {
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  if (
    isDev &&
    !hasWarnedAboutSize &&
    globalStateRegistry.size >= DEV_WARNING_THRESHOLD
  ) {
    hasWarnedAboutSize = true
    console.warn(
      `[Flexium] Global state registry has ${globalStateRegistry.size} entries. ` +
      `Consider using state.delete(key) to clean up unused states, ` +
      `or state.clear() to reset all global states.`
    )
  }
}

/** Action function type for state mutation */
export type StateAction<T> = (newValue: T | ((prev: T) => T)) => void

/**
 * StateValue type - a value-like proxy that behaves like T.
 * Can be used directly in expressions and JSX.
 */
export type StateValue<T> = T & (() => T) & { peek(): T }

/**
 * Check if a value is a StateValue (created by the state() API).
 * Useful for type guards and runtime detection of reactive state.
 * @internal
 * @param value - The value to check
 * @returns true if the value is a StateValue proxy, false otherwise
 *
 * @example
 * ```tsx
 * const count = state(0)
 * isStateValue(count) // true
 * isStateValue(5) // false
 * ```
 */
export function isStateValue(value: unknown): boolean {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    STATE_SIGNAL in value
  )
}

/**
 * Get the underlying signal from a StateValue proxy.
 * Used internally for reactive binding detection and DOM updates.
 * @internal
 * @param stateValue - The StateValue proxy to extract the signal from
 * @returns The underlying Signal if stateValue is a StateValue, null otherwise
 *
 * @example
 * ```tsx
 * const count = state(0)
 * const signal = getStateSignal(count) // Returns the internal Signal<number>
 * ```
 */
export function getStateSignal(stateValue: unknown): Signal<unknown> | null {
  if (isStateValue(stateValue)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (stateValue as any)[STATE_SIGNAL]
  }
  return null
}

/**
 * Compare a StateValue with a primitive value safely.
 * Handles Proxy comparison automatically by extracting the underlying value.
 * 
 * @param stateValue - The StateValue to compare
 * @param value - The value to compare against
 * @returns true if the StateValue's underlying value equals the comparison value
 * 
 * @example
 * ```tsx
 * const [count, setCount] = state(0)
 * 
 * // ✅ Safe comparison using helper
 * if (equals(count, 5)) {
 *   console.log('Count is 5')
 * }
 * 
 * // ❌ Direct comparison (always false)
 * if (count === 5) { ... }
 * ```
 */
export function equals<T>(stateValue: StateValue<T>, value: T): boolean {
  if (!isStateValue(stateValue)) {
    return false
  }
  const actualValue = stateValue.peek()
  return actualValue === value
}

/**
 * Check if a StateValue is truthy.
 * Useful for boolean checks without explicit conversion.
 * 
 * @param stateValue - The StateValue to check
 * @returns true if the underlying value is truthy
 * 
 * @example
 * ```tsx
 * const [user, setUser] = state<User | null>(null)
 * 
 * // ✅ Safe boolean check
 * if (isTruthy(user)) {
 *   console.log('User exists:', user.name)
 * }
 * 
 * // ❌ Direct check (always true for Proxy)
 * if (user) { ... }
 * ```
 */
export function isTruthy<T>(stateValue: StateValue<T>): boolean {
  if (!isStateValue(stateValue)) {
    return false
  }
  return Boolean(stateValue.peek())
}

/**
 * Cache for StateProxy instances to avoid repeated Proxy creation for the same signal.
 * Uses WeakMap so proxies are automatically garbage collected when signals are no longer referenced.
 */
const proxyCache = new WeakMap<Signal<unknown> | Computed<unknown>, StateValue<unknown>>()

/**
 * Cache for bound functions to avoid repeated bind() calls.
 * Uses nested WeakMap: function -> (object -> bound function)
 * Performance: Reuse bound functions instead of creating new ones on each access
 */
const boundFunctionCache = new WeakMap<Function, WeakMap<object, Function>>()

/**
 * Create a reactive proxy that behaves like a value but stays reactive.
 * The proxy is also callable - calling it returns the current value.
 * This ensures compatibility with code expecting getter functions.
 * 
 * Performance optimization: Cache value and type checks to avoid repeated sig.value calls.
 * Performance optimization: Reuse Proxy instances for the same signal to reduce allocation overhead.
 */
function createStateProxy<T>(sig: Signal<T> | Computed<T>): StateValue<T> {
  // Check cache first - reuse existing proxy if available
  const cached = proxyCache.get(sig as Signal<unknown> | Computed<unknown>)
  if (cached) {
    return cached as StateValue<T>
  }

  // Use an arrow function as the target so the proxy is callable but has no prototype
  // This prevents invariant violations in ownKeys trap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target = () => sig.value

  // Performance: Cache common property accessors to avoid repeated lookups
  const PEEK_PROP = 'peek'
  const VALUE_OF_PROP = 'valueOf'
  const TO_STRING_PROP = 'toString'
  const TO_JSON_PROP = 'toJSON'
  const TO_PRIMITIVE_SYMBOL = Symbol.toPrimitive

  // Performance: Cache dev mode check (rarely changes, so cache at proxy creation time)
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  const warnComparison = isDev && typeof process !== 'undefined' && process.env?.FLEXIUM_WARN_COMPARISON === 'true'

  const proxy = new Proxy(target, {
    // Make the proxy callable - returns current value
    apply() {
      return sig.value
    },

    get(_target, prop) {
      // Performance: Check most common cases first (branch prediction optimization)
      // STATE_SIGNAL is checked first as it's used internally for reactive binding
      if (prop === STATE_SIGNAL) {
        return sig
      }

      // peek() is frequently accessed, check early
      if (prop === PEEK_PROP) {
        return sig.peek
      }

      // Performance: Early return for object property access (most common case)
      // Read value once and check type before special property checks
      // Note: accessing sig.value here tracks the signal in any enclosing effect
      const currentValue = sig.value

      // Early return for null (most common non-object case)
      if (currentValue === null) {
        // Still need to check special properties even for null values
        if (prop === TO_PRIMITIVE_SYMBOL) return () => null
        if (prop === VALUE_OF_PROP) return () => null
        if (prop === TO_STRING_PROP) return () => 'null'
        if (prop === TO_JSON_PROP) return () => null
        return undefined
      }

      // Type check once - reuse result
      const isObject = typeof currentValue === 'object'
      
      // Handle special properties for object values
      if (isObject) {
        // Check special properties first before accessing object properties
        if (prop === TO_PRIMITIVE_SYMBOL) {
          return (_hint: string) => currentValue
        }
        if (prop === VALUE_OF_PROP) {
          return () => {
            // Performance: Use cached warnComparison instead of checking env every time
            if (warnComparison) {
              // Only warn if explicitly enabled via environment variable
              // Most users should rely on ESLint rules instead
            }
            return currentValue
          }
        }
        if (prop === TO_STRING_PROP) {
          return () => String(currentValue)
        }
        if (prop === TO_JSON_PROP) {
          return () => currentValue
        }

        // Access object property
        const obj = currentValue as Record<string | symbol, unknown>
        const propValue = obj[prop]
        // Performance: Cache bound functions to avoid repeated bind() calls
        // If it's a function (like array methods), bind it to the current value
        if (typeof propValue === 'function') {
          // Check cache first
          let functionCache = boundFunctionCache.get(propValue)
          if (!functionCache) {
            functionCache = new WeakMap()
            boundFunctionCache.set(propValue, functionCache)
          }
          
          let bound: Function | undefined = functionCache.get(currentValue)
          if (!bound) {
            bound = propValue.bind(currentValue)
            // TypeScript: bound is guaranteed to be Function here
            functionCache.set(currentValue, bound as Function)
          }
          return bound
        }
        return propValue
      }

      // Handle special properties for primitive values
      if (prop === TO_PRIMITIVE_SYMBOL) {
        return (_hint: string) => currentValue
      }
      if (prop === VALUE_OF_PROP) {
        return () => {
          // Performance: Use cached warnComparison instead of checking env every time
          if (warnComparison) {
            // Only warn if explicitly enabled via environment variable
          }
          return currentValue
        }
      }
      if (prop === TO_STRING_PROP) {
        return () => String(currentValue)
      }
      if (prop === TO_JSON_PROP) {
        return () => currentValue
      }

      return undefined
    },

    // For property checks (like 'length' in array)
    has(_target, prop) {
      if (prop === STATE_SIGNAL) return true
      // Performance: Read value once
      const currentValue = sig.value
      // Performance: Early return for null
      if (currentValue === null) return false
      // Performance: Type check once
      return typeof currentValue === 'object' && prop in (currentValue as object)
    },

    // For Object.keys, for...in loops
    ownKeys(_target) {
      // Performance: Read value once
      const currentValue = sig.value
      // Performance: Early return for null
      if (currentValue === null) return []
      // Performance: Type check once
      if (typeof currentValue === 'object') {
        return Reflect.ownKeys(currentValue as object)
      }
      return []
    },

    getOwnPropertyDescriptor(_target, prop) {
      if (prop === STATE_SIGNAL) {
        return { configurable: true, enumerable: false, value: sig }
      }
      // Performance: Read value once
      const currentValue = sig.value
      // Performance: Early return for null
      if (currentValue === null) return undefined
      // Performance: Type check once
      if (typeof currentValue === 'object') {
        const desc = Object.getOwnPropertyDescriptor(currentValue as object, prop)
        if (desc) {
          // Make it configurable to satisfy Proxy invariants
          return { ...desc, configurable: true }
        }
      }
      return undefined
    },
  })

  // Cache the proxy for future reuse
  proxyCache.set(sig as Signal<unknown> | Computed<unknown>, proxy as StateValue<unknown>)

  return proxy as StateValue<T>
}

/** Async state status */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/** Options for state() */
export interface StateOptions<P = unknown> {
  /**
   * Key for global state sharing. Can be a string or array.
   * Array keys enable hierarchical namespacing - the first element acts as namespace.
   * @example
   * // Simple key (no namespace)
   * state('light', { key: 'theme' })
   * 
   * // Array key - first element is namespace
   * state('light', { key: ['ui', 'theme'] })  // namespace: 'ui'
   * state(null, { key: ['erp', 'inventory', 'products'] })  // namespace: 'erp'
   * state(null, { key: ['erp', 'sales', 'orders', orderId] })  // namespace: 'erp'
   * 
   * // Clear all states with a specific prefix
   * state.clearByPrefix(['erp', 'inventory'])  // Clears all 'erp.inventory.*' states
   */
  key?: StateKey
  /**
   * Parameters to pass to the function (for computed/async state).
   * Improves DX by making dependencies explicit.
   * @example
   * state(
   *   async ({ userId }) => fetch(`/api/users/${userId}`),
   *   { key: ['user', userId], params: { userId } }
   * )
   */
  params?: P
}

/**
 * Unified State API
 *
 * One function for all reactive state needs - always returns an array for consistency:
 * 1. Simple state: const [count, setCount] = state(0)
 * 2. Derived state: const [doubled] = state(() => count * 2)
 * 3. Async state: const [data, refetch, status, error] = state(async () => fetch(...))
 * 4. Global state: const [theme, setTheme] = state('light', { key: 'theme' })
 * 5. With params: const [user] = state(async (p) => fetch(`/api/${p.id}`), { params: { id } })
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
// Static methods interface for the state function
interface StateFunction {
  // Overloads
  <T>(initialValue: T, options?: StateOptions): [StateValue<T>, StateAction<T>]
  <T, P>(computeFn: (params: P) => T, options: StateOptions<P> & { params: P }): [StateValue<T>]
  <T>(computeFn: () => T, options?: StateOptions): [StateValue<T>]
  <T, P>(fetcher: (params: P) => Promise<T>, options: StateOptions<P> & { params: P }): [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]
  <T>(fetcher: () => Promise<T>, options?: StateOptions): [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]

  /** Delete a specific global state by key */
  delete: (key: StateKey) => boolean
  /** Clear all global states */
  clear: () => void
  /** Clear all states with a key prefix (array key) */
  clearByPrefix: (prefix: StateKey) => number
  /** Check if a global state exists */
  has: (key: StateKey) => boolean
  /** Current number of global states */
  readonly size: number
  /** Get statistics about global states */
  getStats: () => StateStats
  /** Get statistics for a specific namespace (via key prefix) */
  getNamespaceStats: (prefix: StateKey) => NamespaceStats
  /** Enable automatic cleanup of idle states */
  enableAutoCleanup: (config?: Partial<AutoCleanupConfig>) => void
  /** Disable automatic cleanup */
  disableAutoCleanup: () => void
  /** Check if auto-cleanup is enabled */
  readonly isAutoCleanupEnabled: boolean
}

// Overload 1: Value → [StateValue, Setter]
function state<T>(
  initialValue: T,
  options?: StateOptions
): [StateValue<T>, StateAction<T>]

// Overload 2: Sync function with params → [StateValue] (derived, no setter)
function state<T, P>(
  computeFn: (params: P) => T,
  options: StateOptions<P> & { params: P }
): [StateValue<T>]

// Overload 3: Sync function without params → [StateValue] (derived, no setter)
function state<T>(
  computeFn: () => T,
  options?: StateOptions
): [StateValue<T>]

// Overload 4: Async function with params → [StateValue, refetch, status, error]
function state<T, P>(
  fetcher: (params: P) => Promise<T>,
  options: StateOptions<P> & { params: P }
): [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]

// Overload 5: Async function without params → [StateValue, refetch, status, error]
function state<T>(
  fetcher: () => Promise<T>,
  options?: StateOptions
): [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]

function state<T, P = unknown>(
  initialValueOrFetcher: T | ((params?: P) => T) | ((params?: P) => Promise<T>),
  options?: StateOptions<P>
): [StateValue<T>] | [StateValue<T>, StateAction<T>] | [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>] {
  const rawKey = options?.key
  const key = rawKey ? serializeKey(rawKey) : undefined
  // Extract namespace from key: if key is array, first element is namespace
  const namespace = Array.isArray(rawKey) && rawKey.length > 0 
    ? String(rawKey[0]) 
    : undefined
  const params = options?.params

  // 0. Hook System - reuse state from previous render if inside a component
  if (currentComponent && !key) {
    const comp = currentComponent
    const hookIndex = comp.hookIndex++

    // Return existing hook if available
    if (hookIndex < comp.hooks.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return comp.hooks[hookIndex] as any
    }

    // Create new state and store in hooks array
    // Temporarily clear currentComponent to avoid infinite recursion
    const savedComponent = currentComponent
    currentComponent = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = state(initialValueOrFetcher as any, options as any)
    currentComponent = savedComponent

    comp.hooks.push(result)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any
  }

  // 1. Check Global Registry for keyed state
  if (key && globalStateRegistry.has(key)) {
    const cached = globalStateRegistry.get(key)!
    updateStateMetadata(key, namespace, cached._signal)
    const isAsync = 'loading' in cached && cached._stateActions?.refetch !== undefined
    const isComputed = cached._isComputed

    const proxy = createStateProxy(cached._signal as Signal<T>)

    if (isComputed) {
      return [proxy] as [StateValue<T>]
    }

    if (isAsync) {
      const refetch = cached._stateActions?.refetch || (() => { })
      // Performance: Use computed directly instead of state() to avoid recursion
      const statusComputed = computed<AsyncStatus>(() => {
        if (cached.error) return 'error'
        if (cached.loading) return 'loading'
        if (cached.value !== undefined) return 'success'
        return 'idle'
      })
      const errorComputed = computed<unknown>(() => cached.error)
      const statusValue = createStateProxy(statusComputed)
      const errorValue = createStateProxy(errorComputed)
      return [proxy, refetch, statusValue, errorValue] as [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]
    }

    const setter: StateAction<T> = (newValue) => {
      if (typeof newValue === 'function') {
        cached.value = (newValue as (prev: T) => T)(cached.peek() as T)
      } else {
        cached.value = newValue
      }
    }
    return [proxy, setter] as [StateValue<T>, StateAction<T>]
  }

  // 2. Handle function input (computed or async)
  if (typeof initialValueOrFetcher === 'function') {
    const originalFn = initialValueOrFetcher as (params?: P) => T | Promise<T>
    
    // Performance: Avoid function wrapping when params is undefined
    // Reuse original function directly to avoid closure overhead
    const fn = params !== undefined
      ? () => originalFn(params)
      : (originalFn as () => T | Promise<T>)

    // Try to detect if it's async by checking constructor name
    // This handles `async () => ...` functions
    const isAsyncFn = originalFn.constructor.name === 'AsyncFunction'

    if (isAsyncFn) {
      // Async function → Resource
      const [res, resActions] = createResource(fn, async (val) => val)
      const s = toStateObject(res, resActions)

      if (key) {
        globalStateRegistry.set(key, s)
        updateStateMetadata(key, namespace, s._signal)
        checkRegistrySize()
      }

      const proxy = createStateProxy(s._signal as Signal<T>)
      // Performance: Use computed directly instead of state() to avoid recursion
      const statusComputed = computed<AsyncStatus>(() => {
        if (s.error) return 'error'
        if (s.loading) return 'loading'
        if (s.value !== undefined) return 'success'
        return 'idle'
      })
      const errorComputed = computed<unknown>(() => s.error)
      const statusValue = createStateProxy(statusComputed)
      const errorValue = createStateProxy(errorComputed)

      return [proxy, resActions.refetch, statusValue, errorValue] as [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]
    }

    // Sync function → Computed
    // First, try running to check if it returns a Promise (for non-async functions that return Promise)
    let testResult: T | Promise<T>
    try {
      testResult = fn()
    } catch {
      // If it throws during initial call, treat as computed (will throw on access)
      const comp = computed(fn as () => T)
      const s = toComputedStateObject(comp)
      if (key) {
        globalStateRegistry.set(key, s)
        updateStateMetadata(key, namespace, s._signal)
        checkRegistrySize()
      }
      return [createStateProxy(comp)] as [StateValue<T>]
    }

    if (testResult instanceof Promise) {
      // It's a Promise-returning function → Resource
      const [res, resActions] = createResource(fn, async (val) => val)
      const s = toStateObject(res, resActions)

      if (key) {
        globalStateRegistry.set(key, s)
        updateStateMetadata(key, namespace, s._signal)
        checkRegistrySize()
      }

      const proxy = createStateProxy(s._signal as Signal<T>)
      // Performance: Use computed directly instead of state() to avoid recursion
      const statusComputed = computed<AsyncStatus>(() => {
        if (s.error) return 'error'
        if (s.loading) return 'loading'
        if (s.value !== undefined) return 'success'
        return 'idle'
      })
      const errorComputed = computed<unknown>(() => s.error)
      const statusValue = createStateProxy(statusComputed)
      const errorValue = createStateProxy(errorComputed)

      return [proxy, resActions.refetch, statusValue, errorValue] as [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]
    }

    // Sync function → Computed (memoized derived value)
      const comp = computed(fn as () => T)
      const s = toComputedStateObject(comp)
      if (key) {
        globalStateRegistry.set(key, s)
        updateStateMetadata(key, namespace, s._signal)
        checkRegistrySize()
      }
      return [createStateProxy(comp)] as [StateValue<T>]
  }

  // 3. Plain value → Signal with setter
  const sig = signal<T>(initialValueOrFetcher)
  const s = toSignalStateObject(sig)

  if (key) {
    globalStateRegistry.set(key, s)
    updateStateMetadata(key, namespace)
    checkRegistrySize()
  }

  const proxy = createStateProxy(sig)
  const setter: StateAction<T> = (newValue) => {
    if (typeof newValue === 'function') {
      sig.value = (newValue as (prev: T) => T)(sig.peek())
    } else {
      sig.value = newValue
    }
  }

  return [proxy, setter] as [StateValue<T>, StateAction<T>]
}

/**
 * Delete a specific global state by key
 * @param key - The key of the state to delete
 * @returns true if the state was deleted, false if it didn't exist
 *
 * @example
 * ```ts
 * state.delete('theme')
 * state.delete(['user', 'profile', userId])
 * ```
 */
state.delete = function (key: StateKey): boolean {
  const serializedKey = serializeKey(key)
  const metadata = stateMetadata.get(serializedKey)
  
  if (metadata?.namespace) {
    unregisterStateFromNamespace(serializedKey, metadata.namespace)
  }
  
  stateMetadata.delete(serializedKey)
  return globalStateRegistry.delete(serializedKey)
}

/**
 * Clear all global states (useful for testing or resetting app)
 *
 * @example
 * ```ts
 * state.clear()
 * ```
 */
state.clear = function (): void {
  globalStateRegistry.clear()
  namespaceRegistry.clear()
  stateMetadata.clear()
  hasWarnedAboutSize = false
}

/**
 * Check if a global state exists
 * @param key - The key to check
 * @returns true if the state exists
 *
 * @example
 * ```ts
 * if (state.has('theme')) { ... }
 * ```
 */
state.has = function (key: StateKey): boolean {
  const serializedKey = serializeKey(key)
  return globalStateRegistry.has(serializedKey)
}

/**
 * Clear all states with a key prefix
 * Works with array keys - clears all states that start with the given prefix
 * @param prefix - The key prefix to match (string or array)
 * @returns Number of states cleared
 *
 * @example
 * ```ts
 * // Clear all states with 'erp' namespace
 * state.clearByPrefix(['erp'])
 * 
 * // Clear all states with 'erp.inventory' prefix
 * state.clearByPrefix(['erp', 'inventory'])
 * 
 * // Clear all states with 'ui.theme' prefix
 * state.clearByPrefix(['ui', 'theme'])
 * ```
 */
state.clearByPrefix = function (prefix: StateKey): number {
  const prefixStr = serializeKey(prefix)
  let cleared = 0
  const keysToDelete: string[] = []

  // Find all keys that start with the prefix
  // For array keys serialized as JSON: ["ui"] -> '["ui"]', ["ui","theme"] -> '["ui","theme"]'
  // prefix ["ui"] should match ["ui","theme"], ["ui","locale"], etc.
  for (const [key, metadata] of stateMetadata.entries()) {
    // For exact match
    if (key === prefixStr) {
      keysToDelete.push(key)
      continue
    }
    
    // For prefix match: remove closing bracket and check if key continues with comma
    // prefix ["ui"] -> '["ui"]', we want to match '["ui","theme"]'
    // So we check if key starts with '["ui"' (without closing bracket) followed by ','
    if (prefixStr.endsWith(']')) {
      const prefixWithoutBracket = prefixStr.slice(0, -1) // Remove ']'
      if (key.startsWith(prefixWithoutBracket) && key.length > prefixWithoutBracket.length) {
        const nextChar = key[prefixWithoutBracket.length]
        // Next char should be ',' (continuing array) or ']' (exact match already handled)
        if (nextChar === ',') {
          keysToDelete.push(key)
        }
      }
    } else {
      // String key prefix match
      if (key.startsWith(prefixStr)) {
        keysToDelete.push(key)
      }
    }
  }

  // Delete found keys
  for (const key of keysToDelete) {
    const metadata = stateMetadata.get(key)
    if (metadata?.namespace) {
      unregisterStateFromNamespace(key, metadata.namespace)
    }
    stateMetadata.delete(key)
    if (globalStateRegistry.delete(key)) {
      cleared++
    }
  }

  return cleared
}

/**
 * Get statistics about global states
 * @returns Statistics object with total count, namespace breakdown, etc.
 *
 * @example
 * ```ts
 * const stats = state.getStats()
 * console.log(`Total states: ${stats.total}`)
 * console.log(`By namespace:`, stats.byNamespace)
 * ```
 */
state.getStats = function (): StateStats {
  const byNamespace: Record<string, number> = {}
  let totalAccessCount = 0

  for (const [namespace, keys] of namespaceRegistry.entries()) {
    byNamespace[namespace] = keys.size
  }

  for (const metadata of stateMetadata.values()) {
    totalAccessCount += metadata.accessCount
  }

  const topNamespaces = Object.entries(byNamespace)
    .map(([namespace, count]) => ({ namespace, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const averageAccessCount =
    stateMetadata.size > 0 ? totalAccessCount / stateMetadata.size : 0

  return {
    total: globalStateRegistry.size,
    byNamespace,
    topNamespaces,
    averageAccessCount,
  }
}

/**
 * Get statistics for a specific namespace (extracted from key prefix)
 * @param prefix - The key prefix to get statistics for (string or array)
 * @returns Statistics object for the namespace
 *
 * @example
 * ```ts
 * // Get stats for 'erp' namespace
 * const stats = state.getNamespaceStats(['erp'])
 * console.log(`ERP has ${stats.count} states`)
 * 
 * // Get stats for 'erp.inventory' prefix
 * const stats = state.getNamespaceStats(['erp', 'inventory'])
 * ```
 */
state.getNamespaceStats = function (prefix: StateKey): NamespaceStats {
  const prefixStr = serializeKey(prefix)
  const namespace = Array.isArray(prefix) && prefix.length > 0 ? String(prefix[0]) : prefixStr
  const states: Array<{ key: string; accessCount: number; createdAt: number }> = []
  let totalAccessCount = 0

  // Find all keys that start with the prefix
  for (const [key, metadata] of stateMetadata.entries()) {
    // For exact match
    if (key === prefixStr) {
      states.push({
        key,
        accessCount: metadata.accessCount,
        createdAt: metadata.createdAt,
      })
      totalAccessCount += metadata.accessCount
      continue
    }
    
    // For prefix match: remove closing bracket and check if key continues with comma
    if (prefixStr.endsWith(']')) {
      const prefixWithoutBracket = prefixStr.slice(0, -1) // Remove ']'
      if (key.startsWith(prefixWithoutBracket) && key.length > prefixWithoutBracket.length) {
        const nextChar = key[prefixWithoutBracket.length]
        // Next char should be ',' (continuing array)
        if (nextChar === ',') {
          states.push({
            key,
            accessCount: metadata.accessCount,
            createdAt: metadata.createdAt,
          })
          totalAccessCount += metadata.accessCount
        }
      }
    } else {
      // String key prefix match
      if (key.startsWith(prefixStr)) {
        states.push({
          key,
          accessCount: metadata.accessCount,
          createdAt: metadata.createdAt,
        })
        totalAccessCount += metadata.accessCount
      }
    }
  }

  const count = states.length
  const averageAccessCount = count > 0 ? totalAccessCount / count : 0

  return {
    namespace,
    count,
    totalAccessCount,
    averageAccessCount,
    states,
  }
}

/**
 * Get the current number of global states
 */
Object.defineProperty(state, 'size', {
  get: () => globalStateRegistry.size,
  enumerable: true,
})

/**
 * Enable automatic cleanup
 */
state.enableAutoCleanup = enableAutoCleanup

/**
 * Disable automatic cleanup
 */
state.disableAutoCleanup = disableAutoCleanup

/**
 * Check if auto-cleanup is enabled
 */
Object.defineProperty(state, 'isAutoCleanupEnabled', {
  get: () => autoCleanupConfig.enabled,
  enumerable: true,
})

// Export with proper typing (cast to include static methods)
const _state = state as StateFunction
export { _state as state }

/**
 * Ref object type for DOM element references
 */
export interface RefObject<T> {
  current: T | null
}

/**
 * Create a ref object to hold a reference to a DOM element.
 * Use with the `ref` prop on JSX elements.
 *
 * @param initialValue - Initial value (typically null)
 * @returns A ref object with a `current` property
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const inputRef = ref<HTMLInputElement>(null)
 *
 *   const focusInput = () => {
 *     inputRef.current?.focus()
 *   }
 *
 *   return (
 *     <div>
 *       <input ref={inputRef} type="text" />
 *       <button onclick={focusInput}>Focus</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function ref<T>(initialValue: T | null): RefObject<T> {
  return { current: initialValue }
}


