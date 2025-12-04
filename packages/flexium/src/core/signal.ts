/**
 * Signal System - Fine-grained reactivity without VDOM
 *
 * Architecture:
 * - Signals are reactive primitives that notify subscribers on change
 * - Computed signals automatically track dependencies and memoize results
 * - Effects run side effects and auto-track dependencies
 * - Batching prevents cascading updates for performance
 */

/**
 * Base interface for subscriber nodes
 */
interface ISubscriber {
  execute(): void;
  dependencies: Set<IObservable>;
}

/**
 * Base interface for observable nodes
 */
interface IObservable {
  subscribers: Set<ISubscriber>;
  notify(): void;
}

// Global context for dependency tracking
let activeEffect: ISubscriber | null = null;
let owner: { cleanups: (() => void)[] } | null = null;

/**
 * Runs a function once when the component mounts.
 * Unlike effect(), onMount does not track dependencies - it runs exactly once.
 *
 * @param fn - Function to run on mount. Can return a cleanup function.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   onMount(() => {
 *     console.log('Mounted!');
 *     return () => console.log('Unmounted!');
 *   });
 *   return <div>Hello</div>;
 * }
 * ```
 */
export function onMount(fn: () => void | (() => void)): void {
  // Schedule the mount callback to run after the current execution
  // This ensures the component is fully rendered before mount runs
  queueMicrotask(() => {
    const cleanup = fn();

    // Register cleanup with owner if available
    if (cleanup && typeof cleanup === 'function' && owner) {
      owner.cleanups.push(cleanup);
    }
  });
}

/**
 * Base interface for reactive signals
 * @internal
 */
export interface Signal<T> {
  value: T;
  (): T;
  set(value: T): void;
  peek(): T;
}

/**
 * Computed signal interface (read-only)
 * @internal
 */
export interface Computed<T> {
  readonly value: T;
  (): T;
  peek(): T;
}

/**
 * Internal effect node for dependency tracking
 */
class EffectNode implements ISubscriber {
  dependencies = new Set<IObservable>();
  cleanups: (() => void)[] = [];
  private isExecuting = false;
  private isQueued = false;

  constructor(
    public fn: () => void | (() => void),
    public onError?: (error: Error) => void
  ) { }

  execute(): void {
    if (this.isExecuting) {
        this.isQueued = true;
        return;
    }

    this.isExecuting = true;
    
    try {
        this.run();
    } finally {
        this.isExecuting = false;
        if (this.isQueued) {
            this.isQueued = false;
            // Schedule microtask to avoid stack overflow and infinite sync loops
            queueMicrotask(() => this.execute());
        }
    }
  }

  private run(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups = [];

    // Clear previous dependencies
    for (const dep of this.dependencies) {
      dep.subscribers.delete(this);
    }
    this.dependencies.clear();

    const prevEffect = activeEffect;
    activeEffect = this;

    try {
      const result = this.fn();
      if (typeof result === 'function') {
        this.cleanups.push(result);
      }
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      } else {
        console.error('Error in effect:', error);
      }
    } finally {
      activeEffect = prevEffect;
    }
  }

  dispose(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups = [];
    for (const dep of this.dependencies) {
      dep.subscribers.delete(this);
    }
    this.dependencies.clear();
  }
}

/**
 * Internal signal node for writable signals
 */
class SignalNode<T> implements IObservable {
  subscribers = new Set<ISubscriber>();

  constructor(private _value: T) { }

  get(): T {
    // Track dependency if inside an effect or computed
    if (activeEffect) {
      this.subscribers.add(activeEffect);
      activeEffect.dependencies.add(this);
    }
    return this._value;
  }

  set(newValue: T): void {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notify();
    }
  }

  peek(): T {
    return this._value;
  }

  notify(): void {
    // Copy subscribers to avoid infinite loops when effects unsubscribe/resubscribe during execution
    const subscribersToNotify = new Set(this.subscribers);
    subscribersToNotify.forEach((sub) => sub.execute());
  }
}

/**
 * Internal computed node for derived values
 */
class ComputedNode<T> implements ISubscriber, IObservable {
  subscribers = new Set<ISubscriber>();
  dependencies = new Set<IObservable>();
  private _value!: T;
  private _dirty = true;

  constructor(private computeFn: () => T) { }

