/**
 * Flexium Core - Unified state management
 *
 * One API for all state: local, global, async, and computed.
 *
 * @example
 * ```tsx
 * import { state, effect } from 'flexium/core'
 * ```
 */

// State management - THE unified API
export { state, ref, equals, isTruthy, isStateValue } from './core/state'
export type { StateAction, StateValue, AsyncStatus, StateKey, StateOptions, RefObject } from './core/state'

// Side effects (necessary primitives)
export { effect } from './core/effect'
