# VirtualList Example

A comprehensive demonstration of Flexium's VirtualList component for efficiently rendering large lists with thousands of items.

## Overview

This example showcases the VirtualList component's ability to handle large datasets efficiently by only rendering items that are visible in the viewport. This technique, known as "windowing" or "virtualization", provides excellent performance even with hundreds of thousands of items.

## Features Demonstrated

- **10,000+ items by default** - Efficiently render large datasets
- **Custom item rendering** - Rich item components with avatars, titles, descriptions, and metadata
- **Fixed item heights** - Configurable item height (40-200px)
- **Programmatic scrolling** - Scroll to top, middle, bottom, or random items
- **Overscan buffer** - Renders 5 extra items above/below viewport for smooth scrolling
- **Real-time statistics** - Live updates showing:
  - Total items in dataset
  - Number of rendered items (visible + overscan)
  - Current scroll position
  - Visible range (start/end indices)
- **Dynamic data loading** - Switch between 1K, 10K, and 100K items
- **Accessibility** - Proper ARIA attributes and keyboard navigation
- **Performance metrics** - Console logging and visual indicators

## How VirtualList Works

### Traditional Rendering Problem

Without virtualization, rendering 100,000 list items would:
- Create 100,000 DOM nodes
- Consume 50-100MB of memory
- Cause significant lag during scrolling
- Make initial render very slow
- Impact overall application performance

### VirtualList Solution

With VirtualList, you get:
- Only ~20-30 DOM nodes rendered at any time (visible + overscan)
- Less than 1MB of memory usage regardless of total count
- Smooth 60fps scrolling even with millions of items
- Fast initial render
- Minimal performance impact

### Key Concepts

1. **Viewport**: The visible area where items are displayed
2. **Overscan**: Extra items rendered above/below viewport for smooth scrolling
3. **Item Height**: Fixed or estimated height for each item (this example uses fixed)
4. **Virtualization**: Only rendering visible items, recycling DOM nodes as you scroll

## Usage

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app will open at `http://localhost:3002`

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## API Reference

### VirtualList Props

```typescript
interface VirtualListProps<T> {
  // Data source - reactive getter function
  items: () => T[]

  // Render function for each item
  children: (item: T, index: () => number) => VNode

  // Container height (required for viewport calculation)
  height: number | string

  // Width (optional, defaults to 100%)
  width?: number | string

  // Item height - number for fixed, config object for variable
  itemSize: number | SizeConfig

  // Number of extra items to render above/below viewport (default: 3)
  overscan?: number

  // Key extractor for stable item identity
  getKey?: (item: T, index: number) => string | number

  // Scroll event callback
  onScroll?: (scrollTop: number) => void

  // Visible range change callback
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void
}
```

### Basic Example

```tsx
import { signal } from 'flexium'
import { VirtualList } from 'flexium/primitives'

const items = signal(
  Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
)

function MyList() {
  return (
    <VirtualList
      items={items}
      height={400}
      itemSize={50}
      overscan={3}
      getKey={(item) => item.id}
    >
      {(item, index) => (
        <div style="padding: 10px; border-bottom: 1px solid #ccc;">
          {index()}: {item.name}
        </div>
      )}
    </VirtualList>
  )
}
```

### Advanced Example with Variable Heights

```tsx
import { VirtualList } from 'flexium/primitives'

<VirtualList
  items={items}
  height={600}
  itemSize={{
    mode: 'variable',
    estimatedItemHeight: 80
  }}
  overscan={5}
>
  {(item, index) => (
    <div style="padding: 20px;">
      {/* Variable height content */}
    </div>
  )}
</VirtualList>
```

## Configuration

### Item Heights

The example includes controls to adjust item height dynamically (40-200px). This demonstrates how changing the `itemSize` prop affects:
- Total scrollable height
- Number of visible items
- Scroll position calculations

### Dataset Sizes

Try different dataset sizes to see performance:
- **1K items** - Very quick load, smooth scrolling
- **10K items** - Default size, excellent performance
- **100K items** - Stress test, still performs well

### Overscan Buffer

The `overscan` prop (set to 5 in this example) determines how many extra items are rendered outside the visible viewport. Benefits:
- Smoother scrolling (no flashing)
- Reduces jank during fast scrolling
- Trade-off: slightly more DOM nodes

## Performance Tips

1. **Use stable keys**: Provide a `getKey` function for optimal performance
2. **Fixed heights preferred**: Fixed item heights perform better than variable
3. **Optimize render function**: Keep item rendering lightweight
4. **Reasonable overscan**: 3-5 items is usually optimal
5. **Avoid inline styles**: Use CSS classes when possible

## Accessibility

VirtualList includes proper accessibility support:
- `role="list"` on container
- `role="listitem"` on each item
- `aria-rowcount` showing total items
- `aria-rowindex` on each visible item
- `tabindex="0"` for keyboard navigation

## Browser Support

VirtualList uses modern web APIs:
- CSS transforms for positioning
- Passive scroll listeners for performance
- IntersectionObserver for visibility (future enhancement)

Supported browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Further Reading

- [Flexium Documentation](../../README.md)
- [VirtualList API Reference](../../packages/flexium/src/primitives/VirtualList/README.md)
- [Performance Best Practices](../../docs/performance.md)

## License

MIT - see LICENSE file in the repository root
