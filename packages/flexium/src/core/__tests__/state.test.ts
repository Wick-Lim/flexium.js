/**
 * State API Tests
 *
 * Tests for the unified state() API
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { state, clearGlobalState } from '../state'

describe('State API', () => {
  beforeEach(() => {
    // Clear global state registry before each test
    clearGlobalState()
  })

  describe('Local Value State', () => {
    it('should create state with initial value', () => {
      const [count] = state(0)
      expect(count()).toBe(0)
    })

    it('should update state with setter', () => {
      const [count, setCount] = state(0)

      setCount(5)
      expect(count()).toBe(5)
    })

    it('should update state with function setter', () => {
      const [count, setCount] = state(10)

      setCount((prev) => prev + 5)
      expect(count()).toBe(15)
    })

    it('should handle string values', () => {
      const [name, setName] = state('Alice')

      expect(name()).toBe('Alice')

      setName('Bob')
      expect(name()).toBe('Bob')
    })

    it('should handle object values', () => {
      const [user, setUser] = state({ name: 'Alice', age: 25 })

      expect(user()).toEqual({ name: 'Alice', age: 25 })

      setUser({ name: 'Bob', age: 30 })
      expect(user()).toEqual({ name: 'Bob', age: 30 })
    })

    it('should handle array values', () => {
      const [items, setItems] = state(['a', 'b', 'c'])

      expect(items()).toEqual(['a', 'b', 'c'])

      setItems(['x', 'y'])
      expect(items()).toEqual(['x', 'y'])
    })

    it('should handle null and undefined', () => {
      const [value, setValue] = state<string | null>(null)

      expect(value()).toBeNull()

      setValue('hello')
      expect(value()).toBe('hello')

      setValue(null)
      expect(value()).toBeNull()
    })

    it('should handle boolean values', () => {
      const [flag, setFlag] = state(false)

      expect(flag()).toBe(false)

      setFlag(true)
      expect(flag()).toBe(true)

      setFlag((prev) => !prev)
      expect(flag()).toBe(false)
    })
  })

  describe('Global Keyed State', () => {
    it('should create global state with key', () => {
      const [theme, setTheme] = state('light', { key: 'theme' })

      expect(theme()).toBe('light')

      setTheme('dark')
      expect(theme()).toBe('dark')
    })

    it('should share state with same key', () => {
      const [theme1, setTheme1] = state('light', { key: 'shared-theme' })
      const [theme2] = state('light', { key: 'shared-theme' })

      expect(theme1()).toBe('light')
      expect(theme2()).toBe('light')

      setTheme1('dark')

      // Both should reflect the update
      expect(theme1()).toBe('dark')
      expect(theme2()).toBe('dark')
    })

    it('should not share state with different keys', () => {
      const [count1, setCount1] = state(0, { key: 'count-a' })
      const [count2, setCount2] = state(0, { key: 'count-b' })

      setCount1(5)
      setCount2(10)

      expect(count1()).toBe(5)
      expect(count2()).toBe(10)
    })

    it('should persist value across multiple accesses', () => {
      // First access
      const [counter1, setCounter1] = state(0, { key: 'persistent-counter' })
      setCounter1(42)

      // Second access with same key - should get the existing value
      const [counter2] = state(0, { key: 'persistent-counter' })
      expect(counter2()).toBe(42)
    })

    it('should clear global state registry', () => {
      const [count1, setCount1] = state(100, { key: 'clear-test' })
      expect(count1()).toBe(100)

      // Clear registry
      clearGlobalState()

      // New state with same key should start fresh
      const [count2] = state(0, { key: 'clear-test' })
      expect(count2()).toBe(0)
    })
  })

  describe('Getter Properties', () => {
    it('should have loading property (false for local state)', () => {
      const [count] = state(0)
      expect(count.loading).toBe(false)
    })

    it('should have error property (undefined for local state)', () => {
      const [count] = state(0)
      expect(count.error).toBeUndefined()
    })

    it('should have state property (ready for local state)', () => {
      const [count] = state(0)
      expect(count.state).toBe('ready')
    })

    it('should have latest property', () => {
      const [count, setCount] = state(5)
      expect(count.latest).toBe(5)

      setCount(10)
      expect(count.latest).toBe(10)
    })

    it('should have read method', () => {
      const [count] = state(42)
      expect(count.read()).toBe(42)
    })
  })

  describe('Setter Properties', () => {
    it('should have mutate method', () => {
      const [count, setCount] = state(0)

      setCount.mutate(100)
      expect(count()).toBe(100)
    })

    it('should have refetch method (no-op for local state)', () => {
      const [count, setCount] = state(0)

      // Should not throw
      expect(() => setCount.refetch()).not.toThrow()
    })
  })

  describe('Async Resource State', () => {
    it('should create state with async function', async () => {
      const [data] = state(async () => {
        return 'fetched data'
      })

      // Wait for async to resolve
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(data()).toBe('fetched data')
    })

    it('should handle loading state for async', async () => {
      const [data] = state(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return 'loaded'
      })

      // Initially might be loading
      // Note: Actual behavior depends on resource implementation
      expect(data.loading).toBeDefined()
    })

    it('should handle async with delay', async () => {
      const [data] = state(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
        return { message: 'hello' }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(data()).toEqual({ message: 'hello' })
    })
  })

  describe('Computed/Derived State', () => {
    it('should create computed state from sync function', async () => {
      const [doubled] = state(() => 5 * 2)

      // Computed uses resource internally, needs async tick
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(doubled()).toBe(10)
    })

    it('should support function returning value', async () => {
      const baseValue = 7
      const [computed] = state(() => baseValue * 3)

      // Wait for resource to resolve
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(computed()).toBe(21)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty key string', () => {
      const [count, setCount] = state(0, { key: '' })

      // Empty string key should work like local state (no registry)
      setCount(5)
      expect(count()).toBe(5)
    })

    it('should handle rapid updates', () => {
      const [count, setCount] = state(0)

      for (let i = 0; i < 100; i++) {
        setCount((prev) => prev + 1)
      }

      expect(count()).toBe(100)
    })

    it('should handle nested object updates', () => {
      const [data, setData] = state({
        user: { name: 'Alice', settings: { theme: 'light' } }
      })

      setData({
        user: { name: 'Bob', settings: { theme: 'dark' } }
      })

      expect(data()).toEqual({
        user: { name: 'Bob', settings: { theme: 'dark' } }
      })
    })

    it('should handle functional update with complex state', () => {
      const [todos, setTodos] = state([
        { id: 1, text: 'Learn Flexium', done: false }
      ])

      setTodos((prev) => [
        ...prev,
        { id: 2, text: 'Build app', done: false }
      ])

      expect(todos()).toHaveLength(2)
      expect(todos()[1].text).toBe('Build app')
    })
  })
})
