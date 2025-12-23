import { reactive } from './reactive'
import { unsafeEffect } from './lifecycle'
import { hook } from './hook'
import { registerSignal, updateSignal } from './devtools'
import { Context } from './context'
import { Useable, isUseable } from './useable'

// Re-export Context and Useable
export { Context } from './context'
export { Useable, isUseable } from './useable'

// Types
export type Setter<T> = (newValue: T | ((prev: T) => T)) => void

export type ResourceControl<P = void> = {
  refetch: (params?: P) => Promise<void>
  readonly loading: boolean
  readonly error: unknown
  readonly status: 'idle' | 'loading' | 'success' | 'error'
}

export interface UseContext<P = void> {
  onCleanup: (fn: () => void) => void
  params?: P
}

export interface UseOptions {
  key?: unknown[]
  name?: string
}

// Global State Registry
const globalRegistry = new Map<string, any>()

function serializeKey(key: unknown[]): string {
  return JSON.stringify(key)
}

// Overloads
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
  input: T | Useable<T, P> | ((ctx: UseContext<P>) => T) | ((ctx: UseContext<P>) => Promise<T>),
  depsOrOptions?: any[] | UseOptions | P,
  thirdArg?: UseOptions
): any {
  // Useable mode: use(SomeUseable, params?) returns [value, undefined] or [value, send] for sendable
  // This handles Context, Stream, Shared, and any custom Useable
  if (isUseable(input)) {
    const source = input as Useable<T, P>
    const params = depsOrOptions as P | undefined

    // Hook to store subscription state
    const state = hook(() => {
      const s = reactive({
        value: source.getInitial(params),
        cleanup: undefined as (() => void) | undefined
      })

      // Subscribe to updates
      s.cleanup = source.subscribe(params, (newValue) => {
        s.value = newValue
      })

      return s
    })

    // Access value to track dependency
    const currentValue = state.value

    // Get additional actions from the source (if any)
    const actions = source.getActions()
    if (actions && actions.length > 0) {
      return [currentValue, ...actions]
    }

    return [currentValue, undefined]
  }

  // Normalize arguments:
  // - use(value, { key }) → options only
  // - use(fn, [deps]) → deps only
  // - use(fn, [deps], { key }) → deps + options
  let deps: any[] | undefined
  let options: UseOptions | undefined

  if (Array.isArray(depsOrOptions)) {
    deps = depsOrOptions
    options = thirdArg  // third arg is options when second is deps array
  } else if (depsOrOptions && typeof depsOrOptions === 'object') {
    options = depsOrOptions as UseOptions
  }

  // Validate key if provided
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

  // Check if key has changed
  const keyChanged = serializedKey !== stateRef.serializedKey

  // DEPS MODE: Function with explicit deps array
  if (typeof input === 'function' && deps !== undefined) {
    const fn = input as (ctx: UseContext<P>) => T | Promise<T>

    const memoState = hook(() => ({
      value: undefined as T | undefined,
      prevDeps: undefined as any[] | undefined,
      cleanup: undefined as (() => void) | undefined,
      hasRun: false,
      params: undefined as P | undefined
    }))

    let hasChanged = true
    if (memoState.hasRun && memoState.prevDeps) {
      hasChanged = deps.length !== memoState.prevDeps.length ||
        deps.some((d, i) => d !== memoState.prevDeps![i])
    }

    if (hasChanged) {
      // Run previous cleanup
      if (memoState.cleanup) {
        memoState.cleanup()
        memoState.cleanup = undefined
      }

      // Create context with onCleanup
      const ctx: UseContext<P> = {
        onCleanup: (fn) => {
          memoState.cleanup = fn
        },
        params: memoState.params
      }

      const result = fn(ctx)

      if (result instanceof Promise) {
        throw new Error('deps with async functions is not supported. Use use(asyncFn) without deps for async resources.')
      }

      memoState.value = result
      memoState.prevDeps = [...deps]
      memoState.hasRun = true
    }

    const control: ResourceControl<P> = {
      refetch: async () => {},
      get loading() { return false },
      get error() { return null },
      get status() { return 'success' as const }
    }

    return [memoState.value, control]
  }

  // If key changed or first time, get/create container
  if (!stateRef.container || keyChanged) {
    stateRef.serializedKey = serializedKey

    // Check Registry FIRST
    if (serializedKey && globalRegistry.has(serializedKey)) {
      stateRef.container = globalRegistry.get(serializedKey)
    } else {
      let newContainer: any

      // Function (Computed or Resource)
      if (typeof input === 'function') {
        const fn = input as (ctx: UseContext<P>) => T | Promise<T>

        // State for async/computed
        const state = reactive({
          type: 'resource',
          value: undefined as T | undefined,
          loading: true,
          error: null as any,
          status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
          cleanup: undefined as (() => void) | undefined,
          params: undefined as P | undefined,
          run: () => {}
        })

        const run = (params?: P) => {
          // Run previous cleanup
          if (state.cleanup) {
            state.cleanup()
            state.cleanup = undefined
          }

          // Store params for context
          state.params = params

          try {
            // Create context
            const ctx: UseContext<P> = {
              onCleanup: (fn) => {
                state.cleanup = fn
              },
              params: state.params
            }

            const result = fn(ctx)

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
        unsafeEffect(() => run())

        newContainer = state
      } else {
        // Value (Signal)
        newContainer = reactive({
          type: 'signal',
          value: input
        })

        // Register with DevTools
        registerSignal(newContainer, options?.name)
      }

      // Register in global registry if needed
      if (serializedKey) {
        globalRegistry.set(serializedKey, newContainer)
      }

      stateRef.container = newContainer
    }
  }

  const container = stateRef.container

  // Access container.value to track dependency
  const currentValue = container.value

  if (container.type === 'signal') {
    const setter: Setter<T> = (newValue) => {
      if (typeof newValue === 'function') {
        container.value = (newValue as Function)(container.value)
      } else {
        container.value = newValue
      }
      updateSignal(container, container.value)
    }
    return [currentValue, setter]
  } else {
    // Resource / Computed
    const control: ResourceControl<P> = {
      refetch: async (params?: P) => { container.run(params) },
      get loading() { return container.loading },
      get error() { return container.error },
      get status() { return container.status }
    }
    return [currentValue, control]
  }
}
