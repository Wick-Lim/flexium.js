/**
 * Main State API
 * 
 * Unified state() function that handles all state patterns:
 * - Local state (like useState)
 * - Global state (like Recoil atoms)
 * - Async resources (like React Query)
 * - Computed values (like selectors)
 */

import { createResource } from './signal'
import { createSignalProxy, createComputedProxy, getProxyFromStateValue } from './proxy'
import { getCurrentComponent, setCurrentComponent } from './component'
import {
  globalStateRegistry,
  namespaceRegistry,
  stateMetadata,
  serializeKey,
  registerStateInNamespace,
  unregisterStateFromNamespace,
  updateStateMetadata,
  performAutoCleanup,
  getHasWarnedAboutSize,
  setHasWarnedAboutSize,
  getDevWarningThreshold,
  getAutoCleanupInterval,
  setAutoCleanupInterval,
  setDeleteStateCallback,
  autoCleanupConfig,
  type RegistryEntry,
  type AutoCleanupConfig
} from './registry'

/** Symbol to identify StateProxy and access underlying signal */
export const STATE_SIGNAL = Symbol.for('flexium.stateSignal')

/**
 * Main State API Types
 */
export type StateKey = string | readonly (string | number | boolean | null | undefined | object)[]
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

// Helper to get the underlying proxy from a StateValue
export function getStateSignal(stateValue: unknown): any {
  return getProxyFromStateValue(stateValue)
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
  const currentComponent = getCurrentComponent()
  if (currentComponent && !options?.key) {
    const comp = currentComponent
    const hookIndex = comp.hookIndex++
    if (hookIndex < comp.hooks.length) return comp.hooks[hookIndex]
    const saved = currentComponent
    setCurrentComponent(null)
    const res = state(initialValueOrFetcher as any, options as any)
    setCurrentComponent(saved)
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
    updateStateMetadata(key, namespace, entry.proxy)

    const result = [entry.proxy]
    if (entry.setter) result.push(entry.setter)
    if (entry.refetch) result.push(entry.refetch)
    if (entry.status) result.push(entry.status)
    if (entry.error) result.push(entry.error)

    return result
  }

  // Logic - Create proxies directly
  let proxy: StateValue<T>
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
      // Resource - TODO: createResource도 Proxy 기반으로 변경 필요
      const [res, actions] = createResource(fn as any, async (v) => v)
      refetch = actions.refetch

      // Create computed proxy for resource value
      proxy = createComputedProxy(() => res.value, key) as any

      // Status Computed
      statusProxy = createComputedProxy(() => res.loading ? 'loading' : res.error ? 'error' : res.state === 'unresolved' ? 'idle' : 'success', key) as any

      // Error Computed
      errorProxy = createComputedProxy(() => res.error, key) as any
    } else {
      // Computed
      proxy = createComputedProxy(fn as any, key) as any
    }
  } else {
    // Signal - create proxy directly
    proxy = createSignalProxy(initialValueOrFetcher, key)
    setter = (newValue: any) => {
      const proxySignal = (proxy as any)[STATE_SIGNAL]
      if (typeof newValue === 'function') {
        proxySignal.set(newValue(proxySignal.peek()))
      } else {
        proxySignal.set(newValue)
      }
    }
  }

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
      proxy, setter, refetch, status: statusProxy, error: errorProxy,
      createdAt: Date.now(), lastAccessed: Date.now(), accessCount: 1, referenceCount: 1,
      key, namespace
    })

    updateStateMetadata(key, namespace, proxy)

    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
    if (isDev && !getHasWarnedAboutSize() && globalStateRegistry.size >= getDevWarningThreshold()) {
      setHasWarnedAboutSize(true)
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
  setHasWarnedAboutSize(false)
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
state.enableAutoCleanup = (c) => {
  Object.assign(autoCleanupConfig, c, { enabled: true })
  const interval = getAutoCleanupInterval()
  if (interval) clearInterval(interval)
  const newInterval = setInterval(performAutoCleanup, autoCleanupConfig.checkInterval)
  setAutoCleanupInterval(newInterval)
}
state.disableAutoCleanup = () => {
  autoCleanupConfig.enabled = false
  const interval = getAutoCleanupInterval()
  if (interval) clearInterval(interval)
  setAutoCleanupInterval(null)
}
Object.defineProperty(state, 'isAutoCleanupEnabled', { get: () => autoCleanupConfig.enabled, enumerable: true })

// Set delete callback to avoid circular dependency
setDeleteStateCallback((key: string) => state.delete(key))

export { state }

export interface RefObject<T> { current: T | null }
export function ref<T>(initial: T | null): RefObject<T> { return { current: initial } }
