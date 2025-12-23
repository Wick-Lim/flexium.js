import type { FlexismState } from './types'
import { FLEXISM_STATE_KEY } from './types'
import { Stream, SendableStream } from './stream'

/**
 * Runtime state for SSR/hydration
 */
let isServer = typeof window === 'undefined'
let isHydrating = false
let signalIdCounter = 0
let collectedSignals: Map<string, unknown> = new Map()
let hydratedSignals: Map<string, unknown> | null = null

/**
 * Check if running on server
 */
export function getIsServer(): boolean {
  return isServer
}

/**
 * Check if currently hydrating
 */
export function getIsHydrating(): boolean {
  return isHydrating
}

/**
 * Set server mode (for testing)
 */
export function setIsServer(value: boolean): void {
  isServer = value
}

/**
 * Generate unique signal ID for SSR
 */
export function generateSignalId(): string {
  return `s${signalIdCounter++}`
}

/**
 * Reset signal counter (called at start of each render)
 */
export function resetSignalCounter(): void {
  signalIdCounter = 0
}

/**
 * Collect signal value during SSR
 */
export function collectSignal(id: string, value: unknown): void {
  if (isServer) {
    collectedSignals.set(id, value)
  }
}

/**
 * Get collected signals and reset
 */
export function getCollectedSignals(): Record<string, unknown> {
  const result = Object.fromEntries(collectedSignals)
  collectedSignals = new Map()
  return result
}

/**
 * Start hydration mode
 */
export function startHydration(state: FlexismState): void {
  isHydrating = true
  hydratedSignals = new Map(Object.entries(state.signals))
  signalIdCounter = 0
}

/**
 * End hydration mode
 */
export function endHydration(): void {
  isHydrating = false
  hydratedSignals = null
}

/**
 * Get hydrated signal value if available
 */
export function getHydratedSignal(id: string): unknown | undefined {
  return hydratedSignals?.get(id)
}

/**
 * Check if signal has hydrated value
 */
export function hasHydratedSignal(id: string): boolean {
  return hydratedSignals?.has(id) ?? false
}

/**
 * Load state from window object
 */
export function loadStateFromWindow(): FlexismState | null {
  if (typeof window !== 'undefined' && window[FLEXISM_STATE_KEY]) {
    return window[FLEXISM_STATE_KEY]
  }
  return null
}

/**
 * Create state script for embedding in HTML
 */
export function createStateScript(state: FlexismState): string {
  const json = JSON.stringify(state)
  return `<script>window.${FLEXISM_STATE_KEY}=${json}</script>`
}

/**
 * Serialize value for transfer (handles special cases)
 */
export function serializeValue(
  value: unknown,
  serializer?: (v: unknown) => unknown
): unknown {
  if (serializer) {
    return serializer(value)
  }

  // Handle special types
  if (value === undefined) return { __type: 'undefined' }
  if (value instanceof Date) return { __type: 'Date', value: value.toISOString() }
  if (value instanceof Map) return { __type: 'Map', value: Array.from(value.entries()) }
  if (value instanceof Set) return { __type: 'Set', value: Array.from(value) }

  // Regular JSON-serializable values
  return value
}

/**
 * Deserialize value from transfer
 */
export function deserializeValue(
  value: unknown,
  deserializer?: (v: unknown) => unknown
): unknown {
  if (deserializer) {
    return deserializer(value)
  }

  // Handle special types
  if (value && typeof value === 'object' && '__type' in value) {
    const typed = value as { __type: string; value?: unknown; options?: { sendable?: boolean } }
    switch (typed.__type) {
      case 'undefined': return undefined
      case 'Date': return new Date(typed.value as string)
      case 'Map': return new Map(typed.value as [unknown, unknown][])
      case 'Set': return new Set(typed.value as unknown[])
      // Restore streams from serialized data
      case 'flexism:stream':
        if (typed.options?.sendable) {
          return SendableStream.fromJSON(value)
        }
        return Stream.fromJSON(value)
      case 'flexism:streamref':
        return Stream.fromJSON(value)
      case 'flexism:sendablestreamref':
        return SendableStream.fromJSON(value)
    }
  }

  return value
}
