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

// Signal factories are removed. Use state() for all reactive state management.
// Low-level Proxy-based signals are available via state() API.
export type { StateValue as Signal, StateValue as Computed } from './core/state'

// Advanced control primitives
export { root, untrack } from './core/owner'
export { sync } from './core/sync'

// DevTools
export { enableDevTools, disableDevTools } from './devtools'
