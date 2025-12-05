# JSX Guide for Flexium

Complete guide to using JSX with Flexium's automatic JSX runtime (React 17+ style).

## Table of Contents

- [Quick Start](#quick-start)
- [Automatic vs Manual JSX Runtime](#automatic-vs-manual-jsx-runtime)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Comparison with React](#comparison-with-react)
- [TypeScript Support](#typescript-support)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

---

## Quick Start

### 1. Install Flexium

```bash
npm install flexium
# or
yarn add flexium
# or
pnpm add flexium
```

### 2. Configure TypeScript

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### 3. Write Your Component

```tsx
// No h import needed!
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function Counter() {
  const count = signal(0)

  return (
    <div>
      <h1>Count: {count.value}</h1>
      <button onclick={() => count.value++}>Increment</button>
    </div>
  )
}

render(<Counter />, document.getElementById('app'))
```

### 4. Build and Run

With Vite:
```bash
npm create vite@latest my-flexium-app -- --template vanilla-ts
cd my-flexium-app
npm install flexium
npm run dev
```

---

## Automatic vs Manual JSX Runtime

Flexium supports both automatic and manual JSX runtime styles.

### Automatic JSX Runtime (React 17+) - RECOMMENDED

**What it is:**
The automatic JSX runtime automatically imports the JSX factory functions, so you don't need to import `h` in every file.

**Example:**
```tsx
// ✅ NEW: No h import needed
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function App() {
  return <div>Hello World</div>
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### Manual JSX Runtime (Legacy React)

**What it is:**
The classic JSX runtime where you manually import the `h` function.

**Example:**
```tsx
// ❌ OLD: h import required
import { signal } from 'flexium/core'
import { h, render } from 'flexium/dom'

function App() {
  return <div>Hello World</div>
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h"
  }
}
```

### Why Use Automatic?

1. **Cleaner imports** - No need to import `h` in every file
2. **Modern standard** - Matches React 17+ patterns
3. **Better tree-shaking** - Only imports what's used
4. **Easier migration** - Works just like modern React
5. **Future-proof** - Industry standard going forward

---

## Configuration

### TypeScript Configuration

#### For Automatic JSX Runtime

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

#### For Manual JSX Runtime (Legacy)

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### Vite Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium',
    jsx: 'automatic'
  }
})
```

### Babel Configuration (if not using TypeScript)

**babel.config.js:**
```javascript
module.exports = {
  presets: [
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: 'flexium'
    }]
  ]
}
```

---

## Usage Examples

### Basic Component

```tsx
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function Greeting() {
  const name = signal('World')

  return (
    <div>
      <h1>Hello, {name.value}!</h1>
      <input
        type="text"
        value={name.value}
        oninput={(e) => name.value = e.target.value}
      />
    </div>
  )
}

render(<Greeting />, document.getElementById('app'))
```

### Using Computed Values

```tsx
import { signal, computed } from 'flexium/core'
import { render } from 'flexium/dom'

function Calculator() {
  const a = signal(5)
  const b = signal(3)
  const sum = computed(() => a.value + b.value)

  return (
    <div>
      <input
        type="number"
        value={a.value}
        oninput={(e) => a.value = Number(e.target.value)}
      />
      +
      <input
        type="number"
        value={b.value}
        oninput={(e) => b.value = Number(e.target.value)}
      />
      = {sum.value}
    </div>
  )
}
```

### Lists and Arrays

```tsx
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function TodoList() {
  const todos = signal([
    { id: 1, text: 'Learn Flexium', done: false },
    { id: 2, text: 'Build an app', done: false }
  ])

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  }

  return (
    <ul>
      {todos.value.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  )
}
```

### Conditional Rendering

```tsx
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function LoginForm() {
  const isLoggedIn = signal(false)
  const username = signal('')

  return (
    <div>
      {isLoggedIn.value ? (
        <div>
          <h1>Welcome, {username.value}!</h1>
          <button onclick={() => isLoggedIn.value = false}>Logout</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Username"
            oninput={(e) => username.value = e.target.value}
          />
          <button onclick={() => isLoggedIn.value = true}>Login</button>
        </div>
      )}
    </div>
  )
}
```

### Using Fragments

```tsx
import { Fragment } from 'flexium/dom'

function MultipleElements() {
  return (
    <Fragment>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </Fragment>
  )
}

// Or use short syntax (if configured)
function MultipleElements2() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  )
}
```

### Component Composition

```tsx
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function Button({ children, onclick }) {
  return (
    <button
      onclick={onclick}
      style={{
        padding: '8px 16px',
        borderRadius: '4px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
}

function Card({ title, children }) {
  return (
    <div style={{
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  )
}

function App() {
  const count = signal(0)

  return (
    <div>
      <Card title="Counter Demo">
        <p>Count: {count.value}</p>
        <Button onclick={() => count.value++}>
          Increment
        </Button>
      </Card>
    </div>
  )
}
```

---

## Comparison with React

Flexium's JSX is very similar to React, but with key differences:

### Similarities

1. **JSX Syntax** - Same XML-like syntax
2. **Component Functions** - Write components as functions
3. **Props** - Pass data via props
4. **Automatic Runtime** - Same React 17+ automatic JSX
5. **TypeScript Support** - Full type safety

### Differences

| Feature | React | Flexium |
|---------|-------|---------|
| State | `useState` hook | `signal()` function |
| Computed | `useMemo` hook | `computed()` function |
| Effects | `useEffect` hook | `effect()` function |
| Re-rendering | Virtual DOM diffing | Fine-grained reactivity |
| Event handlers | `onClick` (camelCase) | `onclick` (lowercase) |
| Class attribute | `className` | `class` |
| Dependencies | Need dependency arrays | Automatic tracking |
| Batching | Automatic in React 18 | `batch()` function |

### Side-by-Side Examples

#### State Management

**React:**
```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**Flexium:**
```tsx
import { signal } from 'flexium/core'

function Counter() {
  const count = signal(0)

  return (
    <div>
      <p>{count.value}</p>
      <button onclick={() => count.value++}>+</button>
    </div>
  )
}
```

#### Computed Values

**React:**
```tsx
import { useState, useMemo } from 'react'

function Calculator() {
  const [a, setA] = useState(5)
  const [b, setB] = useState(3)
  const sum = useMemo(() => a + b, [a, b])  // Need deps!

  return <div>{sum}</div>
}
```

**Flexium:**
```tsx
import { signal, computed } from 'flexium/core'

function Calculator() {
  const a = signal(5)
  const b = signal(3)
  const sum = computed(() => a.value + b.value)  // Auto-tracked!

  return <div>{sum.value}</div>
}
```

#### Effects

**React:**
```tsx
import { useState, useEffect } from 'react'

function Logger() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('Count changed:', count)
  }, [count])  // Need deps!

  return <button onClick={() => setCount(count + 1)}>Click</button>
}
```

**Flexium:**
```tsx
import { signal, effect } from 'flexium/core'

