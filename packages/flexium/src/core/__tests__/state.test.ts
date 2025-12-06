/**
 * State API Tests
 *
 * Tests for the unified state() API
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { state, clearGlobalState } from '../state'
import { effect } from '../signal'

// Helper to wait for microtasks
const tick = () => new Promise(resolve => queueMicrotask(resolve))
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('State API', () => {
  beforeEach(() => {
    clearGlobalState()
  })

  describe('Local Value State', () => {
    it('should create state with initial value', () => {
      const [count] = state(0)
      expect(count).toBe(0)
    })

    it('should update state with setter', async () => {
      let currentCount = 0

      effect(() => {
        const [count, setCount] = state(0, { key: 'counter1' })
        currentCount = count

        if (count === 0) {
          setCount(5)
        }
      })

      await tick()
      await tick()
      expect(currentCount).toBe(5)
    })

    it('should update state with function setter', async () => {
      let currentCount = 0

      effect(() => {
        const [count, setCount] = state(10, { key: 'counter2' })
        currentCount = count

        if (count === 10) {
          setCount((prev) => prev + 5)
        }
      })

      await tick()
      await tick()
      expect(currentCount).toBe(15)
    })

    it('should handle string values', () => {
      const [name] = state('Alice')
      expect(name).toBe('Alice')
    })

    it('should handle object values', () => {
      const [user] = state({ name: 'Alice', age: 25 })
      expect(user).toEqual({ name: 'Alice', age: 25 })
    })

    it('should handle array values', () => {
      const [items] = state(['a', 'b', 'c'])
      expect(items).toEqual(['a', 'b', 'c'])
    })

    it('should handle null and undefined', () => {
      const [value] = state<string | null>(null)
      expect(value).toBeNull()
    })

    it('should handle boolean values', () => {
      const [flag] = state(false)
      expect(flag).toBe(false)
    })
  })

  describe('Global Keyed State', () => {
    it('should create global state with key', () => {
      const [theme] = state('light', { key: 'theme' })
      expect(theme).toBe('light')
    })

    it('should share state with same key', async () => {
      let theme1Val = ''

      effect(() => {
        const [theme1, setTheme1] = state('light', { key: 'shared-theme' })
        theme1Val = theme1

        if (theme1 === 'light') {
          setTheme1('dark')
        }
      })

      await tick()
      await tick()

      // Second access should get updated value
      const [theme2] = state('light', { key: 'shared-theme' })

      expect(theme1Val).toBe('dark')
      expect(theme2).toBe('dark')
    })

    it('should not share state with different keys', () => {
      const [count1] = state(5, { key: 'count-a' })
      const [count2] = state(10, { key: 'count-b' })

      expect(count1).toBe(5)
      expect(count2).toBe(10)
    })

    it('should persist value across multiple accesses', async () => {
      effect(() => {
        const [, setCounter] = state(0, { key: 'persistent-counter' })
        setCounter(42)
      })

      await tick()

      const [counter2] = state(0, { key: 'persistent-counter' })
      expect(counter2).toBe(42)
    })

    it('should clear global state registry', async () => {
      effect(() => {
        const [, setCount] = state(100, { key: 'clear-test' })
        setCount(100)
      })

      await tick()
      clearGlobalState()

      const [count2] = state(0, { key: 'clear-test' })
      expect(count2).toBe(0)
    })
  })

  describe('Setter Function', () => {
    it('should return a setter function', () => {
      const [, setCount] = state(0)
      expect(typeof setCount).toBe('function')
    })

    it('should accept direct value', async () => {
      let currentVal = 0

      effect(() => {
        const [val, setVal] = state(0, { key: 'direct-val' })
        currentVal = val
        if (val === 0) setVal(42)
      })

      await tick()
      await tick()
      expect(currentVal).toBe(42)
    })

    it('should accept updater function', async () => {
      let currentVal = 0

      effect(() => {
        const [val, setVal] = state(10, { key: 'updater-fn' })
        currentVal = val
        if (val === 10) setVal((prev) => prev * 2)
      })

      await tick()
      await tick()
      expect(currentVal).toBe(20)
    })
  })

  describe('Async Resource State', () => {
    it('should create state with async function', async () => {
      const [, refetch, isLoading] = state(async () => {
        return 'fetched data'
      })

      expect(typeof refetch).toBe('function')
      expect(typeof isLoading).toBe('boolean')
    })

    it('should return refetch function', () => {
      const [, refetch] = state(async () => 'data')
      expect(typeof refetch).toBe('function')
    })

    it('should return loading state', () => {
      const [, , isLoading] = state(async () => 'data')
      expect(typeof isLoading).toBe('boolean')
    })

    it('should return error', () => {
      const [, , , error] = state(async () => 'data')
      expect(error).toBeUndefined()
    })

    it('should resolve async data', async () => {
      const [data, refetch, isLoading] = state(async () => {
        await sleep(10)
        return 'resolved'
      }, { key: 'async-resolve' })

      await sleep(50)

      const [data2] = state(async () => 'resolved', { key: 'async-resolve' })
      expect(data2).toBe('resolved')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty key string', () => {
      const [count] = state(5, { key: '' })
      expect(count).toBe(5)
    })

    it('should handle rapid updates in effect', async () => {
      let finalCount = 0
      let iterations = 0

      effect(() => {
        const [count, setCount] = state(0, { key: 'rapid-update' })
        finalCount = count
        iterations++

        if (count < 5 && iterations < 10) {
          setCount(count + 1)
        }
      })

      // Wait for multiple iterations
      await sleep(50)
      expect(finalCount).toBe(5)
    })

    it('should handle nested object values', () => {
      const [data] = state({
        user: { name: 'Alice', settings: { theme: 'light' } },
      })

      expect(data).toEqual({
        user: { name: 'Alice', settings: { theme: 'light' } },
      })
    })

    it('should handle array of objects', () => {
      const [todos] = state([
        { id: 1, text: 'Learn Flexium', done: false },
      ])

      expect(todos).toHaveLength(1)
      expect(todos[0].text).toBe('Learn Flexium')
    })
  })
})
