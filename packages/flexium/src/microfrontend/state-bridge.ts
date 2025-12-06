/**
 * Shared State Bridge
 *
 * Enables state sharing between micro frontend applications
 * with optional persistence and validation
 */

import { signal, effect, batch } from '../core/signal'
import type { SharedStateConfig } from './types'

/** Type for signal value */
type SignalValue<T> = {
  value: T
  peek: () => T
}

/** Shared state entry */
interface SharedStateEntry<T = unknown> {
  signal: SignalValue<T>
  config: SharedStateConfig
  subscribers: Set<string>
  lastUpdate: number
  version: number
}

/** Global registry of shared states */
const sharedStateRegistry = new Map<string, SharedStateEntry>()

/** Storage key prefix */
const STORAGE_PREFIX = 'flexium:shared:'

/** Current app name for tracking subscribers */
let currentAppName: string | null = null

/** Debug mode */
let debugMode = false

/**
 * Configure the state bridge
 */
export function configureStateBridge(config: {
  appName?: string
  debug?: boolean
}): void {
  if (config.appName) currentAppName = config.appName
  if (config.debug !== undefined) debugMode = config.debug
}

/**
 * Log debug messages
 */
function debug(message: string, ...args: unknown[]): void {
  if (debugMode) {
    console.log(`[StateBridge] ${message}`, ...args)
  }
}

/**
 * Create or get a shared state
 */
export function sharedState<T>(
  key: string,
  initialValue?: T,
  config: Partial<SharedStateConfig> = {}
): [() => T, (value: T | ((prev: T) => T)) => void] {
  const fullConfig: SharedStateConfig = {
    key,
    initialValue,
    persist: config.persist ?? false,
    storageKey: config.storageKey ?? key,
    validate: config.validate,
  }

  // Check if already exists
  if (sharedStateRegistry.has(key)) {
    const existing = sharedStateRegistry.get(key)!

    // Track subscriber
    if (currentAppName) {
      existing.subscribers.add(currentAppName)
    }

    const getter = () => existing.signal.value as T
    const setter = (value: T | ((prev: T) => T)) => {
      const newValue =
        typeof value === 'function'
          ? (value as (prev: T) => T)(existing.signal.value as T)
          : value

      // Validate if validator provided
      if (fullConfig.validate && !fullConfig.validate(newValue)) {
        console.warn(`[StateBridge] Validation failed for key "${key}"`, newValue)
        return
      }

      existing.signal.value = newValue
      existing.lastUpdate = Date.now()
      existing.version++

      // Persist if enabled
      if (existing.config.persist) {
        persistState(key, newValue)
      }

      debug(`State updated: ${key}`, newValue)
    }

    return [getter, setter]
  }

  // Load from storage if persist enabled
  let value = initialValue as T
  if (fullConfig.persist) {
    const stored = loadPersistedState<T>(fullConfig.storageKey!)
    if (stored !== null) {
      value = stored
    }
  }

  // Create new shared state
  const stateSignal = signal<T>(value)

  const entry: SharedStateEntry<T> = {
    signal: stateSignal as unknown as SignalValue<T>,
    config: fullConfig,
    subscribers: new Set(currentAppName ? [currentAppName] : []),
    lastUpdate: Date.now(),
    version: 0,
  }

  sharedStateRegistry.set(key, entry as SharedStateEntry)

  // Initial persist
  if (fullConfig.persist && value !== undefined) {
    persistState(key, value)
  }

  debug(`State created: ${key}`, value)

  const getter = () => stateSignal.value
  const setter = (newValue: T | ((prev: T) => T)) => {
    const resolved =
      typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(stateSignal.value)
        : newValue

    // Validate if validator provided
    if (fullConfig.validate && !fullConfig.validate(resolved)) {
      console.warn(`[StateBridge] Validation failed for key "${key}"`, resolved)
      return
    }

    stateSignal.value = resolved
    entry.lastUpdate = Date.now()
    entry.version++

    // Persist if enabled
    if (fullConfig.persist) {
      persistState(key, resolved)
    }

    debug(`State updated: ${key}`, resolved)
  }

  return [getter, setter]
}

