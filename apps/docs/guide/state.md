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

::: danger Important: Proxy Access Patterns
Flexium State is a **Callable Proxy**. While you can use it directly in arithmetic (`count + 1`) and JSX, **Logic and Comparison** require explicit handling.

We recommend the **Function Call Syntax** `()` for consistency:

```tsx
const count = state(0);
const isVisible = state(true);

// ✅ Recommended: Function Call Syntax (Safe & Clear)
if (count.valueOf() === 5) { ... }
if (!isVisible.valueOf()) { ... }

// ⚠️ Arithmetic (Works directly)
const next = count + 1; // 1

// ❌ Avoid: Direct Proxy Comparison (Always fails)
if (count === 5) { ... } // false (Proxy !== number)

// ❌ Avoid: Direct Boolean Coercion (Always true)
if (!isVisible) { ... } // false (Proxy is always truthy)
```
:::

## The `state()` API

The `state` function returns a reactive proxy directly, similar to a signal but with a unified interface.
```tsx
import { state } from 'flexium/core';

const count = state(0);

// Use directly - no getter call needed!
console.log(count + 1);  // 1
```

### 1. Local State

Local state is isolated to the component where it's created.

```tsx
function Counter() {
  const count = state(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onclick={() => count.set(c => c + 1)}>Increment</button>
    </div>
  );
}
```

- **Reading**: Use the value directly in expressions `count + 1` or in JSX `{count}`.
- **Writing**: Call the setter `count.set(newValue)` or `count.set(prev => prev + 1)`.

### 2. Global State

To share state across components, simply provide a unique `key` in the options.

```tsx
// store/theme.ts
import { state } from 'flexium/core';

// Initialize with a default value
export const useTheme = () => state('light', { key: 'theme' });
```

```tsx
// Header.tsx
import { useTheme } from './store/theme';

function Header() {
  const theme = useTheme();

  return (
    <header class={theme}>
      <h1>My App</h1>
      <button onclick={() => theme.set(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}

// Footer.tsx
import { useTheme } from './store/theme';

function Footer() {
  // Accesses the SAME state because the key 'theme' matches
  const theme = useTheme();
  return <footer class={theme}>...</footer>;
}
```

If multiple components call `state()` with the same key, they will share the same underlying signal.

### 3. Async State (Resources)

Pass an async function (or a function returning a Promise) to `state()` to create an async resource.

```tsx
function UserProfile({ id }) {
  // Automatically fetches when component mounts or dependencies change
  const user = state(async () => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  });

  // Render based on loading/error state
  // status: 'idle' | 'loading' | 'success' | 'error'
  if (user.status === 'loading') return <div>Loading...</div>;
  if (user.error) return <div>Error: {user.error.message}</div>;

  // Data is available - use values directly
  return (
    <div>
      <h1>{user.name}</h1>
      <button onclick={() => user.refetch()}>Reload</button>
    </div>
  );
}
```

- **Automatic Tracking**: If the async function uses other signals, it will auto-refetch when they change.
- **Return Values**: The returned proxy has properties `refetch`, `status`, `loading`, `error`.

### 4. Computed State (Derived)

Pass a synchronous function to derive state from other signals.

```tsx
const count = state(1);

// 'double' updates whenever 'count' changes
const double = state(() => count * 2);

console.log(double); // 2
count.set(5);
console.log(double); // 10
```

Computed state is read-only by default (the setter is no-op or throws, depending on config).

### 5. Memoized Computed (with deps)

For expensive computations that should only re-run when specific dependencies change, use the `deps` option:

```tsx
const items = state([...]);
const filter = state('all');

// Only recomputes when items or filter changes
const [filteredItems] = state(() => {
  return items.filter(item =>
    filter === 'all' ? true : item.status === filter
  );
}, { deps: [items, filter] });
```

**When to use `deps`:**
- Expensive calculations (sorting, filtering large lists)
- When you need explicit control over recomputation
- Migrating from React's `useMemo`

**Difference from automatic computed:**
| Computed | With `deps` |
|----------|-------------|
| `state(() => ...)` | `state(() => ..., { deps: [...] })` |
| Auto-tracks reactive dependencies | Manual dependency array |
| Re-runs on any accessed signal change | Re-runs only when deps change |

```tsx
// Example: Kanban board with memoized columns
function KanbanBoard() {
  const [tasks] = useTasks();

  const [todo] = state(() => tasks.filter(t => t.status === 'todo'), { deps: [tasks] });
  const [inProgress] = state(() => tasks.filter(t => t.status === 'in-progress'), { deps: [tasks] });
  const [done] = state(() => tasks.filter(t => t.status === 'done'), { deps: [tasks] });

  return (
    <div class="kanban">
      <Column tasks={todo} title="To Do" />
      <Column tasks={inProgress} title="In Progress" />
      <Column tasks={done} title="Done" />
    </div>
  );
}
```

::: warning
The `deps` option is not supported with async functions. Use automatic tracking or the `key` option for async state.
:::

## Effects & Side Effects

While `state()` manages data, `effect()` handles side effects like DOM manipulation, logging, or subscriptions.

```tsx
import { state, effect } from 'flexium/core';

const count = state(0);

effect(() => {
  // Automatically runs when 'count' changes
  console.log('Count is:', count);
});
```

For detailed usage, automatic tracking, and cleanup, see the **[Effects](/guide/effects)** guide.

## List Rendering

For rendering lists efficiently, use familiar `.map()` syntax - just like React:

```tsx
const todos = state([{ id: 1, text: 'Buy milk' }]);

return (
  <ul>
    {todos.map((todo, index) => (
      <li key={todo.id}>{index + 1}: {todo.text}</li>
    ))}
  </ul>
);
```

Flexium automatically optimizes list rendering with O(1) append/prepend and DOM node caching.

### 6. Array Keys

Keys can be arrays for hierarchical namespacing - similar to TanStack Query:

```tsx
// String key
const user = state(null, { key: 'user' })

// Array key - great for dynamic keys
const userProfile = state(null, { key: ['user', 'profile', userId] })
const posts = state([], { key: ['user', 'posts', userId] })
```

### 7. Params Option

Pass explicit parameters to functions for better DX:

```tsx
// Implicit dependencies (closure)
const user = state(async () => fetch(`/api/users/${userId}`))

// Explicit dependencies (params) - recommended for complex cases
const userWithParams = state(
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

1.  **Use `state()` for everything**: It's the universal primitive.
2.  **Use `.set()` for updates**: `count.set(1)` or `count.set(prev => prev + 1)`.
3.  **Use `.valueOf()` for Logic/Comparison**: `if (count.valueOf() === 10)` is safer than implicit coercion.
4.  **Use values directly**: `count + 1` works automatically thanks to Symbol.toPrimitive.
5.  **Use array keys for dynamic data**: `['user', userId]` instead of `'user-' + userId`.
6.  **Use params for explicit dependencies**: Makes code self-documenting.
