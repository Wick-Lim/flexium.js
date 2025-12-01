---
title: Animated Circle Example - Canvas Animation
description: Create smooth canvas animations with Flexium. Learn reactive canvas rendering with animated shapes and transitions.
head:
  - - meta
    - property: og:title
      content: Animated Circle Example - Flexium Canvas
  - - meta
    - property: og:description
      content: Smooth canvas animations using Flexium's declarative canvas API. Reactive shapes with signal-based state.
---

# Animated Circle Example

This example demonstrates animated canvas rendering with Flexium's reactive Canvas API.

## Basic Animation

```tsx
import { state, effect } from 'flexium'
import { Canvas, Circle } from 'flexium'

function AnimatedCircle() {
  const [x, setX] = state(100)
  const [y, setY] = state(100)
  const [radius, setRadius] = state(30)

  // Animation loop
  effect(() => {
    let frame: number
    let time = 0

    const animate = () => {
      time += 0.02
      setX(200 + Math.cos(time) * 100)
      setY(200 + Math.sin(time) * 100)
      setRadius(30 + Math.sin(time * 2) * 10)
      frame = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(frame)
  })

  return (
    <Canvas width={400} height={400} style={{ background: '#1a1a2e' }}>
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill="#646cff"
      />
    </Canvas>
  )
}
```

## Multiple Animated Circles

```tsx
function MultipleCircles() {
  const [time, setTime] = state(0)

  effect(() => {
    let frame: number
    const animate = () => {
      setTime(t => t + 0.02)
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  })

  // Computed positions for each circle
  const circles = [
    { offset: 0, color: '#ff6b6b' },
    { offset: Math.PI * 0.5, color: '#4ecdc4' },
    { offset: Math.PI, color: '#646cff' },
    { offset: Math.PI * 1.5, color: '#ffd93d' }
  ]

  return (
    <Canvas width={400} height={400} style={{ background: '#1a1a2e' }}>
      {circles.map(({ offset, color }) => (
        <Circle
          x={() => 200 + Math.cos(time() + offset) * 80}
          y={() => 200 + Math.sin(time() + offset) * 80}
          radius={25}
          fill={color}
        />
      ))}
    </Canvas>
  )
}
```

## Interactive Animation

```tsx
function InteractiveCircle() {
  const [mouseX, setMouseX] = state(200)
  const [mouseY, setMouseY] = state(200)
  const [targetX, setTargetX] = state(200)
  const [targetY, setTargetY] = state(200)

  // Smooth follow animation
  effect(() => {
    let frame: number
    const animate = () => {
      setTargetX(x => x + (mouseX() - x) * 0.1)
      setTargetY(y => y + (mouseY() - y) * 0.1)
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  })

  const handleMouseMove = (e: MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    setMouseX(e.clientX - rect.left)
    setMouseY(e.clientY - rect.top)
  }

  return (
    <Canvas
      width={400}
      height={400}
      style={{ background: '#1a1a2e', cursor: 'crosshair' }}
      onmousemove={handleMouseMove}
    >
      {/* Trail circles */}
      <Circle x={targetX} y={targetY} radius={40} fill="rgba(100, 108, 255, 0.3)" />
      <Circle x={targetX} y={targetY} radius={25} fill="rgba(100, 108, 255, 0.5)" />
      <Circle x={targetX} y={targetY} radius={15} fill="#646cff" />
    </Canvas>
  )
}
```

## Pulsing Effect

```tsx
function PulsingCircle() {
  const [scale, setScale] = state(1)

  effect(() => {
    let frame: number
    let time = 0

    const animate = () => {
      time += 0.05
      setScale(1 + Math.sin(time) * 0.3)
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  })

  return (
    <Canvas width={400} height={400} style={{ background: '#1a1a2e' }}>
      {/* Outer glow */}
      <Circle
        x={200}
        y={200}
        radius={() => 60 * scale()}
        fill="rgba(100, 108, 255, 0.2)"
      />
      {/* Middle ring */}
      <Circle
        x={200}
        y={200}
        radius={() => 45 * scale()}
        fill="rgba(100, 108, 255, 0.4)"
      />
      {/* Core */}
      <Circle
        x={200}
        y={200}
        radius={() => 30 * scale()}
        fill="#646cff"
      />
    </Canvas>
  )
}
```

## Key Concepts

- **Animation Loop**: Using `effect()` with `requestAnimationFrame` for smooth animations
- **Cleanup**: Returning a cleanup function to cancel animation frames
- **Reactive Props**: Passing getter functions to canvas component props
- **Mouse Interaction**: Combining mouse events with canvas animations
