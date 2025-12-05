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
  const [isOpen, setIsOpen] = state(false)

  return (
    <>
      <button onclick={() => setIsOpen(true)}>Open Modal</button>

      <Show when={isOpen}>
        <Portal mount={document.body}>
          <div class="modal-overlay" onclick={() => setIsOpen(false)}>
            <div class="modal-content" onclick={(e) => e.stopPropagation()}>
              {props.children}
              <button onclick={() => setIsOpen(false)}>Close</button>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}
```

### Tooltip Example

```tsx
function Tooltip(props) {
  const [visible, setVisible] = state(false)
  const [position, setPosition] = state({ x: 0, y: 0 })

  const showTooltip = (e) => {
    setPosition({ x: e.clientX, y: e.clientY })
    setVisible(true)
  }

  return (
    <div onmouseenter={showTooltip} onmouseleave={() => setVisible(false)}>
      {props.children}

      <Show when={visible}>
        <Portal mount={document.body}>
          <div
            class="tooltip"
            style={{
              position: 'fixed',
              left: `${position().x}px`,
              top: `${position().y}px`
            }}
          >
            {props.content}
          </div>
        </Portal>
      </Show>
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
  const [open, setOpen] = state(false)
  let triggerRef

  return (
    <div class="dropdown">
      <button ref={triggerRef} onclick={() => setOpen(o => !o)}>
        {props.label}
      </button>

      <Show when={open}>
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
      </Show>
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

## See Also

- [render()](/docs/dom/render)
- [&lt;Show /&gt;](/docs/core/show)
