
import { reactive } from './reactive'
import { effect } from './effect'
import { useHook } from './hook'

export type StateGetter<T> = () => T
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
export function state<T>(fn: () => Promise<T>, options?: StateOptions): [StateGetter<T | undefined>, FnStateControl]
export function state<T>(fn: () => T, options?: StateOptions): [StateGetter<T>, FnStateControl]
export function state<T>(initialValue: T, options?: StateOptions): [StateGetter<T>, StateSetter<T>]
export function state<T>(input: T | (() => T) | (() => Promise<T>), options?: StateOptions): any {
  // 0. Global Registry Check
  let serializedKey: string | undefined
  if (options?.key) {
    if (!Array.isArray(options.key)) {
      throw new Error('State key must be an array')
    }
    serializedKey = serializeKey(options.key)
    if (globalRegistry.has(serializedKey)) {
      return globalRegistry.get(serializedKey)
    }
  }

  // Hook Wrapper
  return useHook(() => {
    let result: any

    // 1. Function (Computed or Resource)
    if (typeof input === 'function') {
      const fn = input as Function

      const state = reactive({
        value: undefined as T | undefined,
        loading: true,
        error: null as any,
        status: 'idle' as 'idle' | 'loading' | 'success' | 'error'
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

      // Make it reactive!
      effect(run)

      const getter = () => state.value

      const control = {
        refetch: async () => { run() },
        get loading() { return state.loading },
        get error() { return state.error },
        get status() { return state.status }
      }

      result = [getter, control]

    } else {
      // 2. Value (Signal)
      const container = reactive({ value: input })

      const getter = () => container.value
      const setter = (newValue: T) => { container.value = newValue }

      result = [getter, setter]
    }

    // Store in global registry if key provided
    if (serializedKey) {
      globalRegistry.set(serializedKey, result)
    }

    return result
  })
}
