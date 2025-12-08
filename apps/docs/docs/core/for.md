---
title: List Rendering
---

# List Rendering

Flexium offers two ways to render lists, both with the same performance optimizations.

<script setup>
import TodoDemo from '../../components/TodoDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <TodoDemo />
</ClientOnly>

## Option 1: `items.map()` (Recommended)

Use familiar React-style syntax with automatic optimizations:

```tsx
import { state } from 'flexium/core'

const [items] = state(['Apple', 'Banana', 'Cherry'])

// Just like React, but with automatic optimization!
{items.map(item => <li>{item}</li>)}
```

This is the recommended approach for most use cases.

## Option 2: `<For>` Component

An alternative explicit syntax:

```tsx
import { For } from 'flexium/core'
```

### Signature

```tsx
<For each={items}>
  {(item, index) => <Component />}
</For>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `each` | `T[] \| Accessor<T[]>` | Array or signal containing array to iterate |
| `children` | `(item: T, index: number) => JSX.Element` | Render function for each item |

## Usage

### Basic List

```tsx
const [items, setItems] = state(['Apple', 'Banana', 'Cherry'])

<For each={items}>
  {(item, index) => <li>{item}</li>}
</For>
```

### Object Array

```tsx
const [users, setUsers] = state([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
])

<For each={users}>
  {(user) => (
    <div>
      <span>{user.name}</span>
      <button onclick={() => deleteUser(user.id)}>Delete</button>
    </div>
  )}
</For>
```

### With Index

```tsx
<For each={items}>
  {(item, index) => (
    <div>
      <span>#{index + 1}: {item}</span>
    </div>
  )}
</For>
```

### Nested Lists

```tsx
const [categories, setCategories] = state([
  { name: 'Fruits', items: ['Apple', 'Banana'] },
  { name: 'Vegetables', items: ['Carrot', 'Broccoli'] }
])

<For each={categories}>
  {(category) => (
    <div>
      <h3>{category.name}</h3>
      <ul>
        <For each={category.items}>
          {(item) => <li>{item}</li>}
        </For>
      </ul>
    </div>
  )}
</For>
```

### Empty State

```tsx
const [items, setItems] = state([])

<Show when={() => items.length > 0} fallback={<p>No items</p>}>
  <For each={items}>
    {(item) => <div>{item}</div>}
  </For>
</Show>
```

## Behavior

- Items are **keyed by reference** by default
- Only changed items are **re-rendered**
- Adding/removing items doesn't re-render unchanged items
- The render function receives the **actual item**, not a signal

## Notes

- Both `items.map()` and `<For>` have identical performance (O(1) append, DOM caching)
- `items.map()` is recommended for familiarity; `<For>` is available if you prefer explicit syntax
- Avoid using index as the sole identifier for mutable lists
- The callback runs once per item and updates reactively

## Comparison

| Feature | `items.map()` | `<For>` |
|---------|---------------|---------|
| Syntax | React-like | Explicit component |
| Performance | ✅ Optimized | ✅ Optimized |
| Index access | `index` (number) | `index()` (getter) |
| Import needed | No | Yes |

## See Also

- [&lt;Show /&gt;](/docs/core/show)
- [&lt;Switch /&gt;](/docs/core/switch)
