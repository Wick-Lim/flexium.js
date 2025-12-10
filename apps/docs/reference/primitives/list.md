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

# List

A flexible component for rendering lists with optional virtualization support.

## Basic Usage

```tsx
import { List } from 'flexium/primitives';
import { state } from 'flexium/core';

// Simple list (renders all items)
const [items] = state(['Apple', 'Banana', 'Cherry']);

<List items={items}>
  {(item, index) => <div>{index()}: {item}</div>}
</List>

// Virtual list (for large datasets)
// Virtual list (for large datasets)
const [largeItems] = state(Array.from({ length: 10000 }, (_, i) => `Item ${i}`));

<List items={largeItems} virtual height={400} itemSize={50}>
  {(item, index) => <div>{item}</div>}
</List>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `() => T[]` | Required | Data source - reactive getter function |
| `children` | `(item: T, index: () => number) => FNode` | Required | Render function for each item |
| `virtual` | `boolean` | `false` | Enable virtualization for large lists |
| `height` | `number \| string` | - | Container height (required when virtual) |
| `width` | `number \| string` | `'100%'` | Container width |
| `itemSize` | `number \| SizeConfig` | - | Item height (required when virtual) |
| `overscan` | `number` | `3` | Extra items to render (virtual only) |
| `getKey` | `(item: T, index: number) => Key` | - | Key extractor for stable identity |
| `onScroll` | `(scrollTop: number) => void` | - | Scroll callback (virtual only) |
| `onVisibleRangeChange` | `(start, end) => void` | - | Visible range callback (virtual only) |
| `class` | `string` | - | CSS class name |
| `style` | `Record<string, string \| number>` | - | Inline styles |

## SizeConfig

```typescript
// Fixed size
interface FixedSizeConfig {
  mode: 'fixed';
  itemHeight: number;
}

// Variable size (experimental)
interface VariableSizeConfig {
  mode: 'variable';
  estimatedItemHeight: number;
  getItemHeight?: (index: number, item: unknown) => number;
}
```

## Examples

### Simple List

```tsx
const [fruits] = state(['Apple', 'Banana', 'Cherry', 'Date']);

<List items={fruits} getKey={(item) => item}>
  {(fruit, index) => (
    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
      {index()}: {fruit}
    </div>
  )}
</List>
```

### Virtual List with 10K Items

```tsx
const [items] = state(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    email: `user${i}@example.com`
  }))
);

<List
  items={items}
  virtual
  height={600}
  itemSize={80}
  overscan={5}
  getKey={(item) => item.id}
  onVisibleRangeChange={(start, end) => {
    console.log(`Visible: ${start} - ${end}`);
  }}
>
  {(user, index) => (
    <div class="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )}
</List>
```

