
import { reactive } from './reactive'
import { effect } from './effect'
import { hook } from './hook'

export type StateSetter<T> = (newValue: T) => void
export type FnStateControl = {
  refetch: () => Promise<void>
  loading: boolean
  error: unknown
  status: 'idle' | 'loading' | 'success' | 'error'
}

export interface StateOptions {
  key?: unknown[]
}

// Global State Registry
const globalRegistry = new Map<string, any>()

function serializeKey(key: unknown[]): string {
  return JSON.stringify(key)
}

// Overloads
export function state<T>(fn: () => Promise<T>, options?: StateOptions): [T | undefined, FnStateControl]
export function state<T>(fn: () => T, options?: StateOptions): [T, FnStateControl]
export function state<T>(initialValue: T, options?: StateOptions): [T, StateSetter<T>]
export function state<T>(input: T | (() => T) | (() => Promise<T>), options?: StateOptions): any {
  // 0. Global Registry Check
  let serializedKey: string | undefined
  if (options?.key) {
    if (!Array.isArray(options.key)) {
      throw new Error('State key must be an array')
    }
    serializedKey = serializeKey(options.key)
    if (globalRegistry.has(serializedKey)) {
      // If global, we assume it's a reactive container stored in registry
      const container: any = globalRegistry.get(serializedKey)
      // We must track dependency here too!
      const value = container.value

      if (container.type === 'signal') {
        return [value, (v: any) => container.value = v]
      } else {
        // Computed/Resource
        const control = {
          refetch: async () => { container.run() },
          get loading() { return container.loading },
          get error() { return container.error },
          get status() { return container.status }
        }
        return [value, control]
      }
    }
  }

  // Hook Wrapper: Returns the REACTIVE CONTAINER (stable object)
  const container = hook(() => {
    // 1. Function (Computed or Resource)
    if (typeof input === 'function') {
      const fn = input as Function

      const state = reactive({
        type: 'resource',
        value: undefined as T | undefined,
        loading: true,
        error: null as any,
        status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
        run: () => { }
      })

      const run = () => {
        try {
          const result = fn()

          if (result instanceof Promise) {
            state.loading = true
            state.status = 'loading'
            state.error = null

            result
              .then(data => {
                state.value = data
                state.status = 'success'
                state.loading = false
              })
              .catch(err => {
                state.error = err
                state.status = 'error'
                state.loading = false
              })
          } else {
            state.value = result
            state.status = 'success'
            state.loading = false
            state.error = null
          }
        } catch (err) {
          state.error = err
          state.status = 'error'
          state.loading = false
        }
      }

      state.run = run

      // Make it reactive!
      effect(run)

      return state

    } else {
      // 2. Value (Signal)
      // We return the reactive proxy itself as the container
      return reactive({
        type: 'signal',
        value: input
      })
    }
  }) as any

  // Store in global registry if key provided (Store the container!)
  if (serializedKey && !globalRegistry.has(serializedKey)) {
    globalRegistry.set(serializedKey, container)
  }

  // --- RETURN LOGIC ---
  // This runs EVERY RENDER.
  // We access container.value here to TRACK DEPENDENCY in the Component's Effect.

  const currentValue = container.value

  if (container.type === 'signal') {
    const setter = (newValue: T) => { container.value = newValue }
    return [currentValue, setter]
  } else {
    // Resource / Computed
    const control = {
      refetch: async () => { container.run() },
      get loading() { return container.loading },
      get error() { return container.error },
      get status() { return container.status }
    }
    return [currentValue, control]
  }
}
