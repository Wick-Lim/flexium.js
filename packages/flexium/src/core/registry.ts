/**
 * Global State Registry & Metadata
 * 
 * Manages global state registry, namespaces, metadata, and auto-cleanup
 */

import type { StateValue, StateAction, AsyncStatus, StateKey } from './state'

export interface RegistryEntry {
  proxy: StateValue<any>  // Proxy itself is the signal
  setter: StateAction<any> | undefined
  refetch?: () => void
  status?: StateValue<AsyncStatus>
  error?: StateValue<unknown>
  key?: string
  namespace?: string

  // Metadata for tracking
  createdAt: number
  lastAccessed: number
  accessCount: number
  referenceCount: number
}

export const globalStateRegistry = new Map<string, RegistryEntry>()
export const namespaceRegistry = new Map<string, Set<string>>()

export interface StateMetadata {
  key: string
  namespace?: string
  createdAt: number
  lastAccessed: number
  accessCount: number
  referenceCount: number
  signalRef?: WeakRef<any>
}

export const stateMetadata = new Map<string, StateMetadata>()

export interface AutoCleanupConfig {
  enabled: boolean
  maxIdleTime: number
  checkInterval: number
  minAccessCount: number
}

export let autoCleanupConfig: AutoCleanupConfig = {
  enabled: true,
  maxIdleTime: 5 * 60 * 1000,
  checkInterval: 60 * 1000,
  minAccessCount: 0,
}

let autoCleanupInterval: AnyInterval | null = null
type AnyInterval = ReturnType<typeof setInterval>

export function getAutoCleanupInterval(): AnyInterval | null {
  return autoCleanupInterval
}

export function setAutoCleanupInterval(interval: AnyInterval | null): void {
  autoCleanupInterval = interval
}

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
 * Helper Functions
 */
const keyCache = new WeakMap<readonly unknown[], string>()

export function serializeKey(key: StateKey): string {
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

export function registerStateInNamespace(key: string, namespace?: string): void {
  if (!namespace) return
  if (!namespaceRegistry.has(namespace)) namespaceRegistry.set(namespace, new Set())
  namespaceRegistry.get(namespace)!.add(key)
}

export function unregisterStateFromNamespace(key: string, namespace?: string): void {
  if (!namespace) return
  const set = namespaceRegistry.get(namespace)
  if (set) {
    set.delete(key)
    if (set.size === 0) namespaceRegistry.delete(namespace)
  }
}

export function updateStateMetadata(key: string, namespace?: string, signalRefTarget?: any): void {
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

// Callback to delete state - set by state.ts to avoid circular dependency
let deleteStateCallback: ((key: string) => boolean) | null = null

export function setDeleteStateCallback(callback: (key: string) => boolean): void {
  deleteStateCallback = callback
}

export function performAutoCleanup(): void {
  if (!autoCleanupConfig.enabled || !deleteStateCallback) return
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
    deleteStateCallback(key)
  }

  if (keysToRemove.length > 0 && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.log(`[Flexium] Auto-cleaned ${keysToRemove.length} idle states`)
  }
}

export function getHasWarnedAboutSize(): boolean {
  return hasWarnedAboutSize
}

export function setHasWarnedAboutSize(value: boolean): void {
  hasWarnedAboutSize = value
}

export function getDevWarningThreshold(): number {
  return DEV_WARNING_THRESHOLD
}
