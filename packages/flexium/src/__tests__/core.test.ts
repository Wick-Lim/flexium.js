import { describe, it, expect } from 'vitest'
import { state } from '../core/state'

describe('Core', () => {
  describe('state', () => {
    it('should create a signal with initial value', () => {
      const [count, setCount] = state(0)
      expect(count).toBe(0)
    })

    it('should provide a setter function', () => {
      const [count, setCount] = state(0)
      expect(typeof setCount).toBe('function')
    })

    it('should support resource state with async function', () => {
      const [data, control] = state(async () => 'test')
      expect(control).toHaveProperty('loading')
      expect(control).toHaveProperty('error')
      expect(control).toHaveProperty('refetch')
    })
  })
})
