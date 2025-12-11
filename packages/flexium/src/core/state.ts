import { SignalNode, ComputedNode, createResource } from './signal'



/** Symbol to identify StateProxy and access underlying signal */
export const STATE_SIGNAL = Symbol.for('flexium.stateSignal')

/**
 * ------------------------------------------------------------------
 * Hybrid Proxy Architecture: Support Types
 * ------------------------------------------------------------------
 */

/**
 * A "Box" is any object with a `value` property.
 * It serves as the stable target for our Proxy.
 */
interface Box<T> {
  get(): T
  set?(value: T): void
  peek(): T
}

/**
 * Dependency Map: Stores signals for object properties.
 * Key: Target Object (The inner value, OR the Box itself)
 * Value: Map<PropertyKey, Signal>
 */
// Need to allow getDep to access SignalNode methods
const depMap = new WeakMap<object, Map<string | symbol, SignalNode<unknown>>>()
const boxToKeyMap = new WeakMap<object, string>()
const targetBoxMap = new WeakMap<object, Box<any>>()

function getDep(target: object, key: string | symbol, initialValue?: unknown): SignalNode<unknown> {
  let deps = depMap.get(target)
  if (!deps) {
    deps = new Map()
    depMap.set(target, deps)
  }
  let dep = deps.get(key)
  if (!dep) {
    const currentVal = initialValue !== undefined ? initialValue : Reflect.get(target, key)
    dep = new SignalNode(currentVal)
    deps.set(key, dep)
  }
  return dep
}

/**
 * ------------------------------------------------------------------
 * Hybrid Proxy Handler
 * ------------------------------------------------------------------
 */
const hybridHandlers: ProxyHandler<Box<any>> = {
  get(target, prop) {
    const box = targetBoxMap.get(target)!
    if (prop === STATE_SIGNAL) return box

    // Access Tracking
    const key = boxToKeyMap.get(box)
    if (key) updateStateMetadata(key)

    if (prop === 'peek') {
      return box.peek.bind(box)
    }

    // Reactivity for the Root Value
    // Reactivity for the Root Value
    const isSignalLike = typeof (box as any).peek === 'function' && typeof (box as any).get === 'function'
    let innerValue: any

    if (isSignalLike) {
      innerValue = box.get()
    } else {
      getDep(box, 'value') // Should not happen if box is always a Node
      innerValue = box.get()
    }

    if (prop === Symbol.toPrimitive || prop === 'valueOf') {
      return () => innerValue
    }

    if (prop === Symbol.iterator) {
      // Track iteration
      getDep(innerValue, 'length').get()
      getDep(innerValue, 'iterate').get()
      return (innerValue as any)[Symbol.iterator].bind(innerValue)
    }

    // Recursive Forwarding
    if (innerValue !== null && typeof innerValue === 'object') {
      const val = Reflect.get(innerValue, prop)

      if (typeof val === 'function') {
        // Special handling for Array mutation methods
        if (Array.isArray(innerValue) && ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop as string)) {
          return function (...args: any[]) {
            const result = (val as Function).apply(innerValue, args)
            // If innerValue is the root value of the box:
            if (innerValue === box.get()) {
              const dep = getDep(box, 'value')
              dep.set(innerValue) // force notify even if value is same object
            }

            // Arrays are tricky. We usually subscribe to 'iterate' or 'length'.
            // Notify length
            getDep(innerValue, 'length').set(innerValue.length)

            // Also notify 'iterate' key which `ownKeys` uses?
            // Or just force notify 'value' if it's the root.
            if (innerValue === box.get()) {
              getDep(box, 'value').get()
            }

            return result
          }
        }
        if (Array.isArray(innerValue)) {
          // Fix for .concat(): Array.prototype.concat treats proxies as objects unless Symbol.isConcatSpreadable is handled,
          // OR we bind to the raw array so it doesn't see the proxy.
          // But binding to 'receiver' (the proxy) is usually correct for other methods.
          // However, for .concat, we likely want the raw array behavior or correct proxy handling.
          // Simple fix: bind to innerValue (raw array) for non-mutating methods too, 
          // or at least for concat if it causes issues.
          // .map, .filter etc return new arrays, so binding to innerValue is fine.
          return (val as Function).bind(innerValue)
        }
        return (innerValue as any)[prop].bind(innerValue)
      }

      getDep(innerValue, prop, val).get()

      if (val !== null && typeof val === 'object') {
        return createNestedProxy(val)
      }
      return val
    }

    const val = (innerValue as any)[prop]
    return typeof val === 'function' ? val.bind(innerValue) : val
  },

  set(target, prop, newValue) {
    const box = targetBoxMap.get(target)!
    const innerValue = box.get()
    if (innerValue !== null && typeof innerValue === 'object') {
      const success = Reflect.set(innerValue, prop, newValue)
      getDep(innerValue, prop).set(newValue)
      return success
    }
    return false
  },

  has(target, prop) {
    const box = targetBoxMap.get(target)!
    if (prop === STATE_SIGNAL) return true
    const innerValue = box.get()
    if (innerValue === null) return false
    if (typeof innerValue === 'object') {
      return Reflect.has(innerValue, prop)
    }
    return false // primitives don't have own properties usually, but 'toFixed' is in proto
  },

  ownKeys(target) {
    const box = targetBoxMap.get(target)!
    const innerValue = box.get()

    if (innerValue === null || typeof innerValue !== 'object') {
      return Reflect.ownKeys(target)
    }

    // Arrays need special handling for iteration
    if (Array.isArray(innerValue)) {
      getDep(innerValue, 'length').get()
      getDep(innerValue, 'iterate').get()
    } else {
      // Objects 
      getDep(innerValue, 'iterate').get()
    }

    return Reflect.ownKeys(innerValue)
  },

  getOwnPropertyDescriptor(target, prop) {
    const box = targetBoxMap.get(target)!
    if (prop === STATE_SIGNAL) {
      return { configurable: true, enumerable: false, value: box }
    }
    const innerValue = box.get()

    if (innerValue === null || typeof innerValue !== 'object') {
      return undefined
    }

    const desc = Reflect.getOwnPropertyDescriptor(innerValue, prop)
    if (desc) {
      desc.configurable = true
    }
    return desc
  }
}

