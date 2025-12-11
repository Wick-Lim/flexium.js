/**
 * Flexium Advanced API
 *
 * Low-level primitives for performance tuning and advanced use cases.
 * Most users should use `state()` from the main entry point instead.
 *
 * @example
 * import { sync, root, untrack } from 'flexium/advanced'
 * import { state } from 'flexium/core'
 */

// Signal factories are removed. Use SignalNode/ComputedNode if needed for low-level or state() for high-level.
export { SignalNode, ComputedNode } from './core/signal'

export type { Signal, Computed } from './core/signal'

// Advanced control primitives
export { root, untrack } from './core/owner'
export { sync } from './core/sync'

// DevTools
export { enableDevTools, disableDevTools } from './devtools'
