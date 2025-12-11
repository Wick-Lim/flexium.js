# Signals (Advanced)

::: info Recommended API
For most application development, we recommend using the unified **[state()](/guide/state)** API. 
`signal` and `computed` are low-level primitives available in `flexium/advanced` that power `state()`. They are useful for library authors or building custom reactivity abstractions.
:::

## The `signal` Primitive

A `SignalNode` is the atomic unit of reactivity. It holds a value and notifies subscribers when it changes.

```tsx
import { signal } from 'flexium/advanced'

// Create
const count = signal(0)

// Read (tracks dependency)
console.log(count.value)

// Write (triggers notifications)
count.set(5)
// OR
count.value = 5
```

### Methods

- `.value`: Getter/Setter for the value. Accessing it tracks the signal in the current effect.
- `.peek()`: Reads the value **without** tracking.
- `.set(val)`: Sets the value.
- `.subscribe(fn)`: Manually subscribe to changes (rarely needed, use `effect`).

## The `computed` Primitive

Derived values that automatically update when their dependencies change.

```tsx
import { computed } from 'flexium/advanced'

const count = signal(1)
const double = computed(() => count.value * 2)

console.log(double.value) // 2

count.set(5)
console.log(double.value) // 10
```

- **Lazy**: Computeds are only re-evaluated when read.
- **Cached**: If dependencies haven't changed, the cached value is returned.
- **Pure**: Computed functions should be pure and side-effect free.

## Comparison with `state()`

| Feature | `signal()` (Low-level) | `state()` (High-level) |
|---------|------------------------|------------------------|
| **Import** | `flexium/advanced` | `flexium/core` |
| **Interface** | Object (`.value`) | Proxy / Tuple |
| **Ergonomics** | Verbose | Concise |
| **JSX** | Supported (`{count}`) | Supported (`{count}`) |
| **Use Case** | Libraries, Primitives | Apps, Components |

## Manual Subscriptions

If you need to manually listen to a signal outside of an effect (e.g. bridging to another library):

```tsx
const count = signal(0)

const unsubscribe = count.subscribe((newValue) => {
  console.log('Stream updated:', newValue)
})

// later
unsubscribe()
```