const nestedHandlers: ProxyHandler<object> = {
  get(target, prop, receiver) {
    if (prop === STATE_SIGNAL) return target
    const val = Reflect.get(target, prop, receiver)
    getDep(target, prop, val).get()
    if (val !== null && typeof val === 'object') {
      return createNestedProxy(val)
    }
    return val
  },
  set(target, prop, newValue, receiver) {
    const success = Reflect.set(target, prop, newValue, receiver)
    if (success) {
      getDep(target, prop).set(newValue)
    }
    return success
  },
  has(target, prop) {
    if (prop === STATE_SIGNAL) return true
    return Reflect.has(target, prop)
  }
}

const nestedProxyCache = new WeakMap<object, any>()

function createNestedProxy<T extends object>(target: T): T {
  let proxy = nestedProxyCache.get(target)
  if (!proxy) {
    proxy = new Proxy(target, nestedHandlers)
    nestedProxyCache.set(target, proxy)
  }
  return proxy
}

// Cache for Hybrid Proxies (keyed by Box/Signal)
const proxyCache = new WeakMap<object, any>()

function createHybridProxy<T>(box: Box<T>): StateValue<T> {
  let proxy = proxyCache.get(box)
  if (proxy) return proxy

  // The target is a function so that the proxy is callable `state()`, returns value.
  const target = () => box.get()
  targetBoxMap.set(target, box)
  // Object.assign(target, box) // REMOVED: Do not copy properties, prevents stale values

  proxy = new Proxy(target as any, hybridHandlers) as StateValue<T>
  proxyCache.set(box, proxy)
  return proxy
}

/**
 * ------------------------------------------------------------------
 * Component Hook System
 * ------------------------------------------------------------------
 */
interface ComponentInstance {
  id: symbol
  hookIndex: number
  hooks: unknown[]
}

let currentComponent: ComponentInstance | null = null

