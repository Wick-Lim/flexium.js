/**
 * Context API Tests
 *
 * 공개 API 동작에 집중 - 내부 구현이 바뀌어도 테스트는 유지되어야 함
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { createContext, context, state } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('Context API', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('createContext()', () => {
    it('should create context with default value', () => {
      const ThemeContext = createContext('light')

      expect(ThemeContext.defaultValue).toBe('light')
      expect(ThemeContext.Provider).toBeDefined()
      expect(typeof ThemeContext.Provider).toBe('function')
    })

    it('should create context with object default value', () => {
      const UserContext = createContext({ name: 'Guest', role: 'visitor' })

      expect(UserContext.defaultValue).toEqual({ name: 'Guest', role: 'visitor' })
    })
  })

  describe('context() - without Provider', () => {
    it('should return default value when no Provider', () => {
      const ThemeContext = createContext('default-theme')

      function Consumer() {
        const theme = context(ThemeContext)
        return f('div', { 'data-testid': 'theme' }, theme)
      }

      render(f(Consumer), container)
      expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('default-theme')
    })
  })

  describe('Context.Provider', () => {
    it('should provide value to children', () => {
      const ThemeContext = createContext('light')

      function Consumer() {
        const theme = context(ThemeContext)
        return f('div', { 'data-testid': 'theme' }, theme)
      }

      function App() {
        return f(ThemeContext.Provider, { value: 'dark' }, [
          f(Consumer)
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark')
    })

    it('should provide object value', () => {
      const UserContext = createContext<{ name: string } | null>(null)

      function Consumer() {
        const user = context(UserContext)
        return f('div', { 'data-testid': 'user' }, user?.name || 'Guest')
      }

      function App() {
        return f(UserContext.Provider, { value: { name: 'John' } }, [
          f(Consumer)
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="user"]')?.textContent).toBe('John')
    })

    it('should handle deeply nested consumers', () => {
      const ThemeContext = createContext('light')

      function DeepConsumer() {
        const theme = context(ThemeContext)
        return f('span', { 'data-testid': 'deep' }, theme)
      }

      function Middle() {
        return f('div', {}, [f(DeepConsumer)])
      }

      function App() {
        return f(ThemeContext.Provider, { value: 'dark' }, [
          f('div', {}, [
            f('div', {}, [
              f(Middle)
            ])
          ])
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('dark')
    })

    it('should support nested providers with override', () => {
      const ThemeContext = createContext('light')

      function Consumer({ id }: { id: string }) {
        const theme = context(ThemeContext)
        return f('span', { 'data-testid': id }, theme)
      }

      function App() {
        return f(ThemeContext.Provider, { value: 'dark' }, [
          f(Consumer, { id: 'outer' }),
          f(ThemeContext.Provider, { value: 'blue' }, [
            f(Consumer, { id: 'inner' })
          ])
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="outer"]')?.textContent).toBe('dark')
      expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('blue')
    })

    it('should update when provider value changes', async () => {
      const ThemeContext = createContext('light')

      function Consumer() {
        const theme = context(ThemeContext)
        return f('span', { 'data-testid': 'theme' }, theme)
      }

      function App() {
        const [theme, setTheme] = state('light')

        return f('div', {}, [
          f(ThemeContext.Provider, { value: theme }, [
            f(Consumer)
          ]),
          f('button', {
            'data-testid': 'toggle',
            onclick: () => setTheme(theme === 'light' ? 'dark' : 'light')
          }, 'Toggle')
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('light')

      container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
      await nextTick()

      expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark')
    })
  })

  describe('Multiple Contexts', () => {
    it('should support multiple different contexts', () => {
      const ThemeContext = createContext('light')
      const LanguageContext = createContext('en')

      function Consumer() {
        const theme = context(ThemeContext)
        const lang = context(LanguageContext)
        return f('div', {}, [
          f('span', { 'data-testid': 'theme' }, theme),
          f('span', { 'data-testid': 'lang' }, lang)
        ])
      }

      function App() {
        return f(ThemeContext.Provider, { value: 'dark' }, [
          f(LanguageContext.Provider, { value: 'ko' }, [
            f(Consumer)
          ])
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark')
      expect(container.querySelector('[data-testid="lang"]')?.textContent).toBe('ko')
    })

    it('should isolate different contexts', async () => {
      const CounterAContext = createContext(0)
      const CounterBContext = createContext(0)

      function ConsumerA() {
        const count = context(CounterAContext)
        return f('span', { 'data-testid': 'a' }, String(count))
      }

      function ConsumerB() {
        const count = context(CounterBContext)
        return f('span', { 'data-testid': 'b' }, String(count))
      }

      function App() {
        const [a, setA] = state(10)
        const [b] = state(20)

        return f('div', {}, [
          f(CounterAContext.Provider, { value: a }, [f(ConsumerA)]),
          f(CounterBContext.Provider, { value: b }, [f(ConsumerB)]),
          f('button', { 'data-testid': 'inc', onclick: () => setA(a + 1) }, '+')
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="a"]')?.textContent).toBe('10')
      expect(container.querySelector('[data-testid="b"]')?.textContent).toBe('20')

      container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
      await nextTick()

      expect(container.querySelector('[data-testid="a"]')?.textContent).toBe('11')
      expect(container.querySelector('[data-testid="b"]')?.textContent).toBe('20') // 변하지 않음
    })
  })

  describe('Real World Patterns', () => {
    it('should work as theme provider pattern', async () => {
      type Theme = { bg: string; text: string }
      const ThemeContext = createContext<Theme>({ bg: 'white', text: 'black' })

      function ThemedButton({ label }: { label: string }) {
        const theme = context(ThemeContext)
        return f('button', {
          'data-testid': 'themed-btn',
          style: `background:${theme.bg};color:${theme.text}`
        }, label)
      }

      function App() {
        const [isDark, setIsDark] = state(false)
        const theme = isDark
          ? { bg: 'black', text: 'white' }
          : { bg: 'white', text: 'black' }

        return f(ThemeContext.Provider, { value: theme }, [
          f(ThemedButton, { label: 'Click me' }),
          f('button', {
            'data-testid': 'toggle',
            onclick: () => setIsDark(!isDark)
          }, 'Toggle Theme')
        ])
      }

      render(f(App), container)

      const btn = container.querySelector('[data-testid="themed-btn"]') as HTMLButtonElement
      expect(btn.style.background).toBe('white')
      expect(btn.style.color).toBe('black')

      container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
      await nextTick()

      expect(btn.style.background).toBe('black')
      expect(btn.style.color).toBe('white')
    })

    it('should work as auth context pattern', () => {
      type AuthState = { isLoggedIn: boolean; user: string | null }
      const AuthContext = createContext<AuthState>({ isLoggedIn: false, user: null })

      function UserInfo() {
        const auth = context(AuthContext)
        if (!auth.isLoggedIn) {
          return f('div', { 'data-testid': 'auth' }, 'Please login')
        }
        return f('div', { 'data-testid': 'auth' }, `Welcome, ${auth.user}`)
      }

      function App() {
        return f(AuthContext.Provider, { value: { isLoggedIn: true, user: 'Alice' } }, [
          f(UserInfo)
        ])
      }

      render(f(App), container)
      expect(container.querySelector('[data-testid="auth"]')?.textContent).toBe('Welcome, Alice')
    })
  })
})
