# Flexium Animation/Motion Demo

A comprehensive demonstration of Flexium's Motion and Transition animation primitives, showcasing declarative animations built on the Web Animations API.

## Features Demonstrated

### 1. Basic Motion with Keyframes
- **MotionController** for programmatic animations
- Transform animations (translate, scale, rotate)
- Opacity animations
- Combined multi-property animations
- Custom easing functions

### 2. Transition Component with Presets
- Built-in animation presets (fade, slide, scale, etc.)
- Predefined UI patterns (modal, dropdown, tooltip, notification)
- Easy toggle between different transition styles
- Automatic enter/exit animation handling

### 3. Enter/Exit Animations
- Custom enter keyframes and timing
- Independent exit animations
- Notification system with smooth transitions
- Different easing for enter vs exit

### 4. Staggered Animations
- **TransitionGroup** for cascading effects
- Configurable stagger delay
- List animations with add/remove
- Beautiful sequential animations

### 5. Spring Physics Animations
- Natural, realistic motion
- Configurable tension, friction, and mass
- Spring presets (gentle, wobbly, stiff, bouncy, etc.)
- Real-time spring parameter adjustment

### 6. Easing Functions
- Comparison of different easing curves
- CSS easing functions (linear, ease, ease-in, etc.)
- Custom cubic-bezier curves
- Elastic and bounce effects

### 7. Animation Controls
- Play/pause animations
- Resume from paused state
- Reverse animation direction
- Cancel animations
- Direct Web Animations API access

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The demo runs on `http://localhost:3010` by default.

## Code Examples

### Basic Motion

```tsx
import { MotionController } from 'flexium'

const controller = new MotionController(element)

controller.animate({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 300,
  easing: 'ease-out'
})
```

### Transition Component

```tsx
import { Transition, transitions } from 'flexium'
import { Show } from 'flexium'

// Using presets
<Show when={visible}>
  <Transition preset="fade">
    <div>Animated content</div>
  </Transition>
</Show>

// Using predefined configs
<Show when={visible}>
  <Transition {...transitions.modal}>
    <div>Modal content</div>
  </Transition>
</Show>

// Custom animations
<Transition
  enter={{ opacity: 0, x: -50 }}
  enterTo={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 50 }}
  enterTiming={{ duration: 300, easing: 'ease-out' }}
  exitTiming={{ duration: 200, easing: 'ease-in' }}
>
  <div>Custom animated content</div>
</Transition>
```

### Staggered Animations

```tsx
import { TransitionGroup, Transition } from 'flexium'
import { For } from 'flexium'

<TransitionGroup stagger={100}>
  <For each={items}>
    {(item) => (
      <Transition preset="slideUp">
        <div>{item.name}</div>
      </Transition>
    )}
  </For>
</TransitionGroup>
```

### Spring Physics

```tsx
controller.animate({
  initial: { x: 0 },
  animate: { x: 200 },
  spring: {
    tension: 170,  // Stiffness of the spring
    friction: 26,  // Resistance to motion
    mass: 1        // Weight of the object
  }
})
```

### Animation Controls

```tsx
// Get direct access to Web Animations API
const animation = element.animate(keyframes, options)

animation.play()     // Start/resume
animation.pause()    // Pause
animation.reverse()  // Reverse direction
animation.cancel()   // Cancel and reset
```

## API Reference

### MotionController

```typescript
interface AnimatableProps {
  x?: number
  y?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number
  opacity?: number
  width?: number | string
  height?: number | string
}

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

class MotionController {
  constructor(element: HTMLElement)
  animate(props: MotionProps): void
  animateExit(props: AnimatableProps, duration?, easing?): Promise<void>
  enableLayoutAnimation(duration?, easing?): void
  cancel(): void
  dispose(): void
}
```

### Transition Component

```typescript
interface TransitionProps {
  preset?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'scale-fade'
  enter?: AnimatableProps
  enterTo?: AnimatableProps
  exit?: AnimatableProps
  enterTiming?: { duration?: number; delay?: number; easing?: string }
  exitTiming?: { duration?: number; delay?: number; easing?: string }
  onEnterStart?: () => void
  onEnterComplete?: () => void
  onExitStart?: () => void
  onExitComplete?: () => void
  children: any
}
```

