import { suspenseContext } from './suspenseContext'
import type { FNodeChild } from '../types'
import type { LazyComponent } from './types'

/**
 * Creates a lazy-loaded component for code splitting
 *
 * @example
 * ```tsx
 * const Dashboard = lazy(() => import('./Dashboard'))
 * const Settings = lazy(() => import('./Settings'))
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
export function lazy<P = {}>(
  loader: () => Promise<{ default: (props: P) => FNodeChild }>
): LazyComponent<P> {
  // Shared state across all instances
  let resolved: ((props: P) => FNodeChild) | null = null
  let promise: Promise<any> | null = null
  let error: Error | null = null

  // The wrapper component
  const LazyWrapper = (props: P): FNodeChild => {
    // If already resolved, render immediately
    if (resolved) {
      return resolved(props)
    }

    // If error occurred, throw it (will be caught by ErrorBoundary)
    if (error) {
      throw error
    }

    // Get suspense context
    const suspense = suspenseContext()

    // Start loading if not already
    if (!promise) {
      promise = loader()
        .then(module => {
          resolved = module.default
        })
        .catch(err => {
          error = err instanceof Error ? err : new Error(String(err))
        })
    }

    // Register with suspense boundary if available
    if (suspense.hasBoundary) {
      suspense.register(promise)
    }

    // Return null - Suspense will show fallback
    return null
  }

  // Mark as lazy component
  ;(LazyWrapper as LazyComponent<P>)._lazy = true
  ;(LazyWrapper as LazyComponent<P>)._loader = loader

  return LazyWrapper as LazyComponent<P>
}
