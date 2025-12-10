import { describe, it, expect } from 'vitest'
import {
  createContext,
  context,
  pushProvider,
  popProvider,
  captureContext,
  runWithContext,
} from '../context'
import { root } from '../owner'

describe('Context API', () => {
  describe('createContext', () => {
    it('should create a context with default value', () => {
      const ThemeContext = createContext('light')

      expect(ThemeContext).toBeDefined()
      expect(ThemeContext.id).toBeDefined()
      expect(typeof ThemeContext.id).toBe('symbol')
      expect(ThemeContext.defaultValue).toBe('light')
      expect(ThemeContext.Provider).toBeDefined()
      expect(typeof ThemeContext.Provider).toBe('function')
    })

    it('should create context with object default value', () => {
      const UserContext = createContext({ name: 'Guest', role: 'viewer' })

      expect(UserContext.defaultValue).toEqual({
        name: 'Guest',
        role: 'viewer',
      })
    })

    it('should create context with null default value', () => {
      const NullableContext = createContext<string | null>(null)

      expect(NullableContext.defaultValue).toBeNull()
    })

    it('should create context with undefined default value', () => {
      const OptionalContext = createContext<string | undefined>(undefined)

      expect(OptionalContext.defaultValue).toBeUndefined()
    })

    it('should create unique context IDs for different contexts', () => {
      const Context1 = createContext('value1')
      const Context2 = createContext('value2')

      expect(Context1.id).not.toBe(Context2.id)
    })

    it('should attach context ID to Provider', () => {
      const TestContext = createContext('test')
      const provider = TestContext.Provider as unknown as { _contextId: symbol }

      expect(provider._contextId).toBe(TestContext.id)
    })
  })

  describe('context', () => {
    it('should return default value when no provider exists', () => {
      const ThemeContext = createContext('light')

      const value = context(ThemeContext)

      expect(value).toBe('light')
    })

    it('should return default value for object context', () => {
      const ConfigContext = createContext({ debug: false, version: '1.0' })

      const value = context(ConfigContext)

      expect(value).toEqual({ debug: false, version: '1.0' })
    })
  })

  describe('Provider', () => {
    it('should provide value to children', () => {
      const ThemeContext = createContext('light')

      root(() => {
        pushProvider(ThemeContext.id, 'dark')
        const value = context(ThemeContext)
        expect(value).toBe('dark')
      })
    })

    it('should Provider component return children unchanged', () => {
      const TestContext = createContext('default')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children = { type: 'div', props: {} } as any
      const result = TestContext.Provider({ value: 'new', children })

      expect(result).toBe(children)
    })

    it('should handle object values in provider', () => {
      const UserContext = createContext({ name: 'Guest', age: 0 })

      root(() => {
        pushProvider(UserContext.id, { name: 'Alice', age: 30 })
        const value = context(UserContext)
        expect(value).toEqual({ name: 'Alice', age: 30 })
      })
    })

    it('should handle null values in provider', () => {
      const NullableContext = createContext<string | null>('default')

      root(() => {
        pushProvider(NullableContext.id, null)
        const value = context(NullableContext)
        expect(value).toBeNull()
      })
    })
  })

  describe('Nested Providers', () => {
    it('should allow inner provider to override outer provider', () => {
      const ThemeContext = createContext('light')

      root(() => {
        // Outer provider
        pushProvider(ThemeContext.id, 'dark')
        expect(context(ThemeContext)).toBe('dark')

        // Inner scope (simulated by root, as pushProvider modifies current scope)
        // In the new system, nested providers usually mean nested roots/components.
        // But pushProvider overwrites the current scope's value.
        // To test "nesting" properly with prototype chain, we need nested roots.

        root(() => {
          // Inner provider (shadows outer)
          pushProvider(ThemeContext.id, 'auto')
          expect(context(ThemeContext)).toBe('auto')
        })

        // Back to outer scope
        expect(context(ThemeContext)).toBe('dark')
      })
    })

    it('should handle multiple levels of nesting', () => {
      const ValueContext = createContext(0)

      root(() => {
        pushProvider(ValueContext.id, 1)
        expect(context(ValueContext)).toBe(1)

        root(() => {
          pushProvider(ValueContext.id, 2)
          expect(context(ValueContext)).toBe(2)

          root(() => {
            pushProvider(ValueContext.id, 3)
            expect(context(ValueContext)).toBe(3)
          })

          expect(context(ValueContext)).toBe(2)
        })

        expect(context(ValueContext)).toBe(1)
      })
    })

    it('should isolate different contexts', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')

      root(() => {
        pushProvider(ThemeContext.id, 'dark')
        pushProvider(LanguageContext.id, 'fr')

        expect(context(ThemeContext)).toBe('dark')
        expect(context(LanguageContext)).toBe('fr')
      })
    })
  })

  describe('captureContext', () => {
    it('should capture current context value', () => {
      const ThemeContext = createContext('light')

      root(() => {
        pushProvider(ThemeContext.id, 'dark')
        const snapshot = captureContext()

        // Verify snapshot works via runWithContext
        runWithContext(snapshot, () => {
          expect(context(ThemeContext)).toBe('dark')
        })
      })
    })

    it('should capture multiple context values', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')

      root(() => {
        pushProvider(ThemeContext.id, 'dark')
        pushProvider(LanguageContext.id, 'fr')

        const snapshot = captureContext()

        runWithContext(snapshot, () => {
          expect(context(ThemeContext)).toBe('dark')
          expect(context(LanguageContext)).toBe('fr')
        })
      })
    })
  })

  describe('runWithContext', () => {
    it('should run function with captured context', () => {
      const ThemeContext = createContext('light')

      root(() => {
        pushProvider(ThemeContext.id, 'dark')
        const snapshot = captureContext()

        // Create a new scope where context is default
        root(() => {
          expect(context(ThemeContext)).toBe('dark') // Inherits from parent actually

          // Let's simulate a detached scope
          // Actually runWithContext switches the owner entirely
        })

        // Test restoring in a clean scope?
        // runWithContext swaps the owner.
      })

      // Test outside root (no owner)
      const ThemeContext2 = createContext('light')
      let snapshot: unknown

      root(() => {
        pushProvider(ThemeContext2.id, 'dark')
        snapshot = captureContext()
      })

      expect(context(ThemeContext2)).toBe('light') // Default

      runWithContext(snapshot, () => {
        expect(context(ThemeContext2)).toBe('dark')
      })

      expect(context(ThemeContext2)).toBe('light')
    })

    it('should handle multiple contexts in snapshot', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')

      let snapshot: unknown

      root(() => {
        pushProvider(ThemeContext.id, 'dark')
        pushProvider(LanguageContext.id, 'fr')
        snapshot = captureContext()
      })

      const result = runWithContext(snapshot, () => {
        return {
          theme: context(ThemeContext),
          language: context(LanguageContext),
        }
      })

      expect(result).toEqual({ theme: 'dark', language: 'fr' })
      expect(context(ThemeContext)).toBe('light')
    })

    it('should return function result', () => {
      const ValueContext = createContext(0)
      let snapshot: unknown

      root(() => {
        pushProvider(ValueContext.id, 5)
        snapshot = captureContext()
      })

      const result = runWithContext(snapshot, () => {
        const value = context(ValueContext)
        return value * 2
      })

      expect(result).toBe(10)
    })

    it('should support async operations with captured context', async () => {
      const AsyncContext = createContext('initial')
      let snapshot: unknown

      root(() => {
        pushProvider(AsyncContext.id, 'async-value')
        snapshot = captureContext()
      })

      // Simulate async operation
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => {
          runWithContext(snapshot, () => {
            const value = context(AsyncContext)
            resolve(value)
          })
        }, 10)
      })

      const result = await promise
      expect(result).toBe('async-value')
      expect(context(AsyncContext)).toBe('initial')
    })
  })
})
