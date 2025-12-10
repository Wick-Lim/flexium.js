# Flexium Core - Signal System

Fine-grained reactive signals without Virtual DOM.

## Architecture

The signal system implements a **push-pull** reactive model:

### Core Primitives

1. **SignalNode** - Writable reactive primitive
   - Stores a value and notifies subscribers on change
   - Implements the Observer pattern
   - Only notifies if value actually changed (reference equality)

2. **ComputedNode** - Derived reactive value
   - Lazy evaluation with memoization
   - Acts as both subscriber (to dependencies) and observable (to effects)
   - Marked "dirty" when dependencies change, recomputes on next read

3. **EffectNode** - Side effect runner
   - Auto-tracks dependencies during execution
   - Supports cleanup functions
   - Can be disposed to stop tracking

### Dependency Tracking

```
┌─────────────┐
│  Signal A   │
└──────┬──────┘
       │ notifies
       ▼
┌─────────────┐        ┌─────────────┐
│ Computed B  │───────>│  Effect C   │
└─────────────┘ tracks └─────────────┘
```

- **Automatic**: Uses global `activeEffect` context during execution
- **Dynamic**: Dependencies update each time effect/computed runs
- **Precise**: Only affected nodes update, no component re-renders

### Synchronization

```typescript
// 1. Force flush
sync(); 

// 2. Batch updates
sync(() => {
  signal1.value = x;
  signal2.value = y;
  signal3.value = z;
}); // Effects run once at the end
```

- `sync()`: Force flushes pending effects synchronously
- `sync(fn)`: Batches updates inside `fn` and flushes synchronously
- Prevents cascading updates and ensures consistency

## Performance Characteristics

| Operation | Complexity | Performance |
|-----------|------------|-------------|
| Signal create | O(1) | < 1ms |
| Signal update | O(subscribers) | < 0.1ms |
| Computed read (cached) | O(1) | ~0ms |
| Computed read (dirty) | O(dependencies) | < 1ms |
| Effect create | O(1) + run | Variable |
| Sync N updates | O(unique effects) | < 1ms |

## Memory Model

- **Signal**: ~100 bytes (value + subscriber set)
- **Computed**: ~150 bytes (value + deps + subs)
- **Effect**: ~120 bytes (fn + deps + cleanup)
- **No memory leaks**: Automatic cleanup on dispose

## API Reference

### signal\<T\>(initialValue: T): Signal\<T\>

Creates a writable reactive signal.

```typescript
const count = signal(0);
count.value++;        // Update via property
count.set(5);         // Update via method
console.log(count()); // Read via function call
const val = count.peek(); // Read without tracking
```

### computed\<T\>(fn: () => T): Computed\<T\>

Creates a read-only derived signal.

```typescript
const doubled = computed(() => count.value * 2);
console.log(doubled.value); // Lazy evaluation
```

### effect(fn: () => void | (() => void)): () => void

Runs a side effect when dependencies change.

```typescript
const dispose = effect(() => {
  console.log('Count:', count.value);
  return () => console.log('Cleanup');
});

// Later...
dispose(); // Stop tracking and run cleanup
```

### sync\<T\>(fn?: () => T): T | void

Synchronizes state updates.

```typescript
// 1. Force flush
count.value++;
sync(); // DOM updated immediately

// 2. Batch updates
sync(() => {
  signal1.value = x;
  signal2.value = y;
}); // Effects run once
```

### untrack\<T\>(fn: () => T): T

Reads signals without creating dependencies.

```typescript
effect(() => {
  const tracked = signal1.value;
  const untracked = untrack(() => signal2.value);
  // Only signal1 triggers this effect
});
```

## Implementation Details

### No Proxies

- Direct property access via `Object.defineProperty`
- No proxy overhead
- Better performance and debugging

### No VDOM

- Signals directly update DOM nodes
- No reconciliation needed
- Fine-grained updates only

### TypeScript First

- Full type inference
- Generic constraints
- No `any` types

## Comparison

| Feature | Flexium | SolidJS | Vue 3 | React |
|---------|---------|---------|-------|-------|
| Reactivity | Signals | Signals | Proxy | Hooks |
| Updates | Fine-grained | Fine-grained | Fine-grained | Reconciliation |
| VDOM | No | No | No | Yes |
| Bundle Size | ~2KB | ~7KB | ~30KB | ~40KB |
| Performance | ★★★★★ | ★★★★★ | ★★★★ | ★★★ |

## Examples

### Counter

```typescript
import { signal, effect } from '@flexium/core';

const count = signal(0);

effect(() => {
  document.getElementById('count')!.textContent = String(count.value);
});

setInterval(() => count.value++, 1000);
```

### Form Validation

```typescript
const email = signal('');
const isValid = computed(() => email.value.includes('@'));

effect(() => {
  const btn = document.getElementById('submit') as HTMLButtonElement;
  btn.disabled = !isValid.value;
});
```

### Todo List

```typescript
const todos = signal<string[]>([]);
const completed = signal<Set<number>>(new Set());

const remaining = computed(() =>
  todos.value.length - completed.value.size
);

effect(() => {
  document.getElementById('count')!.textContent =
    `${remaining.value} remaining`;
});
```

## Testing

```typescript
import { signal, effect } from '@flexium/core';
import { describe, it, expect } from 'vitest';

describe('signals', () => {
  it('should update', () => {
    const count = signal(0);
    let value = 0;

    effect(() => { value = count.value; });
    expect(value).toBe(0);

    count.value = 5;
    expect(value).toBe(5);
  });
});
```

## License

MIT
