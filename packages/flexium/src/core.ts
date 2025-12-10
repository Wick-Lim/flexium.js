/**
 * Flexium Core - Unified state management
 *
 * One API for all state: local, global, async, and computed.
 *
 * @example
 * ```tsx
 * import { state, effect, sync } from 'flexium/core'
 * ```
 */

// State management - THE unified API
export { state, ref, equals, isTruthy, isStateValue } from './core/state'
export type { StateAction, StateValue, AsyncStatus, StateKey, StateOptions, RefObject } from './core/state'

// Side effects and synchronization (necessary primitives)
export { effect, onMount, onCleanup, root, untrack } from './core/signal'
export { sync } from './core/scheduler'

// Context API
export { createContext, context } from './core/context'
export type { Context } from './core/context'
