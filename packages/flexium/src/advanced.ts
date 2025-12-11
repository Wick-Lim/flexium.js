/**
 * Flexium Advanced API
 *
 * Low-level primitives for performance tuning and advanced use cases.
 * Most users should use `state()` from the main entry point instead.
 *
 * @example
 * import { signal, computed, sync, root, untrack } from 'flexium/advanced'
 */

export {
  signal,
  computed,
} from './core/signal'

export type { Signal, Computed } from './core/signal'

// Advanced control primitives
export { root, untrack } from './core/owner'
export { sync } from './core/sync'

// DevTools
export { enableDevTools, disableDevTools } from './devtools'
