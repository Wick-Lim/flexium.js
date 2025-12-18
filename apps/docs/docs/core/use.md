# use()

The unified API for all reactive primitives in Flexium.

<script setup>
import ShowcaseDemo from '../../components/ShowcaseDemo.vue'
import ComputedDemo from '../../components/ComputedDemo.vue'
import AsyncStateDemo from '../../components/AsyncStateDemo.vue'
import GlobalStateDemo from '../../components/GlobalStateDemo.vue'
import TimerDemo from '../../components/TimerDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <ShowcaseDemo />
</ClientOnly>

## Import

```ts
import { use } from 'flexium/core'
```

## Overview

`use()` replaces multiple hooks with one unified API:

| Pattern | Purpose | Returns |
|---------|---------|---------|
| `use(value)` | Local state | `[T, Setter<T>]` |
| `use(() => T, [deps])` | Computed/derived value | `[T, ResourceControl]` |
| `use(async () => T)` | Async data fetching | `[T \| undefined, ResourceControl]` |
| `use(({ onCleanup }) => {}, [deps])` | Side effects | `[undefined, ResourceControl]` |
| `use(value, undefined, { key })` | Global state | `[T, Setter<T>]` |
| `use(Context)` | Context consumption | `[T, undefined]` |

---

## Basic State

Create reactive state with an initial value:

```tsx
const [count, setCount] = use(0)
const [name, setName] = use('Flexium')
const [items, setItems] = use([])

// Read value directly
console.log(count)  // 0

// Update with value
setCount(5)

// Update with function
setCount(prev => prev + 1)
```

---

## Computed / Derived State

Pass a function with a dependency array to create derived values:

<ClientOnly>
  <ComputedDemo />
</ClientOnly>

```tsx
const [price, setPrice] = use(100)
const [quantity, setQuantity] = use(2)

// Recomputes when price or quantity changes
const [subtotal] = use(() => price * quantity, [price, quantity])
const [tax] = use(() => subtotal * 0.1, [subtotal])
const [total] = use(() => subtotal + tax, [subtotal, tax])

console.log(total)  // 220
```

::: tip
The second argument is the dependency array. The computation only re-runs when these values change.
:::

---

## Side Effects

Use a function with `onCleanup` to run side effects:

<ClientOnly>
  <TimerDemo />
</ClientOnly>

```tsx
const [count, setCount] = use(0)

// Effect runs when count changes
use(({ onCleanup }) => {
  console.log('Count changed:', count)
}, [count])

// Effect with cleanup
use(({ onCleanup }) => {
  const interval = setInterval(() => {
    setCount(c => c + 1)
  }, 1000)

  onCleanup(() => clearInterval(interval))
}, [])  // Empty deps = run once on mount
```

### Common Patterns

```tsx
// DOM updates
use(({ onCleanup }) => {
  document.body.classList.toggle('dark', theme === 'dark')
}, [theme])

// Event listeners
use(({ onCleanup }) => {
  const handler = (e) => console.log('Key:', e.key)
  window.addEventListener('keydown', handler)
  onCleanup(() => window.removeEventListener('keydown', handler))
}, [])

// WebSocket connection
use(({ onCleanup }) => {
  const ws = new WebSocket(`wss://api.com/${userId}`)
  ws.onmessage = (e) => setMessages(m => [...m, e.data])
  onCleanup(() => ws.close())
}, [userId])
```

### Lifecycle Patterns

`use()` handles all lifecycle needs—no separate mount or cleanup hooks:

```tsx
// Mount only (empty deps = run once)
use(({ onCleanup }) => {
  console.log('Component mounted!')
  onCleanup(() => console.log('Component unmounted!'))
}, [])

// Initialize third-party libraries
use(({ onCleanup }) => {
  const chart = new Chart(element, config)
  onCleanup(() => chart.destroy())
}, [])

// Cancel pending requests
use(({ onCleanup }) => {
  const controller = new AbortController()
  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => setResults(data))
  onCleanup(() => controller.abort())
}, [query])

