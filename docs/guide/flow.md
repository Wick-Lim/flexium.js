# Control Flow

Flexium provides optimized control flow components to handle lists and conditional rendering efficiently without Virtual DOM overhead.

## `<For>`

The `<For>` component renders a list of items based on a reactive array. It is much more efficient than `Array.prototype.map` because it reuses DOM nodes and only updates what changed.

### Usage

```jsx
import { For, state } from 'flexium';

function List() {
  const [items, setItems] = state(['A', 'B', 'C']);

  return (
    <ul>
      <For each={items}>
        {(item, index) => (
          <li>
            {item} - Index: {index}
          </li>
        )}
      </For>
    </ul>
  );
}
```

### `list.map()` Helper

For better Developer Experience (DX), Flexium `state` getters for arrays include a `.map()` helper that automatically uses `<For>`.

```jsx
function List() {
  const [items, setItems] = state(['A', 'B', 'C']);

  return (
    <ul>
      {/* Automatically optimized! */}
      {items.map((item, index) => (
        <li>{item}</li>
      ))}
    </ul>
  );
}
```

> **Note:** `index` passed to the callback is a **Signal (Getter)**, not a number. You must call it `index()` to get the value. This ensures the index updates correctly when items move.

## `<Show>`

The `<Show>` component handles conditional rendering. It avoids re-rendering the parent component when the condition changes.

### Usage

```jsx
import { Show, state } from 'flexium';

function Toggle() {
  const [loggedIn, setLoggedIn] = state(false);

  return (
    <Show when={loggedIn} fallback={<button>Login</button>}>
      <button>Logout</button>
    </Show>
  );
}
```

You can also use the truthy value in the callback:

```jsx
<Show when={user}>
  {(u) => <div>Welcome, {u.name}</div>}
</Show>
```
