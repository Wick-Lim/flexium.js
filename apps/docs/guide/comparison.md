# Framework Comparison

How does Flexium compare to React and SolidJS? This guide helps you understand the key differences.

## At a Glance

| Feature | Flexium | React | SolidJS | Svelte |
|---------|---------|-------|---------|--------|
| **Reactivity** | Signals (Proxy) | Virtual DOM | Signals | Compiler |
| **API Philosophy** | Unified (`state()`) | Hooks (multiple) | Primitives (multiple) | Syntax (`let`, `$`) |
| **Re-rendering** | Fine-grained | Component tree | Fine-grained | Fine-grained |
| **List Rendering** | `items.map()` works | `items.map()` works | Need `<For>` | `{#each}` block |
| **Bundle Size** | ~8KB | ~42KB | ~7KB | ~2KB (runtime) |
| **Learning Curve** | Low | Moderate | Moderate | Low |

## The Flexium Difference

### One API vs Many

::: code-group

```jsx [Flexium ✨]
import { state } from 'flexium'

function Component() {
  // All state needs - one function
  const [count, setCount] = state(0)                    // local
  const [doubled] = state(() => count * 2)              // derived
  const [user] = state(async () => fetchUser())         // async
  const [theme, setTheme] = state('dark', { key: 'theme' }) // global

  // Use values directly - just like React!
  return <div>{count} × 2 = {doubled}</div>
}
```

```jsx [React]
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRecoilState } from 'recoil'

function Component() {
  // Different APIs for different needs
  const [count, setCount] = useState(0)                 // local
  const doubled = useMemo(() => count * 2, [count])     // derived (manual deps!)
  const { data: user } = useQuery(['user'], fetchUser)  // async (separate lib!)
  const [theme, setTheme] = useRecoilState(themeAtom)   // global (separate lib!)

  return <div>{count} × 2 = {doubled}</div>
}
```

```jsx [SolidJS]
import { createSignal, createMemo, createResource } from 'solid-js'

function Component() {
  // Different primitives for different needs
  const [count, setCount] = createSignal(0)             // local
  const doubled = createMemo(() => count() * 2)         // derived
  const [user] = createResource(fetchUser)              // async
  // global state requires Context or module-level setup

  // Must call as functions - count() not count
  return <div>{count()} × 2 = {doubled()}</div>
}
```

```html [Svelte]
<script>
  // Compiler magic - specific syntax
  let count = $state(0);                // local
  let doubled = $derived(count * 2);    // derived
  // async requires #await block or custom stores
  
  // Global state needs separate store files
</script>

<div>{count} × 2 = {doubled}</div>
```

:::

### List Rendering

This is where Flexium really shines:

::: code-group

```jsx [Flexium ✨]
// React syntax + SolidJS performance = Best of both worlds
function TodoList() {
  const [todos, setTodos] = state([...])

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
// ✅ Familiar React syntax
// ✅ Auto-optimized (O(1) append, DOM caching)
// ✅ No special component needed
```

```jsx [React]
// Same syntax, but different behavior
function TodoList() {
  const [todos, setTodos] = useState([...])

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
// ✅ Familiar syntax
// ❌ Re-renders ENTIRE list on any change
// ❌ Needs memo() for optimization
```

```jsx [SolidJS]
// Must use <For> component
import { For } from 'solid-js'

function TodoList() {
  const [todos, setTodos] = createSignal([...])

  return (
    <ul>
      <For each={todos()}>
        {(todo) => <li>{todo.text}</li>}
      </For>
    </ul>
  )
}
// ❌ Different syntax to learn
// ✅ Optimized
// ❌ items().map() doesn't work reactively!
```

```html [Svelte]
<!-- Must use template syntax -->
<script>
  let todos = $state([...]);
</script>

<ul>
  {#each todos as todo (todo.id)}
    <li>{todo.text}</li>
  {/each}
</ul>
<!-- ❌ New template syntax to learn -->
<!-- ✅ Optimized -->
```

:::

### Value Access

::: code-group

```jsx [Flexium ✨]
const [count] = state(5)

// Use it exactly like React!
count               // 5
count + 10          // 15
`Value: ${count}`   // "Value: 5"

// Same syntax as React, but with signal performance
```

```jsx [React]
const [count] = useState(5)

// Direct access
count               // 5
count + 10          // 15
`Value: ${count}`   // "Value: 5"

// Familiar, but re-renders entire component
```

```jsx [SolidJS]
const [count] = createSignal(5)

// Must always call as function
count()             // 5
count() + 10        // 15
`Value: ${count()}` // "Value: 5"

// Forget the ()? Bug!
count + 10          // "[Function] + 10" ❌
```

:::

### Conditional Rendering

::: code-group

```jsx [Flexium ✨]
// Native JavaScript - just like React!
function Component() {
  const [show] = state(true)

  return (
    <div>
      {show && <Child />}
      {show ? <A /> : <B />}
    </div>
  )
}
// ✅ Same syntax as React
// ✅ Fine-grained updates (unlike React)
```

