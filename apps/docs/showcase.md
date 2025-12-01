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
```tsx
import { state, computed } from 'flexium'

function Counter() {
  const [count, setCount] = state(0)
  const doubled = computed(() => count() * 2)

  return (
    <Column gap={16} padding={24}>
      <Text style={{ fontSize: '72px', fontWeight: 'bold' }}>
        {count}
      </Text>
      <Text>Doubled: {doubled}</Text>
      <Row gap={12}>
        <Pressable onPress={() => setCount(c => c - 1)}>
          <Text style={buttonStyle}>- Decrement</Text>
        </Pressable>
        <Pressable onPress={() => setCount(0)}>
          <Text style={buttonStyle}>Reset</Text>
        </Pressable>
        <Pressable onPress={() => setCount(c => c + 1)}>
          <Text style={buttonStyle}>+ Increment</Text>
        </Pressable>
      </Row>
    </Column>
  )
}
```
:::

---

## Todo List Demo

A fully functional todo list with add, toggle, and delete operations. Shows how Flexium handles list state and dynamic rendering.

<TodoDemo />

::: details View Source Code
```tsx
import { state, For } from 'flexium'

function TodoApp() {
  const [todos, setTodos] = state([
    { id: 1, text: 'Learn Flexium', done: true },
    { id: 2, text: 'Build something awesome', done: false }
  ])
  const [inputText, setInputText] = state('')

  const addTodo = () => {
    if (!inputText().trim()) return
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: inputText(),
      done: false
    }])
    setInputText('')
  }

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ))
  }

  return (
    <Column gap={16}>
      <Row gap={8}>
        <input
          value={inputText()}
          oninput={(e) => setInputText(e.target.value)}
          placeholder="Add a new todo..."
        />
        <Pressable onPress={addTodo}>
          <Text>Add</Text>
        </Pressable>
      </Row>

      <For each={todos}>
        {(todo) => (
          <Row gap={8} style={{ alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={() => toggleTodo(todo.id)}
            />
            <Text style={{
              textDecoration: todo.done ? 'line-through' : 'none'
            }}>
              {todo.text}
            </Text>
          </Row>
        )}
      </For>
    </Column>
  )
}
```
:::

---

## Stopwatch Demo

A precise stopwatch with lap recording. Demonstrates timer-based state updates and list management.

<TimerDemo />

::: details View Source Code
```tsx
import { state, effect } from 'flexium'

function Stopwatch() {
  const [seconds, setSeconds] = state(0)
  const [isRunning, setIsRunning] = state(false)
  const [laps, setLaps] = state([])

  // Format time display
  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    const ms = Math.floor((s % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  let intervalId
  const startStop = () => {
    if (isRunning()) {
      clearInterval(intervalId)
      setIsRunning(false)
    } else {
      setIsRunning(true)
      intervalId = setInterval(() => {
        setSeconds(s => s + 0.01)
      }, 10)
    }
  }

  return (
    <Column gap={16}>
      <Text style={{ fontSize: '48px', fontFamily: 'monospace' }}>
        {() => formatTime(seconds())}
      </Text>

      <Row gap={8}>
        <Pressable onPress={startStop}>
          <Text style={{ background: isRunning() ? 'red' : 'green' }}>
            {isRunning() ? 'Stop' : 'Start'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setLaps(prev => [seconds(), ...prev])}>
          <Text>Lap</Text>
        </Pressable>
        <Pressable onPress={() => { setSeconds(0); setLaps([]) }}>
          <Text>Reset</Text>
        </Pressable>
      </Row>

      <For each={laps}>
        {(lap, i) => <Text>Lap {i + 1}: {formatTime(lap)}</Text>}
      </For>
    </Column>
  )
}
```
:::

---

## Theme Switcher Demo

Interactive theme customization with dark mode toggle and color picker. Shows reactive style bindings.

<ThemeDemo />

::: details View Source Code
```tsx
import { state } from 'flexium'

function ThemeSwitcher() {
  const [isDark, setIsDark] = state(false)
  const [primaryColor, setPrimaryColor] = state('#4f46e5')

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <Column
      gap={20}
      style={() => ({
        background: isDark() ? '#1f2937' : '#f9fafb',
        padding: '24px',
        transition: 'all 0.3s ease'
      })}
    >
      {/* Dark mode toggle */}
      <Row gap={12} style={{ alignItems: 'center' }}>
        <Text style={() => ({ color: isDark() ? '#fff' : '#333' })}>
          Dark Mode
        </Text>
        <Pressable onPress={() => setIsDark(d => !d)}>
          <div style={() => ({
            width: '56px',
            height: '28px',
            borderRadius: '14px',
            background: isDark() ? primaryColor() : '#d1d5db'
          })} />
        </Pressable>
      </Row>

      {/* Color picker */}
      <Row gap={8}>
        {colors.map(color => (
          <Pressable onPress={() => setPrimaryColor(color)}>
            <div style={{
              width: '36px',
              height: '36px',
              background: color,
              borderRadius: '8px',
              border: primaryColor() === color ? '3px solid white' : 'none'
            }} />
          </Pressable>
        ))}
      </Row>

      {/* Preview */}
      <Pressable>
        <Text style={() => ({
          background: primaryColor(),
          color: 'white',
          padding: '12px 24px'
        })}>
          Preview Button
        </Text>
      </Pressable>
    </Column>
  )
}
```
:::

---

## Canvas Animation Demo

Interactive canvas with particle trail effects. Move your mouse to see smooth, reactive canvas rendering.

<CanvasDemo />

::: details View Source Code
```tsx
import { state, effect } from 'flexium'
import { Canvas, Circle } from 'flexium'

function ParticleCanvas() {
  const [mouseX, setMouseX] = state(150)
  const [mouseY, setMouseY] = state(150)
  const [hue, setHue] = state(0)
  const [particles, setParticles] = state([])

  // Animate hue
  effect(() => {
    const id = setInterval(() => setHue(h => (h + 1) % 360), 16)
    return () => clearInterval(id)
  })

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMouseX(x)
    setMouseY(y)
    setParticles(prev => [...prev.slice(-20), { x, y, hue: hue() }])
  }

  return (
    <Canvas
      width={300}
      height={300}
      onmousemove={handleMouseMove}
      style={{ background: '#1a1a2e', cursor: 'crosshair' }}
    >
      {/* Particle trail */}
      <For each={particles}>
        {(p, i) => (
          <Circle
            x={p.x}
            y={p.y}
            radius={10 * ((i + 1) / particles().length)}
            fill={`hsla(${p.hue}, 70%, 60%, ${(i + 1) / particles().length})`}
          />
        )}
      </For>

      {/* Main cursor circle */}
      <Circle
        x={mouseX}
        y={mouseY}
        radius={20}
        fill={() => `hsl(${hue()}, 70%, 60%)`}
      />
    </Canvas>
  )
}
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