  execute(): void {
    // When a dependency changes, mark as dirty and notify subscribers
    this._dirty = true;
    this.notify();
  }

  get(): T {
    // Track dependency if inside an effect or computed
    if (activeEffect && activeEffect !== this) {
      this.subscribers.add(activeEffect);
      activeEffect.dependencies.add(this);
    }

    if (this._dirty) {
      this._dirty = false;

      // Clear previous dependencies
      for (const dep of this.dependencies) {
        dep.subscribers.delete(this);
      }
      this.dependencies.clear();

      const prevEffect = activeEffect;
      activeEffect = this;

      try {
        this._value = this.computeFn();
      } finally {
        activeEffect = prevEffect;
      }
    }

    return this._value;
  }

  peek(): T {
    if (this._dirty) {
      this._dirty = false;

      // Clear previous dependencies
      for (const dep of this.dependencies) {
        dep.subscribers.delete(this);
      }
      this.dependencies.clear();

      const prevEffect = activeEffect;
      activeEffect = this;

      try {
        this._value = this.computeFn();
      } finally {
        activeEffect = prevEffect;
      }
    }
    return this._value;
  }

  notify(): void {
    // Run effects immediately - copy subscribers to avoid modification during iteration
    const subscribersToNotify = new Set(this.subscribers);
    for (const subscriber of subscribersToNotify) {
      subscriber.execute();
    }
  }
}

/**
 * Creates a reactive signal
 *
 * @param initialValue - The initial value of the signal
 * @returns A signal object with value getter/setter
 *
 * @example
 * const count = signal(0);
 * count.value++; // triggers subscribers
 * console.log(count()); // alternative getter syntax
 */
export function signal<T>(initialValue: T): Signal<T> {
  const node = new SignalNode(initialValue);

  const sig = function (this: any) {
    return node.get();
  } as Signal<T>;

  Object.defineProperty(sig, 'value', {
    get() {
      return node.get();
    },
    set(newValue: T) {
      node.set(newValue);
    },
    enumerable: true,
    configurable: true
  });

  sig.set = (newValue: T) => node.set(newValue);
  sig.peek = () => node.peek();

  // Mark as signal for detection
  (sig as any)[SIGNAL_MARKER] = true;

  return sig;
}

/**
 * Creates a computed signal (derived value)
 *
 * @param fn - Function that computes the derived value
 * @returns A read-only computed signal
 *
 * @example
 * const count = signal(1);
 * const doubled = computed(() => count.value * 2);
 * console.log(doubled.value); // 2
 */
export function computed<T>(fn: () => T): Computed<T> {
  const node = new ComputedNode(fn);

  const comp = function (this: any) {
    return node.get();
  } as Computed<T>;

  Object.defineProperty(comp, 'value', {
    get() {
      return node.get();
    },
    enumerable: true,
    configurable: true
  });

  comp.peek = () => node.peek();

  // Mark as signal for detection
  (comp as any)[SIGNAL_MARKER] = true;

  return comp;
}

/**
 * Creates a side effect that runs when dependencies change
 *
 * @param fn - Effect function, can return a cleanup function
 * @param options - Optional error handler
 * @returns Dispose function to stop the effect
 *
 * @example
 * const count = signal(0);
 * const dispose = effect(() => {
 *   console.log('Count:', count.value);
 *   return () => console.log('Cleanup');
 * });
 */
export function effect(
  fn: () => void | (() => void),
  options?: { onError?: (error: Error) => void }
): () => void {
  const node = new EffectNode(fn, options?.onError);
  node.execute();
  const dispose = () => node.dispose();

  if (owner) {
    owner.cleanups.push(dispose);
  }

  return dispose;
}

/**
 * Execute a function without tracking signal dependencies.
 * Useful when you need to read signals inside an effect without creating dependencies.
 *
 * @param fn - Function to execute without tracking
 * @returns The return value of fn
 *
 * @example
 * ```tsx
 * const count = signal(0);
 * const name = signal('Alice');
 *
 * effect(() => {
 *   // Only re-runs when count changes, not name
 *   console.log(count(), untrack(() => name()));
 * });
 * ```
 */
export function untrack<T>(fn: () => T): T {
  const prev = activeEffect;
  activeEffect = null;
  try {
    return fn();
  } finally {
    activeEffect = prev;
  }
}

