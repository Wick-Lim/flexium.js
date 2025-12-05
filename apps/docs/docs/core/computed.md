# computed()

Create derived reactive values that automatically update when dependencies change.

## Import

```ts
import { computed } from 'flexium/core'
```

## Signature

```ts
function computed<T>(fn: () => T): Accessor<T>

type Accessor<T> = () => T
```

## Usage

### Basic Usage

```tsx
const [count, setCount] = state(0)
const doubled = computed(() => count() * 2)

console.log(doubled()) // 0
setCount(5)
console.log(doubled()) // 10
```

### Multiple Dependencies

```tsx
const [firstName, setFirstName] = state('John')
const [lastName, setLastName] = state('Doe')

const fullName = computed(() => `${firstName()} ${lastName()}`)

console.log(fullName()) // "John Doe"
```

### Chained Computed

```tsx
const [price, setPrice] = state(100)
const [quantity, setQuantity] = state(2)

const subtotal = computed(() => price() * quantity())
const tax = computed(() => subtotal() * 0.1)
const total = computed(() => subtotal() + tax())

console.log(total()) // 220
```

### In Components

```tsx
function PriceDisplay() {
  const [price, setPrice] = state(100)
  const [discount, setDiscount] = state(0.1)

  const discountedPrice = computed(() => price() * (1 - discount()))
  const savings = computed(() => price() - discountedPrice())

  return (
    <div>
      <p>Original: ${price}</p>
      <p>Discounted: ${discountedPrice}</p>
      <p>You save: ${savings}</p>
    </div>
  )
}
```

### Filtering and Transforming

```tsx
const [items, setItems] = state([
  { id: 1, name: 'Apple', done: false },
  { id: 2, name: 'Banana', done: true },
  { id: 3, name: 'Cherry', done: false }
])

const pendingItems = computed(() =>
  items().filter(item => !item.done)
)

const completedCount = computed(() =>
  items().filter(item => item.done).length
)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => T` | Function that computes the derived value |

## Returns

- **accessor** `() => T` - Function to read the computed value

## Behavior

- Computed values are **lazily evaluated** - they only compute when read
- Values are **cached** until dependencies change
- Dependencies are **automatically tracked** when the function runs
- Computeds are **read-only** - you cannot set them directly

## Notes

- Avoid side effects inside computed functions
- Computed values update synchronously when dependencies change
- Nested computeds work as expected

## See Also

- [state()](/docs/core/state)
- [effect()](/docs/core/effect)
