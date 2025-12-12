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
const count = state(0)

// Read (tracks dependency)
console.log(count.valueOf())

// Write (triggers notifications)
count.set(5)
// OR
count.set(c => c + 1)
```

### Methods

- `count.valueOf()`: Getter. Accessing it tracks the signal in the current effect.
- `count.peek()`: Reads the value **without** tracking.
- `count.set(val)`: Sets the value.

## The `computed` Primitive

Derived values that automatically update when their dependencies change.

```tsx
import { state } from 'flexium/core'

const count = state(1)
const double = state(() => count.valueOf() * 2)

console.log(double.valueOf()) // 2

count.set(5)
console.log(double.valueOf()) // 10
```

- **Lazy**: Computeds are only re-evaluated when read.
- **Cached**: If dependencies haven't changed, the cached value is returned.
- **Pure**: Computed functions should be pure and side-effect free.

## Comparison with `state()`

| Feature | `state()` |
|---------|-----------|
| **Import** | `flexium/core` |
| **Interface** | Proxy |
| **Ergonomics** | Concise |
| **JSX** | Supported (`{count}`) |

## Manual Subscriptions

If you need to manually listen to a signal outside of an effect (e.g. bridging to another library):

```tsx
import { effect, state } from 'flexium/core'

const count = state(0)

const dispose = effect(() => {
  console.log('Stream updated:', count.valueOf())
})

// later
dispose()
```
