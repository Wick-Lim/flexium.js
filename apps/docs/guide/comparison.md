# Framework Comparison

This guide compares Flexium with React and SolidJS to help you understand the differences and make informed decisions.

## Overview

| Feature | React | SolidJS | Flexium |
|---------|-------|---------|---------|
| **Reactivity** | Virtual DOM | Signals | Signals |
| **API Philosophy** | Hooks (multiple) | Primitives (multiple) | Unified (`state()`) |
| **Re-rendering** | Component tree | Fine-grained | Fine-grained |
| **Bundle Size** | ~42KB | ~7KB | ~8KB |
| **Learning Curve** | Moderate | Moderate | Low |
| **Ecosystem** | Massive | Growing | New |

## Architecture Comparison

### React: Virtual DOM

React uses a Virtual DOM to batch and optimize DOM updates:

```
State Change → Re-render Component → Diff Virtual DOM → Patch Real DOM
```

**Pros:**
- Battle-tested, massive ecosystem
- Familiar to most developers
- Extensive tooling and libraries

**Cons:**
- Overhead from diffing algorithm
- Requires optimization (memo, useMemo, useCallback)
- Stale closure issues with hooks

### SolidJS: Fine-Grained Signals

SolidJS uses signals for fine-grained reactivity:

```
Signal Change → Update Only Dependent DOM Nodes
```

**Pros:**
- Excellent performance
- No Virtual DOM overhead
- React-like JSX syntax

**Cons:**
- Multiple APIs to learn
- Smaller ecosystem
- Different mental model from React

### Flexium: Unified Signals

Flexium combines SolidJS-style reactivity with a unified API:

```
state() Change → Update Only Dependent DOM Nodes
```

**Pros:**
- Single `state()` API for everything
- Fine-grained reactivity
- Minimal learning curve
- StateProxy for natural value usage

**Cons:**
- New framework, smaller ecosystem
- Fewer third-party integrations

## API Comparison

### State Management

::: code-group

```jsx [React]
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRecoilState } from 'recoil'

function Component() {
  // Local state
  const [count, setCount] = useState(0)

  // Derived state
  const doubled = useMemo(() => count * 2, [count])

  // Memoized callback
  const increment = useCallback(() => setCount(c => c + 1), [])

  // Async data (requires React Query)
  const { data: user } = useQuery(['user'], fetchUser)

  // Global state (requires Recoil)
  const [theme, setTheme] = useRecoilState(themeAtom)
}
```

```jsx [SolidJS]
import { createSignal, createMemo, createResource } from 'solid-js'
import { createStore } from 'solid-js/store'

function Component() {
  // Local state
  const [count, setCount] = createSignal(0)

  // Derived state
  const doubled = createMemo(() => count() * 2)

  // Async data
  const [user] = createResource(fetchUser)

  // Global state (module-level or context)
  // Requires additional setup
}
```

```jsx [Flexium]
import { state } from 'flexium'

function Component() {
  // Local state
  const [count, setCount] = state(0)

  // Derived state (auto-detected)
  const [doubled] = state(() => count() * 2)

  // Async data (auto-detected)
  const [user, refetch, status, error] = state(async () => fetchUser())

  // Global state (built-in)
  const [theme, setTheme] = state('dark', { key: 'theme' })
}
```

:::

### Value Access

::: code-group

```jsx [React]
// Direct value access
count           // 5
count + 10      // 15
`Value: ${count}` // "Value: 5"
```

```jsx [SolidJS]
// Must call as function
count()         // 5
count() + 10    // 15
`Value: ${count()}` // "Value: 5"

// Without () - doesn't work
count + 10      // "[Function] + 10" ❌
```

```jsx [Flexium]
// Both work thanks to StateProxy
count()         // 5 (function call)
count + 10      // 15 (Symbol.toPrimitive)
`Value: ${count}` // "Value: 5" (toString)

// Proxy transparently handles all operations
```

:::

### Effects

::: code-group

```jsx [React]
import { useEffect, useLayoutEffect } from 'react'

function Component() {
  // Side effect with dependency array
  useEffect(() => {
    console.log('Count changed:', count)
  }, [count]) // Must specify dependencies

  // Cleanup
  useEffect(() => {
    const timer = setInterval(() => {}, 1000)
    return () => clearInterval(timer)
  }, [])
}
```

```jsx [SolidJS]
import { createEffect, onCleanup } from 'solid-js'

function Component() {
  // Auto-tracking dependencies
  createEffect(() => {
    console.log('Count changed:', count())
  })

  // Cleanup
  createEffect(() => {
    const timer = setInterval(() => {}, 1000)
    onCleanup(() => clearInterval(timer))
  })
}
```

```jsx [Flexium]
import { effect, onCleanup } from 'flexium'

function Component() {
  // Auto-tracking dependencies
  effect(() => {
    console.log('Count changed:', count())
  })

  // Cleanup
  effect(() => {
    const timer = setInterval(() => {}, 1000)
    onCleanup(() => clearInterval(timer))
  })
}
```

