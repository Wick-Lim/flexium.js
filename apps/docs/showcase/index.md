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

## Real-World Examples

Check out these full applications built with Flexium:

<div class="example-grid">

<a href="https://flexium-js-hackernews.vercel.app/" target="_blank" class="example-card">
  <div class="example-icon">📰</div>
  <div class="example-content">
    <h3>Hacker News</h3>
    <p>Classic Hacker News clone with real-time data fetching and routing.</p>
  </div>
</a>

<a href="https://flexium-js-dashboard.vercel.app/" target="_blank" class="example-card">
  <div class="example-icon">📊</div>
  <div class="example-content">
    <h3>Admin Dashboard</h3>
    <p>Premium dark-themed dashboard with charts and data visualization.</p>
  </div>
</a>

<a href="https://flexium-js-ecommerce.vercel.app/" target="_blank" class="example-card">
  <div class="example-icon">🛍️</div>
  <div class="example-content">
    <h3>E-commerce Store</h3>
    <p>Modern shopping experience with cart management and product filtering.</p>
  </div>
</a>

<a href="https://flexium-js-social-media.vercel.app/" target="_blank" class="example-card">
  <div class="example-icon">📱</div>
  <div class="example-content">
    <h3>Social Media</h3>
    <p>App-like social feed with interactive posts and user profiles.</p>
  </div>
</a>

<a href="https://flexium-js-task-manager.vercel.app/" target="_blank" class="example-card">
  <div class="example-icon">✅</div>
  <div class="example-content">
    <h3>Task Manager</h3>
    <p>Productivity tool with Kanban board and task organization.</p>
  </div>
</a>

</div>

---

<script setup>
import ShowcaseDemo from './components/ShowcaseDemo.vue'
import TodoDemo from './components/TodoDemo.vue'
import CanvasDemo from './components/CanvasDemo.vue'
import TimerDemo from './components/TimerDemo.vue'
import SnakeGameDemo from './components/SnakeGameDemo.vue'
import ContextDemo from './components/ContextDemo.vue'
</script>

---

## Counter Demo

A simple counter demonstrating `useState()` and computed values - the building blocks of Flexium reactivity.

<ClientOnly>
  <ShowcaseDemo />
</ClientOnly>

::: details View Source Code
```tsx
import { useState } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

function Counter() {
  const [count, setCount] = useState(0)
  const [doubled] = useState(() => count * 2)  // derived value

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

<ClientOnly>
  <TodoDemo />
</ClientOnly>

::: details View Source Code
```tsx
import { useState } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Flexium', done: true },
    { id: 2, text: 'Build something awesome', done: false }
  ])
  const [inputText, setInputText] = useState('')

  const addTodo = () => {
    if (!inputText.trim()) return
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: inputText,
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
          value={inputText}
          oninput={(e) => setInputText(e.target.value)}
          placeholder="Add a new todo..."
        />
        <Pressable onPress={addTodo}>
          <Text>Add</Text>
        </Pressable>
      </Row>

      {todos.map(todo => (
        <Row key={todo.id} gap={8} style={{ alignItems: 'center' }}>
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
      ))}
    </Column>
  )
}
```
:::

---

## Stopwatch Demo

A precise stopwatch with lap recording. Demonstrates timer-based state updates and list management.

<ClientOnly>
  <TimerDemo />
</ClientOnly>

::: details View Source Code
```tsx
import { useState, useEffect } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

