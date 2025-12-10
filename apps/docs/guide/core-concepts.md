# Core Concepts

Understanding the fundamental concepts behind Flexium will help you build better applications.

## One API for All State

Flexium's philosophy is simple: **one `state()` function for all reactive needs**.

```tsx
import { state } from 'flexium/core'

// Mutable state
const [count, setCount] = state(0)

// Derived state
const [doubled] = state(() => count * 2)

// Async state
const [users, refetch, status, error] = state(async () => fetch('/api/users'))
```

### Why One API?

- **No decision fatigue** - One pattern to learn
- **Consistent behavior** - Same mental model everywhere
- **Type-safe** - TypeScript infers the right return type

## Fine-Grained Reactivity

Traditional frameworks re-render entire components when state changes. Flexium's signals enable **fine-grained reactivity**—only the specific DOM nodes that depend on a signal update when it changes.

```tsx
function Counter() {
  const [count, setCount] = state(0)

  // Only this text node updates when count changes
  return <p>Count: {count}</p>
}
```

## Reactive Primitives

### 1. `state()` - All Reactive State

```tsx
// Mutable state → [value, setter]
const [name, setName] = state('Alice')

// Derived state → [value] (no setter)
const [greeting] = state(() => `Hello, ${name}!`)

// Async state → [value, refetch, status, error]
const [data, refetch, status, error] = state(async () => fetchData())
```

### 2. `effect()` - Side Effects

Run code when state changes:

```tsx
effect(() => {
  document.title = `Count: ${count}`
})
```

## The Rendering Model

### JSX to DOM

Flexium uses JSX as a template language. Unlike React's Virtual DOM, Flexium compiles JSX directly to efficient DOM operations:

```tsx
// This JSX...
<div class="card">
  <h1>{title}</h1>
  <p>{description}</p>
</div>

// ...becomes direct DOM manipulation
// Only {title} and {description} nodes update reactively
```

### No Virtual DOM

Flexium doesn't use a Virtual DOM or diffing algorithm. Instead:
1. Initial render creates real DOM nodes
2. Signals create subscriptions to specific nodes
3. When signals change, only subscribed nodes update

This results in:
- **Faster updates**: No tree diffing
- **Lower memory**: No virtual tree copies
- **Predictable performance**: O(1) updates per signal

## Control Flow

### Conditional Rendering

Use native JavaScript:

```tsx
{isLoggedIn ? <Dashboard /> : <Login />}
```

### List Rendering

```tsx
{items.map(item => <ListItem key={item.id} item={item} />)}
```

## Component Model

### Functional Components

Components are just functions that return JSX:

```tsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}
```

### Props are Reactive

When you pass signals as props, reactivity flows through:

```tsx
function Parent() {
  const [count, setCount] = state(0)
  return <Child count={count} />
}

function Child({ count }) {
  // count is reactive, updates automatically
  return <span>{count}</span>
}
```

### Local State

State created inside components is local to that component:

```tsx
function Counter() {
  const [count, setCount] = state(0) // Local state
  return <button onclick={() => setCount(c => c + 1)}>{count}</button>
}
```

## Primitives

Flexium includes cross-platform UI primitives:

### Layout

```tsx
<Row gap={16}>
  <Column flex={1}>Left</Column>
  <Column flex={2}>Right</Column>
</Row>
```

### Components

```tsx
<Button onPress={() => alert('Clicked!')}>
  Click Me
</Button>

<ScrollView height={400}>
  <LongContent />
</ScrollView>
```

These primitives work consistently across web and canvas renderers.

## Lifecycle

### Mount/Unmount

```tsx
import { effect } from 'flexium/core'

function MyComponent() {
  effect(() => {
    console.log('Mounted!')
    return () => console.log('Unmounting!')
  })

  onCleanup(() => {
    console.log('Cleaning up!')
  })

  return <div>Content</div>
}
```

### Effect Cleanup

Effects can return cleanup functions:

```tsx
effect(() => {
  const subscription = api.subscribe(data => {
    // Handle data
  })

  return () => subscription.unsubscribe()
})
```

## Error & Loading Handling

Handle errors and loading states explicitly with `state(async)`:

```tsx
const [data, refetch, status, error] = state(async () => {
  const res = await fetch('/api/data')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

// status: 'idle' | 'loading' | 'success' | 'error'
function DataView() {
  return (
    <div>
      {status === 'loading' ? (
        <Spinner />
      ) : status === 'error' ? (
        <div>
          <p>Error: {error.message}</p>
          <button onclick={refetch}>Retry</button>
        </div>
      ) : (
        <Content data={data} />
      )}
    </div>
  )
}
```

## Summary

| Concept | Purpose | Example |
|---------|---------|---------|
| `state(value)` | Mutable state | `const [x, setX] = state(0)` |
| `state(() => T)` | Derived value | `state(() => a + b)` |
| `state(async)` | Async data | `state(async () => fetch(...))` |
| `effect()` | Side effects | `effect(() => log(x))` |
| `items.map()` | List render | `items.map(item => <div>{item}</div>)` |
| Primitives | UI building blocks | `<Row>`, `<Button>`, etc. |

## Next Steps

- [Quick Start](/guide/quick-start) - Build your first app
- [Reactivity Guide](/guide/state) - Deep dive into state
- [JSX & Rendering](/guide/jsx) - How rendering works
- [API Reference](/docs/core/state) - Complete API docs