export function setCurrentComponent(instance: ComponentInstance | null): void {
  currentComponent = instance
}

export function getCurrentComponent(): ComponentInstance | null {
  return currentComponent
}

export function createComponentInstance(): ComponentInstance {
  return {
    id: Symbol('component'),
    hookIndex: 0,
    hooks: [],
  }
}

export function resetHookIndex(instance: ComponentInstance): void {
  instance.hookIndex = 0
}

/**
 * ------------------------------------------------------------------
 * Global State Registry & Metadata
 * ------------------------------------------------------------------
 */
interface RegistryEntry {
  box: Box<any>
  proxy: StateValue<any>
  setter: StateAction<any> | undefined
  refetch?: () => void
  status?: StateValue<AsyncStatus>
  error?: StateValue<unknown>
  key?: string
  namespace?: string

  // Keep compatibility with old StateObject for metadata utils
  // We can just add metadata fields here or map them
  createdAt: number
  lastAccessed: number
  accessCount: number
  referenceCount: number
}

const globalStateRegistry = new Map<string, RegistryEntry>()
const namespaceRegistry = new Map<string, Set<string>>()
// We'll store metadata directly in RegistryEntry for simplicity in this refactor
// OR keep existing `stateMetadata` map if we want to separate concerns.
// Let's reuse `stateMetadata` approach for less friction with existing utils.

interface StateMetadata {
  key: string
  namespace?: string
  createdAt: number
  lastAccessed: number
  accessCount: number
  referenceCount: number
  signalRef?: WeakRef<any>
}
const stateMetadata = new Map<string, StateMetadata>()

interface AutoCleanupConfig {
  enabled: boolean
  maxIdleTime: number
  checkInterval: number
  minAccessCount: number
}

let autoCleanupConfig: AutoCleanupConfig = {
  enabled: true,
  maxIdleTime: 5 * 60 * 1000,
  checkInterval: 60 * 1000,
  minAccessCount: 0,
}

let autoCleanupInterval: AnyInterval | null = null
type AnyInterval = ReturnType<typeof setInterval>

if (typeof window !== 'undefined' || typeof globalThis !== 'undefined') {
  setTimeout(() => {
    if (autoCleanupConfig.enabled && !autoCleanupInterval) {
      autoCleanupInterval = setInterval(performAutoCleanup, autoCleanupConfig.checkInterval)
      // Allow process to exit in Node.js environment even if interval is running
      if (autoCleanupInterval && typeof autoCleanupInterval === 'object' && 'unref' in autoCleanupInterval && typeof autoCleanupInterval.unref === 'function') {
        (autoCleanupInterval as any).unref()
      }
    }
  }, 0)
}

const DEV_WARNING_THRESHOLD = 10000
let hasWarnedAboutSize = false

/**
 * ------------------------------------------------------------------
 * Helper Functions
 * ------------------------------------------------------------------
 */
export type StateKey = string | readonly (string | number | boolean | null | undefined | object)[]
const keyCache = new WeakMap<readonly unknown[], string>()

function serializeKey(key: StateKey): string {
  if (typeof key === 'string') return key
  const cached = keyCache.get(key)
  if (cached !== undefined) return cached
  try {
    const serialized = JSON.stringify(key)
    keyCache.set(key, serialized)
    return serialized
  } catch (error) {
    const fallback = String(key)
    return fallback
  }
}

function registerStateInNamespace(key: string, namespace?: string): void {
  if (!namespace) return
  if (!namespaceRegistry.has(namespace)) namespaceRegistry.set(namespace, new Set())
  namespaceRegistry.get(namespace)!.add(key)
}

function unregisterStateFromNamespace(key: string, namespace?: string): void {
  if (!namespace) return
  const set = namespaceRegistry.get(namespace)
  if (set) {
    set.delete(key)
    if (set.size === 0) namespaceRegistry.delete(namespace)
  }
}

