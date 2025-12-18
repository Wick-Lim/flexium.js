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
const [firstName] = use('John')
const [lastName] = use('Doe')
const [age] = use(25)

// Without sync: 3 separate updates
firstName.set('Jane')
lastName.set('Smith')
age.set(30)

// With sync: 1 combined update
sync(() => {
  firstName.set('Jane')
  lastName.set('Smith')
  age.set(30)
})
```

### In Event Handlers

```tsx
function UserForm() {
  const [name] = use('')
  const [email] = use('')
  const [errors] = use({})

  const handleSubmit = () => {
    sync(() => {
      name.set('')
      email.set('')
      errors.set({})
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
const [items] = use([])
const [filter] = use('')
const [sortBy] = use('name')
const [page] = use(1)

function resetFilters() {
  sync(() => {
    filter.set('')
    sortBy.set('name')
    page.set(1)
  })
}
```

### With Return Value

```tsx
const result = sync(() => {
  count.set(prev => prev + 1)
  total.set(prev => prev + 100)
  return 'done'
})

console.log(result) // 'done'
```

### Nested Syncs

```tsx
sync(() => {
  a.set(1)

  sync(() => {
    b.set(2)
    c.set(3)
  })

  d.set(4)
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

- [use()](/docs/core/state)
- [use()](/docs/core/effect)
