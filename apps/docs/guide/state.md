---
title: state() - Unified State Management API
description: Learn how to use Flexium's unified state() API for local state, global state, async data fetching, and computed values.
head:
  - - meta
    - property: og:title
      content: state() API - Flexium State Management
  - - meta
    - property: og:description
      content: Master Flexium's unified state() API - one function for local, global, async, and computed state management.
---

# state()

`state()` is the single, unified API for all state management in Flexium.
It handles local state, shared global state, async data fetching, and derived values.

## The `state()` API

The `state()` function always returns a **tuple**:

```tsx
import { state } from 'flexium/core'

// Returns [value, setter]
const [count, setCount] = state(0)

// Read the value
console.log(count + 1)  // 1

// Update the value
setCount(5)
setCount(prev => prev + 1)
```

### 1. Local State

Local state is isolated to the component where it's created.

```tsx
function Counter() {
  const [count, setCount] = state(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onclick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}
```

- **Reading**: Use the value directly in expressions `count + 1` or in JSX `{count}`
- **Writing**: Call the setter `setCount(newValue)` or `setCount(prev => prev + 1)`

### 2. Global State

To share state across components, provide a unique `key` in the options.

```tsx
// store/theme.ts
import { state } from 'flexium/core'

export const useTheme = () => state('light', { key: 'theme' })
```

```tsx
// Header.tsx
import { useTheme } from './store/theme'

function Header() {
  const [theme, setTheme] = useTheme()

  return (
    <header class={theme}>
      <h1>My App</h1>
      <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  )
}

// Footer.tsx - shares the same state
function Footer() {
  const [theme] = useTheme()
  return <footer class={theme}>...</footer>
}
```

### 3. Async State (Resources)

Pass an async function to `state()` to create an async resource.

```tsx
function UserProfile({ id }) {
  const [user, control] = state(async () => {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) throw new Error('Failed to fetch')
    return response.json()
  })

  if (control.loading) return <div>Loading...</div>
  if (control.error) return <div>Error: {control.error.message}</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <button onclick={() => control.refetch()}>Reload</button>
    </div>
  )
}
```

**ResourceControl properties:**
- `loading: boolean` - true while fetching
- `error: unknown` - error object if failed
- `status: 'idle' | 'loading' | 'success' | 'error'`
- `refetch(): Promise<void>` - re-trigger the async operation

### 4. Computed State (Derived)

Pass a synchronous function with `deps` to derive state from other values.

```tsx
const [count, setCount] = state(1)

// Updates when count changes
const [double] = state(() => count * 2, { deps: [count] })

console.log(double) // 2
setCount(5)
console.log(double) // 10
```

### 5. deps Option

For expensive computations that should only re-run when specific dependencies change, use the `deps` option:

```tsx
const [items] = useItems()
const [filter, setFilter] = state('all')

// Only recomputes when items or filter changes
const [filteredItems] = state(() => {
  return items.filter(item =>
    filter === 'all' ? true : item.status === filter
  )
}, { deps: [items, filter] })
```

**When to use `deps`:**
- Expensive calculations (sorting, filtering large lists)
- When you need explicit control over recomputation
- Migrating from React's `useMemo`

**Computed state requires `deps`:**
| Usage | Example |
|-------|---------|
| With deps | `state(() => count * 2, { deps: [count] })` |
| Re-runs when deps change | Explicit dependency tracking |

```tsx
// Example: Kanban board with memoized columns
function KanbanBoard() {
  const [tasks] = useTasks()

  const [todo] = state(() => tasks.filter(t => t.status === 'todo'), { deps: [tasks] })
  const [inProgress] = state(() => tasks.filter(t => t.status === 'in-progress'), { deps: [tasks] })
  const [done] = state(() => tasks.filter(t => t.status === 'done'), { deps: [tasks] })

  return (
    <div class="kanban">
      <Column tasks={todo} title="To Do" />
      <Column tasks={inProgress} title="In Progress" />
      <Column tasks={done} title="Done" />
    </div>
  )
}
```

::: warning
The `deps` option is not supported with async functions. Use automatic tracking or the `key` option for async state.
:::

## Effects & Side Effects

While `state()` manages data, `effect()` handles side effects like DOM manipulation, logging, or subscriptions.

```tsx
import { state, effect } from 'flexium/core'

const [count, setCount] = state(0)

effect(() => {
  // Runs when 'count' changes
  console.log('Count is:', count)
}, [count])
```

For detailed usage, automatic tracking, and cleanup, see the **[Effects](/guide/effects)** guide.

## List Rendering

For rendering lists efficiently, use familiar `.map()` syntax:

```tsx
const [todos, setTodos] = state([{ id: 1, text: 'Buy milk' }])

return (
  <ul>
    {todos.map((todo, index) => (
      <li key={todo.id}>{index + 1}: {todo.text}</li>
    ))}
  </ul>
)
```

### 6. Array Keys

Keys can be arrays for hierarchical namespacing - similar to TanStack Query:

```tsx
// String key
const [user, setUser] = state(null, { key: 'user' })

// Array key - great for dynamic keys
const [userProfile] = state(null, { key: ['user', 'profile', userId] })
const [posts] = state([], { key: ['user', 'posts', userId] })
```

### 7. Params Option

Pass explicit parameters to functions for better DX:

```tsx
// Implicit dependencies (closure)
const [user] = state(async () => fetch(`/api/users/${userId}`))

// Explicit dependencies (params) - recommended for complex cases
const [userWithParams, control] = state(
  async ({ userId, postId }) => fetch(`/api/users/${userId}/posts/${postId}`),
  {
    key: ['user', 'posts', userId, postId],
    params: { userId, postId }
  }
)
```

**Benefits:**
- Self-documenting code
- Better DevTools visibility
- Improved TypeScript inference

## Best Practices

1. **Destructure the tuple**: `const [value, setter] = state(initial)`
2. **Use setter for updates**: `setter(newValue)` or `setter(prev => prev + 1)`
3. **Use deps for expensive computations**: `state(() => ..., { deps: [...] })`
4. **Use array keys for dynamic data**: `['user', userId]` instead of `'user-' + userId`
