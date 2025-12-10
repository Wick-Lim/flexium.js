---
title: DrawArc - Canvas Arc Component
description: API reference for Flexium's DrawArc component. Draw arcs and partial circles on canvas with reactive properties.
head:
  - - meta
    - property: og:title
      content: DrawArc Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: DrawArc component for drawing arcs and partial circles on canvas. Great for charts and gauges.
---

# DrawArc

Draws an arc on the canvas.

## Usage

```tsx
import { Canvas, DrawArc } from 'flexium/canvas';

<Canvas width={200} height={200}>
  <DrawArc
    x={100}
    y={100}
    radius={50}
    startAngle={0}
    endAngle={Math.PI}
    stroke="blue"
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `x` | `number \| Signal<number>` | Center x-coordinate. |
| `y` | `number \| Signal<number>` | Center y-coordinate. |
| `radius` | `number \| Signal<number>` | Arc radius. |
| `startAngle` | `number \| Signal<number>` | Start angle in radians. |
| `endAngle` | `number \| Signal<number>` | End angle in radians. |
| `counterclockwise` | `boolean` | Draw counter-clockwise. |
| `stroke` | `string \| Signal<string>` | The stroke color. |
| `fill` | `string \| Signal<string>` | The fill color (if closing the path). |
