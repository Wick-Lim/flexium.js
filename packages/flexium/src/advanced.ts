/**
 * Flexium Advanced API
 *
 * Low-level primitives for performance tuning and advanced use cases.
 * Most users should use `state()` from the main entry point instead.
 *
 * @example
 * import { signal, root } from 'flexium/advanced'
 */

export {
  signal,
  root,
  untrack,
  onCleanup,
} from './core/signal'

export type { Signal, Computed } from './core/signal'

// DevTools
export { enableDevTools, disableDevTools } from './devtools'
