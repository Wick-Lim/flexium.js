# Signals (Advanced)

::: info Recommended API
For most application development, we recommend using the unified **[useState()](/guide/state)** API.
The low-level `signal` and `computed` primitives have been unified into `useState()`.
:::

## The `signal` Primitive

A `SignalNode` is the atomic unit of reactivity. It holds a value and notifies subscribers when it changes.

```tsx
import { useState } from 'flexium/core'

// Create
const count = useState(0)

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
import { useState } from 'flexium/core'

const count = useState(1)
const double = useState(() => count.valueOf() * 2)

console.log(double.valueOf()) // 2

count.set(5)
console.log(double.valueOf()) // 10
```

- **Lazy**: Computeds are only re-evaluated when read.
- **Cached**: If dependencies haven't changed, the cached value is returned.
- **Pure**: Computed functions should be pure and side-effect free.

## Comparison with `useState()`

| Feature | `useState()` |
|---------|-----------|
| **Import** | `flexium/core` |
| **Interface** | Proxy |
| **Ergonomics** | Concise |
| **JSX** | Supported (`{count}`) |

## Manual Subscriptions

If you need to manually listen to a signal outside of an effect (e.g. bridging to another library):

```tsx
import { useEffect, useState } from 'flexium/core'

const count = useState(0)

const dispose = useEffect(() => {
  console.log('Stream updated:', count.valueOf())
})

// later
dispose()
```