:::

### Control Flow

::: code-group

```jsx [React]
function Component() {
  return (
    <div>
      {/* Conditional */}
      {show && <Child />}
      {show ? <A /> : <B />}

      {/* List - re-renders entire list on change */}
      {items.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  )
}
```

```jsx [SolidJS]
import { Show, For } from 'solid-js'

function Component() {
  return (
    <div>
      {/* Conditional - needs Show component */}
      <Show when={show()}>
        <Child />
      </Show>

      {/* List - MUST use For, items().map() doesn't work reactively */}
      <For each={items()}>
        {(item) => <Item item={item} />}
      </For>
    </div>
  )
}
```

```jsx [Flexium]
function Component() {
  return (
    <div>
      {/* Conditional - native JS works */}
      {() => show() && <Child />}
      {() => show() ? <A /> : <B />}

      {/* List - React syntax with automatic optimization! */}
      {items.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  )
}
```

:::

> **Flexium Unique Feature**: `items.map()` works like React but with SolidJS-level performance optimizations (O(1) append, DOM caching, minimal moves).

## Performance Comparison

Based on benchmarks (ops/sec, higher is better):

| Operation | React | SolidJS | Flexium |
|-----------|-------|---------|---------|
| State Creation | 450K | 1.8M | 1.5M |
| State Update | 180K | 1.5M | 1.2M |
| Computed Read | 350K | 1.2M | 1.0M |
| Effect Creation | 120K | 800K | 650K |
| Batch Update (10) | 45K | 450K | 380K |
| Deep Chain (10) | 25K | 280K | 220K |

> SolidJS leads in raw performance, but both SolidJS and Flexium are **3-10x faster** than React for most operations.

### Why the Performance Difference?

**React:**
- Virtual DOM diffing on every update
- Component re-renders propagate down the tree
- Requires memoization for optimization

**SolidJS / Flexium:**
- Direct DOM updates, no diffing
- Only affected nodes update
- Fast by default, no optimization needed

## Developer Experience

### Learning Curve

| Framework | APIs to Learn | Concepts |
|-----------|---------------|----------|
| React | useState, useMemo, useCallback, useEffect, useContext, useReducer + external libs | Hooks rules, dependency arrays, memoization |
| SolidJS | createSignal, createMemo, createEffect, createResource, createStore, createContext | Signals, fine-grained reactivity |
| Flexium | state, effect | Signals (unified through state) |

### Common Pitfalls

**React:**
```jsx
// Stale closure - common bug
const [count, setCount] = useState(0)
useEffect(() => {
  setInterval(() => {
    console.log(count) // Always 0! Stale closure
  }, 1000)
}, []) // Missing dependency
```

**SolidJS / Flexium:**
```jsx
// No stale closures - signals always current
const [count, setCount] = state(0)
effect(() => {
  setInterval(() => {
    console.log(count()) // Always current value
  }, 1000)
})
```

## Migration Guide

### From React to Flexium

| React | Flexium |
|-------|---------|
| `useState(value)` | `state(value)` |
| `useMemo(() => x, [deps])` | `state(() => x)` |
| `useCallback(fn, [deps])` | Just use `fn` (no wrapper needed) |
| `useEffect(() => {}, [deps])` | `effect(() => {})` |
| `useContext` + `Provider` | `state(value, { key })` for globals |
| React Query | `state(async () => fetch())` |

### From SolidJS to Flexium

| SolidJS | Flexium |
|---------|---------|
| `createSignal(value)` | `state(value)` |
| `createMemo(() => x)` | `state(() => x)` |
| `createResource(fetcher)` | `state(async () => fetcher())` |
| `createStore({})` | `state({})` |
| `createEffect(() => {})` | `effect(() => {})` |

## When to Choose What

### Choose React When:
- You need the largest ecosystem and community
- Your team is already experienced with React
- You need extensive third-party library support
- Long-term stability is critical

### Choose SolidJS When:
- Maximum performance is the priority
- You want React-like syntax with better performance
- You need fine-grained control over primitives
- You're building performance-critical applications

### Choose Flexium When:
- You want the simplest possible API
- Learning curve and onboarding speed matter
- You prefer a unified mental model
- You want fine-grained reactivity without multiple APIs
- Built-in global state and async handling are important

## Summary

| Aspect | Winner | Notes |
|--------|--------|-------|
| **Ecosystem** | React | Unmatched library support |
| **Raw Performance** | SolidJS | ~20% faster than Flexium |
| **API Simplicity** | Flexium | One function for everything |
| **Learning Curve** | Flexium | Minimal concepts to learn |
| **Bundle Size** | SolidJS | Slightly smaller |
| **TypeScript DX** | Flexium | Unified type inference |
| **Global State** | Flexium | Built-in, no setup |
| **Async Data** | Flexium | Built-in, unified API |
| **List Rendering** | Flexium | React syntax (`items.map()`) with SolidJS optimization |

The right choice depends on your priorities. All three frameworks are excellent tools for building modern web applications.
