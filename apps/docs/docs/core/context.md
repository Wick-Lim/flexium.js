# Context API

::: warning Deprecated
The Context API is deprecated. Use `state()` with `key` option instead for sharing state across components.

Flexium's philosophy is "No Context API boilerplate" and "No Provider hierarchies". Use `state()` with keys for global state sharing.
:::

## Recommended: Use state() with key

Instead of Context API, use `state()` with a `key` option:

```tsx
import { state } from 'flexium/core'

// Share theme across all components
const [theme, setTheme] = state<'light' | 'dark'>('light', { key: 'app:theme' })

// In any component
function ThemeToggle() {
  const [theme, setTheme] = state('light', { key: 'app:theme' })
  
  return (
    <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

### Complete Example: Auth State

```tsx
import { state } from 'flexium/core'

// Auth state - shared globally
function useAuth() {
  const [user, setUser] = state<User | null>(null, { key: 'auth:user' })
  
  const login = async (credentials: Credentials) => {
    const user = await api.login(credentials)
    setUser(user)
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

### Multiple Global States

```tsx
import { state } from 'flexium/core'

// Theme state
const [theme, setTheme] = state('light', { key: 'app:theme' })

// Auth state
const [user, setUser] = state(null, { key: 'app:auth:user' })

// Cart state
const [items, setItems] = state([], { key: 'app:cart:items' })

// Use in any component
function Dashboard() {
  const [theme] = state('light', { key: 'app:theme' })
  const [user] = state(null, { key: 'app:auth:user' })
  const [items] = state([], { key: 'app:cart:items' })
  
  // Use all states
}
```

## Benefits of state() with key

- ✅ **No Provider boilerplate** - No wrapper components needed
- ✅ **No hierarchy** - Access from anywhere, not just child components
- ✅ **Simpler mental model** - Same API as local state
- ✅ **Automatic cleanup** - Use `state.delete(key)` when needed
- ✅ **Type-safe** - Full TypeScript support

## Migration from Context API

If you're using deprecated Context API, migrate to `state()` with keys:

```tsx
// ❌ Old way (deprecated)
import { createContext, context } from 'flexium/core'

const ThemeContext = createContext('light')

function ThemeProvider(props) {
  const [theme, setTheme] = state('light')
  return (
    <ThemeContext.Provider value={theme}>
      {props.children}
    </ThemeContext.Provider>
  )
}

function Child() {
  const theme = context(ThemeContext)
  return <div>{theme}</div>
}

// ✅ New way
import { state } from 'flexium/core'

// No Provider needed!
function Child() {
  const [theme] = state('light', { key: 'app:theme' })
  return <div>{theme}</div>
}
```

## See Also

- [state()](/docs/core/state) - Complete state() documentation with key option
- [Best Practices: State Organization](/docs/guide/best-practices/state-organization) - How to organize global state
