---
title: Showcase - Live Flexium Demos
description: Experience Flexium's fine-grained reactivity in action. Interactive live demos running directly in your browser.
head:
  - - meta
    - property: og:title
      content: Flexium Showcase - Live Demos
  - - meta
    - property: og:description
      content: See Flexium in action with interactive live demos. Counter, Todo List, Canvas Animation, Timer, and Theme Switcher.
---

# Flexium Showcase

Experience the power of Flexium's fine-grained reactivity directly in your browser. All demos below are running live, powered by the core `flexium` library.

<script setup>
import ShowcaseDemo from './components/ShowcaseDemo.vue'
import TodoDemo from './components/TodoDemo.vue'
import CanvasDemo from './components/CanvasDemo.vue'
import TimerDemo from './components/TimerDemo.vue'
import ThemeDemo from './components/ThemeDemo.vue'
</script>

---

## Counter Demo

A simple counter demonstrating `state()` and `computed()` - the building blocks of Flexium reactivity.

<ShowcaseDemo />

::: details View Source Code
```javascript
import { state, computed } from 'flexium'
import { h } from 'flexium/dom'

function Counter() {
  const [count, setCount] = state(0)
  const doubled = computed(() => count() * 2)

  return h('div', {}, [
    h('div', {}, ['Count: ', count]),
    h('div', {}, ['Doubled: ', doubled]),
    h('button', { onclick: () => setCount(c => c + 1) }, ['Increment'])
  ])
}
```
:::

---

## Todo List Demo

A fully functional todo list with add, toggle, and delete operations. Shows how Flexium handles list state and dynamic rendering.

<TodoDemo />

::: details View Source Code
```javascript
const [todos, setTodos] = state([
  { id: 1, text: 'Learn Flexium', done: true },
  { id: 2, text: 'Build something awesome', done: false }
])

const addTodo = (text) => {
  setTodos(prev => [...prev, { id: Date.now(), text, done: false }])
}

const toggleTodo = (id) => {
  setTodos(prev => prev.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  ))
}
```
:::

---

## Stopwatch Demo

A precise stopwatch with lap recording. Demonstrates timer-based state updates and list management.

<TimerDemo />

::: details View Source Code
```javascript
const [seconds, setSeconds] = state(0)
const [isRunning, setIsRunning] = state(false)
const [laps, setLaps] = state([])

// Timer with 10ms precision
let intervalId
const startStop = () => {
  if (isRunning()) {
    clearInterval(intervalId)
  } else {
    intervalId = setInterval(() => {
      setSeconds(s => s + 0.01)
    }, 10)
  }
  setIsRunning(r => !r)
}
```
:::

---

## Theme Switcher Demo

Interactive theme customization with dark mode toggle and color picker. Shows reactive style bindings.

<ThemeDemo />

::: details View Source Code
```javascript
const [isDark, setIsDark] = state(false)
const [primaryColor, setPrimaryColor] = state('#4f46e5')

// Reactive styles
h('div', {
  style: () => ({
    background: isDark() ? '#1f2937' : '#f9fafb',
    transition: 'all 0.3s ease'
  })
}, [...])
```
:::

---

## Canvas Animation Demo

Interactive canvas with particle trail effects. Move your mouse to see smooth, reactive canvas rendering.

<CanvasDemo />

::: details View Source Code
```javascript
const [mouseX, setMouseX] = state(150)
const [mouseY, setMouseY] = state(150)
const [particles, setParticles] = state([])

// Canvas with mouse tracking
h('canvas', {
  onmousemove: (e) => {
    const rect = e.target.getBoundingClientRect()
    setMouseX(e.clientX - rect.left)
    setMouseY(e.clientY - rect.top)
    setParticles(prev => [...prev.slice(-20), {
      x: mouseX(), y: mouseY(), hue: hue()
    }])
  }
})
```
:::

---

## Why These Demos Matter

Unlike React or Vue, Flexium **does not use a Virtual DOM** for updates. When you interact with these demos:

1. **Only the changed values update** - The component function does NOT re-run
2. **Direct DOM manipulation** - Signals update the DOM directly via subscriptions
3. **Computed values are cached** - They only recalculate when dependencies change
4. **No diffing overhead** - Updates are surgical and precise

### Performance Characteristics

| Aspect | Flexium | Virtual DOM Frameworks |
|--------|---------|----------------------|
| Update Mechanism | Direct signal subscription | Tree diffing |
| Component Re-renders | Never (after initial) | On every state change |
| Memory | Minimal (no virtual tree) | Maintains virtual tree copy |
| Bundle Size | ~3KB | 30-100KB+ |

### Framework Interop

All these Flexium demos are actually running inside Vue components (VitePress)! Flexium's minimal footprint and DOM-based approach makes it easy to embed in any environment.

---

## Build Your Own

Ready to create something? Check out the [examples](/examples/counter) for more code samples, or dive into the [Quick Start](/guide/quick-start) guide to begin building.
