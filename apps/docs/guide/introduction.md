# Introduction

Flexium is a modern UI framework that combines the best ideas from Solid.js, Vue 3, and React Native into a unified, lightweight package.

## What is Flexium?

Flexium is built on three core principles:

### 1. Fine-Grained Reactivity

Unlike React's virtual DOM diffing, Flexium uses signals for surgical updates. When a value changes, only the exact DOM nodes that depend on it are updated.

```tsx
const count = signal(0)

// Only this specific text node updates when count changes
<span>{count}</span>
```

### 2. Cross-Platform by Design

Write your UI once using universal primitives:

```tsx
<View style={{ flex: 1, padding: 20 }}>
  <Text style={{ fontSize: 24 }}>Hello World</Text>
  <Image src="/logo.png" />
</View>
```

This code works identically on:
- Web (compiles to `<div>`, `<span>`, `<img>`)
- React Native (compiles to `<View>`, `<Text>`, `<Image>`)

### 3. Canvas as a First-Class Citizen

Declarative canvas rendering with reactive updates:

```tsx
const x = signal(50)

effect(() => {
  // Canvas auto-updates when x changes
})

<Canvas width={400} height={400}>
  <Circle x={x} y={100} radius={30} fill="blue" />
</Canvas>
```

## Why Flexium?

### Compared to React

| Feature | React | Flexium |
|---------|-------|---------|
| Reactivity | Virtual DOM | Signals |
| Re-renders | Component trees | Individual bindings |
| Bundle size | ~45KB | ~3KB |
| Learning curve | Hooks + effects | Signals |

### Compared to Solid.js

| Feature | Solid | Flexium |
|---------|-------|---------|
| Reactivity | Signals ✓ | Signals ✓ |
| Canvas | Manual | Built-in JSX |
| Cross-platform | Web only | Web + Mobile |
| TypeScript | Good | Excellent |

### Compared to Vue 3

| Feature | Vue 3 | Flexium |
|---------|-------|---------|
| Reactivity | Proxy-based | Signal-based |
| Template syntax | SFC | JSX |
| Mobile | Via adapters | Native |
| Size | ~40KB | ~3KB |

## When to Use Flexium

Flexium is ideal for:

- ✅ High-performance web apps
- ✅ Cross-platform mobile apps
- ✅ Data visualization with canvas
- ✅ Real-time interactive UIs
- ✅ Lightweight embedded widgets

Consider alternatives if:

- ❌ You need a massive ecosystem (use React)
- ❌ You're maintaining legacy code
- ❌ Your team is unfamiliar with signals

## Next Steps

<div class="tip custom-block">
  <p class="custom-block-title">Ready to start?</p>
  <p>Follow the <a href="/guide/quick-start">Quick Start</a> guide to build your first Flexium app in under 5 minutes.</p>
</div>
