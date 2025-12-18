---
title: DrawLine - Canvas Line Component
description: API reference for Flexium's DrawLine component. Draw straight lines on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: DrawLine Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: DrawLine component for drawing straight lines on canvas. Declarative JSX syntax with stroke options.
---

# DrawLine

Draws a straight line on the canvas.

## Usage

```tsx
import { Canvas, DrawLine } from 'flexium-canvas/dom';

<Canvas width={200} height={200}>
  <DrawLine
    x1={10}
    y1={10}
    x2={100}
    y2={100}
    stroke="red"
    strokeWidth={5}
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `x1` | `number \| StateValue<number>` | Start x-coordinate. |
| `y1` | `number \| StateValue<number>` | Start y-coordinate. |
| `x2` | `number \| StateValue<number>` | End x-coordinate. |
| `y2` | `number \| StateValue<number>` | End y-coordinate. |
| `stroke` | `string \| StateValue<string>` | The line color. |
| `strokeWidth` | `number \| StateValue<number>` | The width of the line. |
| `opacity` | `number \| StateValue<number>` | Opacity (0 to 1). |
