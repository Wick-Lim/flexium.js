# state()

Create reactive state with fine-grained updates.

<script setup>
import ShowcaseDemo from '../../components/ShowcaseDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <ShowcaseDemo />
</ClientOnly>

## Import

```ts
import { state } from 'flexium/core'
```

## Signature

```ts
function state<T>(initialValue: T): [StateProxy<T>, Setter<T>]

type StateProxy<T> = T & (() => T)  // Value-like proxy, also callable
type Setter<T> = (value: T | ((prev: T) => T)) => void
```

## Usage

### Basic Usage

```tsx
const [count, setCount] = state(0)

// Read value - use directly like a value!
console.log(count + 1)  // 1
console.log(`Count: ${count}`)  // "Count: 0"

// Or call as function (backward compatible)
console.log(count())  // 0

// Set value directly
setCount(5)

// Set value with updater function
setCount(prev => prev + 1)
```

### In Components

```tsx
function Counter() {
  const [count, setCount] = state(0)

  return (
    <div>
      <span>{count}</span>
      <button onclick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}
```

### With Objects

```tsx
const [user, setUser] = state({ name: 'Alice', age: 25 })

// Access properties directly
console.log(user.name)  // 'Alice'

// Update entire object
setUser({ name: 'Bob', age: 30 })

// Update with spread
setUser(prev => ({ ...prev, age: prev.age + 1 }))
```

### With Arrays

```tsx
const [items, setItems] = state(['a', 'b', 'c'])

// Access array properties
console.log(items.length)  // 3
console.log(items[0])  // 'a'

// Add item
setItems(prev => [...prev, 'd'])

// Remove item
setItems(prev => prev.filter(item => item !== 'b'))

// Update item
setItems(prev => prev.map((item, i) => i === 0 ? 'A' : item))
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialValue` | `T` | The initial value for the state |

## Returns

A tuple `[proxy, setter]`:

- **proxy** `StateProxy<T>` - A reactive value that can be used directly in expressions and JSX. Also callable as `proxy()` for backward compatibility.
- **setter** `(value | updater) => void` - Function to update the value

## Notes

- State updates are synchronous
- The proxy uses `Symbol.toPrimitive` for automatic value coercion in expressions
- Reading state inside `effect()` creates a subscription
- Components only re-render the specific DOM nodes that depend on changed state
- Use `batch()` to group multiple state updates

## See Also

- [computed()](/docs/core/computed)
- [effect()](/docs/core/effect)
- [batch()](/docs/core/batch)