function Stopwatch() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState([])

  // Format time display
  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    const ms = Math.floor((s % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  let intervalId
  const startStop = () => {
    if (isRunning) {
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
        {formatTime(seconds)}
      </Text>

      <Row gap={8}>
        <Pressable onPress={startStop}>
          <Text style={{ background: isRunning ? 'red' : 'green' }}>
            {isRunning ? 'Stop' : 'Start'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setLaps(prev => [seconds, ...prev])}>
          <Text>Lap</Text>
        </Pressable>
        <Pressable onPress={() => { setSeconds(0); setLaps([]) }}>
          <Text>Reset</Text>
        </Pressable>
      </Row>

      {laps.map((lap, i) => (
        <Text key={i}>Lap {i + 1}: {formatTime(lap)}</Text>
      ))}
    </Column>
  )
}
```
:::

---

## Canvas Animation Demo

Interactive canvas with particle trail effects. Move your mouse to see smooth, reactive canvas rendering.

<ClientOnly>
  <CanvasDemo />
</ClientOnly>

::: details View Source Code
```tsx
import { useState, useEffect } from 'flexium/core'
import { Canvas, DrawCircle } from 'flexium/canvas'

function ParticleCanvas() {
  const [mouseX, setMouseX] = useState(150)
  const [mouseY, setMouseY] = useState(150)
  const [hue, setHue] = useState(0)
  const [particles, setParticles] = useState([])

  // Animate hue
  useEffect(() => {
    const id = setInterval(() => setHue(h => (h + 1) % 360), 16)
    return () => clearInterval(id)
  })

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMouseX(x)
    setMouseY(y)
    setParticles(prev => [...prev.slice(-20), { x, y, hue: hue }])
  }

  return (
    <Canvas
      width={300}
      height={300}
      onmousemove={handleMouseMove}
      style={{ background: '#1a1a2e', cursor: 'crosshair' }}
    >
      {/* Particle trail */}
      {particles.map((p, i) => (
        <DrawCircle
          key={i}
          x={p.x}
          y={p.y}
          radius={10 * ((i + 1) / particles.length)}
          fill={`hsla(${p.hue}, 70%, 60%, ${(i + 1) / particles.length})`}
        />
      ))}

      {/* Main cursor circle */}
      <DrawCircle
        x={mouseX}
        y={mouseY}
        radius={20}
        fill={() => `hsl(${hue}, 70%, 60%)`}
      />
    </Canvas>
  )
}
```
:::

---

## Snake Game Demo

A complete game built with Flexium's game module. Use arrow keys or WASD to control the snake!

<ClientOnly>
  <SnakeGameDemo />
</ClientOnly>

::: details View Source Code
```tsx
import { useState, useEffect } from 'flexium/core'
import { mount } from 'flexium/dom'
import { Canvas, DrawRect } from 'flexium/canvas'
import { keyboard, useLoop, Keys } from 'flexium/interactive'

const [snake, setSnake] = useState([{ x: 7, y: 7 }])
const [direction, setDirection] = useState('RIGHT')
const [food, setFood] = useState({ x: 12, y: 7 })
const [score, setScore] = useState(0)

function SnakeGame() {
  const kb = keyboard()

  const gameLoop = useLoop({
    onUpdate: (delta) => {
      // Handle input and move snake
      moveSnake()
    }
  })

  useEffect(() => {
    gameLoop.start()
    return () => gameLoop.stop()
  })

  return (
    <Canvas width={300} height={300}>
      {/* Render food */}
      <DrawRect x={food().x * 20} y={food().y * 20}
                width={20} height={20} fill="#e74c3c" />

      {/* Render snake */}
      {snake().map((segment, i) => (
        <DrawRect x={segment.x * 20} y={segment.y * 20}
                  width={20} height={20} fill={i === 0 ? '#27ae60' : '#2ecc71'} />
      ))}
    </Canvas>
  )
}
```
:::

---

## Context API Demo

Authentication, shopping cart, and notifications with multiple providers working together.

<ClientOnly>
  <ContextDemo />
</ClientOnly>

::: details View Source Code
```tsx
import { useState } from 'flexium/core'

// Auth state - shared globally
function useAuth() {
  const [user, setUser] = useState(null, { key: ['app', 'auth', 'user'] })
  
  const login = (name: string) => {
    setUser({ name })
  }
  
  const logout = () => {
    setUser(null)
  }
  
  return { user, login, logout }
}

// Cart state - shared globally
function useCart() {
  const items = useState<Array<{id: number, name: string, price: number, qty: number}>>([], { key: ['app', 'cart', 'items'] })
  
  const addItem = (product: {id: number, name: string, price: number}) => {
    setItems(items => {
      const existing = items.find(item => item.id === product.id)
      if (existing) {
        return items.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item)
      }
      return [...items, {...product, qty: 1}]
    })
  }
  
  const removeItem = (id: number) => {
    setItems(items => items.filter(item => item.id !== id))
  }
  
  const updateQty = (id: number, delta: number) => {
    setItems(items => items.map(item => item.id === id ? {...item, qty: item.qty + delta} : item))
  }
  
  const [total] = useState(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), { key: ['app', 'cart', 'total'] })
  
  return { items, addItem, removeItem, updateQty, total }
}

// Notification state - shared globally
function useNotifications() {
  const notifications = useState<Array<{msg: string, type: string}>>([], { key: ['app', 'notifications'] })
  
  const notify = (msg: string, type: string) => {
    setNotifications(n => [...n, { msg, type }])
    setTimeout(() => {
      setNotifications(n => n.slice(1))
    }, 3000)
  }
  
  return { notifications, notify }
}

function App() {
  return <Shop />
}

function Shop() {
  const { user, login, logout } = useAuth()
  const { items, addItem, total } = useCart()
  const { notify } = useNotifications()

  const products = [
    { id: 1, name: 'Flexium Pro', price: 99 },
    { id: 2, name: 'Signal Pack', price: 49 }
  ]

  return (
    <div>
      {user() ? (
        <button onclick={logout}>Logout</button>
      ) : (
        <button onclick={() => login('Alice')}>Login</button>
      )}

      {products.map(product => (
        <button
          key={product.id}
          onclick={() => {
            addItem(product)
            notify(`Added ${product.name}`, 'success')
          }}
          disabled={!user()}
        >
          Add {product.name} - ${product.price}
        </button>
      ))}

      <div>Cart Total: ${total()}</div>
    </div>
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
| Bundle Size | ~10KB | 30-100KB+ |

### Framework Interop

All these Flexium demos are actually running inside Vue components (VitePress)! Flexium's minimal footprint and DOM-based approach makes it easy to embed in any environment.

---

## Explore the Docs

Each documentation page now includes live demos. Here are some highlights:

<div class="example-grid">

<a href="/docs/router/routes" class="example-card">
  <div class="example-icon">🧭</div>
  <div class="example-content">
    <h3>Router</h3>
    <p>Full SPA with nested routes, dynamic params, and programmatic navigation</p>
  </div>
</a>

<a href="/docs/core/state" class="example-card">
  <div class="example-icon">⚡</div>
  <div class="example-content">
    <h3>Async State</h3>
    <p>Data fetching with loading states using useState(async)</p>
  </div>
</a>

<a href="/docs/primitives/list" class="example-card">
  <div class="example-icon">📜</div>
  <div class="example-content">
    <h3>List</h3>
    <p>Efficiently render 100,000+ items with smooth virtualization</p>
  </div>
</a>

<a href="/docs/interactive/loop" class="example-card">
  <div class="example-icon">🎮</div>
  <div class="example-content">
    <h3>Interactive Apps</h3>
    <p>Build games with animation loops, keyboard, and mouse input</p>
  </div>
</a>

</div>

<style>
.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.example-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.example-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.example-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.example-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.example-content p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>

---

## Build Your Own

Ready to create something? Browse the [API Docs](/docs/core/state) with live demos on every page, or dive into the [Quick Start](/guide/quick-start) guide to begin building.
