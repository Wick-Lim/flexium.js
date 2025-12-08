# Flexium Philosophy

## The Problem

Modern JavaScript development is fragmented. To build a simple app, you need:

- React (or Vue, Svelte, etc.) for components
- useState for local state
- Recoil/Jotai/Zustand for global state
- React Query/SWR for data fetching
- Redux Toolkit Query for API caching

This is insanity.

A developer must learn 5+ different mental models, 5+ different APIs, and manage 5+ different package dependencies—just to handle "state."

## The Solution

**One function: `state()`**

```javascript
import { state } from 'flexium'

// That's it. One import. One concept.
```

### Local State
```javascript
const [count, setCount] = state(0)
```

### Global State
```javascript
// String key for simple cases
const [theme, setTheme] = state('dark', { key: 'theme' })

// Array key for hierarchical namespacing
const [user] = state(null, { key: ['app', 'user', userId] })
```

### Async Data
```javascript
const [user] = state(async () => fetchUser(id))
```

### Computed Values
```javascript
const [doubled] = state(() => count * 2)
```

Same function. Same mental model. Different capabilities based on what you pass.

## Core Principles

### 1. Unification

> "One API to rule them all"

Every state management solution solves the same fundamental problem: reactive values that trigger UI updates when they change.

Why have 10 different APIs for the same concept?

Flexium unifies:
- Local state (useState equivalent)
- Global state (Recoil atoms equivalent)
- Async resources (React Query equivalent)
- Computed values (selectors equivalent)

Into one `state()` function.

### 2. Simplicity

> "Complexity is the enemy of reliability"

Flexium has no:
- Virtual DOM
- Complex diffing algorithms
- Hooks rules to memorize
- Context API boilerplate
- Provider hierarchies

Just signals. Direct, traceable, debuggable.

When a signal changes, its subscribers update. That's the entire mental model.

### 3. Performance

> "Fast by default, not by optimization"

React re-renders entire component trees. Then you optimize with memo(), useMemo(), useCallback().

Flexium updates only what depends on what changed. No optimization needed. It's just how signals work.

```javascript
const name = signal('John')
const age = signal(30)

// Only this text node updates when name changes
<span>{name.value}</span>

// This doesn't re-run when name changes
<span>{age.value}</span>
```

### 4. Honesty

> "No magic, no surprises"

- No hidden re-renders
- No stale closure traps
- No dependency array footguns
- No rules of hooks

Signals are explicit. You read `.value`, you write `.value`. Dependencies are tracked automatically by what you read.

## What We Don't Do

### No Premature Abstraction

We don't add features "just in case." Every feature must prove its worth.

### No Framework Lock-in

The signal system is pure JavaScript. No JSX required. No build step required for the core.

### No Kitchen Sink

We don't bundle everything. Import what you need:
- `flexium/core` - Signals only
- `flexium/dom` - DOM renderer
- `flexium/primitives` - UI components

### No Backwards Compatibility Hacks

When something is wrong, we fix it. We don't preserve broken behavior for "compatibility."

## Design Decisions

### Why Signals Over Virtual DOM?

Virtual DOM was revolutionary in 2013. It's 2024 now.

| Virtual DOM | Signals |
|------------|---------|
| Diffing cost on every update | Direct updates only |
| Requires optimization (memo, etc.) | Fast by default |
| Complex mental model | Simple mental model |
| Hard to debug | Easy to trace |

### Why One state() Instead of Multiple Hooks?

Learning curve matters. Time spent understanding API differences is time not spent building.

```javascript
// React: 5 different concepts
useState()
useRecoilState()
useQuery()
useMemo()
useCallback()

// Flexium: 1 concept
state()
```

### Why No JSX Requirement?

JSX is convenient, not essential. The `h()` function works without compilation:

```javascript
h('div', { class: 'card' },
  h('h1', null, 'Title'),
  h('p', null, 'Content')
)
```

## The Ideal Flexium Code

```javascript
import { state, effect } from 'flexium'
import { render, Row, Column, Button, Text } from 'flexium/dom'

function App() {
  const [count, setCount] = state(0)
  const [doubled] = state(() => count * 2)

  return (
    <Column gap={16}>
      <Text>Count: {count}</Text>
      <Text>Doubled: {doubled}</Text>
      <Row gap={8}>
        <Button onClick={() => setCount(c => c - 1)}>-</Button>
        <Button onClick={() => setCount(c => c + 1)}>+</Button>
      </Row>
    </Column>
  )
}

render(<App />, document.getElementById('root'))
```

Notice:
- One import path for state
- One import path for rendering
- No providers, no context, no wrappers
- State and UI in one place
- Clear, readable, maintainable

## Summary

| Old Way | Flexium Way |
|---------|-------------|
| Multiple state libraries | One `state()` |
| Virtual DOM diffing | Direct signal updates |
| Optimization required | Fast by default |
| Complex mental model | Simple mental model |
| Provider hierarchies | Flat composition |

Flexium is not just another framework. It's a return to sanity.

**Build apps, not abstractions.**
