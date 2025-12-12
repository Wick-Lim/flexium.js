/**
 * Proxy-Centric Signaling Architecture
 * 
 * 이 파일의 역할:
 * 1. Proxy 기반 반응성 구현 (createSignalProxy, createComputedProxy)
 * 2. 의존성 추적 관리 (activeEffect 관리)
 * 3. Proxy.get() 트랩에서 의존성 자동 추적 (Graph.connect)
 * 4. Proxy.set() 트랩에서 구독자 알림 호출 (notifySubscribers)
 * 
 * 핵심 원리:
 * - Proxy.get() 호출 시 → activeEffect가 있으면 Graph.connect()로 의존성 연결
 * - Proxy.set() 호출 시 → notifySubscribers()로 구독자들에게 알림
 * 
 * 다른 파일과의 관계:
 * - graph.ts: Graph.connect() 사용 (의존성 그래프 연결)
 * - sync.ts: notifySubscribers() 사용 (구독자 알림)
 * - effect.ts: getActiveEffect() 사용 (현재 실행 중인 effect 확인)
 */

import { Graph, type ISubscriber, type IObservable, SubscriberFlags, NodeType } from './graph'
import { notifySubscribers } from './sync'

export const STATE_SIGNAL = Symbol.for('flexium.stateSignal')

let globalVersion = 0

// Active Effect 관리 - 의존성 추적의 핵심
let activeEffect: ISubscriber | null = null

export function getActiveEffect(): ISubscriber | null {
  return activeEffect
}

export function setActiveEffect(effect: ISubscriber | null): void {
  activeEffect = effect
}

/**
 * Execute a function without tracking signal dependencies.
 */
export function untrack<T>(fn: () => T): T {
  const prev = activeEffect
  activeEffect = null
  try {
    return fn()
  } finally {
    activeEffect = prev
  }
}

interface ReactiveMetadata {
  _value: unknown
  subsHead: any
  depsHead: any
  version: number
  nodeType: NodeType
  computeFn?: () => unknown
  flags?: SubscriberFlags
  lastCleanEpoch?: number
  key?: string
}

const proxyMetadata = new WeakMap<object, ReactiveMetadata>()
const depMap = new WeakMap<object, Map<string | symbol, any>>()

function getDep(target: object, key: string | symbol, initialValue?: unknown): any {
  let deps = depMap.get(target)
  if (!deps) {
    deps = new Map()
    depMap.set(target, deps)
  }
  let dep = deps.get(key)
  if (!dep) {
    const currentVal = initialValue !== undefined ? initialValue : Reflect.get(target, key)
    dep = createReactiveProxy(currentVal)
    deps.set(key, dep)
  }
  return dep
}

interface ReactiveTarget extends Function {
  subsHead: any
  version: number
  nodeType: NodeType
  notify(): void
  depsHead?: any
  flags?: SubscriberFlags
  execute(): void
  peek(): unknown
  set?(value: unknown | ((prev: unknown) => unknown)): void
}

