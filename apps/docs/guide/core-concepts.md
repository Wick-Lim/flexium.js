# Core Concepts

Understanding the fundamental concepts behind Flexium will help you build better applications.

## Signals: The Foundation

Everything in Flexium revolves around **signals**—reactive containers that hold values and notify dependents when they change.

```tsx
import { signal } from 'flexium/core'

const count = signal(0)

// Signals are reactive
count.value // Read
count.set(5) // Write
```

### Why Signals?

Traditional frameworks re-render entire components when state changes. Flexium's signals enable **fine-grained reactivity**—only the specific DOM nodes that depend on a signal update when it changes.

```tsx
function Counter() {
  const [count, setCount] = state(0)

  // Only this text node updates when count changes
  return <p>Count: {count}</p>
}
```

## Reactive Primitives

Flexium provides three core reactive primitives:

### 1. `signal()` / `state()` - Reactive State

Hold values that can change over time:

```tsx
// Standalone signal
const name = signal('Alice')

// React-like tuple
const [age, setAge] = state(25)
```

### 2. `computed()` - Derived Values

Automatically derive values from other signals:

```tsx
const firstName = signal('John')
const lastName = signal('Doe')

const fullName = computed(() =>
  `${firstName.value} ${lastName.value}`
)
// fullName updates whenever firstName or lastName changes
```

### 3. `effect()` - Side Effects

Run code when signals change:

```tsx
effect(() => {
  document.title = `Count: ${count.value}`
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

Flexium provides reactive control flow components:

### Conditional Rendering

```tsx
<Show when={isLoggedIn()}>
  <Dashboard />
</Show>
```

### List Rendering

```tsx
<For each={items()}>
  {(item) => <ListItem item={item} />}
</For>
```

### Multiple Conditions

```tsx
<Switch>
  <Match when={status() === 'loading'}>Loading...</Match>
  <Match when={status() === 'error'}>Error!</Match>
  <Match when={status() === 'success'}>Done!</Match>
</Switch>
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
  // count is a signal, updates automatically
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
import { onMount, onCleanup } from 'flexium/core'

function MyComponent() {
  onMount(() => {
    console.log('Mounted!')

    return () => console.log('Unmounting!')
  })

  // Or separately
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

## Error Handling

### Error Boundaries

Catch and handle errors in component trees:

```tsx
<ErrorBoundary fallback={(err) => <ErrorPage error={err} />}>
  <App />
</ErrorBoundary>
```

### Suspense

Handle async operations gracefully:

```tsx
<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>
```

## Summary

| Concept | Purpose | Example |
|---------|---------|---------|
| `signal()` | Reactive state | `signal(0)` |
| `computed()` | Derived values | `computed(() => a + b)` |
| `effect()` | Side effects | `effect(() => log(x))` |
| `<Show>` | Conditional render | `<Show when={x}>` |
| `<For>` | List render | `<For each={items}>` |
| `<ErrorBoundary>` | Error handling | Catch component errors |
| Primitives | UI building blocks | `<Row>`, `<Button>`, etc. |

## Next Steps

- [Quick Start](/guide/quick-start) - Build your first app
- [Reactivity Guide](/guide/state) - Deep dive into signals
- [JSX & Rendering](/guide/jsx) - How rendering works
- [API Reference](/docs/core/state) - Complete API docs
