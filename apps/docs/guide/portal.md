# Portal

Portal allows you to render children into a different part of the DOM, outside of the parent component hierarchy. This is essential for modals, tooltips, popovers, and other overlay UI.

## Basic Usage

Import `Portal` from `flexium/dom` and specify a mount target:

```tsx
import { Portal } from 'flexium/dom'
import { state, Show } from 'flexium/core'

function App() {
  const [showModal, setShowModal] = state(false)

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>

      <Show when={showModal}>
        <Portal mount={document.body}>
          <div class="modal-overlay">
            <div class="modal">
              <h2>Modal Title</h2>
              <p>Modal content goes here.</p>
              <button onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
```

The modal content renders at the end of `document.body`, even though it's defined inside the component.

## Why Use Portal?

### Z-Index and Stacking Context

Without Portal, modals can be trapped behind other elements due to CSS stacking contexts:

```tsx
// Without Portal - modal may be clipped or hidden
function Card() {
  return (
    <div style={{ overflow: 'hidden' }}>  {/* Creates stacking context */}
      <Modal />  {/* Trapped inside! */}
    </div>
  )
}

// With Portal - modal renders at body level
function Card() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Portal>
        <Modal />  {/* Renders at document.body */}
      </Portal>
    </div>
  )
}
```

### Event Bubbling

Even though Portal renders content elsewhere in the DOM, events still bubble through the React component tree:

```tsx
function Parent() {
  return (
    <div onClick={() => console.log('Parent clicked')}>
      <Portal>
        <button onClick={() => console.log('Button clicked')}>
          Click me
        </button>
      </Portal>
    </div>
  )
}
// Clicking button logs both "Button clicked" and "Parent clicked"
```

## Modal Example

A complete modal implementation:

```tsx
import { Portal } from 'flexium/dom'
import { state, effect, Show } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: any
}

function Modal(props: ModalProps) {
  // Prevent body scroll when modal is open
  effect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  })

  // Close on Escape key
  effect(() => {
    if (props.isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') props.onClose()
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  })

  return (
    <Show when={() => props.isOpen}>
      <Portal mount={document.body}>
        {/* Backdrop */}
        <div
          onClick={props.onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          {/* Modal content - stop propagation to prevent closing */}
          <Column
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <Row style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
              <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {props.title}
              </Text>
              <Pressable onPress={props.onClose}>
                <Text>✕</Text>
              </Pressable>
            </Row>
            {props.children}
          </Column>
        </div>
      </Portal>
    </Show>
  )
}

// Usage
function App() {
  const [showModal, setShowModal] = state(false)

  return (
    <Column>
      <Pressable onPress={() => setShowModal(true)}>
        <Text>Open Modal</Text>
      </Pressable>

      <Modal
        isOpen={showModal()}
        onClose={() => setShowModal(false)}
        title="Welcome"
      >
        <Text>This is a modal dialog!</Text>
      </Modal>
    </Column>
  )
}
```

## Tooltip Example

Portals are perfect for tooltips that need to escape overflow containers:

```tsx
import { Portal } from 'flexium/dom'
import { state, Show } from 'flexium/core'

function Tooltip(props: { content: string; children: any }) {
  const [show, setShow] = state(false)
  const [position, setPosition] = state({ x: 0, y: 0 })

  const handleMouseEnter = (e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    })
    setShow(true)
  }

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {props.children}

      <Show when={show}>
        <Portal>
          <div
            style={{
              position: 'fixed',
              left: `${position().x}px`,
              top: `${position().y}px`,
              transform: 'translate(-50%, -100%)',
              background: '#333',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 9999
            }}
          >
            {props.content}
          </div>
        </Portal>
      </Show>
    </span>
  )
}

// Usage
function App() {
  return (
    <div style={{ overflow: 'hidden' }}>  {/* Doesn't trap tooltip! */}
      <Tooltip content="More information">
        <button>Hover me</button>
      </Tooltip>
    </div>
  )
}
```

## Dropdown Menu Example

```tsx
import { Portal } from 'flexium/dom'
import { state, effect, Show } from 'flexium/core'

function Dropdown(props: { trigger: any; children: any }) {
  const [open, setOpen] = state(false)
  const [position, setPosition] = state({ x: 0, y: 0 })
  let triggerRef: HTMLElement | null = null

  const updatePosition = () => {
    if (triggerRef) {
      const rect = triggerRef.getBoundingClientRect()
      setPosition({
        x: rect.left,
        y: rect.bottom + 4
      })
    }
  }

  // Close on outside click
  effect(() => {
    if (open()) {
      const handleClick = (e: MouseEvent) => {
        if (!triggerRef?.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  })

  return (
    <>
      <span
        ref={(el) => (triggerRef = el)}
        onClick={() => {
          updatePosition()
          setOpen((prev) => !prev)
        }}
      >
        {props.trigger}
      </span>

      <Show when={open}>
        <Portal>
          <div
            style={{
              position: 'fixed',
              left: `${position().x}px`,
              top: `${position().y}px`,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}
          >
            {props.children}
          </div>
        </Portal>
      </Show>
    </>
  )
}
```

## Custom Mount Target

By default, Portal renders to `document.body`. You can specify a different target:

```tsx
// Create a dedicated portal root
const portalRoot = document.getElementById('portal-root')!

function App() {
  return (
    <Portal mount={portalRoot}>
      <Modal />
    </Portal>
  )
}
```

In your HTML:
```html
<body>
  <div id="app"></div>
  <div id="portal-root"></div>  <!-- Portal content goes here -->
</body>
```

## API Reference

### `Portal`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mount` | `HTMLElement` | `document.body` | Target container for portal content |
| `children` | `any` | - | Content to render in the portal |

## Cleanup

Portal automatically cleans up when unmounted:
- Removes portal content from the DOM
- Cleans up any reactive subscriptions within the portal

## Best Practices

1. **Use a dedicated portal root**: Create a specific element for portals to make styling and debugging easier

2. **Handle accessibility**: Ensure modals have proper focus management and ARIA attributes

3. **Consider z-index strategy**: Establish a z-index scale for different overlay types (tooltips > dropdowns > modals)

4. **Clean up side effects**: Use `effect()` cleanup for event listeners and body modifications

5. **Test portal behavior**: Verify that portals work correctly with your CSS framework and layout

## Common Patterns

| Use Case | Mount Target |
|----------|--------------|
| Modal/Dialog | `document.body` or dedicated root |
| Tooltip | `document.body` |
| Dropdown | `document.body` |
| Toast notifications | Dedicated toast container |
| Full-screen overlay | `document.body` |
