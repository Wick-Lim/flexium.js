/**
 * Global State Registry
 * 
 * 핵심: key 기반 전역 상태 저장소만 제공
 */

import type { StateValue, StateAction, AsyncStatus } from './state'

export interface RegistryEntry {
  proxy: StateValue<any>
  setter?: StateAction<any>
  refetch?: () => void
  status?: StateValue<AsyncStatus>
  error?: StateValue<unknown>
  key?: string
}

export const globalStateRegistry = new Map<string, RegistryEntry>()

const keyCache = new WeakMap<readonly unknown[], string>()

export function serializeKey(key: string | readonly (string | number | boolean | null | undefined | object)[]): string {
  if (typeof key === 'string') return key
  const cached = keyCache.get(key)
  if (cached !== undefined) return cached
  try {
    const serialized = JSON.stringify(key)
    keyCache.set(key, serialized)
    return serialized
  } catch {
    return String(key)
  }
}

let deleteStateCallback: ((key: string) => boolean) | null = null

export function setDeleteStateCallback(callback: (key: string) => boolean): void {
  deleteStateCallback = callback
}