```jsx [React]
// Native JavaScript works
function Component() {
  const [show] = useState(true)

  return (
    <div>
      {show && <Child />}
      {show ? <A /> : <B />}
    </div>
  )
}
// ✅ Just JavaScript
// ❌ Re-renders entire component
```

```jsx [SolidJS]
// Must use Show component for optimization
import { Show } from 'solid-js'

function Component() {
  const [show] = createSignal(true)

  return (
    <div>
      <Show when={show()}>
        <Child />
      </Show>
      <Show when={show()} fallback={<B />}>
        <A />
      </Show>
    </div>
  )
}
// ❌ Different syntax from React
// ✅ Fine-grained updates
```

:::

### Effects

::: code-group

```jsx [Flexium ✨]
import { effect } from 'flexium'

// Auto-tracking - no dependency array!
effect(() => {
  console.log('Count:', count)
  console.log('Name:', name)
})
// ✅ Looks like React
// ✅ Auto dependency tracking (unlike React)
// ✅ No stale closures
```

```jsx [React]
import { useEffect } from 'react'

// Manual dependency array - error prone!
useEffect(() => {
  console.log('Count:', count)
  console.log('Name:', name)
}, [count, name]) // Must list all deps manually!

// Common bugs:
useEffect(() => {
  console.log(count) // Always 0! Stale closure
}, []) // Forgot to add count!
```

```jsx [SolidJS]
import { createEffect } from 'solid-js'

// Auto-tracking but different syntax
createEffect(() => {
  console.log('Count:', count())
  console.log('Name:', name())
})
// ✅ Automatic dependency tracking
// ❌ Must use count() not count
```

:::

## Performance Comparison

| Operation | Flexium | React | SolidJS |
|-----------|---------|-------|---------|
| State Creation | 640K ops/s | 450K ops/s | 1.8M ops/s |
| State Update | 1.3M ops/s | 180K ops/s | 1.5M ops/s |
| Computed Read | 14M ops/s | 350K ops/s | 1.2M ops/s |
| List Update | O(1) append | O(n) diff | O(1) append |

**Key insight**: Flexium and SolidJS are **3-10x faster** than React. SolidJS is ~20% faster than Flexium, but Flexium offers simpler APIs.

### Why the Performance Difference?

| Aspect | Flexium / SolidJS | React |
|--------|-------------------|-------|
| Update Strategy | Direct DOM updates | Virtual DOM diffing |
| Granularity | Only affected nodes | Entire component tree |
| Optimization | Fast by default | Needs memo, useMemo, useCallback |

## Learning Curve

| Framework | APIs to Learn | Time to Productive |
|-----------|---------------|-------------------|
| **Flexium** | `state()`, `effect()` | Hours |
| React | useState, useMemo, useCallback, useEffect, useContext, useReducer, + external libs | Days to weeks |
| SolidJS | createSignal, createMemo, createEffect, createResource, For, Show, Switch | Days |

## Migration Guide

### From React to Flexium

| React | Flexium | Notes |
|-------|---------|-------|
| `useState(x)` | `state(x)` | Same pattern |
| `useMemo(() => x, [deps])` | `state(() => x)` | No deps needed! |
| `useCallback(fn, [deps])` | Just use `fn` | No wrapper needed |
| `useEffect(() => {}, [deps])` | `effect(() => {})` | Auto-tracks deps |
| React Query | `state(async () => ...)` | Built-in |
| Recoil/Jotai | `state(x, { key })` | Built-in |
| `items.map()` | `items.map()` | Same! But optimized |

### From SolidJS to Flexium

| SolidJS | Flexium | Notes |
|---------|---------|-------|
| `createSignal(x)` | `state(x)` | |
| `createMemo(() => x)` | `state(() => x)` | Auto-detected |
| `createResource(fn)` | `state(async () => fn())` | Auto-detected |
| `createStore({})` | `state({})` | |
| `<For each={items}>` | `items.map()` | React syntax! |
| `<Show when={x}>` | `{() => x && ...}` | Native JS |

## When to Choose What

### Choose Flexium When:
- You want **one API** for all state needs
- **Fast onboarding** and low learning curve matter
- You want **React-like syntax** with Signal performance
- Built-in **global state and async** handling are important
- You prefer **native JavaScript** over special components



## Summary

| Aspect | Winner | Why |
|--------|--------|-----|
| **API Simplicity** | Flexium | One `state()` for everything |
| **Learning Curve** | Flexium/Svelte | Very low barrier to entry |
| **List Rendering DX** | Flexium | React syntax with optimization |
| **Raw Performance** | SolidJS/Svelte | Compiler/Fine-grained optimized |
| **Ecosystem** | React | Massive library support |
| **TypeScript DX** | Flexium/React | Just TypeScript, no custom file formats |
| **Global State** | Flexium | Built-in, zero setup |
| **Bundle Size** | Svelte | Tiny runtime (compiler does heavy lifting) |

---

**Bottom line**: Flexium combines **React's usability** with **No-VDOM performance**.
