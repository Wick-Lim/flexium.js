---
title: Advanced API - Low-Level Primitives
description: Learn about Flexium's advanced low-level APIs including signal, root, and untrack for fine-grained control over reactivity.
head:
  - - meta
    - property: og:title
      content: Advanced API - Flexium Low-Level Primitives
  - - meta
    - property: og:description
      content: Access low-level reactive primitives for maximum control and performance optimization.
---

# Advanced API

Flexium provides low-level reactive primitives through the `flexium/advanced` subpath for users who need fine-grained control over reactivity.

::: tip When to Use
Most applications should use the `state()` API from `flexium/core`. The advanced API is for:
- Library authors building on top of Flexium
- Performance-critical code requiring manual optimization
- Advanced patterns not covered by `state()`
:::

## Import

```tsx
import { signal, root, untrack, onCleanup } from 'flexium/advanced'
```

## API Overview

| Export | Description |
|--------|-------------|
| `signal(value)` | Create a raw reactive signal |
| `root(fn)` | Create an isolated reactive scope |
| `untrack(fn)` | Read values without creating dependencies |
| `onCleanup(fn)` | Register cleanup function |

## signal()

Creates a raw reactive signal. Unlike `state()`, this returns a signal object with `.value` getter/setter and `.peek()` method.

```tsx
import { signal } from 'flexium/advanced'

const count = signal(0)

// Read value (creates dependency)
console.log(count.value)  // 0

// Read without tracking
console.log(count.peek())  // 0

// Set value
count.value = 1

// Set with updater function
count.set(prev => prev + 1)
```

### signal vs state

| Feature | `state()` | `signal()` |
|---------|-----------|------------|
| Return type | `[StateValue, setter]` | Signal object |
| Global state | Built-in with `key` option | Manual implementation |
| Async support | Built-in | Manual implementation |
| Derived values | Built-in via function argument | Manual implementation |
| DX | Optimized for ease of use | Low-level control |

## root()

Creates an isolated reactive scope. Useful for managing cleanup of effects.

```tsx
import { signal, effect, root } from 'flexium/advanced'

const count = signal(0)

const dispose = root((dispose) => {
  effect(() => {
    console.log('Count:', count.value)
  })

  return dispose
})

count.value = 1  // Logs: "Count: 1"

dispose()  // Cleanup - effect stops running

count.value = 2  // No log - effect was disposed
```

## untrack()

Reads reactive values without creating dependencies. Useful when you need to access a value but don't want updates to that value to trigger re-computation.

```tsx
import { signal, effect, untrack } from 'flexium/advanced'

const count = signal(0)
const multiplier = signal(2)

// Only re-runs when 'count' changes, not 'multiplier'
effect(() => {
  const result = count.value * untrack(() => multiplier.value)
  console.log('Result:', result)
})

count.value = 5      // Logs: "Result: 10"
multiplier.value = 10  // No log - multiplier is untracked
```

## Example: Custom Store

Here's an example of building a custom store using advanced primitives:

```tsx
import { signal, effect } from 'flexium/advanced'

function createStore<T extends object>(initialState: T) {
  const state = signal(initialState)

  return {
    get: () => state.value,
    set: (updater: T | ((s: T) => T)) => {
      state.value = typeof updater === 'function'
        ? (updater as Function)(state.value)
        : updater
    },

    // Subscribe to changes
    subscribe(callback: (s: T) => void) {
      return effect(() => callback(state.value))
    }
  }
}

// Usage
const store = createStore({ count: 0, name: 'Test' })

console.log(store.get().count)  // 0

store.set(s => ({ ...s, count: s.count + 1 }))
console.log(store.get().count)  // 1
```

## When to Use Advanced API

### Use `state()` (recommended)
- Building application components
- Normal state management needs
- When you want the simplest API

### Use `signal()` / advanced
- Building custom reactive libraries
- Need direct signal object access
- Performance-critical manual optimizations
- Porting code from other signal-based libraries
