/**
 * Proxy-Centric Signaling Architecture
 * 
 * Proxy directly stores values and manages dependency graph
 * No SignalNode/ComputedNode wrapper - Proxy IS the signal
 */

import { STATE_SIGNAL } from './state'
import { updateStateMetadata } from './registry'
import { Graph, type Link, type ISubscriber, type IObservable, SubscriberFlags, NodeType } from './graph'
import { getActiveEffect, setActiveEffect } from './owner'
import { scheduleAutoBatch, addToAutoBatch, addToBatch, getBatchDepth } from './sync'

// Global version clock for epoch-based validation
let globalVersion = 0

/**
 * Reactive Proxy Metadata
 * Stores all reactive state directly in Proxy metadata
 */
interface ReactiveMetadata {
  // Value storage
  _value: unknown

  // Graph state
  subsHead: Link | undefined
  depsHead: Link | undefined
  version: number

  // Node type
  nodeType: NodeType

  // Computed state (for computed proxies)
  computeFn?: () => unknown
  flags?: SubscriberFlags
  lastCleanEpoch?: number

  // Key for registry tracking
  key?: string
}

const proxyMetadata = new WeakMap<object, ReactiveMetadata>()

/**
 * Dependency Map: Stores signals for object properties.
 * Key: Target Object (The inner value)
 * Value: Map<PropertyKey, ReactiveProxy>
 */
const depMap = new WeakMap<object, Map<string | symbol, any>>()
const signalToKeyMap = new WeakMap<object, string>()

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

/**
 * Reactive Proxy Target Interface
 * Extends function with IObservable/ISubscriber properties
 */
interface ReactiveTarget extends Function {
  // IObservable properties
  subsHead: Link | undefined
  version: number
  nodeType: NodeType
  notify(): void

  // ISubscriber properties (for computed)
  depsHead?: Link | undefined
  flags?: SubscriberFlags
  execute(): void

  // Proxy methods
  peek(): unknown
  set?(value: unknown | ((prev: unknown) => unknown)): void
}

/**
 * Create a reactive proxy that implements IObservable/ISubscriber
 */
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

  // Create callable function target
  // We need to create the function first, then add properties
  const targetFn = function () {
    const meta = proxyMetadata.get(targetFn as any)!

    // Track dependency if in effect/computed
    const activeEffect = getActiveEffect()
    if (activeEffect && activeEffect !== (targetFn as any)) {
      Graph.connect(targetFn as any as IObservable, activeEffect)
    }

    if (meta.computeFn) {
      // Computed: lazy evaluation
      return getComputedValue(meta, targetFn as any as ReactiveTarget)
    }
    return meta._value
  } as unknown as ReactiveTarget

  const target = targetFn

  proxyMetadata.set(target as any, metadata)
  if (key) {
    signalToKeyMap.set(target as any, key)
  }

  // Make target implement IObservable/ISubscriber
  // Use non-enumerable properties to avoid issues with object spread
  Object.defineProperty(target, 'subsHead', {
    get: () => proxyMetadata.get(target as any)!.subsHead,
    set: (v) => { proxyMetadata.get(target as any)!.subsHead = v },
    enumerable: false,
    configurable: true
  })
  Object.defineProperty(target, 'depsHead', {
    get: () => proxyMetadata.get(target as any)!.depsHead,
    set: (v) => { proxyMetadata.get(target as any)!.depsHead = v },
    enumerable: false,
    configurable: true
  })
  Object.defineProperty(target, 'version', {
    get: () => proxyMetadata.get(target as any)!.version,
    enumerable: false,
    configurable: true
  })
  Object.defineProperty(target, 'nodeType', {
    get: () => proxyMetadata.get(target as any)!.nodeType,
    enumerable: false,
    configurable: true
  })
  Object.defineProperty(target, 'flags', {
    get: () => proxyMetadata.get(target as any)!.flags || 0,
    set: (v) => { proxyMetadata.get(target as any)!.flags = v },
    enumerable: false,
    configurable: true
  })

  // Add methods
  target.peek = () => {
    const meta = proxyMetadata.get(target as any)!
    if (meta.computeFn) {
      return getComputedValue(meta, target as any, true)
    }
    return meta._value
  }

  if (!computeFn) {
    target.set = (newValue: T | ((prev: T) => T)) => {
      const meta = proxyMetadata.get(target as any)!
      const prevValue = meta._value
      const value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue as T) : newValue
      if (meta._value !== value) {
        meta._value = value
        meta.version = ++globalVersion
        notifySubscribers(meta)
      }
    }
  }

  target.execute = () => {
    const meta = proxyMetadata.get(target as any)!
    if (meta.computeFn) {
      meta.flags = (meta.flags || 0) | SubscriberFlags.Dirty | SubscriberFlags.Stale
      notifySubscribers(meta)
    }
  }

  // Add notify method for IObservable
  target.notify = () => {
    const meta = proxyMetadata.get(target as any)!
    notifySubscribers(meta)
  }

  const proxy = new Proxy(target, signalProxyHandlers) as any
  return proxy
}

