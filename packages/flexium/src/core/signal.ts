/**
 * Signal System - Fine-grained reactivity without VDOM
 *
 * Architecture:
 * - Signals are reactive primitives that notify subscribers on change
 * - Computed signals automatically track dependencies and memoize results
 * - Effects run side effects and auto-track dependencies
 * - Batching prevents cascading updates for performance
 */

import { ErrorCodes, logWarning } from './errors'
import {
  Graph,

  type Link,
  type ISubscriber,
  type IObservable,
  SubscriberFlags,
  NodeType
} from './graph'
import {


  getActiveEffect,
  setActiveEffect,
} from './owner'
import {
  scheduleAutoBatch,
  addToAutoBatch,
  addToBatch,
  getBatchDepth
} from './sync'
import { EffectNode, effect } from './effect'

/**
 * DevTools hooks interface - set by devtools module to avoid circular imports
 * @internal
 */
export interface DevToolsHooks {
  onSignalCreate?: (signal: Signal<unknown>, name?: string) => number
  onSignalUpdate?: (id: number, value: unknown) => void
  onEffectCreate?: (name?: string) => number
  onEffectRun?: (
    id: number,
    status: 'idle' | 'running' | 'error',
    error?: Error
  ) => void
}

// Global hooks registry - set by devtools when enabled
let devToolsHooks: DevToolsHooks | null = null

export function getDevToolsHooks() {
  return devToolsHooks
}

/**
 * Register devtools hooks (called by devtools module)
 * @internal
 */
export function setDevToolsHooks(hooks: DevToolsHooks | null): void {
  devToolsHooks = hooks
}

// Global version clock for epoch-based validation (Optimization: Epochs)
let globalVersion = 0

// ==================================================================================
// 3. User Facing API
// ==================================================================================

/**
 * Base interface for reactive signals
 * @internal
 */
export interface Signal<T> {
  value: T;
  (): T
  set(value: T): void
  peek(): T
}

/**
 * Computed signal interface (read-only)
 * @internal
 */
export interface Computed<T> {
  readonly value: T;
  (): T
  peek(): T
}



/**
 * Internal signal node for writable signals
 */
export class SignalNode<T> implements IObservable {
  // Performance: Hot path fields first (CPU cache line optimization)
  version = 0           // Frequently read
  nodeType = NodeType.Signal  // Frequently checked
  subsHead: Link | undefined  // Frequently accessed

  // Cold path field
  constructor(private _value: T) { }

  /**
   * Compatibility wrapper for legacy .value access
   */
  get value(): T {
    return this.get()
  }

  set value(newValue: T) {
    this.set(newValue)
  }

  get(): T {
    // Track dependency if inside an effect or computed
    const activeEffect = getActiveEffect()
    if (activeEffect) {
      Graph.connect(this, activeEffect)
    }
    return this._value
  }

  set(newValue: T): void {
    if (this._value !== newValue) {
      this._value = newValue
      this.version = ++globalVersion
      this.notify()
    }
  }

  peek(): T {
    return this._value
  }

  notify(): void {
    // Performance: Branch prediction - check most common case first (no batch)
    if (getBatchDepth() === 0) {
      // Automatic microtask batch (most common path)
      if (this.subsHead) {
        // Performance: Schedule immediately on first non-computed subscriber
        let hasScheduled = false
        let link: Link | undefined = this.subsHead

        while (link) {
          const sub = link.sub!
          // Performance: Use nodeType instead of instanceof (much faster)
          if (sub.nodeType === NodeType.Computed) {
            sub.execute() // Mark dirty immediately
          } else {
            addToAutoBatch(sub)
            if (!hasScheduled) {
              hasScheduled = true
              scheduleAutoBatch() // Schedule on first non-computed subscriber
            }
          }
          link = link.nextSub
        }
      }
    } else {
      // Manual batch: queue subscribers (less common path)
      let link = this.subsHead
      while (link) {
        if (link.sub) addToBatch(link.sub)
        link = link.nextSub
      }
    }
  }
}

/**
 * Internal computed node for derived values
 */
export class ComputedNode<T> implements ISubscriber, IObservable {
  // Performance: Hot path fields first (CPU cache line optimization)
  version = 0           // Frequently read
  nodeType = NodeType.Computed  // Frequently checked
  flags = SubscriberFlags.Dirty | SubscriberFlags.Stale  // Frequently checked
  subsHead: Link | undefined  // Frequently accessed
  depsHead: Link | undefined  // Frequently accessed

  // Cold path fields
  private _value!: T
  // Optimization: Track last clean epoch to avoid redundant re-computation
  private lastCleanEpoch = 0

  constructor(private computeFn: () => T) { }

  /**
   * Compatibility wrapper for legacy .value access
   */
  get value(): T {
    return this.get()
  }

  execute(): void {
    // Performance: Inline bit operation instead of function call
    // When a dependency changes, mark as dirty and notify subscribers
    this.flags |= SubscriberFlags.Dirty | SubscriberFlags.Stale
    this.notify()
  }

