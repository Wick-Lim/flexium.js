# Animation

Flexium provides a powerful animation system built on the Web Animations API. Create smooth, performant animations with declarative APIs.

## Motion API

The Motion API provides low-level control over element animations.

### createMotion

Create an animated element with initial and target states:

```tsx
import { createMotion } from 'flexium/primitives'

const { element, controller, dispose } = createMotion({
  tagName: 'div',
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 300,
  easing: 'ease-out'
})

document.body.appendChild(element)

// Later: cleanup
dispose()
```

### useMotion

Use motion with reactive signals:

```tsx
import { useMotion, signal } from 'flexium/primitives'

const isExpanded = signal(false)

const { controller, dispose } = useMotion(element, {
  value: {
    animate: isExpanded.value
      ? { height: 'auto', opacity: 1 }
      : { height: 0, opacity: 0 }
  }
})

// Toggle animation
isExpanded.value = true
```

### MotionController

Direct control over animations:

```tsx
import { MotionController } from 'flexium/primitives'

const controller = new MotionController(element)

// Animate in
controller.animate({
  initial: { scale: 0 },
  animate: { scale: 1 },
  spring: { tension: 200, friction: 20 },
  onAnimationComplete: () => console.log('Done!')
})

// Animate out
await controller.animateExit({ opacity: 0, y: -20 })

// Enable layout animations
controller.enableLayoutAnimation(300, 'ease-out')
```

## Transition Component

The Transition component provides high-level enter/exit animations for conditional content.

### Basic Usage

```tsx
import { Transition } from 'flexium/primitives'
import { Show, state } from 'flexium'

function App() {
  const [visible, setVisible] = state(false)

  return (
    <div>
      <button onClick={() => setVisible(v => !v)}>Toggle</button>

      <Show when={visible}>
        <Transition preset="fade">
          <div class="content">
            This content fades in and out
          </div>
        </Transition>
      </Show>
    </div>
  )
}
```

### Presets

Built-in animation presets:

| Preset | Description |
|--------|-------------|
| `fade` | Simple opacity fade |
| `slide-up` | Slide from bottom with fade |
| `slide-down` | Slide from top with fade |
| `slide-left` | Slide from right with fade |
| `slide-right` | Slide from left with fade |
| `scale` | Scale up/down |
| `scale-fade` | Scale with fade |

```tsx
<Transition preset="slide-up">
  <Modal />
</Transition>
```

### Custom Animations

Define custom enter and exit animations:

```tsx
<Transition
  enter={{ opacity: 0, y: 50, rotate: -10 }}
  enterTo={{ opacity: 1, y: 0, rotate: 0 }}
  exit={{ opacity: 0, y: -50, rotate: 10 }}
  enterTiming={{ duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
  exitTiming={{ duration: 300, easing: 'ease-in' }}
>
  <Card />
</Transition>
```

### Reusable Transitions

Create reusable transition configurations:

```tsx
import { createTransition } from 'flexium/primitives'

const bounceIn = createTransition({
  enter: { opacity: 0, scale: 0.3 },
  enterTo: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.3 },
  enterTiming: {
    duration: 500,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Bouncy
  }
})

// Use anywhere
<Transition {...bounceIn}>
  <Notification />
</Transition>
```

### Built-in UI Transitions

Pre-configured transitions for common UI patterns:

```tsx
import { transitions } from 'flexium/primitives'

// Modal dialog
<Transition {...transitions.modal}>
  <Dialog />
</Transition>

// Dropdown menu
<Transition {...transitions.dropdown}>
  <Menu />
</Transition>

// Tooltip
<Transition {...transitions.tooltip}>
  <Tooltip />
</Transition>

// Toast notification
<Transition {...transitions.notification}>
  <Toast />
</Transition>

// Page transition
<Transition {...transitions.page}>
  <PageContent />
</Transition>
```

## TransitionGroup

Stagger animations for lists:

```tsx
import { TransitionGroup, Transition } from 'flexium/primitives'
import { For } from 'flexium'

function NotificationList() {
  const [notifications] = state([...])

  return (
    <TransitionGroup stagger={50}>
      <For each={notifications}>
        {(notification) => (
          <Transition preset="slide-right">
            <NotificationCard data={notification} />
          </Transition>
        )}
      </For>
    </TransitionGroup>
  )
}
```

Each item animates with a 50ms delay after the previous one.

