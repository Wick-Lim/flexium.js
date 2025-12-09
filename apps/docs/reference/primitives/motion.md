---
title: Motion - API Reference
description: Complete API reference for Flexium's Motion primitives. Declarative animations using the Web Animations API with spring physics and layout animations.
head:
  - - meta
    - property: og:title
      content: Motion API Reference - Flexium
  - - meta
    - property: og:description
      content: MotionController for building performant animations in Flexium using the Web Animations API.
---

# Motion

Complete API reference for Flexium's animation primitives using the Web Animations API.

## Import

```tsx
import { MotionController } from 'flexium/primitives/motion';
```

---

## Overview

`MotionController` is a class for managing animations on DOM elements. It provides direct access to the Web Animations API with additional features like spring physics and layout animations.

Use `MotionController` to:
- Animate element properties (position, scale, rotation, opacity)
- Apply spring physics for natural motion
- Automatically animate layout changes (width/height)
- Control animation lifecycle (play, pause, cancel)

## MotionController

### Constructor

```tsx
new MotionController(element: HTMLElement)
```

Creates a new controller for the specified element.

**Parameters:**
- `element` (HTMLElement) - The DOM element to animate

**Example:**

```tsx
import { MotionController } from 'flexium/primitives/motion';

function AnimatedBox() {
  const boxRef = signal<HTMLElement | null>(null);

  effect(() => {
    if (!boxRef.value) return;

    const controller = new MotionController(boxRef.value);

    // Animate on mount
    controller.animate({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      duration: 300
    });

    return () => controller.dispose();
  });

  return <div ref={boxRef}>Animated Content</div>;
}
```

---

## Methods

### animate

Animates the element from initial to animate props.

```tsx
controller.animate(props: MotionProps): void
```

##### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `props` | `MotionProps` | Animation configuration object. |

##### Example

```tsx
controller.animate({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 300,
  easing: 'ease-out',
  onAnimationComplete: () => console.log('Done!'),
});
```

---

### animateExit

Animates the element out (typically before removal). Returns a promise that resolves when animation completes.

```tsx
controller.animateExit(
  exitProps: AnimatableProps,
  duration?: number,
  easing?: string
): Promise<void>
```

##### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `exitProps` | `AnimatableProps` | - | **Required.** Target exit animation state. |
| `duration` | `number` | `300` | Animation duration in milliseconds. |
| `easing` | `string` | `'ease-in'` | CSS easing function. |

##### Example

```tsx
// Animate out before removing
await controller.animateExit(
  { opacity: 0, y: -20 },
  300,
  'ease-in'
);

element.remove();
```

##### Example: Conditional Removal

```tsx
async function removeElement(element: HTMLElement) {
  const controller = new MotionController(element);

  await controller.animateExit(
    { opacity: 0, scale: 0.8 },
    200
  );

  element.remove();
  controller.dispose();
}
```

---

### enableLayoutAnimation

Enables automatic animations for size changes. Uses ResizeObserver to detect and animate width/height changes.

```tsx
controller.enableLayoutAnimation(duration?: number, easing?: string): void
```

##### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number` | `300` | Animation duration in milliseconds. |
| `easing` | `string` | `'ease-out'` | CSS easing function. |

##### Example

```tsx
const controller = new MotionController(element);

// Enable layout animations
controller.enableLayoutAnimation(250, 'ease-in-out');

// Now any size changes will animate automatically
element.style.width = '500px'; // Animates from old width to 500px
element.style.height = '300px'; // Animates from old height to 300px
```

##### Example: Expandable Panel

```tsx
const panel = document.querySelector('.panel');
const controller = new MotionController(panel);
controller.enableLayoutAnimation(300);

const toggleButton = document.querySelector('.toggle');
toggleButton.onclick = () => {
  panel.classList.toggle('expanded');
  // Height change will animate automatically
};
```

---

### disableLayoutAnimation

Disables layout animations and cleans up the ResizeObserver.

```tsx
controller.disableLayoutAnimation(): void
```

##### Example

```tsx
controller.disableLayoutAnimation();
```

---

### cancel

Cancels the currently running animation.

```tsx
controller.cancel(): void
```

##### Example

```tsx
controller.animate({
  animate: { x: 100 },
  duration: 1000,
});

// Cancel after 500ms
setTimeout(() => {
  controller.cancel();
}, 500);
```

---

### dispose

Cleans up all animations, observers, and resources. Call this when removing the element.

```tsx
controller.dispose(): void
```

##### Example

```tsx
controller.dispose();
element.remove();
```

---

## Type Definitions

