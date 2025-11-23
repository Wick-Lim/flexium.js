---
layout: home

hero:
  name: Flexium
  text: Unified State & Reactivity
  tagline: Simpler, Faster, Unified. The next-generation UI framework.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/flexium.js
  image:
    src: /logo.svg
    alt: Flexium

features:
  - icon: ⚡
    title: Unified State API
    details: One function for everything. state() handles local, global, and async state effortlessly.
  - icon: 🎯
    title: Fine-Grained Reactivity
    details: Updates only what changed without Virtual DOM overhead. Optimized for performance.
  - icon: 🎨
    title: Cross-Platform
    details: Write once, run everywhere. Universal primitives for Web and Canvas.
  - icon: 📦
    title: Lightweight
    details: Minimal bundle size (~3KB) with tree-shakeable exports.
  - icon: 🛠
    title: TypeScript First
    details: Built with TypeScript for superior type safety and developer experience.
  - icon: 🚀
    title: Zero-Config JSX
    details: Works out of the box with standard tooling like Vite.
---

## Quick Example

```tsx
import { state } from 'flexium'

function Counter() {
  // Local state with unified API
  const [count, setCount] = state(0)

  return (
    <button onclick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

## Installation

```bash
npm create flexium@latest my-app
cd my-app
npm run dev
```

Or add to existing project:

```bash
npm install flexium
```