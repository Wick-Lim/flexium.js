# state()

One API for all reactive state.

::: danger Important: Proxy Comparison
State values are **Proxy objects**. When comparing with `===`, you **must cast to primitive** first:
```tsx
// ❌ WRONG - Proxy comparison always fails
if (count === 5) { ... }

// ✅ CORRECT - Cast to primitive
if (+count === 5) { ... }           // number (use +)
if (String(name) === 'Alice') { }   // string (use String())
if (user.id === 1) { ... }          // compare properties directly
```
:::

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

`state()` always returns an array:

```tsx
// Basic state
const count = state(0)

// Derived state (pass a function)
const doubled = state(() => count * 2)

// Async state
const users = state(async () => fetch('/api'))
```

| Input | Returns |
|-------|---------|
| `state(value)` | `StateValue<T>` |
| `state(() => T)` | `StateValue<T>` |
| `state(async () => T)` | `StateValue<T>` |

## Basic State

```tsx
const count = state(0)

// Read
console.log(count + 1)  // 1
console.log(`Count: ${count}`)

// Write
count.set(5)
count.set(prev => prev + 1)
```

## Derived State

Pass a function to create values that auto-update when dependencies change:

<ClientOnly>
  <ComputedDemo />
</ClientOnly>

```tsx
const price = state(100)
const quantity = state(2)

const subtotal = state(() => price * quantity)
const tax = state(() => subtotal * 0.1)
const total = state(() => subtotal + tax)

console.log(+total)  // 220
```

## Async State

Pass an async function to handle data fetching with built-in status and error states:

<ClientOnly>
  <AsyncStateDemo />
</ClientOnly>

```tsx
const users = state(async () => {
  const res = await fetch('/api/users')
  return res.json()
})

// status: 'idle' | 'loading' | 'success' | 'error'
function UserList() {
  return (
    <div>
      {String(users.status) === 'loading' && <Spinner />}
      {String(users.status) === 'error' && <Error message={users.error.message} />}
      {users && users.map(u => <User key={u.id} user={u} />)}
      <button onclick={users.refetch}>Refresh</button>
    </div>
  )
}
```

## Global State

Use the `key` option to share state across components:

<ClientOnly>
  <GlobalStateDemo />
</ClientOnly>

```tsx
// In Component A
const count = state(0, { key: 'app:count' })

// In Component B - shares the same state
const count = state(0, { key: 'app:count' })

// In Component C - read-only access
const count = state(0, { key: 'app:count' })
```

### Array Keys

Keys can be arrays for hierarchical namespacing:

```tsx
// Array key - great for dynamic keys with IDs
const user = state(null, { key: ['user', 'profile', userId] })
const posts = state([], { key: ['user', 'posts', userId] })

// Useful for cache key patterns similar to TanStack Query
const data = state(async () => fetchUser(id), {
  key: ['users', id]
})
```

## Params Option

Pass explicit parameters to functions for better DX:

```tsx
// Without params - dependencies are implicit in closure
const user = state(async () => {
  return fetch(`/api/users/${userId}/posts/${postId}`)
})

// With params - dependencies are explicit
const user = state(
  async ({ userId, postId }) => {
    return fetch(`/api/users/${userId}/posts/${postId}`)
  },
  {
    key: ['user', 'posts', userId, postId],
    params: { userId, postId }
  }
)
```

Benefits of explicit params:
- **Self-documenting** - Clear what the function depends on
- **DevTools visibility** - See params in debugging tools
- **Type inference** - Better TypeScript support

## Example

```tsx
function Counter() {
  const count = state(0)
  const doubled = state(() => count * 2)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onclick={() => count.set(c => c + 1)}>+</button>
    </div>
  )
}
```

## See Also

- [effect()](/docs/core/effect)
- [sync()](/docs/core/sync)