function Logger() {
  const count = signal(0)

  effect(() => {
    console.log('Count changed:', count.value)  // Auto-tracked!
  })

  return <button onclick={() => count.value++}>Click</button>
}
```

---

## TypeScript Support

Flexium has full TypeScript support for JSX.

### Typing Props

```tsx
interface ButtonProps {
  children: any
  onclick?: () => void
  disabled?: boolean
}

function Button({ children, onclick, disabled }: ButtonProps) {
  return (
    <button
      onclick={onclick}
      disabled={disabled}
      style={{ padding: '8px 16px' }}
    >
      {children}
    </button>
  )
}
```

### Typing Signals

```tsx
import { signal, Signal } from 'flexium/core'

interface Todo {
  id: number
  text: string
  done: boolean
}

function TodoApp() {
  const todos = signal<Todo[]>([])
  const filter = signal<'all' | 'active' | 'completed'>('all')

  return <div>...</div>
}
```

### Typing Event Handlers

```tsx
function Form() {
  const email = signal('')

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    console.log('Email:', email.value)
  }

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    email.value = target.value
  }

  return (
    <form onsubmit={handleSubmit}>
      <input type="email" oninput={handleInput} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### JSX IntrinsicElements

Flexium provides type definitions for all HTML elements:

```tsx
// All HTML attributes are typed
const div: JSX.Element = (
  <div
    id="app"
    className="container"
    style={{ color: 'red' }}
    onclick={() => console.log('clicked')}
  >
    Hello
  </div>
)
```

---

## Troubleshooting

### "Cannot find module 'flexium/jsx-runtime'"

**Problem:** TypeScript can't find the automatic JSX runtime.

**Solutions:**
1. Make sure you've built the library: `npm run build`
2. Check that `dist/jsx-runtime.mjs` exists
3. Verify `package.json` has correct exports:
   ```json
   {
     "exports": {
       "./jsx-runtime": "./dist/jsx-runtime.mjs"
     }
   }
   ```

### JSX is not being transformed

**Problem:** JSX syntax errors or not being compiled.

**Solutions:**
1. Ensure file extension is `.tsx` (not `.ts`)
2. Check `tsconfig.json` has correct JSX settings:
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",
       "jsxImportSource": "flexium"
     }
   }
   ```
3. If using Vite, check `vite.config.ts` has esbuild JSX config

### "h is not defined"

**Problem:** You're using automatic JSX runtime but code still references `h`.

**Solutions:**
1. Remove any `import { h } from 'flexium/dom'` statements
2. Make sure `tsconfig.json` uses `"jsx": "react-jsx"` (not `"jsx": "react"`)
3. Clear build cache and rebuild: `rm -rf node_modules/.vite && npm run dev`

### Reactivity not working

**Problem:** UI doesn't update when signals change.

**Solutions:**
1. Make sure you're accessing `.value` property:
   ```tsx
   // ✅ Correct
   <div>{count.value}</div>

   // ❌ Wrong
   <div>{count}</div>
   ```
2. For objects/arrays, create new reference:
   ```tsx
   // ✅ Correct
   todos.value = [...todos.value, newTodo]

   // ❌ Wrong (mutates in place)
   todos.value.push(newTodo)
   ```

### Type errors with JSX

**Problem:** TypeScript shows errors for valid JSX.

**Solutions:**
1. Make sure you have `@types/react` installed (for JSX namespace):
   ```bash
   npm install -D @types/react
   ```
2. Or define JSX namespace yourself in a `.d.ts` file:
   ```typescript
   declare namespace JSX {
     interface IntrinsicElements {
       [elemName: string]: any
     }
   }
   ```

---

## Migration Guide

### From Manual to Automatic JSX Runtime

**Before:**
```tsx
import { signal } from 'flexium/core'
import { h, render, Fragment } from 'flexium/dom'

