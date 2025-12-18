import { use as flexiumUse, Context } from 'flexium/core'
import type { Setter, ResourceControl, UseContext, UseOptions } from 'flexium/core'
import {
  getIsServer,
  getIsHydrating,
  generateSignalId,
  collectSignal,
  getHydratedSignal,
  hasHydratedSignal,
  serializeValue,
  deserializeValue,
} from './runtime'

/**
 * SSR-aware state hook
 *
 * Works identically to flexium's `use()` but with automatic SSR state handling:
 * - On server: Collects state for serialization
 * - On client (hydrating): Restores state from server
 * - On client (normal): Works like regular use()
 *
 * @example
 * ```tsx
 * function Counter() {
 *   // Works on both server and client
 *   const [count, setCount] = use(0)
 *
 *   return (
 *     <button onClick={() => setCount(c => c + 1)}>
 *       Count: {count}
 *     </button>
 *   )
 * }
 * ```
 */

// Overloads (same as flexium's use)
export function use<T>(ctx: Context<T>): [T, undefined]

export function use<T, P = void>(
  fn: (ctx: UseContext<P>) => Promise<T>,
  depsOrOptions?: any[] | UseOptions,
  options?: UseOptions
): [T | undefined, ResourceControl<P>]

export function use<T>(
  fn: (ctx: UseContext) => T,
  depsOrOptions?: any[] | UseOptions,
  options?: UseOptions
): [T, ResourceControl]

export function use<T>(
  initialValue: T extends Function ? never : T,
  options?: UseOptions
): [T, Setter<T>]

export function use<T, P = void>(
  input: T | Context<T> | ((ctx: UseContext<P>) => T) | ((ctx: UseContext<P>) => Promise<T>),
  depsOrOptions?: any[] | UseOptions,
  thirdArg?: UseOptions
): any {
  // Context mode: pass through to flexium
  if (isContext(input)) {
    return flexiumUse(input)
  }

  // Function mode (computed/resource): pass through
  // These don't need SSR state serialization as they derive from other state
  if (typeof input === 'function') {
    return flexiumUse(input as any, depsOrOptions as any, thirdArg)
  }

  // Signal mode: handle SSR state
  const signalId = generateSignalId()

  // Server: collect initial value
  if (getIsServer()) {
    collectSignal(signalId, serializeValue(input))
    // Return static value on server (no reactivity)
    const noopSetter: Setter<T> = () => {}
    return [input, noopSetter]
  }

  // Client hydrating: restore from server state
  if (getIsHydrating() && hasHydratedSignal(signalId)) {
    const hydratedValue = deserializeValue(getHydratedSignal(signalId)) as T
    // Cast to any to bypass overload resolution - we know this is a signal value
    return (flexiumUse as any)(hydratedValue, depsOrOptions)
  }

  // Client normal: use flexium's use directly
  // Cast to any to bypass overload resolution - we know this is a signal value
  return (flexiumUse as any)(input, depsOrOptions)
}

function isContext(value: any): value is Context<any> {
  return value && typeof value === 'object' && 'id' in value && 'defaultValue' in value && 'Provider' in value
}

// Re-export other core utilities
export { Context } from 'flexium/core'
export type { Setter, ResourceControl, UseContext, UseOptions } from 'flexium/core'
