# Flexium.js

**Simpler, Faster, Unified.**
Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `useState()`.

## Key Features

- **Unified State API**: No more `useRecoil`, `useQuery` separation. Just `useState()`.
- **Fine-Grained Reactivity**: Updates only what changed. No Virtual DOM overhead.
- **React-Style `.map()` with Optimization**: `items.map()` works reactively with automatic DOM caching.
- **High Performance**: Optimized Monomorphic VNodes & Keyed Reconciliation.
- **Event Delegation**: Automatic memory optimization for event listeners.
- **Zero-Config JSX**: Works out of the box with standard tooling.

## Installation

```bash
npm install flexium
```

## The Only API You Need: `useState()`

Flexium unifies all state concepts into one function.

### 1. Local State

```javascript
import { useState } from 'flexium/core';

function Counter() {
  // Create local state
  const count = useState(0);

  return (
    <button onclick={() => count.set(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### 2. Global State (Like Recoil/Jotai)

Just add a `key` to share state across components.

```javascript
// Define global state (with initial value)
const theme = useState('light', { key: 'theme' });

function ThemeToggler() {
  // Access existing global state (initial value optional)
  const theme = useState(undefined, { key: 'theme' });

  return (
    <button onclick={() => theme.set(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}
```

### 3. Async Resource (Like SWR/React Query)

Pass an async function to handle data fetching automatically.

```javascript
function UserProfile({ id }) {
  // Automatically fetches data. Re-runs if dependencies change.
  const user = useState(async () => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });

  return () => {
    if (user.loading) return <div>Loading...</div>;
    if (user.error) return <div>Error!</div>;

    return (
      <div>
        <h1>{user.valueOf().name}</h1>
        <button onclick={() => user.refetch()}>Reload</button>
      </div>
    );
  };
}
```

### 4. Derived State (Computed)

Pass a synchronous function to create a value that updates automatically.

```javascript
const count = useState(1);
// 'double' updates whenever 'count' changes
const double = useState(() => count.valueOf() * 2);

console.log(double.valueOf()); // 2 - use values directly!
```

### 5. List Rendering

Use familiar `.map()` syntax with automatic optimization:

```javascript
function TodoList() {
  const todos = useState([
    { id: 1, text: 'Learn Flexium' },
    { id: 2, text: 'Build something awesome' }
  ]);

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

Unlike other signal-based frameworks, Flexium's `.map()` is automatically reactive and optimized (O(1) append, DOM caching, minimal moves).

## Reactivity System

Flexium uses a signal-based reactivity system. Components run once, and only the parts that depend on changed state will update.

```javascript
import { useState, useEffect } from 'flexium/core';

const count = useState(0);

// Side effects run automatically when dependencies change
useEffect(() => {
  console.log('Count changed to:', count.valueOf());
});
```

## License

MIT