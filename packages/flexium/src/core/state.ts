/**
 * Main State API
 * 
 * 핵심: state() 함수 하나로 모든 상태 패턴 처리
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

export { state }

export interface RefObject<T> { current: T | null }
export function ref<T>(initial: T | null): RefObject<T> { return { current: initial } }