  private _updateIfDirty(): void {
    // Performance: Inline flag checks for better branch prediction
    // 1. If not dirty and not stale, we are valid (most common case)
    // Note: This check is now done in peek()/get() for fast path, but kept here for safety
    const flags = this.flags
    const dirtyOrStale = flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)
    if (dirtyOrStale === 0) {
      return
    }

    // 2. If Stale but not Dirty, check dependencies
    // Performance: Single bit check instead of two function calls
    if ((flags & SubscriberFlags.Dirty) === 0 && (flags & SubscriberFlags.Stale) !== 0) {
      if (!this._needsRefetch()) {
        this.flags &= ~SubscriberFlags.Stale
        return
      }
    }

    // 3. Must re-compute
    // Performance: Single bit operation instead of function call
    this.flags &= ~(SubscriberFlags.Dirty | SubscriberFlags.Stale)

    // Clear previous dependencies via Graph helper
    Graph.disconnectDependencies(this)

    const prevEffect = getActiveEffect()
    // const prevOwner = getOwner() // Not used
    setActiveEffect(this)

    try {
      const newValue = this.computeFn()
      if (this._value !== newValue) {
        this._value = newValue
        this.version = ++globalVersion
      }
      this.lastCleanEpoch = globalVersion
    } finally {
      setActiveEffect(prevEffect)
    }

    // Actually, we need to import setActiveEffect at the top of the file
    // activeEffect = this -> setActiveEffect(this)
    // activeEffect = prevEffect -> setActiveEffect(prevEffect)
    // But since I am generating this chunk, let me check imports again.
    // I added getActiveEffect to imports. I need setActiveEffect too.

    // REVISING CHUNK content below to use imported function properly.
    // note: I must add setActiveEffect to imports in the first chunk.


    // For this specific Chunk:
    // We will use a hack here or I should update the first chunk to include setActiveEffect.
    // I'll update the first chunk in this tool call to include setActiveEffect.

    // import { setActiveEffect } from './owner'
    // ...
    // setActiveEffect(this)
    // ...
    // setActiveEffect(prevEffect)
  }

  private _needsRefetch(): boolean {
    if (!this.depsHead) return true;

    // Iterate dependencies via linked list
    let link: Link | undefined = this.depsHead
    while (link) {
      const dep = link.dep!

      // Performance: Check version first (fastest check, avoids type check for most cases)
      if (dep.version > this.lastCleanEpoch) {
        return true
      }

      // Performance: Use nodeType instead of instanceof
      // Only check computed dependencies if version check passed (less common case)
      if (dep.nodeType === NodeType.Computed) {
        const computedDep = dep as ComputedNode<unknown>

        // Performance: Check if dirty/stale before calling peek() (peek() may trigger computation)
        // Only call peek() if actually needs update
        const flags = computedDep.flags
        const isDirtyOrStale = (flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)) !== 0

        if (isDirtyOrStale) {
          // Performance: Track version before peek() to detect if it actually updated
          const oldVersion = computedDep.version
          computedDep.peek()
          // Only check version again if peek() actually updated it (version changed)
          // This avoids redundant comparison when peek() didn't change anything
          if (computedDep.version !== oldVersion && computedDep.version > this.lastCleanEpoch) {
            return true
          }
        }
      }
      link = link.nextDep
    }
    return false
  }

  get(): T {
    // Track dependency if inside an effect or computed
    const activeEffect = getActiveEffect()
    if (activeEffect && activeEffect !== this) {
      Graph.connect(this, activeEffect)
    }

    // Performance: Fast path - check if update needed before calling _updateIfDirty
    const flags = this.flags
    const dirtyOrStale = flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)
    if (dirtyOrStale !== 0) {
      this._updateIfDirty()
    }
    return this._value
  }

  peek(): T {
    // Performance: Fast path - check if update needed before calling _updateIfDirty
    const flags = this.flags
    const dirtyOrStale = flags & (SubscriberFlags.Dirty | SubscriberFlags.Stale)
    if (dirtyOrStale !== 0) {
      this._updateIfDirty()
    }
    return this._value
  }

  notify(): void {
    // Performance: Branch prediction - check most common case first (no batch)
    if (getBatchDepth() === 0) {
      // Automatic microtask batch (most common path)
      if (this.subsHead) {
        let shouldSchedule = false
        let link: Link | undefined = this.subsHead

        while (link) {
          const sub = link.sub!
          // Performance: Use nodeType instead of instanceof (much faster)
          if (sub.nodeType === NodeType.Computed) {
            sub.execute()
          } else {
            addToAutoBatch(sub)
            shouldSchedule = true
          }
          link = link.nextSub
        }

        if (shouldSchedule) {
          scheduleAutoBatch()
        }
      }
    } else {
      // Manual batch (less common path)
      let link = this.subsHead
      while (link) {
        if (link.sub) addToBatch(link.sub)
        link = link.nextSub
      }
    }
  }
}







