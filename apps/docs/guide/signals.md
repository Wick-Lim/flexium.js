# Signals (Advanced)

::: info Recommended API
For most application development, we recommend using the unified **[use()](/guide/state)** API.
The low-level `signal` and `computed` primitives have been unified into `use()`.
:::

## The `signal` Primitive

A `SignalNode` is the atomic unit of reactivity. It holds a value and notifies subscribers when it changes.

```tsx
import { useState } from 'flexium/core'

// Create
const [count, setCount] = use(0)

// Read (tracks dependency)
console.log(count)

// Write (triggers notifications)
setCount(5)
// OR
setCount(c => c + 1)
```

### Methods

- Reading `count`: Accessing it tracks the signal in the current effect.
- `setCount(val)`: Sets the value.

## The `computed` Primitive

Derived values that automatically update when their dependencies change.

```tsx
import { useState } from 'flexium/core'

const [count, setCount] = use(1)
const [double] = use(() => count * 2)

console.log(double) // 2

setCount(5)
console.log(double) // 10
```

- **Lazy**: Computeds are only re-evaluated when read.
- **Cached**: If dependencies haven't changed, the cached value is returned.
- **Pure**: Computed functions should be pure and side-effect free.

## Comparison with `use()`

| Feature | `use()` |
|---------|-----------|
| **Import** | `flexium/core` |
| **Interface** | Array destructuring |
| **Ergonomics** | Concise |
| **JSX** | Supported (`{count}`) |

## Manual Subscriptions

If you need to manually listen to a signal outside of an effect (e.g. bridging to another library):

```tsx
import { useEffect, useState } from 'flexium/core'

const [count] = use(0)

const dispose = use(() => {
  console.log('Stream updated:', count)
})

// later
dispose()
```
