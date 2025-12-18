---
title: Motion - Declarative Animations
description: Create smooth, performant animations using Flexium's motion primitives powered by the Web Animations API. Learn about transforms, transitions, and spring physics.
head:
  - - meta
    - property: og:title
      content: Motion - Flexium Animation
  - - meta
    - property: og:description
      content: Declarative animations using Web Animations API. Supports transforms, opacity, spring physics, and layout animations.
---

# Motion

Flexium provides declarative animation primitives using the Web Animations API for smooth, performant animations without JavaScript requestAnimationFrame loops.

## Basic Usage

```tsx
import { MotionController } from 'flexium/primitives'

// Create element and controller
const element = document.createElement('div')
const controller = new MotionController(element)

// Animate
controller.animate({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 300,
})

document.body.appendChild(element)
```

## Animation Properties

Flexium supports animating these properties:

```tsx
interface AnimatableProps {
  x?: number              // translateX in pixels
  y?: number              // translateY in pixels
  scale?: number          // uniform scale
  scaleX?: number         // horizontal scale
  scaleY?: number         // vertical scale
  rotate?: number         // rotation in degrees
  opacity?: number        // 0-1
  width?: number | string // pixel or CSS value
  height?: number | string // pixel or CSS value
}
```

### Transform Example

```tsx
const controller = new MotionController(element)

controller.animate({
  initial: {
    x: -100,
    scale: 0.5,
    rotate: -45,
    opacity: 0,
  },
  animate: {
    x: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  duration: 500,
})
```

## MotionController API

The `MotionController` class provides programmatic control over animations.

### Constructor

```tsx
import { MotionController } from 'flexium/primitives'

const element = document.createElement('div')
const controller = new MotionController(element)
```

### animate() Method

```tsx
interface AnimateOptions {
  initial?: AnimatableProps       // Starting state
  animate?: AnimatableProps       // Target state
  exit?: AnimatableProps          // Exit animation state
  duration?: number               // Duration in ms (default: 300)
  spring?: SpringConfig           // Spring physics config
  easing?: string                 // CSS easing function
  delay?: number                  // Delay in ms
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}

controller.animate(options: AnimateOptions): void
```

### Controller Methods

```tsx
class MotionController {
  constructor(element: HTMLElement)
  animate(options: AnimateOptions): void
  animateExit(exitProps: AnimatableProps, duration?: number, easing?: string): Promise<void>
  enableLayoutAnimation(duration?: number, easing?: string): void
  disableLayoutAnimation(): void
  cancel(): void
  dispose(): void
}
```

### Example

```tsx
const element = document.createElement('div')
const controller = new MotionController(element)

// Initial animation
controller.animate({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
})

// Update animation later
controller.animate({
  animate: { opacity: 0.5, x: 100 },
  duration: 500,
})

// Cancel animation
controller.cancel()

// Cleanup
controller.dispose()
```

## Transitions

Control animation timing with duration and easing.

### Duration

```tsx
controller.animate({
  animate: { x: 100 },
  duration: 1000,  // 1 second
})
```

### Easing

Use CSS easing functions:

```tsx
controller.animate({
  animate: { x: 100 },
  easing: 'ease-in-out',  // CSS easing
})

// Or cubic-bezier
controller.animate({
  animate: { x: 100 },
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
})
```

Common easing values:
- `ease` (default)
- `ease-in`
- `ease-out`
- `ease-in-out`
- `linear`
- `cubic-bezier(x1, y1, x2, y2)`

### Delay

```tsx
controller.animate({
  animate: { opacity: 1 },
  delay: 500,  // Wait 500ms before animating
})
```

## Spring Physics

For natural, physics-based animations, use spring configuration.

```tsx
interface SpringConfig {
  tension?: number   // Default: 170
  friction?: number  // Default: 26
  mass?: number      // Default: 1
}
```

### Example

```tsx
controller.animate({
  animate: { y: 100 },
  spring: {
    tension: 170,
    friction: 26,
    mass: 1,
  }
})
```

Spring automatically calculates duration and easing based on physics.

### Spring Presets

```tsx
// Gentle spring (slow, smooth)
const gentle = {
  tension: 120,
  friction: 14,
}

// Wobbly spring (bouncy)
const wobbly = {
  tension: 180,
  friction: 12,
}

// Stiff spring (fast, minimal bounce)
const stiff = {
  tension: 210,
  friction: 20,
}

// Slow spring
const slow = {
  tension: 280,
  friction: 60,
}
```

```tsx
controller.animate({
  animate: { scale: 1.2 },
  spring: wobbly,
})
```

## Layout Animations

Automatically animate size changes with layout animations.

```tsx
const element = document.createElement('div')
const controller = new MotionController(element)

// Enable layout animations
controller.enableLayoutAnimation(300, 'ease-out')

// Now size changes animate automatically
element.style.width = '500px'  // Animates from current to 500px
element.style.height = '300px' // Animates from current to 300px

// Disable when done
controller.disableLayoutAnimation()
```

Layout animations use ResizeObserver to detect size changes.

## Exit Animations

Animate elements when removing them from the DOM.

```tsx
const element = document.createElement('div')
const controller = new MotionController(element)

controller.animate({
  animate: { opacity: 1 },
})

// When removing element
async function remove() {
  await controller.animateExit(
    { opacity: 0, y: -20 },
    300,
    'ease-in'
  )
  element.remove()
}
```

Or use the `exit` option in animate:

```tsx
controller.animate({
  animate: { opacity: 1 },
  exit: { opacity: 0, scale: 0.8 },
})
```

## State Integration

