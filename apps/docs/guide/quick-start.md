# Quick Start

Get up and running with Flexium in under 5 minutes.

## Create a New Project

The fastest way to start is using the official CLI:

```bash
npm create flexium@latest my-app
cd my-app
npm install
npm run dev
```

This scaffolds a new Flexium project with Vite, TypeScript, and a sample app.

## Manual Installation

Add Flexium to an existing Vite project:

```bash
npm install flexium
```

### Configure JSX

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

Or use the automatic runtime in your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium'
  }
})
```

## Your First Component

Create `src/App.tsx`:

```tsx
import { signal } from 'flexium'
import { View, Text, Pressable } from 'flexium'

export function App() {
  const count = signal(0)

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Counter: {count}
      </Text>

      <Pressable
        onPress={() => count.value++}
        style={{
          padding: 10,
          backgroundColor: '#007bff',
          borderRadius: 5
        }}
      >
        <Text style={{ color: 'white' }}>Increment</Text>
      </Pressable>
    </View>
  )
}
```

### Mount to DOM

Create `src/main.tsx`:

```tsx
import { mount } from 'flexium/dom'
import { App } from './App'

mount(document.getElementById('app')!, <App />)
```

## Understanding the Basics

### Signals

Signals are the core reactive primitive:

```tsx
import { signal } from 'flexium'

const count = signal(0)

// Read value
console.log(count.value) // 0

// Update value
count.value++
console.log(count.value) // 1
```

### Computed Values

Derived state that auto-updates:

```tsx
import { signal, computed } from 'flexium'

const count = signal(0)
const doubled = computed(() => count.value * 2)

console.log(doubled.value) // 0
count.value = 5
console.log(doubled.value) // 10 (auto-updated!)
```

### Effects

Run side effects when signals change:

```tsx
import { signal, effect } from 'flexium'

const count = signal(0)

effect(() => {
  console.log(`Count is now: ${count.value}`)
})
// Logs: "Count is now: 0"

count.value = 5
// Logs: "Count is now: 5"
```

## Canvas Example

Flexium makes canvas rendering reactive:

```tsx
import { signal } from 'flexium'
import { Canvas, Circle } from 'flexium'

export function AnimatedCircle() {
  const x = signal(50)

  // Animate
  setInterval(() => {
    x.value = (x.value + 1) % 400
  }, 16)

  return (
    <Canvas width={400} height={400}>
      <Circle x={x} y={200} radius={30} fill="blue" />
    </Canvas>
  )
}
```

## Next Steps

- Learn about [Signals](/guide/signals) in depth
- Explore [Cross-Platform Primitives](/guide/primitives)
- Check out [Canvas Rendering](/guide/canvas)
- Browse [Examples](/examples/counter)

<div class="tip custom-block">
  <p class="custom-block-title">Need Help?</p>
  <p>Join our <a href="https://discord.gg/flexium">Discord</a> or check the <a href="https://github.com/yourusername/flexium.js/discussions">GitHub Discussions</a>.</p>
</div>
