/**
 * Comprehensive Signal System Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { signal, computed, effect, batch, untrack, flushSync } from '../signal'

describe('Signal System - Comprehensive', () => {
  describe('signal()', () => {
    it('should create a signal with initial value', () => {
      const count = signal(0)
      expect(count.value).toBe(0)
    })

    it('should update value via property setter', () => {
      const count = signal(0)
      count.value = 5
      expect(count.value).toBe(5)
    })

    it('should update value via set() method', () => {
      const count = signal(0)
      count.set(10)
      expect(count.value).toBe(10)
    })

    it('should support function call syntax for reading', () => {
      const count = signal(42)
      expect(count()).toBe(42)
    })

    it('should peek without tracking', () => {
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

    it('should memoize values', () => {
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

    it('should support chained computeds', () => {
      const count = signal(2)
      const doubled = computed(() => count.value * 2)
      const quadrupled = computed(() => doubled.value * 2)

      expect(quadrupled.value).toBe(8)
      count.value = 3
      expect(quadrupled.value).toBe(12)
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
      flushSync()
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
      flushSync()
      expect(fullName).toBe('Jane Doe')

      lastName.value = 'Smith'
      flushSync()
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
      flushSync()
      count.value = 2
      flushSync()
      dispose()

      expect(cleanups).toEqual([0, 1, 2])
    })

    it('should dispose and stop tracking', () => {
      const count = signal(0)
      let runCount = 0

      const dispose = effect(() => {
        count.value
        runCount++
      })

      expect(runCount).toBe(1)
      count.value = 1
      flushSync()
      expect(runCount).toBe(2)

      dispose()
      count.value = 2
      expect(runCount).toBe(2) // Should not run after dispose
    })
  })

  describe('batch()', () => {
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

      batch(() => {
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

      batch(() => {
        count.value = 1
        batch(() => {
          count.value = 2
        })
        count.value = 3
      })

      expect(runCount).toBe(2) // Only ran once after all batches
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

    it('should allow partial tracking', () => {
      const a = signal(1)
      const b = signal(2)
      let result = 0

      effect(() => {
        result = a.value + untrack(() => b.value)
      })

      expect(result).toBe(3)

      // Only a should trigger
      a.value = 10
      flushSync()
      expect(result).toBe(12)

      // b should not trigger
      b.value = 20
      expect(result).toBe(12)
    })
  })

  describe('Performance', () => {
    it('should handle large graphs', () => {
      const signals = Array.from({ length: 100 }, (_, i) => signal(i))
      const sum = computed(() => signals.reduce((acc, s) => acc + s.value, 0))

      expect(sum.value).toBe(4950)

      signals[0].value = 100
      expect(sum.value).toBe(5050)
    })
  })
})