## Animatable Properties

Properties that can be animated:

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | Translate X (pixels) |
| `y` | `number` | Translate Y (pixels) |
| `scale` | `number` | Uniform scale |
| `scaleX` | `number` | Scale X axis |
| `scaleY` | `number` | Scale Y axis |
| `rotate` | `number` | Rotation (degrees) |
| `opacity` | `number` | Opacity (0-1) |
| `width` | `number \| string` | Element width |
| `height` | `number \| string` | Element height |

## Spring Physics

Use spring physics for natural-feeling animations:

```tsx
controller.animate({
  animate: { x: 100 },
  spring: {
    tension: 170,   // Stiffness (default: 170)
    friction: 26,   // Damping (default: 26)
    mass: 1         // Mass (default: 1)
  }
})
```

### Spring Presets

Common spring configurations:

```tsx
// Gentle - slow, smooth
const gentle = { tension: 120, friction: 14 }

// Wobbly - bouncy
const wobbly = { tension: 180, friction: 12 }

// Stiff - fast, minimal overshoot
const stiff = { tension: 210, friction: 20 }

// Slow - deliberate
const slow = { tension: 280, friction: 60 }
```

## Lifecycle Callbacks

React to animation events:

```tsx
<Transition
  preset="fade"
  onEnterStart={() => console.log('Enter starting')}
  onEnterComplete={() => console.log('Enter complete')}
  onExitStart={() => console.log('Exit starting')}
  onExitComplete={() => console.log('Exit complete')}
>
  <Content />
</Transition>
```

## Layout Animations

Automatically animate size changes:

```tsx
const controller = new MotionController(element)

// Enable automatic size animations
controller.enableLayoutAnimation(300, 'ease-out')

// Now any size changes will animate smoothly
element.style.height = '200px' // Animates!

// Disable when done
controller.disableLayoutAnimation()
```

## Examples

### Animated Modal

```tsx
import { Transition, transitions } from 'flexium/primitives'
import { Portal } from 'flexium/dom'
import { Show, state } from 'flexium'

function Modal({ isOpen, onClose, children }) {
  return (
    <Show when={() => isOpen}>
      <Portal>
        {/* Backdrop */}
        <Transition preset="fade">
          <div class="backdrop" onClick={onClose} />
        </Transition>

        {/* Dialog */}
        <Transition {...transitions.modal}>
          <div class="modal" role="dialog">
            {children}
          </div>
        </Transition>
      </Portal>
    </Show>
  )
}
```

### Animated List

```tsx
import { TransitionGroup, Transition } from 'flexium/primitives'
import { For, state } from 'flexium'

function TodoList() {
  const [todos, setTodos] = state([
    { id: 1, text: 'Learn Flexium' },
    { id: 2, text: 'Build app' }
  ])

  const addTodo = (text) => {
    setTodos(prev => [...prev, { id: Date.now(), text }])
  }

  const removeTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <TransitionGroup stagger={30}>
      <For each={todos}>
        {(todo) => (
          <Transition preset="slide-up">
            <div class="todo-item">
              {todo.text}
              <button onClick={() => removeTodo(todo.id)}>×</button>
            </div>
          </Transition>
        )}
      </For>
    </TransitionGroup>
  )
}
```

### Page Transitions

```tsx
import { Transition, transitions } from 'flexium/primitives'
import { Router, Route } from 'flexium/router'

function App() {
  return (
    <Router>
      <Route path="/">
        <Transition {...transitions.page}>
          <HomePage />
        </Transition>
      </Route>
      <Route path="/about">
        <Transition {...transitions.page}>
          <AboutPage />
        </Transition>
      </Route>
    </Router>
  )
}
```

## Performance Tips

1. **Use transform and opacity**: These properties are GPU-accelerated and don't trigger layout

2. **Avoid animating width/height**: Use transform: scale() when possible

3. **Use will-change sparingly**: The browser handles optimization automatically

4. **Clean up controllers**: Call `dispose()` when removing animated elements

5. **Prefer presets**: Built-in presets are optimized for common use cases

## API Reference

### AnimatableProps

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
```

### TransitionProps

```typescript
interface TransitionProps {
  preset?: TransitionPreset
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

### SpringConfig

```typescript
interface SpringConfig {
  tension?: number   // Default: 170
  friction?: number  // Default: 26
  mass?: number      // Default: 1
}
```
