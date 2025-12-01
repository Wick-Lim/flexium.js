---
title: Circle - Canvas Circle Component
description: API reference for Flexium's Circle component. Draw circles on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: Circle Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: Circle component for drawing circles on canvas. Declarative JSX syntax with reactive properties.
---

# Circle

Draws a circle on the canvas.

## Usage

```tsx
import { Canvas, Circle } from 'flexium';

<Canvas width={200} height={200}>
  <Circle
    x={100}
    y={100}
    radius={50}
    fill="orange"
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `x` | `number \| Signal<number>` | The x-coordinate of the center. |
| `y` | `number \| Signal<number>` | The y-coordinate of the center. |
| `radius` | `number \| Signal<number>` | The radius of the circle. |
| `fill` | `string \| Signal<string>` | The fill color. |
| `stroke` | `string \| Signal<string>` | The stroke color. |
| `strokeWidth` | `number \| Signal<number>` | The width of the stroke. |
| `opacity` | `number \| Signal<number>` | Opacity (0 to 1). |
