# Getting Started with Flexium

A comprehensive guide to installing, configuring, and building your first Flexium application.

## Table of Contents

- [Installation](#installation)
- [Project Setup](#project-setup)
- [Your First Component](#your-first-component)
- [Core Concepts](#core-concepts)
- [Common Patterns](#common-patterns)
- [Next Steps](#next-steps)

---

## Installation

### npm, yarn, or pnpm

```bash
# Using npm
npm install flexium

# Using yarn
yarn add flexium

# Using pnpm
pnpm add flexium
```

### CDN (for quick prototyping)

```html
<!-- Not recommended for production -->
<script type="module">
  import { signal, computed, effect } from 'https://esm.sh/flexium/core'
  import { render } from 'https://esm.sh/flexium/dom'

  // Your code here
</script>
```

### Development Dependencies

For TypeScript and JSX support, install these dev dependencies:

```bash
npm install -D typescript
```

---

## Project Setup

### Option 1: Manual Setup (Recommended for Learning)

**1. Create project structure:**

```bash
mkdir my-flexium-app
cd my-flexium-app
npm init -y
```

**2. Install Flexium:**

```bash
npm install flexium
npm install -D typescript
```

**3. Create `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**4. Update `package.json`:**

```json
{
  "name": "my-flexium-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "flexium": "^0.4.2"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**5. Create project structure:**

```
my-flexium-app/
├── src/
│   └── app.tsx
├── index.html
├── package.json
└── tsconfig.json
```

---

### Option 2: Using Vite (Recommended for Production)

**1. Create Vite project:**

```bash
npm create vite@latest my-flexium-app -- --template vanilla-ts
cd my-flexium-app
```

**2. Install Flexium:**

```bash
npm install flexium
```

**3. Update `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* JSX for Flexium */
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**4. Start development:**

```bash
npm run dev
```

Vite provides:
- Hot module replacement (HMR)
- Fast build times
- Production optimization
- Development server

---

## Your First Component

### Basic Counter (TypeScript + JSX)

Create `src/app.tsx`:

```tsx
import { signal, computed } from 'flexium/core'
import { render } from 'flexium/dom'

// Create reactive state
const count = signal(0)

// Derived value (auto-updates)
const doubled = computed(() => count.value * 2)
const isEven = computed(() => count.value % 2 === 0)

// Build the UI
function Counter() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center'
    }}>
      <h1>Flexium Counter</h1>

      <div style={{
        fontSize: '64px',
        fontWeight: 'bold',
        margin: '20px 0',
        color: isEven.value ? '#10b981' : '#ef4444'
      }}>
        {count}
      </div>

      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Doubled: {doubled}
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onclick={() => count.value--}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Decrement
        </button>

        <button
          onclick={() => count.value = 0}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Reset
        </button>

        <button
          onclick={() => count.value++}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Increment
        </button>
      </div>
    </div>
  )
}

// Render to DOM
render(<Counter />, document.getElementById('root')!)
```

### HTML File

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexium App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #root {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      min-width: 400px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./dist/app.js"></script>
</body>
</html>
```

### Build and Run

```bash
# Build
npm run build

# Start server
python3 -m http.server 8000
# OR
npx http-server -p 8000

# Open browser
open http://localhost:8000
```

---

## Core Concepts

### 1. Signals - Reactive State

Signals are the foundation of Flexium's reactivity system.

```tsx
import { signal } from 'flexium/core'

// Create a signal
const count = signal(0)

// Read value
console.log(count.value) // 0

// Update value (triggers reactive updates)
count.value = 5
count.value++
count.value += 10
```

**With Objects:**

```tsx
const user = signal({
  name: 'Alice',
  age: 25
})

// Update (create new object)
user.value = {
  ...user.value,
  age: 26
}
```

**With Arrays:**

```tsx
const todos = signal<string[]>([])

// Add item
todos.value = [...todos.value, 'New todo']

// Remove item
todos.value = todos.value.filter(t => t !== 'Remove this')

// Update item
todos.value = todos.value.map(t =>
  t === 'Old' ? 'New' : t
)
```

---

### 2. Computed - Derived Values

Computed values automatically recalculate when their dependencies change.

```tsx
import { signal, computed } from 'flexium/core'

const firstName = signal('John')
const lastName = signal('Doe')

// Auto-updates when firstName or lastName change
const fullName = computed(() =>
  `${firstName.value} ${lastName.value}`
)

console.log(fullName.value) // "John Doe"

firstName.value = 'Jane'
console.log(fullName.value) // "Jane Doe"
```

**Complex Example:**

```tsx
const todos = signal<Todo[]>([
  { id: 1, text: 'Learn Flexium', done: false },
  { id: 2, text: 'Build app', done: true }
])

const activeTodos = computed(() =>
  todos.value.filter(t => !t.done)
)

const completedTodos = computed(() =>
  todos.value.filter(t => t.done)
)

const completionRate = computed(() =>
  todos.value.length === 0
    ? 0
    : (completedTodos.value.length / todos.value.length) * 100
)
```

---

### 3. Effects - Side Effects

Effects run when their dependencies change.

```tsx
import { signal, effect } from 'flexium/core'

const count = signal(0)

// Runs immediately and whenever count changes
effect(() => {
  console.log('Count is:', count.value)
})

count.value++ // Logs: "Count is: 1"
```

**With Cleanup:**

```tsx
effect(() => {
  // Setup
  const timer = setInterval(() => {
    console.log('Tick:', count.value)
  }, 1000)

  // Cleanup (runs before next effect or on disposal)
  return () => {
    clearInterval(timer)
  }
})
```

**Common Use Cases:**

```tsx
// localStorage persistence
effect(() => {
  localStorage.setItem('count', String(count.value))
})

// API calls
effect(() => {
  fetch(`/api/users/${userId.value}`)
    .then(res => res.json())
    .then(data => user.value = data)
})

// DOM manipulation (outside Flexium)
effect(() => {
  document.title = `Count: ${count.value}`
})
```

---

### 4. JSX - Building UI

Flexium uses React-style JSX with automatic reactivity.

**Basic Elements:**

```tsx
<div>Hello</div>
<button onclick={() => console.log('clicked')}>Click</button>
<input type="text" value={name.value} />
```

**Signals in JSX (Automatic Reactivity):**

```tsx
const message = signal('Hello')

// Automatically updates when signal changes
<div>{message}</div>

// Works with computed too
const greeting = computed(() => `Hello, ${name.value}!`)
<h1>{greeting}</h1>
```

**Conditional Rendering:**

```tsx
const show = signal(true)

<div>
  {show.value && <p>This is shown</p>}
  {show.value ? <p>Yes</p> : <p>No</p>}
</div>
```

**List Rendering:**

```tsx
const items = signal(['a', 'b', 'c'])

<ul>
  {items.value.map((item, index) => (
    <li key={index}>{item}</li>
  ))}
</ul>
```

**Styling:**

```tsx
// Inline styles (object)
<div style={{ color: 'red', fontSize: '16px' }}>
  Styled text
</div>

// Dynamic styles
<div style={{
  color: isActive.value ? 'blue' : 'gray',
  fontWeight: isActive.value ? 'bold' : 'normal'
}}>
  Dynamic styling
</div>
```

---

## Common Patterns

### 1. Form Handling

```tsx
const email = signal('')
const password = signal('')

const isValid = computed(() =>
  email.value.includes('@') && password.value.length >= 8
)

function LoginForm() {
  const handleSubmit = () => {
    if (isValid.value) {
      console.log('Login:', email.value, password.value)
    }
  }

  return (
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit() }}>
      <input
        type="email"
        value={email.value}
        oninput={(e) => email.value = e.target.value}
        placeholder="Email"
      />
      <input
        type="password"
        value={password.value}
        oninput={(e) => password.value = e.target.value}
        placeholder="Password"
      />
      <button type="submit" disabled={!isValid.value}>
        Login
      </button>
    </form>
  )
}
```

---

### 2. Todo List

```tsx
interface Todo {
  id: number
  text: string
  done: boolean
}

const todos = signal<Todo[]>([])
const newTodoText = signal('')

const addTodo = () => {
  if (newTodoText.value.trim()) {
    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: newTodoText.value,
        done: false
      }
    ]
    newTodoText.value = ''
  }
}

const toggleTodo = (id: number) => {
  todos.value = todos.value.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  )
}

const removeTodo = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

function TodoApp() {
  return (
    <div>
      <input
        value={newTodoText.value}
        oninput={(e) => newTodoText.value = e.target.value}
        onkeypress={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onclick={addTodo}>Add</button>

      <ul>
        {todos.value.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.done ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
            <button onclick={() => removeTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### 3. Data Fetching

```tsx
const userId = signal(1)
const user = signal<User | null>(null)
const loading = signal(false)
const error = signal<string | null>(null)

effect(() => {
  loading.value = true
  error.value = null

  fetch(`https://api.example.com/users/${userId.value}`)
    .then(res => res.json())
    .then(data => {
      user.value = data
      loading.value = false
    })
    .catch(err => {
      error.value = err.message
      loading.value = false
    })
})

function UserProfile() {
  return (
    <div>
      {loading.value && <p>Loading...</p>}
      {error.value && <p>Error: {error.value}</p>}
      {user.value && (
        <div>
          <h2>{user.value.name}</h2>
          <p>{user.value.email}</p>
        </div>
      )}
    </div>
  )
}
```

---

### 4. Timer/Counter

```tsx
const seconds = signal(0)
const isRunning = signal(false)

effect(() => {
  if (!isRunning.value) return

  const timer = setInterval(() => {
    seconds.value++
  }, 1000)

  return () => clearInterval(timer)
})

function Timer() {
  return (
    <div>
      <h1>{seconds.value}s</h1>
      <button onclick={() => isRunning.value = !isRunning.value}>
        {isRunning.value ? 'Pause' : 'Start'}
      </button>
      <button onclick={() => seconds.value = 0}>
        Reset
      </button>
    </div>
  )
}
```

---

## Next Steps

### 1. Explore Examples

Check out working examples:
- [Simple Counter](../examples/counter) - Basic signals
- [Todo App](../examples/todo-app) - Real-world patterns
- [Complete Showcase](../examples/showcase) - All features

See [EXAMPLES.md](../EXAMPLES.md) for the full list.

---

### 2. Learn Advanced Features

- [Layout Primitives](./API.md#layout-primitives) - Row, Column, Grid, Stack
- [Motion Component](./API.md#motion) - Declarative animations
- [Form Components](./API.md#form) - Validation and state management
- [Automatic Reactivity](./AUTOMATIC_REACTIVITY.md) - How it works under the hood

---

### 3. Read API Documentation

Complete reference for all APIs:
- [Core API](./API.md#core-reactivity) - signal, computed, effect
- [Components](./API.md#ui-components) - All built-in components
- [Renderers](./API.md#rendering) - DOM, Canvas, React Native

---

### 4. Migration Guides

Coming from another framework?
- [From React](./MIGRATION.md#from-react)
- [From Vue](./MIGRATION.md#from-vue)
- [From Svelte](./MIGRATION.md#from-svelte)

---

## Best Practices

### 1. Use Signals for All State

```tsx
// Good
const count = signal(0)

// Bad (won't be reactive)
let count = 0
```

---

### 2. Use Computed for Derived Values

```tsx
// Good
const doubled = computed(() => count.value * 2)

// Bad (recalculates every render)
<div>{count.value * 2}</div>
```

---

### 3. Always Create New Objects/Arrays

```tsx
// Good (creates new array)
todos.value = [...todos.value, newTodo]

// Bad (mutates, won't trigger updates)
todos.value.push(newTodo)
```

---

### 4. Use Keys in Lists

```tsx
// Good
{items.value.map(item => (
  <div key={item.id}>{item.text}</div>
))}

// Acceptable (if no id)
{items.value.map((item, i) => (
  <div key={i}>{item.text}</div>
))}
```

---

### 5. Clean Up Effects

```tsx
// Good (cleanup)
effect(() => {
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer)
})

// Bad (memory leak)
effect(() => {
  setInterval(() => {}, 1000)
})
```

---

## Troubleshooting

### UI Not Updating

**Problem**: Changed signal value but UI didn't update
**Solution**: Make sure you're updating `.value`:

```tsx
// Wrong
count = 5

// Correct
count.value = 5
```

---

### Object/Array Not Triggering Updates

**Problem**: Mutated object/array but UI didn't update
**Solution**: Create new object/array:

```tsx
// Wrong
user.value.name = 'New name'

// Correct
user.value = { ...user.value, name: 'New name' }
```

---

### CORS Errors

**Problem**: Module loading errors in browser
**Solution**: Use HTTP server, not `file://`:

```bash
python3 -m http.server 8000
```

---

### TypeScript Errors with JSX

**Problem**: "Cannot find name 'h'" or JSX errors
**Solution**: Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

---

## Resources

- [Quick Start](../QUICK_START.md) - 5-minute tutorial
- [Examples](../EXAMPLES.md) - All working examples
- [API Reference](./API.md) - Complete API docs
- [Migration Guide](./MIGRATION.md) - From other frameworks
- [GitHub](https://github.com/Wick-Lim/flexium.js) - Source code

---

**Happy building with Flexium!**
