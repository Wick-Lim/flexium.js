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

::: danger Important: Proxy Comparison
State values are **Proxy objects**. When comparing with `===`, you **must cast to primitive** first:
```tsx
// ❌ WRONG - Proxy comparison always fails
if (count === 5) { ... }

// ✅ CORRECT - Cast to primitive
if (+count === 5) { ... }        // number (use +)
if (`${name}` === 'Alice') { }   // string (use template)
if (user.id === 1) { ... }       // compare properties directly
```
:::

## The `state()` API

The `state` function returns a tuple of `[value, setter]`, similar to React's `useState`, but with supercharged capabilities. The value is a reactive proxy that can be used directly like a regular value.

```tsx
import { state } from 'flexium/core';

const [count, setCount] = state(0);

// Use directly - no getter call needed!
console.log(count + 1);  // 1
```

### 1. Local State

Local state is isolated to the component where it's created.

```tsx
function Counter() {
  const [count, setCount] = state(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onclick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

- **Reading**: Use the value directly in expressions `count + 1` or in JSX `{count}`.
- **Writing**: Call the setter `setCount(newValue)` or `setCount(prev => prev + 1)`.

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
  const [theme, setTheme] = useTheme();

  return (
    <header class={theme}>
      <h1>My App</h1>
      <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}

// Footer.tsx
import { useTheme } from './store/theme';

function Footer() {
  // Accesses the SAME state because the key 'theme' matches
  const [theme] = useTheme();
  return <footer class={theme}>...</footer>;
}
```

If multiple components call `state()` with the same key, they will share the same underlying signal.

### 3. Async State (Resources)

Pass an async function (or a function returning a Promise) to `state()` to create an async resource.

```tsx
function UserProfile({ id }) {
  // Automatically fetches when component mounts or dependencies change
  const [user, refetch, isLoading, error] = state(async () => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  });

  // Render based on loading/error state
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Data is available - use values directly
  return (
    <div>
      <h1>{user.name}</h1>
      <button onclick={() => refetch()}>Reload</button>
    </div>
  );
}
```

- **Automatic Tracking**: If the async function uses other signals, it will auto-refetch when they change.
- **Return Values**: `[data, refetch, isLoading, error]` - all reactive proxies.

### 4. Computed State (Derived)

Pass a synchronous function to derive state from other signals.

```tsx
const [count, setCount] = state(1);

// 'double' updates whenever 'count' changes
const [double] = state(() => count * 2);

console.log(double); // 2
setCount(5);
console.log(double); // 10
```

Computed state is read-only by default (the setter is no-op or throws, depending on config).

## Effects & Side Effects

While `state()` manages data, `effect()` handles side effects like DOM manipulation, logging, or subscriptions.

```tsx
import { state, effect } from 'flexium/core';

const [count, setCount] = state(0);

effect(() => {
  // Automatically runs when 'count' changes
  console.log('Count is:', count);
});
```

For detailed usage, automatic tracking, and cleanup, see the **[Effects](/guide/effects)** guide.

## List Rendering

For rendering lists efficiently, use familiar `.map()` syntax - just like React:

```tsx
const [todos, setTodos] = state([{ id: 1, text: 'Buy milk' }]);

return (
  <ul>
    {todos.map((todo, index) => (
      <li key={todo.id}>{index + 1}: {todo.text}</li>
    ))}
  </ul>
);
```

Flexium automatically optimizes list rendering with O(1) append/prepend and DOM node caching.

### 5. Array Keys

Keys can be arrays for hierarchical namespacing - similar to TanStack Query:

```tsx
// String key
const [user] = state(null, { key: 'user' })

// Array key - great for dynamic keys
const [user] = state(null, { key: ['user', 'profile', userId] })
const [posts] = state([], { key: ['user', 'posts', userId] })
```

### 6. Params Option

Pass explicit parameters to functions for better DX:

```tsx
// Implicit dependencies (closure)
const [user] = state(async () => fetch(`/api/users/${userId}`))

// Explicit dependencies (params) - recommended for complex cases
const [user] = state(
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
2.  **Destructure the tuple**: `const [val, setVal] = state(...)` is the standard pattern.
3.  **Use values directly**: `count + 1` works automatically thanks to Symbol.toPrimitive.
4.  **Use array keys for dynamic data**: `['user', userId]` instead of `'user-' + userId`.
5.  **Use params for explicit dependencies**: Makes code self-documenting.
