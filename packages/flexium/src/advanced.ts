/**
 * Flexium Advanced API
 *
 * Low-level primitives for performance tuning and advanced use cases.
 * Most users should use `state()` from the main entry point instead.
 *
 * @example
 * import { signal, computed, root } from 'flexium/advanced'
 */

export {
  signal,
  computed,
  root,
  untrack,
  onCleanup,
  isSignal,
  createResource
} from './core/signal'

export type { Signal, Computed, Resource } from './core/signal'
