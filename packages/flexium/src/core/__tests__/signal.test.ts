/**
 * Signal System Tests
 *
 * Tests for fine-grained reactivity primitives
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signal, computed, effect, sync, untrack, root } from '../signal'

describe('Signal System', () => {
  describe('signal()', () => {
    it('should create a signal with initial value', () => {
      const count = signal(0)
      expect(count.value).toBe(0)
    })

    it('should update value', () => {
      const count = signal(0)
      count.value = 5
      expect(count.value).toBe(5)
    })

    it('should support function call syntax for reading', () => {
      const count = signal(42)
      expect(count()).toBe(42)
    })

    it('should support set() method', () => {
      const count = signal(0)
      count.set(10)
      expect(count.value).toBe(10)
    })

    it('should peek without tracking dependencies', () => {
      const count = signal(0)
      let runCount = 0

      effect(() => {
        count.peek() // Should not track
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 1
      expect(runCount).toBe(1) // Should not trigger
    })

    it('should only notify on actual changes', () => {
      const count = signal(0)
      let runCount = 0

      effect(() => {
        count.value
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 0 // Same value
      expect(runCount).toBe(1) // Should not trigger
    })
  })

  describe('computed()', () => {
    it('should compute derived value', () => {
      const count = signal(2)
      const doubled = computed(() => count.value * 2)
      expect(doubled.value).toBe(4)
    })

    it('should update when dependency changes', () => {
      const count = signal(2)
      const doubled = computed(() => count.value * 2)

      expect(doubled.value).toBe(4)
      count.value = 3
      expect(doubled.value).toBe(6)
    })

    it('should support function call syntax', () => {
      const count = signal(5)
      const doubled = computed(() => count.value * 2)
      expect(doubled()).toBe(10)
    })

    it('should memoize computed values', () => {
      const count = signal(1)
      let computeCount = 0

      const doubled = computed(() => {
        computeCount++
        return count.value * 2
      })

      expect(doubled.value).toBe(2)
      expect(computeCount).toBe(1)

      // Multiple reads should not recompute
      expect(doubled.value).toBe(2)
      expect(doubled.value).toBe(2)
      expect(computeCount).toBe(1)
    })

    it('should only recompute when dependencies change', () => {
      const a = signal(1)
      const b = signal(2)
      let computeCount = 0

      const sum = computed(() => {
        computeCount++
        return a.value + b.value
      })

      expect(sum.value).toBe(3)
      expect(computeCount).toBe(1)

      a.value = 2
      expect(sum.value).toBe(4)
      expect(computeCount).toBe(2)
    })

    it('should support chained computeds', () => {
      const count = signal(2)
      const doubled = computed(() => count.value * 2)
      const quadrupled = computed(() => doubled.value * 2)

      expect(quadrupled.value).toBe(8)
      count.value = 3
      expect(quadrupled.value).toBe(12)
    })

    it('should peek without tracking dependencies', () => {
      const count = signal(0)
      let runCount = 0

      const doubled = computed(() => count.value * 2)

      effect(() => {
        doubled.peek() // Should not track
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 1
      expect(runCount).toBe(1) // Should not trigger
    })
  })

  describe('effect()', () => {
    it('should run immediately', () => {
      let runCount = 0
      effect(() => {
        runCount++
      })
      expect(runCount).toBe(1)
    })

    it('should track dependencies and re-run', () => {
      const count = signal(0)
      let runCount = 0

      effect(() => {
        count.value
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 1
      sync()
      expect(runCount).toBe(2)
    })

    it('should track multiple dependencies', () => {
      const firstName = signal('John')
      const lastName = signal('Doe')
      let fullName = ''

      effect(() => {
        fullName = `${firstName.value} ${lastName.value}`
      })

      expect(fullName).toBe('John Doe')

      firstName.value = 'Jane'
      sync()
      expect(fullName).toBe('Jane Doe')

      lastName.value = 'Smith'
      sync()
      expect(fullName).toBe('Jane Smith')
    })

    it('should support cleanup functions', () => {
      const count = signal(0)
      const cleanups: number[] = []

      const dispose = effect(() => {
        const value = count.value
        return () => {
          cleanups.push(value)
        }
      })

      count.value = 1
      sync()
      count.value = 2
      sync()
      dispose()

      expect(cleanups).toEqual([0, 1, 2])
    })

    it('should return dispose function', () => {
      const count = signal(0)
      let runCount = 0

      const dispose = effect(() => {
        count.value
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 1
      sync()
      expect(runCount).toBe(2)

      dispose()
      count.value = 2
      expect(runCount).toBe(2) // Should not run after dispose
    })

    it('should handle errors with onError option', () => {
      const count = signal(0)
      const errors: Error[] = []

      effect(
        () => {
          if (count.value > 0) {
            throw new Error('Test error')
          }
        },
        {
          onError: (error) => {
            errors.push(error)
          },
        }
      )

      count.value = 1
      sync()
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toBe('Test error')
    })

    it('should dynamically track dependencies', () => {
      const showCount = signal(true)
      const count = signal(0)
      let runCount = 0

      effect(() => {
        runCount++
        if (showCount.value) {
          count.value
        }
      })

      expect(runCount).toBe(1)

      // count is tracked
      count.value = 1
      sync()
      expect(runCount).toBe(2)

      // Remove count dependency
      showCount.value = false
      sync()
      expect(runCount).toBe(3)

      // count is no longer tracked
      count.value = 2
      expect(runCount).toBe(3)
    })
  })

  describe('sync()', () => {
    it('should batch multiple updates', () => {
      const count = signal(0)
      const name = signal('John')
      let runCount = 0

      effect(() => {
        count.value
        name.value
        runCount++
      })

      expect(runCount).toBe(1)

      sync(() => {
        count.value = 1
        name.value = 'Jane'
      })

      expect(runCount).toBe(2) // Only ran once after batch
    })

    it('should handle nested batches', () => {
      const count = signal(0)
      let runCount = 0

      effect(() => {
        count.value
        runCount++
      })

      expect(runCount).toBe(1)

      sync(() => {
        count.value = 1
        sync(() => {
          count.value = 2
        })
        count.value = 3
      })

      expect(runCount).toBe(2) // Only ran once after all batches
    })

    it('should run effects only once per batch', () => {
      const a = signal(1)
      const b = signal(2)
      const c = signal(3)
      let runCount = 0

      effect(() => {
        a.value + b.value + c.value
        runCount++
      })

      expect(runCount).toBe(1)

      sync(() => {
        a.value = 10
        b.value = 20
        c.value = 30
      })

      expect(runCount).toBe(2)
    })
  })

  describe('untrack()', () => {
    it('should read signals without tracking', () => {
      const count = signal(0)
      let runCount = 0

      effect(() => {
        untrack(() => count.value)
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 1
      expect(runCount).toBe(1) // Should not trigger
    })

    it('should allow reading values in effects without dependencies', () => {
      const a = signal(1)
      const b = signal(2)
      let result = 0

      effect(() => {
        result = a.value + untrack(() => b.value)
      })

      expect(result).toBe(3)

      // Only a should trigger
      a.value = 10
      sync()
      expect(result).toBe(12)

      // b should not trigger
      b.value = 20
      expect(result).toBe(12)
    })
  })

  describe('root()', () => {
    it('should create a disposal scope', () => {
      const count = signal(0)
      let runCount = 0

      const dispose = root((dispose) => {
        effect(() => {
          count.value
          runCount++
        })
        return dispose
      })

      expect(runCount).toBe(1)
      count.value = 1
      sync()
      expect(runCount).toBe(2)

      dispose()
      count.value = 2
      expect(runCount).toBe(2) // Should not run after disposal
    })
  })

  describe('Performance', () => {
    it('should handle large dependency graphs efficiently', () => {
      const signals = Array.from({ length: 100 }, (_, i) => signal(i))
      const sum = computed(() => signals.reduce((acc, s) => acc + s.value, 0))

      const start = performance.now()
      expect(sum.value).toBe(4950)
      const computeTime = performance.now() - start

      expect(computeTime).toBeLessThan(50) // Should be very fast (relaxed for CI)

      const updateStart = performance.now()
      signals[0].value = 100
      expect(sum.value).toBe(5050)
      const updateTime = performance.now() - updateStart

      expect(updateTime).toBeLessThan(5) // Updates should be instant
    })

    it('should handle deep effect chains', () => {
      const count = signal(1)
      const results: number[] = []

      // Create a chain of 50 computed values
      let current = computed(() => count.value)
      for (let i = 0; i < 49; i++) {
        const prev = current
        current = computed(() => prev.value + 1)
      }

      effect(() => {
        results.push(current.value)
      })

      expect(results[0]).toBe(50)

      const start = performance.now()
      count.value = 2
      sync()
      const updateTime = performance.now() - start

      expect(results[1]).toBe(51)
      expect(updateTime).toBeLessThan(10)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined and null values', () => {
      const value = signal<string | null>(null)
      expect(value.value).toBeNull()

      value.value = undefined as any
      expect(value.value).toBeUndefined()

      value.value = 'test'
      expect(value.value).toBe('test')
    })
  })
})
