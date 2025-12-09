# Framework Comparison

How does Flexium compare to React and Svelte? This guide helps you understand the key differences.

## At a Glance

| Feature | Flexium | React | Svelte |
|---------|---------|-------|--------|
| **Reactivity** | Signals (Proxy) | Virtual DOM | Compiler |
| **API Philosophy** | Unified (`state()`) | Hooks (multiple) | Syntax (`let`, `$`) |
| **Re-rendering** | Fine-grained | Component tree | Fine-grained |
| **List Rendering** | `items.map()` works | `items.map()` works | `{#each}` block |
| **Bundle Size** | ~8KB (with Router & Motion) | ~42KB (React only) | ~2KB (runtime) |
| **Learning Curve** | **Zero** (for React devs) | Moderate | Moderate (New Syntax) |

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



```html [Svelte]
<script>
  import { theme } from './stores.js'; // Global state needs separate file

  let count = $state(0);
  let doubled = $derived(count * 2);
  
  // Async state usually handled in template
  let userPromise = fetchUser();
</script>

<div>
  {count} × 2 = {doubled}
  
  {#await userPromise}
    <p>Loading...</p>
  {:then user}
    <p>{user.name}</p>
  {/await}
</div>
```

:::

### List Rendering

This is where Flexium really shines:

::: code-group

```jsx [Flexium ✨]
// React syntax + Svelte performance = Best of both worlds
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

```html [Svelte]
<script>
  let count = $state(5);
  
  // Script: Direct access (Svelte 5)
  console.log(count);     // 5
  console.log(count + 10); // 15
</script>

<!-- Template: Direct access -->
<p>Value: {count}</p>
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

```html [Svelte]
<script>
  let show = $state(true);
</script>

<div>
  {#if show}
    <Child />
  {/if}
  
  {#if show}
    <A />
  {:else}
    <B />
  {/if}
</div>
<!-- ❌ Custom template syntax -->
<!-- ✅ Fine-grained updates -->
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

```html [Svelte]
<script>
  $effect(() => {
    console.log('Count:', count);
    console.log('Name:', name);
  });
  // ✅ Automatic dependency tracking
  // ❌ $effect rune syntax
</script>
```

:::

## Performance Comparison

| Operation | Flexium | React |
|-----------|---------|-------|
| State Creation | 640K ops/s | 450K ops/s |
| State Update | 1.3M ops/s | 180K ops/s |
| Computed Read | 14M ops/s | 350K ops/s |
| List Update | O(1) append | O(n) diff |

**Key insight**: Flexium matches **Svelte's performance** without forcing you to learn a **new template language**. If you know React, you already know Flexium.

### Why the Performance Difference?

| Aspect | Flexium / Svelte | React |
|--------|------------------|-------|
| Update Strategy | Direct DOM updates | Virtual DOM diffing |
| Granularity | Only affected nodes | Entire component tree |
| Optimization | Fast by default | Needs memo, useMemo, useCallback |
| Bundle Size | ~8KB (Full Ecosystem) | ~42KB (React only) + Libs |

## Learning Curve

| Framework | APIs to Learn | Time to Productive |
|-----------|---------------|-------------------|
| **Flexium** | `state()`, `effect()` | Hours |
| React | useState, useMemo, useCallback, useEffect, useContext, useReducer, + external libs | Days to weeks |

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

### From Svelte to Flexium

| Svelte | Flexium | Notes |
|--------|---------|-------|
| `let x = $state(0)` | `const [x, setX] = state(0)` | |
| `$derived(x * 2)` | `state(() => x * 2)` | Auto-detected |
| `{#each}` | `items.map()` | React syntax! |
| `{#if}` | `{() => x && ...}` | Native JS |

## When to Choose What

### Choose Flexium When:
- You want **one API** for all state needs
- **Fast onboarding** and low learning curve matter
- You want **React-like syntax** with Svelte performance
- Built-in **global state and async** handling are important
- You prefer **native JavaScript** over special components



## Summary

| Aspect | Winner | Why |
|--------|--------|-----|
| **API Simplicity** | Flexium | One `state()` for everything |
| **Learning Curve** | Flexium | **Zero** for React devs vs Svelte's new syntax |
| **List Rendering DX** | Flexium | Standard JS `.map()` vs Svelte's `{#each}` |
| **Raw Performance** | Flexium/Svelte | Both are fine-grained & VDOM-less |
| **Ecosystem** | React | Massive library support |
| **TypeScript DX** | Flexium/React | Standard TS vs Svelte's custom DSL |
| **Global State** | Flexium | Built-in, zero setup |
| **Bundle Size** | Svelte | Tiny runtime (compiler does heavy lifting) |

---

**Bottom line**: Flexium combines **React's usability** with **No-VDOM performance**.
