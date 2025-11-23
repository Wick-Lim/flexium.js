---
layout: home

hero:
  name: Flexium
  text: Signal-Based Reactive UI
  tagline: A lightweight framework for building cross-platform UIs with fine-grained reactivity
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
    title: Fine-Grained Reactivity
    details: Signal-based reactivity system for precise, efficient updates without virtual DOM overhead
  - icon: 🎨
    title: Cross-Platform
    details: Write once, run everywhere. Universal primitives work on web and React Native
  - icon: 🎯
    title: TypeScript First
    details: Built with TypeScript for superior type safety and developer experience
  - icon: 📦
    title: Lightweight
    details: Minimal bundle size with tree-shakeable exports. Only ship what you use
  - icon: 🎪
    title: Canvas Support
    details: Declarative JSX-based canvas rendering with reactive signal integration
  - icon: 🚀
    title: Fast Development
    details: Automatic JSX runtime, Vite integration, and instant HMR
---

## Quick Example

```tsx
import { signal, effect } from 'flexium'
import { View, Text, Pressable } from 'flexium'

function Counter() {
  const count = signal(0)

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Count: {count}</Text>
      <Pressable onPress={() => count.value++}>
        <Text>Increment</Text>
      </Pressable>
    </View>
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