### AnimatableProps

Properties that can be animated.

```tsx
interface AnimatableProps {
  x?: number              // Translate X in pixels
  y?: number              // Translate Y in pixels
  scale?: number          // Uniform scale (1 = 100%)
  scaleX?: number         // Scale X axis
  scaleY?: number         // Scale Y axis
  rotate?: number         // Rotation in degrees
  opacity?: number        // Opacity (0-1)
  width?: number | string // Width (number = pixels, or CSS string)
  height?: number | string // Height (number = pixels, or CSS string)
}
```

#### Examples

```tsx
// Translate
{ x: 100, y: 50 } // translateX(100px) translateY(50px)

// Scale
{ scale: 1.5 } // scale(1.5)
{ scaleX: 2, scaleY: 0.5 } // scaleX(2) scaleY(0.5)

// Rotate
{ rotate: 45 } // rotate(45deg)

// Combined transforms
{ x: 100, y: 50, scale: 1.2, rotate: 45 }
// translateX(100px) translateY(50px) scale(1.2) rotate(45deg)

// Opacity
{ opacity: 0.5 } // opacity: 0.5

// Size
{ width: 200, height: 100 } // width: 200px; height: 100px
{ width: '50%', height: 'auto' } // width: 50%; height: auto
```

---

### SpringConfig

Spring physics configuration for natural, physics-based animations.

```tsx
interface SpringConfig {
  tension?: number  // Default: 170 (higher = faster)
  friction?: number // Default: 26 (higher = less bouncy)
  mass?: number     // Default: 1 (higher = slower)
}
```

#### Spring Presets

##### Gentle Spring (default)
```tsx
spring: { tension: 170, friction: 26, mass: 1 }
```
Natural, smooth animation with subtle bounce.

##### Bouncy Spring
```tsx
spring: { tension: 300, friction: 10, mass: 1 }
```
Energetic animation with pronounced bounce.

##### Stiff Spring
```tsx
spring: { tension: 400, friction: 30, mass: 1 }
```
Quick, snappy animation with minimal bounce.

##### Slow Spring
```tsx
spring: { tension: 100, friction: 20, mass: 2 }
```
Slow, gentle animation with more weight.

##### Wobbly Spring
```tsx
spring: { tension: 200, friction: 5, mass: 1 }
```
Very bouncy animation with extended oscillation.

#### Example Usage

```tsx
// Gentle bounce
createMotion({
  animate: { scale: 1 },
  spring: { tension: 170, friction: 26 },
});

// Pronounced bounce
createMotion({
  animate: { y: 0 },
  spring: { tension: 300, friction: 10 },
});

// Quick snap
createMotion({
  animate: { opacity: 1 },
  spring: { tension: 400, friction: 30 },
});
```

---

### MotionProps

Complete motion configuration object.

```tsx
interface MotionProps {
  element?: HTMLElement | null
  initial?: AnimatableProps
  animate?: AnimatableProps
  exit?: AnimatableProps
  duration?: number
  spring?: SpringConfig
  easing?: string
  delay?: number
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}
```

---

## Common Patterns

### Entrance Animations

#### Fade In

```tsx
createMotion({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  duration: 300,
});
```

#### Slide In From Bottom

```tsx
createMotion({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 400,
  easing: 'ease-out',
});
```

#### Scale Up

```tsx
createMotion({
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  duration: 300,
  easing: 'ease-out',
});
```

#### Slide In From Left

```tsx
createMotion({
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  duration: 350,
});
```

#### Bounce In

```tsx
createMotion({
  initial: { scale: 0 },
  animate: { scale: 1 },
  spring: { tension: 300, friction: 10 },
});
```

---

### Exit Animations

#### Fade Out

```tsx
await controller.animateExit(
  { opacity: 0 },
  300,
  'ease-in'
);
element.remove();
```

#### Slide Out To Top

```tsx
await controller.animateExit(
  { opacity: 0, y: -20 },
  300,
  'ease-in'
);
element.remove();
```

#### Scale Down

```tsx
await controller.animateExit(
  { opacity: 0, scale: 0.8 },
  250,
  'ease-in'
);
element.remove();
```

---

### Interactive Animations

#### Hover Scale

```tsx
const button = document.querySelector('.button');
const controller = new MotionController(button);

button.addEventListener('mouseenter', () => {
  controller.animate({
    animate: { scale: 1.05 },
    duration: 200,
    easing: 'ease-out',
  });
});

button.addEventListener('mouseleave', () => {
  controller.animate({
    animate: { scale: 1 },
    duration: 200,
    easing: 'ease-out',
  });
});
```

