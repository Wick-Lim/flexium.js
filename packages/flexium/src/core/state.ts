
import { reactive } from './reactive'
import { unsafeEffect } from './effect'
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
      throw new Error('State key must be an array') // User requested array check
    }
    serializedKey = serializeKey(options.key)
  }

  // Hook Wrapper: Returns the REACTIVE CONTAINER (stable object)
  // ALWAYS call hook() to ensure component hook index is maintained
  const container = hook(() => {
    // Check Registry FIRST inside the factory (only runs once per component instance)
    if (serializedKey && globalRegistry.has(serializedKey)) {
      return globalRegistry.get(serializedKey)
    }

    let newContainer: any

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
      unsafeEffect(run)

      newContainer = state

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

    return newContainer
  }) as any

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