/**
 * Creates a root scope for effects
 * All effects created within the scope can be disposed together
 *
 * @param fn - Function that creates effects
 * @returns Dispose function for all effects in the scope
 */
export function root<T>(fn: (dispose: () => void) => T): T {
  const prevOwner = owner;
  const newOwner = { cleanups: [] as (() => void)[] };
  owner = newOwner;

  const dispose = () => {
    for (const cleanup of newOwner.cleanups) {
      cleanup();
    }
    newOwner.cleanups = [];
  };

  try {
    return fn(dispose);
  } finally {
    owner = prevOwner;
  }
}

/**
 * Symbol to mark signals for detection
 * @internal
 */
const SIGNAL_MARKER = Symbol('flexium.signal');

/**
 * Check if a value is a signal
 *
 * @param value - Value to check
 * @returns True if value is a signal or computed
 *
 * @example
 * const count = signal(0);
 * isSignal(count); // true
 * isSignal(5); // false
 */
export function isSignal(value: any): value is Signal<any> | Computed<any> {
  return (
    value !== null &&
    typeof value === 'function' &&
    SIGNAL_MARKER in value
  );
}

/**
 * Registers a cleanup function that runs before the current effect re-runs or is disposed
 *
 * @param fn - Cleanup function
 */
export function onCleanup(fn: () => void): void {
  if (activeEffect instanceof EffectNode) {
    activeEffect.cleanups.push(fn);
  } else {
    console.warn('onCleanup must be called from within an effect');
  }
}

/**
 * Resource interface for async data
 */
export interface Resource<T> extends Signal<T | undefined> {
  loading: boolean;
  error: any;
  state: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored';
  latest: T | undefined;
  /**
   * Read value, throwing Promise if pending or Error if failed.
   * Used by Suspense.
   */
  read: () => T | undefined;
}

/**
 * Creates a resource for handling async data
 *
 * @param source - Reactive source (signal or function) that triggers the fetcher
 * @param fetcher - Async function that fetches data based on source
 * @returns [Resource, Actions] tuple
 */
export function createResource<T, S = any>(
  source: S | Signal<S> | (() => S),
  fetcher: (source: S, { value, refetching }: { value: T | undefined; refetching: any }) => Promise<T>
): [Resource<T>, { mutate: (v: T | undefined) => void; refetch: () => void }] {
  const value = signal<T | undefined>(undefined);
  const error = signal<any>(undefined);
  const loading = signal<boolean>(false);
  const state = signal<'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'>('unresolved');

  let lastPromise: Promise<T> | null = null;

  const load = async (currentSource: S, refetching = false) => {
    if (refetching) {
      state.value = 'refreshing';
      loading.value = true;
    } else {
      state.value = 'pending';
      loading.value = true;
    }
    error.value = undefined;

    const promise = fetcher(currentSource, { value: value.peek(), refetching });
    lastPromise = promise;

    try {
      const result = await promise;
      if (lastPromise === promise) {
        value.value = result;
        state.value = 'ready';
        loading.value = false;
      }
    } catch (err) {
      if (lastPromise === promise) {
        error.value = err;
        state.value = 'errored';
        loading.value = false;
      }
    }
  };

  const getSource = () => {
    if (typeof source === 'function') {
      if (isSignal(source)) {
        return (source as Signal<S>).value;
      }
      return (source as () => S)();
    }
    return source;
  };

  // Track source changes
  effect(() => {
    const currentSource = getSource();
    load(currentSource, false);
  });

  const resource = function () {
    return value();
  } as Resource<T>;

  Object.defineProperties(resource, {
    value: { get: () => value.value },
    loading: { get: () => loading.value },
    error: { get: () => error.value },
    state: { get: () => state.value },
    latest: { get: () => value.peek() },
    peek: { value: () => value.peek() },
    set: { value: (v: T) => value.set(v) },
    read: {
        value: () => {
            if (state.value === 'pending' || state.value === 'refreshing') {
                throw lastPromise;
            }
            if (state.value === 'errored') {
                throw error.value;
            }
            return value.value;
        }
    }
  });

  (resource as any)[SIGNAL_MARKER] = true;

  const actions = {
    mutate: (v: T | undefined) => value.set(v),
    refetch: () => load(getSource(), true)
  };

  return [resource, actions];
}
