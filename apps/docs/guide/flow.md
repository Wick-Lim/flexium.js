---
title: Control Flow - For, Show, Switch Components
description: Learn Flexium's control flow components for efficient conditional rendering and list handling with fine-grained reactivity.
head:
  - - meta
    - property: og:title
      content: Control Flow Components - Flexium
  - - meta
    - property: og:description
      content: Master For, Show, Switch, and Match components for optimized conditional rendering and list iteration.
---

# Control Flow

Flexium provides a set of dedicated control flow components (`<For>`, `<Show>`, `<Switch>`, `<Match>`) designed to handle conditional rendering and lists efficiently. Unlike JavaScript's native `.map()` or ternary operators, these components are optimized for fine-grained reactivity, ensuring that only the necessary parts of the DOM are updated when state changes.

## `<For>`

The `<For>` component is used for rendering lists. It is much more efficient than `array.map()` because it reuses DOM nodes for items that haven't changed, avoiding full VDOM diffing and re-creation.

### Usage

```tsx
import { For, state } from 'flexium';

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
| `children` | `(item: T, index: () => number) => VNode` | A render function that receives the item and a reactive index getter. |

### Keying and Caching

`<For>` automatically handles keying based on the item reference or an `id` property if present. This ensures that when the list order changes, the DOM nodes are moved rather than recreated. The `index` argument is a signal getter, so it updates reactively if the item's position changes.

---

## `<Show>`

The `<Show>` component renders its children when the `when` condition is truthy. If the condition is falsy, it renders the `fallback` content (if provided).

### Usage

```tsx
import { Show, state } from 'flexium';

function UserProfile() {
  const [user, setUser] = state(null);
  const [isLoggedIn, setIsLoggedIn] = state(false);

  return (
    <div>
      {/* Basic usage */}
      <Show when={isLoggedIn} fallback={<button>Login</button>}>
        <button>Logout</button>
      </Show>

      {/* Accessing the truthy value */}
      <Show when={user}>
        {(u) => <div>Welcome, {u.name}!</div>}
      </Show>
    </div>
  );
}
```

### Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `when` | `StateGetter<T \| undefined \| null \| false>` | The reactive condition to check. |
| `fallback` | `VNode \| (() => VNode)` | Content to render when the condition is falsy. |
| `children` | `VNode \| ((item: T) => VNode)` | Content to render when the condition is truthy. Can be a function to access the truthy value. |

---

## `<Switch>` and `<Match>`

The `<Switch>` component renders the first `<Match>` child whose `when` condition is truthy. This is useful for mutually exclusive conditions, similar to a `switch` statement or `if-else if-else` chain.

### Usage

```tsx
import { Switch, Match, state } from 'flexium';

function DataFetcher() {
  const [status, setStatus] = state('loading'); // 'loading' | 'error' | 'success'
  const [data, setData] = state(null);
  const [error, setError] = state(null);

  return (
    <Switch fallback={<div>Unknown state</div>}>
      <Match when={() => status() === 'loading'}>
        <p>Loading...</p>
      </Match>
      <Match when={() => status() === 'error'}>
        <p style={{ color: 'red' }}>Error: {error()}</p>
      </Match>
      <Match when={() => status() === 'success'}>
        <DataView data={data()} />
      </Match>
    </Switch>
  );
}
```

### Props (`<Switch>`)

| Prop | Type | Description |
| :--- | :--- | :--- |
| `fallback` | `VNode` | Content to render if no `<Match>` condition is met. |

### Props (`<Match>`)

| Prop | Type | Description |
| :--- | :--- | :--- |
| `when` | `StateGetter<T \| undefined \| null \| false>` | The condition to check. |
| `children` | `VNode \| ((item: T) => VNode)` | Content to render if this match is selected. |
