---
title: Canvas Rendering - Declarative Canvas with JSX
description: Build reactive canvas applications with Flexium's declarative JSX-based API. Perfect for games, data visualization, and custom graphics.
head:
  - - meta
    - property: og:title
      content: Canvas Rendering - Flexium
  - - meta
    - property: og:description
      content: Declarative JSX-based canvas rendering with built-in Signal reactivity for games, charts, and custom graphics.
---

# Canvas Rendering

Flexium provides declarative JSX-based canvas rendering with built-in Signal reactivity.

## Why Canvas?

Canvas is essential for:

- Data visualization (charts, graphs)
- Game development
- Image manipulation
- Custom UI elements
- Real-time animations

Traditional canvas code is imperative and hard to maintain. Flexium makes it declarative and reactive.

## Basic Usage

```tsx
import { Canvas, DrawRect, DrawCircle } from 'flexium/canvas'

<Canvas width={400} height={400}>
  <DrawRect x={50} y={50} width={100} height={100} fill="blue" />
  <DrawCircle x={200} y={200} radius={50} fill="red" />
</Canvas>
```

## Reactive Canvas

Canvas elements update automatically when state changes:

```tsx
import { useState, useEffect } from 'flexium/core'
import { Canvas, DrawCircle } from 'flexium/canvas'

function AnimatedCircle() {
  const [x, setX] = use(50)

  // Animate
  use(() => {
    const interval = setInterval(() => {
      setX(prev => (prev + 1) % 400)
    }, 16)
    return () => clearInterval(interval)
  })

  return (
    <Canvas width={400} height={400}>
      <DrawCircle x={x} y={200} radius={30} fill="blue" />
    </Canvas>
  )
}
```

The canvas re-renders automatically when `x` changes. No manual `requestAnimationFrame` needed!

## Available Primitives

### DrawRect

Draw rectangles:

```tsx
<DrawRect
  x={50}
  y={50}
  width={100}
  height={100}
  fill="blue"
  stroke="black"
  strokeWidth={2}
  opacity={0.8}
/>
```

### DrawCircle

Draw circles:

```tsx
<DrawCircle
  x={100}
  y={100}
  radius={50}
  fill="red"
  stroke="black"
  strokeWidth={2}
/>
```

### DrawPath

Draw SVG paths:

```tsx
<DrawPath
  d="M 10 10 L 100 100 L 10 100 Z"
  fill="green"
  stroke="black"
  strokeWidth={2}
/>
```

### DrawText

Render text:

```tsx
<DrawText
  x={100}
  y={100}
  text="Hello Canvas!"
  fill="black"
  fontSize={20}
  fontFamily="Arial"
  fontWeight="bold"
  textAlign="center"
/>
```

### DrawLine

Draw lines:

```tsx
<DrawLine
  x1={10}
  y1={10}
  x2={100}
  y2={100}
  stroke="black"
  strokeWidth={2}
/>
```

### DrawArc

Draw arcs:

```tsx
<DrawArc
  x={100}
  y={100}
  radius={50}
  startAngle={0}
  endAngle={Math.PI}
  fill="orange"
  stroke="black"
  strokeWidth={2}
/>
```

## Interactive Canvas

Combine with event handlers for interactivity:

```tsx
import { useState } from 'flexium/core'
import { Canvas, DrawCircle } from 'flexium/canvas'

function InteractiveCanvas() {
  const [mouseX, setMouseX] = use(200)
  const [mouseY, setMouseY] = use(200)

  return (
    <div
      onmousemove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMouseX(e.clientX - rect.left)
        setMouseY(e.clientY - rect.top)
      }}
    >
      <Canvas width={400} height={400}>
        <DrawCircle x={mouseX} y={mouseY} radius={20} fill="blue" />
      </Canvas>
    </div>
  )
}
```

## Performance

### Automatic Synchronization

Canvas updates are automatically synchronized and debounced with `requestAnimationFrame`:

```tsx
const [x, setX] = use(0)
const [y, setY] = use(0)

// Both changes trigger only ONE canvas redraw
setX(100)
setY(200)
```

### Manual Control

For advanced use cases, access the underlying canvas:

```tsx
<Canvas
  width={400}
  height={400}
  ref={(canvas) => {
    if (canvas) {
      const ctx = canvas.getContext('2d')
      // Manual drawing here
    }
  }}
>
  {/* JSX primitives */}
</Canvas>
```

## Example: Real-Time Chart

```tsx
import { useState, useEffect } from 'flexium/core'
import { Canvas, DrawLine, DrawCircle, DrawText } from 'flexium/canvas'

function RealtimeChart() {
  const [dataPoints, setDataPoints] = use([50, 60, 55, 70, 65, 80])

  // Simulate real-time data
  use(() => {
    const interval = setInterval(() => {
      const newPoint = 50 + Math.random() * 50
      setDataPoints(prev => [...prev.slice(1), newPoint])
    }, 1000)

    return () => clearInterval(interval)
  })

  return (
    <Canvas width={600} height={300} style={{ border: '1px solid #ccc' }}>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <DrawLine
          key={i}
          x1={0}
          y1={i * 60}
          x2={600}
          y2={i * 60}
          stroke="#eee"
          strokeWidth={1}
        />
      ))}

      {/* Data line */}
      {dataPoints.map((value, i) => {
        if (i === 0) return null
        const x1 = (i - 1) * 100
        const y1 = 300 - dataPoints[i - 1] * 2
        const x2 = i * 100
        const y2 = 300 - value * 2

        return (
          <DrawLine
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="blue"
            strokeWidth={2}
          />
        )
      })}

      {/* Data points */}
      {dataPoints.map((value, i) => (
        <DrawCircle
          key={i}
          x={i * 100}
          y={300 - value * 2}
          radius={4}
          fill="blue"
        />
      ))}

      {/* Labels */}
      <DrawText
        x={10}
        y={20}
        text="Real-Time Data"
        fontSize={16}
        fontWeight="bold"
        fill="black"
      />
    </Canvas>
  )
}
```

## Next Steps

- Explore [Canvas API Reference](/docs/canvas/canvas)
- Check out the [Showcase](/showcase) for live Canvas demos
- Learn about [Performance](/guide/performance)
