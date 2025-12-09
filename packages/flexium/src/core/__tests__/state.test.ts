/**
 * State API Tests
 *
 * Tests for the unified state() API with StateProxy
 *
 * Note: state() returns a Proxy that behaves like the value.
 * Use +proxy for numbers, String(proxy) for strings, or proxy == value for comparison.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { state, STATE_SIGNAL } from '../state'
import { effect } from '../signal'

// Helper to wait for microtasks
const tick = () => new Promise(resolve => queueMicrotask(resolve))
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to extract primitive value from StateProxy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const val = <T>(proxy: T): T => {
  if (proxy && (typeof proxy === 'object' || typeof proxy === 'function') && STATE_SIGNAL in (proxy as object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (proxy as any)[STATE_SIGNAL].value
  }
  return proxy
}

describe('State API', () => {
  beforeEach(() => {
    state.clear()
  })

  describe('Local Value State', () => {
    it('should create state with initial value', () => {
      const [count] = state(0)
      expect(val(count)).toBe(0)
      // Also verify arithmetic works
      expect(+count).toBe(0)
      expect(count + 1).toBe(1)
    })

    it('should update state with setter', async () => {
      let currentCount = 0

      effect(() => {
        const [count, setCount] = state(0, { key: 'counter1' })
        currentCount = +count

        if (+count === 0) {
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
        currentCount = +count

        if (+count === 10) {
          setCount((prev) => prev + 5)
        }
      })

      await tick()
      await tick()
      expect(currentCount).toBe(15)
    })

    it('should handle string values', () => {
      const [name] = state('Alice')
      expect(String(name)).toBe('Alice')
      expect(`Hello ${name}`).toBe('Hello Alice')
    })

    it('should handle object values', () => {
      const [user] = state({ name: 'Alice', age: 25 })
      expect(val(user)).toEqual({ name: 'Alice', age: 25 })
      // Proxy allows property access
      expect(user.name).toBe('Alice')
      expect(user.age).toBe(25)
    })

    it('should handle array values', () => {
      const [items] = state(['a', 'b', 'c'])
      expect(val(items)).toEqual(['a', 'b', 'c'])
      expect(items.length).toBe(3)
      expect(items[0]).toBe('a')
    })

    it('should handle null and undefined', () => {
      const [value] = state<string | null>(null)
      expect(val(value)).toBeNull()
    })

    it('should handle boolean values', () => {
      const [flag] = state(false)
      expect(val(flag)).toBe(false)
    })
  })

  describe('Global Keyed State', () => {
    it('should create global state with key', () => {
      const [theme] = state('light', { key: 'theme' })
      expect(String(theme)).toBe('light')
    })

    it('should share state with same key', async () => {
      let theme1Val = ''

      effect(() => {
        const [theme1, setTheme1] = state('light', { key: 'shared-theme' })
        theme1Val = String(theme1)

        if (String(theme1) === 'light') {
          setTheme1('dark')
        }
      })

      await tick()
      await tick()

      // Second access should get updated value
      const [theme2] = state('light', { key: 'shared-theme' })

      expect(theme1Val).toBe('dark')
      expect(String(theme2)).toBe('dark')
    })

    it('should not share state with different keys', () => {
      const [count1] = state(5, { key: 'count-a' })
      const [count2] = state(10, { key: 'count-b' })

      expect(+count1).toBe(5)
      expect(+count2).toBe(10)
    })

    it('should persist value across multiple accesses', async () => {
      effect(() => {
        const [, setCounter] = state(0, { key: 'persistent-counter' })
        setCounter(42)
      })

      await tick()

      const [counter2] = state(0, { key: 'persistent-counter' })
      expect(+counter2).toBe(42)
    })

    it('should clear global state registry', async () => {
      effect(() => {
        const [, setCount] = state(100, { key: 'clear-test' })
        setCount(100)
      })

      await tick()
      state.clear()

      const [count2] = state(0, { key: 'clear-test' })
      expect(+count2).toBe(0)
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
        const [v, setVal] = state(0, { key: 'direct-val' })
        currentVal = +v
        if (+v === 0) setVal(42)
      })

      await tick()
      await tick()
      expect(currentVal).toBe(42)
    })

    it('should accept updater function', async () => {
      let currentVal = 0

      effect(() => {
        const [v, setVal] = state(10, { key: 'updater-fn' })
        currentVal = +v
        if (+v === 10) setVal((prev) => prev * 2)
      })

      await tick()
      await tick()
      expect(currentVal).toBe(20)
    })
  })

  describe('Async Resource State', () => {
    it('should create state with async function', async () => {
      const result = state(async () => {
        return 'fetched data'
      })
      // Runtime returns 4 elements for async, but TS can't infer this
      const [, refetch, status] = result as unknown as [unknown, () => void, unknown, unknown]

      expect(typeof refetch).toBe('function')
      // status is now a callable proxy (function type) returning AsyncStatus
      expect(typeof status).toBe('function')
      expect(val(status)).toBe('loading') // Initially loading
    })

    it('should return refetch function', () => {
      const result = state(async () => 'data')
      const [, refetch] = result as unknown as [unknown, () => void, unknown, unknown]
      expect(typeof refetch).toBe('function')
    })

    it('should return status proxy', () => {
      const result = state(async () => 'data')
      const [, , status] = result as unknown as [unknown, unknown, unknown, unknown]
      // status is a callable proxy (function type)
      expect(typeof status).toBe('function')
      // status should be 'idle' | 'loading' | 'success' | 'error'
      expect(['idle', 'loading', 'success', 'error']).toContain(val(status))
    })

    it('should return error proxy', () => {
      const result = state(async () => 'data')
      const [, , , error] = result as unknown as [unknown, unknown, unknown, unknown]
      expect(val(error)).toBeUndefined()
    })

    it('should resolve async data', async () => {
      const [data] = state(async () => {
        await sleep(10)
        return 'resolved'
      }, { key: 'async-resolve' })

      await sleep(50)

      const [data2] = state(async () => 'resolved', { key: 'async-resolve' })
      expect(val(data2)).toBe('resolved')
    })
  })

  describe('StateProxy Features', () => {
    it('should work with arithmetic operations', () => {
      const [count] = state(5)
      expect(count + 10).toBe(15)
      expect(count * 2).toBe(10)
      expect(count - 3).toBe(2)
    })

    it('should work with template literals', () => {
      const [name] = state('World')
      expect(`Hello, ${name}!`).toBe('Hello, World!')
    })

    it('should work with loose equality', () => {
      const [count] = state(5)
      expect(count == 5).toBe(true)
      expect(count == '5').toBe(true)
    })

    it('should update proxy value when signal changes', async () => {
      const [count, setCount] = state(0, { key: 'update-test' })
      expect(+count).toBe(0)

      setCount(10)
      await tick()

      // Same proxy should now return updated value
      expect(+count).toBe(10)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty key string', () => {
      const [count] = state(5, { key: '' })
      expect(+count).toBe(5)
    })

    it('should handle rapid updates in effect', async () => {
      let finalCount = 0
      let iterations = 0

      effect(() => {
        const [count, setCount] = state(0, { key: 'rapid-update' })
        finalCount = +count
        iterations++

        if (+count < 5 && iterations < 10) {
          setCount(+count + 1)
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

      expect(val(data)).toEqual({
        user: { name: 'Alice', settings: { theme: 'light' } },
      })
      expect(data.user.name).toBe('Alice')
      expect(data.user.settings.theme).toBe('light')
    })

    it('should handle array of objects', () => {
      const [todos] = state([
        { id: 1, text: 'Learn Flexium', done: false },
      ])

      expect(todos.length).toBe(1)
      expect(todos[0].text).toBe('Learn Flexium')
    })

    it('should support array methods', () => {
      const [items] = state([1, 2, 3])
      // .map() returns a regular array, reconciliation happens at render layer
      expect(items.map((x: number) => x * 2)).toEqual([2, 4, 6])
      expect(items.filter((x: number) => x > 1)).toEqual([2, 3])
    })
  })

  describe('Array Keys', () => {
    it('should support array key', () => {
      const [user] = state({ name: 'Alice' }, { key: ['user', 'profile', 123] })
      expect(user.name).toBe('Alice')
    })

    it('should share state with same array key', async () => {
      const [, setUser] = state({ name: 'Alice' }, { key: ['user', 'profile', 123] })
      setUser({ name: 'Bob' })
      await tick()

      const [user2] = state({ name: 'Default' }, { key: ['user', 'profile', 123] })
      expect(user2.name).toBe('Bob')
    })

    it('should not share state with different array keys', () => {
      const [user1] = state({ name: 'Alice' }, { key: ['user', 123] })
      const [user2] = state({ name: 'Bob' }, { key: ['user', 456] })

      expect(user1.name).toBe('Alice')
      expect(user2.name).toBe('Bob')
    })

    it('should handle array key with various types', () => {
      const [data] = state('value', { key: ['app', 'user', 42, true, null] })
      expect(String(data)).toBe('value')
    })
  })

  describe('Params Option', () => {
    it('should pass params to sync function', () => {
      const [doubled] = state(
        (p: { value: number }) => p.value * 2,
        { params: { value: 5 } }
      )
      expect(+doubled).toBe(10)
    })

    it('should pass params to async function', async () => {
      // First call triggers fetch
      state(
        async (p: { id: number }) => {
          await sleep(10)
          return { id: p.id, name: `User ${p.id}` }
        },
        { key: ['user', 999], params: { id: 999 } }
      )

      await sleep(50)

      // Re-fetch from cache
      const [user2] = state(
        async (p: { id: number }) => ({ id: p.id, name: `User ${p.id}` }),
        { key: ['user', 999], params: { id: 999 } }
      )

      expect(user2.name).toBe('User 999')
    })

    it('should work with params and array key together', () => {
      const userId = 42
      const [user] = state(
        (p: { id: number }) => ({ id: p.id, name: `User ${p.id}` }),
        { key: ['user', userId], params: { id: userId } }
      )

      expect(user.name).toBe('User 42')
    })
  })

  describe('state.delete', () => {
    it('should return true when state exists', () => {
      state(42, { key: 'test-delete' })

      const result = state.delete('test-delete')
      expect(result).toBe(true)
    })

    it('should return false when state does not exist', () => {
      const result = state.delete('non-existent-key')
      expect(result).toBe(false)
    })

    it('should actually remove state from registry', () => {
      state(42, { key: 'test-removal' })

      expect(state.has('test-removal')).toBe(true)
      state.delete('test-removal')
      expect(state.has('test-removal')).toBe(false)
    })

    it('should work with string keys', () => {
      state('value', { key: 'string-key' })

      expect(state.delete('string-key')).toBe(true)
      expect(state.has('string-key')).toBe(false)
    })

    it('should work with array keys', () => {
      const arrayKey = ['user', 'profile', 123]
      state({ name: 'Alice' }, { key: arrayKey })

      expect(state.delete(arrayKey)).toBe(true)
      expect(state.has(arrayKey)).toBe(false)
    })

    it('should work with array keys containing various types', () => {
      const complexKey = ['app', 42, true, null, undefined]
      state('data', { key: complexKey })

      expect(state.delete(complexKey)).toBe(true)
      expect(state.has(complexKey)).toBe(false)
    })

    it('should not affect other states when deleting', () => {
      state(1, { key: 'state-1' })
      state(2, { key: 'state-2' })
      state(3, { key: 'state-3' })

      state.delete('state-2')

      expect(state.has('state-1')).toBe(true)
      expect(state.has('state-2')).toBe(false)
      expect(state.has('state-3')).toBe(true)
    })
  })

  describe('state.has', () => {
    it('should return true for existing states', () => {
      state('value', { key: 'existing-state' })

      expect(state.has('existing-state')).toBe(true)
    })

    it('should return false for non-existent states', () => {
      expect(state.has('non-existent')).toBe(false)
    })

    it('should work with string keys', () => {
      state(123, { key: 'numeric-state' })

      expect(state.has('numeric-state')).toBe(true)
      expect(state.has('other-state')).toBe(false)
    })

    it('should work with array keys', () => {
      const arrayKey = ['user', 'settings', 456]
      state({ theme: 'dark' }, { key: arrayKey })

      expect(state.has(arrayKey)).toBe(true)
    })

    it('should work with array keys containing various types', () => {
      const complexKey = ['app', 'data', 99, false, null]
      state('test', { key: complexKey })

      expect(state.has(complexKey)).toBe(true)
    })

    it('should return false after state is deleted', () => {
      state('temp', { key: 'temporary' })

      expect(state.has('temporary')).toBe(true)
      state.delete('temporary')
      expect(state.has('temporary')).toBe(false)
    })

    it('should return false after state.clear', () => {
      state('value1', { key: 'key1' })
      state('value2', { key: 'key2' })

      expect(state.has('key1')).toBe(true)
      expect(state.has('key2')).toBe(true)

      state.clear()

      expect(state.has('key1')).toBe(false)
      expect(state.has('key2')).toBe(false)
    })
  })

  describe('state.size', () => {
    it('should return 0 initially after state.clear', () => {
      state.clear()

      expect(state.size).toBe(0)
    })

    it('should return 0 when no keyed states exist', () => {
      state.clear()

      // Create state without key (should not be in global registry)
      state(42)

      expect(state.size).toBe(0)
    })

    it('should increment when adding keyed states', () => {
      state.clear()

      expect(state.size).toBe(0)

      state('value1', { key: 'key1' })
      expect(state.size).toBe(1)

      state('value2', { key: 'key2' })
      expect(state.size).toBe(2)

      state('value3', { key: 'key3' })
      expect(state.size).toBe(3)
    })

    it('should not increment when accessing existing keyed state', () => {
      state.clear()

      state('initial', { key: 'shared-key' })
      expect(state.size).toBe(1)

      // Access same key again - should not increment
      state('initial', { key: 'shared-key' })
      expect(state.size).toBe(1)
    })

    it('should decrement after state.delete', () => {
      state.clear()

      state('value1', { key: 'key1' })
      state('value2', { key: 'key2' })
      state('value3', { key: 'key3' })
      expect(state.size).toBe(3)

      state.delete('key2')
      expect(state.size).toBe(2)

      state.delete('key1')
      expect(state.size).toBe(1)

      state.delete('key3')
      expect(state.size).toBe(0)
    })

    it('should reset to 0 after state.clear', () => {
      state('value1', { key: 'key1' })
      state('value2', { key: 'key2' })
      state('value3', { key: 'key3' })
      expect(state.size).toBe(3)

      state.clear()
      expect(state.size).toBe(0)
    })

    it('should count states with array keys', () => {
      state.clear()

      state('value1', { key: ['user', 1] })
      expect(state.size).toBe(1)

      state('value2', { key: ['user', 2] })
      expect(state.size).toBe(2)

      state('value3', { key: ['post', 1] })
      expect(state.size).toBe(3)
    })

    it('should handle mixed string and array keys', () => {
      state.clear()

      state('string-key-value', { key: 'simple' })
      state('array-key-value', { key: ['complex', 'nested'] })

      expect(state.size).toBe(2)
    })

    it('should not count local unkeyed states', () => {
      state.clear()

      // Create multiple unkeyed states
      state(1)
      state(2)
      state(3)

      expect(state.size).toBe(0)

      // Add one keyed state
      state(4, { key: 'keyed' })
      expect(state.size).toBe(1)
    })
  })
})
