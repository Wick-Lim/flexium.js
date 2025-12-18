---
title: FAQ
---

# FAQ

Frequently asked questions and answers.

## State Management

### Q: State doesn't update

**A**: State must be read within a reactive context.

```tsx
// ❌ Wrong approach - outside reactive context
const [count, setCount] = use(0)
console.log(count)  // Only outputs initial value, doesn't track updates

// ✅ Correct approach 1: Inside use()
use(() => {
  console.log(count)  // Tracks updates
})

// ✅ Correct approach 2: Inside JSX
function Counter() {
  const [count, setCount] = use(0)
  return <div>{count}</div>  // Automatically tracks updates
}
```

**See**: Check [use() documentation](/docs/core/effect).

---

### Q: Computed runs too frequently

**A**: Computed only recalculates when dependencies change. To prevent unnecessary recalculations:

```tsx
// ❌ Bad example - creates new object every time
const [data] = use(() => ({
  items: items,
  timestamp: Date.now()  // Different value each time
}))

// ✅ Good example - stable dependencies
const [data] = use(() => ({
  items: items,
  timestamp: 1234567890  // Fixed value
}))
```

Or use `sync()` to sync multiple updates:

```tsx
import { sync } from 'flexium/core'

sync(() => {
  setA(1)
  setB(2)
  setC(3)
})  // Single recalculation
```

**See**: Check [sync() documentation](/docs/core/sync).

---

### Q: When should I use global state?

**A**: Use it when state needs to be shared across multiple components.

```tsx
// ✅ Global state examples
// - User authentication
const [user] = use(null, undefined, { key: ['auth', 'user'] })
// In another component
const [theme, setTheme] = use('light', undefined, { key: ['app', 'theme'] })

// - Server data caching
const [posts] = use(async () => fetch('/api/posts'), {
  key: ['posts', 'all']
})

// ❌ When local state is sufficient
// - State only used within component
const [isOpen, setIsOpen] = use(false)  // No key needed
```

