/**
 * DevTools hooks interface
 * 
 * Set by devtools module to avoid circular imports
 * @internal
 */

import type { Signal } from './signal'

/**
 * DevTools hooks interface - set by devtools module to avoid circular imports
 * @internal
 */
export interface DevToolsHooks {
  onSignalCreate?: (signal: Signal<unknown>, name?: string) => number
  onSignalUpdate?: (id: number, value: unknown) => void
  onEffectCreate?: (name?: string) => number
  onEffectRun?: (
    id: number,
    status: 'idle' | 'running' | 'error',
    error?: Error
  ) => void
}

// Global hooks registry - set by devtools when enabled
let devToolsHooks: DevToolsHooks | null = null

export function getDevToolsHooks() {
  return devToolsHooks
}

/**
 * Register devtools hooks (called by devtools module)
 * @internal
 */
export function setDevToolsHooks(hooks: DevToolsHooks | null): void {
  devToolsHooks = hooks
}
