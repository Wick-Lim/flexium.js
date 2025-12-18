# Context API

::: warning Deprecated
The Context API is deprecated. Use `use()` with `key` option instead for sharing state across components.

Flexium's philosophy is "No Context API boilerplate" and "No Provider hierarchies". Use `use()` with keys for global state sharing.
:::

## Recommended: Use use() with key

Instead of Context API, use `use()` with a `key` option:

```tsx
import { useState } from 'flexium/core'

// Share theme across all components
const theme = useState<'light' | 'dark'>('light', { key: 'app:theme' })

// In any component
function ThemeToggle() {
  const [theme] = use('light', [], { key: 'app:theme' })

  return (
    <button onclick={() => theme.set(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

### Complete Example: Auth State

```tsx
import { useState } from 'flexium/core'

// Auth state - shared globally
// Share theme across all components
const theme = useState<'light' | 'dark'>('light', { key: 'app:theme' })

// In any component
function ThemeToggle() {
  const [theme] = use('light', [], { key: 'app:theme' })

  return (
    <button onclick={() => theme.set(t => t === 'light' ? 'dark' : 'light')}>

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
import { useState } from 'flexium/core'

// Theme state
const [theme] = use('light', [], { key: 'app:theme' })

// Auth state
const [user] = use(null, [], { key: 'app:auth:user' })

// Cart state
const [items] = use([], [], { key: 'app:cart:items' })

// Use in any component
function Dashboard() {
  const [theme] = use('light', [], { key: 'app:theme' })
  const [user] = use(null, [], { key: 'app:auth:user' })
  const [items] = use([], [], { key: 'app:cart:items' })

  // Use all states
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
import { createContext, useContext } from 'flexium/advanced'

const ThemeContext = createContext('light')

function ThemeProvider(props) {
  const [theme] = use('light')
  return (
    <ThemeContext.Provider value={theme}>
      {props.children}
    </ThemeContext.Provider>
  )
}

function Child() {
  const theme = useContext(ThemeContext)
  return <div>{theme}</div>
}

// ✅ New way
import { useState } from 'flexium/core'

// No Provider needed!
function Child() {
  const [theme] = use('light', [], { key: 'app:theme' })
  return <div>{theme}</div>
}
```

## See Also

- [use()](/docs/core/state) - Complete use() documentation with key option
- [Best Practices: State Organization](/docs/guide/best-practices/state-organization) - How to organize global state
