---
layout: home
title: Flexium - Unified State & Reactivity UI Framework
titleTemplate: false
description: A lightweight, signals-based UI framework with fine-grained reactivity. Unified state API, universal primitives for Web and Canvas.

head:
  - - meta
    - property: og:title
      content: Flexium - Unified State & Reactivity UI Framework
  - - meta
    - property: og:description
      content: A lightweight, signals-based UI framework with fine-grained reactivity. Build cross-platform apps with unified state API.
  - - meta
    - name: twitter:title
      content: Flexium - Unified State & Reactivity UI Framework

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
      link: https://github.com/Wick-Lim/flexium.js
  image:
    src: /logo.svg
    alt: Flexium

features:
  - icon: ⚡
    title: Unified State API
    details: One function for everything. useState() handles local, global, and async state effortlessly.
  - icon: 🎯
    title: Fine-Grained Reactivity
    details: Updates only what changed without Virtual DOM overhead. Optimized for performance.
  - icon: 🎨
    title: Cross-Platform
    details: Universal primitives for Web and Canvas. Native support coming soon.
  - icon: 📦
    title: Lightweight
    details: Minimal bundle size (~10KB) with tree-shakeable exports.
  - icon: 🛠
    title: TypeScript First
    details: Built with TypeScript for superior type safety and developer experience.
  - icon: 🚀
    title: Zero-Config JSX
    details: Works out of the box with standard tooling like Vite.
---

## Quick Example

```tsx
import { useState } from 'flexium/core'

function Counter() {
  const count = useState(0)

  return (
    <button onclick={() => count.set(c => c + 1)}>
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