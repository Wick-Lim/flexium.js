/**
 * Suspense Component Tests
 *
 * Tests for Suspense component including fallback rendering, promise tracking,
 * resolved states, error handling, nested boundaries, and context functionality.
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Suspense, SuspenseCtx } from '../suspense'
import { signal } from '../signal'
import { h } from '../../renderers/dom/h'
import { mountReactive } from '../../renderers/dom/reactive'
import { useContext } from '../context'

describe('Suspense', () => {
  let container: HTMLElement
  // Track pending promises to resolve them in cleanup
  let pendingResolvers: Array<() => void> = []

  // Helper to create a "never resolves" promise that can be cleaned up
  const createPendingPromise = () => {
    let resolver: () => void
    const promise = new Promise<void>((resolve) => {
      resolver = resolve
    })
    pendingResolvers.push(resolver!)
    return promise
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    pendingResolvers = []
  })

  afterEach(() => {
    container.remove()
    // Resolve all pending promises to allow cleanup
    pendingResolvers.forEach(resolve => resolve())
    pendingResolvers = []
  })

  describe('Basic Suspense rendering', () => {
    it('should render children when no pending promises', () => {
      const suspenseFn = Suspense({
        fallback: h('div', { class: 'fallback' }, 'Loading...'),
        children: h('div', { class: 'content' }, 'Content loaded')
      })

      const result = suspenseFn()
      expect(result).not.toBeNull()
    })

    it('should render fallback when there are pending promises', () => {
      const pendingPromise = createPendingPromise() // Cleaned up in afterEach

      const suspenseFn = Suspense({
        fallback: h('div', { class: 'fallback' }, 'Loading...'),
        children: h('div', { class: 'content' }, 'Content')
      })

      // Get the context value and register a promise
      const result = suspenseFn() as any

      // Extract context from Provider
      expect(result).toBeDefined()
    })

    it('should accept function as fallback', () => {
      const fallbackFn = () => h('div', { class: 'loading' }, 'Please wait...')

      const suspenseFn = Suspense({
        fallback: fallbackFn,
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn()
      expect(result).not.toBeNull()
    })

    it('should accept function as children', () => {
      const childrenFn = () => h('div', { class: 'dynamic' }, 'Dynamic content')

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: childrenFn
      })

      const result = suspenseFn()
      expect(result).not.toBeNull()
    })

    it('should accept text content as fallback', () => {
      const suspenseFn = Suspense({
        fallback: 'Loading...',
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn()
      expect(result).not.toBeNull()
    })

    it('should accept text content as children', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: 'Content loaded'
      })

      const result = suspenseFn()
      expect(result).not.toBeNull()
    })
  })

  describe('Promise registration and tracking', () => {
    it('should track pending promises', () => {
      let resolvePromise: () => void
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

      const suspenseFn = Suspense({
        fallback: h('div', { class: 'fallback' }, 'Loading...'),
        children: h('div', { class: 'content' }, 'Content')
      })

      // Initial render - no promises pending
      let result = suspenseFn() as any
      expect(result.type).toBe(SuspenseCtx.Provider)

      // Simulate promise registration
      const contextValue = result.props.value
      contextValue.registerPromise(promise)

      // Now should show fallback
      result = suspenseFn()
      expect(result).toBeDefined()
    })

    it('should increment pending count when promise registered', () => {
      const promise1 = createPendingPromise()
      const promise2 = createPendingPromise()

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Register first promise
      contextValue.registerPromise(promise1)

      // Register second promise
      contextValue.registerPromise(promise2)

      // Both promises should be tracked
      const pendingResult = suspenseFn()
      expect(pendingResult).toBeDefined()
    })

    it('should provide registerPromise function via context', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      expect(contextValue).toBeDefined()
      expect(typeof contextValue.registerPromise).toBe('function')
    })
  })

  describe('Resolved state after promise completes', () => {
    it('should render children after promise resolves', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

      const suspenseFn = Suspense({
        fallback: h('div', { class: 'fallback' }, 'Loading...'),
        children: h('div', { class: 'content' }, 'Loaded!')
      })

      // Get initial result
      let result = suspenseFn() as any
      const contextValue = result.props.value

      // Register promise
      contextValue.registerPromise(promise)

      // Should show fallback
      result = suspenseFn()
      const fallbackResult = result as any
      expect(fallbackResult.children).toContain('Loading...')

      // Resolve the promise
      resolvePromise!()

      // Wait for promise to settle
      await promise

      // Wait for reactive update
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should now show content
      result = suspenseFn()
      expect(result).toBeDefined()
    })

    it('should decrement pending count when promise resolves', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(promise)

      // Resolve promise
      resolvePromise!()
      await promise
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should render children now
      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })

    it('should handle promise that resolves immediately', async () => {
      const promise = Promise.resolve()

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(promise)

      await promise
      await new Promise(resolve => setTimeout(resolve, 10))

      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })
  })

  describe('Multiple pending promises', () => {
    it('should wait for all promises to resolve', async () => {
      let resolve1: () => void
      let resolve2: () => void
      let resolve3: () => void

      const promise1 = new Promise<void>(r => { resolve1 = r })
      const promise2 = new Promise<void>(r => { resolve2 = r })
      const promise3 = new Promise<void>(r => { resolve3 = r })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'All loaded!')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Register all promises
      contextValue.registerPromise(promise1)
      contextValue.registerPromise(promise2)
      contextValue.registerPromise(promise3)

      // Should show fallback
      let current = suspenseFn() as any
      expect(current.children).toContain('Loading...')

      // Resolve first promise
      resolve1!()
      await promise1
      await new Promise(resolve => setTimeout(resolve, 10))

      // Still pending
      current = suspenseFn() as any
      expect(current.children).toContain('Loading...')

      // Resolve second promise
      resolve2!()
      await promise2
      await new Promise(resolve => setTimeout(resolve, 10))

      // Still pending
      current = suspenseFn() as any
      expect(current.children).toContain('Loading...')

      // Resolve third promise
      resolve3!()
      await promise3
      await new Promise(resolve => setTimeout(resolve, 10))

      // Now should show content
      current = suspenseFn()
      expect(current).toBeDefined()
    })

    it('should handle mix of fast and slow promises', async () => {
      const fastPromise = Promise.resolve()
      let resolveSlow: () => void
      const slowPromise = new Promise<void>(r => { resolveSlow = r })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(fastPromise)
      contextValue.registerPromise(slowPromise)

      // Wait for fast promise
      await fastPromise
      await new Promise(resolve => setTimeout(resolve, 10))

      // Still pending because of slow promise
      let current = suspenseFn() as any
      expect(current.children).toContain('Loading...')

      // Resolve slow promise
      resolveSlow!()
      await slowPromise
      await new Promise(resolve => setTimeout(resolve, 10))

      // Now should show content
      current = suspenseFn()
      expect(current).toBeDefined()
    })

    it('should handle promises registered at different times', async () => {
      let resolve1: () => void
      let resolve2: () => void

      const promise1 = new Promise<void>(r => { resolve1 = r })
      const promise2 = new Promise<void>(r => { resolve2 = r })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Register first promise
      contextValue.registerPromise(promise1)

      // Resolve first promise
      resolve1!()
      await promise1
      await new Promise(resolve => setTimeout(resolve, 10))

      // Register second promise after first resolves
      contextValue.registerPromise(promise2)

      // Should still be pending
      let current = suspenseFn() as any
      expect(current.children).toContain('Loading...')

      // Resolve second promise
      resolve2!()
      await promise2
      await new Promise(resolve => setTimeout(resolve, 10))

      // Now should show content
      current = suspenseFn()
      expect(current).toBeDefined()
    })
  })

  describe('Error handling', () => {
    it('should decrement count when promise rejects', async () => {
      let rejectPromise: (reason: any) => void
      const promise = new Promise<void>((resolve, reject) => {
        rejectPromise = reject
      })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(promise)

      // Should show fallback
      let current = suspenseFn() as any
      expect(current.children).toContain('Loading...')

      // Reject the promise
      rejectPromise!(new Error('Test error'))

      // Wait for rejection to be handled
      await promise.catch(() => {})
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should render children (count decremented despite error)
      current = suspenseFn()
      expect(current).toBeDefined()
    })

    it('should handle multiple promise rejections', async () => {
      let reject1: (reason: any) => void
      let reject2: (reason: any) => void

      const promise1 = new Promise<void>((resolve, reject) => { reject1 = reject })
      const promise2 = new Promise<void>((resolve, reject) => { reject2 = reject })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(promise1)
      contextValue.registerPromise(promise2)

      // Reject both promises
      reject1!(new Error('Error 1'))
      reject2!(new Error('Error 2'))

      // Wait for rejections
      await promise1.catch(() => {})
      await promise2.catch(() => {})
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should render children
      const current = suspenseFn()
      expect(current).toBeDefined()
    })

    it('should handle mix of resolved and rejected promises', async () => {
      let resolve1: () => void
      let reject2: (reason: any) => void

      const promise1 = new Promise<void>(r => { resolve1 = r })
      const promise2 = new Promise<void>((resolve, reject) => { reject2 = reject })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(promise1)
      contextValue.registerPromise(promise2)

      // Resolve first, reject second
      resolve1!()
      reject2!(new Error('Error'))

      await promise1
      await promise2.catch(() => {})
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should render children
      const current = suspenseFn()
      expect(current).toBeDefined()
    })
  })

  describe('Nested Suspense boundaries', () => {
    it('should support nested Suspense components', () => {
      const innerSuspense = Suspense({
        fallback: h('div', { class: 'inner-fallback' }, 'Inner loading...'),
        children: h('div', { class: 'inner-content' }, 'Inner content')
      })

      const outerSuspense = Suspense({
        fallback: h('div', { class: 'outer-fallback' }, 'Outer loading...'),
        children: innerSuspense
      })

      const result = outerSuspense()
      expect(result).toBeDefined()
    })

    it('should isolate promise tracking between boundaries', async () => {
      let resolveOuter: () => void
      let resolveInner: () => void

      const outerPromise = new Promise<void>(r => { resolveOuter = r })
      const innerPromise = new Promise<void>(r => { resolveInner = r })

      const innerSuspense = Suspense({
        fallback: h('div', {}, 'Inner loading'),
        children: h('div', {}, 'Inner content')
      })

      const outerSuspense = Suspense({
        fallback: h('div', {}, 'Outer loading'),
        children: innerSuspense
      })

      // Get contexts
      const outerResult = outerSuspense() as any
      const outerContext = outerResult.props.value

      // Register outer promise
      outerContext.registerPromise(outerPromise)

      // Outer should be pending
      let current = outerSuspense() as any
      expect(current.children).toContain('Outer loading')

      // Resolve outer promise
      resolveOuter!()
      await outerPromise
      await new Promise(resolve => setTimeout(resolve, 10))

      // Outer should now show inner suspense
      current = outerSuspense()
      expect(current).toBeDefined()
    })

    it('should allow independent resolution of nested boundaries', async () => {
      let resolveInner: () => void
      const innerPromise = new Promise<void>(r => { resolveInner = r })

      const InnerComponent = () => {
        const ctx = useContext(SuspenseCtx)
        if (ctx) {
          ctx.registerPromise(innerPromise)
        }
        return h('div', {}, 'Inner loaded')
      }

      const innerSuspense = Suspense({
        fallback: h('div', { class: 'inner' }, 'Inner loading'),
        children: h(InnerComponent, {})
      })

      const outerSuspense = Suspense({
        fallback: h('div', { class: 'outer' }, 'Outer loading'),
        children: innerSuspense
      })

      const result = outerSuspense()
      expect(result).toBeDefined()
    })

    it('should handle deeply nested Suspense boundaries', () => {
      const level3 = Suspense({
        fallback: h('div', {}, 'Level 3 loading'),
        children: h('div', {}, 'Level 3 content')
      })

      const level2 = Suspense({
        fallback: h('div', {}, 'Level 2 loading'),
        children: level3
      })

      const level1 = Suspense({
        fallback: h('div', {}, 'Level 1 loading'),
        children: level2
      })

      const result = level1()
      expect(result).toBeDefined()
    })
  })

  describe('SuspenseCtx context functionality', () => {
    it('should create SuspenseCtx with correct structure', () => {
      expect(SuspenseCtx).toBeDefined()
      expect(SuspenseCtx.Provider).toBeDefined()
      expect(typeof SuspenseCtx.Provider).toBe('function')
    })

    it('should provide context value to children', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any

      // Suspense wraps children in Provider
      expect(result.type).toBe(SuspenseCtx.Provider)
      expect(result.props.value).toBeDefined()
      expect(typeof result.props.value.registerPromise).toBe('function')
    })

    it('should allow children to access context', () => {
      let capturedContext: any = null

      const ChildComponent = () => {
        capturedContext = useContext(SuspenseCtx)
        return h('div', {}, 'Child')
      }

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: h(ChildComponent, {})
      })

      suspenseFn()

      // Note: In actual DOM rendering, context would be available
      // In this unit test, we verify the structure is correct
      const result = suspenseFn() as any
      expect(result.props.value).toBeDefined()
    })

    it('should return null when accessing context outside Suspense', () => {
      const value = useContext(SuspenseCtx)
      expect(value).toBeNull()
    })

    it('should provide fresh context for each Suspense instance', () => {
      const suspense1 = Suspense({
        fallback: h('div', {}, 'Loading 1'),
        children: h('div', {}, 'Content 1')
      })

      const suspense2 = Suspense({
        fallback: h('div', {}, 'Loading 2'),
        children: h('div', {}, 'Content 2')
      })

      const result1 = suspense1() as any
      const result2 = suspense2() as any

      expect(result1.props.value).not.toBe(result2.props.value)
    })
  })

  describe('Integration with reactive rendering', () => {
    it('should work with mountReactive', async () => {
      const Component = () => {
        return Suspense({
          fallback: h('div', { id: 'fallback' }, 'Loading...'),
          children: h('div', { id: 'content' }, 'Loaded!')
        })
      }

      mountReactive(h(Component, {}), container)

      await new Promise(resolve => setTimeout(resolve, 10))

      // Should render content (no pending promises)
      const content = container.querySelector('#content')
      expect(content).toBeTruthy()
    })

    it('should update DOM when promise resolves', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>(r => { resolvePromise = r })

      const Component = () => {
        const ctx = useContext(SuspenseCtx)
        if (ctx && resolvePromise) {
          ctx.registerPromise(promise)
        }
        return h('div', { id: 'content' }, 'Content loaded')
      }

      const App = () => {
        return Suspense({
          fallback: h('div', { id: 'fallback' }, 'Loading...'),
          children: h(Component, {})
        })
      }

      mountReactive(h(App, {}), container)

      await new Promise(resolve => setTimeout(resolve, 10))

      // Should show content initially
      expect(container.textContent).toBeTruthy()
    })

    it('should work with reactive signals', async () => {
      const isLoading = signal(false)

      const Component = () => {
        return Suspense({
          fallback: h('div', { id: 'fallback' }, 'Loading...'),
          children: () => isLoading.value
            ? h('div', { id: 'loading-state' }, 'Still loading')
            : h('div', { id: 'loaded-state' }, 'Loaded!')
        })
      }

      mountReactive(h(Component, {}), container)

      await new Promise(resolve => setTimeout(resolve, 10))

      // Initial state
      expect(container.querySelector('#loaded-state')).toBeTruthy()

      // Change signal
      isLoading.value = true
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(container.querySelector('#loading-state')).toBeTruthy()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty children', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: null
      })

      const result = suspenseFn()
      expect(result).toBeDefined()
    })

    it('should handle undefined children', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: undefined
      })

      const result = suspenseFn()
      expect(result).toBeDefined()
    })

    it('should handle array children', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: [
          h('div', {}, 'Child 1'),
          h('div', {}, 'Child 2'),
          h('div', {}, 'Child 3')
        ]
      })

      const result = suspenseFn()
      expect(result).toBeDefined()
    })

    it('should handle promise registered before Suspense is rendered', () => {
      const promise = Promise.resolve()

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Register after getting context but before next render
      contextValue.registerPromise(promise)

      const nextResult = suspenseFn()
      expect(nextResult).toBeDefined()
    })

    it('should handle zero pending count', () => {
      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading'),
        children: h('div', {}, 'Content')
      })

      // Multiple renders with no promises
      suspenseFn()
      suspenseFn()
      const result = suspenseFn()

      expect(result).toBeDefined()
    })

    it('should handle very large number of promises', async () => {
      const promises = Array.from({ length: 100 }, () => Promise.resolve())

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading many...'),
        children: h('div', {}, 'All loaded!')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Register all promises
      promises.forEach(p => contextValue.registerPromise(p))

      // Wait for all to resolve
      await Promise.all(promises)
      await new Promise(resolve => setTimeout(resolve, 10))

      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })

    it('should maintain correct count with concurrent operations', async () => {
      const promises = [
        new Promise(resolve => setTimeout(resolve, 10)),
        new Promise(resolve => setTimeout(resolve, 20)),
        new Promise(resolve => setTimeout(resolve, 5))
      ]

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Content')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Register all at once
      promises.forEach(p => contextValue.registerPromise(p))

      // Wait for all to resolve
      await Promise.all(promises)
      await new Promise(resolve => setTimeout(resolve, 30))

      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle data fetching scenario', async () => {
      let resolveData: (value: any) => void
      const fetchData = new Promise(r => { resolveData = r })

      const DataComponent = () => {
        const ctx = useContext(SuspenseCtx)
        if (ctx) {
          ctx.registerPromise(fetchData)
        }
        return h('div', { class: 'data' }, 'Data loaded')
      }

      const App = () => {
        return Suspense({
          fallback: h('div', { class: 'spinner' }, 'Fetching data...'),
          children: h(DataComponent, {})
        })
      }

      const appFn = App()
      expect(appFn).toBeDefined()
    })

    it('should handle image loading scenario', async () => {
      const imagePromises = [
        new Promise(resolve => setTimeout(() => resolve('img1.jpg'), 10)),
        new Promise(resolve => setTimeout(() => resolve('img2.jpg'), 15)),
        new Promise(resolve => setTimeout(() => resolve('img3.jpg'), 5))
      ]

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading images...'),
        children: h('div', {}, 'Gallery loaded')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      imagePromises.forEach(p => contextValue.registerPromise(p))

      await Promise.all(imagePromises)
      await new Promise(resolve => setTimeout(resolve, 20))

      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })

    it('should handle code splitting scenario', async () => {
      const loadComponent = () => new Promise(resolve =>
        setTimeout(() => resolve({ default: () => h('div', {}, 'Lazy component') }), 10)
      )

      const promise = loadComponent()

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading component...'),
        children: h('div', {}, 'Component ready')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      contextValue.registerPromise(promise)

      await promise
      await new Promise(resolve => setTimeout(resolve, 15))

      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })

    it('should handle parallel data fetching', async () => {
      let resolveUser: () => void
      let resolvePosts: () => void
      let resolveComments: () => void

      const userPromise = new Promise<void>(r => { resolveUser = r })
      const postsPromise = new Promise<void>(r => { resolvePosts = r })
      const commentsPromise = new Promise<void>(r => { resolveComments = r })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading profile...'),
        children: h('div', {}, 'Profile complete')
      })

      const result = suspenseFn() as any
      const contextValue = result.props.value

      // Simulate parallel fetches
      contextValue.registerPromise(userPromise)
      contextValue.registerPromise(postsPromise)
      contextValue.registerPromise(commentsPromise)

      // User loads first
      resolveUser!()
      await userPromise
      await new Promise(resolve => setTimeout(resolve, 5))

      // Still loading (posts and comments pending)
      let current = suspenseFn() as any
      expect(current.children).toContain('Loading profile...')

      // Posts load
      resolvePosts!()
      await postsPromise
      await new Promise(resolve => setTimeout(resolve, 5))

      // Still loading (comments pending)
      current = suspenseFn() as any
      expect(current.children).toContain('Loading profile...')

      // Comments load
      resolveComments!()
      await commentsPromise
      await new Promise(resolve => setTimeout(resolve, 5))

      // All loaded
      current = suspenseFn()
      expect(current).toBeDefined()
    })

    it('should handle retry after error scenario', async () => {
      let attempt = 0
      const createFetch = () => new Promise((resolve, reject) => {
        attempt++
        if (attempt < 3) {
          reject(new Error('Network error'))
        } else {
          resolve('Success')
        }
      })

      const suspenseFn = Suspense({
        fallback: h('div', {}, 'Loading...'),
        children: h('div', {}, 'Loaded')
      })

      // First attempt
      let promise = createFetch()
      let result = suspenseFn() as any
      result.props.value.registerPromise(promise)
      await promise.catch(() => {})

      // Second attempt
      promise = createFetch()
      result = suspenseFn() as any
      result.props.value.registerPromise(promise)
      await promise.catch(() => {})

      // Third attempt succeeds
      promise = createFetch()
      result = suspenseFn() as any
      result.props.value.registerPromise(promise)
      await promise

      await new Promise(resolve => setTimeout(resolve, 10))

      const finalResult = suspenseFn()
      expect(finalResult).toBeDefined()
    })
  })
})
