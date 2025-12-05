---
title: List - High-Performance List Rendering
description: API reference for Flexium's List component. Render lists with optional virtualization for large datasets.
head:
  - - meta
    - property: og:title
      content: List Component - Flexium API Reference
  - - meta
    - property: og:description
      content: List is a flexible primitive component for rendering lists in Flexium. Supports optional virtualization for large datasets.
---

<script setup>
import VirtualListDemo from '../../components/VirtualListDemo.vue'
</script>

# List

A flexible component for rendering lists with optional virtualization support.

## Live Demo

Scroll through 10,000 items with smooth virtualization:

<ClientOnly>
  <VirtualListDemo />
</ClientOnly>

The `List` component renders lists efficiently. By default, it renders all items. For large datasets, enable the `virtual` option to render only visible items using virtualization.

## When to Use List

**Simple List (default):**
- Small to medium lists (< 100 items)
- When you need all items in the DOM
- For lists that don't change frequently

**Virtual List (`virtual={true}`):**
- Large lists with hundreds or thousands of items
- When performance is critical
- When memory efficiency is important

## Usage

### Simple List (Default)

```tsx
import { List } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]);

  return (
    <List items={items}>
      {(item, index) => (
        <div style={{ padding: '10px' }}>
          {index()}: {item.name}
        </div>
      )}
    </List>
  );
}
```

### Virtual List (For Large Datasets)

```tsx
import { List } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))
  );

  return (
    <List
      items={items}
      virtual
      height={400}
      itemSize={50}
    >
      {(item, index) => (
        <div style={{ padding: '10px' }}>
          {index()}: {item.name}
        </div>
      )}
    </List>
  );
}
```

### With Custom Width

```tsx
import { List } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal(
    Array.from({ length: 5000 }, (_, i) => `Item ${i}`)
  );

  return (
    <List
      items={items}
      virtual
      height={600}
      width={400}
      itemSize={60}
      overscan={5}
    >
      {(item, index) => (
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #eee'
        }}>
          {item}
        </div>
      )}
    </List>
  );
}
```

### With Stable Keys

```tsx
import { List } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal([
    { id: 'a1', name: 'Alice' },
    { id: 'b2', name: 'Bob' },
    { id: 'c3', name: 'Charlie' },
    // ... thousands more
  ]);

  return (
    <List
      items={items}
      virtual
      height={500}
      itemSize={70}
      getKey={(item) => item.id}
    >
      {(item, index) => (
        <div style={{ padding: '20px' }}>
          <h3>{item.name}</h3>
          <p>ID: {item.id}</p>
        </div>
      )}
    </List>
  );
}
```

### With Scroll Callbacks

```tsx
import { List } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal(Array.from({ length: 10000 }, (_, i) => i));

  const handleScroll = (scrollTop: number) => {
    console.log('Current scroll position:', scrollTop);
  };

  const handleVisibleRangeChange = (start: number, end: number) => {
    console.log(`Visible items: ${start} to ${end}`);
  };

  return (
    <List
      items={items}
      virtual
      height={400}
      itemSize={50}
      onScroll={handleScroll}
      onVisibleRangeChange={handleVisibleRangeChange}
    >
      {(item, index) => <div>{item}</div>}
    </List>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `() => T[]` | - | **Required.** Reactive array or getter function returning the items to render. |
| `children` | `(item: T, index: () => number) => VNode` | - | **Required.** Render function for each item. Receives the item and a reactive index getter. |
| `virtual` | `boolean` | `false` | Enable virtualization for large lists. |
| `height` | `number \| string` | - | Container height. **Required when `virtual` is true.** |
| `itemSize` | `number \| SizeConfig` | - | Height of each item. **Required when `virtual` is true.** |
| `width` | `number \| string` | `'100%'` | Container width. |
| `overscan` | `number` | `3` | Extra items to render above/below viewport (only for virtual mode). |
| `getKey` | `(item: T, index: number) => string \| number` | - | Key extractor for stable identity. |
| `onScroll` | `(scrollTop: number) => void` | - | Scroll callback (only for virtual mode). |
| `onVisibleRangeChange` | `(startIndex: number, endIndex: number) => void` | - | Visible range callback (only for virtual mode). |
| `class` | `string` | - | CSS class name for the container. |
| `style` | `Record<string, string \| number>` | - | Inline styles for the container. |

## Item Size Configuration

The `itemSize` prop accepts either a number or a configuration object:

### Fixed Size (Number)

```tsx
itemSize={50}  // All items are exactly 50px tall
```

### Fixed Size (Config)

```tsx
itemSize={{
  mode: 'fixed',
  itemHeight: 50
}}
```

### Variable Size (Estimated)

```tsx
itemSize={{
  mode: 'variable',
  estimatedItemHeight: 80,
  getItemHeight: (index, item) => {
    // Optional: return actual height if known
    return item.isLarge ? 120 : 60;
  }
}}
```

**Note:** Variable height support is currently experimental. For best results, use fixed heights.

## Render Function

The `children` prop is a render function that receives two parameters:

```tsx
(item: T, index: () => number) => VNode
```

- **item**: The data item to render
- **index**: A reactive getter function that returns the current index

**Important:** The index is a getter function (reactive signal) to support efficient re-ordering without re-rendering all items.

```tsx
// Correct usage
{(item, index) => (
  <div>{index()}: {item.name}</div>
)}

// Incorrect - index is a function, not a number
{(item, index) => (
  <div>{index}: {item.name}</div>
)}
```

## Performance Tips

### 1. Use Stable Keys

Provide a `getKey` function that returns stable, unique identifiers for your items:

```tsx
getKey={(item) => item.id}
```

### 2. Optimize Overscan

The `overscan` prop controls how many extra items are rendered beyond the visible viewport:

- **Lower values (1-2)**: Less memory usage, but may show blank areas during fast scrolling
- **Higher values (5-10)**: Smoother scrolling, but more items rendered

Default is `3`, which works well for most cases.

### 3. Fixed Heights When Possible

Fixed heights provide the best performance:

```tsx
itemSize={50}  // Preferred for uniform items
```

### 4. Batch Updates

When updating the items array, batch changes in a single signal update:

```tsx
// Good - single update
items.set(newItems);

// Less efficient - multiple updates
newItems.forEach(item => items.update(arr => [...arr, item]));
```

## Accessibility

List automatically includes accessibility attributes:

- Container has `role="list"` and `tabindex="0"` (when virtual)
- Each item has `role="listitem"` and appropriate `aria-rowindex` (when virtual)
- Container includes `aria-rowcount` with total item count (when virtual)

