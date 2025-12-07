# state()

One API for all reactive state.

<script setup>
import ShowcaseDemo from '../../components/ShowcaseDemo.vue'
import ComputedDemo from '../../components/ComputedDemo.vue'
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
const [count, setCount] = state(0)

// Derived state (pass a function)
const [doubled] = state(() => count * 2)

// Async state
const [users, refetch, loading, error] = state(async () => fetch('/api'))
```

| Input | Returns |
|-------|---------|
| `state(value)` | `[value, setter]` |
| `state(() => T)` | `[value]` |
| `state(async () => T)` | `[value, refetch, loading, error]` |

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

Pass a function to create values that auto-update when dependencies change:

<ClientOnly>
  <ComputedDemo />
</ClientOnly>

```tsx
const [price, setPrice] = state(100)
const [quantity, setQuantity] = state(2)

const [subtotal] = state(() => price * quantity)
const [tax] = state(() => subtotal * 0.1)
const [total] = state(() => subtotal + tax)

console.log(+total)  // 220
```

## Async State

```tsx
const [users, refetch, loading, error] = state(async () => {
  const res = await fetch('/api/users')
  return res.json()
})

function UserList() {
  return (
    <div>
      {loading ? <Spinner /> : null}
      {error ? <Error message={error.message} /> : null}
      {users ? <For each={users}>{u => <User user={u} />}</For> : null}
      <button onclick={refetch}>Refresh</button>
    </div>
  )
}
```

## Global State

Use the `key` option to share state across components:

```tsx
// Same state anywhere
const [theme, setTheme] = state('light', { key: 'app:theme' })
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
- [batch()](/docs/core/batch)
