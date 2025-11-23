# Signals API

## signal()

Create a reactive signal.

```ts
function signal<T>(initialValue: T): Signal<T>
```

### Parameters

- `initialValue`: The initial value of the signal

### Returns

A `Signal<T>` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `value` | `T` | Get or set the current value |
| `peek()` | `() => T` | Read without tracking |
| `set(fn)` | `(fn: (prev: T) => T) => void` | Update based on previous value |

### Example

```tsx
import { signal } from 'flexium'

const count = signal(0)

// Read
console.log(count.value) // 0

// Write
count.value = 5
console.log(count.value) // 5

// Update
count.value++
console.log(count.value) // 6

// Peek
const peeked = count.peek() // Doesn't track as dependency

// Set with function
count.set(prev => prev + 1)
console.log(count.value) // 7
```

## Type Signature

```ts
interface Signal<T> {
  value: T
  peek(): T
  set(fn: (prev: T) => T): void
}
```

## Usage in JSX

Signals can be used directly in JSX:

```tsx
const name = signal('Alice')

<div>
  <p>Hello, {name}!</p>
  <input value={name} oninput={(e) => name.value = e.target.value} />
</div>
```

Only the text node updates when `name` changes, not the entire component.

## Object Signals

For objects, replace the entire value to trigger updates:

```tsx
const user = signal({ name: 'Alice', age: 25 })

// ❌ Won't trigger updates
user.value.age = 26

// ✅ Triggers updates
user.value = { ...user.value, age: 26 }
```

## Advanced: Custom Equality

Signals use referential equality by default. For custom equality:

```tsx
import { signal } from 'flexium'

const point = signal({ x: 0, y: 0 })

// Custom comparison
function updatePoint(newX: number, newY: number) {
  const prev = point.peek()
  if (prev.x !== newX || prev.y !== newY) {
    point.value = { x: newX, y: newY }
  }
}
```

## See Also

- [computed()](/api/computed)
- [effect()](/api/effects)
- [batch()](/api/batch-untrack)
