# state()

One API for all reactive state.

<script setup>
import ShowcaseDemo from '../../components/ShowcaseDemo.vue'
import ComputedDemo from '../../components/ComputedDemo.vue'
import AsyncStateDemo from '../../components/AsyncStateDemo.vue'
import GlobalStateDemo from '../../components/GlobalStateDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <ShowcaseDemo />
</ClientOnly>

## Import

```ts
import { state } from 'flexium/core'
```

## Usage

`state()` always returns a **tuple**:

```tsx
// Basic state - returns [value, setter]
const [count, setCount] = state(0)

// Derived state - returns [value, control]
const [doubled] = state(() => count * 2)

// Async state - returns [value, control]
const [users, control] = state(async () => fetch('/api'))
```

| Input | Returns |
|-------|---------|
| `state(value)` | `[T, StateSetter<T>]` |
| `state(() => T)` | `[T, ResourceControl]` |
| `state(async () => T)` | `[T \| undefined, ResourceControl]` |

## Basic State

```tsx
const [count, setCount] = state(0)

// Read
console.log(count + 1)  // 1
console.log(`Count: ${count}`)

// Write
setCount(5)
setCount(prev => prev + 1)
```

## Derived State

Pass a function with `deps` to create computed values:

<ClientOnly>
  <ComputedDemo />
</ClientOnly>

```tsx
const [price, setPrice] = state(100)
const [quantity, setQuantity] = state(2)

// Use deps to specify dependencies
const [subtotal] = state(() => price * quantity, { deps: [price, quantity] })
const [tax] = state(() => subtotal * 0.1, { deps: [subtotal] })
const [total] = state(() => subtotal + tax, { deps: [subtotal, tax] })

console.log(total)  // 220
```

### deps Option

Use `deps` to control when the computation re-runs:

```tsx
const [items] = useItems()
const [filter, setFilter] = state('all')

// Only recomputes when items or filter changes
const [filteredItems] = state(() => {
  return items.filter(item =>
    filter === 'all' ? true : item.status === filter
  )
}, { deps: [items, filter] })
```

::: warning
The `deps` option is not supported with async functions.
:::

## Async State

Pass an async function to handle data fetching with built-in status and error states:

<ClientOnly>
  <AsyncStateDemo />
</ClientOnly>

```tsx
const [users, control] = state(async () => {
  const res = await fetch('/api/users')
  return res.json()
})

// control has: status, loading, error, refetch
function UserList() {
  if (control.loading) return <Spinner />
  if (control.error) return <Error message={control.error.message} />

  return (
    <div>
      {users && users.map(u => <User key={u.id} user={u} />)}
      <button onclick={() => control.refetch()}>Refresh</button>
    </div>
  )
}
```

### ResourceControl

```tsx
type ResourceControl = {
  refetch: () => Promise<void>
  readonly loading: boolean
  readonly error: unknown
  readonly status: 'idle' | 'loading' | 'success' | 'error'
}
```

## Global State

Use the `key` option to share state across components:

<ClientOnly>
  <GlobalStateDemo />
</ClientOnly>

```tsx
// In Component A
const [count, setCount] = state(0, { key: 'app:count' })

// In Component B - shares the same state
const [count, setCount] = state(0, { key: 'app:count' })

// Changes in A are reflected in B and vice versa
```

### Array Keys

Keys can be arrays for hierarchical namespacing:

```tsx
// Array key - great for dynamic keys with IDs
const [user, setUser] = state(null, { key: ['user', 'profile', userId] })
const [posts, setPosts] = state([], { key: ['user', 'posts', userId] })

// Useful for cache key patterns similar to TanStack Query
const [data, control] = state(async () => fetchUser(id), {
  key: ['users', id]
})
```

## Example

```tsx
function Counter() {
  const [count, setCount] = state(0)
  const [doubled] = state(() => count * 2)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onclick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}
```

## See Also

- [effect()](/docs/core/effect)
- [sync()](/docs/core/sync)
