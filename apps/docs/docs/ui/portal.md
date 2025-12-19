# Portal

Render children into a different DOM node, outside the parent component tree.

## Import

```ts
import { Portal } from 'flexium-ui'
```

## Overview

Portal is useful for rendering overlays, modals, and tooltips that need to escape their parent's styling context (like `overflow: hidden` or `z-index` stacking).

## Basic Usage

```tsx
import { Portal } from 'flexium-ui'

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <Portal target={document.body}>
      <div class="modal-overlay" onclick={onClose}>
        <div class="modal-content" onclick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </Portal>
  )
}
```

## With Custom Target

Render into any DOM element:

```tsx
// Render into a specific container
<Portal target={document.getElementById('modal-root')}>
  <Modal />
</Portal>

// Render into document.body (default)
<Portal>
  <Toast message="Saved!" />
</Portal>
```

## Common Patterns

### Dropdown Menu

```tsx
function Dropdown({ trigger, items }) {
  const [isOpen, setIsOpen] = use(false)
  const [position, setPosition] = use({ top: 0, left: 0 })

  const handleOpen = (e) => {
    const rect = e.target.getBoundingClientRect()
    setPosition({ top: rect.bottom, left: rect.left })
    setIsOpen(true)
  }

  return (
    <>
      <button onclick={handleOpen}>{trigger}</button>
      {isOpen && (
        <Portal>
          <div
            class="dropdown-menu"
            style={{ position: 'fixed', top: position.top, left: position.left }}
          >
            {items.map(item => (
              <div onclick={() => { item.onClick(); setIsOpen(false) }}>
                {item.label}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </>
  )
}
```

### Tooltip

```tsx
function Tooltip({ children, text }) {
  const [show, setShow] = use(false)
  const [pos, setPos] = use({ x: 0, y: 0 })

  const handleMouseEnter = (e) => {
    const rect = e.target.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
    setShow(true)
  }

  return (
    <>
      <span
        onmouseenter={handleMouseEnter}
        onmouseleave={() => setShow(false)}
      >
        {children}
      </span>
      {show && (
        <Portal>
          <div
            class="tooltip"
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y - 8,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {text}
          </div>
        </Portal>
      )}
    </>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `Element` | `document.body` | DOM element to render into |
| `children` | `JSX.Element` | - | Content to render |

## See Also

- [Layout Components](/docs/ui/layout) - Column, Row, Center, Spacer
