# Context API

The Context API allows you to share data across components without prop drilling. It's useful for global state like themes, user authentication, or locale settings.

## Creating a Context

Use `createContext()` to create a context with a default value:

```tsx
import { createContext, useContext } from 'flexium/core'

// Create a context with a default value
const ThemeContext = createContext('light')
```

The default value is used when a component calls `context()` without a matching `Provider` above it.

## Providing Context

Wrap your component tree with the context's `Provider` to make a value available:

```tsx
function App() {
  const [theme, setTheme] = state('dark')

  return (
    <ThemeContext.Provider value={theme()}>
      <Header />
      <Content />
      <Footer />
    </ThemeContext.Provider>
  )
}
```

## Consuming Context

Use `context()` to read the current context value:

```tsx
function ThemedButton() {
  const theme = useContext(ThemeContext)

  return (
    <button
      style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333'
      }}
    >
      Click me
    </button>
  )
}
```

## Complete Example

Here's a complete theme switching example:

```tsx
import { state, createContext, useContext } from 'flexium/core'
import { render } from 'flexium/dom'
import { Row, Column, Text, Pressable } from 'flexium/primitives'

// 1. Create the context
const ThemeContext = createContext<'light' | 'dark'>('light')

// 2. Create a hook for easier access
function useTheme() {
  return useContext(ThemeContext)
}

// 3. Theme-aware components
function ThemedCard(props: { title: string; children: any }) {
  const theme = useTheme()

  const styles = {
    light: { background: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e5e5' },
    dark: { background: '#2d2d2d', color: '#ffffff', border: '1px solid #404040' }
  }

  return (
    <Column style={{ ...styles[theme], padding: '16px', borderRadius: '8px' }}>
      <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>{props.title}</Text>
      {props.children}
    </Column>
  )
}

function ThemeToggle() {
  const theme = useTheme()

  return (
    <Pressable
      onPress={() => {
        // Toggle theme (would need to lift state up in real app)
      }}
      style={{
        padding: '8px 16px',
        background: theme === 'dark' ? '#4a4a4a' : '#e0e0e0',
        borderRadius: '4px'
      }}
    >
      <Text>Current: {theme}</Text>
    </Pressable>
  )
}

// 4. App with Provider
function App() {
  const [theme, setTheme] = state<'light' | 'dark'>('light')

  return (
    <ThemeContext.Provider value={theme()}>
      <Column style={{ gap: '16px', padding: '24px' }}>
        <ThemedCard title="Welcome">
          <Text>This card follows the current theme.</Text>
        </ThemedCard>
        <ThemeToggle />
      </Column>
    </ThemeContext.Provider>
  )
}

render(<App />, document.getElementById('app')!)
```

## Nested Providers

You can nest providers to override context values for specific parts of your app:

```tsx
function App() {
  return (
    <ThemeContext.Provider value="light">
      <Header />  {/* Uses light theme */}

      <ThemeContext.Provider value="dark">
        <Sidebar />  {/* Uses dark theme */}
      </ThemeContext.Provider>

      <Content />  {/* Uses light theme */}
    </ThemeContext.Provider>
  )
}
```

The innermost provider's value takes precedence.

## Common Patterns

### Authentication Context

```tsx
interface AuthState {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  login: async () => {},
  logout: () => {}
})

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
    <AuthContext.Provider value={{ user: user(), login, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

// Usage
function UserMenu() {
  const { user, logout } = useContext(AuthContext)

  return (
    <Show when={() => user !== null} fallback={<LoginButton />}>
      {() => (
        <Row>
          <Text>Hello, {user!.name}</Text>
          <Pressable onPress={logout}>
            <Text>Logout</Text>
          </Pressable>
        </Row>
      )}
    </Show>
  )
}
```

### Locale/i18n Context

```tsx
const LocaleContext = createContext({
  locale: 'en',
  t: (key: string) => key
})

function LocaleProvider(props: { children: any }) {
  const [locale, setLocale] = state('en')
  const translations = getTranslations(locale())

  const t = (key: string) => translations[key] || key

  return (
    <LocaleContext.Provider value={{ locale: locale(), t }}>
      {props.children}
    </LocaleContext.Provider>
  )
}

// Usage
function Greeting() {
  const { t } = useContext(LocaleContext)
  return <Text>{t('welcome_message')}</Text>
}
```

## API Reference

### `createContext<T>(defaultValue: T): Context<T>`

Creates a new context object.

| Parameter | Type | Description |
|-----------|------|-------------|
| `defaultValue` | `T` | The default value used when no Provider is found |

Returns a `Context<T>` object with:
- `Provider`: Component to provide the context value
- `id`: Internal symbol for identification
- `defaultValue`: The default value

### `useContext<T>(context: Context<T>): T`

Reads the current value from a context.

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `Context<T>` | The context object to read from |

Returns the current context value, or the default value if no Provider is found above in the tree.

## Best Practices

1. **Keep contexts focused**: Create separate contexts for different concerns (theme, auth, locale) rather than one giant global context.

2. **Memoize provider values**: When using objects as context values, consider memoizing to prevent unnecessary re-renders:

   ```tsx
   const value = useMemo(() => ({ user, login, logout }), [user])
   ```

3. **Create custom hooks**: Wrap `context()` in a custom hook for better DX:

   ```tsx
   function useAuth() {
     return useContext(AuthContext)
   }
   ```

4. **Handle missing providers**: For required contexts, consider throwing an error if used without a provider:

   ```tsx
   function useAuth() {
     const context = useContext(AuthContext)
     if (context === null) {
       throw new Error('useAuth must be used within an AuthProvider')
     }
     return context
   }
   ```

## When to Use Context

Use Context for:
- Theme settings
- User authentication
- Locale/language preferences
- Feature flags
- Any data that many components need access to

Consider alternatives for:
- Frequently changing data (use signals directly)
- Data only needed by a few components (use props)
- Complex state logic (use state management with signals)
