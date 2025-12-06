# Flexium Agent Guide

This document helps AI agents understand and contribute to Flexium while maintaining its core philosophy.

## Project Identity

**Flexium** = Signal-based UI framework with unified `state()` API.

**One-liner**: "React's DX + SolidJS's performance + Recoil's atoms - in one `state()` function."

## Core Philosophy

### 1. Unification Over Fragmentation

The JavaScript ecosystem suffers from API fragmentation:
- Local state: `useState`
- Global state: Recoil, Jotai, Zustand
- Async data: SWR, React Query, RTK Query

**Flexium's answer**: One `state()` function for everything.

```javascript
// Local state
const [count, setCount] = state(0)

// Global state (add key)
const [theme, setTheme] = state('light', { key: 'theme' })

// Async resource (pass async function)
const [user] = state(async () => fetch('/api/user').then(r => r.json()))

// Derived/computed (pass sync function)
const [doubled] = state(() => count() * 2)
```

### 2. Simplicity Over Complexity

- No Virtual DOM diffing overhead
- No complex reconciliation algorithms
- Direct DOM updates via signals
- Minimal API surface

### 3. Performance By Default

- Fine-grained reactivity: only what changed updates
- Automatic dependency tracking
- No unnecessary re-renders
- Event delegation for memory efficiency

## Architecture Principles

### Signal System (`/packages/flexium/src/core/`)

The heart of Flexium. Understand these primitives:

- **signal**: Reactive value container
- **computed**: Derived value (memoized)
- **effect**: Side effect runner
- **batch**: Group updates for efficiency

### Renderer Interface

Platform-agnostic design:
- `render(vnode, container)` - Mount to container
- `h(type, props, ...children)` - Create virtual nodes
- Works with DOM, Canvas, or any future target

### Primitives (`/packages/flexium/src/primitives/`)

Pre-built components following Flexbox/CSS Grid patterns:
- Layout: Row, Column, Grid, Stack, Spacer
- Interactive: Button, Pressable, Form
- Display: Text, Image, ScrollView
- Canvas: Rect, Circle, Line, Arc, Path

## Code Patterns to Follow

### 1. Signal Usage

```javascript
// Good: Clear, focused signals
const count = signal(0)
const isLoading = signal(false)

// Bad: Deeply nested state
const state = signal({ user: { profile: { theme: 'dark' } } })
```

### 2. Component Structure

```javascript
function MyComponent(props) {
  // 1. Signals (state)
  const value = signal('')

  // 2. Computed values
  const isEmpty = computed(() => value.value === '')

  // 3. Effects (side effects)
  effect(() => { /* ... */ })

  // 4. Event handlers
  const handleClick = () => { /* ... */ }

  // 5. Return JSX
  return <div>...</div>
}
```

### 3. Cleanup Pattern

Always clean up effects and timers:

```javascript
effect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000)
  return () => clearInterval(interval) // Cleanup
})
```

## What NOT to Do

1. **Don't mutate signal values directly**
   ```javascript
   // Bad
   items.value.push(newItem)

   // Good
   items.value = [...items.value, newItem]
   ```

2. **Don't create signals in loops**
   ```javascript
   // Bad: Creates new signals on every render
   items.map(item => {
     const selected = signal(false)
     return <Item selected={selected} />
   })
   ```

3. **Don't over-engineer**
   - No unnecessary abstractions
   - No premature optimization
   - No features "just in case"

4. **Don't break the API consistency**
   - `state()` is the unified API - keep it unified
   - Avoid adding new top-level APIs unless absolutely necessary

## Testing Standards

- Every feature needs tests
- Test signal behavior, not implementation
- Use `vitest` for testing
- Location: `__tests__/` directories

## Documentation Standards

- Keep docs minimal and focused
- Examples over explanations
- Update docs with code changes

## When Making Changes

1. **Understand the philosophy first** - Read this document
2. **Check existing patterns** - Follow established conventions
3. **Keep it simple** - Minimal changes for maximum impact
4. **Test thoroughly** - No untested code
5. **Consider the API surface** - Every public API is a commitment

## Key Files to Know

| File | Purpose |
|------|---------|
| `/packages/flexium/src/core/signal.ts` | Signal system core |
| `/packages/flexium/src/core/state.ts` | Unified state() API |
| `/packages/flexium/src/dom/` | DOM renderer |
| `/packages/flexium/src/primitives/` | UI components |
| `/apps/docs/` | VitePress documentation site |

## Project Structure

```
flexium.js/
├── packages/
│   └── flexium/          # Main library
│       ├── src/
│       │   ├── core/     # Signals, state, effects
│       │   ├── dom/      # DOM renderer
│       │   └── primitives/
│       │       ├── layout/   # Row, Column, Grid
│       │       ├── ui/       # Button, Text
│       │       └── canvas/   # Canvas primitives
│       └── __tests__/
├── apps/
│   └── docs/             # Documentation site
└── docs/                 # Internal docs (this!)
```

## Remember

Flexium exists because the JavaScript ecosystem became unnecessarily complex. Our job is to make it simple again. Every line of code should serve that mission.

**Simple > Clever**
**Unified > Fragmented**
**Fast > Bloated**
