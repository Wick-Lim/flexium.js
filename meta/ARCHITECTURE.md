# Flexium Architecture

Flexium is built on a **Hybrid Proxy Architecture** that unifies all state management into a single `state()` API while maintaining fine-grained reactivity through signals.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│              (Your Components & Primitives)              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              High-Level API (state.ts)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  state() - Unified API                           │  │
│  │  - Hybrid Proxy wrapping                         │  │
│  │  - Global state registry                         │  │
│  │  - Automatic mode detection                      │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         Low-Level Primitives (signal.ts)                │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ SignalNode   │  │ ComputedNode │  │ EffectNode   │ │
│  │ (writable)   │  │ (derived)    │  │ (side fx)    │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│            Dependency Graph (graph.ts)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Doubly Linked List Structure                    │  │
│  │  - Link pooling (GC optimization)                │  │
│  │  - O(1) connect/disconnect                       │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         Execution & Batching (sync.ts, effect.ts)      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Auto-batching (microtask)                       │  │
│  │  Manual batching (sync())                        │  │
│  │  Owner/Scope management (owner.ts)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. State API (`state.ts`)

The unified entry point that handles all state patterns through a single function.

#### Hybrid Proxy Architecture

```typescript
// state() returns a Proxy that behaves like the value itself
const [count, setCount] = state(0);

// Direct usage in JSX (no .value needed)
<div>{count}</div>

// Direct arithmetic operations
const doubled = count * 2;

// Array iteration
items.map(item => ...)
```

**Key Proxy Features:**
- `Symbol.toPrimitive` / `valueOf`: Enables arithmetic operations (`count + 1`)
- `Symbol.iterator`: Enables array iteration (`for...of`, `[...array]`)
- Nested Proxy: Object properties are automatically wrapped for reactivity
- Recursive forwarding: Deep property access tracks dependencies

#### Mode Detection

`state()` automatically detects the pattern:

```typescript
// 1. Primitive value → SignalNode (writable)
const [count, setCount] = state(0);

// 2. Sync function → ComputedNode (derived)
const [doubled] = state(() => count * 2);

// 3. Async function → Resource (with loading/error)
const [user, refetch, status, error] = state(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

// 4. With key → Global state (shared across components)
const [theme, setTheme] = state('light', { key: 'app-theme' });
```

#### Global State Registry

States with `key` are stored in a global registry, allowing shared access:

```typescript
// Component A
const [theme, setTheme] = state('light', { key: 'theme' });

// Component B (anywhere in the app)
const [theme] = state(undefined, { key: 'theme' }); // Accesses same state
```

### 2. Signal Primitives (`signal.ts`)

Low-level reactive primitives that power the state API.

#### SignalNode

Atomic writable signal:

```typescript
class SignalNode<T> {
  version: number           // Epoch-based change detection
  nodeType: NodeType.Signal // Fast type checking
  subsHead: Link | undefined // Subscriber list
  
  get(): T                  // Track dependency if in effect/computed
  set(value: T): void       // Update and notify subscribers
  peek(): T                 // Read without tracking
}
```

**Performance Optimizations:**
- Hot path fields first (CPU cache optimization)
- Version-based change detection (epoch system)
- Direct linked list traversal (no array allocation)

#### ComputedNode

Derived signal with automatic memoization:

```typescript
class ComputedNode<T> {
  flags: SubscriberFlags     // Dirty/Stale/Running state
  lastCleanEpoch: number    // Track when last computed
  
  get(): T                   // Lazy evaluation + dependency tracking
  peek(): T                  // Force computation if needed
}
```

**Lazy Evaluation:**
- Only computes when accessed
- Checks dependencies before recomputing
- Uses epoch comparison for fast dirty checking

#### EffectNode

Side effect runner:

```typescript
class EffectNode {
  depsHead: Link | undefined // Dependencies list
  cleanups: (() => void)[]   // Cleanup functions
  
  execute(): void            // Run effect and track dependencies
  dispose(): void            // Clean up dependencies and run cleanups
}
```

**Features:**
- Automatic dependency tracking
- Cleanup function support
- Running flag prevents infinite loops

### 3. Dependency Graph (`graph.ts`)

Efficient dependency tracking using doubly linked lists.

