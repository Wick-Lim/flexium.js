---
title: ScrollView - Scrollable Container Component
description: API reference for Flexium's ScrollView component. Create scrollable containers with cross-platform support.
head:
  - - meta
    - property: og:title
      content: ScrollView Component - Flexium API Reference
  - - meta
    - property: og:description
      content: ScrollView component for creating scrollable containers. Universal primitive with vertical and horizontal scroll.
---

# ScrollView

A container that supports scrolling.

## Usage

```tsx
import { ScrollView, Column, Text } from 'flexium';

function App() {
  return (
    <ScrollView style={{ height: 300 }}>
      <Column padding={20} gap={10}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        {/* ... more items */}
      </Column>
    </ScrollView>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontal` | `boolean` | `false` | If true, scrolls horizontally. |
| `showsHorizontalScrollIndicator` | `boolean` | `true` | Whether to show the horizontal scroll indicator. |
| `showsVerticalScrollIndicator` | `boolean` | `true` | Whether to show the vertical scroll indicator. |
| `style` | `object` | - | Style object. |
