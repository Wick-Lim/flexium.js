---
title: Control Flow - Lists & Conditionals
description: Learn Flexium's control flow with reactive arrays and native JavaScript for conditionals.
head:
  - - meta
    - property: og:title
      content: Control Flow - Flexium
  - - meta
    - property: og:description
      content: Master list rendering with items.map() syntax and native JavaScript conditionals for efficient reactive UI.
---

# Control Flow

Flexium uses a **minimal, honest approach** to control flow:

- **`items.map()`** - React-style syntax with automatic optimizations
- **Native JavaScript** - For conditionals (ternary `? :` and `&&`)

This approach follows Flexium's philosophy of using JavaScript as the template language rather than inventing new abstractions.

## List Rendering with `items.map()`

Flexium supports the familiar React-style `.map()` syntax with **automatic optimizations**. When you call `.map()` on a reactive array, Flexium detects it and applies fine-grained updates.

### Basic Usage

```tsx
import { useState } from 'flexium/core'

function TodoList() {
  const [todos] = use([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Walk the dog' }
  ])

  return (
    <ul>
      {todos.map((item, index) => (
        <li>{index + 1}. {item.text}</li>
      ))}
    </ul>
  )
}
```

### Why This is Special

In most frameworks, `items.map()` either:
- **React**: Works but re-renders entire list on any change
- **SolidJS**: Doesn't work reactively (need `<For>` component)

**Flexium**: `items.map()` is automatically optimized with:
- ✅ O(1) append/prepend operations
- ✅ DOM node caching by item reference
- ✅ Minimal DOM moves on reorder
- ✅ No wrapper function needed

### With Objects

```tsx
const [users] = use([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
])

<div>
  {users.map(user => (
    <div key={user.id}>
      <span>{user.name}</span>
      <button onClick={() => deleteUser(user.id)}>Delete</button>
    </div>
  ))}
</div>
```

### Updating Lists

```tsx
// All updates are reactive and optimized - use setter with callback
setTodos(prev => [...prev, { id: 3, text: 'New todo' }])  // Append
setTodos(prev => prev.filter(t => t.id !== 1))             // Remove
setTodos(prev => prev.map(t => t.id === 1 ? {...t, done: true} : t))  // Update
```

---

## Conditional Rendering

Use native JavaScript for conditional rendering. This is more readable and leverages your existing JS knowledge.

### Ternary Operator

For if/else conditions, use the ternary operator - just like React:

```tsx
import { useState } from 'flexium/core';

function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = use(false);

  return (
    <div>
      {isLoggedIn
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
import { useState } from 'flexium/core';

function UserGreeting() {
  const [user] = use(null);

  return (
    <div>
      {user && <span>Welcome, {user.name}!</span>}
    </div>
  );
}
```

### Multiple Conditions

For multiple mutually exclusive conditions, use nested ternaries or a function:

```tsx
function StatusDisplay() {
  const [status] = use('loading');

  const renderStatus = () => {
    if (status === 'loading') return <p>Loading...</p>;
    if (status === 'error') return <p style={{ color: 'red' }}>Error!</p>;
    if (status === 'success') return <p>Success!</p>;
    return <p>Unknown state</p>;
  };

  return <div>{renderStatus()}</div>;
}
```

Or with nested ternaries:

```tsx
function StatusDisplay() {
  const [status] = use('loading');

  return (
    <div>
      {status === 'loading' ? <p>Loading...</p> :
       status === 'error' ? <p style={{ color: 'red' }}>Error!</p> :
       status === 'success' ? <p>Success!</p> :
       <p>Unknown state</p>}
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

Flexium's StateProxy automatically tracks dependencies and updates the DOM when state changes - no wrapper functions needed.
