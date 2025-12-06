# Motion

Declarative animations using the Web Animations API.

<script setup>
import MotionDemo from '../../components/MotionDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <MotionDemo />
</ClientOnly>

## Import

```ts
import { createMotion, useMotion, MotionController } from 'flexium/primitives'
```

## createMotion()

Create an animated element with initial and target states.

### Signature

```ts
function createMotion(props: MotionProps & { tagName?: string }): {
  element: HTMLElement
  controller: MotionController
  update: (newProps: MotionProps) => void
  dispose: () => void
}
```

### Usage

```tsx
import { createMotion } from 'flexium/primitives'

// Create a motion-enabled div
const motion = createMotion({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 300
})

document.body.appendChild(motion.element)
```

## MotionController

Lower-level API for animating existing elements.

### Signature

```ts
class MotionController {
  constructor(element: HTMLElement)
  animate(props: MotionProps): void
  animateExit(exitProps: AnimatableProps, duration?: number, easing?: string): Promise<void>
  enableLayoutAnimation(duration?: number, easing?: string): void
  disableLayoutAnimation(): void
  cancel(): void
  dispose(): void
}
```

### Usage

```tsx
const element = document.querySelector('.my-element')
const controller = new MotionController(element)

// Animate
controller.animate({
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  duration: 400,
  spring: { tension: 200, friction: 20 }
})

// Exit animation
await controller.animateExit({ opacity: 0, y: -20 })
element.remove()
```

## useMotion()

Hook for reactive motion with signals.

### Signature

```ts
function useMotion(
  element: HTMLElement,
  propsSignal: Signal<MotionProps>
): {
  controller: MotionController
  dispose: () => void
}
```

### Usage

```tsx
import { signal } from 'flexium/core'
import { useMotion } from 'flexium/primitives'

const isVisible = signal(false)

const element = document.getElementById('box')
const { dispose } = useMotion(element, signal({
  animate: isVisible()
    ? { opacity: 1, scale: 1 }
    : { opacity: 0, scale: 0.8 }
}))

// Toggle visibility
isVisible.set(true)  // Animates in
isVisible.set(false) // Animates out
```

## Animatable Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | Translate X (pixels) |
| `y` | `number` | Translate Y (pixels) |
| `scale` | `number` | Uniform scale |
| `scaleX` | `number` | Horizontal scale |
| `scaleY` | `number` | Vertical scale |
| `rotate` | `number` | Rotation (degrees) |
| `opacity` | `number` | Opacity (0-1) |
| `width` | `number \| string` | Element width |
| `height` | `number \| string` | Element height |

## MotionProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initial` | `AnimatableProps` | - | Starting state |
| `animate` | `AnimatableProps` | - | Target state |
| `exit` | `AnimatableProps` | - | Exit animation state |
| `duration` | `number` | `300` | Duration in ms |
| `spring` | `SpringConfig` | - | Spring physics |
| `easing` | `string` | `'ease-out'` | CSS easing |
| `delay` | `number` | `0` | Delay in ms |
| `onAnimationStart` | `() => void` | - | Start callback |
| `onAnimationComplete` | `() => void` | - | Complete callback |

## Spring Physics

```ts
interface SpringConfig {
  tension?: number   // Default: 170
  friction?: number  // Default: 26
  mass?: number      // Default: 1
}
```

### Spring Examples

```tsx
// Bouncy
{ tension: 300, friction: 10 }

// Smooth
{ tension: 120, friction: 14 }

// Stiff
{ tension: 400, friction: 30 }

// Slow
{ tension: 100, friction: 20, mass: 2 }
```

## Examples

### Fade In

```tsx
const fadeIn = createMotion({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  duration: 500
})
```

### Slide Up

```tsx
const slideUp = createMotion({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  duration: 400,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
})
```

### Scale with Spring

```tsx
const scaleSpring = createMotion({
  initial: { scale: 0 },
  animate: { scale: 1 },
  spring: { tension: 200, friction: 15 }
})
```

### Staggered List

```tsx
function StaggeredList(props) {
  return (
    <For each={props.items}>
      {(item, index) => {
        const motion = createMotion({
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          duration: 300,
          delay: index() * 50 // Stagger
        })

        return <div ref={motion.element}>{item.name}</div>
      }}
    </For>
  )
}
```

### Enter/Exit Animation

```tsx
function Modal(props) {
  let element

  onMount(() => {
    const controller = new MotionController(element)
    controller.animate({
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      duration: 200
    })

    onCleanup(async () => {
      await controller.animateExit({
        opacity: 0,
        scale: 0.95
      }, 150)
    })
  })

  return (
    <div ref={element} class="modal">
      {props.children}
    </div>
  )
}
```

### Layout Animation

```tsx
function ExpandableCard(props) {
  let element
  let controller

  onMount(() => {
    controller = new MotionController(element)
    controller.enableLayoutAnimation(300, 'ease-out')
  })

  return (
    <div
      ref={element}
      class={props.expanded ? 'card expanded' : 'card'}
    >
      {props.children}
    </div>
  )
}
```

### Hover Animation

```tsx
function HoverCard() {
  let controller

  const handleMouseEnter = () => {
    controller.animate({
      animate: { scale: 1.05, y: -4 },
      duration: 200
    })
  }

  const handleMouseLeave = () => {
    controller.animate({
      animate: { scale: 1, y: 0 },
      duration: 200
    })
  }

  return (
    <div
      ref={(el) => controller = new MotionController(el)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      class="card"
    >
      Hover me
    </div>
  )
}
```

## Behavior

- Uses **Web Animations API** for GPU-accelerated performance
- **Spring physics** calculated and converted to CSS timing
- **fill: 'forwards'** keeps final state after animation
- Previous animation **cancelled** before new one starts
- **ResizeObserver** used for layout animations

## Performance Tips

1. **Prefer transform properties** (x, y, scale, rotate) over layout properties (width, height)
2. **Use spring physics** for natural-feeling motion
3. **Keep durations short** (200-400ms) for responsive feel
4. **Stagger long lists** to avoid simultaneous animations
5. **Dispose controllers** when elements are removed

## Notes

- Web Animations API provides better performance than CSS transitions
- Spring config is approximated with cubic-bezier curves
- Layout animations observe element size changes
- Exit animations return a Promise for sequencing

## See Also

- [Transition](/docs/primitives/transition) - Component transitions
- [effect()](/docs/core/effect) - Reactive side effects
- [Show](/docs/core/show) - Conditional rendering
