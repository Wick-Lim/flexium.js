---
title: DrawRect - Canvas Rectangle Component
description: API reference for Flexium's DrawRect component. Draw rectangles on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: DrawRect Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: DrawRect component for drawing rectangles on canvas. Declarative JSX syntax with reactive properties.
---

# DrawRect

Draws a rectangle on the canvas.

## Usage

```tsx
import { Canvas, DrawRect } from 'flexium-canvas/dom';

<Canvas width={200} height={200}>
  <DrawRect
    x={10}
    y={10}
    width={100}
    height={50}
    fill="green"
    stroke="black"
    strokeWidth={2}
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `x` | `number \| StateValue<number>` | The x-coordinate of the top-left corner. |
| `y` | `number \| StateValue<number>` | The y-coordinate of the top-left corner. |
| `width` | `number \| StateValue<number>` | The width of the rectangle. |
| `height` | `number \| StateValue<number>` | The height of the rectangle. |
| `fill` | `string \| StateValue<string>` | The fill color. |
| `stroke` | `string \| StateValue<string>` | The stroke color. |
| `strokeWidth` | `number \| StateValue<number>` | The width of the stroke. |
| `opacity` | `number \| StateValue<number>` | Opacity (0 to 1). |
