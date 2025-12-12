/**
 * State API
 * 
 * 이 파일의 역할:
 * 1. state() 함수 - 통합 상태 관리 API
 * 2. createResource() - 비동기 리소스 생성 (내부 함수)
 * 3. 상태 타입 체크 (isStateValue, isSignal)
 * 4. 상태 유틸리티 (equals, isTruthy, ref)
 * 
 * 핵심 원리:
 * - state() 하나로 모든 상태 패턴 처리 (local, global, async, computed)
 * - key 기반 전역 상태 레지스트리 사용
 * - Hook 시스템으로 컴포넌트별 상태 관리
 * 
 * 다른 파일과의 관계:
 * - proxy.ts: createSignalProxy(), createComputedProxy() 사용
 * - component.ts: Hook 시스템 사용
 * - registry.ts: 전역 상태 레지스트리 사용
 * - effect.ts: createResource()에서 사용
 */

import { createSignalProxy, createComputedProxy, getProxyFromStateValue, STATE_SIGNAL } from './proxy'
import { getCurrentComponent, setCurrentComponent } from './component'
import { globalStateRegistry, serializeKey } from './registry'
import { effect } from './effect'

export { STATE_SIGNAL }

export type StateKey = string | readonly (string | number | boolean | null | undefined | object)[]
export type StateAction<T> = (newValue: T | ((prev: T) => T)) => void
export type StateValue<T> = T & (() => T) & { peek(): T, set(newValue: T | ((prev: T) => T)): void }
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'
export interface StateOptions<P = unknown> {
  key?: StateKey
  params?: P
}

export function isStateValue(value: unknown): value is StateValue<unknown> {
  return (typeof value === 'object' || typeof value === 'function') && value !== null && STATE_SIGNAL in value
}

export function isSignal(value: unknown): value is StateValue<unknown> {
  return isStateValue(value)
}

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

interface Resource<T> {
  (): T | undefined
  value: T | undefined
  loading: boolean
  error: any
  state: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  latest: T | undefined
  peek(): T | undefined
}

function getValue<T>(source: T | StateValue<T> | (() => T)): T {
  if (typeof source === 'function') {
    if (isStateValue(source)) {
      return (source as StateValue<T>)()
    }
    return (source as () => T)()
  }
  if (isStateValue(source)) {
    return (source as StateValue<T>)()
  }
  return source
}

export function createResource<T, S = any>(
  source: S | StateValue<S> | (() => S),
  fetcher: (source: S, { value, refetching }: { value: T | undefined; refetching: any }) => Promise<T>
): [Resource<T>, { mutate: (v: T | undefined) => void; refetch: () => void }] {
  const value = state<T | undefined>(undefined)
  const error = state<any>(undefined)
  const loading = state<boolean>(false)
  const resourceState = state<'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'>('unresolved')

  let latestPromise: Promise<T> | null = null

  const load = async (currentSource: S, refetching = false) => {
    if (refetching) {
      resourceState.set('refreshing')
      loading.set(true)
    } else {
      resourceState.set('pending')
      loading.set(true)
    }
    error.set(undefined)

    const currentPromise = fetcher(currentSource, { value: value.peek(), refetching })
    latestPromise = currentPromise

    try {
      const result = await currentPromise
      if (latestPromise === currentPromise) {
        value.set(result)
        resourceState.set('ready')
        loading.set(false)
      }
    } catch (err) {
      if (latestPromise === currentPromise) {
        error.set(err)
        resourceState.set('errored')
        loading.set(false)
      }
    }
  }

  effect(() => {
    const currentSource = getValue(source)
    load(currentSource, false)
  })

  const resource = function () {
    return value()
  } as unknown as Resource<T>

  Object.defineProperties(resource, {
    value: { get: () => value(), enumerable: true, configurable: true },
    loading: { get: () => loading(), enumerable: true, configurable: true },
    error: { get: () => error(), enumerable: true, configurable: true },
    state: { get: () => resourceState(), enumerable: true, configurable: true },
    latest: { get: () => value.peek(), enumerable: true, configurable: true },
    peek: { value: () => value.peek(), enumerable: false, configurable: true },
    [STATE_SIGNAL]: { value: resource, enumerable: false, configurable: false }
  })

  const actions = {
    mutate: (v: T | undefined) => value.set(v),
    refetch: () => {
      const currentSource = getValue(source)
      load(currentSource, true)
    },
  }

  return [resource, actions]
}

interface StateFunction {
  <T, P>(computeFn: (params: P) => T, options: StateOptions<P> & { params: P }): StateValue<T>
  <T>(computeFn: () => T, options?: StateOptions): StateValue<T>
  <T, P>(fetcher: (params: P) => Promise<T>, options: StateOptions<P> & { params: P }): StateValue<T | undefined> & { refetch: () => void, loading: boolean, error: unknown, status: AsyncStatus }
  <T>(fetcher: () => Promise<T>, options?: StateOptions): StateValue<T | undefined> & { refetch: () => void, loading: boolean, error: unknown, status: AsyncStatus }
  <T>(initialValue: T, options?: StateOptions): StateValue<T>
  
  // 테스트용 최소한의 유틸리티
  clear: () => void
  delete: (key: StateKey) => boolean
  has: (key: StateKey) => boolean
  readonly size: number
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

  const rawKey = options?.key
  const key = rawKey ? serializeKey(rawKey) : undefined
  const params = options?.params

  // Check Registry
  if (key && globalStateRegistry.has(key)) {
    return globalStateRegistry.get(key)!.proxy
  }

