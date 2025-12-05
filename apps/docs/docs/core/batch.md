<script setup>
import BatchDemo from '../../components/BatchDemo.vue'
</script>

# batch()

Group multiple state updates to prevent intermediate renders.

## Live Demo

<ClientOnly>
  <BatchDemo />
</ClientOnly>

## Import

```ts
import { batch } from 'flexium/core'
```

## Signature

```ts
function batch<T>(fn: () => T): T
```

## Usage

### Basic Usage

```tsx
const [firstName, setFirstName] = state('John')
const [lastName, setLastName] = state('Doe')
const [age, setAge] = state(25)

// Without batch: 3 separate updates
setFirstName('Jane')
setLastName('Smith')
setAge(30)

// With batch: 1 combined update
batch(() => {
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
    batch(() => {
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
  batch(() => {
    setFilter('')
    setSortBy('name')
    setPage(1)
  })
}
```

### With Return Value

```tsx
const result = batch(() => {
  setCount(prev => prev + 1)
  setTotal(prev => prev + 100)
  return 'done'
})

console.log(result) // 'done'
```

### Nested Batches

```tsx
batch(() => {
  setA(1)

  batch(() => {
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

- All state updates inside `batch()` are **deferred**
- Effects and DOM updates happen **once** after the batch completes
- Batches can be **nested** - updates apply when outermost batch completes
- Reading state inside batch returns the **pending** value

## When to Use

Use `batch()` when:

- Updating multiple related states together
- Resetting form or filter states
- Handling events that modify multiple values
- Optimizing performance-critical updates

## Notes

- Event handlers in Flexium are automatically batched
- Async operations break out of the batch context
- Batching is automatic within synchronous code blocks in many cases

## See Also

- [state()](/docs/core/state)
- [effect()](/docs/core/effect)
