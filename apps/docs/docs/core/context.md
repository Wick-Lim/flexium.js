# Context API

::: warning Deprecated
The Context API is deprecated. Use `use()` with `key` option instead for sharing state across components.

Flexium's philosophy is "No Context API boilerplate" and "No Provider hierarchies". Use `use()` with keys for global state sharing.
:::

## Recommended: Use use() with key

Instead of Context API, use `use()` with a `key` option:

```tsx
import { use } from 'flexium/core'

// In any component
function ThemeToggle() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

  return (
    <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

### Complete Example: Auth State

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

### Multiple Global States

```tsx
import { use } from 'flexium/core'

// Use in any component
function Dashboard() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })
  const [user, setUser] = use(null, { key: ['app', 'auth', 'user'] })
  const [items, setItems] = use([], { key: ['app', 'cart', 'items'] })

  return (
    <div class={theme}>
      <p>Welcome, {user?.name}</p>
      <p>Cart items: {items.length}</p>
    </div>
  )
}
```

## Benefits of use() with key

- ✅ **No Provider boilerplate** - No wrapper components needed
- ✅ **No hierarchy** - Access from anywhere, not just child components
- ✅ **Simpler mental model** - Same API as local state
- ✅ **Automatic cleanup** - State is automatically cleaned up when no longer used
- ✅ **Type-safe** - Full TypeScript support

## Migration from Context API

If you're using deprecated Context API, migrate to `use()` with keys:

```tsx
// ❌ Old way (deprecated)
import { Context, use } from 'flexium/core'

const ThemeContext = new Context('light')

function ThemeProvider(props) {
  const [theme] = use('light')
  return (
    <ThemeContext.Provider value={theme}>
      {props.children}
    </ThemeContext.Provider>
  )
}

function Child() {
  const [theme] = use(ThemeContext)
  return <div>{theme}</div>
}

// ✅ New way
import { use } from 'flexium/core'

// No Provider needed!
function Child() {
  const [theme] = use('light', { key: ['app', 'theme'] })
  return <div>{theme}</div>
}
```

## See Also

- [use()](/docs/core/state) - Complete use() documentation with key option
- [Best Practices: State Organization](/docs/guide/best-practices/state-organization) - How to organize global state
