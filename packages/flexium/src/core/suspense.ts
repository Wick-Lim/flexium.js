/**
 * @internal Suspense is deprecated - use state(async) which returns loading state explicitly
 */
import { createContext } from './context'
import { signal } from './signal'
import { f } from '../renderers/dom/f'
import type { FNodeChild } from './renderer'
import { logError, ErrorCodes } from './errors'

/** @internal */
export interface SuspenseContextValue {
  registerPromise: (promise: Promise<unknown>) => void
}

export const SuspenseCtx = createContext<SuspenseContextValue | null>(null)

export function Suspense(props: {
  fallback: FNodeChild
  children: FNodeChild
}) {
  const pendingCount = signal(0)

  const registerPromise = (promise: Promise<unknown>) => {
    pendingCount.value++
    promise.then(
      () => {
        pendingCount.value--
      },
      (error) => {
        pendingCount.value--
        logError(ErrorCodes.UNCAUGHT_RENDER_ERROR, { context: 'suspense' }, error)
      }
    )
  }

  const contextValue: SuspenseContextValue = { registerPromise }

  return () => {
    const isPending = pendingCount.value > 0

    if (isPending) {
      return props.fallback
    }

    // If not pending, try to render children.
    // If children throw Promise during this render, mountReactive catches it,
    // calls registerPromise, and returns placeholder.
    // registerPromise updates signal -> trigger re-render -> loop?

    // 1. Suspense render (count=0). Returns Provider(children).
    // 2. mountReactive renders children. Child throws.
    // 3. mountReactive catches, calls registerPromise.
    // 4. registerPromise: count=1. Signal updated.
    // 5. Suspense effect triggers re-render.
    // 6. Suspense render (count=1). Returns fallback.
    // 7. mountReactive renders fallback. DOM updates.

    // 8. Promise resolves. count=0. Signal updated.
    // 9. Suspense render (count=0). Returns Provider(children).
    // 10. mountReactive renders children. Child calls read(). Value is ready. No throw.
    // 11. Success.

    return f(SuspenseCtx.Provider, { value: contextValue }, props.children)
  }
}
