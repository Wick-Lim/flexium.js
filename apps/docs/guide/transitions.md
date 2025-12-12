---
title: Transitions - Enter/Exit Animations
description: Create smooth enter and exit animations with Flexium's Transition components. Learn about presets, custom animations, staggering, and integration with control flow.
head:
  - - meta
    - property: og:title
      content: Transitions - Flexium Animation
  - - meta
    - property: og:description
      content: Declarative enter/exit animations with built-in presets, custom keyframes, staggering, and seamless integration with conditional rendering.
---

# Transitions

Flexium's Transition system provides declarative enter and exit animations for elements appearing and disappearing from the DOM. Built on the Web Animations API, transitions work seamlessly with Flexium's control flow like conditionals and `items.map()`.

## Basic Usage

The simplest way to add animations is using built-in presets:

```tsx
import { Transition } from 'flexium/primitives'
import { state } from 'flexium/core'

function App() {
  const visible = state(false)

  return (
    <div>
      <button onclick={() => visible.set(v => !v)}>Toggle</button>

      {visible.valueOf() && (
        <Transition preset="fade">
          <div class="content">
            This content fades in and out
          </div>
        </Transition>
      )}
    </div>
  )
}
```

When `visible` becomes `true`, the content fades in. When it becomes `false`, the content fades out before being removed from the DOM.

## Transition Component

The `<Transition>` component wraps content that should animate when entering or exiting the DOM.

### Props

```typescript
interface TransitionProps {
  preset?: TransitionPreset
  enter?: AnimatableProps
  enterTo?: AnimatableProps
  exit?: AnimatableProps
  enterTiming?: TransitionTiming
  exitTiming?: TransitionTiming
  onEnterStart?: () => void
  onEnterComplete?: () => void
  onExitStart?: () => void
  onExitComplete?: () => void
  children: any
}
```

| Prop | Type | Description |
|------|------|-------------|
| `preset` | `TransitionPreset` | Use a built-in animation preset |
| `enter` | `AnimatableProps` | Initial state when entering (from) |
| `enterTo` | `AnimatableProps` | Final state when entering (to) |
| `exit` | `AnimatableProps` | Final state when exiting (to) |
| `enterTiming` | `TransitionTiming` | Duration, delay, and easing for enter |
| `exitTiming` | `TransitionTiming` | Duration, delay, and easing for exit |
| `onEnterStart` | `() => void` | Called when enter animation starts |
| `onEnterComplete` | `() => void` | Called when enter animation completes |
| `onExitStart` | `() => void` | Called when exit animation starts |
| `onExitComplete` | `() => void` | Called when exit animation completes |

## Built-in Presets

Flexium provides seven animation presets for common use cases:

| Preset | Description | Effect |
|--------|-------------|--------|
| `fade` | Simple opacity fade | Fades in/out |
| `slide-up` | Slide from bottom | Slides up with fade |
| `slide-down` | Slide from top | Slides down with fade |
| `slide-left` | Slide from right | Slides left with fade |
| `slide-right` | Slide from left | Slides right with fade |
| `scale` | Scale animation | Scales up/down |
| `scale-fade` | Scale with fade | Scales with opacity |

### Examples

```tsx
// Simple fade
<Transition preset="fade">
  <div>Fades in and out</div>
</Transition>

// Slide up from bottom
<Transition preset="slide-up">
  <div>Slides up smoothly</div>
</Transition>

// Scale with fade
<Transition preset="scale-fade">
  <div>Scales and fades</div>
</Transition>
```

## Custom Animations

Create custom animations by defining `enter`, `enterTo`, and `exit` keyframes:

```tsx
<Transition
  enter={{ opacity: 0, y: 50, rotate: -10 }}
  enterTo={{ opacity: 1, y: 0, rotate: 0 }}
  exit={{ opacity: 0, y: -50, rotate: 10 }}
  enterTiming={{ duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
  exitTiming={{ duration: 300, easing: 'ease-in' }}
>
  <div class="card">Custom animated card</div>
</Transition>
```

### Animatable Properties

You can animate these properties:

