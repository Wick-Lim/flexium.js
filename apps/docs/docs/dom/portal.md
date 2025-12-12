---
title: Portal - DOM Teleportation
---

# &lt;Portal /&gt;

Render children into a different DOM location.

## Import

```tsx
import { Portal } from 'flexium/dom'
```

## Signature

```tsx
<Portal mount={targetElement}>
  {children}
</Portal>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `mount` | `HTMLElement \| string` | Target element or CSS selector |
| `children` | `JSX.Element` | Content to render in the portal |

## Usage

### Basic Usage

```tsx
<Portal mount={document.body}>
  <div class="modal">Modal Content</div>
</Portal>
```

### With CSS Selector

```tsx
<Portal mount="#modal-root">
  <Dialog />
</Portal>
```

### Modal Example

```tsx
function Modal(props) {
  const isOpen = state(false)

  return (
    <>
      <button onclick={() => isOpen.set(true)}>Open Modal</button>

      {isOpen && (
        <Portal mount={document.body}>
          <div class="modal-overlay" onclick={() => isOpen.set(false)}>
            <div class="modal-content" onclick={(e) => e.stopPropagation()}>
              {props.children}
              <button onclick={() => isOpen.set(false)}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
```

### Tooltip Example

```tsx
function Tooltip(props) {
  const visible = state(false)
  const position = state({ x: 0, y: 0 })

  const showTooltip = (e) => {
    position.set({ x: e.clientX, y: e.clientY })
    visible.set(true)
  }

  return (
    <div onmouseenter={showTooltip} onmouseleave={() => visible.set(false)}>
      {props.children}

      {visible && (
        <Portal mount={document.body}>
          <div
            class="tooltip"
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`
            }}
          >
            {props.content}
          </div>
        </Portal>
      )}
    </div>
  )
}
```

### Notification Toast

```tsx
function Toast(props) {
  return (
    <Portal mount="#toast-container">
      <div class={`toast toast-${props.type}`}>
        {props.message}
      </div>
    </Portal>
  )
}

// In your HTML
// <div id="toast-container"></div>
```

### Dropdown Menu

```tsx
function Dropdown(props) {
  const open = state(false)
  let triggerRef

  return (
    <div class="dropdown">
      <button ref={triggerRef} onclick={() => open.set(o => !o)}>
        {props.label}
      </button>

      {open && (
        <Portal mount={document.body}>
          <div
            class="dropdown-menu"
            style={{
              position: 'absolute',
              // Position relative to trigger
            }}
          >
            {props.children}
          </div>
        </Portal>
      )}
    </div>
  )
}
```

## Behavior

- Content is **physically moved** to target element
- **Maintains reactivity** and event handling
- **Cleans up** when component unmounts
- Supports **dynamic targets**

## Use Cases

- **Modals** - Escape parent overflow/z-index
- **Tooltips** - Position freely in viewport
- **Dropdowns** - Avoid clipping issues
- **Toasts** - Global notification container

## Notes

- Target element must exist when Portal mounts
- Events still bubble through the React tree, not DOM tree
- Use with `Show` for conditional portals

## Demo

<script setup>
import PortalDemo from '../../components/PortalDemo.vue'
</script>

<PortalDemo />

## See Also

- [render()](/docs/dom/render)
- [&lt;Show /&gt;](/docs/core/show)