Use motion with Flexium's state for reactive animations.

```tsx
import { useState } from 'flexium/core'
import { MotionController } from 'flexium/primitives'

const isVisible = useState(false)

const element = document.createElement('div')
const controller = new MotionController(element)

// Watch state and animate on changes
const unwatch = useState.watch(() => {
  controller.animate({
    animate: isVisible.valueOf()
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 20 },
    duration: 300,
  })
})

// Update state to trigger animation
isVisible.set(true)

// Cleanup
unwatch()
controller.dispose()
```

## Animation Callbacks

Track animation lifecycle with callbacks.

```tsx
controller.animate({
  animate: { x: 100 },
  onAnimationStart: () => {
    console.log('Animation started')
  },
  onAnimationComplete: () => {
    console.log('Animation completed')
  },
})
```

## Sequencing Animations

Chain animations using callbacks:

```tsx
const controller = new MotionController(element)

controller.animate({
  animate: { x: 100 },
  duration: 300,
  onAnimationComplete: () => {
    // Animate again after first completes
    controller.animate({
      animate: { y: 100 },
      duration: 300,
    })
  },
})
```

Or use async/await with exit animations:

```tsx
async function sequence() {
  const controller = new MotionController(element)

  controller.animate({
    animate: { x: 100 },
  })

  await new Promise(resolve =>
    setTimeout(resolve, 300)
  )

  await controller.animateExit({ opacity: 0 })
}
```

## Stagger Animations

Animate multiple elements with delays:

```tsx
const items = [1, 2, 3, 4, 5]

items.forEach((item, index) => {
  const element = document.createElement('div')
  const controller = new MotionController(element)

  controller.animate({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    duration: 300,
    delay: index * 100,  // 100ms stagger
  })
})
```

## Use with Existing Elements

Animate existing DOM elements:

```tsx
const existingDiv = document.getElementById('my-div')
const controller = new MotionController(existingDiv)

controller.animate({
  animate: { opacity: 1, scale: 1.1 },
  duration: 500,
})
```

## Complete Example

```tsx
import { MotionController } from 'flexium/primitives'
import { useState } from 'flexium/core'

function AnimatedCard() {
  const isExpanded = useState(false)

  const card = document.createElement('div')
  card.style.padding = '20px'
  card.style.backgroundColor = '#fff'
  card.style.borderRadius = '8px'
  card.style.cursor = 'pointer'

  const controller = new MotionController(card)

  // Initial animation
  controller.animate({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    spring: {
      tension: 170,
      friction: 26,
    }
  })

  // Enable layout animations for expand/collapse
  controller.enableLayoutAnimation(300, 'ease-out')

  card.addEventListener('click', () => {
    isExpanded.set(!isExpanded.valueOf())
  })

  // Watch state changes
  const unwatch = useState.watch(() => {
    if (isExpanded.valueOf()) {
      card.style.width = '400px'
      card.style.height = '300px'
    } else {
      card.style.width = '200px'
      card.style.height = '150px'
    }
  })

  return card
}
```

## List Animations

Animate list items on add/remove:

```tsx
const list = document.getElementById('list')

function addItem(text: string) {
  const element = document.createElement('li')
  const controller = new MotionController(element)

  controller.animate({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    duration: 300,
  })

  element.textContent = text
  list.appendChild(element)
}

async function removeItem(item: HTMLElement) {
  const controller = new MotionController(item)

  await controller.animateExit(
    { opacity: 0, x: 20 },
    300
  )

  item.remove()
}
```

## Performance

Motion uses the Web Animations API which:

- Runs on the compositor thread (smooth 60fps)
- Doesn't trigger reflows for transforms/opacity
- Uses hardware acceleration
- Handles timing automatically

### Best Practices

1. **Prefer transforms** - Use `x`, `y`, `scale`, `rotate` instead of `left`, `top`, `width`, `height`
2. **Use opacity** - Opacity is highly optimized
3. **Avoid layout properties** - Width/height can cause reflows
4. **Clean up** - Always call `dispose()` when unmounting
5. **Use springs sparingly** - Spring physics are more expensive than linear easing

## Cleanup

Always dispose of motion controllers when done:

```tsx
const controller = new MotionController(element)

controller.animate({
  animate: { x: 100 },
})

// When removing from DOM
controller.dispose()
```

This cancels animations and cleans up observers.

## Browser Support

Motion requires Web Animations API support:

- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

For older browsers, include a polyfill:

```html
<script src="https://cdn.jsdelivr.net/npm/web-animations-js@2.3.2/web-animations.min.js"></script>
```

## Comparison with CSS Animations

| Feature | Motion | CSS Animations |
|---------|--------|----------------|
| Declarative | Yes | Yes |
| JavaScript control | Full | Limited |
| Dynamic values | Yes | No |
| Spring physics | Yes | No |
| Layout animations | Yes | No |
| Signal integration | Yes | No |
| Performance | Excellent | Excellent |

Use Motion when you need:
- Dynamic animation values
- Programmatic control
- Spring physics
- Signal reactivity
- Layout animations

Use CSS animations when:
- Animations are purely decorative
- No runtime control needed
- Simpler to maintain as CSS

## TypeScript

Motion is fully typed:

```tsx
import { MotionController, type AnimatableProps, type AnimateOptions } from 'flexium/primitives'

const element = document.createElement('div')
const controller = new MotionController(element)

const animateOptions: AnimateOptions = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  duration: 300,
}

controller.animate(animateOptions)

// TypeScript knows all methods
controller.animate({ animate: { x: 100 } })
controller.dispose()
```
