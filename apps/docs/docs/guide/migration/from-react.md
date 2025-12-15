---
title: Migration from React
---

# Migration from React

This guide walks you through migrating React apps to Flexium step by step.

## Overview

Flexium provides a React-like API but with some important differences:

- ✅ **Single API**: One `state()` for all state management
- ✅ **Familiar pattern**: Same `[value, setter]` tuple as React
- ✅ **No Virtual DOM**: Faster rendering
- ✅ **Same dependency arrays**: `effect(fn, [deps])` like React

---

## API Mapping Table

| React | Flexium | Notes |
|-------|---------|-------|
| `useState` | `state` | Same `[value, setter]` tuple |
| `useMemo` | `state(() => ..., { deps })` | computed state with deps |
| `useEffect` | `effect(fn, deps)` | Same pattern with deps array |
| `useCallback` | Unnecessary | Auto-optimized |
| `useRef` | `ref` | Same |
| `useContext` | `context` | Same |
| `useReducer` | `state` + methods | Implement directly |
| `React.memo` | Unnecessary | Auto-optimized |
| `React Router` | `flexium/router` | Similar API |

---

## Step-by-Step Migration

### Step 1: Replace Dependencies

```bash
# Remove React
npm uninstall react react-dom @types/react @types/react-dom

# Install Flexium
npm install flexium
```

### Step 2: Change Imports

```tsx
// ❌ Before (React)
import { useState, useEffect, useMemo } from 'react'

// ✅ After (Flexium)
import { state, effect } from 'flexium/core'
```

### Step 3: Convert Components

#### Basic Component

```tsx
// ❌ Before (React)
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

// ✅ After (Flexium)
import { state } from 'flexium/core'

function Counter() {
  const [count, setCount] = state(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onclick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**Changes**:
- `useState` → `state` (same tuple pattern!)
- `onClick` → `onclick` (lowercase)
- Rest is the same

---

#### useMemo → computed state

```tsx
// ❌ Before (React)
import { useState, useMemo } from 'react'

function Calculator() {
  const [price, setPrice] = useState(100)
  const [quantity, setQuantity] = useState(2)

  const total = useMemo(() => price * quantity, [price, quantity])

  return <div>Total: {total}</div>
}

// ✅ After (Flexium)
import { state } from 'flexium/core'

function Calculator() {
  const [price, setPrice] = state(100)
  const [quantity, setQuantity] = state(2)

  // Use deps to specify dependencies (like useMemo)
  const [total] = state(() => price * quantity, { deps: [price, quantity] })

  return <div>Total: {total}</div>
}
```

**Changes**:
- `useMemo(() => ..., [deps])` → `state(() => ..., { deps: [...] })`
- Returns a tuple: `const [value] = state(...)`

---

#### useEffect → effect

```tsx
// ❌ Before (React)
import { useState, useEffect } from 'react'

function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>Count: {count}</div>
}

// ✅ After (Flexium)
import { state, effect } from 'flexium/core'

function Timer() {
  const [count, setCount] = state(0)

  effect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)

    return () => clearInterval(interval)  // Cleanup same
  }, [])  // Empty deps = run once on mount

  return <div>Count: {count}</div>
}
```

**Changes**:
- `useEffect` → `effect`
- Same dependency array pattern
- Cleanup function is the same

---

#### useEffect with dependencies

```tsx
// ❌ Before (React)
import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
  }, [userId])
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>
}

// ✅ After (Flexium)
import { state, effect } from 'flexium/core'

function UserProfile({ userId }) {
  const [user, setUser] = state(null)

  effect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
  }, [userId])  // Same dependency array pattern!

  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
```

**Changes**:
- Same dependency array pattern as React

---

#### useCallback → Unnecessary

```tsx
// ❌ Before (React)
import { useState, useCallback } from 'react'

function Parent() {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])
  
  return <Child onClick={handleClick} />
}

// ✅ After (Flexium)
import { state } from 'flexium/core'

function Parent() {
  const [count, setCount] = state(0)

  // useCallback unnecessary - auto-optimized
  const handleClick = () => {
    setCount(c => c + 1)
  }

  return <Child onclick={handleClick} />
}
```

**Changes**:
- `useCallback` unnecessary (auto-optimized)

---

#### useRef → ref

```tsx
// ❌ Before (React)
import { useRef } from 'react'

