# State Management

Flexium provides a single, unified API for all your state management needs: `state()`. 
Whether it's local component state, shared global state, async data fetching, or derived values, `state()` handles it all.

## The `state()` API

The `state` function returns a tuple of `[getter, setter]`, similar to React's `useState`, but with supercharged capabilities.

```tsx
import { state } from 'flexium';

const [count, setCount] = state(0);
```

### 1. Local State

Local state is isolated to the component where it's created.

```tsx
function Counter() {
  const [count, setCount] = state(0);

  return (
    <div>
      <p>Count: {count}</p> {/* Auto-unwrapped in JSX */}
      <button onclick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

- **Reading**: Call the getter function `count()` to read the value. In JSX, you can pass the function directly `{count}`.
- **Writing**: Call the setter `setCount(newValue)` or `setCount(prev => prev + 1)`.

### 2. Global State

To share state across components, simply provide a unique `key` in the options.

```tsx
// store/theme.ts
import { state } from 'flexium';

// Initialize with a default value
export const useTheme = () => state('light', { key: 'theme' });
```

```tsx
// Header.tsx
import { useTheme } from './store/theme';

function Header() {
  const [theme, setTheme] = useTheme();
  
  return (
    <header class={theme()}>
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
  return <footer class={theme()}>...</footer>;
}
```

If multiple components call `state()` with the same key, they will share the same underlying signal.

### 3. Async State (Resources)

Pass an async function (or a function returning a Promise) to `state()` to create an async resource.

```tsx
function UserProfile({ id }) {
  // Automatically fetches when component mounts or dependencies change
  const [user, actions] = state(async () => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  });

  return () => {
    // Access status properties on the getter
    if (user.loading) return <div>Loading...</div>;
    if (user.error) return <div>Error: {user.error.message}</div>;

    // Data is available
    return (
      <div>
        <h1>{user().name}</h1>
        <button onclick={() => actions.refetch()}>Reload</button>
      </div>
    );
  };
}
```

- **Automatic Tracking**: If the async function uses other signals, it will auto-refetch when they change.
- **Status Flags**: The getter has `.loading`, `.error`, and `.state` properties.
- **Actions**: The setter (second return value) includes `.refetch()` and `.mutate()`.

### 4. Computed State (Derived)

Pass a synchronous function to derive state from other signals.

```tsx
const [count, setCount] = state(1);

// 'double' updates whenever 'count' changes
const [double] = state(() => count() * 2); 

console.log(double()); // 2
setCount(5);
console.log(double()); // 10
```

Computed state is read-only by default (the setter is no-op or throws, depending on config).

## Reactivity Primitives

While `state()` is the main entry point, Flexium exposes core primitives for advanced use cases.

### `effect(fn)`

Run side effects when state changes.

```tsx
import { state, effect } from 'flexium';

const [count, setCount] = state(0);

effect(() => {
  console.log('Count is:', count());
});
```

Effects run immediately once, and then re-run whenever any tracked dependency changes.

## List Rendering

For rendering lists efficiently, use the `<For>` component or the `.map()` helper on array states.

```tsx
const [todos, setTodos] = state([{ id: 1, text: 'Buy milk' }]);

return (
  <ul>
    {todos.map((todo, index) => (
      <li>{index()}: {todo.text}</li>
    ))}
  </ul>
);
```

This uses keyed reconciliation to minimize DOM operations when the array changes.

## Best Practices

1.  **Use `state()` for everything**: It's the universal primitive.
2.  **Destructure the tuple**: `const [val, setVal] = state(...)` is the standard pattern.
3.  **Access with `()`**: Always call the getter `val()` to read the value (except in JSX where it's auto-unwrapped).
4.  **Keep Global Keys Unique**: Use namespaces like `'app/theme'` to avoid collisions.