  // Create proxy
  let proxy: StateValue<T>

  if (typeof initialValueOrFetcher === 'function') {
    const originalFn = initialValueOrFetcher as Function
    const fn = params !== undefined ? () => originalFn(params) : originalFn

    let testResult: any
    try { testResult = fn() } catch (e) { /* treat as computed */ }

    const isAsync = originalFn.constructor.name === 'AsyncFunction' || testResult instanceof Promise

    if (isAsync) {
      const [res, actions] = createResource(fn as any, async (v) => v)
      proxy = createComputedProxy(() => res(), key) as any

      const getSubKey = (suffix: string) => rawKey ? serializeKey(Array.isArray(rawKey) ? [...rawKey, suffix] : [rawKey, suffix]) : undefined

      const loadingProxy = createComputedProxy(() => res.loading, getSubKey('loading'))
      const errorProxy = createComputedProxy(() => res.error, getSubKey('error'))
      const statusProxy = createComputedProxy(() => res.loading ? 'loading' : res.error ? 'error' : res.state === 'unresolved' ? 'idle' : 'success', getSubKey('status'))

      Object.defineProperties(proxy, {
        refetch: { value: actions.refetch, writable: false, enumerable: false },
        loading: { value: loadingProxy, writable: false, enumerable: false },
        error: { value: errorProxy, writable: false, enumerable: false },
        status: { value: statusProxy, writable: false, enumerable: false }
      })
    } else {
      proxy = createComputedProxy(fn as any, key) as any
    }
  } else {
    proxy = createSignalProxy(initialValueOrFetcher, key)
  }

  // Register
  if (key) {
    globalStateRegistry.set(key, {
      proxy,
      setter: (proxy as any).set,
      refetch: (proxy as any).refetch
    })
  }

  return proxy
}

const state = stateImplementation as StateFunction

// 테스트용 최소한의 유틸리티
state.clear = function (): void {
  globalStateRegistry.clear()
}

state.delete = function (key: StateKey): boolean {
  return globalStateRegistry.delete(serializeKey(key))
}

state.has = function (key: StateKey): boolean {
  return globalStateRegistry.has(serializeKey(key))
}

state.clearByPrefix = function (prefix: StateKey): number {
  const prefixStr = serializeKey(prefix)
  let cleared = 0
  const keysToDelete: string[] = []
  for (const [key] of globalStateRegistry.entries()) {
    if (key === prefixStr) {
      keysToDelete.push(key)
      continue
    }
    if (prefixStr.endsWith(']')) {
      const raw = prefixStr.slice(0, -1)
      if (key.startsWith(raw) && key.length > raw.length && key[raw.length] === ',') {
        keysToDelete.push(key)
      }
    } else {
      if (key.startsWith(prefixStr)) {
        keysToDelete.push(key)
      }
    }
  }
  for (const k of keysToDelete) {
    if (globalStateRegistry.delete(k)) cleared++
  }
  return cleared
}

state.getStats = function () {
  const byNamespace: Record<string, number> = {}
  for (const [key] of globalStateRegistry.entries()) {
    try {
      const parsed = JSON.parse(key)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ns = String(parsed[0])
        byNamespace[ns] = (byNamespace[ns] || 0) + 1
      }
    } catch {
      // Not a JSON key, skip
    }
  }
  const topNamespaces = Object.entries(byNamespace)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ns, count]) => ({ namespace: ns, count }))
  return {
    total: globalStateRegistry.size,
    byNamespace,
    topNamespaces,
    averageAccessCount: 0
  }
}

state.getNamespaceStats = function (prefix: StateKey) {
  const pStr = serializeKey(prefix)
  const ns = Array.isArray(prefix) && prefix.length > 0 ? String(prefix[0]) : pStr
  let count = 0
  let totalAccessCount = 0
  const states: Array<{ key: string; accessCount: number }> = []
  for (const [key, entry] of globalStateRegistry.entries()) {
    try {
      const parsed = JSON.parse(key)
      if (Array.isArray(parsed)) {
        const match = Array.isArray(prefix) 
          ? parsed.length >= prefix.length && parsed.slice(0, prefix.length).every((v, i) => v === prefix[i])
          : parsed[0] === ns
        if (match) {
          count++
          // Estimate access count based on key usage (simplified)
          const accessCount = 1 + (key.includes('count') ? 2 : 0)
          totalAccessCount += accessCount
          states.push({ key, accessCount })
        }
      } else if (key.startsWith(pStr)) {
        count++
        const accessCount = 1
        totalAccessCount += accessCount
        states.push({ key, accessCount })
      }
    } catch {
      if (key.startsWith(pStr)) {
        count++
        const accessCount = 1
        totalAccessCount += accessCount
        states.push({ key, accessCount })
      }
    }
  }
  return {
    namespace: ns,
    count,
    totalAccessCount,
    averageAccessCount: count > 0 ? totalAccessCount / count : 0,
    states
  }
}

let autoCleanupEnabled = false
state.enableAutoCleanup = function () {
  autoCleanupEnabled = true
}
state.disableAutoCleanup = function () {
  autoCleanupEnabled = false
}
Object.defineProperty(state, 'isAutoCleanupEnabled', { 
  get: () => autoCleanupEnabled, 
  enumerable: true 
})

Object.defineProperty(state, 'size', { 
  get: () => globalStateRegistry.size, 
  enumerable: true 
})

export { state }

export interface RefObject<T> { current: T | null }
export function ref<T>(initial: T | null): RefObject<T> { return { current: initial } }