**See**: Check [use() documentation - Global State](/docs/core/state#global-state).

---

### Q: Memory leak occurs

**A**: Return cleanup functions from `use()` or delete unused global state.

```tsx
// ✅ Return cleanup function
use(() => {
  const interval = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => clearInterval(interval)  // cleanup
})

// ✅ Delete global state
import { use } from 'flexium/core'
useState.delete('old:key')  // Delete unused key
```

**See**: Check [use() documentation - With Cleanup](/docs/core/effect#with-cleanup).

---

## Effects and Side Effects

### Q: use() gets stuck in infinite loop

**A**: Don't update tracked state inside useEffect.

```tsx
// ❌ Infinite loop occurs
const [count, setCount] = use(0)
use(() => {
  setCount(count + 1)  // count changes → effect re-runs → count changes → ...
})

// ✅ Correct approach: conditional update
use(() => {
  if (count < 10) {
    setCount(count + 1)
  }
})

// ✅ Or: use untrack()
import { untrack } from 'flexium/core'
use(() => {
  untrack(() => {
    setCount(count + 1)  // Not tracked
  })
})
```

---

### Q: use() doesn't run

**A**: State must be read inside useEffect for dependencies to be tracked.

```tsx
// ❌ Dependencies not tracked
const [count, setCount] = use(0)
use(() => {
  console.log('Hello')  // Doesn't read count
})
setCount(1)  // Effect doesn't re-run

// ✅ Dependencies tracked
use(() => {
  console.log('Count:', count)  // Reads count
})
setCount(1)  // Effect re-runs
```

---

## Async State

### Q: How do I check async state status?

**A**: The third value returned by `use()` is the status.

```tsx
const [data, refetch, status, error] = use(async () => {
  const res = await fetch('/api/data')
  return res.json()
})

// status: 'idle' | 'loading' | 'success' | 'error'
if (String(status) === 'loading') {
  return <Spinner />
}

if (String(status) === 'error') {
  return <Error message={error.message} />
}
```

**See**: Check [use() documentation - Async State](/docs/core/state#async-state).

---

### Q: How do I manually refetch async state?

**A**: Use the `refetch` function.

```tsx
const [users, refetch, status] = use(async () => {
  return fetch('/api/users').then(r => r.json())
})

// Refetch on button click
<button onclick={refetch}>Refresh</button>
```

---

## Types and TypeScript

### Q: TypeScript type inference doesn't work

**A**: Specify types explicitly.

```tsx
// ✅ Explicit type specification
const [user, setUser] = useState<User | null>(null)

// ✅ Use generics
const [count, setCount] = useState<number>(0)

// ✅ For complex types
interface FormData {
  email: string
  password: string
}
const [form, setForm] = useState<FormData>({
  email: '',
  password: ''
})
```

---

### Q: How do I check StateValue type?

**A**: Use the `isStateValue()` helper.

```tsx
import { isStateValue } from 'flexium/core'

const [count, setCount] = use(0)

if (isStateValue(count)) {
  // count is StateValue<number>
  console.log(count.peek())
}
```

---

## Performance

### Q: How do I update multiple states at once?

**A**: Use `sync()` to sync updates.

```tsx
import { sync } from 'flexium/core'

// ❌ Multiple updates
setA(1)  // Update 1
setB(2)  // Update 2
setC(3)  // Update 3

// ✅ Single update
sync(() => {
  setA(1)
  setB(2)
  setC(3)
})  // Single re-render
```

**See**: Check [sync() documentation](/docs/core/sync).

---

### Q: List rendering is slow

**A**: Use `items.map()`. It's automatically optimized.

```tsx
// ✅ Optimized list rendering
{items.map((item) => <Item data={item} />)}

// ❌ Regular map (not optimized)
{items.map(item => <Item data={item} />)}
```

**See**: Check [for() documentation](/docs/core/for).

---

## Routing

### Q: How do I set up routing?

**A**: Use `Routes` and `Route` components.

```tsx
import { Routes, Route } from 'flexium/router'

function App() {
  return (
    <Routes>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={UserDetail} />
    </Routes>
  )
}
```

**See**: Check [Routes documentation](/docs/router/routes).

---

### Q: How do I get the current path?

**A**: Use the `useRouter()` function.

```tsx
import { useRouter } from 'flexium/router'

function Component() {
  const r = useRouter()
  console.log(r.location.pathname)  // Current path
  console.log(r.params)  // Path parameters
}
```

**See**: Check [useRouter() documentation](/docs/router/router).

---

## Common Issues

### Q: "Cannot read property 'value' of undefined" error occurs

**A**: You may be accessing state before it's initialized.

```tsx
// ❌ Access before initialization
const [user] = use(null)
console.log(user.name)  // Error: user is null

// ✅ Safe access
if (user) {
  console.log(user.name)
}

// ✅ Or use optional chaining
console.log(user?.name)
```

---

### Q: Component doesn't re-render

**A**: State must be read inside JSX or inside `use()`.

```tsx
// ❌ Doesn't re-render
function Component() {
  const [count, setCount] = use(0)
  const displayCount = count  // Read outside component
  return <div>{displayCount}</div>
}

// ✅ Re-renders
function Component() {
  const [count, setCount] = use(0)
  return <div>{count}</div>  // Read inside JSX
}
```

---

### Q: Many ESLint warnings appear

**A**: Check and fix `eslint-plugin-flexium` rules. Common warnings include:

- `no-signal-outside-reactive` - Reading state outside reactive context
- `effect-cleanup` - Missing cleanup function in effects
- `no-side-effect-in-computed` - Side effects in computed functions

**See**: Check [ESLint plugin documentation](/guide/eslint-plugin).

---

## Need More Help?

- [Official Documentation](/docs/) - Full API documentation
- [Example App](https://github.com/your-repo/hackernews) - Real-world usage examples
- [GitHub Issues](https://github.com/your-repo/issues) - Bug reports and feature requests
