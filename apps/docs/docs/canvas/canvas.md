---
title: Canvas - Canvas Container Component
description: API reference for Flexium's Canvas component. Container for declarative canvas-based drawings with JSX.
head:
  - - meta
    - property: og:title
      content: Canvas Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Canvas component is the container for all canvas-based drawings in Flexium. Declarative and reactive.
---

<script setup>
import CanvasDemo from '../../components/CanvasDemo.vue'
</script>

# Canvas

The `Canvas` component acts as a container for all canvas-based drawings. It creates a `<canvas>` element on the web.

## Live Demo

Move your mouse over the canvas to see particle effects:

<ClientOnly>
  <CanvasDemo />
</ClientOnly>

## Usage

```tsx
import { Canvas, Rect, Circle } from 'flexium/canvas';

function DrawingApp() {
  return (
    <Canvas width={500} height={500} style={{ border: '1px solid black' }}>
      <Rect x={10} y={10} width={100} height={100} fill="red" />
      <Circle x={200} y={200} radius={50} fill="blue" />
    </Canvas>
  );
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `number` | Width of the canvas in pixels. |
| `height` | `number` | Height of the canvas in pixels. |
| `children` | `any` | Child components to render (Rect, Circle, etc.). |
| `style` | `object` | CSS styles for the canvas container. |
