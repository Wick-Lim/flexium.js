import { reactive } from './reactive'
import { effect } from './effect'

export type StateGetter<T> = () => T
export type StateSetter<T> = (newValue: T) => void
export type AsyncStateControl = {
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
export function state<T>(initialValue: T, options?: StateOptions): [StateGetter<T>, StateSetter<T>]
export function state<T>(fn: () => Promise<T>, options?: StateOptions): [StateGetter<T | undefined>, AsyncStateControl]
export function state<T>(fn: () => T, options?: StateOptions): [StateGetter<T>, AsyncStateControl] // Computed shares shape but simplified
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

  let result: any

  // 1. Function (Computed or Resource)
  if (typeof input === 'function') {
    const fn = input as Function

    // Check if Async (Resource) - Simple constructor check
    const isAsync = fn.constructor.name === 'AsyncFunction'

    if (isAsync) {
      const state = reactive({
        value: undefined as T | undefined,
        loading: true,
        error: null as any,
        status: 'loading' as 'idle' | 'loading' | 'success' | 'error'
      })

      const fetcher = fn as () => Promise<T>

      const load = async () => {
        state.loading = true
        state.status = 'loading'
        state.error = null
        try {
          const data = await fetcher()
          state.value = data
          state.status = 'success'
        } catch (err) {
          state.error = err
          state.status = 'error'
        } finally {
          state.loading = false
        }
      }

      // Initial load
      // In a real implementation we might want this tracked or lazy
      load()

      const getter = () => state.value
      // Control object (reactive)
      // We expose the reactive state properties directly on the control object
      const control = {
        refetch: load,
        get loading() { return state.loading },
        get error() { return state.error },
        get status() { return state.status }
      }

      result = [getter, control]
    } else {
      // Synchronous Function (Computed)
      const computed = reactive({ value: undefined as any })

      effect(() => {
        computed.value = fn()
      })

      const getter = () => computed.value
      // Computed has no controls really, but we match the shape or return empty object
      // User said: "fn or async fn... covers it"
      // We can return a read-only metadata object if needed, or just empty
      const control = {
        refetch: async () => { }, // No-op for computed
        loading: false,
        error: null,
        status: 'success'
      }

      result = [getter, control]
    }
  } else {
    // 2. Value (Signal)
    // Wrap in a reactive container to allow "replacing" the value
    const container = reactive({ value: input })

    const getter = () => {
      // If input was an object, container.value is a proxy.
      // access to container.value tracks dependency on 'value'.
      return container.value
    }

    const setter = (newValue: T) => {
      container.value = newValue
    }

    result = [getter, setter]
  }

  // Store in registry if key provided
  if (serializedKey) {
    globalRegistry.set(serializedKey, result)
  }

  return result
}
