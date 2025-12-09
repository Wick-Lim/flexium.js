# Flexium Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
├─────────────────────────────────────────────────────────┤
│  Primitives (Row, Column, Button, etc.)                 │
├─────────────────────────────────────────────────────────┤
│  Renderer (DOM, Canvas, etc.)                           │
├─────────────────────────────────────────────────────────┤
│  Core (signal, computed, effect, state)                 │
└─────────────────────────────────────────────────────────┘
```

## Core Layer

Location: `/packages/flexium/src/core/`

The foundation. Zero DOM dependencies. Pure reactive primitives.

### signal.ts

Reactive value container.

```typescript
interface Signal<T> {
  value: T        // Get/set the value
  peek(): T       // Read without tracking
  subscribe(fn)   // Manual subscription
}

function signal<T>(initialValue: T): Signal<T>
```

**How it works:**
1. Reading `.value` inside a tracking context (effect/computed) registers a dependency
2. Writing `.value` notifies all subscribers
3. Updates are synchronous by default, batched with `batch()`

### computed.ts

Derived values with automatic memoization.

```typescript
function computed<T>(fn: () => T): ReadonlySignal<T>
```

**How it works:**
1. Runs `fn` and tracks all signal reads
2. Caches the result
3. Re-runs only when dependencies change
4. Lazy evaluation - doesn't compute until read

### effect.ts

Side effect runner.

```typescript
function effect(fn: () => void | (() => void)): () => void
```

**How it works:**
1. Runs `fn` immediately
2. Tracks all signal reads during execution
3. Re-runs when any dependency changes
4. Cleanup function (return value) runs before re-execution
5. Returns dispose function

### state.ts

Unified API that wraps signal/computed/resource.

```typescript
function state<T>(
  initial: T | (() => T) | (() => Promise<T>),
  options?: { key?: string }
): [Accessor<T>, Setter<T>]
```

**Mode detection:**
- Plain value → local signal
- Sync function → computed
- Async function → resource (with loading/error states)
- With `key` option → global signal (shared)

## Renderer Layer

Location: `/packages/flexium/src/dom/`

Platform-specific rendering. Currently DOM only.

### h.ts (JSX Factory)

Creates virtual nodes.

```typescript
function h(
  type: string | Component,
  props: Record<string, any> | null,
  ...children: any[]
): VNode
```

**VNode structure:**
```typescript
interface VNode {
  type: string | Component
  props: Record<string, any>
  children: VNode[]
  el?: Element  // Actual DOM element after mount
}
```

### render.ts

Mounts VNode tree to DOM.

```typescript
function render(vnode: VNode, container: Element): void
```

**How it works:**
1. Creates DOM elements from VNodes
2. Sets up reactive bindings for signal values
3. Attaches event listeners with delegation
4. Returns cleanup function

### Reactive Bindings

When state is used in JSX:

```jsx
const [count] = state(0)
<span>{+count}</span>
```

The renderer:
1. Detects the reactive value read
2. Creates a text node
3. Sets up an effect to update the text when state changes
4. Only that text node updates - no parent re-render

## Primitives Layer

Location: `/packages/flexium/src/primitives/`

Pre-built, composable UI components.

### Layout Primitives

```
/primitives/layout/
├── Row.ts      # Horizontal flex container
├── Column.ts   # Vertical flex container
├── Grid.ts     # CSS Grid container
├── Stack.ts    # Absolute positioned layers
└── Spacer.ts   # Flexible space filler
```

All layout primitives accept:
- `gap` - Space between children
- `align` - Cross-axis alignment
- `justify` - Main-axis alignment
- `padding` - Internal padding
- `style` - Custom styles

### UI Primitives

```
/primitives/ui/
├── Button.ts     # Interactive button
├── Text.ts       # Text display
├── Image.ts      # Image with loading states
├── Pressable.ts  # Touch/click handler wrapper
└── ScrollView.ts # Scrollable container
```

### Canvas Primitives

```
/primitives/canvas/
├── Rect.ts    # Rectangle
├── Circle.ts  # Circle
├── Line.ts    # Line segment
├── Arc.ts     # Arc/curve
├── Path.ts    # Complex path
└── Text.ts    # Canvas text
```

## Data Flow

```
Signal Change
     │
     ▼
Notify Subscribers
     │
     ├──► Effect re-runs (side effects)
     │
     └──► Computed invalidates (lazy re-compute)
            │
            ▼
       DOM Updates (direct, no diffing)
```

## File Structure

```
packages/flexium/
├── src/
│   ├── core/
│   │   ├── signal.ts      # Reactive primitive
│   │   ├── computed.ts    # Derived values
│   │   ├── effect.ts      # Side effects
│   │   ├── state.ts       # Unified API
│   │   ├── batch.ts       # Update batching
│   │   └── context.ts     # Dependency tracking
│   │
│   ├── dom/
│   │   ├── h.ts           # JSX factory
│   │   ├── render.ts      # DOM renderer
│   │   ├── events.ts      # Event delegation
│   │   └── reactive.ts    # Reactive DOM bindings
│   │
│   ├── primitives/
│   │   ├── layout/        # Layout components
│   │   ├── ui/            # UI components
│   │   └── canvas/        # Canvas components
│   │
│   └── index.ts           # Main exports
│
└── __tests__/             # Test files
```

## Key Algorithms

### Dependency Tracking

```
1. Before running effect/computed:
   - Set global "tracking context" to current effect

2. When signal.value is read:
   - If tracking context exists, register as dependency

3. After running:
   - Clear tracking context
   - Store collected dependencies
```

### Update Scheduling

```
1. Signal value changes
2. Queue all dependent effects
3. If not in batch:
   - Flush queue immediately
4. If in batch:
   - Wait for batch to end
   - Deduplicate effects
   - Flush in dependency order
```

### Event Delegation

```
1. Single event listener per event type on container
2. Event bubbles up from target
3. Check target for matching handler
4. Execute handler with event
```

## Extension Points

### Custom Renderer

Implement the renderer interface:

```typescript
interface Renderer {
  createElement(type: string): Element
  createTextNode(text: string): Text
  setProperty(el: Element, key: string, value: any): void
  appendChild(parent: Element, child: Node): void
  removeChild(parent: Element, child: Node): void
}
```

### Custom Primitives

Extend existing primitives or create new ones:

```typescript
function MyComponent(props) {
  // Use signals for state
  // Return VNode tree
}
```

## Performance Characteristics

| Operation | Complexity |
|-----------|------------|
| Signal read | O(1) |
| Signal write | O(n) subscribers |
| Computed read (cached) | O(1) |
| Computed read (dirty) | O(deps) |
| Effect registration | O(1) |
| DOM update | O(changed nodes) |

## Memory Management

- Signals hold strong references to subscribers
- Effects must be disposed to prevent leaks
- Computed values are garbage collected when unreferenced
- Event delegation minimizes listener count
