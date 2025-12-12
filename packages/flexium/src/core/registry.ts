/**
 * Global State Registry
 * 
 * 이 파일의 역할:
 * 1. 전역 상태 레지스트리 (globalStateRegistry)
 * 2. Key 직렬화 (serializeKey)
 * 3. Key 기반 상태 조회/저장
 * 
 * 핵심 원리:
 * - key를 사용하여 전역 상태를 저장하고 조회
 * - 같은 key로 state()를 호출하면 같은 상태 반환
 * 
 * 다른 파일과의 관계:
 * - state.ts: globalStateRegistry 사용 (전역 상태 저장)
 * - state.ts의 타입만 import (순환 참조 방지)
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
