# Store

Flexium provides a lightweight `createStore` primitive for managing complex, nested state using Proxies.

## Usage

```tsx
import { createStore } from 'flexium/store'

const [state, setState] = createStore({
  user: {
    name: 'John Doe',
    settings: {
      theme: 'dark'
    }
  },
  todos: []
})

// Reading state (auto-tracks dependencies)
console.log(state.user.name)

// Updating state (path-based)
setState('user', 'settings', 'theme', 'light')
```

## API

### `createStore<T>(initialState: T)`

Creates a reactive store from an initial state object.

- **Returns**: `[state, setState]`
  - `state`: A read-only proxy of the state. Accessing properties automatically tracks dependencies.
  - `setState`: A function to update the state.

### `setState(...path, value)`

Updates a value at the specified path.

- `path`: A sequence of keys to traverse.
- `value`: The new value to set at the target path.
