/**
 * Flexium Core - Reactive primitives and state management
 *
 * This module provides the core reactive system including signals,
 * computed values, effects, and state management utilities.
 *
 * @example
 * ```tsx
 * import { state, effect, onMount, onCleanup, batch } from 'flexium/core'
 * import { For, Show, Switch, Match } from 'flexium/core'
 * import { createContext, useContext } from 'flexium/core'
 * import { Suspense, ErrorBoundary } from 'flexium/core'
 * ```
 */

// Core reactivity primitives
export {
  signal,
  computed,
  effect,
  onMount,
  onCleanup,
  batch,
  root,
  untrack,
  isSignal,
  createResource,
} from './core/signal'

// Types
export type {
  Signal,
  Computed,
  Resource,
  DevToolsHooks,
} from './core/signal'

// State management
import { state as coreState, clearGlobalState } from './core/state'
import { StateGetter, StateSetter } from './core/state'
import { For } from './core/flow'

// Enhanced state function with .map helper
function state<T>(
  initialValueOrFetcher: T | ((...args: any[]) => T | Promise<T>),
  options?: { key?: string }
): [StateGetter<T>, StateSetter<T>] {
  const [getter, setter] = coreState(initialValueOrFetcher, options);

  // Inject .map for list rendering optimization
  (getter as any).map = (renderFn: (item: T extends (infer U)[] ? U : any, index: () => number) => any) => {
    return {
        type: For,
        props: { each: getter },
        children: [renderFn],
        key: null
    };
  };

  return [getter, setter];
}

export { state, clearGlobalState }
export type { StateGetter, StateSetter } from './core/state'

// Control flow components
export { For, Show, Switch, Match } from './core/flow'

// Context API
export { createContext, useContext } from './core/context'
export type { Context } from './core/context'

// Async boundaries
export { Suspense } from './core/suspense'
export { ErrorBoundary, useErrorBoundary } from './core/error-boundary'