```typescript
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

### Animation Timing

Control timing with duration, delay, and easing:

```typescript
interface TransitionTiming {
  duration?: number  // Duration in milliseconds (default: 300 for enter, 200 for exit)
  delay?: number     // Delay before animation starts
  easing?: string    // CSS easing function
}
```

Common easing values:
- `ease` (default)
- `ease-in`
- `ease-out`
- `ease-in-out`
- `linear`
- `cubic-bezier(x1, y1, x2, y2)`

### Complex Animation Example

```tsx
<Transition
  enter={{
    opacity: 0,
    y: 30,
    scale: 0.9,
    rotate: -5
  }}
  enterTo={{
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0
  }}
  exit={{
    opacity: 0,
    y: -30,
    scale: 0.9,
    rotate: 5
  }}
  enterTiming={{
    duration: 500,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like bounce
    delay: 100
  }}
  exitTiming={{
    duration: 300,
    easing: 'ease-in'
  }}
>
  <div>Bouncy entrance!</div>
</Transition>
```

## Reusable Transitions

Create reusable transition configurations as objects:

```tsx
const bounceIn = {
  enter: { opacity: 0, scale: 0.3 },
  enterTo: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.3 },
  enterTiming: {
    duration: 500,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  exitTiming: {
    duration: 300,
    easing: 'ease-in'
  }
}

// Use anywhere
function Notification() {
  return (
    <Transition {...bounceIn}>
      <div class="notification">Message sent!</div>
    </Transition>
  )
}
```

## Built-in UI Transitions

Flexium provides pre-configured transitions for common UI patterns:

```tsx
import { transitions } from 'flexium/primitives'
```

| Transition | Use Case | Behavior |
|------------|----------|----------|
| `transitions.modal` | Modal dialogs | Subtle scale with fade and vertical shift |
| `transitions.dropdown` | Dropdown menus | Quick scale-fade from top |
| `transitions.tooltip` | Tooltips | Fast scale animation |
| `transitions.notification` | Toast notifications | Slide from right with fade |
| `transitions.page` | Page transitions | Simple opacity crossfade |

### Examples

```tsx
// Modal dialog
{isModalOpen.valueOf() && (
  <Transition {...transitions.modal}>
    <div class="modal">
      <h2>Confirm Action</h2>
      <p>Are you sure?</p>
    </div>
  </Transition>
)}

// Dropdown menu
{isMenuOpen.valueOf() && (
  <Transition {...transitions.dropdown}>
    <ul class="menu">
      <li>Profile</li>
      <li>Settings</li>
      <li>Logout</li>
    </ul>
  </Transition>
)}

// Toast notification
{showToast.valueOf() && (
  <Transition {...transitions.notification}>
    <div class="toast">Changes saved!</div>
  </Transition>
)}
```

## TransitionGroup

Use `<TransitionGroup>` to create staggered animations for lists:

```tsx
import { TransitionGroup, Transition } from 'flexium/primitives'
import { state } from 'flexium/core'

