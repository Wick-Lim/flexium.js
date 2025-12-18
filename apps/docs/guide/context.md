# Global State Sharing

Flexium provides two ways to share state across components: Context with Provider hierarchy, or global state with keys.

## Option 1: Global State with key (Recommended)

The simplest way to share state globally:

```tsx
import { use } from 'flexium/core'

// No Provider needed - state is shared globally by key
function ThemeToggle() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

  return (
    <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}

function ThemedCard() {
  // Access the same state from anywhere
  const [theme] = use('light', { key: ['app', 'theme'] })

  return <div class={theme}>Themed content</div>
}
```

### Complete Example: Auth State

```tsx
import { use } from 'flexium/core'

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

  const logout = () => setUser(null)

  return { user, login, logout }
}

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

## Option 2: Context with Provider

For cases where you need different values in different subtrees:

```tsx
import { Context, use } from 'flexium/core'

const ThemeContext = new Context<'light' | 'dark'>('light')

function App() {
  return (
    <div>
      {/* Light theme section */}
      <ThemeContext.Provider value="light">
        <Sidebar />
      </ThemeContext.Provider>

      {/* Dark theme section */}
      <ThemeContext.Provider value="dark">
        <MainContent />
      </ThemeContext.Provider>
    </div>
  )
}

function Sidebar() {
  const [theme] = use(ThemeContext)  // 'light'
  return <nav class={theme}>...</nav>
}

function MainContent() {
  const [theme] = use(ThemeContext)  // 'dark'
  return <main class={theme}>...</main>
}
```

## When to Use Each

| Use key when... | Use Context when... |
|-----------------|---------------------|
| Simple global state | Different values for different subtrees |
| Same value everywhere | Need Provider hierarchy |
| Want minimal boilerplate | Following established patterns |

## Best Practices

1. **Use descriptive keys**: `['app', 'theme']` or `['app', 'auth', 'user']`
2. **Prefer key for global state**: Less boilerplate, simpler mental model
3. **Use Context for subtree variations**: When different parts need different values

## See Also

- [Context](/docs/core/context) - Context API reference
- [use()](/docs/core/state) - State and effects
- [Best Practices: State Organization](/docs/guide/best-practices/state-organization)
