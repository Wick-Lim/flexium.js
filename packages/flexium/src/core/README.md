# Flexium Core - Unified Reactivity

The core reactivity system of Flexium, powering the unified `state()` API.

## Architecture

Flexium v0.10+ introduces a **Hybrid Proxy Architecture**:

1. **High-Level API**: `state()` returns a Proxy that behaves like a simple value but tracks dependencies automatically.
2. **Proxy-Centric Architecture**: Proxy directly stores values and manages dependency graph - no wrapper classes needed.

### 1. Unified State (`state()`)

Instead of separate `signal`, `computed`, and `resource` primitives, Flexium uses a single `state()` function:

```typescript
import { state } from 'flexium/core';

// 1. Primitive State
const [count, setCount] = state(0);

// 2. Computed State
const [double] = state(() => count + count); // or count * 2

// 3. Async State
const [data] = state(async () => {
  const res = await fetch('/api');
  return res.json();
});
```

### 2. Dependency Tracking

Dependencies are tracked automatically when you access state values (via Proxy `get` traps or direct access).

```
┌───────┐      get()      ┌──────────────┐
│ State │ <────────────── │ Effect/View  │
│ Proxy │                 │ (subscriber) │
└───────┘                 └──────────────┘
    │ sets                        ▲
    │                             │
    ▼ notify()                    │
┌────────────┐                    │
│   Proxy    │ ───────────────────┘
│ (internal) │
└────────────┘
```

## Internal Architecture

The `state()` API is built on a **Proxy-centric signaling architecture**:

- **Proxy**: Directly stores values and manages dependency graph - Proxy IS the signal
- **EffectNode**: A subscriber that runs a side-effect
- **Graph**: Doubly-linked list for efficient dependency tracking

## Performance Characteristics

| Operation | Complexity | Performance |
|-----------|------------|-------------|
| State access | O(1) | Extremely fast (Proxy overhead is negligible) |
| State update | O(subscribers) | Precise updates (no VDOM diffing) |
| Computed | O(dependencies) | Lazy + Cached |
| Array Reconciliation | O(1) to O(N) | Optimized for common operations (append/remove) |

## Memory Model

- **Hybrid Approach**: Proxies are lightweight and ephemeral where possible.
- **Node Graph**: Dependency graph is strictly managed to avoid leaks.
- **Automatic Cleanup**: Effects and subscriptions are disposed automatically when their owner (component) is destroyed.

## Sync & Batching

Updates are batched by default in event handlers. You can force synchronous updates or explicit batching:

```typescript
import { sync } from 'flexium/core';

// Force sync flush
sync(() => {
  setCount(c => c + 1);
  setFlag(true);
}); // DOM updates once here
```



## License

MIT