function NotificationList() {
  const notifications = state([
    { id: 1, text: 'Welcome!' },
    { id: 2, text: 'New message' },
    { id: 3, text: 'Update available' }
  ])

  return (
    <TransitionGroup stagger={50}>
      {notifications.map((notification) => (
        <Transition key={notification.id} preset="slide-right">
          <div class="notification">{notification.text}</div>
        </Transition>
      ))}
    </TransitionGroup>
  )
}
```

Each notification animates with a 50ms delay after the previous one, creating a cascading effect.

### TransitionGroup Props

```typescript
interface TransitionGroupProps {
  stagger?: number  // Delay between each child animation in ms (default: 50)
  children: any     // Child Transition components
}
```

### Advanced Stagger Example

```tsx
function AnimatedList() {
  const items = state([1, 2, 3, 4, 5])

  return (
    <TransitionGroup stagger={100}>
      {items.map((item, index) => (
        <Transition
          key={index}
          preset="slide-up"
          enterTiming={{ duration: 400, easing: 'ease-out' }}
        >
          <div class="list-item">
            Item {item}
          </div>
        </Transition>
      ))}
    </TransitionGroup>
  )
}
```

## Animation Callbacks

Track animation lifecycle events with callbacks:

```tsx
function TrackedTransition() {
  return (
    <Transition
      preset="fade"
      onEnterStart={() => console.log('Starting enter animation')}
      onEnterComplete={() => console.log('Enter complete')}
      onExitStart={() => console.log('Starting exit animation')}
      onExitComplete={() => console.log('Exit complete, element removed')}
    >
      <div>Tracked content</div>
    </Transition>
  )
}
```

### Use Cases for Callbacks

1. **Analytics tracking**: Log when animations complete
2. **Cleanup operations**: Remove resources after exit
3. **Chained animations**: Trigger follow-up effects
4. **Loading states**: Update UI state on animation completion

```tsx
function ModalWithCallback() {
  const isOpen = state(false)
  const hasExited = state(false)

  return (
    <>
      {isOpen.valueOf() && (
        <Transition
          {...transitions.modal}
          onEnterStart={() => document.body.style.overflow = 'hidden'}
          onExitComplete={() => {
            document.body.style.overflow = 'auto'
            hasExited.set(true)
          }}
        >
          <div class="modal">Modal content</div>
        </Transition>
      )}
    </>
  )
}
```

## Integration with Control Flow

Transitions work seamlessly with Flexium's control flow components.

### With Show

The most common pattern - animate conditional content:

```tsx
function ConditionalContent() {
  const visible = state(false)

  return (
    <div>
      <button onclick={() => visible.set(v => !v)}>Toggle</button>

      {visible.valueOf() && (
        <Transition preset="slide-up">
          <div class="content">Slides up when visible</div>
        </Transition>
      )}
    </div>
  )
}
```

### With Lists

Animate list items as they're added or removed:

```tsx
function TodoList() {
  const todos = state([
    { id: 1, text: 'Learn Flexium' },
    { id: 2, text: 'Build app' }
  ])

  const addTodo = (text) => {
    todos.set(prev => [...prev, { id: Date.now(), text }])
  }

  const removeTodo = (id) => {
    todos.set(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      <TransitionGroup stagger={30}>
        {todos.map((todo) => (
          <Transition key={todo.id} preset="slide-up">
            <div class="todo-item">
              <span>{todo.text}</span>
              <button onclick={() => removeTodo(todo.id)}>Remove</button>
            </div>
          </Transition>
        ))}
      </TransitionGroup>

      <button onclick={() => addTodo('New todo')}>Add Todo</button>
    </div>
  )
}
```

### With Switch/Match

Different animations for different states:

```tsx
function LoadingState() {
  const status = state('loading')

  return (
    <Switch>
      <Match when={() => status.valueOf() === 'loading'}>
        <Transition preset="fade">
          <div class="spinner">Loading...</div>
        </Transition>
      </Match>
      <Match when={() => status.valueOf() === 'success'}>
        <Transition preset="slide-up">
          <div class="success">Success!</div>
        </Transition>
      </Match>
      <Match when={() => status.valueOf() === 'error'}>
        <Transition preset="scale-fade">
          <div class="error">Error occurred</div>
        </Transition>
      </Match>
    </Switch>
  )
}
```

## Complete Examples

### Animated Modal

```tsx
import { Transition, transitions } from 'flexium/primitives'
import { state } from 'flexium/core'

function Modal({ isOpen, onClose, children }) {
  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Transition
            preset="fade"
            enterTiming={{ duration: 200 }}
            exitTiming={{ duration: 150 }}
          >
            <div
              class="backdrop"
              onclick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}
            />
          </Transition>

          {/* Dialog */}
          <Transition {...transitions.modal}>
            <div
              class="modal"
              role="dialog"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px'
              }}
            >
              {children}
            </div>
          </Transition>
        </>
      )}
    </>
  )
}