function getComputedValue(meta: ReactiveMetadata, target: ReactiveTarget, force = false): unknown {
  if (!meta.computeFn) return meta._value

  const flags = meta.flags || 0
  const dirtyOrStale = flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)

  if (!force && dirtyOrStale === 0) {
    return meta._value
  }

  // Check if dependencies changed
  if ((flags & SubscriberFlags.Dirty) === 0 && (flags & SubscriberFlags.Stale) !== 0) {
    if (!needsRefetch(meta)) {
      meta.flags = flags & ~SubscriberFlags.Stale
      return meta._value
    }
  }

  // Re-compute
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

  let link: Link | undefined = meta.depsHead
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

function notifySubscribers(meta: ReactiveMetadata): void {
  if (getBatchDepth() === 0) {
    if (meta.subsHead) {
      let hasScheduled = false
      let link: Link | undefined = meta.subsHead

      while (link) {
        const sub = link.sub!
        if (sub.nodeType === NodeType.Computed) {
          if (sub.execute) sub.execute()
        } else {
          addToAutoBatch(sub)
          if (!hasScheduled) {
            hasScheduled = true
            scheduleAutoBatch()
          }
        }
        link = link.nextSub
      }
    }
  } else {
    let link = meta.subsHead
    while (link) {
      if (link.sub) addToBatch(link.sub)
      link = link.nextSub
    }
  }
}

/**
 * Proxy Handler for Reactive Proxies
 */