/**
 * Creates a side effect that runs when dependencies change
 *
 * @param fn - Effect function, can return a cleanup function
 * @param options - Optional error handler
 * @returns Dispose function to stop the effect
 *
 * @example
 * ```ts
 * const [count, setCount] = state(0);
 * 
 * const dispose = effect(() => {
 *   console.log('Count:', count());
 *   return () => console.log('Cleanup');
 * });
 * ```
 */


/**
 * Creates a root scope for effects
 * All effects created within the scope can be disposed together
 *
 * @param fn - Function that creates effects
 * @returns Dispose function for all effects in the scope
 */


/**
 * Symbol to mark signals for detection
 * @internal
 */
const SIGNAL_MARKER = Symbol('flexium.signal')

/**
 * Check if a value is a signal
 * @internal Use state() which handles all reactive patterns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSignal(value: unknown): value is SignalNode<any> | ComputedNode<any> {
  return value instanceof SignalNode || value instanceof ComputedNode
}

/**
 * Registers a cleanup function that runs before the current effect re-runs or is disposed
 *
 * @param fn - Cleanup function
 */
export function onCleanup(fn: () => void): void {
  const activeEffect = getActiveEffect()
  // Performance: Use nodeType instead of instanceof
  if (activeEffect && activeEffect.nodeType === NodeType.Effect) {
    (activeEffect as EffectNode).cleanups.push(fn)
  } else {
    logWarning(ErrorCodes.CLEANUP_OUTSIDE_EFFECT)
  }
}

/**
 * Resource interface for async data
 */
export interface Resource<T> extends Signal<T | undefined> {
  loading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
  state: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  latest: T | undefined
}

/**
 * Creates a resource for handling async data
 * @internal Use state(async () => ...) instead which returns [data, refetch, status, error]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createResource<T, S = any>(
  source: S | Signal<S> | (() => S),
  fetcher: (
    source: S,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { value, refetching }: { value: T | undefined; refetching: any }
  ) => Promise<T>
): [Resource<T>, { mutate: (v: T | undefined) => void; refetch: () => void }] {
  const value = new SignalNode<T | undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = new SignalNode<any>(undefined)
  const loading = new SignalNode<boolean>(false)
  const state = new SignalNode<
    'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  >('unresolved')

  const load = async (currentSource: S, refetching = false) => {
    if (refetching) {
      state.set('refreshing')
      loading.set(true)
    } else {
      state.set('pending')
      loading.set(true)
    }
    error.set(undefined)

    // Track the current promise to avoid race conditions
    // We use a local variable instead of a shared 'lastPromise'
    // because we only care about the latest execution within this closure scope
    // if we needed to support cancellation, we'd need more.
    // Actually, for race conditions we DO need to track the active promise ID or similar.
    // Let's use a simpler counter approach or just compare promise references if we kept track.
    // But since we are removing 'lastPromise' which was used for throwing, 
    // we still need to handle race conditions (late resolve).

    // Re-introducing a local tracking mechanism just for race conditions
    const currentPromise = fetcher(currentSource, { value: value.peek(), refetching })
    // We need to store this on the closure to compare
    latestPromise = currentPromise

    try {
      const result = await currentPromise
      if (latestPromise === currentPromise) {
        value.set(result)
        state.set('ready')
        loading.set(false)
      }
    } catch (err) {
      if (latestPromise === currentPromise) {
        error.set(err)
        state.set('errored')
        loading.set(false)
      }
    }
  }

  let latestPromise: Promise<T> | null = null

  /*
   * Helper to get current source value
   */
  const getSource = () => {
    if (typeof source === 'function') {
      // Check if it's a SignalNode/ComputedNode
      if (isSignal(source)) {
        return source.get()
      }
      // It's a plain function
      return (source as () => S)()
    }
    // It's a static value (or SignalNode passed as value if generic S allows)
    // If S is SignalNode, then isSignal(source) is true.
    if (isSignal(source)) {
      return source.get()
    }
    return source
  }

  // Track source changes
  effect(() => {
    const currentSource = getSource()
    load(currentSource, false)
  })

  // Create the resource object (read-only signal interface)
  const resource = function () {
    return value.get()
  } as Resource<T>

  Object.defineProperties(resource, {
    value: { get: () => value.get() },
    loading: { get: () => loading.get() },
    error: { get: () => error.get() },
    state: { get: () => state.get() },
    latest: { get: () => value.peek() },
    peek: { value: () => value.peek() },
    // no set exposed on resource object
  })
    // Mark as signal/node for detection if needed, or just let it be a function-signal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ; (resource as any)[SIGNAL_MARKER] = true

  const actions = {
    mutate: (v: T | undefined) => value.set(v),
    refetch: () => {
      const currentSource = getSource()
      load(currentSource, true)
    },
  }

  return [resource, actions]
}


