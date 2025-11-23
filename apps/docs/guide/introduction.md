# Introduction

Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `state()`.

## What is Flexium?

Flexium simplifies modern UI development by combining the best ideas from Solid.js (Signals), React (Hooks), and Recoil (Atoms) into a cohesive experience.

### 1. Unified State API

No more `useState`, `useRecoil`, `useQuery` separation. Just `state()`.

```tsx
// Local state
const [count, setCount] = state(0);

// Global state (shared by key)
const [theme, setTheme] = state('light', { key: 'theme' });

// Async Resource (fetching)
const [user] = state(async () => {
  const res = await fetch('/api/user');
  return res.json();
});
```

### 2. Fine-Grained Reactivity

Unlike React's virtual DOM diffing, Flexium uses a signal-based system. Components run once, and only the DOM nodes that depend on changed state are updated.

```tsx
const [count, setCount] = state(0);

// Only this specific text node updates when count changes
<span>{count}</span>
```

### 3. Cross-Platform by Design

Flexium supports multiple renderers, including DOM and Canvas.

```tsx
// Works on Canvas!
<Canvas width={400} height={400}>
  <Circle x={100} y={100} radius={30} fill="blue" />
</Canvas>
```

## Why Flexium?

### Simpler Mental Model

Instead of learning different APIs for different types of state, you learn one: `state()`.

- **Local?** `state(value)`
- **Global?** `state(value, { key })`
- **Computed?** `state(() => value * 2)`
- **Async?** `state(async () => fetch())`

### Performance

| Feature | React | Flexium |
|---------|-------|---------|
| Reactivity | Virtual DOM | Signals |
| Re-renders | Component trees | Individual bindings |
| API Surface | Huge (Hooks, Context, etc.) | Tiny (`state`, `effect`) |

## Next Steps

<div class="tip custom-block">
  <p class="custom-block-title">Ready to start?</p>
  <p>Follow the <a href="/guide/quick-start">Quick Start</a> guide to build your first Flexium app.</p>
</div>