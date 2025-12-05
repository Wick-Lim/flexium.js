---
title: Advanced API - Low-Level Primitives
description: Learn about Flexium's advanced low-level APIs including signal, computed, root, and untrack for fine-grained control over reactivity.
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
Most applications should use the `state()` API from the main `flexium` export. The advanced API is for:
- Library authors building on top of Flexium
- Performance-critical code requiring manual optimization
- Advanced patterns not covered by `state()`
:::

## Import

```tsx
import { signal, computed, root, untrack } from 'flexium/advanced'
```

## API Overview

| Export | Description |
|--------|-------------|
| `signal(value)` | Create a raw reactive signal |
| `computed(fn)` | Create a derived computed value |
| `root(fn)` | Create an isolated reactive scope |
| `untrack(fn)` | Read values without creating dependencies |

## signal()

Creates a raw reactive signal. Unlike `state()`, this returns a signal object with `.get()`, `.set()`, and `.peek()` methods.

```tsx
import { signal } from 'flexium/advanced'

const count = signal(0)

// Read value (creates dependency)
console.log(count())  // 0

// Read without tracking
console.log(count.peek())  // 0

// Set value
count.set(1)

// Set with updater function
count.set(prev => prev + 1)
```

### signal vs state

| Feature | `state()` | `signal()` |
|---------|-----------|------------|
| Return type | `[getter, setter]` tuple | Signal object |
| Global state | Built-in with `key` option | Manual implementation |
| Async support | Built-in | Manual implementation |
| Computed | Built-in via function argument | Use `computed()` |
| DX | Optimized for ease of use | Low-level control |

## computed()

Creates a derived value that automatically updates when dependencies change.

```tsx
import { signal, computed } from 'flexium/advanced'

const count = signal(0)
const doubled = computed(() => count() * 2)

console.log(doubled())  // 0

count.set(5)
console.log(doubled())  // 10
```

### Computed Signals are Read-Only

```tsx
const doubled = computed(() => count() * 2)

doubled.set(10)  // Error! Computed signals are read-only
```

### Nested Computed Values

```tsx
const a = signal(1)
const b = signal(2)

const sum = computed(() => a() + b())
const doubled = computed(() => sum() * 2)

console.log(doubled())  // 6

a.set(5)
console.log(doubled())  // 14
```

## root()

Creates an isolated reactive scope. Useful for managing cleanup of effects and computed values.

```tsx
import { signal, effect, root } from 'flexium/advanced'

const count = signal(0)

const dispose = root((dispose) => {
  effect(() => {
    console.log('Count:', count())
  })

  return dispose
})

count.set(1)  // Logs: "Count: 1"

dispose()  // Cleanup - effect stops running

count.set(2)  // No log - effect was disposed
```

## untrack()

Reads reactive values without creating dependencies. Useful when you need to access a value but don't want updates to that value to trigger re-computation.

```tsx
import { signal, computed, untrack } from 'flexium/advanced'

const count = signal(0)
const multiplier = signal(2)

// Only re-computes when 'count' changes, not 'multiplier'
const result = computed(() => {
  return count() * untrack(() => multiplier())
})

console.log(result())  // 0

count.set(5)
console.log(result())  // 10

multiplier.set(10)
console.log(result())  // Still 10 (not 50) - multiplier change didn't trigger recompute
```

## Example: Custom Store

Here's an example of building a custom store using advanced primitives:

```tsx
import { signal, computed, effect } from 'flexium/advanced'

function createStore<T extends object>(initialState: T) {
  const state = signal(initialState)

  return {
    get: state,
    set: state.set,

    // Selector with automatic memoization
    select<R>(selector: (s: T) => R) {
      return computed(() => selector(state()))
    },

    // Subscribe to changes
    subscribe(callback: (s: T) => void) {
      return effect(() => callback(state()))
    }
  }
}

// Usage
const store = createStore({ count: 0, name: 'Test' })

const count = store.select(s => s.count)
console.log(count())  // 0

store.set(s => ({ ...s, count: s.count + 1 }))
console.log(count())  // 1
```

## Migration from v0.2.x

In v0.3.0, the low-level primitives were moved to `flexium/advanced`:

```tsx
// Before (v0.2.x)
import { signal, computed } from 'flexium'

// After (v0.3.0+)
import { signal, computed } from 'flexium/advanced'

// Current (v0.4.0+)
import { state } from 'flexium/core'
```

This change separates the "easy-to-use" API from the "power-user" API, making it clearer which primitives are intended for typical usage.
