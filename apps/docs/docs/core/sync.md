<script setup>
import SyncDemo from '../../components/SyncDemo.vue'
</script>

# sync()

Synchronize state updates to the DOM.

## Live Demo

<ClientOnly>
  <SyncDemo />
</ClientOnly>

## Import

```ts
import { sync } from 'flexium/core'
```

## Signature

```ts
// 1. Force Flush
function sync(): void

// 2. Sync Updates
function sync<T>(fn: () => T): T
```

## Usage

### Basic Usage

```tsx
const [firstName, setFirstName] = state('John')
const [lastName, setLastName] = state('Doe')
const [age, setAge] = state(25)

// Without sync: 3 separate updates
setFirstName('Jane')
setLastName('Smith')
setAge(30)

// With sync: 1 combined update
sync(() => {
  setFirstName('Jane')
  setLastName('Smith')
  setAge(30)
})
```

### In Event Handlers

```tsx
function UserForm() {
  const [name, setName] = state('')
  const [email, setEmail] = state('')
  const [errors, setErrors] = state({})

  const handleSubmit = () => {
    sync(() => {
      setName('')
      setEmail('')
      setErrors({})
    })
  }

  return (
    <form onsubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### Reset Multiple States

```tsx
const [items, setItems] = state([])
const [filter, setFilter] = state('')
const [sortBy, setSortBy] = state('name')
const [page, setPage] = state(1)

function resetFilters() {
  sync(() => {
    setFilter('')
    setSortBy('name')
    setPage(1)
  })
}
```

### With Return Value

```tsx
const result = sync(() => {
  setCount(prev => prev + 1)
  setTotal(prev => prev + 100)
  return 'done'
})

console.log(result) // 'done'
```

### Nested Syncs

```tsx
sync(() => {
  setA(1)

  sync(() => {
    setB(2)
    setC(3)
  })

  setD(4)
})
// All updates happen together
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => T` | Function containing state updates |

## Returns

- The return value of the provided function

## Behavior

- `sync()` (no args): Force flushes pending effects immediately
- `sync(fn)`: Syncs updates inside `fn`, then flushes immediately
- Reading state inside sync returns the **pending** value

## When to Use

Use `sync()` when:

- Updating multiple related states together
- Resetting form or filter states
- Handling events that modify multiple values
- Optimizing performance-critical updates
- Measuring DOM immediately after updates

## Notes

- Event handlers in Flexium are automatically synced
- Async operations break out of the sync context
- Syncing is automatic within synchronous code blocks in many cases

## See Also

- [state()](/docs/core/state)
- [effect()](/docs/core/effect)