function createReactiveProxy<T>(initialValue: T, computeFn?: () => T, key?: string): ReactiveTarget {
  const metadata: ReactiveMetadata = {
    _value: initialValue,
    subsHead: undefined,
    depsHead: undefined,
    version: 0,
    nodeType: computeFn ? NodeType.Computed : NodeType.Signal,
    computeFn,
    flags: computeFn ? (SubscriberFlags.Dirty | SubscriberFlags.Stale) : 0,
    lastCleanEpoch: 0,
    key
  }

  const targetFn = function () {
    const meta = proxyMetadata.get(targetFn as any)!
    const activeEffect = getActiveEffect()
    if (activeEffect && activeEffect !== (targetFn as any)) {
      Graph.connect(targetFn as any as IObservable, activeEffect)
    }
    if (meta.computeFn) {
      return getComputedValue(meta, targetFn as any as ReactiveTarget)
    }
    return meta._value
  } as unknown as ReactiveTarget

  proxyMetadata.set(targetFn as any, metadata)

  Object.defineProperty(targetFn, 'subsHead', {
    get: () => proxyMetadata.get(targetFn as any)!.subsHead,
    set: (v) => { proxyMetadata.get(targetFn as any)!.subsHead = v },
    enumerable: false
  })
  Object.defineProperty(targetFn, 'depsHead', {
    get: () => proxyMetadata.get(targetFn as any)!.depsHead,
    set: (v) => { proxyMetadata.get(targetFn as any)!.depsHead = v },
    enumerable: false
  })
  Object.defineProperty(targetFn, 'version', {
    get: () => proxyMetadata.get(targetFn as any)!.version,
    enumerable: false
  })
  Object.defineProperty(targetFn, 'nodeType', {
    get: () => proxyMetadata.get(targetFn as any)!.nodeType,
    enumerable: false
  })
  Object.defineProperty(targetFn, 'flags', {
    get: () => proxyMetadata.get(targetFn as any)!.flags || 0,
    set: (v) => { proxyMetadata.get(targetFn as any)!.flags = v },
    enumerable: false
  })

  targetFn.peek = () => {
    const meta = proxyMetadata.get(targetFn as any)!
    if (meta.computeFn) {
      return getComputedValue(meta, targetFn as any, true)
    }
    return meta._value
  }

  if (!computeFn) {
    targetFn.set = (newValue: T | ((prev: T) => T)) => {
      const meta = proxyMetadata.get(targetFn as any)!
      const prevValue = meta._value
      const value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue as T) : newValue
      if (meta._value !== value) {
        meta._value = value
        meta.version = ++globalVersion
        notifySubscribers(targetFn as any as IObservable)
      }
    }
  } else {
    targetFn.set = () => {
      throw new Error('Cannot set computed signal')
    }
  }

  targetFn.execute = () => {
    const meta = proxyMetadata.get(targetFn as any)!
    if (meta.computeFn) {
      meta.flags = (meta.flags || 0) | SubscriberFlags.Dirty | SubscriberFlags.Stale
      notifySubscribers(targetFn as any as IObservable)
    }
  }

  targetFn.notify = () => {
    notifySubscribers(targetFn as any as IObservable)
  }

  return new Proxy(targetFn, signalProxyHandlers) as any
}

function getComputedValue(meta: ReactiveMetadata, target: ReactiveTarget, force = false): unknown {
  if (!meta.computeFn) return meta._value

  const flags = meta.flags || 0
  const dirtyOrStale = flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)

  if (!force && dirtyOrStale === 0) {
    return meta._value
  }

  if ((flags & SubscriberFlags.Dirty) === 0 && (flags & SubscriberFlags.Stale) !== 0) {
    if (!needsRefetch(meta)) {
      meta.flags = flags & ~SubscriberFlags.Stale
      return meta._value
    }
  }

  meta.flags = flags & ~(SubscriberFlags.Dirty | SubscriberFlags.Stale)
  Graph.disconnectDependencies(target as ISubscriber)

  const prevEffect = getActiveEffect()
  setActiveEffect(target as ISubscriber)

  try {
    const newValue = meta.computeFn()
    if (meta._value !== newValue) {
      meta._value = newValue
      meta.version = ++globalVersion
    }
    meta.lastCleanEpoch = globalVersion
  } finally {
    setActiveEffect(prevEffect)
  }

  return meta._value
}

function needsRefetch(meta: ReactiveMetadata): boolean {
  if (!meta.depsHead) return true

  let link: any = meta.depsHead
  while (link) {
    const dep = link.dep!
    if (dep.version > (meta.lastCleanEpoch || 0)) {
      return true
    }
    if (dep.nodeType === NodeType.Computed) {
      const depMeta = proxyMetadata.get(dep as any)!
      const flags = depMeta.flags || 0
      if ((flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)) !== 0) {
        const oldVersion = dep.version
        getComputedValue(depMeta, dep as any as ReactiveTarget, true)
        if (dep.version !== oldVersion && dep.version > (meta.lastCleanEpoch || 0)) {
          return true
        }
      }
    }
    link = link.nextDep
  }
  return false
}

