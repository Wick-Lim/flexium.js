---
title: Text - Text Rendering Component
description: API reference for Flexium's Text component. Render and style text content with cross-platform support.
head:
  - - meta
    - property: og:title
      content: Text Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Text component for rendering text content in Flexium. Universal primitive with styling options.
---

# Text

Renders text content.

## Usage

```tsx
import { Text } from 'flexium/primitives';

function App() {
  return (
    <Text style={{ fontSize: 18, color: '#333' }}>
      Hello World
    </Text>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `any` | - | Text content. |
| `style` | `TextStyle` | - | Text styles (color, fontSize, etc.). |
| `onPress` | `() => void` | - | Click/Touch handler. |
| `numberOfLines` | `number` | - | Max number of lines (truncates if exceeded). |
