# Context

Context provides a way to pass data through the component tree without manually passing props.

## Import

```ts
import { Context, use } from 'flexium/core'
```

## Creating a Context

```ts
const ThemeContext = new Context<'light' | 'dark'>('light')
```

## Usage

### Basic Example

```tsx
import { Context, use } from 'flexium/core'

// Create context with default value
const ThemeContext = new Context<'light' | 'dark'>('light')

function App() {
  const [theme, setTheme] = use<'light' | 'dark'>('dark')

  return (
    <ThemeContext.Provider value={theme}>
      <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle
      </button>
      <ThemedCard />
    </ThemeContext.Provider>
  )
}

function ThemedCard() {
  // Consume context using use()
  const [theme] = use(ThemeContext)

  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      Current theme: {theme}
    </div>
  )
}
```

### Multiple Contexts

```tsx
const ThemeContext = new Context<'light' | 'dark'>('light')
const UserContext = new Context<User | null>(null)

function App() {
  const [theme] = use<'light' | 'dark'>('dark')
  const [user] = use<User | null>({ name: 'John' })

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <Dashboard />
      </UserContext.Provider>
    </ThemeContext.Provider>
  )
}

function Dashboard() {
  const [theme] = use(ThemeContext)
  const [user] = use(UserContext)

  return (
    <div class={theme}>
      Welcome, {user?.name}
    </div>
  )
}
```

## Alternative: Global State with key

For simpler cases without Provider hierarchy, use `use()` with `key`:

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

## When to Use Context vs key

| Use Context when... | Use key when... |
|---------------------|-----------------|
| Need Provider hierarchy | Simple global state |
| Different values for different subtrees | Same value everywhere |
| Following established patterns | Want minimal boilerplate |

## See Also

- [use()](/docs/core/state) - State and effects
- [Best Practices: State Organization](/docs/guide/best-practices/state-organization) - How to organize state