const signalProxyHandlers: ProxyHandler<ReactiveTarget> = {
  get(target, prop) {
    const meta = proxyMetadata.get(target as any)!

    // Direct access to underlying proxy
    if (prop === STATE_SIGNAL) return target

    // Access Tracking
    if (meta.key) updateStateMetadata(meta.key)

    // Expose peek method
    if (prop === 'peek') {
      return target.peek
    }

    // Expose set method for writable signals
    if (prop === 'set' && !meta.computeFn) {
      return target.set
    }

    // Get the current value (track dependency)
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value

    // Track dependency if in effect/computed (before property access checks)
    const activeEffect = getActiveEffect()
    if (activeEffect && activeEffect !== (target as any)) {
      Graph.connect(target as IObservable, activeEffect)
    }

    // Enable primitive coercion (arithmetic operations)
    if (prop === Symbol.toPrimitive || prop === 'valueOf') {
      return () => innerValue
    }

    // Enable iteration (for arrays)
    if (prop === Symbol.iterator) {
      if (Array.isArray(innerValue)) {
        getDep(innerValue, 'length')()
        getDep(innerValue, 'iterate')()
        return (innerValue as any)[Symbol.iterator].bind(innerValue)
      }
    }

    // For function-specific properties on the target function itself, hide them
    // This ensures object spread only includes innerValue properties
    // Note: 'length' is NOT a function property - it's an array property, so we handle it separately
    // This check must come AFTER we've determined innerValue is an object
    if (prop === 'prototype' || prop === 'name' || prop === 'caller' || prop === 'arguments') {
      // Only return if innerValue itself is a function
      if (typeof innerValue === 'function') {
        return (innerValue as any)[prop]
      }
      // For non-function innerValue, return undefined to hide target function's properties
      // But only if innerValue is not an object (to avoid hiding object properties)
      if (innerValue === null || typeof innerValue !== 'object') {
        return undefined
      }
      // If innerValue is an object, continue to property access below
    }

    // Recursive Forwarding for object properties
    if (innerValue !== null && typeof innerValue === 'object') {
      // Get the property value from innerValue
      const val = Reflect.get(innerValue, prop)

      if (typeof val === 'function') {
        // Special handling for Array mutation methods
        if (Array.isArray(innerValue) && ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop as string)) {
          return function (...args: any[]) {
            const result = (val as Function).apply(innerValue, args)
            const meta = proxyMetadata.get(target as any)!
            const currentValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value
            if (innerValue === currentValue) {
              const lengthDep = getDep(innerValue, 'length')
              lengthDep.set(innerValue.length)
              getDep(innerValue, 'iterate')()
            }
            return result
          }
        }
        if (Array.isArray(innerValue)) {
          return (val as Function).bind(innerValue)
        }
        return (innerValue as any)[prop].bind(innerValue)
      }

      // Track property access for reactivity (this creates/get a signal for the property)
      // Call the signal to track dependency
      const depSignal = getDep(innerValue, prop, val)
      depSignal() // Track dependency - this returns the signal's value

      // Create nested proxy for nested objects
      if (val !== null && typeof val === 'object') {
        return createNestedProxy(val)
      }
      // Return the actual property value from innerValue (not from signal)
      // The signal is only for tracking, we return the actual value
      return val
    }

    // Primitive property access (for primitives like numbers, strings)
    const val = (innerValue as any)[prop]
    return typeof val === 'function' ? val.bind(innerValue) : val
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
    if (innerValue === null) return false
    if (typeof innerValue === 'object') {
      return Reflect.has(innerValue, prop)
    }
    return false
  },

  ownKeys(target) {
    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value

    if (innerValue === null || typeof innerValue !== 'object') {
      // For primitives, return empty array (no own keys)
      return []
    }

    if (Array.isArray(innerValue)) {
      getDep(innerValue, 'length')()
      getDep(innerValue, 'iterate')()
    } else {
      getDep(innerValue, 'iterate')()
    }

    // Return keys of innerValue (not target function)
    // This ensures object spread only includes innerValue properties
    // Note: Proxy spec requires ownKeys to match getOwnPropertyDescriptor
    // Since getOwnPropertyDescriptor returns descriptors for function properties (prototype, name, etc.),
    // we must include them in ownKeys to satisfy the Proxy spec
    // But we only include non-enumerable ones that getOwnPropertyDescriptor returns descriptors for
    const keys = Reflect.ownKeys(innerValue)
    const targetKeys = Reflect.ownKeys(target)
    // Add function properties that getOwnPropertyDescriptor returns descriptors for
    // These are non-enumerable so won't appear in object spread
    const functionProps = ['prototype', 'name', 'length']
    const result = [...keys]
    for (const prop of functionProps) {
      if (targetKeys.includes(prop) && !result.includes(prop)) {
        // Only add if getOwnPropertyDescriptor would return a descriptor for it
        const desc = Reflect.getOwnPropertyDescriptor(target, prop)
        if (desc) {
          result.push(prop)
        }
      }
    }
    return result
  },

  getPrototypeOf(target) {
    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value

    if (innerValue !== null && typeof innerValue === 'object') {
      return Reflect.getPrototypeOf(innerValue)
    }

    // For primitives, return Object.prototype
    return Object.prototype
  },

  getOwnPropertyDescriptor(target, prop) {
    if (prop === STATE_SIGNAL) {
      return { configurable: true, enumerable: false, value: target }
    }

    const meta = proxyMetadata.get(target as any)!
    const innerValue = meta.computeFn ? getComputedValue(meta, target as any) : meta._value

    // Hide function-specific properties (prototype, name, etc.) from target function
    // Only expose properties from innerValue
    // This is critical: target is a function, but we want to expose innerValue's properties
    // Note: 'length' is NOT a function property - it's an array property, so we handle it separately
    if (prop === 'prototype' || prop === 'name' || prop === 'caller' || prop === 'arguments') {
      // For 'prototype', we must return a descriptor because target is a function
      // Return the actual function's prototype descriptor exactly as it is
      // IMPORTANT: We must preserve ALL descriptor properties exactly to match target
      if (prop === 'prototype') {
        const targetDesc = Reflect.getOwnPropertyDescriptor(target, prop)
        if (targetDesc) {
          // Return the descriptor exactly as it is - don't modify any properties
          return targetDesc
        }
        // If no descriptor exists, return undefined (not a descriptor)
        return undefined
      }
      // For other function properties (name, caller, arguments), check innerValue first
      // If innerValue has this property, return its descriptor (not the function's)
      if (innerValue !== null && typeof innerValue === 'object') {
        const innerDesc = Reflect.getOwnPropertyDescriptor(innerValue, prop)
        if (innerDesc) {
          // innerValue has this property, return its descriptor
          return {
            ...innerDesc,
            configurable: true,
            enumerable: true
          }
        }
      }
      // Only return descriptor if innerValue itself is a function (not the target function)
      if (typeof innerValue === 'function') {
        const desc = Reflect.getOwnPropertyDescriptor(innerValue, prop)
        if (desc) {
          return {
            ...desc,
            configurable: true,
            enumerable: true
          }
        }
      }
      // For other function properties, return undefined to hide function properties
      return undefined
    }

    if (innerValue === null || typeof innerValue !== 'object') {
      // For primitives, return undefined (no own properties)
      return undefined
    }

    // Return descriptor from innerValue (not from target function)
    // This ensures object spread works correctly
    const desc = Reflect.getOwnPropertyDescriptor(innerValue, prop)
    if (desc) {
      // Make sure descriptor is configurable and enumerable for spread syntax
      return {
        ...desc,
        configurable: true,
        enumerable: true
      }
    }

    // For properties that don't exist on innerValue, return undefined
    return undefined
  }
}

