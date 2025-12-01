---
title: Path - Canvas Path Component
description: API reference for Flexium's Path component. Draw custom SVG-like paths on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: Path Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: Path component for drawing custom SVG-like paths on canvas. Supports complex shapes and curves.
---

# Path

Draws a custom SVG-like path on the canvas.

## Usage

```tsx
import { Canvas, Path } from 'flexium';

<Canvas width={200} height={200}>
  <Path
    d="M 10 10 L 50 10 L 30 50 Z"
    fill="purple"
    stroke="black"
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `d` | `string \| Signal<string>` | The path data (SVG format). |
| `fill` | `string \| Signal<string>` | The fill color. |
| `stroke` | `string \| Signal<string>` | The stroke color. |
| `strokeWidth` | `number \| Signal<number>` | The width of the stroke. |
| `opacity` | `number \| Signal<number>` | Opacity (0 to 1). |