#### Click Animation

```tsx
const card = document.querySelector('.card');
const controller = new MotionController(card);

card.addEventListener('click', () => {
  controller.animate({
    initial: { scale: 1 },
    animate: { scale: 0.95 },
    duration: 100,
    onAnimationComplete: () => {
      controller.animate({
        animate: { scale: 1 },
        duration: 100,
      });
    },
  });
});
```

---

### List Animations

#### Staggered Entrance

```tsx
const items = document.querySelectorAll('.list-item');

items.forEach((item, index) => {
  createMotion({
    element: item,
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    duration: 300,
    delay: index * 50, // Stagger by 50ms
    easing: 'ease-out',
  });
});
```

#### Remove with Animation

```tsx
async function removeListItem(item: HTMLElement) {
  const controller = new MotionController(item);

  await controller.animateExit(
    { opacity: 0, x: -100 },
    250,
    'ease-in'
  );

  item.remove();
  controller.dispose();
}
```

---

### Complex Animations

#### Sequential Animations

```tsx
const element = document.querySelector('.box');
const controller = new MotionController(element);

// Animation 1: Move right
controller.animate({
  animate: { x: 100 },
  duration: 500,
  onAnimationComplete: () => {
    // Animation 2: Move down
    controller.animate({
      animate: { x: 100, y: 100 },
      duration: 500,
      onAnimationComplete: () => {
        // Animation 3: Fade out
        controller.animate({
          animate: { x: 100, y: 100, opacity: 0 },
          duration: 300,
        });
      },
    });
  },
});
```

#### Parallel Animations

```tsx
// Rotate and scale simultaneously
createMotion({
  initial: { rotate: 0, scale: 1 },
  animate: { rotate: 360, scale: 1.5 },
  duration: 1000,
  easing: 'ease-in-out',
});
```

#### Keyframe-Style Animation

```tsx
const controller = new MotionController(element);

// Move in multiple steps
async function complexAnimation() {
  await controller.animate({ animate: { x: 100 }, duration: 300 });
  await controller.animate({ animate: { y: 100 }, duration: 300 });
  await controller.animate({ animate: { x: 0, y: 0 }, duration: 300 });
}
```

---

### Layout Animations

#### Auto-Animate Size Changes

```tsx
const panel = document.querySelector('.panel');
const controller = new MotionController(panel);

// Enable layout animations
controller.enableLayoutAnimation(300, 'ease-out');

// All size changes now animate
function toggleExpanded() {
  panel.classList.toggle('expanded');
  // CSS class changes height, which animates automatically
}
```

#### Dynamic Content

```tsx
const container = document.querySelector('.container');
const controller = new MotionController(container);
controller.enableLayoutAnimation(250);

// Adding content animates the size change
function addContent() {
  const newItem = document.createElement('div');
  newItem.textContent = 'New item';
  container.appendChild(newItem);
  // Container height animates to accommodate new content
}
```

---

## Performance Tips

### Use Transform Properties

Transform properties (x, y, scale, rotate) are GPU-accelerated and perform better than layout properties:

```tsx
// Good: GPU-accelerated
createMotion({
  animate: { x: 100, y: 50, scale: 1.2 },
});

// Avoid: Forces layout recalculation
createMotion({
  animate: { width: 500, height: 300 },
});
```

### Dispose Controllers

Always dispose controllers when elements are removed:

```tsx
const controller = new MotionController(element);

// When done
controller.dispose();
element.remove();
```

### Reuse Controllers

For repeated animations, reuse the same controller:

```tsx
const controller = new MotionController(element);

// Good: Reuse controller
button.onclick = () => {
  controller.animate({ animate: { scale: 1.1 }, duration: 200 });
};

// Don't: Create new controller each time
button.onclick = () => {
  const newController = new MotionController(element);
  newController.animate({ animate: { scale: 1.1 }, duration: 200 });
};
```

### Cancel Running Animations

Cancel animations before starting new ones (handled automatically by controller):

```tsx
// The controller automatically cancels previous animations
controller.animate({ animate: { x: 100 }, duration: 1000 });
controller.animate({ animate: { x: 200 }, duration: 500 }); // Cancels first
```

---

## Browser Support

Motion uses the Web Animations API, which is supported in:

- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

For older browsers, consider using a [Web Animations API polyfill](https://github.com/web-animations/web-animations-js).

---

## See Also

- [Signals](/guide/signals) - Reactive primitives for state management
- [Effects](/guide/effects) - Reactive side effects
- [Transitions](/guide/transitions) - Higher-level transition components