function Input() {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const focus = () => {
    inputRef.current?.focus()
  }
  
  return <input ref={inputRef} />
}

// ✅ After (Flexium)
import { ref } from 'flexium/core'

function Input() {
  const inputRef = ref<HTMLInputElement>()
  
  const focus = () => {
    inputRef.current?.focus()
  }
  
  return <input ref={inputRef} />
}
```

**Changes**:
- `useRef` → `ref`
- Usage is the same

---

#### useContext → context

```tsx
// ❌ Before (React)
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  )
}

function Child() {
  const theme = useContext(ThemeContext)
  return <div>Theme: {theme}</div>
}

// ✅ After (Flexium) - Use state() with key
import { state } from 'flexium/core'

function App() {
  // Set theme globally - no Provider needed
  const theme = state('dark', { key: 'app:theme' })
  return <Child />
}

function Child() {
  // Access theme from anywhere
  const theme = state('light', { key: 'app:theme' })
  return <div>Theme: {theme}</div>
}
```

**Changes**:
- `createContext` → `state()` with `key` option
- `useContext` → `state()` with same `key`
- No Provider needed - state is global

---

#### useReducer → state + methods

```tsx
// ❌ Before (React)
import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  )
}

// ✅ After (Flexium)
import { state } from 'flexium/core'

function Counter() {
  const counterState = state({ count: 0 })
  
  const increment = () => counterState.set(s => ({ ...s, count: s.count + 1 }))
  const decrement = () => counterState.set(s => ({ ...s, count: s.count - 1 }))
  
  return (
    <div>
      <p>Count: {counterState.count}</p>
      <button onclick={increment}>+</button>
      <button onclick={decrement}>-</button>
    </div>
  )
}
```

**Changes**:
- `useReducer` → `state` + helper functions
- Convert reducer logic to regular functions

---

### Step 4: Routing Conversion

#### React Router → Flexium Router

```tsx
// ❌ Before (React Router)
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

// ✅ After (Flexium Router)
import { Routes, Route, Link } from 'flexium/router'

function App() {
  return (
    <Routes>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={UserDetail} />
    </Routes>
  )
}
```

**Changes**:
- `BrowserRouter` + `Routes` → `Routes` (simplified)
- `Route`'s `element` → `component`
- `Link`'s `to` prop is the same

---

#### useNavigate → useRouter

```tsx
// ❌ Before (React Router)
import { useNavigate, useParams } from 'react-router-dom'

function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const goBack = () => navigate(-1)
  const goHome = () => navigate('/')
  
  return <div>User {id}</div>
}

// ✅ After (Flexium Router)
import { router } from 'flexium/router'

function UserDetail() {
  const r = router()
  const id = r.params().id
  
  const goBack = () => window.history.back()
  const goHome = () => r.navigate('/')
  
  return <div>User {id}</div>
}
```

**Changes**:
- `useNavigate` → `router()`
- `useParams` → `router().params()`
- `navigate(-1)` → `window.history.back()` or `router().navigate('/previous-path')`
- `navigate('/')` → `router.push('/')`

---

### Step 5: Event Handler Conversion

```tsx
// ❌ Before (React)
<button onClick={handleClick}>Click</button>
<input onChange={handleChange} />
<form onSubmit={handleSubmit} />

// ✅ After (Flexium)
<button onclick={handleClick}>Click</button>
<input onchange={handleChange} />
<form onsubmit={handleSubmit} />
```

**Changes**:
- All event handlers are lowercase (`onclick`, `onchange`, `onsubmit`)

---

### Step 6: Conditional Rendering

```tsx
// ❌ Before (React)
{isLoading && <Spinner />}
{error && <Error message={error} />}
{user ? <UserProfile user={user} /> : <Login />}

