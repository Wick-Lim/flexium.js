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
import { Canvas, Rect, Circle } from 'flexium'

<Canvas width={400} height={400}>
  <Rect x={50} y={50} width={100} height={100} fill="blue" />
  <Circle x={200} y={200} radius={50} fill="red" />
</Canvas>
```

## Reactive Canvas

Canvas elements update automatically when signals change:

```tsx
import { signal } from 'flexium'
import { Canvas, Circle } from 'flexium'

function AnimatedCircle() {
  const x = signal(50)

  // Animate
  setInterval(() => {
    x.value = (x.value + 1) % 400
  }, 16)

  return (
    <Canvas width={400} height={400}>
      <Circle x={x} y={200} radius={30} fill="blue" />
    </Canvas>
  )
}
```

The canvas re-renders automatically when `x` changes. No manual `requestAnimationFrame` needed!

## Available Primitives

### Rect

Draw rectangles:

```tsx
<Rect
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

### Circle

Draw circles:

```tsx
<Circle
  x={100}
  y={100}
  radius={50}
  fill="red"
  stroke="black"
  strokeWidth={2}
/>
```

### Path

Draw SVG paths:

```tsx
<Path
  d="M 10 10 L 100 100 L 10 100 Z"
  fill="green"
  stroke="black"
  strokeWidth={2}
/>
```

### CanvasText

Render text:

```tsx
<CanvasText
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

### Line

Draw lines:

```tsx
<Line
  x1={10}
  y1={10}
  x2={100}
  y2={100}
  stroke="black"
  strokeWidth={2}
/>
```

### Arc

Draw arcs:

```tsx
<Arc
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
import { signal } from 'flexium'
import { Canvas, Circle } from 'flexium'

function InteractiveCanvas() {
  const mouseX = signal(200)
  const mouseY = signal(200)

  return (
    <div
      onmousemove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.value = e.clientX - rect.left
        mouseY.value = e.clientY - rect.top
      }}
    >
      <Canvas width={400} height={400}>
        <Circle x={mouseX} y={mouseY} radius={20} fill="blue" />
      </Canvas>
    </div>
  )
}
```

## Performance

### Automatic Batching

Canvas updates are automatically batched and debounced with `requestAnimationFrame`:

```tsx
const x = signal(0)
const y = signal(0)

// Both changes trigger only ONE canvas redraw
x.value = 100
y.value = 200
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
import { signal, effect } from 'flexium'
import { Canvas, Line, Circle, CanvasText } from 'flexium'

function RealtimeChart() {
  const dataPoints = signal([50, 60, 55, 70, 65, 80])

  // Simulate real-time data
  effect(() => {
    const interval = setInterval(() => {
      const newPoint = 50 + Math.random() * 50
      dataPoints.value = [...dataPoints.value.slice(1), newPoint]
    }, 1000)

    return () => clearInterval(interval)
  })

  return (
    <Canvas width={600} height={300} style={{ border: '1px solid #ccc' }}>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Line
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
      {dataPoints.value.map((value, i) => {
        if (i === 0) return null
        const x1 = (i - 1) * 100
        const y1 = 300 - dataPoints.value[i - 1] * 2
        const x2 = i * 100
        const y2 = 300 - value * 2

        return (
          <Line
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
      {dataPoints.value.map((value, i) => (
        <Circle
          key={i}
          x={i * 100}
          y={300 - value * 2}
          radius={4}
          fill="blue"
        />
      ))}

      {/* Labels */}
      <CanvasText
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

- Explore [Canvas API Reference](/api/canvas/canvas)
- Check out [Canvas Examples](/examples/animated-circle)
- Learn about [Performance](/guide/performance)