function updateStateMetadata(key: string, namespace?: string, signalRefTarget?: any): void {
  const now = Date.now()
  const existing = stateMetadata.get(key)

  if (existing) {
    existing.lastAccessed = now
    existing.accessCount++
    existing.referenceCount++
    if (namespace && existing.namespace !== namespace) {
      if (existing.namespace) unregisterStateFromNamespace(key, existing.namespace)
      existing.namespace = namespace
      registerStateInNamespace(key, namespace)
    }
  } else {
    stateMetadata.set(key, {
      key,
      namespace,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      referenceCount: 1,
      signalRef: signalRefTarget && typeof WeakRef !== 'undefined' ? new WeakRef(signalRefTarget) : undefined
    })
    registerStateInNamespace(key, namespace)
  }
}

function performAutoCleanup(): void {
  if (!autoCleanupConfig.enabled) return
  const now = Date.now()
  const keysToRemove: string[] = []

  for (const [key, metadata] of stateMetadata.entries()) {
    if (metadata.signalRef && typeof WeakRef !== 'undefined') {
      const sig = metadata.signalRef.deref()
      if (!sig) {
        keysToRemove.push(key)
        continue
      }
    }
    const idleTime = now - metadata.lastAccessed
    if (idleTime > autoCleanupConfig.maxIdleTime && metadata.referenceCount === 0 && metadata.accessCount >= autoCleanupConfig.minAccessCount) {
      keysToRemove.push(key)
    }
  }

  for (const key of keysToRemove) {
    state.delete(key)
  }

  if (keysToRemove.length > 0 && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.log(`[Flexium] Auto-cleaned ${keysToRemove.length} idle states`)
  }
}

/**
 * ------------------------------------------------------------------
 * Main State API
 * ------------------------------------------------------------------
 */
export type StateAction<T> = (newValue: T | ((prev: T) => T)) => void
export type StateValue<T> = T & (() => T) & { peek(): T }
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'
export interface StateOptions<P = unknown> {
  key?: StateKey
  params?: P
}

export function isStateValue(value: unknown): boolean {
  // Hybrid proxies are functions
  return (typeof value === 'object' || typeof value === 'function') && value !== null && STATE_SIGNAL in value
}

// Helper to get the underlying signal from a StateValue
export function getStateSignal(stateValue: unknown): SignalNode<unknown> | ComputedNode<unknown> | null {
  if (isStateValue(stateValue)) return (stateValue as any)[STATE_SIGNAL]
  return null
}

export function equals<T>(stateValue: StateValue<T>, value: T): boolean {
  if (!isStateValue(stateValue)) return false
  return stateValue.peek() === value
}

export function isTruthy<T>(stateValue: StateValue<T>): boolean {
  if (!isStateValue(stateValue)) return false
  return Boolean(stateValue.peek())
}

export interface StateStats {
  total: number
  byNamespace: Record<string, number>
  topNamespaces: Array<{ namespace: string; count: number }>
  averageAccessCount: number
}

export interface NamespaceStats {
  namespace: string
  count: number
  totalAccessCount: number
  averageAccessCount: number
  states: Array<{ key: string; accessCount: number; createdAt: number }>
}

interface StateFunction {
  <T>(initialValue: T, options?: StateOptions): [StateValue<T>, StateAction<T>]
  <T, P>(computeFn: (params: P) => T, options: StateOptions<P> & { params: P }): [StateValue<T>]
  <T>(computeFn: () => T, options?: StateOptions): [StateValue<T>]
  <T, P>(fetcher: (params: P) => Promise<T>, options: StateOptions<P> & { params: P }): [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]
  <T>(fetcher: () => Promise<T>, options?: StateOptions): [StateValue<T | undefined>, () => void, StateValue<AsyncStatus>, StateValue<unknown>]

  delete: (key: StateKey) => boolean
  clear: () => void
  clearByPrefix: (prefix: StateKey) => number
  has: (key: StateKey) => boolean
  readonly size: number
  getStats: () => StateStats
  getNamespaceStats: (prefix: StateKey) => NamespaceStats
  enableAutoCleanup: (config?: Partial<AutoCleanupConfig>) => void
  disableAutoCleanup: () => void
  readonly isAutoCleanupEnabled: boolean
}

