# Store

Flexium provides a lightweight `createStore` primitive for managing complex, nested state using Proxies.
While `state()` is great for individual values or shallow objects, `createStore` shines when you have deep data structures and want fine-grained updates for nested properties.

## Usage

```tsx
import { createStore } from 'flexium/store'

const [store, setStore] = createStore({
  user: {
    name: 'John Doe',
    settings: {
      theme: 'dark',
      notifications: true
    }
  },
  todos: []
})

// Reading state (auto-tracks dependencies)
console.log(store.user.settings.theme)

// Updating state (path-based)
// This only updates the 'theme' signal, not the entire user object
setStore('user', 'settings', 'theme', 'light')
```

## API

### `createStore<T>(initialState: T)`

Creates a reactive store from an initial state object.

- **Returns**: `[store, setStore]`
  - `store`: A read-only proxy of the state. Accessing properties automatically tracks dependencies.
  - `setStore`: A function to update the state.

### `setStore(...path, value)`

Updates a value at the specified path.

- `path`: A sequence of keys to traverse.
- `value`: The new value to set at the target path.
  - Can be a value or a function `(prev) => newValue`.

## When to use Store vs State

- **Use `state()`** for:
  - Primitive values (numbers, strings, booleans).
  - Simple lists.
  - Global state keys.
  - Async resources.

- **Use `createStore()`** for:
  - Complex nested objects (e.g., a large settings object).
  - State where you want to update a leaf property without triggering updates for the parent object.