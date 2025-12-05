/**
 * Context API Tests
 *
 * Tests for the Context API including createContext, useContext, Provider,
 * stack management, and async context handling
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createContext,
  useContext,
  pushProvider,
  popProvider,
  captureContext,
  runWithContext,
  type Context
} from '../context'

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

      expect(UserContext.defaultValue).toEqual({ name: 'Guest', role: 'viewer' })
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

  describe('useContext', () => {
    it('should return default value when no provider exists', () => {
      const ThemeContext = createContext('light')

      const value = useContext(ThemeContext)

      expect(value).toBe('light')
    })

    it('should return default value for object context', () => {
      const ConfigContext = createContext({ debug: false, version: '1.0' })

      const value = useContext(ConfigContext)

      expect(value).toEqual({ debug: false, version: '1.0' })
    })

    it('should return default value when context stack is empty', () => {
      const CountContext = createContext(0)

      // Push and pop to create an empty stack
      pushProvider(CountContext.id, 5)
      popProvider(CountContext.id)

      const value = useContext(CountContext)

      expect(value).toBe(0)
    })
  })

  describe('Provider', () => {
    it('should provide value to children', () => {
      const ThemeContext = createContext('light')

      pushProvider(ThemeContext.id, 'dark')

      const value = useContext(ThemeContext)
      expect(value).toBe('dark')

      popProvider(ThemeContext.id)
    })

    it('should Provider component return children unchanged', () => {
      const TestContext = createContext('default')

      const children = { type: 'div', props: {} }
      const result = TestContext.Provider({ value: 'new', children })

      expect(result).toBe(children)
    })

    it('should handle object values in provider', () => {
      const UserContext = createContext({ name: 'Guest' })

      pushProvider(UserContext.id, { name: 'Alice', age: 30 })

      const value = useContext(UserContext)
      expect(value).toEqual({ name: 'Alice', age: 30 })

      popProvider(UserContext.id)
    })

    it('should handle null values in provider', () => {
      const NullableContext = createContext<string | null>('default')

      pushProvider(NullableContext.id, null)

      const value = useContext(NullableContext)
      expect(value).toBeNull()

      popProvider(NullableContext.id)
    })
  })

  describe('Nested Providers', () => {
    it('should allow inner provider to override outer provider', () => {
      const ThemeContext = createContext('light')

      // Outer provider
      pushProvider(ThemeContext.id, 'dark')
      expect(useContext(ThemeContext)).toBe('dark')

      // Inner provider
      pushProvider(ThemeContext.id, 'auto')
      expect(useContext(ThemeContext)).toBe('auto')

      // Pop inner provider
      popProvider(ThemeContext.id)
      expect(useContext(ThemeContext)).toBe('dark')

      // Pop outer provider
      popProvider(ThemeContext.id)
      expect(useContext(ThemeContext)).toBe('light')
    })

    it('should handle multiple levels of nesting', () => {
      const ValueContext = createContext(0)

      pushProvider(ValueContext.id, 1)
      expect(useContext(ValueContext)).toBe(1)

      pushProvider(ValueContext.id, 2)
      expect(useContext(ValueContext)).toBe(2)

      pushProvider(ValueContext.id, 3)
      expect(useContext(ValueContext)).toBe(3)

      pushProvider(ValueContext.id, 4)
      expect(useContext(ValueContext)).toBe(4)

      popProvider(ValueContext.id)
      expect(useContext(ValueContext)).toBe(3)

      popProvider(ValueContext.id)
      expect(useContext(ValueContext)).toBe(2)

      popProvider(ValueContext.id)
      expect(useContext(ValueContext)).toBe(1)

      popProvider(ValueContext.id)
      expect(useContext(ValueContext)).toBe(0)
    })

    it('should isolate different contexts', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')

      pushProvider(ThemeContext.id, 'dark')
      pushProvider(LanguageContext.id, 'fr')

      expect(useContext(ThemeContext)).toBe('dark')
      expect(useContext(LanguageContext)).toBe('fr')

      popProvider(ThemeContext.id)
      expect(useContext(ThemeContext)).toBe('light')
      expect(useContext(LanguageContext)).toBe('fr')

      popProvider(LanguageContext.id)
      expect(useContext(LanguageContext)).toBe('en')
    })
  })

  describe('Context Stack Management', () => {
    it('should push and pop providers correctly', () => {
      const CountContext = createContext(0)

      pushProvider(CountContext.id, 10)
      expect(useContext(CountContext)).toBe(10)

      pushProvider(CountContext.id, 20)
      expect(useContext(CountContext)).toBe(20)

      popProvider(CountContext.id)
      expect(useContext(CountContext)).toBe(10)

      popProvider(CountContext.id)
      expect(useContext(CountContext)).toBe(0)
    })

    it('should handle popping from empty stack gracefully', () => {
      const TestContext = createContext('default')

      // Should not throw
      expect(() => popProvider(TestContext.id)).not.toThrow()

      const value = useContext(TestContext)
      expect(value).toBe('default')
    })

    it('should handle popping from non-existent context', () => {
      const nonExistentId = Symbol('non-existent')

      // Should not throw
      expect(() => popProvider(nonExistentId)).not.toThrow()
    })

    it('should maintain separate stacks for different contexts', () => {
      const Context1 = createContext('a')
      const Context2 = createContext('b')

      pushProvider(Context1.id, 'a1')
      pushProvider(Context2.id, 'b1')
      pushProvider(Context1.id, 'a2')
      pushProvider(Context2.id, 'b2')

      expect(useContext(Context1)).toBe('a2')
      expect(useContext(Context2)).toBe('b2')

      popProvider(Context1.id)
      expect(useContext(Context1)).toBe('a1')
      expect(useContext(Context2)).toBe('b2')

      popProvider(Context2.id)
      expect(useContext(Context1)).toBe('a1')
      expect(useContext(Context2)).toBe('b1')

      popProvider(Context1.id)
      popProvider(Context2.id)
      expect(useContext(Context1)).toBe('a')
      expect(useContext(Context2)).toBe('b')
    })
  })

  describe('captureContext', () => {
    it('should capture empty context when no providers exist', () => {
      const snapshot = captureContext()

      expect(snapshot).toBeInstanceOf(Map)
      expect(snapshot.size).toBe(0)
    })

    it('should capture current context value', () => {
      const ThemeContext = createContext('light')

      pushProvider(ThemeContext.id, 'dark')

      const snapshot = captureContext()

      expect(snapshot.size).toBe(1)
      expect(snapshot.get(ThemeContext.id)).toBe('dark')

      popProvider(ThemeContext.id)
    })

    it('should capture multiple context values', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')
      const UserContext = createContext({ name: 'Guest' })

      pushProvider(ThemeContext.id, 'dark')
      pushProvider(LanguageContext.id, 'fr')
      pushProvider(UserContext.id, { name: 'Alice' })

      const snapshot = captureContext()

      expect(snapshot.size).toBe(3)
      expect(snapshot.get(ThemeContext.id)).toBe('dark')
      expect(snapshot.get(LanguageContext.id)).toBe('fr')
      expect(snapshot.get(UserContext.id)).toEqual({ name: 'Alice' })

      popProvider(ThemeContext.id)
      popProvider(LanguageContext.id)
      popProvider(UserContext.id)
    })

    it('should capture only the top value from nested providers', () => {
      const ValueContext = createContext(0)

      pushProvider(ValueContext.id, 1)
      pushProvider(ValueContext.id, 2)
      pushProvider(ValueContext.id, 3)

      const snapshot = captureContext()

      expect(snapshot.size).toBe(1)
      expect(snapshot.get(ValueContext.id)).toBe(3)

      popProvider(ValueContext.id)
      popProvider(ValueContext.id)
      popProvider(ValueContext.id)
    })

    it('should not capture empty stacks', () => {
      const Context1 = createContext('a')
      const Context2 = createContext('b')

      pushProvider(Context1.id, 'value1')
      pushProvider(Context2.id, 'value2')
      popProvider(Context2.id) // Remove Context2 from stack

      const snapshot = captureContext()

      expect(snapshot.size).toBe(1)
      expect(snapshot.has(Context1.id)).toBe(true)
      expect(snapshot.has(Context2.id)).toBe(false)

      popProvider(Context1.id)
    })
  })

  describe('runWithContext', () => {
    it('should run function with captured context', () => {
      const ThemeContext = createContext('light')

      pushProvider(ThemeContext.id, 'dark')
      const snapshot = captureContext()
      popProvider(ThemeContext.id)

      // Context is now back to default
      expect(useContext(ThemeContext)).toBe('light')

      // Run with captured context
      const result = runWithContext(snapshot, () => {
        return useContext(ThemeContext)
      })

      expect(result).toBe('dark')

      // After running, context should be restored
      expect(useContext(ThemeContext)).toBe('light')
    })

    it('should handle multiple contexts in snapshot', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')

      pushProvider(ThemeContext.id, 'dark')
      pushProvider(LanguageContext.id, 'fr')
      const snapshot = captureContext()
      popProvider(ThemeContext.id)
      popProvider(LanguageContext.id)

      const result = runWithContext(snapshot, () => {
        return {
          theme: useContext(ThemeContext),
          language: useContext(LanguageContext)
        }
      })

      expect(result).toEqual({ theme: 'dark', language: 'fr' })
      expect(useContext(ThemeContext)).toBe('light')
      expect(useContext(LanguageContext)).toBe('en')
    })

    it('should return function result', () => {
      const ValueContext = createContext(0)

      pushProvider(ValueContext.id, 5)
      const snapshot = captureContext()
      popProvider(ValueContext.id)

      const result = runWithContext(snapshot, () => {
        const value = useContext(ValueContext)
        return value * 2
      })

      expect(result).toBe(10)
    })

    it('should handle function that throws', () => {
      const ErrorContext = createContext('safe')

      pushProvider(ErrorContext.id, 'danger')
      const snapshot = captureContext()
      popProvider(ErrorContext.id)

      expect(() => {
        runWithContext(snapshot, () => {
          throw new Error('Test error')
        })
      }).toThrow('Test error')

      // Context should still be cleaned up
      expect(useContext(ErrorContext)).toBe('safe')
    })

    it('should cleanup context even if function throws', () => {
      const CleanupContext = createContext(0)

      pushProvider(CleanupContext.id, 100)
      const snapshot = captureContext()
      popProvider(CleanupContext.id)

      try {
        runWithContext(snapshot, () => {
          expect(useContext(CleanupContext)).toBe(100)
          throw new Error('Intentional error')
        })
      } catch (e) {
        // Expected
      }

      // Should be cleaned up and back to default
      expect(useContext(CleanupContext)).toBe(0)
    })

    it('should work with empty snapshot', () => {
      const emptySnapshot = new Map<symbol, unknown>()

      const result = runWithContext(emptySnapshot, () => {
        return 'executed'
      })

      expect(result).toBe('executed')
    })

    it('should support async operations with captured context', async () => {
      const AsyncContext = createContext('initial')

      pushProvider(AsyncContext.id, 'async-value')
      const snapshot = captureContext()
      popProvider(AsyncContext.id)

      // Simulate async operation
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => {
          runWithContext(snapshot, () => {
            const value = useContext(AsyncContext)
            resolve(value)
          })
        }, 10)
      })

      const result = await promise
      expect(result).toBe('async-value')
      expect(useContext(AsyncContext)).toBe('initial')
    })

    it('should handle nested runWithContext calls', () => {
      const LevelContext = createContext(0)

      pushProvider(LevelContext.id, 1)
      const snapshot1 = captureContext()
      pushProvider(LevelContext.id, 2)
      const snapshot2 = captureContext()
      popProvider(LevelContext.id)
      popProvider(LevelContext.id)

      const result = runWithContext(snapshot1, () => {
        const level1 = useContext(LevelContext)

        const inner = runWithContext(snapshot2, () => {
          return useContext(LevelContext)
        })

        return { level1, inner }
      })

      expect(result).toEqual({ level1: 1, inner: 2 })
      expect(useContext(LevelContext)).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid push/pop sequences', () => {
      const RapidContext = createContext(0)

      for (let i = 0; i < 100; i++) {
        pushProvider(RapidContext.id, i)
      }

      expect(useContext(RapidContext)).toBe(99)

      for (let i = 0; i < 100; i++) {
        popProvider(RapidContext.id)
      }

      expect(useContext(RapidContext)).toBe(0)
    })

    it('should handle array values in context', () => {
      const ArrayContext = createContext<number[]>([])

      pushProvider(ArrayContext.id, [1, 2, 3])

      const value = useContext(ArrayContext)
      expect(value).toEqual([1, 2, 3])

      popProvider(ArrayContext.id)
    })

    it('should handle complex nested object values', () => {
      const ComplexContext = createContext({
        user: { name: '', profile: { avatar: '', bio: '' } },
        settings: { theme: 'light', notifications: true }
      })

      const complexValue = {
        user: {
          name: 'Alice',
          profile: { avatar: 'avatar.png', bio: 'Developer' }
        },
        settings: { theme: 'dark', notifications: false }
      }

      pushProvider(ComplexContext.id, complexValue)

      const value = useContext(ComplexContext)
      expect(value).toEqual(complexValue)

      popProvider(ComplexContext.id)
    })

    it('should handle function values in context', () => {
      const FunctionContext = createContext<() => string>(() => 'default')

      const customFn = () => 'custom'
      pushProvider(FunctionContext.id, customFn)

      const value = useContext(FunctionContext)
      expect(value).toBe(customFn)
      expect(value()).toBe('custom')

      popProvider(FunctionContext.id)
    })

    it('should handle Symbol values in context', () => {
      const sym1 = Symbol('default')
      const sym2 = Symbol('provided')
      const SymbolContext = createContext<symbol>(sym1)

      pushProvider(SymbolContext.id, sym2)

      const value = useContext(SymbolContext)
      expect(value).toBe(sym2)

      popProvider(SymbolContext.id)
      expect(useContext(SymbolContext)).toBe(sym1)
    })

    it('should maintain type safety with generic contexts', () => {
      interface User {
        id: number
        name: string
      }

      const UserContext = createContext<User | null>(null)

      const user: User = { id: 1, name: 'Alice' }
      pushProvider(UserContext.id, user)

      const value = useContext(UserContext)
      expect(value).toEqual(user)

      // TypeScript should enforce type
      if (value !== null) {
        expect(value.id).toBe(1)
        expect(value.name).toBe('Alice')
      }

      popProvider(UserContext.id)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should support theme switching scenario', () => {
      type Theme = 'light' | 'dark' | 'auto'
      const ThemeContext = createContext<Theme>('light')

      // Initial app state
      expect(useContext(ThemeContext)).toBe('light')

      // User opens settings and changes to dark
      pushProvider(ThemeContext.id, 'dark')
      expect(useContext(ThemeContext)).toBe('dark')

      // User opens a modal that forces light theme
      pushProvider(ThemeContext.id, 'light')
      expect(useContext(ThemeContext)).toBe('light')

      // User closes modal, back to dark theme
      popProvider(ThemeContext.id)
      expect(useContext(ThemeContext)).toBe('dark')

      // User resets to system preference
      popProvider(ThemeContext.id)
      pushProvider(ThemeContext.id, 'auto')
      expect(useContext(ThemeContext)).toBe('auto')

      popProvider(ThemeContext.id)
    })

    it('should support authentication flow', () => {
      interface AuthState {
        isAuthenticated: boolean
        user: { id: string; name: string } | null
      }

      const AuthContext = createContext<AuthState>({
        isAuthenticated: false,
        user: null
      })

      // Anonymous user
      expect(useContext(AuthContext).isAuthenticated).toBe(false)

      // User logs in
      pushProvider(AuthContext.id, {
        isAuthenticated: true,
        user: { id: '123', name: 'Alice' }
      })

      const authState = useContext(AuthContext)
      expect(authState.isAuthenticated).toBe(true)
      expect(authState.user?.name).toBe('Alice')

      // Capture for async operations
      const snapshot = captureContext()

      // User logs out
      popProvider(AuthContext.id)
      expect(useContext(AuthContext).isAuthenticated).toBe(false)

      // Async operation uses captured auth state
      runWithContext(snapshot, () => {
        const state = useContext(AuthContext)
        expect(state.isAuthenticated).toBe(true)
        expect(state.user?.name).toBe('Alice')
      })
    })

    it('should support internationalization scenario', () => {
      interface I18nState {
        locale: string
        translations: Record<string, string>
      }

      const I18nContext = createContext<I18nState>({
        locale: 'en',
        translations: { hello: 'Hello' }
      })

      // Change to French
      pushProvider(I18nContext.id, {
        locale: 'fr',
        translations: { hello: 'Bonjour' }
      })

      expect(useContext(I18nContext).translations.hello).toBe('Bonjour')

      // Capture for later use
      const frenchSnapshot = captureContext()

      // Change to Spanish
      popProvider(I18nContext.id)
      pushProvider(I18nContext.id, {
        locale: 'es',
        translations: { hello: 'Hola' }
      })

      expect(useContext(I18nContext).translations.hello).toBe('Hola')

      // Run something with French context
      runWithContext(frenchSnapshot, () => {
        expect(useContext(I18nContext).translations.hello).toBe('Bonjour')
      })

      popProvider(I18nContext.id)
    })
  })
})