// ✅ After (Flexium)
{isLoading && <Spinner />}
{error && <Error message={error} />}
{user ? <UserProfile user={user} /> : <Login />}
```

**Changes**:
- Conditional rendering is the same

---

### Step 7: List Rendering

```tsx
// ❌ Before (React)
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ✅ After (Flexium) - Option 1: Regular map
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ✅ After (Flexium) - Option 2: Optimized items.map()
{items.map((item) => <Item data={item} />)}
```

**Changes**:
- Regular `map` works but `For` component is more optimized

---

## Key Differences

### 1. Same Dependency Array Pattern

```tsx
// React: Dependency array required
useEffect(() => {
  console.log(count)
}, [count])

// Flexium: Same pattern!
effect(() => {
  console.log(count)
}, [count])
```

---

### 2. No Virtual DOM

Flexium doesn't use Virtual DOM, so:
- Faster rendering
- Lower memory usage
- But React DevTools cannot be used

---

### 4. Component Memoization Unnecessary

```tsx
// React: React.memo needed
const MemoizedComponent = React.memo(Component)

// Flexium: Unnecessary (auto-optimized)
function Component() { ... }
```

---

## Complete Example: Todo App Conversion

### Before (React)

```tsx
import { useState, useEffect } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  
  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) {
      setTodos(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])
  
  const addTodo = (text: string) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }])
  }
  
  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }
  
  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })
  
  return (
    <div>
      <input 
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            addTodo(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input 
              type="checkbox" 
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### After (Flexium)

```tsx
import { state, effect, sync } from 'flexium/core'

interface Todo {
  id: number
  text: string
  completed: boolean
}

function TodoApp() {
  const todos = state<Todo[]>([])
  const filter = state<'all' | 'active' | 'completed'>('all')
  
  // Load from local storage
  effect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) {
      todos.set(JSON.parse(saved))
    }
  })
  
  // Save to local storage
  effect(() => {
    localStorage.setItem('todos', JSON.stringify(todos.valueOf()))
  })
  
  const addTodo = (text: string) => {
    todos.set([...todos.valueOf(), { id: Date.now(), text, completed: false }])
  }
  
  const toggleTodo = (id: number) => {
    todos.set(todos.valueOf().map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }
  
  // Filtering with computed state
  const filteredTodos = state(() => {
    if (filter.valueOf() === 'active') return todos.filter(t => !t.completed)
    if (filter.valueOf() === 'completed') return todos.filter(t => t.completed)
    return todos.valueOf()
  })
  
  return (
    <div>
      <input 
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            addTodo(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />
      <div>
        <button onclick={() => filter.set('all')}>All</button>
        <button onclick={() => filter.set('active')}>Active</button>
        <button onclick={() => filter.set('completed')}>Completed</button>
      </div>
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input 
              type="checkbox" 
              checked={todo.completed}
              onchange={() => toggleTodo(todo.id)}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Key Changes**:
- `useState` → `state`
- `useEffect` → `effect`
- `useMemo` → `state(() => ...)`
- `onClick` → `onclick`
- `onChange` → `onchange`
- `onKeyDown` → `onkeydown`

---

## Common Problem Solving

### Problem 1: State comparison doesn't work

```tsx
// ❌ Problem
if (count === 5) { ... }

// ✅ Solution
import { equals } from 'flexium/core'
if (equals(count, 5)) { ... }
```

### Problem 2: effect runs too frequently

```tsx
// ❌ Problem: Multiple state updates cause duplicate execution
a.set(1)
b.set(2)
c.set(3)  // Effect runs 3 times

// ✅ Solution: Use sync()
import { sync } from 'flexium/core'
sync(() => {
  a.set(1)
  b.set(2)
  c.set(3)  // Effect runs only once
})
```

### Problem 3: Type errors

```tsx
// ✅ Explicit type specification
const user = state<User | null>(null)
const count = state<number>(0)
```

---

## Performance Considerations

### 1. Use Sync Updates

```tsx
import { sync } from 'flexium/core'

// Multiple state updates at once
sync(() => {
  setA(1)
  setB(2)
  setC(3)
})
```

### 2. Use items.map()

```tsx
// Optimized list rendering
{items.map((item) => <Item data={item} />)}
```

### 3. Use Global State Appropriately

```tsx
// State shared across multiple components should be global
const [user] = state(null, { key: 'auth:user' })
```

---

## Next Steps

- [Best Practices Guide](/docs/guide/best-practices)
- [FAQ](/docs/guide/faq)