function App() {
  return <div>Hello</div>
}
```

**After:**
```tsx
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'
// Note: Fragment still needs to be imported if used
import { Fragment } from 'flexium/dom'

function App() {
  return <div>Hello</div>
}
```

**Steps:**
1. Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",  // was "react"
       "jsxImportSource": "flexium"  // new line
     }
   }
   ```
2. Remove `h` imports from all files
3. Keep `Fragment` imports where needed
4. Rebuild and test

### From React to Flexium

**React Code:**
```tsx
import { useState, useEffect, useMemo } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() =>
    todos.filter(t => filter === 'all' || t.status === filter),
    [todos, filter]
  )

  useEffect(() => {
    console.log('Todos changed:', todos)
  }, [todos])

  return (
    <div className="app">
      {filtered.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  )
}
```

**Flexium Code:**
```tsx
import { signal, computed, effect } from 'flexium/core'
import { render } from 'flexium/dom'

function TodoApp() {
  const todos = signal([])
  const filter = signal('all')

  const filtered = computed(() =>
    todos.value.filter(t => filter.value === 'all' || t.status === filter.value)
  )

  effect(() => {
    console.log('Todos changed:', todos.value)
  })

  return (
    <div class="app">
      {filtered.value.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  )
}
```

**Key Changes:**
1. `useState` → `signal()`
2. `useMemo` → `computed()`
3. `useEffect` → `effect()` (no dependencies needed!)
4. `className` → `class`
5. `onClick` → `onclick` (lowercase)
6. Access with `.value`
7. Update with direct assignment: `count.value++`

---

## Best Practices

### 1. Use Automatic JSX Runtime

Always use automatic JSX runtime for cleaner code:

```tsx
// ✅ Good
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

// ❌ Avoid
import { signal } from 'flexium/core'
import { h, render } from 'flexium/dom'
```

### 2. Use TypeScript

Get full type safety and autocomplete:

```tsx
interface User {
  id: number
  name: string
}

const user = signal<User | null>(null)
```

### 3. Computed for Derived State

Don't recalculate in render:

```tsx
// ✅ Good
const doubled = computed(() => count.value * 2)
return <div>{doubled.value}</div>

// ❌ Bad (recalculates on every access)
return <div>{count.value * 2}</div>
```

### 4. Extract Components

Keep components small and reusable:

```tsx
// ✅ Good
function Button({ children, onclick }) {
  return <button onclick={onclick}>{children}</button>
}

function App() {
  return <Button onclick={() => alert('hi')}>Click me</Button>
}
```

### 5. Use Keys for Lists

Always use keys for dynamic lists:

```tsx
// ✅ Good
{items.value.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// ❌ Bad (can cause issues with updates)
{items.value.map(item => (
  <div>{item.name}</div>
))}
```

---

## Additional Resources

- [Flexium API Documentation](/docs/API.md)
- [Migration from React Guide](/docs/MIGRATION.md)
- [H Function Guide](/docs/H_FUNCTION_GUIDE.md) (manual JSX alternative)
- [Automatic Reactivity Guide](/docs/AUTOMATIC_REACTIVITY.md)
- [Examples](/examples/README.md)

---

## Summary

Flexium's automatic JSX runtime provides a modern, clean developer experience:

- **No `h` imports** - Just write JSX
- **React 17+ compatible** - Easy migration
- **Full TypeScript support** - Complete type safety
- **Fine-grained reactivity** - No Virtual DOM overhead
- **Simple configuration** - Works with Vite/TypeScript out of the box

Start building with JSX today and enjoy Flexium's powerful signal-based reactivity with React-like syntax!