function stateImplementation<T, P = unknown>(
  initialValueOrFetcher: T | ((params?: P) => T) | ((params?: P) => Promise<T>),
  options?: StateOptions<P>
): any {
  // Hook System
  if (currentComponent && !options?.key) {
    const comp = currentComponent
    const hookIndex = comp.hookIndex++
    if (hookIndex < comp.hooks.length) return comp.hooks[hookIndex]
    const saved = currentComponent
    currentComponent = null
    const res = state(initialValueOrFetcher as any, options as any)
    currentComponent = saved
    comp.hooks.push(res)
    return res
  }

  // Key Serializing
  const rawKey = options?.key
  const key = rawKey ? serializeKey(rawKey) : undefined
  const namespace = Array.isArray(rawKey) && rawKey.length > 0 ? String(rawKey[0]) : undefined
  const params = options?.params

  // Check Registry
  if (key && globalStateRegistry.has(key)) {
    const entry = globalStateRegistry.get(key)!
    updateStateMetadata(key, namespace, entry.box)

    const result = [entry.proxy]
    if (entry.setter) result.push(entry.setter)
    if (entry.refetch) result.push(entry.refetch)
    if (entry.status) result.push(entry.status)
    if (entry.error) result.push(entry.error)

    return result
  }

  // Logic
  let box: Box<T>
  let setter: StateAction<T> | undefined
  let refetch: (() => void) | undefined
  let statusProxy: StateValue<AsyncStatus> | undefined
  let errorProxy: StateValue<unknown> | undefined

  if (typeof initialValueOrFetcher === 'function') {
    const originalFn = initialValueOrFetcher as Function
    const fn = params !== undefined ? () => originalFn(params) : originalFn

    let testResult: any
    try { testResult = fn() } catch (e) { /* treat as computed */ }

    const isAsync = originalFn.constructor.name === 'AsyncFunction' || testResult instanceof Promise

    if (isAsync) {
      // Resource
      const [res, actions] = createResource(fn as any, async (v) => v)
      // Resources in flexium/signal are still using the wrapper API for now (unless refactored too).
      // Assuming createResource still returns { value: ... } style object which we can wrap or adapt.
      // Wait, createResource returns [Resource<T>, actions]. 
      // Resource<T> extends Signal<T>. It has .value.
      // But our Box expects .get()/.peek().
      // Adapter Box:
      const resBox: Box<any> = {
        get: () => res.value,
        peek: () => res.peek(),
        // Resources are read-only-ish via this box for the user, actions used for mutations
      }
      box = resBox
      refetch = actions.refetch

      // Status Computed
      const statusComp = new ComputedNode(() => res.loading ? 'loading' : res.error ? 'error' : res.state === 'unresolved' ? 'idle' : 'success')
      statusProxy = createHybridProxy(statusComp as any) as any

      // Error Computed
      const errorComp = new ComputedNode(() => res.error)
      errorProxy = createHybridProxy(errorComp as any) as any
    } else {
      // Computed
      box = new ComputedNode(fn as any) as any
    }
  } else {
    // Signal
    const node = new SignalNode(initialValueOrFetcher)
    box = node as any
    setter = (newValue: any) => {
      if (typeof newValue === 'function') {
        node.set(newValue(node.peek()))
      } else {
        node.set(newValue)
      }
    }
  }

  const proxy = createHybridProxy(box)

  const result: any[] = [proxy]
  if (setter) result.push(setter)
  if (refetch) {
    result.splice(1, 0, refetch) // [proxy, refetch, status, error]
    if (statusProxy) result.push(statusProxy)
    if (errorProxy) result.push(errorProxy)
  }

  // Register
  if (key) {
    globalStateRegistry.set(key, {
      box, proxy, setter, refetch, status: statusProxy, error: errorProxy,
      createdAt: Date.now(), lastAccessed: Date.now(), accessCount: 1, referenceCount: 1,
      key, namespace
    })

    // Map box to key for access tracking
    boxToKeyMap.set(box, key)

    updateStateMetadata(key, namespace, box)

    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
    if (isDev && !hasWarnedAboutSize && globalStateRegistry.size >= DEV_WARNING_THRESHOLD) {
      hasWarnedAboutSize = true
      console.warn(`[Flexium] Registry size warning: ${globalStateRegistry.size}`)
    }
  }

  return result
}

