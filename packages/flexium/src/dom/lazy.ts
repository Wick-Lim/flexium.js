import { jsx as f } from '../jsx-runtime'
import type { FNode } from './index'
import { hook } from '../core/hook'
import { reactive } from '../core/reactive'
import { useSuspense } from './Suspense'

/**
 * lazy - Dynamic import wrapper for code splitting
 *
 * Usage:
 * const MyComponent = lazy(() => import('./MyComponent'))
 *
 * <Suspense fallback={<Loading />}>
 *   <MyComponent />
 * </Suspense>
 */
export function lazy<T extends (props: any) => any>(
  loader: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> } {
  // Cache for the loaded component
  let cachedComponent: T | null = null
  let cachedPromise: Promise<T> | null = null
  let cachedError: Error | null = null

  // Load function
  const load = (): Promise<T> => {
    if (cachedComponent) {
      return Promise.resolve(cachedComponent)
    }
    if (cachedError) {
      return Promise.reject(cachedError)
    }
    if (!cachedPromise) {
      cachedPromise = loader()
        .then(module => {
          cachedComponent = module.default
          return cachedComponent
        })
        .catch(err => {
          cachedError = err
          throw err
        })
    }
    return cachedPromise
  }

  // The lazy component wrapper
  const LazyComponent = (props: any): FNode => {
    const suspense = useSuspense()

    // Already loaded - render immediately
    if (cachedComponent) {
      return f(cachedComponent, props)
    }

    // Error occurred - throw for error boundary
    if (cachedError) {
      throw cachedError
    }

    // Use hook directly to store reactive state
    const lazyState = hook(() => reactive({
      Component: null as T | null,
      error: null as Error | null,
      hasStarted: false
    }))

    // If not started loading yet
    if (!lazyState.hasStarted) {
      lazyState.hasStarted = true
      const promise = load()

      // Register with suspense if available
      if (suspense) {
        suspense.registerPromise(promise)
      }

      promise
        .then(Component => {
          lazyState.Component = Component
        })
        .catch(error => {
          lazyState.error = error
        })
    }

    // Render loaded component if available
    if (lazyState.Component) {
      return f(lazyState.Component, props)
    }

    // Throw error if occurred
    if (lazyState.error) {
      throw lazyState.error
    }

    // Loading - return placeholder (Suspense will show fallback)
    return f('span', {
      'data-lazy-loading': 'true',
      style: { display: 'none' }
    })
  }

  // Add preload function
  ;(LazyComponent as any).preload = load
  ;(LazyComponent as any).__lazy = true

  return LazyComponent as T & { preload: () => Promise<T> }
}
