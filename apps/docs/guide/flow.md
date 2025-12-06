---
title: Control Flow - For Component & Native Conditionals
description: Learn Flexium's control flow with the For component for lists and native JavaScript for conditionals.
head:
  - - meta
    - property: og:title
      content: Control Flow - Flexium
  - - meta
    - property: og:description
      content: Master the For component for list rendering and native JavaScript conditionals for efficient reactive UI.
---

# Control Flow

Flexium uses a **minimal, honest approach** to control flow:

- **`<For>`** - For list rendering with efficient DOM caching
- **Native JavaScript** - For conditionals (ternary `? :` and `&&`)

This approach follows Flexium's philosophy of using JavaScript as the template language rather than inventing new abstractions.

## `<For>`

The `<For>` component is used for rendering lists. It efficiently reuses DOM nodes for items that haven't changed, avoiding unnecessary re-creation.

### Usage

```tsx
import { For, state } from 'flexium/core';

function TodoList() {
  const [todos, setTodos] = state([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Walk the dog' }
  ]);

  return (
    <ul>
      <For each={todos}>
        {(item, index) => (
          <li>
            {index() + 1}. {item.text}
          </li>
        )}
      </For>
    </ul>
  );
}
```

### Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `each` | `StateGetter<T[]>` | The reactive array to iterate over. |
| `children` | `(item: T, index: () => number) => FNode` | A render function that receives the item and a reactive index getter. |

### Keying and Caching

`<For>` automatically handles keying based on item reference. When the list order changes, DOM nodes are moved rather than recreated. The `index` argument is a getter function that updates reactively if the item's position changes.

---

## Conditional Rendering

Use native JavaScript for conditional rendering. This is more readable and leverages your existing JS knowledge.

### Ternary Operator

For if/else conditions, use the ternary operator inside a reactive function:

```tsx
import { state } from 'flexium/core';

function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = state(false);

  return (
    <div>
      {() => isLoggedIn()
        ? <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        : <button onClick={() => setIsLoggedIn(true)}>Login</button>
      }
    </div>
  );
}
```

### Logical AND (&&)

For conditionally showing content when a value is truthy:

```tsx
import { state } from 'flexium/core';

function UserGreeting() {
  const [user, setUser] = state(null);

  return (
    <div>
      {() => user() && <span>Welcome, {user().name}!</span>}
    </div>
  );
}
```

### Multiple Conditions

For multiple mutually exclusive conditions, use nested ternaries or a function:

```tsx
function StatusDisplay() {
  const [status, setStatus] = state('loading');

  return (
    <div>
      {() => {
        const s = status();
        if (s === 'loading') return <p>Loading...</p>;
        if (s === 'error') return <p style={{ color: 'red' }}>Error!</p>;
        if (s === 'success') return <p>Success!</p>;
        return <p>Unknown state</p>;
      }}
    </div>
  );
}
```

Or with nested ternaries:

```tsx
function StatusDisplay() {
  const [status, setStatus] = state('loading');

  return (
    <div>
      {() =>
        status() === 'loading' ? <p>Loading...</p> :
        status() === 'error' ? <p style={{ color: 'red' }}>Error!</p> :
        status() === 'success' ? <p>Success!</p> :
        <p>Unknown state</p>
      }
    </div>
  );
}
```

## Why Native JavaScript?

Flexium deliberately uses native JavaScript for conditionals instead of custom components like `<Show>` or `<Switch>`:

1. **Less to learn** - You already know JavaScript
2. **More flexible** - Full power of JavaScript expressions
3. **Honest** - No magic, just functions
4. **Debuggable** - Standard JS debugging works

The reactive wrapper `{() => ...}` ensures Flexium tracks dependencies and updates the DOM when state changes.
