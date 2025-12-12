# Frequently Asked Questions

Common questions about using Flexium.

## General

### What is Flexium?

Flexium is a lightweight, signals-based UI framework with fine-grained reactivity. It provides:
- Reactive state management with signals
- JSX-based rendering
- Cross-platform primitives (Web and Canvas)
- Built-in routing and form handling

### How is Flexium different from React?

| Feature | Flexium | React |
|---------|---------|-------|
| Reactivity | Fine-grained signals | Virtual DOM diffing |
| Updates | Only affected nodes | Component re-renders |
| State | `signal()` / `state()` | `useState()` / stores |
| Size | ~10KB gzipped | ~45KB gzipped |
| JSX | Yes | Yes |

### Can I use Flexium with TypeScript?

Yes! Flexium is written in TypeScript and provides full type definitions. See the [TypeScript Guide](/guide/typescript).

## State Management

### When should I use `signal()` vs `state()`?

- Use `signal()` for standalone reactive values
- Use `state()` for React-like tuple syntax `[getter, setter]`

```tsx
// signal() - access via .value
const count = signal(0)
count.value

// state() - direct value access
const [count, setCount] = state(0)
count // use directly
```

### How do I share state between components?

Use global state with a key:

```tsx
// In any component
const [user, setUser] = state(null, { key: 'currentUser' })

// In another component - same state!
const [user, setUser] = state(null, { key: 'currentUser' })
```

Or use Context API:

```tsx
import { state } from 'flexium/core'

function App() {
  // Set theme globally - no Provider needed
  const [theme, setTheme] = state('dark', { key: 'app:theme' })
  return <MyComponent />
}

function MyComponent() {
  // Access theme from anywhere
  const [theme] = state('light', { key: 'app:theme' })
  return <div>Theme: {theme}</div>
}
```

### Why isn't my component updating?

Common causes:

1. **Not using a signal** - Plain variables don't trigger updates
   ```tsx
   // Won't update
   let count = 0

   // Will update
   const [count, setCount] = state(0)
   ```

2. **Mutating objects directly** - Create new references
   ```tsx
   // Won't update
   user.value.name = 'Bob'

   // Will update
   user.set({ ...user.value, name: 'Bob' })
   ```

3. **Reading outside reactive context** - Use in JSX or effects
   ```tsx
   // Outside component - won't track
   console.log(count)

   // Inside effect - will track
   effect(() => console.log(count))
   ```

## Rendering

### How do I conditionally render content?

Use native JavaScript - just like React:

```tsx
{isLoggedIn && <Dashboard />}

{isLoggedIn ? <Dashboard /> : <Login />}
```

### How do I render lists?

Use `.map()` - just like React:

```tsx
{items.map((item, index) => (
  <ListItem key={item.id} item={item} index={index} />
))}
```

### How do I handle multiple conditions?

Use `<Switch>` and `<Match>`:

```tsx
<Switch>
  <Match when={status === 'loading'}>
    <Spinner />
  </Match>
  <Match when={status === 'error'}>
    <Error />
  </Match>
  <Match when={status === 'success'}>
    <Content />
  </Match>
</Switch>
```

## Styling

### How do I style components?

Multiple options:

1. **Inline styles**
   ```tsx
   <div style={{ color: 'red', padding: '10px' }}>...</div>
   ```

2. **CSS classes**
   ```tsx
   <div class="my-class">...</div>
   ```

3. **Primitives with style props**
   ```tsx
   <Column padding={16} backgroundColor="#fff">...</Column>
   ```

### Can I use CSS-in-JS libraries?

Yes, Flexium works with most CSS-in-JS solutions. Just apply classes or styles as usual.

## Performance

### How does Flexium achieve good performance?

- **Fine-grained updates**: Only nodes that depend on changed signals update
- **No Virtual DOM**: Direct DOM manipulation without diffing overhead
- **Automatic Synchronization**: Multiple updates are synchronized together

### How do I optimize large lists?

Use the `virtual` prop on `<List>`:

```tsx
<List items={largeArray} virtual height={400} itemSize={50}>
  {(item) => <ListItem item={item} />}
</List>
```

### How do I prevent unnecessary effects?

Use `untrack()` to read without creating dependencies:

```tsx
import { untrack } from 'flexium/advanced'

effect(() => {
  const value = trigger
  // config won't trigger re-run
  const cfg = untrack(() => config)
})
```

## Routing

### How do I set up routing?

```tsx
import { Router, Route, Link } from 'flexium/router'

function App() {
  return (
    <Router>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>

      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  )
}
```

### How do I access route params?

```tsx
import { router } from 'flexium/router'

function UserProfile() {
  const route = router()
  const userId = route.params.id

  return <div>User: {userId}</div>
}

// Route: <Route path="/users/:id" component={UserProfile} />
```

## Forms

### How do I handle forms?

Use `state()` for form handling:

```tsx
import { state } from 'flexium/core'

function LoginForm() {
  const [formData, setFormData] = state({ email: '', password: '' })
  const [errors, setErrors] = state({})

  const validate = () => {
    const newErrors = {}
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      await login(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email}
        onInput={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={formData.password}
        onInput={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

## Debugging

### How do I debug signals?

Enable DevTools:

```tsx
import { enableDevTools } from 'flexium/advanced'

if (process.env.NODE_ENV === 'development') {
  enableDevTools()
}

// Then in console:
window.__FLEXIUM_DEVTOOLS__.getSignals()
```

### Why am I seeing infinite loops?

Usually caused by updating a signal inside an effect that reads it:

```tsx
// Bad - infinite loop
effect(() => {
  setCount(count + 1)
})

// Good - use previous value in setter
setCount(prev => prev + 1)
```

## Migration

### Can I migrate from React incrementally?

Flexium's JSX is compatible with React patterns. Start by:
1. Replacing `useState` with `state()`
2. Replacing `useEffect` with `effect()`
3. Using Flexium's control flow components

See [Migration Guide](/guide/migration) for details.

## Getting Help

- [GitHub Issues](https://github.com/Wick-Lim/flexium.js/issues)
- [Documentation](/guide/introduction)
- [API Reference](/docs/core/state)
