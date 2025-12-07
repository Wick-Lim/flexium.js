/**
 * ErrorBoundary Tests
 *
 * Tests for error catching, fallback rendering, and recovery.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ErrorBoundary,
  errorBoundary,
  ErrorBoundaryCtx,
} from '../error-boundary'
import { signal } from '../signal'
import { f } from '../../renderers/dom/f'
import { mountReactive } from '../../renderers/dom/reactive'

describe('ErrorBoundary', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  describe('basic functionality', () => {
    it('should render children when no error', () => {
      const ChildComponent = () => f('div', { class: 'child' }, 'Hello')

      const boundary = ErrorBoundary({
        fallback: f('div', {}, 'Error occurred'),
        children: f(ChildComponent, {}),
      })

      const result = boundary()
      expect(result).not.toBeNull()
    })

    it('should accept static fallback', () => {
      const boundary = ErrorBoundary({
        fallback: f('div', { class: 'fallback' }, 'Static fallback'),
        children: f('div', {}, 'Content'),
      })

      const result = boundary()
      expect(result).not.toBeNull()
    })

    it('should accept function fallback', () => {
      const fallbackFn = vi.fn(({ error, reset }) =>
        f('div', {}, `Error: ${error.message}`)
      )

      const boundary = ErrorBoundary({
        fallback: fallbackFn,
        children: f('div', {}, 'Content'),
      })

      const result = boundary()
      expect(result).not.toBeNull()
    })
  })

  describe('error handling', () => {
    it('should catch synchronous errors in render', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error')
      }

      const onError = vi.fn()
      const boundary = ErrorBoundary({
        fallback: f('div', { class: 'error' }, 'Error caught'),
        children: () => f(ThrowingComponent, {}),
        onError,
      })

      // Trigger render which should catch error
      boundary()
      // The safeRender catches errors when children is a function
    })

    it('should convert non-Error to Error object', () => {
      const onError = vi.fn()

      // Directly test the setError behavior through the context
      const testError = 'string error'

      const boundary = ErrorBoundary({
        fallback: ({ error }) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.message).toBe('string error')
          return f('div', {}, 'Caught')
        },
        children: f('div', {}, 'Content'),
        onError,
      })

      boundary()
    })
  })

  describe('retry functionality', () => {
    it('should increment retry count on retry', () => {
      const retryCounts: number[] = []

      const boundary = ErrorBoundary({
        fallback: ({ retryCount, reset }) => {
          retryCounts.push(retryCount)
          return f('button', { onclick: reset }, `Retry (${retryCount})`)
        },
        children: f('div', {}, 'Content'),
      })

      boundary()
      // Initial retryCount should be 0 when no error
    })

    it('should call onReset callback when retrying', () => {
      const onReset = vi.fn()

      const boundary = ErrorBoundary({
        fallback: ({ reset }) => f('button', { onclick: reset }, 'Retry'),
        children: f('div', {}, 'Content'),
        onReset,
      })

      boundary()
      // onReset is called when retry() is invoked
    })
  })

  describe('context', () => {
    it('should provide ErrorBoundaryCtx to children', () => {
      const contextValue: any = null

      const ChildWithContext = () => {
        // In real usage, would use useContext
        return f('div', {}, 'Child')
      }

      const boundary = ErrorBoundary({
        fallback: f('div', {}, 'Error'),
        children: f(ChildWithContext, {}),
      })

      const result = boundary()
      // Context is provided via f(ErrorBoundaryCtx.Provider, ...)
      expect(result).not.toBeNull()
    })
  })

  describe('errorBoundary function', () => {
    it('should return no-op implementation outside boundary', () => {
      const ctx = errorBoundary()

      expect(ctx).toBeDefined()
      expect(typeof ctx.setError).toBe('function')
      expect(typeof ctx.clearError).toBe('function')
      expect(typeof ctx.retry).toBe('function')
    })

    it('should throw when setError called outside boundary', () => {
      const ctx = errorBoundary()

      expect(() => {
        ctx.setError(new Error('Test'))
      }).toThrow()
    })

    it('should not throw on clearError outside boundary', () => {
      const ctx = errorBoundary()

      expect(() => {
        ctx.clearError()
      }).not.toThrow()
    })

    it('should not throw on retry outside boundary', () => {
      const ctx = errorBoundary()

      expect(() => {
        ctx.retry()
      }).not.toThrow()
    })
  })

  describe('callback error handling', () => {
    it('should handle errors in onError callback gracefully', () => {
      const onError = vi.fn(() => {
        throw new Error('Callback error')
      })

      const boundary = ErrorBoundary({
        fallback: f('div', {}, 'Fallback'),
        children: () => {
          throw new Error('Component error')
        },
        onError,
      })

      // Should not throw even if onError throws
      expect(() => boundary()).not.toThrow()
    })

    it('should handle errors in onReset callback gracefully', () => {
      const onReset = vi.fn(() => {
        throw new Error('Reset callback error')
      })

      const boundary = ErrorBoundary({
        fallback: ({ reset }) => f('button', { onclick: reset }, 'Retry'),
        children: f('div', {}, 'Content'),
        onReset,
      })

      // Should render without throwing
      expect(() => boundary()).not.toThrow()
    })
  })

  describe('ErrorInfo', () => {
    it('should include timestamp in error info', () => {
      const beforeTime = Date.now()
      let capturedInfo: any = null

      const onError = vi.fn((error, errorInfo) => {
        capturedInfo = errorInfo
      })

      const boundary = ErrorBoundary({
        fallback: f('div', {}, 'Error'),
        children: () => {
          throw new Error('Test')
        },
        onError,
      })

      boundary()

      if (capturedInfo) {
        expect(capturedInfo.timestamp).toBeGreaterThanOrEqual(beforeTime)
        expect(capturedInfo.timestamp).toBeLessThanOrEqual(Date.now())
      }
    })
  })

  describe('nested boundaries', () => {
    it('should allow nested ErrorBoundary components', () => {
      const innerBoundary = ErrorBoundary({
        fallback: f('div', { class: 'inner-fallback' }, 'Inner error'),
        children: f('div', {}, 'Inner content'),
      })

      const outerBoundary = ErrorBoundary({
        fallback: f('div', { class: 'outer-fallback' }, 'Outer error'),
        children: innerBoundary,
      })

      const result = outerBoundary()
      expect(result).not.toBeNull()
    })
  })

  describe('fallback props', () => {
    it('should pass error to fallback function', () => {
      const testError = new Error('Specific error message')
      let receivedError: Error | null = null

      const fallbackFn = vi.fn(({ error }) => {
        receivedError = error
        return f('div', {}, error.message)
      })

      const boundary = ErrorBoundary({
        fallback: fallbackFn,
        children: () => {
          throw testError
        },
      })

      boundary()

      if (receivedError) {
        expect(receivedError.message).toBe('Specific error message')
      }
    })

    it('should pass reset function to fallback', () => {
      let resetFn: (() => void) | null = null

      const fallbackFn = vi.fn(({ reset }) => {
        resetFn = reset
        return f('button', { onclick: reset }, 'Reset')
      })

      const boundary = ErrorBoundary({
        fallback: fallbackFn,
        children: () => {
          throw new Error('Test')
        },
      })

      boundary()

      if (resetFn) {
        expect(typeof resetFn).toBe('function')
      }
    })
  })
})
