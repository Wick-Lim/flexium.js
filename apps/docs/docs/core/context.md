# Context API

Share state across the component tree without prop drilling.

<script setup>
import ContextDemo from '../../components/ContextDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <ContextDemo />
</ClientOnly>

## Import

```tsx
import { createContext, useContext } from 'flexium/core'
```

## Functions

### createContext

```ts
function createContext<T>(defaultValue: T): Context<T>
```

### useContext

```ts
function useContext<T>(context: Context<T>): T
```

## Usage

### Creating a Context

```tsx
interface ThemeContextValue {
  theme: Accessor<'light' | 'dark'>
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: () => 'light',
  toggleTheme: () => {}
})
```

### Provider Component

```tsx
function ThemeProvider(props: { children: any }) {
  const [theme, setTheme] = state<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  )
}
```

### Consuming Context

```tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button onclick={toggleTheme}>
      Current: {theme()}
    </button>
  )
}
```

### Complete Example

```tsx
// Auth Context
interface AuthContextValue {
  user: Accessor<User | null>
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({...})

function AuthProvider(props: { children: any }) {
  const [user, setUser] = state<User | null>(null)

  const login = async (credentials: Credentials) => {
    const user = await api.login(credentials)
    setUser(user)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

// Usage
function App() {
  return (
    <AuthProvider>
      <Header />
      <MainContent />
    </AuthProvider>
  )
}

function Header() {
  const { user, logout } = useContext(AuthContext)

  return (
    <header>
      <Show when={() => user() !== null} fallback={<LoginButton />}>
        <span>Welcome, {user()?.name}</span>
        <button onclick={logout}>Logout</button>
      </Show>
    </header>
  )
}
```

### Multiple Contexts

```tsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function Dashboard() {
  const { theme } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)
  const { notify } = useContext(NotificationContext)

  // Use all contexts
}
```

## Behavior

- Context value is **inherited** down the component tree
- **Nearest Provider** value is used when nested
- **Default value** is used when no Provider is found
- Values can include **signals** for reactivity

## Best Practices

1. **Keep contexts focused** - One context per concern
2. **Use signals** in context values for reactivity
3. **Provide sensible defaults** for development
4. **Create custom hooks** for complex contexts:

```tsx
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## See Also

- [state()](/docs/core/state)
- [computed()](/docs/core/computed)
