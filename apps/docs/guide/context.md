# Global State Sharing

::: warning Deprecated: Context API
The Context API (`createContext`, `context`) is deprecated. Use `use()` with `key` option instead.

Flexium's philosophy is "No Context API boilerplate" and "No Provider hierarchies". Use `use()` with keys for global state sharing.
:::

## Recommended: Use use() with key

Instead of Context API, use `use()` with a `key` option to share state globally:

```tsx
import { use } from 'flexium/core'

// Share theme globally - no Provider needed
const [theme, setTheme] = use<'light' | 'dark'>('light', { key: ['app', 'theme'] })

// In any component - access the same state
function ThemedButton() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

  return (
    <button
      onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333'
      }}
    >
      Current theme: {theme}
    </button>
  )
}
```

## Complete Example: Auth State

```tsx
import { use } from 'flexium/core'

// Auth state - shared globally
function useAuth() {
  const [user, setUser] = use<User | null>(null, { key: ['app', 'auth', 'user'] })

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    const userData = await response.json()
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  return { user, login, logout }
}

// Use in any component
function Header() {
  const { user, logout } = useAuth()

  return (
    <header>
      {user ? (
        <>
          <span>Welcome, {user.name}</span>
          <button onclick={logout}>Logout</button>
        </>
      ) : (
        <LoginButton />
      )}
    </header>
  )
}
```

## Multiple Global States

```tsx
import { use } from 'flexium/core'

// Theme state
const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

// Language state
const [lang, setLang] = use('en', { key: ['app', 'language'] })

// User state
const [user, setUser] = use(null, { key: ['app', 'user'] })

// Use in any component
function ProfileCard() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })
  const [lang, setLang] = use('en', { key: ['app', 'language'] })
  const [user, setUser] = use(null, { key: ['app', 'user'] })

  return (
    <div class={`card-${theme}`}>
      <h2>{lang === 'en' ? 'Profile' : 'Profil'}</h2>
      <p>{user?.name}</p>
    </div>
  )
}
```

## Benefits of use() with key

- ✅ **No Provider boilerplate** - No wrapper components needed
- ✅ **No hierarchy** - Access from anywhere, not just child components
- ✅ **Simpler mental model** - Same API as local state
- ✅ **Automatic cleanup** - Use `useState.delete(key)` when needed
- ✅ **Type-safe** - Full TypeScript support

## Migration from Context API

If you're using deprecated Context API, migrate to `use()` with keys:

```tsx
// ❌ Old way (deprecated)
import { createContext } from 'flexium/advanced'
import { use } from 'flexium/core'

const ThemeContext = createContext('light')

function App() {
  const [theme, setTheme] = use('dark')
  return (
    <ThemeContext.Provider value={theme}>
      <Child />
    </ThemeContext.Provider>
  )
}

function Child() {
  const [theme] = use(ThemeContext)
  return <div>{theme}</div>
}

// ✅ New way
import { use } from 'flexium/core'

function App() {
  // Set theme globally - no Provider needed
  const [theme, setTheme] = use('dark', { key: ['app', 'theme'] })
  return <Child />
}

function Child() {
  // Access theme from anywhere
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })
  return <div>{theme}</div>
}
```

## Best Practices

1. **Use descriptive keys**: Use hierarchical keys like `['app', 'theme']` or `['app', 'auth', 'user']`
2. **Type safety**: Use TypeScript for type-safe state
3. **Cleanup when needed**: Global state is automatically cleaned up when no longer used
4. **Avoid overuse**: Don't use global state for every piece of data - prefer local state when possible

## See Also

- [use()](/docs/core/state) - Complete use() documentation with key option
- [Best Practices: State Organization](/docs/guide/best-practices/state-organization) - How to organize global state
