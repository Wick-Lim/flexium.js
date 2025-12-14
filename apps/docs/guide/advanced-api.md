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

Flexium provides low-level reactive primitives through the `flexium/core` subpath for users who need fine-grained control over reactivity.

::: tip When to Use
Most applications should use the `state()` API from `flexium/core`. The advanced API is for:
- Library authors building on top of Flexium
- Performance-critical code requiring manual optimization
- Advanced patterns not covered by `state()`
:::

## Import

```tsx
import { root, untrack, sync } from 'flexium/core'
```

## API Overview

| Export | Source | Description |
|--------|--------|-------------|
| `root(fn)` | `flexium/core` | Create an isolated reactive scope |
| `untrack(fn)` | `flexium/core` | Read values without creating dependencies |
| `sync(fn)` | `flexium/core` | Batch updates synchronously |


## root()

Creates an isolated reactive scope. Useful for managing cleanup of effects.

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { root } from 'flexium/core'

const count = state(0)

const dispose = root((dispose) => {
  effect(() => {
    console.log('Count:', count.valueOf())
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
```tsx
import { effect, state } from 'flexium/core'
import { untrack } from 'flexium/core'

const count = state(0)
const multiplier = state(2)

// Only re-runs when 'count' changes, not 'multiplier'
effect(() => {
  const result = count.valueOf() * untrack(() => multiplier.valueOf())
  console.log('Result:', result)
})

count.set(5)      // Logs: "Result: 10"
multiplier.set(10)  // No log - multiplier is untracked
```

## Example: Custom Store

Here's an example of building a custom store using advanced primitives:

```tsx
```tsx
import { effect, state } from 'flexium/core'

function createStore<T extends object>(initialState: T) {
  const storeState = state(initialState)

  return {
    get: () => storeState.valueOf(),
    set: (updater: T | ((s: T) => T)) => {
      storeState.set(updater)
    },

    // Subscribe to changes
    subscribe(callback: (s: T) => void) {
      return effect(() => callback(storeState.valueOf()))
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
- Building custom reactive libraries (using `state` primitives)

### Use advanced APIs from `flexium/core`
- `root()`: Managing disposal scopes manually
- `untrack()`: Reading signals without tracking dependencies
- `sync()`: Batching updates manually