const state = stateImplementation as StateFunction

// Static Methods
state.delete = function (key: StateKey): boolean {
  const sKey = serializeKey(key)
  const meta = stateMetadata.get(sKey)
  if (meta?.namespace) unregisterStateFromNamespace(sKey, meta.namespace)
  stateMetadata.delete(sKey)
  return globalStateRegistry.delete(sKey)
}

state.clear = function (): void {
  globalStateRegistry.clear()
  namespaceRegistry.clear()
  stateMetadata.clear()
  hasWarnedAboutSize = false
}

state.has = function (key: StateKey): boolean {
  return globalStateRegistry.has(serializeKey(key))
}

state.clearByPrefix = function (prefix: StateKey): number {
  const prefixStr = serializeKey(prefix)
  let cleared = 0
  const keysToDelete: string[] = []

  for (const [key] of stateMetadata.entries()) {
    if (key === prefixStr) { keysToDelete.push(key); continue }
    if (prefixStr.endsWith(']')) {
      const raw = prefixStr.slice(0, -1)
      if (key.startsWith(raw) && key.length > raw.length && key[raw.length] === ',') keysToDelete.push(key)
    } else {
      if (key.startsWith(prefixStr)) keysToDelete.push(key)
    }
  }

  for (const k of keysToDelete) {
    if (state.delete(k)) cleared++
  }
  return cleared
}

state.getStats = function (): StateStats {
  const byNamespace: Record<string, number> = {}
  for (const [ns, keys] of namespaceRegistry.entries()) byNamespace[ns] = keys.size

  let totalAccess = 0
  for (const m of stateMetadata.values()) totalAccess += m.accessCount

  return {
    total: globalStateRegistry.size,
    byNamespace,
    topNamespaces: Object.entries(byNamespace).map(([n, c]) => ({ namespace: n, count: c })).sort((a, b) => b.count - a.count).slice(0, 10),
    averageAccessCount: stateMetadata.size ? totalAccess / stateMetadata.size : 0
  }
}

state.getNamespaceStats = function (prefix: StateKey): NamespaceStats {
  const pStr = serializeKey(prefix)
  const ns = Array.isArray(prefix) && prefix.length > 0 ? String(prefix[0]) : pStr
  const states: any[] = []
  let totalAccess = 0

  for (const [key, m] of stateMetadata.entries()) {
    let matched = false

    if (key === pStr) {
      matched = true
    } else if (pStr.endsWith(']')) {
      const raw = pStr.slice(0, -1)
      if (key.startsWith(raw) && key.length > raw.length && key[raw.length] === ',') {
        matched = true
      }
    } else {
      if (key.startsWith(pStr)) matched = true
    }

    if (matched) {
      states.push({ key, accessCount: m.accessCount, createdAt: m.createdAt })
      totalAccess += m.accessCount
    }
  }
  return {
    namespace: ns, count: states.length, totalAccessCount: totalAccess,
    averageAccessCount: states.length ? totalAccess / states.length : 0,
    states
  }
}

Object.defineProperty(state, 'size', { get: () => globalStateRegistry.size, enumerable: true })
state.enableAutoCleanup = (c) => { Object.assign(autoCleanupConfig, c, { enabled: true }); if (autoCleanupInterval) clearInterval(autoCleanupInterval); autoCleanupInterval = setInterval(performAutoCleanup, autoCleanupConfig.checkInterval) }
state.disableAutoCleanup = () => { autoCleanupConfig.enabled = false; if (autoCleanupInterval) clearInterval(autoCleanupInterval) }
Object.defineProperty(state, 'isAutoCleanupEnabled', { get: () => autoCleanupConfig.enabled, enumerable: true })

export { state }

export interface RefObject<T> { current: T | null }
export function ref<T>(initial: T | null): RefObject<T> { return { current: initial } }
