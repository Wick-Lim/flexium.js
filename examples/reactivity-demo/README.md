# Flexium Reactivity System Deep Dive

A comprehensive demonstration of Flexium's fine-grained reactivity system, showcasing all core APIs and patterns for building reactive applications.

## Overview

This example explores Flexium's reactivity system in depth, demonstrating how signals, computed values, effects, and batching work together to create efficient, reactive applications without a Virtual DOM.

## Features Demonstrated

### 1. **Signal Basics** - Reactive Primitives
- Creating and updating signals
- Reading signal values with `.value` and function call syntax
- Using `peek()` to read without tracking dependencies
- Automatic subscriber notifications

### 2. **Computed Values** - Derived State
- Automatic dependency tracking
- Memoization and lazy evaluation
- Chaining computed values
- Performance benefits of caching

### 3. **Effects** - Side Effects
- Automatic dependency tracking in effects
- Effect cleanup functions
- Conditional effects
- Effect lifecycle management

### 4. **Batching** - Performance Optimization
- Grouping multiple updates
- Preventing cascading effect runs
- Performance comparison: batched vs unbatched
- Real-world benchmarks

### 5. **Untrack** - Breaking Dependencies
- Reading signals without creating dependencies
- Use cases for untracked reads
- Comparison with tracked effects

### 6. **Root & Cleanup** - Scope Management
- Creating cleanup scopes
- Disposing multiple effects at once
- Effect lifecycle patterns
- Resource management

### 7. **State API** - Unified Interface
- React-like tuple syntax
- Local state management
- Global state with keys
- Computed state with state()

### 8. **Performance Analysis**
- Real-time performance benchmarks
- Visual performance comparison
- Measuring reactivity overhead
- Optimization techniques

### 9. **Dependency Visualization**
- Visual dependency graphs
- Understanding reactive propagation
- Debugging dependency chains

### 10. **Advanced Patterns**
- Conditional effects
- Debounced updates
- Derived state chains
- Best practices and anti-patterns

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server (opens at http://localhost:3010)
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Concepts

### Signals

Signals are the foundation of reactivity in Flexium. They're observable values that notify subscribers when changed.

```typescript
import { signal } from 'flexium/core'

const count = signal(0)

// Read
console.log(count.value)  // or count()

// Write
count.value = 5          // or count.set(5)

// Read without tracking
count.peek()
```

### Computed Values

Computed values automatically track their dependencies and memoize results.

```typescript
import { computed } from 'flexium/core'

const firstName = signal('John')
const lastName = signal('Doe')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

console.log(fullName.value) // "John Doe"
firstName.value = 'Jane'
console.log(fullName.value) // "Jane Doe" - automatically updated
```

### Effects

Effects are side effects that automatically re-run when their dependencies change.

```typescript
import { effect } from 'flexium/core'

const count = signal(0)

effect(() => {
  console.log('Count:', count.value)
  // Runs immediately and whenever count changes

  return () => {
    console.log('Cleanup!')
    // Runs before next execution or disposal
  }
})
```

### Batching

Batching groups multiple signal updates to run effects only once.

```typescript
import { batch } from 'flexium/core'

const x = signal(0)
const y = signal(0)

effect(() => {
  console.log(x.value + y.value) // Logs once per batch
})

batch(() => {
  x.value = 1
  y.value = 2
  // Effect runs once here, not twice
})
```

### Untrack

Untrack allows reading signals without creating dependencies.

```typescript
import { untrack } from 'flexium/core'

const count = signal(0)
const multiplier = signal(2)

effect(() => {
  // Only depends on count, not multiplier
  console.log(count.value * untrack(() => multiplier.value))
})
```

### Root & Cleanup

Root creates a scope for disposing multiple effects at once.

```typescript
import { root } from 'flexium/core'

const dispose = root((dispose) => {
  effect(() => { /* ... */ })
  effect(() => { /* ... */ })
  effect(() => { /* ... */ })

  return dispose
})

// Later, dispose all effects at once
dispose()
```

### State API

Unified API with React-like syntax for local and global state.

```typescript
import { state } from 'flexium'

// Local state
const [count, setCount] = state(0)
setCount(count() + 1)

// Computed state
const [doubled] = state(() => count() * 2)

// Global state with array key
const [theme, setTheme] = state('light', { key: ['app', 'theme'] })

// Dynamic keys for caching
const [user] = state(async () => fetchUser(id), { key: ['users', id] })

// Explicit params for better DX
const [data] = state(
  async ({ userId, postId }) => fetchPost(userId, postId),
  { key: ['posts', userId, postId], params: { userId, postId } }
)
```

## Performance Tips

1. **Use `computed()` for derived values** - Don't use effects to update other signals
2. **Batch related updates** - Use `batch()` when updating multiple related signals
3. **Clean up effects** - Always return cleanup functions for resources
4. **Use `untrack()` judiciously** - Only when you truly don't need dependencies
5. **Avoid signal chains** - Use computed values instead of effects that set signals
6. **Group with `root()`** - Manage related effects together for easier cleanup

## Anti-Patterns

### ❌ Using effects to derive state

```typescript
// BAD
const a = signal(1)
const b = signal(0)
effect(() => { b.value = a.value * 2 })

// GOOD
const a = signal(1)
const b = computed(() => a.value * 2)
```

### ❌ Creating infinite loops

```typescript
// BAD - infinite loop!
effect(() => {
  count.value = count.value + 1
})
```

### ❌ Not batching related updates

```typescript
// BAD - effect runs 3 times
x.value = 1
y.value = 2
z.value = 3

// GOOD - effect runs once
batch(() => {
  x.value = 1
  y.value = 2
  z.value = 3
})
```

## Architecture

The reactivity system uses a push-pull model:
- **Push**: Signals notify subscribers when they change
- **Pull**: Computed values lazily evaluate when accessed
- **Fine-grained**: Only affected computations re-run, no Virtual DOM diffing
- **Automatic**: Dependencies are tracked automatically during execution

## Related Examples

- **counter** - Basic signal usage
- **todo-app** - Signals in a real application
- **context-demo** - Context API with signals
- **suspense-demo** - Async data with resources

## Learn More

- [Flexium Documentation](../../README.md)
- [Reactivity Guide](../../packages/flexium/README.md)
- [API Reference](../../packages/flexium/src/core/signal.ts)

## License

MIT
