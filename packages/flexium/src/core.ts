/**
 * Flexium Core - Unified state management
 *
 * One API for all state: local, global, async, and computed.
 *
 * @example
 * ```tsx
 * import { state, effect, batch } from 'flexium/core'
 * ```
 */

// State management - THE unified API
export { state, clearGlobalState } from './core/state'
export type { StateSetter, StateValue } from './core/state'

// Side effects and batching (necessary primitives)
export { effect, onMount, onCleanup, batch, root, untrack } from './core/signal'

// Control flow - For only (use native JS for conditionals)
export { For } from './core/flow'

// Context API
export { createContext, useContext } from './core/context'
export type { Context } from './core/context'

// Async boundaries
export { Suspense } from './core/suspense'
export { ErrorBoundary, useErrorBoundary } from './core/error-boundary'