#### Link Structure

```typescript
interface Link {
  dep: IObservable | undefined  // The signal/computed being tracked
  sub: ISubscriber | undefined // The effect/computed tracking it
  
  // Pointers for dependency's subscriber list
  prevSub: Link | undefined
  nextSub: Link | undefined
  
  // Pointers for subscriber's dependency list
  prevDep: Link | undefined
  nextDep: Link | undefined
}
```

**Benefits:**
- O(1) connect/disconnect operations
- No array allocations
- Efficient memory usage

#### Link Pooling

Links are pooled to reduce GC pressure:

```typescript
namespace LinkPool {
  const pool: Link[] = []
  
  export function alloc(dep, sub): Link {
    // Reuse from pool or create new
  }
  
  export function free(link: Link): void {
    // Return to pool (max 10,000)
  }
}
```

### 4. Batching System (`sync.ts`)

Two-level batching for optimal performance.

#### Auto-Batching (Default)

Automatic microtask batching for event handlers:

```typescript
// Multiple updates in event handler are batched automatically
button.onclick = () => {
  setCount(c => c + 1);
  setFlag(true);
  setName('John');
  // All updates batched, DOM updates once
};
```

#### Manual Batching

Explicit synchronous batching:

```typescript
import { sync } from 'flexium/core';

sync(() => {
  setCount(1);
  setFlag(true);
}); // DOM updates once here, synchronously
```

### 5. Owner/Scope System (`owner.ts`)

Manages reactive scopes and cleanup.

```typescript
interface Owner {
  cleanups: (() => void)[]      // Cleanup functions
  context: Record<symbol, any>   // Context values
  owner: Owner | null            // Parent owner
}
```

**Features:**
- Automatic cleanup when owner is disposed
- Context propagation through owner chain
- Component-scoped effects

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| State access | O(1) | Proxy overhead negligible |
| State update | O(subscribers) | Only notifies actual subscribers |
| Computed evaluation | O(dependencies) | Lazy + cached |
| Dependency tracking | O(1) | Linked list append |
| Array reconciliation | O(1) to O(N) | Optimized for append/remove |

## Memory Model

- **Proxy Caching**: Proxies are cached per Box/Signal (WeakMap)
- **Link Pooling**: Links reused to reduce GC pressure
- **Automatic Cleanup**: Effects disposed when owner is destroyed
- **WeakMap Usage**: Prevents memory leaks in dependency graph

## Key Design Decisions

### 1. Why Proxy?

- Enables direct usage without `.value`
- Transparent reactivity (works in JSX, arithmetic, etc.)
- Better developer experience

### 2. Why Doubly Linked Lists?

- O(1) operations (no array allocations)
- Efficient memory usage
- Easy to traverse in both directions

### 3. Why Epoch-Based Validation?

- Fast change detection (number comparison)
- Avoids unnecessary recomputations
- Works well with batching

### 4. Why Two-Level Batching?

- Auto-batching: Convenient for common cases
- Manual batching: Control when needed
- Best of both worlds

## File Structure

```
packages/flexium/src/core/
├── index.ts          # Public API exports
├── state.ts          # Unified state() API + Proxy
├── signal.ts         # SignalNode, ComputedNode, createResource
├── effect.ts         # EffectNode
├── graph.ts          # Dependency graph + Link pooling
├── sync.ts           # Batching system
├── owner.ts          # Owner/Scope management
├── renderer.ts       # Renderer interface
├── fnode.ts          # FNode creation utility
├── context.ts        # Context API
└── errors.ts         # Error system
```

## Extension Points

### Custom Renderers

Implement the `Renderer` interface for new platforms:

```typescript
interface Renderer {
  createNode(type: string, props: Record<string, unknown>): RenderNode
  updateNode(node: RenderNode, oldProps: Record<string, unknown>, newProps: Record<string, unknown>): void
  // ... other methods
}
```

### Advanced Primitives

Low-level primitives available via `flexium/advanced`:

```typescript
import { SignalNode, ComputedNode, EffectNode } from 'flexium/advanced';
```

## Future Considerations

- **Native Renderer**: iOS/Android support (planned)
- **SSR Optimization**: Server-side rendering improvements
- **DevTools Integration**: Enhanced debugging capabilities
