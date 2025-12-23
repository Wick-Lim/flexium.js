import { use as flexiumUse, Context, isUseable, type Useable } from 'flexium/core'
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
import { Stream, SendableStream, registerRuntimeStream } from './stream'

// Cache restored streams by ID to maintain same instance across renders
const streamCache = new Map<string, Stream<any, any> | SendableStream<any, any>>()

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

export function use<T, P, A extends unknown[]>(source: Useable<T, P, A>, params?: P): [T, ...A]

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
  input: T | Context<T> | Useable<T, P, any> | ((ctx: UseContext<P>) => T) | ((ctx: UseContext<P>) => Promise<T>),
  depsOrOptions?: any[] | UseOptions,
  thirdArg?: UseOptions
): any {
  // Client-side: Restore serialized streams from server state
  // This handles the case where the hydration passes the serialized stream object
  if (!getIsServer() && input && typeof input === 'object' && '__type' in input) {
    const typed = input as { __type: string; id?: string; options?: { sendable?: boolean } }
    if (typed.__type === 'flexism:stream' || typed.__type === 'flexism:streamref' || typed.__type === 'flexism:sendablestreamref') {
      // Cache restored stream by ID to maintain same instance across renders
      const streamId = typed.id ?? 'unknown'
      if (!streamCache.has(streamId)) {
        const restoredStream = typed.options?.sendable || typed.__type === 'flexism:sendablestreamref'
          ? SendableStream.fromJSON(input)
          : Stream.fromJSON(input)
        streamCache.set(streamId, restoredStream)
      }
      const cachedStream = streamCache.get(streamId)!
      return (flexiumUse as any)(cachedStream, depsOrOptions)
    }
  }

  // Useable mode (Stream, SendableStream, etc.)
  if (isUseable(input)) {
    const source = input as Useable<T, P, any>
    const params = depsOrOptions as P | undefined

    // Handle Stream/SendableStream with hydration support
    if (source instanceof Stream || source instanceof SendableStream) {
      const streamId = generateSignalId()

      // Server: register stream and serialize for client
      if (getIsServer()) {
        const streamRef = source.toRef()
        // Collect serialized stream for client hydration
        collectSignal(streamId, streamRef.toJSON())

        const initialValue = source.getInitial()
        const actions = source.getActions?.() ?? []
        if (actions.length > 0) {
          return [initialValue, ...actions]
        }
        return [initialValue, undefined]
      }

      // Client hydrating: restore stream from server state
      if (getIsHydrating() && hasHydratedSignal(streamId)) {
        const serializedStream = getHydratedSignal(streamId)
        const restoredStream = source instanceof SendableStream
          ? SendableStream.fromJSON(serializedStream)
          : Stream.fromJSON(serializedStream)
        return (flexiumUse as any)(restoredStream, params)
      }

      // Client normal (not hydrating): use the source directly
      return (flexiumUse as any)(source, params)
    }

    // Other Useable types: pass through
    if (getIsServer()) {
      const initialValue = source.getInitial(params)
      const actions = source.getActions?.() ?? []
      if (actions.length > 0) {
        return [initialValue, ...actions]
      }
      return [initialValue, undefined]
    }

    // Client: use flexium's use (will subscribe to updates)
    return flexiumUse(source, params)
  }

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