/**
 * Persist state to storage
 */
function persistState<T>(key: string, value: T): void {
  try {
    const storageKey = STORAGE_PREFIX + key
    localStorage.setItem(storageKey, JSON.stringify(value))
  } catch (error) {
    console.warn(`[StateBridge] Failed to persist state "${key}":`, error)
  }
}

/**
 * Load persisted state from storage
 */
function loadPersistedState<T>(key: string): T | null {
  try {
    const storageKey = STORAGE_PREFIX + key
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      return JSON.parse(stored) as T
    }
  } catch (error) {
    console.warn(`[StateBridge] Failed to load persisted state "${key}":`, error)
  }
  return null
}

/**
 * Watch for changes to a shared state
 */
export function watchSharedState<T>(
  key: string,
  callback: (value: T, prevValue: T | undefined) => void
): () => void {
  const entry = sharedStateRegistry.get(key)
  if (!entry) {
    console.warn(`[StateBridge] Shared state "${key}" not found`)
    return () => {}
  }

  let prevValue: T | undefined

  const cleanup = effect(() => {
    const currentValue = entry.signal.value as T
    if (prevValue !== currentValue) {
      callback(currentValue, prevValue)
      prevValue = currentValue
    }
  })

  return cleanup
}

/**
 * Get shared state without creating
 */
export function getSharedState<T>(key: string): T | undefined {
  const entry = sharedStateRegistry.get(key)
  return entry?.signal.value as T | undefined
}

/**
 * Set shared state value
 */
export function setSharedState<T>(key: string, value: T): boolean {
  const entry = sharedStateRegistry.get(key)
  if (!entry) {
    console.warn(`[StateBridge] Shared state "${key}" not found`)
    return false
  }

  // Validate if validator provided
  if (entry.config.validate && !entry.config.validate(value)) {
    console.warn(`[StateBridge] Validation failed for key "${key}"`, value)
    return false
  }

  entry.signal.value = value
  entry.lastUpdate = Date.now()
  entry.version++

  if (entry.config.persist) {
    persistState(key, value)
  }

  debug(`State set: ${key}`, value)
  return true
}

/**
 * Delete a shared state
 */
export function deleteSharedState(key: string): boolean {
  const entry = sharedStateRegistry.get(key)
  if (!entry) return false

  // Remove from storage if persisted
  if (entry.config.persist) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } catch {
      // Ignore storage errors
    }
  }

  sharedStateRegistry.delete(key)
  debug(`State deleted: ${key}`)
  return true
}

/**
 * Get all shared state keys
 */
export function getSharedStateKeys(): string[] {
  return Array.from(sharedStateRegistry.keys())
}

/**
 * Get shared state metadata
 */
export function getSharedStateInfo(key: string): {
  exists: boolean
  subscribers: string[]
  lastUpdate: number
  version: number
  persisted: boolean
} | null {
  const entry = sharedStateRegistry.get(key)
  if (!entry) return null

  return {
    exists: true,
    subscribers: Array.from(entry.subscribers),
    lastUpdate: entry.lastUpdate,
    version: entry.version,
    persisted: entry.config.persist ?? false,
  }
}

/**
 * Clear all shared states
 */
export function clearAllSharedStates(): void {
  // Clear persisted states
  for (const entry of sharedStateRegistry.values()) {
    if (entry.config.persist) {
      try {
        localStorage.removeItem(STORAGE_PREFIX + entry.config.key)
      } catch {
        // Ignore storage errors
      }
    }
  }

  sharedStateRegistry.clear()
  debug('All states cleared')
}

/**
 * Create a namespaced state store
 */
