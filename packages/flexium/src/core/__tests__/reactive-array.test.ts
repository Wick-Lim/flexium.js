/**
 * Reactive Array Tests
 *
 * Tests for the reactive array .map() syntax that enables
 * {items.map(item => <div>{item}</div>)} with For-like optimizations
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { state, clearGlobalState, STATE_SIGNAL } from '../state'
import {
  isReactiveArrayResult,
  REACTIVE_ARRAY_MARKER,
} from '../reactive-array'

// Helper to wait for microtasks
const tick = () => new Promise((resolve) => queueMicrotask(resolve))

// Helper to extract primitive value from StateProxy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const val = <T>(proxy: T): T => {
  if (
    proxy &&
    (typeof proxy === 'object' || typeof proxy === 'function') &&
    STATE_SIGNAL in (proxy as object)
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (proxy as any)[STATE_SIGNAL].value
  }
  return proxy
}

describe('Reactive Array', () => {
  beforeEach(() => {
    clearGlobalState()
  })

  describe('ReactiveArrayResult Creation', () => {
    it('should return ReactiveArrayResult when calling .map() on array state', () => {
      const [items] = state(['a', 'b', 'c'])

      const result = items.map((item: string) => `<div>${item}</div>`)

      expect(isReactiveArrayResult(result)).toBe(true)
      expect(result[REACTIVE_ARRAY_MARKER]).toBe(true)
    })

    it('should have source signal in ReactiveArrayResult', () => {
      const [items] = state(['x', 'y', 'z'])

      const result = items.map((item: string) => item.toUpperCase())

      expect(result.source).toBeDefined()
      expect(result.source.value).toEqual(['x', 'y', 'z'])
    })

    it('should have mapFn in ReactiveArrayResult', () => {
      const [items] = state([1, 2, 3])

      const result = items.map((item: number) => item * 2)

      expect(typeof result.mapFn).toBe('function')
    })

    it('should work with index parameter', () => {
      const [items] = state(['a', 'b', 'c'])

      const result = items.map((item: string, index: number) => `${index}:${item}`)

      expect(isReactiveArrayResult(result)).toBe(true)
      expect(result.mapFn).toBeDefined()
    })
  })

  describe('Non-array states should not create ReactiveArrayResult', () => {
    it('should not affect number state', () => {
      const [count] = state(5)

      // Number doesn't have .map(), this should be undefined or throw
      expect((count as unknown as { map?: unknown }).map).toBeUndefined()
    })

    it('should not affect string state', () => {
      const [text] = state('hello')

      // String doesn't have reactive .map() like arrays
      // (it has native .map() but it's not reactive)
      expect(typeof (text as unknown as { map?: unknown }).map).toBe('undefined')
    })

    it('should not affect object state', () => {
      const [obj] = state({ a: 1, b: 2 })

      expect((obj as unknown as { map?: unknown }).map).toBeUndefined()
    })
  })

  describe('Array mutation and reactivity', () => {
    it('should update source signal when state changes', async () => {
      const [items, setItems] = state(['initial'])

      const result = items.map((item: string) => `<li>${item}</li>`)

      expect(result.source.value).toEqual(['initial'])

      setItems(['updated', 'items'])
      await tick()

      // The source signal should reflect the update
      expect(result.source.value).toEqual(['updated', 'items'])
    })

    it('should work with array of objects', () => {
      const [todos] = state([
        { id: 1, text: 'Learn Flexium' },
        { id: 2, text: 'Build an app' },
      ])

      const result = todos.map((todo: { id: number; text: string }) => ({
        key: todo.id,
        label: todo.text,
      }))

      expect(isReactiveArrayResult(result)).toBe(true)
    })

    it('should preserve reactive link after multiple maps', async () => {
      const [items, setItems] = state([1, 2, 3])

      // First map creates ReactiveArrayResult
      const result1 = items.map((x: number) => x * 2)

      expect(isReactiveArrayResult(result1)).toBe(true)

      // Update original items
      setItems([10, 20, 30])
      await tick()

      // Source should be updated
      expect(result1.source.value).toEqual([10, 20, 30])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const [items] = state<string[]>([])

      const result = items.map((item: string) => item)

      expect(isReactiveArrayResult(result)).toBe(true)
      expect(result.source.value).toEqual([])
    })

    it('should handle array with null/undefined items', () => {
      const [items] = state<(string | null | undefined)[]>(['a', null, undefined, 'b'])

      const result = items.map((item) => item ?? 'default')

      expect(isReactiveArrayResult(result)).toBe(true)
    })

    it('should handle nested arrays', () => {
      const [matrix] = state([[1, 2], [3, 4]])

      const result = matrix.map((row: number[]) => row.reduce((a, b) => a + b, 0))

      expect(isReactiveArrayResult(result)).toBe(true)
    })
  })

  describe('Type preservation', () => {
    it('should work with typed arrays', () => {
      interface User {
        id: number
        name: string
      }

      const [users] = state<User[]>([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ])

      const result = users.map((user: User) => user.name)

      expect(isReactiveArrayResult(result)).toBe(true)
    })
  })
})
