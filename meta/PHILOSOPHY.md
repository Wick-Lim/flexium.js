# Flexium Philosophy

## The Problem

Modern JavaScript development is fragmented. To build a simple app, you need:

- React (or Vue, Svelte, etc.) for components
- useState for local state
- Recoil/Jotai/Zustand for global state
- React Query/SWR for data fetching
- Canvas libraries for game/visualization
- Separate routing solutions

This is insanity.

A developer must learn 5+ different mental models, 5+ different APIs, and manage 5+ different package dependencies—just to handle "state."

## The Solution

**One function: `use()`**

```javascript
import { use } from 'flexium/core'

// That's it. One import. One concept.
```

### Local State
```javascript
const [count, setCount] = use(0)
```

### Global State
```javascript
// Array key for hierarchical namespacing
const [user] = use(null, { key: ['app', 'user', userId] })
```

### Async Data (Resource)
```javascript
const [user, { loading, error, refetch }] = use(async () => fetchUser(id))
```

### Computed Values
```javascript
const [doubled] = use(() => count * 2, [count])
```

### Side Effects
```javascript
use(({ onCleanup }) => {
  const handler = () => console.log('clicked')
  window.addEventListener('click', handler)
  onCleanup(() => window.removeEventListener('click', handler))
}, [])
```

### Context
```javascript
const [theme] = use(ThemeContext)  // Returns [value, undefined] tuple
```

Same function. Same mental model. Different capabilities based on what you pass.

## Core Principles

### 1. Unification

> "One API to rule them all"

Every state management solution solves the same fundamental problem: reactive values that trigger UI updates when they change.

Why have 10 different APIs for the same concept?

Flexium unifies:
- Local state (React useState equivalent)
- Global state (Recoil atoms equivalent)
- Async resources (React Query equivalent)
- Computed values (useMemo equivalent)
- Side effects (useEffect equivalent)
- Context consumption (useContext equivalent)

Into one `use()` function.

### 2. Simplicity

> "Complexity is the enemy of reliability"

Flexium has no:
- Virtual DOM
- Complex diffing algorithms
- Hooks rules to memorize
- Provider hierarchies (except for explicit Context)

Just Proxy-based reactivity. Direct, traceable, debuggable.

When a reactive property changes, its effects update. That's the entire mental model.

### 3. Performance

> "Fast by default, not by optimization"

React re-renders entire component trees. Then you optimize with memo(), useMemo(), useCallback().

Flexium uses **Fine-grained Reactivity**. Only the specific DOM nodes that depend on changed values update. No optimization needed. It's just how Proxy tracking works.

```javascript
const [name, setName] = use('John')
const [age, setAge] = use(30)

// Only this span updates when name changes
<span>{name}</span>

// This span doesn't re-render when name changes
<span>{age}</span>
```

### 4. Cross-Platform

> "Write once, render anywhere"

Flexium isn't just a DOM framework. It's a reactive core with multiple renderers:

| Module | Purpose |
|--------|---------|
| `flexium/dom` | Web DOM rendering |
| `flexium/server` | Server-side rendering (SSR) |
| `flexium/canvas` | 2D Canvas rendering |
| `flexium/interactive` | Game loop & input handling |

Same `use()`, same components, different targets.

### 5. Honesty

> "No magic, no surprises"

- No hidden re-renders
- No stale closure traps
- No dependency array footguns (deps are explicit, second argument)
- No rules of hooks (call order doesn't matter for `use()`)

Dependencies are tracked automatically by what you access through Proxy.

## What We Don't Do

### No Premature Abstraction

We don't add features "just in case." Every feature must prove its worth.

### No Framework Lock-in

The reactive system is pure JavaScript. No JSX required. No build step required for the core.

```javascript
import { f } from 'flexium/dom'

f('div', { class: 'card' },
  f('h1', null, 'Title'),
  f('p', null, 'Content')
)
```

### No Kitchen Sink

We don't bundle everything. Import what you need:

```javascript
import { use, sync, useRef } from 'flexium/core'     // Core reactivity
import { render } from 'flexium/dom'                  // DOM renderer
import { renderToString } from 'flexium/server'       // SSR
import { Canvas, DrawRect } from 'flexium/canvas'     // Canvas
import { useLoop, keyboard } from 'flexium/interactive' // Game
import { createContext } from 'flexium/advanced'      // Context factory
```

### No Backwards Compatibility Hacks

When something is wrong, we fix it. We don't preserve broken behavior for "compatibility."

## Design Decisions

### Why Proxy Over Virtual DOM?

Virtual DOM was revolutionary in 2013. It's 2024 now.

| Virtual DOM | Proxy Reactivity |
|-------------|------------------|
| Diffing cost on every update | Direct updates only |
| Requires optimization (memo, etc.) | Fast by default |
| Complex mental model | Simple mental model |
| Hard to debug | Easy to trace |

Flexium uses **Proxy-based Fine-grained Reactivity** that tracks exactly which properties are accessed and updates only what's needed.

### Why One use() Instead of Multiple Hooks?

Learning curve matters. Time spent understanding API differences is time not spent building.

```javascript
// React: 5 different concepts
useState()
useRecoilState()
useQuery()
useMemo()
useEffect()
useContext()

// Flexium: 1 concept
use()
```

### Why Multiple Renderers?

The web isn't just DOM. Games need Canvas. Emails need static HTML. Flexium's architecture separates:

1. **Reactive Core** - Pure state management
2. **Renderers** - Platform-specific output

This means you can use the same mental model for a web app, a game, or server-rendered content.

## The Ideal Flexium Code

```javascript
import { use } from 'flexium/core'
import { render } from 'flexium/dom'

function Counter() {
  const [count, setCount] = use(0)

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}

render(Counter, document.getElementById('root'))
```

Notice:
- One import path for state
- One import path for rendering
- No providers, no context wrappers
- State and UI in one place
- Clear, readable, maintainable

## The Ideal Flexium Game

```javascript
import { use } from 'flexium/core'
import { render } from 'flexium/dom'
import { Canvas, DrawRect } from 'flexium/canvas'
import { useLoop, keyboard, Keys } from 'flexium/interactive'

function Game() {
  const [x, setX] = use(100)
  const kb = keyboard()

  const gameLoop = useLoop({
    onUpdate: (delta) => {
      if (kb.isPressed(Keys.ArrowRight)) setX(x => x + 200 * delta)
      if (kb.isPressed(Keys.ArrowLeft)) setX(x => x - 200 * delta)
    }
  })

  use(({ onCleanup }) => {
    gameLoop.start()
    onCleanup(() => gameLoop.stop())
  }, [])

  return (
    <Canvas width={800} height={600}>
      <DrawRect x={x} y={300} width={50} height={50} fill="red" />
    </Canvas>
  )
}
```

Same `use()`. Same patterns. Different output.

## Summary

| Old Way | Flexium Way |
|---------|-------------|
| Multiple state libraries | One `use()` |
| Virtual DOM diffing | Direct Proxy updates |
| Optimization required | Fast by default |
| Complex mental model | Simple mental model |
| DOM only | DOM, Canvas, Server |

Flexium is not just another framework. It's a return to sanity.

**Build apps, not abstractions.**
