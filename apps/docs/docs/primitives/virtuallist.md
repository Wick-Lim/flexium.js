---
title: VirtualList - High-Performance List Rendering
description: API reference for Flexium's VirtualList component. Efficiently render large lists with virtualization.
head:
  - - meta
    - property: og:title
      content: VirtualList Component - Flexium API Reference
  - - meta
    - property: og:description
      content: VirtualList is a high-performance primitive component for rendering large lists in Flexium. Uses virtualization to render only visible items.
---

# VirtualList

A high-performance component for rendering large lists efficiently.

The `VirtualList` component uses virtualization to render only the items visible in the viewport, plus a configurable number of overscan items for smooth scrolling. This dramatically improves performance when working with lists containing thousands of items.

## When to Use VirtualList

Use VirtualList when:
- Rendering lists with hundreds or thousands of items
- Item count is too large to render all at once without performance issues
- You need smooth scrolling performance with large datasets
- Memory efficiency is important

For small lists (< 100 items), a regular list with ScrollView may be simpler.

## Usage

### Basic Usage

```tsx
import { VirtualList } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))
  );

  return (
    <VirtualList
      items={items}
      height={400}
      itemSize={50}
    >
      {(item, index) => (
        <div style={{ padding: '10px' }}>
          {index()}: {item.name}
        </div>
      )}
    </VirtualList>
  );
}
```

### With Custom Width

```tsx
import { VirtualList } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal(
    Array.from({ length: 5000 }, (_, i) => `Item ${i}`)
  );

  return (
    <VirtualList
      items={items}
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
    </VirtualList>
  );
}
```

### With Stable Keys

```tsx
import { VirtualList } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal([
    { id: 'a1', name: 'Alice' },
    { id: 'b2', name: 'Bob' },
    { id: 'c3', name: 'Charlie' },
    // ... thousands more
  ]);

  return (
    <VirtualList
      items={items}
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
    </VirtualList>
  );
}
```

### With Scroll Callbacks

```tsx
import { VirtualList } from 'flexium/primitives';
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
    <VirtualList
      items={items}
      height={400}
      itemSize={50}
      onScroll={handleScroll}
      onVisibleRangeChange={handleVisibleRangeChange}
    >
      {(item, index) => <div>{item}</div>}
    </VirtualList>
  );
}
```

### Variable Height Items (Estimated)

```tsx
import { VirtualList } from 'flexium/primitives';
import { signal } from 'flexium/signal';

function App() {
  const items = signal([
    { id: 1, title: 'Short', content: 'Brief' },
    { id: 2, title: 'Long', content: 'Much longer content...' },
    // ... more items with varying content length
  ]);

  return (
    <VirtualList
      items={items}
      height={600}
      itemSize={{
        mode: 'variable',
        estimatedItemHeight: 80
      }}
      getKey={(item) => item.id}
    >
      {(item, index) => (
        <div style={{ padding: '15px' }}>
          <h3>{item.title}</h3>
          <p>{item.content}</p>
        </div>
      )}
    </VirtualList>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `() => T[]` | - | **Required.** Reactive array or getter function returning the items to render. |
| `children` | `(item: T, index: () => number) => VNode` | - | **Required.** Render function for each item. Receives the item and a reactive index getter. |
| `height` | `number \| string` | - | **Required.** Container height (used for viewport calculations). Can be a number (pixels) or CSS string like `'100vh'`. |
| `itemSize` | `number \| SizeConfig` | - | **Required.** Height of each item. Can be a number for fixed heights or a SizeConfig object for variable heights. |
| `width` | `number \| string` | `'100%'` | Container width. Can be a number (pixels) or CSS string. |
| `overscan` | `number` | `3` | Number of extra items to render above and below the viewport for smooth scrolling. |
| `getKey` | `(item: T, index: number) => string \| number` | - | Key extractor for stable identity. If not provided, indices are used as keys. |
| `onScroll` | `(scrollTop: number) => void` | - | Callback fired when the list scrolls. Receives the current scroll position. |
| `onVisibleRangeChange` | `(startIndex: number, endIndex: number) => void` | - | Callback fired when the visible range changes. Receives start and end indices. |

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

### SizeConfig Types

#### FixedSizeConfig

For lists where all items have the same height:

```typescript
interface FixedSizeConfig {
  mode: 'fixed';
  itemHeight: number;
}
```

#### VariableSizeConfig

For lists where items have different heights:

```typescript
interface VariableSizeConfig {
  mode: 'variable';
  estimatedItemHeight: number;
  getItemHeight?: (index: number, item: unknown) => number;
}
```

**Note:** Variable height support is currently experimental. The component uses estimated heights for positioning. For best results, provide accurate estimates or use fixed heights.

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

This allows VirtualList to efficiently recycle DOM nodes when items are added, removed, or reordered.

### 2. Optimize Overscan

The `overscan` prop controls how many extra items are rendered beyond the visible viewport:

- **Lower values (1-2)**: Less memory usage, but may show blank areas during fast scrolling
- **Higher values (5-10)**: Smoother scrolling, but more items rendered

Default is `3`, which works well for most cases.

### 3. Memoize Item Renderers

For complex item components, consider memoization to avoid unnecessary re-renders:

```tsx
const ItemRenderer = memo((item, index) => {
  return (
    <div>
      <ExpensiveComponent data={item} />
    </div>
  );
});

<VirtualList items={items} height={400} itemSize={50}>
  {ItemRenderer}
</VirtualList>
```

### 4. Fixed Heights When Possible

Fixed heights provide the best performance:

```tsx
itemSize={50}  // Preferred for uniform items
```

Variable heights require estimation and may need adjustments.

### 5. Batch Updates

When updating the items array, batch changes in a single signal update:

```tsx
// Good - single update
items.set(newItems);

// Less efficient - multiple updates
newItems.forEach(item => items.update(arr => [...arr, item]));
```

### 6. Avoid Heavy Computations in Render

Keep the render function lightweight. Move expensive operations outside:

```tsx
// Bad - heavy computation on every render
{(item, index) => {
  const processed = heavyComputation(item);
  return <div>{processed}</div>;
}}

// Good - compute once and store in item
const processedItems = signal(
  rawItems.map(item => ({
    ...item,
    processed: heavyComputation(item)
  }))
);

{(item, index) => <div>{item.processed}</div>}
```

## Accessibility

VirtualList automatically includes accessibility attributes:

- Container has `role="list"` and `tabindex="0"`
- Each item has `role="listitem"` and appropriate `aria-rowindex`
- Container includes `aria-rowcount` with total item count

These attributes ensure screen readers can properly navigate the virtualized list.

## Browser Compatibility

VirtualList uses modern browser features:
- CSS transforms for positioning
- Passive scroll event listeners
- IntersectionObserver-style viewport calculations

Supported in all modern browsers (Chrome, Firefox, Safari, Edge).

## Cross-Platform Notes

- **Web**: Renders as a scrollable container with absolutely positioned items
- **Canvas**: Not currently supported (future feature)

## Limitations

1. **Fixed viewport height required**: The `height` prop must be specified for viewport calculations
2. **Vertical scrolling only**: Horizontal virtualization is not currently supported
3. **Variable heights experimental**: Best results with fixed-height items
4. **No grid layouts**: VirtualList renders a single-column list

For grid layouts with virtualization, consider using a custom solution or wait for future VirtualGrid component.
