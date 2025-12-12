/**
 * Reactive Array Tests
 *
 * Tests for array state behavior with the state() API.
 * Array reconciliation happens at the render layer (reconcile.ts),
 * so these tests focus on StateValue array behavior.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { state, STATE_SIGNAL } from '../state'
import { effect } from '../index'

// Helper to wait for microtasks
const tick = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()))

// Helper to extract primitive value from StateProxy
const val = <T>(proxy: T): T => {
  if (
    proxy &&
    (typeof proxy === 'object' || typeof proxy === 'function') &&
    STATE_SIGNAL in (proxy as object)
  ) {
    // Proxy is callable function, so call it directly
    return typeof proxy === 'function' ? (proxy as any)() : proxy
  }
  return proxy
}

describe('Array State', () => {
  beforeEach(() => {
    state.clear()
  })

  describe('Basic array operations', () => {
    it('should create array state', () => {
      const items = state(['a', 'b', 'c'])

      expect(val(items)).toEqual(['a', 'b', 'c'])
    })

    it('should access array length', () => {
      const items = state([1, 2, 3, 4, 5])

      expect(items.length).toBe(5)
    })

    it('should access array elements by index', () => {
      const items = state(['first', 'second', 'third'])

      expect(items[0]).toBe('first')
      expect(items[1]).toBe('second')
      expect(items[2]).toBe('third')
    })

    it('should update array state', () => {
      const items = state(['a', 'b'])

      items.set(['x', 'y', 'z'])

      expect(val(items)).toEqual(['x', 'y', 'z'])
    })

    it('should update array with setter function', () => {
      const items = state([1, 2, 3])

      items.set(prev => [...prev, 4])

      expect(val(items)).toEqual([1, 2, 3, 4])
    })
  })

  describe('Array methods on StateValue', () => {
    it('should support .map() returning regular array', () => {
      const items = state(['a', 'b', 'c'])

      const result = items.map((item: string) => item.toUpperCase())

      // .map() returns a regular array (reconciliation happens at render layer)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual(['A', 'B', 'C'])
    })

    it('should support .filter()', () => {
      const items = state([1, 2, 3, 4, 5])

      const result = items.filter((n: number) => n > 2)

      expect(result).toEqual([3, 4, 5])
    })

    it('should support .find()', () => {
      const items = state([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ])

      const result = items.find((item: { id: number }) => item.id === 2)

      expect(result).toEqual({ id: 2, name: 'Bob' })
    })

    it('should support .reduce()', () => {
      const items = state([1, 2, 3, 4])

      const sum = items.reduce((acc: number, n: number) => acc + n, 0)

      expect(sum).toBe(10)
    })

    it('should support .some() and .every()', () => {
      const items = state([2, 4, 6, 8])

      expect(items.some((n: number) => n > 5)).toBe(true)
      expect(items.every((n: number) => n % 2 === 0)).toBe(true)
    })

    it('should support .includes()', () => {
      const items = state(['apple', 'banana', 'cherry'])

      expect(items.includes('banana')).toBe(true)
      expect(items.includes('grape')).toBe(false)
    })

    it('should support .indexOf()', () => {
      const items = state(['a', 'b', 'c', 'b'])

      expect(items.indexOf('b')).toBe(1)
      expect(items.indexOf('x')).toBe(-1)
    })

    it('should support .slice()', () => {
      const items = state([1, 2, 3, 4, 5])

      expect(items.slice(1, 3)).toEqual([2, 3])
    })

    it('should support .concat()', () => {
      const items = state([1, 2])

      const result = items.concat([3, 4])

      expect(result).toEqual([1, 2, 3, 4])
    })

    it('should support .join()', () => {
      const items = state(['a', 'b', 'c'])

      expect(items.join('-')).toBe('a-b-c')
    })
  })

  describe('Reactivity with effects', () => {
    it('should trigger effect when array changes', async () => {
      const items = state(['initial'])
      let effectCount = 0
      let lastLength = 0

      effect(() => {
        effectCount++
        lastLength = items.length
      })

      expect(effectCount).toBe(1)
      expect(lastLength).toBe(1)

      items.set(['a', 'b', 'c'])
      await tick()

      expect(effectCount).toBe(2)
      expect(lastLength).toBe(3)
    })

    it('should track array access in computed state', () => {
      const items = state([1, 2, 3])
      const sum = state(() => items.reduce((a: number, b: number) => a + b, 0))

      expect(+sum).toBe(6)

      items.set([10, 20, 30])

      expect(+sum).toBe(60)
    })

    it('should track array length in computed state', () => {
      const items = state(['a', 'b'])
      const count = state(() => items.length)

      expect(+count).toBe(2)

      items.set(['x', 'y', 'z', 'w'])

      expect(+count).toBe(4)
    })
  })

  describe('Array of objects', () => {
    interface Todo {
      id: number
      text: string
      done: boolean
    }

    it('should work with array of objects', () => {
      const todos = state<Todo[]>([
        { id: 1, text: 'Learn Flexium', done: false },
        { id: 2, text: 'Build app', done: true },
      ])

      const names = todos.map((t: Todo) => t.text)

      expect(names).toEqual(['Learn Flexium', 'Build app'])
    })

    it('should update array of objects', () => {
      const todos = state<Todo[]>([
        { id: 1, text: 'Task 1', done: false },
      ])

      todos.set(prev => [
        ...prev,
        { id: 2, text: 'Task 2', done: false },
      ])

      expect(val(todos).length).toBe(2)
      expect(val(todos)[1].text).toBe('Task 2')
    })

    it('should filter objects', () => {
      const todos = state<Todo[]>([
        { id: 1, text: 'Done task', done: true },
        { id: 2, text: 'Pending task', done: false },
      ])

      const pending = todos.filter((t: Todo) => !t.done)

      expect(pending.length).toBe(1)
      expect(pending[0].text).toBe('Pending task')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const items = state<string[]>([])

      expect(items.length).toBe(0)
      expect(items.map((x: string) => x)).toEqual([])
    })

    it('should handle array with null/undefined items', () => {
      const items = state<(string | null | undefined)[]>(['a', null, undefined, 'b'])

      const result = items.filter((x) => x != null)

      expect(result).toEqual(['a', 'b'])
    })

    it('should handle nested arrays', () => {
      const matrix = state([[1, 2], [3, 4], [5, 6]])

      const sums = matrix.map((row: number[]) => row.reduce((a, b) => a + b, 0))

      expect(sums).toEqual([3, 7, 11])
    })

    it('should handle array spread', () => {
      const items = state([1, 2, 3])

      const spread = [...items]

      expect(spread).toEqual([1, 2, 3])
    })

    it('should work with for...of loop', () => {
      const items = state(['x', 'y', 'z'])

      const collected: string[] = []
      for (const item of items) {
        collected.push(item)
      }

      expect(collected).toEqual(['x', 'y', 'z'])
    })
  })

  describe('Global array state', () => {
    it('should share array state by key', () => {
      const itemsA = state(['a'], { key: 'shared-array' })
      const itemsB = state<string[]>([], { key: 'shared-array' })

      expect(val(itemsA)).toEqual(['a'])
      expect(val(itemsB)).toEqual(['a'])

      itemsA.set(['x', 'y'])

      expect(val(itemsA)).toEqual(['x', 'y'])
      expect(val(itemsB)).toEqual(['x', 'y'])
    })
  })
})
