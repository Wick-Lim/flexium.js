import { signal, createResource } from './signal';

/** Internal state object that may be a Signal or Resource */
interface StateObject {
  value: unknown;
  peek: () => unknown;
  loading?: boolean;
  error?: unknown;
  state?: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored';
  latest?: unknown;
  read?: () => unknown;
  _stateActions?: StateActions;
}

/** Actions available for state mutation */
interface StateActions {
  mutate?: (value: unknown) => void;
  refetch?: () => void;
}

// Global registry for keyed states
// We store either a Signal, Resource, or Computed
const globalStateRegistry = new Map<string, StateObject>();

// Enhanced Getter Type: acts as accessor but carries Resource properties if applicable
export type StateGetter<T> = {
  (): T;
  loading: boolean;
  error: unknown;
  state: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored';
  latest: T | undefined;
  read: () => T | undefined;
  map: T extends (infer U)[]
    ? <R>(fn: (item: U, index: () => number) => R) => R[]
    : never;
};

// Enhanced Setter Type: acts as setter but carries Resource actions
export type StateSetter<T> = {
  (newValue: T | ((prev: T) => T)): void;
  mutate: (v: T | undefined) => void;
  refetch: () => void;
};

/**
 * Unified State API
 * 
 * Usage:
 * 1. Local Value: const [count, setCount] = state(0);
 * 2. Local Resource: const [data, actions] = state(async () => fetch('/api').then(r => r.json()));
 * 3. Global Value: const [theme, setTheme] = state('light', { key: 'theme' });
 * 4. Global Resource: const [user, actions] = state(fetchUser, { key: 'user' });
 * 5. Computed (Derived): const [double] = state(() => count() * 2);
 * 
 * @param initialValueOrFetcher - Initial value, or a function to derive/fetch state.
 * @param options - Optional settings (e.g., global key).
 */
export function state<T>(
  initialValueOrFetcher: T | (() => T | Promise<T>),
  options?: { key?: string }
): [StateGetter<T>, StateSetter<T>] {
  let s: StateObject;
  let actions: StateActions = {};

  const key = options?.key;
  
  // 1. Check Global Registry
  if (key && typeof key === 'string' && globalStateRegistry.has(key)) {
    const cached = globalStateRegistry.get(key)!;
    // We return the cached signal/resource directly
    // However, we need to reconstruct the getter/setter wrapper to match the return type
    // But wait, we need to know if the cached one is a Resource or a Signal to attach correct actions?
    // Actually, we can store the *result tuple* or the *base signal object* and re-wrap.
    // Storing the base object (Signal or Resource) is better.
    s = cached;

    // Re-derive actions based on whether it's a resource or signal
    // Ideally, we should store the *actions* too if it's a resource.
    // Let's simplify: Signal/Resource objects already contain necessary methods.
    // For Resource: it has internal mechanics. But `createResource` returns [resource, actions].
    // We need to store the PAIR in the registry if we want to fully restore it.
  } 
  
  // 2. Create New (if not in registry)
  else {
    if (typeof initialValueOrFetcher === 'function') {
      // It's a function -> Treat as Resource source
      // Pass the function as 'source' to createResource.
      // createResource tracks dependencies in 'source' execution.
      // The fetcher simply receives the result of source() and returns it.
      // This supports both sync computed values (fn returns value) and async resources (fn returns Promise).

      const fn = initialValueOrFetcher as () => T | Promise<T>;

      const [res, resActions] = createResource(
        fn,
        async (val) => val // The value computed by fn is passed here
      );

      s = res as unknown as StateObject;
      actions = resActions as StateActions;
    } else {
      // It's a value -> Create Signal
      s = signal<T>(initialValueOrFetcher) as unknown as StateObject;
    }

    // Save to registry if key provided
    if (key && typeof key === 'string') {
      // We need to store both signal and actions to restore them later?
      // For Signal, actions is empty (just set).
      // For Resource, actions has refetch.
      // Let's store the object `s` and attach `actions` to it or store a wrapper?
      // Let's store the object `s` and attach `_actions` property to it for retrieval.
      s._stateActions = actions;
      globalStateRegistry.set(key, s);
    }
  }

  // If we retrieved from cache, retrieve actions
  if (!actions.refetch && s._stateActions) {
    actions = s._stateActions;
  }

  // 3. Construct Return Tuple
  
  // Getter Wrapper
  const getter = (() => s.value as T) as StateGetter<T>;

  // Attach Resource properties to getter (if available)
  // This allows access like: data.loading, data.error
  Object.defineProperties(getter, {
    loading: { get: () => s.loading || false },
    error: { get: () => s.error },
    state: { get: () => s.state || 'ready' },
    latest: { get: () => (s.latest ?? s.peek()) as T | undefined },
    read: { value: s.read || (() => s.value as T) }
  });

  // Setter Wrapper
  const setter = ((newValue: T | ((prev: T) => T)) => {
    // Use mutate if available (Resource), otherwise set (Signal)
    if (actions.mutate) {
        // Resource mutate usually takes value directly.
        // If function, we need to handle it manually.
        if (typeof newValue === 'function') {
            const fn = newValue as (prev: T) => T;
            actions.mutate(fn(s.peek() as T));
        } else {
            actions.mutate(newValue);
        }
    } else {
        // Signal set
        if (typeof newValue === 'function') {
            const fn = newValue as (prev: T) => T;
            s.value = fn(s.peek() as T);
        } else {
            s.value = newValue;
        }
    }
  }) as StateSetter<T>;

  // Attach Actions to setter
  setter.mutate = (actions.mutate as StateSetter<T>['mutate']) || ((v: T | undefined) => {
      if (v !== undefined) s.value = v;
  });
  setter.refetch = actions.refetch || (() => { /* no-op for simple state */ });

  return [getter, setter];
}

/**
 * Clear all global states (useful for testing or resetting app)
 */
export function clearGlobalState() {
  globalStateRegistry.clear();
}
