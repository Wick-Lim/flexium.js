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
let batchDepth = 0;
let batchedEffects = new Set<ISubscriber>();

/**
 * Base interface for reactive signals
 */
export interface Signal<T> {
  value: T;
  (): T;
  set(value: T): void;
  peek(): T;
}

/**
 * Computed signal interface (read-only)
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
  cleanup?: () => void;

  constructor(
    public fn: () => void | (() => void),
    public onError?: (error: Error) => void
  ) {}

  execute(): void {
    this.cleanup?.();
    this.cleanup = undefined;

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
        this.cleanup = result;
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
    this.cleanup?.();
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

  constructor(private _value: T) {}

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
    if (batchDepth > 0) {
      // Collect effects to run after batch completes
      for (const subscriber of this.subscribers) {
        batchedEffects.add(subscriber);
      }
    } else {
      // Run effects immediately - copy subscribers to avoid modification during iteration
      const subscribersToNotify = new Set(this.subscribers);
      for (const subscriber of subscribersToNotify) {
        subscriber.execute();
      }
    }
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

  constructor(private computeFn: () => T) {}

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
    if (batchDepth > 0) {
      for (const subscriber of this.subscribers) {
        batchedEffects.add(subscriber);
      }
    } else {
      // Run effects immediately - copy subscribers to avoid modification during iteration
      const subscribersToNotify = new Set(this.subscribers);
      for (const subscriber of subscribersToNotify) {
        subscriber.execute();
      }
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
  return () => node.dispose();
}

/**
 * Batches multiple signal updates to prevent cascading updates
 *
 * @param fn - Function containing signal updates
 *
 * @example
 * batch(() => {
 *   count.value++;
 *   name.value = "new";
 * }); // effects only run once at the end
 */
export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const effects = new Set(batchedEffects);
      batchedEffects.clear();
      for (const effect of effects) {
        effect.execute();
      }
    }
  }
}

/**
 * Runs a function without tracking dependencies
 * Useful for reading signals inside effects without creating dependencies
 *
 * @param fn - Function to run without tracking
 * @returns The return value of fn
 */
export function untrack<T>(fn: () => T): T {
  const prevEffect = activeEffect;
  activeEffect = null;
  try {
    return fn();
  } finally {
    activeEffect = prevEffect;
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
  const effects: (() => void)[] = [];
  const dispose = () => {
    for (const effect of effects) {
      effect();
    }
    effects.length = 0;
  };

  return fn(dispose);
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
