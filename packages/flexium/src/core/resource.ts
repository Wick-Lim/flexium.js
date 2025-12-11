/**
 * Resource API - Proxy-based async state management
 * 
 * Creates a resource for handling async data with loading/error states
 */

import { state, type StateValue } from './state'
import { effect } from './effect'
import { STATE_SIGNAL } from './state'

/**
 * Resource interface for async data
 */
export interface Resource<T> {
  (): T | undefined
  value: T | undefined
  loading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
  state: 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  latest: T | undefined
  peek(): T | undefined
}

/**
 * Helper to check if a value is a state value (Proxy-based)
 */
function isStateValue(value: unknown): value is StateValue<unknown> {
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    return STATE_SIGNAL in (value as object)
  }
  return false
}

/**
 * Helper to get value from state or plain value
 */
function getValue<T>(source: T | StateValue<T> | (() => T)): T {
  if (typeof source === 'function') {
    // Check if it's a state value (Proxy)
    if (isStateValue(source)) {
      return (source as StateValue<T>)()
    }
    // It's a plain function
    return (source as () => T)()
  }
  // It's a static value or state value
  if (isStateValue(source)) {
    return (source as StateValue<T>)()
  }
  return source
}

/**
 * Creates a resource for handling async data
 * @internal Use state(async () => ...) instead which returns [data, refetch, status, error]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createResource<T, S = any>(
  source: S | StateValue<S> | (() => S),
  fetcher: (
    source: S,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { value, refetching }: { value: T | undefined; refetching: any }
  ) => Promise<T>
): [Resource<T>, { mutate: (v: T | undefined) => void; refetch: () => void }] {
  const [value, setValue] = state<T | undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = state<any>(undefined)
  const [loading, setLoading] = state<boolean>(false)
  const [resourceState, setResourceState] = state<
    'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
  >('unresolved')

  let latestPromise: Promise<T> | null = null

  const load = async (currentSource: S, refetching = false) => {
    if (refetching) {
      setResourceState('refreshing')
      setLoading(true)
    } else {
      setResourceState('pending')
      setLoading(true)
    }
    setError(undefined)

    const currentPromise = fetcher(currentSource, { value: value.peek(), refetching })
    latestPromise = currentPromise

    try {
      const result = await currentPromise
      if (latestPromise === currentPromise) {
        setValue(result)
        setResourceState('ready')
        setLoading(false)
      }
    } catch (err) {
      if (latestPromise === currentPromise) {
        setError(err)
        setResourceState('errored')
        setLoading(false)
      }
    }
  }

  // Track source changes
  effect(() => {
    const currentSource = getValue(source)
    load(currentSource, false)
  })

  // Create the resource object (read-only signal interface)
  const resource = function () {
    return value()
  } as unknown as Resource<T>

  Object.defineProperties(resource, {
    value: { get: () => value(), enumerable: true, configurable: true },
    loading: { get: () => loading(), enumerable: true, configurable: true },
    error: { get: () => error(), enumerable: true, configurable: true },
    state: { get: () => resourceState(), enumerable: true, configurable: true },
    latest: { get: () => value.peek(), enumerable: true, configurable: true },
    peek: { value: () => value.peek(), enumerable: false, configurable: true },
    // Expose STATE_SIGNAL for detection
    [STATE_SIGNAL]: { value: resource, enumerable: false, configurable: false }
  })

  const actions = {
    mutate: (v: T | undefined) => setValue(v),
    refetch: () => {
      const currentSource = getValue(source)
      load(currentSource, true)
    },
  }

  return [resource, actions]
}
