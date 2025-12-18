---
title: DrawCircle - Canvas Circle Component
description: API reference for Flexium's DrawCircle component. Draw circles on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: DrawCircle Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: DrawCircle component for drawing circles on canvas. Declarative JSX syntax with reactive properties.
---

# DrawCircle

Draws a circle on the canvas.

## Usage

```tsx
import { Canvas, DrawCircle } from 'flexium-canvas';

<Canvas width={200} height={200}>
  <DrawCircle
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

## Interactive Demo

<script setup>
import CircleDemo from '../../components/CircleDemo.vue'
</script>

<CircleDemo />
