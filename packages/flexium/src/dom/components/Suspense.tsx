import { state } from '../../core/state'
import { hook } from '../../core/hook'
import { SuspenseCtx } from './suspenseContext'
import type { SuspenseProps, SuspenseContextValue } from './types'
import type { FNodeChild } from '../types'

/**
 * Suspense component that shows fallback while children are loading
 *
 * @example
 * ```tsx
 * const Dashboard = lazy(() => import('./Dashboard'))
 *
 * function App() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <Dashboard />
 *     </Suspense>
 *   )
 * }
 * ```
 */
export function Suspense(props: SuspenseProps): FNodeChild {
  const { fallback, children } = props

  // Track pending promises using hook for mutable Set
  const pendingSet = hook(() => new Set<Promise<any>>())
  const [, setPendingCount] = state(0)
  const [showFallback, setShowFallback] = state(false)

  // Register function for lazy components
  const register = (promise: Promise<any>) => {
    if (!pendingSet.has(promise)) {
      // Add to pending set
      pendingSet.add(promise)
      setPendingCount(c => c + 1)
      setShowFallback(true)

      // Wait for resolution
      promise.finally(() => {
        pendingSet.delete(promise)
        setPendingCount(c => {
          const newCount = c - 1
          if (newCount === 0) {
            setShowFallback(false)
          }
          return newCount
        })
      })
    }
  }

  const contextValue: SuspenseContextValue = {
    register,
    hasBoundary: true
  }

  // Render fallback or children based on pending state
  const content = showFallback ? fallback : children

  // Wrap content with Suspense context provider
  return {
    type: SuspenseCtx.Provider,
    props: { value: contextValue },
    children: [content],
    key: undefined
  } as any
}