// Usage
function App() {
  const isModalOpen = state(false)

  return (
    <div>
      <button onclick={() => isModalOpen.set(true)}>Open Modal</button>

      <Modal isOpen={isModalOpen} onClose={() => isModalOpen.set(false)}>
        <h2>Modal Title</h2>
        <p>Modal content here</p>
        <button onclick={() => isModalOpen.set(false)}>Close</button>
      </Modal>
    </div>
  )
}
```

### Animated Tabs

```tsx
function Tabs() {
  const activeTab = state('home')

  const tabs = ['home', 'profile', 'settings']

  return (
    <div>
      <div class="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab}
            onclick={() => activeTab.set(tab)}
            class={activeTab === tab ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </div>

      <div class="tab-content">
        {activeTab.valueOf() === 'home' && (
          <Transition preset="fade">
            <div>Home content</div>
          </Transition>
        )}

        {activeTab.valueOf() === 'profile' && (
          <Transition preset="fade">
            <div>Profile content</div>
          </Transition>
        )}

        {activeTab.valueOf() === 'settings' && (
          <Transition preset="fade">
            <div>Settings content</div>
          </Transition>
        )}
      </div>
    </div>
  )
}
```

### Staggered Grid

```tsx
function ImageGrid() {
  const images = state([
    { id: 1, url: '/img1.jpg' },
    { id: 2, url: '/img2.jpg' },
    { id: 3, url: '/img3.jpg' },
    { id: 4, url: '/img4.jpg' },
    { id: 5, url: '/img5.jpg' },
    { id: 6, url: '/img6.jpg' }
  ])

  return (
    <div class="grid">
      <TransitionGroup stagger={75}>
        {images.map((image) => (
          <Transition
            key={image.id}
            enter={{ opacity: 0, scale: 0.8, y: 20 }}
            enterTo={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            enterTiming={{
              duration: 500,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div class="grid-item">
              <img src={image.url} alt="" />
            </div>
          </Transition>
        ))}
      </TransitionGroup>
    </div>
  )
}
```

### Notification Stack

```tsx
function NotificationStack() {
  const notifications = state([])

  const addNotification = (message) => {
    const id = Date.now()
    notifications.set(prev => [...prev, { id, message }])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notifications.set(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  return (
    <div>
      <button onclick={() => addNotification('Hello!')}>
        Show Notification
      </button>

      <div class="notification-stack">
        <TransitionGroup stagger={100}>
          {notifications.map((notification) => (
            <Transition key={notification.id} {...transitions.notification}>
              <div class="notification">
                {notification.message}
                <button
                  onclick={() =>
                    notifications.set(prev =>
                      prev.filter(n => n.id !== notification.id)
                    )
                  }
                >
                  ×
                </button>
              </div>
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    </div>
  )
}
```

## Performance Tips

1. **Prefer transforms and opacity**: These properties are GPU-accelerated and don't trigger layout recalculations

2. **Avoid animating width/height**: Use `scale` transforms instead when possible

3. **Use shorter exit durations**: Exit animations can be faster than enter animations (users perceive them as more responsive)

4. **Limit stagger count**: With many items, reduce stagger delay or remove it entirely to avoid long animation queues

5. **Dispose properly**: The Transition component handles cleanup automatically, but ensure parent components don't hold references to removed elements

### Optimized Animation Properties

```tsx
// Good - GPU accelerated
<Transition
  enter={{ opacity: 0, x: 20, scale: 0.95 }}
  enterTo={{ opacity: 1, x: 0, scale: 1 }}
>

// Avoid - triggers layout recalculation
<Transition
  enter={{ opacity: 0, width: 0, height: 0 }}
  enterTo={{ opacity: 1, width: '100%', height: 'auto' }}
>
```

### Performance-Optimized Stagger

```tsx
// Good for small lists (< 20 items)
<TransitionGroup stagger={50}>

// Better for medium lists (20-100 items)
<TransitionGroup stagger={20}>

// Best for large lists (100+ items)
<TransitionGroup stagger={0}> // or remove TransitionGroup
```

## TypeScript

Transitions are fully typed:

```typescript
import {
  Transition,
  TransitionGroup,
  transitions,
  type TransitionProps,
  type TransitionGroupProps,
  type TransitionPreset,
  type TransitionTiming
} from 'flexium/primitives'

// Custom transition with full types
const customTransition: Omit<TransitionProps, 'children'> = {
  enter: { opacity: 0, y: 20 },
  enterTo: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  enterTiming: { duration: 300, easing: 'ease-out' },
  exitTiming: { duration: 200, easing: 'ease-in' }
}

// Preset type
const preset: TransitionPreset = 'fade'

// Timing configuration
const timing: TransitionTiming = {
  duration: 500,
  delay: 100,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
}
```

## Comparison with Motion API

Transitions are built on top of Flexium's Motion API. Here's when to use each:

| Feature | Transition | Motion |
|---------|------------|--------|
| Enter/Exit animations | Yes | Manual |
| Integration with conditionals | Automatic | Manual |
| Declarative API | Yes | Imperative |
| Stagger support | Yes (TransitionGroup) | Manual |
| Fine-grained control | Limited | Full |
| Use case | UI components | Complex animations |

Use **Transitions** when:
- Animating elements that appear/disappear with conditionals or lists
- You need enter/exit animations with minimal code
- Working with lists that need staggered animations
- Building common UI patterns (modals, dropdowns, notifications)

Use **Motion API** when:
- You need fine-grained animation control
- Creating complex multi-step animations
- Animating properties during component lifecycle
- Building advanced animation sequences

See [Motion documentation](/guide/motion) for more on the low-level Motion API.

## Browser Support

Transitions require Web Animations API support:

- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

For older browsers, include the [web-animations-js polyfill](https://github.com/web-animations/web-animations-js):

```html
<script src="https://cdn.jsdelivr.net/npm/web-animations-js@2.3.2/web-animations.min.js"></script>
```
