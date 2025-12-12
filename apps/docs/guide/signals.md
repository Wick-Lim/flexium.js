# Signals (Advanced)

::: info Recommended API
For most application development, we recommend using the unified **[state()](/guide/state)** API. 
The low-level `signal` and `computed` primitives have been unified into `state()`.
:::

## The `signal` Primitive

A `SignalNode` is the atomic unit of reactivity. It holds a value and notifies subscribers when it changes.

```tsx
import { state } from 'flexium/core'

// Create
const [count, setCount] = state(0)

// Read (tracks dependency)
console.log(count())

// Write (triggers notifications)
setCount(5)
// OR
setCount(c => c + 1)
```

### Methods

- `count()`: Getter. Accessing it tracks the signal in the current effect.
- `count.peek()`: Reads the value **without** tracking.
- `setCount(val)`: Sets the value.

## The `computed` Primitive

Derived values that automatically update when their dependencies change.

```tsx
import { state } from 'flexium/core'

const [count, setCount] = state(1)
const [double] = state(() => count() * 2)

console.log(double()) // 2

setCount(5)
console.log(double()) // 10
```

- **Lazy**: Computeds are only re-evaluated when read.
- **Cached**: If dependencies haven't changed, the cached value is returned.
- **Pure**: Computed functions should be pure and side-effect free.

## Comparison with `state()`

| Feature | `state()` |
|---------|-----------|
| **Import** | `flexium/core` |
| **Interface** | Proxy / Tuple |
| **Ergonomics** | Concise |
| **JSX** | Supported (`{count}`) |
| **Use Case** | Apps, Components, Libraries |

## Manual Subscriptions

If you need to manually listen to a signal outside of an effect (e.g. bridging to another library):

```tsx
import { effect, state } from 'flexium/core'

const [count, setCount] = state(0)

const dispose = effect(() => {
  console.log('Stream updated:', count())
})

// later
dispose()
```
