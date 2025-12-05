---
title: Line - Canvas Line Component
description: API reference for Flexium's Line component. Draw straight lines on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: Line Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: Line component for drawing straight lines on canvas. Declarative JSX syntax with stroke options.
---

# Line

Draws a straight line on the canvas.

## Usage

```tsx
import { Canvas, Line } from 'flexium/canvas';

<Canvas width={200} height={200}>
  <Line
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
| `x1` | `number \| Signal<number>` | Start x-coordinate. |
| `y1` | `number \| Signal<number>` | Start y-coordinate. |
| `x2` | `number \| Signal<number>` | End x-coordinate. |
| `y2` | `number \| Signal<number>` | End y-coordinate. |
| `stroke` | `string \| Signal<string>` | The line color. |
| `strokeWidth` | `number \| Signal<number>` | The width of the line. |
| `opacity` | `number \| Signal<number>` | Opacity (0 to 1). |

## Interactive Demo

<script setup>
import LineDemo from '../../components/LineDemo.vue'
</script>

<LineDemo />