### TransitionGroup

```typescript
interface TransitionGroupProps {
  stagger?: number  // Delay between each child animation (ms)
  children: any
}
```

### Spring Configuration

```typescript
interface SpringConfig {
  tension?: number   // Default: 170 (stiffness)
  friction?: number  // Default: 26 (resistance)
  mass?: number      // Default: 1 (weight)
}
```

## Built-in Transition Presets

- **fade**: Simple opacity fade
- **slideUp**: Slide up with fade
- **slideDown**: Slide down with fade
- **slideLeft**: Slide from right with fade
- **slideRight**: Slide from left with fade
- **scale**: Scale without opacity change
- **scaleFade**: Scale with fade
- **modal**: Optimized for modals (scale + fade + slight vertical movement)
- **dropdown**: Optimized for dropdowns (scale + fade + downward movement)
- **tooltip**: Quick fade + scale for tooltips
- **notification**: Slide in from right for notifications
- **page**: Subtle fade for page transitions

## Performance Considerations

- **Web Animations API**: All animations use the native Web Animations API for optimal performance
- **GPU Acceleration**: Transform animations (translate, scale, rotate) are hardware-accelerated
- **No RAF Loops**: Declarative API means no manual requestAnimationFrame management
- **Efficient Updates**: Only animates when props change, minimal overhead
- **Cleanup**: Automatic cleanup of animations and observers on component unmount

## Browser Support

The Web Animations API is supported in all modern browsers:
- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

For older browsers, consider using a polyfill like `web-animations-js`.

## Learn More

- [Flexium Documentation](../../README.md)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Cubic Bezier Curve Generator](https://cubic-bezier.com/)
- [Spring Physics Guide](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)

## Architecture

```
animation-demo/
├── src/
│   └── main.tsx          # Main demo application
├── index.html            # HTML template with animation-friendly styling
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite bundler configuration
└── README.md             # This file
```

## Key Concepts

### Declarative Animations
Define what should animate, not how. Flexium handles the animation lifecycle.

### Enter/Exit Lifecycle
Animations automatically coordinate with component mounting/unmounting.

### Spring Physics
Natural motion based on real-world physics principles (tension, friction, mass).

### Composability
Combine Motion, Transition, and TransitionGroup for complex animation sequences.

### Performance
Built on Web Animations API for smooth 60fps animations with minimal JavaScript overhead.

## Tips & Best Practices

1. **Use transforms over position**: `x/y` (translate) performs better than `left/top`
2. **Prefer opacity**: Opacity changes are hardware-accelerated
3. **Spring for natural motion**: Use spring physics for UI interactions
4. **Easing for mechanical motion**: Use easing functions for planned animations
5. **Stagger for lists**: Add stagger delay to make list animations more engaging
6. **Different enter/exit**: Use different animations for enter vs exit
7. **Cleanup**: Always dispose controllers when components unmount
8. **Test performance**: Monitor frame rate on target devices

## Customization

### Custom Easing Curves

Use [cubic-bezier.com](https://cubic-bezier.com/) to create custom easing curves:

```tsx
controller.animate({
  animate: { x: 200 },
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Elastic
})
```

### Custom Spring Presets

Create your own spring configurations:

```tsx
const bouncy = {
  tension: 300,
  friction: 10,
  mass: 1
}

controller.animate({
  animate: { scale: 1.5 },
  spring: bouncy
})
```

### Custom Transitions

Create reusable transition configurations:

```tsx
import { createTransition } from 'flexium'

const myTransition = createTransition({
  enter: { opacity: 0, scale: 0.9, y: -10 },
  enterTo: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
  enterTiming: { duration: 250, easing: 'ease-out' },
  exitTiming: { duration: 200, easing: 'ease-in' }
})

// Use anywhere
<Transition {...myTransition}>
  <Content />
</Transition>
```

## License

MIT