const nestedHandlers: ProxyHandler<object> = {
  get(target, prop, receiver) {
    if (prop === STATE_SIGNAL) return target
    const val = Reflect.get(target, prop, receiver)
    getDep(target, prop, val)()
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

// Cache for Reactive Proxies (only for objects, primitives create new proxy each time)
const reactiveProxyCache = new WeakMap<object, any>()

export function createSignalProxy<T>(initialValue: T, key?: string): import('./state').StateValue<T> {
  // For objects, use cache. For primitives, always create new proxy
  if (typeof initialValue === 'object' && initialValue !== null) {
    let proxy = reactiveProxyCache.get(initialValue)
    if (proxy) return proxy as unknown as import('./state').StateValue<T>
    proxy = createReactiveProxy(initialValue, undefined, key)
    reactiveProxyCache.set(initialValue, proxy)
    return proxy as unknown as import('./state').StateValue<T>
  }

  // Primitives: always create new proxy (no caching)
  return createReactiveProxy(initialValue, undefined, key) as unknown as import('./state').StateValue<T>
}

export function createComputedProxy<T>(computeFn: () => T, key?: string): import('./state').StateValue<T> {
  const proxy = createReactiveProxy(undefined as T, computeFn, key)
  return proxy as unknown as import('./state').StateValue<T>
}

// Helper to get underlying proxy from StateValue
export function getProxyFromStateValue(stateValue: unknown): any {
  if (typeof stateValue === 'object' || typeof stateValue === 'function') {
    if (stateValue !== null && STATE_SIGNAL in stateValue) {
      return (stateValue as any)[STATE_SIGNAL]
    }
  }
  return null
}
