# Signals

Signals are the foundation of Flexium's reactivity system. They provide fine-grained reactive updates, ensuring your UI stays in sync with your data efficiently.

## What is a Signal?

A signal is a reactive container that holds a value. When the value changes, any part of the UI that depends on it automatically updates—no manual DOM manipulation required.

```tsx
import { signal } from 'flexium/core'

const count = signal(0)

// Read the value
console.log(count.value) // 0
console.log(+count) // 0 - using unary + operator

// Update the value
count.set(5)
console.log(count.value) // 5
```

## Creating Signals

### With `signal()`

The `signal()` function creates a standalone reactive value:

```tsx
import { signal } from 'flexium/core'

// Primitive values
const name = signal('Alice')
const age = signal(25)
const isActive = signal(true)

// Objects and arrays
const user = signal({ name: 'Bob', email: 'bob@example.com' })
const items = signal([1, 2, 3])
```

### With `state()`

The `state()` function provides a React-like tuple interface:

```tsx
import { state } from 'flexium/core'

const [count, setCount] = state(0)

// Read (value-like proxy)
console.log(count) // 0 (works directly in most contexts)
console.log(count()) // 0 (also works)

// Update with value
setCount(5)

// Update with function
setCount(prev => prev + 1)
```

## Reading Signal Values

State proxies returned by `state()` can be read in multiple ways:

```tsx
const [count, setCount] = state(10)

// 1. Direct value access (proxy behavior)
console.log(count) // 10
const doubled = count * 2 // 20

// 2. Using .peek() (doesn't track as dependency)
console.log(count.peek()) // 10
```

### In JSX

Signals auto-unwrap in JSX:

```tsx
function Counter() {
  const [count, setCount] = state(0)

  return (
    <div>
      <p>Count: {count}</p>  {/* Auto-unwrapped */}
      <button onclick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}
```

## Updating Signals

### Direct Value

```tsx
const name = signal('Alice')
name.set('Bob')
```

### Function Update

```tsx
const count = signal(0)
count.set(prev => prev + 1)
```

### Object Mutation

For objects, you can spread and update:

```tsx
const user = signal({ name: 'Alice', age: 25 })
user.set(prev => ({ ...prev, age: 26 }))
```

## Computed Values

Computed signals derive their value from other signals:

```tsx
import { state } from 'flexium/core'

const [price, setPrice] = state(100)
const [quantity, setQuantity] = state(2)

const [total] = state(() => price * quantity)

console.log(total) // 200

setPrice(150)
console.log(total) // 300 (auto-updated!)
```

## Effects

Effects run side effects when signals change:

```tsx
import { state, effect } from 'flexium/core'

const [count, setCount] = state(0)

effect(() => {
  console.log('Count changed:', count)
})

setCount(1) // logs: "Count changed: 1"
setCount(2) // logs: "Count changed: 2"
```

### Cleanup in Effects

Return a cleanup function for proper resource management:

```tsx
effect(() => {
  const interval = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => clearInterval(interval) // Cleanup
})
```

## Best Practices

### 1. Keep Signals Granular

```tsx
// Good - fine-grained updates
const firstName = signal('John')
const lastName = signal('Doe')

// Avoid - coarse updates
const user = signal({ firstName: 'John', lastName: 'Doe' })
```

### 2. Use Computed State for Derived Values

```tsx
// Good
const [fullName] = state(() => `${firstName} ${lastName}`)

// Avoid - manual calculation everywhere
function getFullName() {
  return `${firstName} ${lastName}`
}
```

### 3. Avoid Reading in Loops Without Need

```tsx
// Good - read once
const [list, setList] = state([])
const items = list
items.forEach(item => console.log(item))

// Avoid - reading repeatedly (though with proxy it auto-converts)
for (let i = 0; i < list.length; i++) {
  console.log(list[i])
}
```

### 4. Use peek() When You Don't Want Tracking

```tsx
const [trigger, setTrigger] = state(false)
const [config, setConfig] = state({})

effect(() => {
  // Only track 'trigger', not 'config'
  if (trigger) {
    console.log(config.peek())
  }
})
```

## See Also

- [state()](/docs/core/state) - State management API
- [computed()](/docs/core/computed) - Derived values
- [effect()](/docs/core/effect) - Side effects
- [batch()](/docs/core/batch) - Batch updates