export function createStateStore<T extends Record<string, unknown>>(
  namespace: string,
  initialState: T,
  options: { persist?: boolean } = {}
): {
  get: <K extends keyof T>(key: K) => T[K]
  set: <K extends keyof T>(key: K, value: T[K]) => void
  getAll: () => T
  setAll: (state: Partial<T>) => void
  subscribe: <K extends keyof T>(
    key: K,
    callback: (value: T[K], prev: T[K] | undefined) => void
  ) => () => void
  reset: () => void
} {
  // Initialize all states
  const stateMap = new Map<keyof T, ReturnType<typeof sharedState<T[keyof T]>>>()

  for (const [key, value] of Object.entries(initialState)) {
    const storeKey = `${namespace}:${key}`
    stateMap.set(key as keyof T, sharedState(storeKey, value as T[keyof T], {
      persist: options.persist,
    }))
  }

  return {
    get: <K extends keyof T>(key: K): T[K] => {
      const state = stateMap.get(key)
      if (!state) return initialState[key]
      return state[0]() as T[K]
    },

    set: <K extends keyof T>(key: K, value: T[K]): void => {
      const state = stateMap.get(key)
      if (state) {
        state[1](value)
      }
    },

    getAll: (): T => {
      const result = {} as T
      for (const [key] of stateMap) {
        result[key] = stateMap.get(key)![0]() as T[typeof key]
      }
      return result
    },

    setAll: (state: Partial<T>): void => {
      batch(() => {
        for (const [key, value] of Object.entries(state)) {
          const stateEntry = stateMap.get(key as keyof T)
          if (stateEntry) {
            stateEntry[1](value as T[keyof T])
          }
        }
      })
    },

    subscribe: <K extends keyof T>(
      key: K,
      callback: (value: T[K], prev: T[K] | undefined) => void
    ): (() => void) => {
      const storeKey = `${namespace}:${String(key)}`
      return watchSharedState<T[K]>(storeKey, callback)
    },

    reset: (): void => {
      batch(() => {
        for (const [key, value] of Object.entries(initialState)) {
          const stateEntry = stateMap.get(key as keyof T)
          if (stateEntry) {
            stateEntry[1](value as T[keyof T])
          }
        }
      })
    },
  }
}

/**
 * Sync state between multiple browser tabs/windows
 */
export function enableCrossTabSync(keys?: string[]): () => void {
  const handleStorageEvent = (event: StorageEvent): void => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) return

    const stateKey = event.key.slice(STORAGE_PREFIX.length)

    // Skip if not in whitelist
    if (keys && !keys.includes(stateKey)) return

    const entry = sharedStateRegistry.get(stateKey)
    if (!entry) return

    try {
      const newValue = event.newValue ? JSON.parse(event.newValue) : undefined
      if (newValue !== undefined) {
        entry.signal.value = newValue
        entry.lastUpdate = Date.now()
        entry.version++
        debug(`State synced from other tab: ${stateKey}`, newValue)
      }
    } catch (error) {
      console.warn(`[StateBridge] Failed to sync state "${stateKey}":`, error)
    }
  }

  window.addEventListener('storage', handleStorageEvent)

  return () => {
    window.removeEventListener('storage', handleStorageEvent)
  }
}

/**
 * Create a snapshot of all shared states
 */
export function createStateSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {}

  for (const [key, entry] of sharedStateRegistry) {
    snapshot[key] = entry.signal.value
  }

  return snapshot
}

/**
 * Restore states from a snapshot
 */
export function restoreStateSnapshot(snapshot: Record<string, unknown>): void {
  batch(() => {
    for (const [key, value] of Object.entries(snapshot)) {
      const entry = sharedStateRegistry.get(key)
      if (entry) {
        if (entry.config.validate && !entry.config.validate(value)) {
          console.warn(`[StateBridge] Validation failed during restore for key "${key}"`)
          continue
        }
        entry.signal.value = value
        entry.lastUpdate = Date.now()
        entry.version++
      }
    }
  })

  debug('State snapshot restored')
}
