# Framework Comparison

How does Flexium compare to React and Svelte? This guide helps you understand the key differences.

## At a Glance

| Feature | Flexium | React | Svelte |
|---------|---------|-------|--------|
| **Reactivity** | Signals (Proxy) | Virtual DOM | Signals (Runes) |
| **API Philosophy** | Unified (`use()`) | Hooks (multiple) | Syntax (`let`, `$`) |
| **Re-rendering** | Fine-grained | Component tree | Fine-grained |
| **List Rendering** | `items.map()` works | `items.map()` works | `{#each}` block |
| **Bundle Size** | ~6KB (full bundle) | ~42KB (React only) | ~2KB (runtime) |
| **Learning Curve** | **Zero** (for React devs) | Moderate | Moderate (New Syntax) |

## The Flexium Difference

### One API vs Many

::: code-group

```jsx [Flexium ✨]
import { useState } from 'flexium/core'

function Component() {
  // All state needs - one function, tuple return
  const [count, setCount] = use(0)                          // local
  const [doubled] = use(() => count * 2, { deps: [count] }) // derived
  const [user] = use(async () => fetchUser())               // async
  const [theme, setTheme] = use('dark', { key: 'theme' })   // global

  return <div>{count} × 2 = {doubled}</div>
}
```

```jsx [React]
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRecoilState } from 'recoil'

function Component() {
  // Different APIs for different needs
  const [count, setCount] = use(0)                 // local
  const doubled = useMemo(() => count * 2, [count])     // derived (manual deps!)
  const { data: user } = useQuery(['user'], fetchUser)  // async (separate lib!)
  const [theme, setTheme] = useRecoilState(themeAtom)   // global (separate lib!)

  return <div>{count} × 2 = {doubled}</div>
}
```



```html [Svelte 5]
<script>
  // Global state still often separate, but Runes work anywhere
  import { theme } from './stores.js'; 

  let count = $state(0);
  let doubled = $derived(count * 2);
  
  // Async state handling
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
  const [todos, setTodos] = use([...])

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
  const [todos, setTodos] = use([...])

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



```html [Svelte 5]
<script>
  let todos = $state([...]);
</script>

<ul>
  {#each todos as todo (todo.id)}
    <li>{todo.text}</li>
  {/each}
</ul>
<!-- ❌ Template syntax for loops -->
<!-- ✅ Optimized -->
```

:::

### Value Access

::: code-group

```jsx [Flexium ✨]
const [count, setCount] = use(5)

// Tuple-based access like React
count               // 5
count + 10          // 15
`Value: ${count}`   // "Value: 5"

// Update with setter
setCount(10)
setCount(c => c + 1)
```

```jsx [React]
const [count, setCount] = use(5)

// Tuple-based access
count               // 5
count + 10          // 15
`Value: ${count}`   // "Value: 5"

// Re-renders entire component on update
```

```html [Svelte 5]
<script>
  let count = $state(5);

  // Script: Direct access (Runes)
  console.log(count);      // 5
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
  const [show, setShow] = use(true)

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
  const [show] = use(true)

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

```html [Svelte 5]
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
<!-- ❌ Template syntax for conditionals -->
<!-- ✅ Fine-grained updates -->
```

:::

### Effects

::: code-group

```jsx [Flexium ✨]
import { useEffect } from 'flexium/core'

// Dependency array like React
use(() => {
  console.log('Count:', count)
  console.log('Name:', name)
}, [count, name])
// ✅ Familiar React pattern
// ✅ Explicit dependencies
// ✅ Fine-grained updates (only this effect re-runs)
```

```jsx [React]
import { useEffect } from 'react'

// Manual dependency array
use(() => {
  console.log('Count:', count)
  console.log('Name:', name)
}, [count, name])

// Common bugs:
use(() => {
  console.log(count) // Always 0! Stale closure
}, []) // Forgot to add count!
```

```html [Svelte 5]
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

| Aspect | Flexium / Svelte 5 | React |
|--------|--------------------|-------|
| Update Strategy | Direct DOM updates | Virtual DOM diffing |
| Granularity | Only affected nodes | Entire component tree |
| Optimization | Fast by default | Needs memo, useMemo, useCallback |
| Bundle Size | ~6KB (Flexium) / ~2KB (Svelte) | ~42KB (React only) + Libs |

## Learning Curve

| Framework | APIs to Learn | Time to Productive |
|-----------|---------------|-------------------|
| **Flexium** | `use()`, `use()` | Hours |
| React | useState, useMemo, useCallback, useEffect, useContext, useReducer, + external libs | Days to weeks |

## Migration Guide

### From React to Flexium

| React | Flexium | Notes |
|-------|---------|-------|
| `use(x)` | `use(x)` | Returns `[value, setter]` tuple |
| `useMemo(() => x, [deps])` | `use(() => x, { deps })` | Computed with deps |
| `useCallback(fn, [deps])` | Just use `fn` | No wrapper needed |
| `use(() => {}, [deps])` | `use(() => {}, [deps])` | Same pattern |
| React Query | `use(async () => ...)` | Built-in |
| Recoil/Jotai | `use(x, { key })` | Built-in |
| `items.map()` | `items.map()` | Same! But optimized |

### From Svelte 5 to Flexium

| Svelte 5 | Flexium | Notes |
|----------|---------|-------|
| `let x = $state(0)` | `const [x] = use(0)` | |
| `let y = $derived(x * 2)` | `const [y] = use(() => x * 2)` | Auto-detected |
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
| **API Simplicity** | Flexium | One `use()` for everything |
| **Learning Curve** | Flexium | **Zero** for React devs vs Svelte's new syntax |
| **List Rendering DX** | Flexium | Standard JS `.map()` vs Svelte's `{#each}` |
| **Raw Performance** | Flexium/Svelte | Both are fine-grained & VDOM-less |
| **Ecosystem** | React | Massive library support |
| **TypeScript DX** | Flexium/React | Standard TS vs Svelte's custom DSL |
| **Global State** | Flexium | Built-in, zero setup |
| **Bundle Size** | Svelte | Tiny runtime (compiler does heavy lifting) |

---

**Bottom line**: Flexium combines **React's usability** with **No-VDOM performance**.
