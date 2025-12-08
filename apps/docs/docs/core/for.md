---
title: List Rendering
---

# List Rendering

Flexium uses the familiar React-style `items.map()` syntax with automatic optimizations.

<script setup>
import TodoDemo from '../../components/TodoDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <TodoDemo />
</ClientOnly>

## Basic Usage

```tsx
import { state } from 'flexium/core'

const [items] = state(['Apple', 'Banana', 'Cherry'])

// Just like React, but with automatic optimization!
{items.map(item => <li>{item}</li>)}
```

## Why This is Special

In most frameworks, `items.map()` either:
- **React**: Works but re-renders entire list on any change
- **SolidJS**: Doesn't work reactively (need `<For>` component)

**Flexium**: `items.map()` is automatically optimized with:
- ✅ O(1) append/prepend operations
- ✅ DOM node caching by item reference
- ✅ Minimal DOM moves on reorder
- ✅ No wrapper function needed

## Examples

### Basic List

```tsx
const [items, setItems] = state(['Apple', 'Banana', 'Cherry'])

<ul>
  {items.map((item, index) => (
    <li>{index + 1}. {item}</li>
  ))}
</ul>
```

### Object Array

```tsx
const [users, setUsers] = state([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
])

<div>
  {users.map(user => (
    <div>
      <span>{user.name}</span>
      <button onclick={() => deleteUser(user.id)}>Delete</button>
    </div>
  ))}
</div>
```

### Nested Lists

```tsx
const [categories, setCategories] = state([
  { name: 'Fruits', items: ['Apple', 'Banana'] },
  { name: 'Vegetables', items: ['Carrot', 'Broccoli'] }
])

<div>
  {categories.map(category => (
    <div>
      <h3>{category.name}</h3>
      <ul>
        {category.items.map(item => <li>{item}</li>)}
      </ul>
    </div>
  ))}
</div>
```

### Empty State

```tsx
const [items, setItems] = state([])

{items.length > 0
  ? items.map(item => <div>{item}</div>)
  : <p>No items</p>
}
```

### Updating Lists

```tsx
// All updates are reactive and optimized - use setter with callback
setItems(prev => [...prev, 'New item'])                    // Append
setItems(prev => prev.filter(item => item !== 'Apple'))    // Remove
setItems(prev => prev.map(item =>
  item === 'Apple' ? 'Green Apple' : item                  // Update
))
```

## Behavior

- Items are **keyed by reference** by default
- Only changed items are **re-rendered**
- Adding/removing items doesn't re-render unchanged items
- The render function receives the **actual item**, not a signal

## Notes

- Avoid using index as the sole identifier for mutable lists
- The callback runs once per item and updates reactively
- Performance is O(1) for append operations

## See Also

- [Control Flow](/guide/flow)
