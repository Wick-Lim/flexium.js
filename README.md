# Flexium.js

**Simpler, Faster, Unified.**
Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `state()`.

## Key Features

- **Unified State API**: No more `useState`, `useRecoil`, `useQuery` separation. Just `state()`.
- **Fine-Grained Reactivity**: Updates only what changed. No Virtual DOM overhead.
- **High Performance**: Optimized Monomorphic VNodes & Keyed Reconciliation.
- **Event Delegation**: Automatic memory optimization for event listeners.
- **Zero-Config JSX**: Works out of the box with standard tooling.

## Installation

```bash
npm install flexium
```

## The Only API You Need: `state()`

Flexium unifies all state concepts into one function.

### 1. Local State (Like `useState`)

```javascript
import { state } from 'flexium/core';

function Counter() {
  // Create local state
  const [count, setCount] = state(0);

  return (
    <button onclick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### 2. Global State (Like Recoil/Jotai)

Just add a `key` to share state across components.

```javascript
// Define global state (with initial value)
const [theme, setTheme] = state('light', { key: 'theme' });

function ThemeToggler() {
  // Access existing global state (initial value optional)
  const [theme, setTheme] = state(undefined, { key: 'theme' });

  return (
    <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
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
  const [user, actions] = state(async () => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });

  return () => {
    if (user.loading) return <div>Loading...</div>;
    if (user.error) return <div>Error!</div>;

    return (
      <div>
        <h1>{user().name}</h1>
        <button onclick={() => actions.refetch()}>Reload</button>
      </div>
    );
  };
}
```

### 4. Derived State (Computed)

Pass a synchronous function to create a value that updates automatically.

```javascript
const [count, setCount] = state(1);
// 'double' updates whenever 'count' changes
const [double] = state(() => count() * 2); 
```

## Reactivity System

Flexium uses a signal-based reactivity system. Components run once, and only the parts that depend on changed state will update.

```javascript
import { state, effect } from 'flexium/core';

const [count, setCount] = state(0);

// Side effects
effect(() => {
  console.log('Count changed to:', count());
});
```

## License

MIT