// Countdown timer
use(({ onCleanup }) => {
  if (time <= 0) return
  const timeout = setTimeout(() => setTime(t => t - 1), 1000)
  onCleanup(() => clearTimeout(timeout))
}, [time])
```

---

## Async State

Pass an async function for data fetching with built-in loading/error states:

<ClientOnly>
  <AsyncStateDemo />
</ClientOnly>

```tsx
const [users, control] = use(async () => {
  const res = await fetch('/api/users')
  return res.json()
})

function UserList() {
  if (control.loading) return <Spinner />
  if (control.error) return <Error message={control.error.message} />

  return (
    <div>
      {users?.map(u => <User key={u.id} user={u} />)}
      <button onclick={() => control.refetch()}>Refresh</button>
    </div>
  )
}
```

### ResourceControl

```ts
type ResourceControl = {
  refetch: () => Promise<void>
  readonly loading: boolean
  readonly error: unknown
  readonly status: 'idle' | 'loading' | 'success' | 'error'
}
```

::: warning
Async functions do not support the `deps` array. The async function runs immediately and can be re-triggered via `control.refetch()`.
:::

---

## Global State

Use the `key` option to share state across components:

<ClientOnly>
  <GlobalStateDemo />
</ClientOnly>

```tsx
// In Component A
const [count, setCount] = use(0, undefined, { key: ['app', 'count'] })

// In Component B - shares the same state
const [count, setCount] = use(0, undefined, { key: ['app', 'count'] })

// Changes in A are reflected in B and vice versa
```

### Array Keys

Keys can be arrays for hierarchical namespacing:

```tsx
// Great for dynamic keys with IDs
const [user, setUser] = use(null, undefined, { key: ['user', 'profile', userId] })
const [posts, setPosts] = use([], undefined, { key: ['user', 'posts', userId] })
```

---

## Context

Consume context values created with `createContext`:

```tsx
import { use, createContext } from 'flexium/core'

const ThemeContext = createContext('light')

function ThemedButton() {
  const [theme] = use(ThemeContext)  // Returns [value, undefined]

  return <button class={theme}>Click me</button>
}
```

---

## Complete Example

```tsx
import { use } from 'flexium/core'

function App() {
  // Basic state
  const [count, setCount] = use(0)

  // Computed
  const [doubled] = use(() => count * 2, [count])

  // Effect with cleanup
  use(({ onCleanup }) => {
    console.log('Count is now:', count)
    onCleanup(() => console.log('Cleaning up...'))
  }, [count])

  // Async data
  const [users, { loading, refetch }] = use(async () => {
    const res = await fetch('/api/users')
    return res.json()
  })

  return (
    <div>
      <p>Count: {count} (doubled: {doubled})</p>
      <button onclick={() => setCount(c => c + 1)}>+</button>

      {loading ? <p>Loading...</p> : (
        <ul>
          {users?.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
      )}
      <button onclick={refetch}>Refresh Users</button>
    </div>
  )
}
```

---

## API Reference

### Signature

```ts
// State
function use<T>(initialValue: T): [T, Setter<T>]

// Computed / Effect
function use<T>(
  fn: (ctx: { onCleanup: (fn: () => void) => void }) => T,
  deps: any[]
): [T, ResourceControl]

// Async
function use<T>(
  fn: () => Promise<T>
): [T | undefined, ResourceControl]

// Global State
function use<T>(
  initialValue: T,
  deps: undefined,
  options: { key: unknown[] }
): [T, Setter<T>]

// Context
function use<T>(context: Context<T>): [T, undefined]
```

### Types

```ts
type Setter<T> = (value: T | ((prev: T) => T)) => void

type ResourceControl = {
  refetch: () => Promise<void>
  readonly loading: boolean
  readonly error: unknown
  readonly status: 'idle' | 'loading' | 'success' | 'error'
}
```

---

## See Also

- [sync()](/docs/core/sync) - Batch multiple state updates
- [Context](/docs/core/context) - Context API for dependency injection
