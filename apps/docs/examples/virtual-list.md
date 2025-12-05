---
title: Virtual List - Performance
description: Efficiently render large lists with VirtualList for optimal performance.
head:
  - - meta
    - property: og:title
      content: Virtual List Example - Flexium
  - - meta
    - property: og:description
      content: High-performance list rendering with virtualization in Flexium.
---

# Virtual List Example

This example demonstrates efficiently rendering large lists using VirtualList.

## Features Demonstrated

- Rendering 10,000+ items efficiently
- Custom item rendering
- Configurable item heights
- Scroll to specific items
- Overscan buffer for smooth scrolling
- Real-time statistics

## Basic Usage

```tsx
import { signal, computed } from 'flexium/core'
import { render } from 'flexium/dom'
import { VirtualList } from 'flexium'

interface User {
  id: number
  name: string
  email: string
}

// Generate large dataset
function generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`
  }))
}

const users = signal(generateUsers(10000))

function App() {
  return (
    <div>
      <h1>VirtualList Example</h1>
      <p>Rendering {users.value.length.toLocaleString()} items</p>

      <VirtualList
        items={users}
        height={600}
        itemSize={80}
        overscan={5}
        getKey={(user) => user.id}
      >
        {(user: User, index: () => number) => (
          <div class="item">
            <div class="avatar">{user.name.charAt(0)}</div>
            <div class="content">
              <div class="title">{user.name}</div>
              <div class="email">{user.email}</div>
            </div>
          </div>
        )}
      </VirtualList>
    </div>
  )
}
```

## With Scroll Tracking

```tsx
const scrollPosition = signal(0)
const visibleRange = signal({ start: 0, end: 0 })

function App() {
  return (
    <div>
      <div class="stats">
        <div>Scroll: {Math.round(scrollPosition.value)}px</div>
        <div>Visible: {visibleRange.value.start} - {visibleRange.value.end}</div>
      </div>

      <VirtualList
        items={users}
        height={600}
        itemSize={80}
        onScroll={(scrollTop) => {
          scrollPosition.value = scrollTop
        }}
        onVisibleRangeChange={(start, end) => {
          visibleRange.value = { start, end }
        }}
      >
        {(user) => <UserItem user={user} />}
      </VirtualList>
    </div>
  )
}
```

## Scroll to Item

```tsx
function scrollToItem(index: number) {
  const container = document.querySelector('[role="list"]') as HTMLElement
  if (container) {
    container.scrollTop = index * itemHeight.value
  }
}

<button onClick={() => scrollToItem(0)}>Scroll to Top</button>
<button onClick={() => scrollToItem(users.value.length / 2)}>Scroll to Middle</button>
<button onClick={() => scrollToItem(users.value.length - 1)}>Scroll to Bottom</button>
```

## Dynamic Item Height

```tsx
const itemHeight = signal(80)

<div class="controls">
  <label>Item Height:</label>
  <input
    type="number"
    value={itemHeight.value}
    min="40"
    max="200"
    oninput={(e) => itemHeight.value = parseInt(e.target.value)}
  />
</div>

<VirtualList
  items={users}
  height={600}
  itemSize={itemHeight.value}
>
  {(user) => <UserItem user={user} />}
</VirtualList>
```

## Loading Different Dataset Sizes

```tsx
<div class="controls">
  <button onClick={() => users.value = generateUsers(1000)}>
    Load 1K Items
  </button>
  <button onClick={() => users.value = generateUsers(10000)}>
    Load 10K Items
  </button>
  <button onClick={() => users.value = generateUsers(100000)}>
    Load 100K Items
  </button>
</div>
```

## Performance Benefits

### Without Virtualization
- 100,000 DOM nodes = 50-100MB memory
- Significant lag during scrolling
- Slow initial render

### With VirtualList
- Only ~20-30 DOM nodes rendered (visible + overscan)
- Less than 1MB memory regardless of total items
- Smooth scrolling with any dataset size
- Fast initial render

## VirtualList Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `Signal<T[]>` | Array of items to render |
| `height` | `number` | Container height in pixels |
| `itemSize` | `number` | Height of each item |
| `overscan` | `number` | Extra items to render above/below |
| `getKey` | `(item: T) => Key` | Function to get unique key |
| `onScroll` | `(scrollTop: number) => void` | Scroll position callback |
| `onVisibleRangeChange` | `(start, end) => void` | Visible range callback |
