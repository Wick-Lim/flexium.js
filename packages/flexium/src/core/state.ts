
import { reactive } from './reactive'
import { unsafeEffect } from './effect'
import { hook } from './hook'

export type StateSetter<T> = (newValue: T | ((prev: T) => T)) => void

export type ResourceControl = {
  refetch: () => Promise<void>
  readonly loading: boolean
  readonly error: unknown
  readonly status: 'idle' | 'loading' | 'success' | 'error'
}

export type StateAction<T> = StateSetter<T> | ResourceControl

export interface StateOptions {
  key?: unknown[]
  deps?: any[]
}

// Global State Registry
const globalRegistry = new Map<string, any>()

function serializeKey(key: unknown[]): string {
  return JSON.stringify(key)
}

// Overloads
export function state<T>(fn: () => Promise<T>, options?: StateOptions): [T | undefined, ResourceControl]
export function state<T>(fn: () => T, options?: StateOptions): [T, ResourceControl]
export function state<T>(initialValue: T extends Function ? never : T, options?: StateOptions): [T, StateSetter<T>]
export function state<T>(input: T | (() => T) | (() => Promise<T>), options?: StateOptions): any {
  // 0. Validate key if provided
  if (options?.key && !Array.isArray(options.key)) {
    throw new Error('State key must be an array')
  }

  // Hook Wrapper: Store container reference and track key
  const stateRef = hook(() => {
    return reactive({
      container: undefined as any,
      serializedKey: undefined as any
    })
  })

  // Compute serialized key
  const currentKey = options?.key
  const serializedKey = currentKey ? serializeKey(currentKey) : undefined

  // Check if key has changed by comparing serialized strings
  const keyChanged = serializedKey !== stateRef.serializedKey

  // If key changed or first time, get/create container
  if (!stateRef.container || keyChanged) {
    stateRef.serializedKey = serializedKey

    // Check Registry FIRST
    if (serializedKey && globalRegistry.has(serializedKey)) {
      stateRef.container = globalRegistry.get(serializedKey)
    } else {
      let newContainer: any

      // 1. Function (Computed or Resource)
      if (typeof input === 'function') {
        const fn = input as Function

        // DEPS MODE: Manual dependency tracking (memo behavior)
        if (options?.deps !== undefined) {
          const memoState = hook(() => ({
            value: undefined as T | undefined,
            prevDeps: undefined as any[] | undefined,
            hasRun: false
          }))

          let hasChanged = true
          if (memoState.hasRun && memoState.prevDeps) {
            hasChanged = options.deps.some((d, i) => d !== memoState.prevDeps![i])
          }

          if (hasChanged) {
            const result = fn()
            if (result instanceof Promise) {
              throw new Error('deps option is not supported with async functions')
            }
            memoState.value = result
            memoState.prevDeps = options.deps
            memoState.hasRun = true
          }

          newContainer = reactive({
            type: 'computed',
            value: memoState.value,
            loading: false,
            error: null,
            status: 'success' as 'idle' | 'loading' | 'success' | 'error',
            run: () => { }
          })
        } else {
          // REACTIVE MODE: Automatic tracking (existing behavior)
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
          unsafeEffect(run)

          newContainer = state
        }

      } else {
        // 2. Value (Signal)
        // We return the reactive proxy itself as the container
        newContainer = reactive({
          type: 'signal',
          value: input
        })
      }

      // Register in global registry if needed
      if (serializedKey) {
        globalRegistry.set(serializedKey, newContainer)
      }

      stateRef.container = newContainer
    }
  }

  const container = stateRef.container

  // --- RETURN LOGIC ---
  // Access container.value to track dependency in the component's effect
  const currentValue = container.value

  if (container.type === 'signal') {
    const setter = (newValue: T | ((prev: T) => T)) => {
      if (typeof newValue === 'function') {
        container.value = (newValue as Function)(container.value)
      } else {
        container.value = newValue
      }
    }
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
