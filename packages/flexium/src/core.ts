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
export { state, clearGlobalState, deleteGlobalState, hasGlobalState, getGlobalStateCount } from './core/state'
export type { StateAction, StateValue, AsyncStatus, StateKey, StateOptions } from './core/state'

// Side effects and batching (necessary primitives)
export { effect, onMount, onCleanup, batch, root, untrack } from './core/signal'

// Context API
export { createContext, context } from './core/context'
export type { Context } from './core/context'
