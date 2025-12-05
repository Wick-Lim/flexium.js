# state()

Create reactive state with fine-grained updates.

## Import

```ts
import { state } from 'flexium/core'
```

## Signature

```ts
function state<T>(initialValue: T): [Accessor<T>, Setter<T>]

type Accessor<T> = () => T
type Setter<T> = (value: T | ((prev: T) => T)) => void
```

## Usage

### Basic Usage

```tsx
const [count, setCount] = state(0)

// Read value
console.log(count()) // 0

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

// Update entire object
setUser({ name: 'Bob', age: 30 })

// Update with spread
setUser(prev => ({ ...prev, age: prev.age + 1 }))
```

### With Arrays

```tsx
const [items, setItems] = state(['a', 'b', 'c'])

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

A tuple `[accessor, setter]`:

- **accessor** `() => T` - Function to read the current value
- **setter** `(value | updater) => void` - Function to update the value

## Notes

- State updates are synchronous
- Reading state inside `effect()` creates a subscription
- Components only re-render the specific DOM nodes that depend on changed state
- Use `batch()` to group multiple state updates

## See Also

- [computed()](/docs/core/computed)
- [effect()](/docs/core/effect)
- [batch()](/docs/core/batch)
