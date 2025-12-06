import { describe, it, expect } from 'vitest'
import { isSignal, unwrapSignal } from '../utils'
import { signal } from '../../../core/signal'

describe('Canvas Utils', () => {
  describe('isSignal', () => {
    it('should return true for a real signal', () => {
      const sig = signal(42)
      expect(isSignal(sig)).toBe(true)
    })

    it('should return false for a plain number', () => {
      expect(isSignal(42)).toBe(false)
    })

    it('should return false for a plain string', () => {
      expect(isSignal('hello')).toBe(false)
    })

    it('should return false for null', () => {
      expect(isSignal(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isSignal(undefined)).toBe(false)
    })

    it('should return false for a plain object', () => {
      expect(isSignal({ value: 42 })).toBe(false)
    })

    it('should return false for an array', () => {
      expect(isSignal([1, 2, 3])).toBe(false)
    })

    it('should return false for a function', () => {
      expect(isSignal(() => 42)).toBe(false)
    })

    it('should return true for signal with object value', () => {
      const sig = signal({ name: 'test', count: 0 })
      expect(isSignal(sig)).toBe(true)
    })

    it('should return true for signal with array value', () => {
      const sig = signal([1, 2, 3])
      expect(isSignal(sig)).toBe(true)
    })
  })

  describe('unwrapSignal', () => {
    describe('with real signals', () => {
      it('should unwrap a signal with number value', () => {
        const sig = signal(42)
        expect(unwrapSignal(sig)).toBe(42)
      })

      it('should unwrap a signal with string value', () => {
        const sig = signal('hello')
        expect(unwrapSignal(sig)).toBe('hello')
      })

      it('should unwrap a signal with object value', () => {
        const obj = { name: 'test' }
        const sig = signal(obj)
        expect(unwrapSignal(sig)).toBe(obj)
      })

      it('should unwrap a signal with array value', () => {
        const arr = [1, 2, 3]
        const sig = signal(arr)
        expect(unwrapSignal(sig)).toBe(arr)
      })

      it('should unwrap a signal with null value', () => {
        const sig = signal<null>(null)
        expect(unwrapSignal(sig)).toBe(null)
      })

      it('should unwrap a signal with boolean value', () => {
        const sig = signal(true)
        expect(unwrapSignal(sig)).toBe(true)
      })
    })

    describe('with non-signal values', () => {
      it('should return number as-is', () => {
        expect(unwrapSignal(42)).toBe(42)
      })

      it('should return string as-is', () => {
        expect(unwrapSignal('hello')).toBe('hello')
      })

      it('should return null as-is', () => {
        expect(unwrapSignal(null)).toBe(null)
      })

      it('should return undefined as-is', () => {
        expect(unwrapSignal(undefined)).toBe(undefined)
      })

      it('should return boolean as-is', () => {
        expect(unwrapSignal(false)).toBe(false)
      })

      it('should return plain object as-is', () => {
        const obj = { name: 'test' }
        expect(unwrapSignal(obj)).toBe(obj)
      })

      it('should return array as-is', () => {
        const arr = [1, 2, 3]
        expect(unwrapSignal(arr)).toBe(arr)
      })
    })

    describe('with signal-like objects (duck typing)', () => {
      it('should unwrap object with value and peek properties', () => {
        const signalLike = { value: 100, peek: () => 100 }
        expect(unwrapSignal(signalLike)).toBe(100)
      })

      it('should not unwrap object with only value property', () => {
        const notSignalLike = { value: 100 }
        expect(unwrapSignal(notSignalLike)).toBe(notSignalLike)
      })

      it('should not unwrap object with only peek property', () => {
        const notSignalLike = { peek: () => 100 }
        expect(unwrapSignal(notSignalLike)).toBe(notSignalLike)
      })
    })

    describe('edge cases', () => {
      it('should handle zero', () => {
        expect(unwrapSignal(0)).toBe(0)
        expect(unwrapSignal(signal(0))).toBe(0)
      })

      it('should handle empty string', () => {
        expect(unwrapSignal('')).toBe('')
        expect(unwrapSignal(signal(''))).toBe('')
      })

      it('should handle empty array', () => {
        const arr: number[] = []
        expect(unwrapSignal(arr)).toBe(arr)
        expect(unwrapSignal(signal(arr))).toBe(arr)
      })

      it('should handle empty object', () => {
        const obj = {}
        expect(unwrapSignal(obj)).toBe(obj)
        expect(unwrapSignal(signal(obj))).toEqual(obj)
      })
    })
  })
})