// 핵심: get()에서 의존성 추적, set()에서 구독자 알림 (notifySubscribers는 sync.ts에 있음)
const signalProxyHandlers: ProxyHandler<ReactiveTarget> = {
  get(target, prop) {
    const meta = proxyMetadata.get(target as any)!

    if (prop === STATE_SIGNAL) return target
    if (prop === 'peek') return target.peek
    if (prop === 'set' && !meta.computeFn) return target.set

    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value

    // 핵심: 의존성 추적
    const activeEffect = getActiveEffect()
    if (activeEffect && activeEffect !== (target as any)) {
      Graph.connect(target as IObservable, activeEffect)
    }

    if (prop === Symbol.toPrimitive || prop === 'valueOf') {
      return () => innerValue
    }

    if (prop === Symbol.iterator && Array.isArray(innerValue)) {
      getDep(innerValue, 'length')()
      getDep(innerValue, 'iterate')()
      return (innerValue as any)[Symbol.iterator].bind(innerValue)
    }

    if (innerValue !== null && typeof innerValue === 'object') {
      const val = Reflect.get(innerValue, prop)

      if (typeof val === 'function') {
        if (Array.isArray(innerValue) && ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop as string)) {
          return function (...args: any[]) {
            const result = (val as Function).apply(innerValue, args)
            const meta = proxyMetadata.get(target as any)!
            const currentValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value
            if (innerValue === currentValue) {
              getDep(innerValue, 'length').set(innerValue.length)
              getDep(innerValue, 'iterate')()
            }
            return result
          }
        }
        return (innerValue as any)[prop].bind(innerValue)
      }

      getDep(innerValue, prop, val)()
      if (val !== null && typeof val === 'object') {
        return createNestedProxy(val)
      }
      return val
    }

    // Check if property exists on proxy itself (e.g., refetch, status, error for async state)
    const proxyTarget = target as any
    if (prop in proxyTarget) {
      const innerIsObject = innerValue !== null && typeof innerValue === 'object'
      if (!innerIsObject || !(prop in innerValue)) {
        return (proxyTarget as any)[prop]
      }
    }

    return (innerValue as any)[prop]
  },

  set(target, prop, newValue) {
    const meta = proxyMetadata.get(target as any)!
    if (meta.computeFn) {
      throw new Error('Cannot set computed signal')
    }

    const innerValue = meta._value
    if (innerValue !== null && typeof innerValue === 'object') {
      const success = Reflect.set(innerValue, prop, newValue)
      if (success) {
        getDep(innerValue, prop).set(newValue)
      }
      return success
    }
    return false
  },

  has(target, prop) {
    if (prop === STATE_SIGNAL) return true
    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value
    if (innerValue === null || typeof innerValue !== 'object') return false
    return Reflect.has(innerValue, prop)
  },

  ownKeys(target) {
    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value
    if (innerValue === null || typeof innerValue !== 'object') return []
    if (Array.isArray(innerValue)) {
      getDep(innerValue, 'length')()
      getDep(innerValue, 'iterate')()
    }
    const keys = Reflect.ownKeys(innerValue)
    // Proxy spec requires 'prototype' to be included for objects
    // Also need to include internal properties that might be accessed (e.g., subsHead, depsHead)
    // These are always present on reactive proxies, so always include them
    const allKeys = new Set(keys)
    allKeys.add('prototype')
    allKeys.add('subsHead')
    allKeys.add('depsHead')
    return Array.from(allKeys)
  },

  getPrototypeOf(target) {
    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value
    if (innerValue !== null && typeof innerValue === 'object') {
      return Reflect.getPrototypeOf(innerValue)
    }
    return Object.prototype
  },

  getOwnPropertyDescriptor(target, prop) {
    if (prop === STATE_SIGNAL) {
      return { configurable: true, enumerable: false, value: target }
    }
    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value
    if (innerValue === null || typeof innerValue !== 'object') return undefined
    const desc = Reflect.getOwnPropertyDescriptor(innerValue, prop)
    return desc ? { ...desc, configurable: true, enumerable: true } : undefined
  }
}

const nestedHandlers: ProxyHandler<object> = {
  get(target, prop) {
    if (prop === STATE_SIGNAL) return target
    const val = Reflect.get(target, prop)
    getDep(target, prop, val)()
    if (val !== null && typeof val === 'object') {
      return createNestedProxy(val)
    }
    return val
  },
  set(target, prop, newValue) {
    const success = Reflect.set(target, prop, newValue)
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

const reactiveProxyCache = new WeakMap<object, any>()

export function createSignalProxy<T>(initialValue: T, key?: string): import('./state').StateValue<T> {
  if (typeof initialValue === 'object' && initialValue !== null) {
    let proxy = reactiveProxyCache.get(initialValue)
    if (proxy) return proxy as unknown as import('./state').StateValue<T>
    proxy = createReactiveProxy(initialValue, undefined, key)
    reactiveProxyCache.set(initialValue, proxy)
    return proxy as unknown as import('./state').StateValue<T>
  }
  return createReactiveProxy(initialValue, undefined, key) as unknown as import('./state').StateValue<T>
}

export function createComputedProxy<T>(computeFn: () => T, key?: string): import('./state').StateValue<T> {
  return createReactiveProxy(undefined as T, computeFn, key) as unknown as import('./state').StateValue<T>
}

export function getProxyFromStateValue(stateValue: unknown): any {
  if (typeof stateValue === 'object' || typeof stateValue === 'function') {
    if (stateValue !== null && STATE_SIGNAL in stateValue) {
      return (stateValue as any)[STATE_SIGNAL]
    }
  }
  return null
}
