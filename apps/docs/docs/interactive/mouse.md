# mouse()

Track mouse position and button states.

## Import

```tsx
import { mouse } from 'flexium/interactive'
```

## Signature

```ts
function mouse(options?: { target?: HTMLElement }): MouseState

interface MouseState {
  position: Accessor<{ x: number, y: number }>
  delta: Accessor<{ x: number, y: number }>
  wheelDelta: Accessor<number>
  isPressed: (button: number) => boolean
  isLeftPressed: () => boolean
  isRightPressed: () => boolean
  isMiddlePressed: () => boolean
  clearFrameState: () => void
  dispose: () => void
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `position` | `Accessor<{ x, y }>` | Current mouse position |
| `delta` | `Accessor<{ x, y }>` | Movement since last frame |
| `wheelDelta` | `Accessor<number>` | Scroll wheel delta |
| `isPressed` | `(button) => boolean` | Check if button is held |
| `isLeftPressed` | `() => boolean` | Check if left button is held |
| `isRightPressed` | `() => boolean` | Check if right button is held |
| `isMiddlePressed` | `() => boolean` | Check if middle button is held |
| `clearFrameState` | `() => void` | Reset per-frame state |
| `dispose` | `() => void` | Clean up event listeners |

## Mouse Buttons

| Value | Button |
|-------|--------|
| `0` | Left button |
| `1` | Middle button |
| `2` | Right button |

## Usage

### Basic Usage

```tsx
function Game() {
  const m = mouse()

  return (
    <div>
      Position: {m.position.x}, {m.position.y}
    </div>
  )
}
```

### Canvas Drawing

```tsx
function DrawingApp() {
  const canvasRef = useRef(null)
  const m = mouse()
  const isDrawing = useState(false)

  useEffect(() => {
    if (m.isLeftPressed()) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.lineTo(m.position.x, m.position.y)
      ctx.stroke()
    }
  })

  return <canvas ref={canvasRef} />
}
```

### Click Detection

```tsx
const m = mouse()

const gameLoop = useLoop({
  onUpdate: () => {
    if (m.isLeftPressed()) {
      handleClick(m.position.x, m.position.y)
    }
  }
})
```

### Cursor Following

```tsx
function Cursor() {
  const m = mouse()

  return (
    <div
      class="custom-cursor"
      style={{
        transform: `translate(${m.position.x}px, ${m.position.y}px)`
      }}
    />
  )
}
```

### Canvas-Relative Position

```tsx
function CanvasGame() {
  let canvasRef

  const m = mouse()

  const getCanvasPosition = () => {
    if (!canvasRef) return { x: 0, y: 0 }
    const rect = canvasRef.getBoundingClientRect()
    return {
      x: m.position.x - rect.left,
      y: m.position.y - rect.top
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onmousemove={() => {
        const pos = getCanvasPosition()
        updateCursor(pos.x, pos.y)
      }}
    />
  )
}
```

### Drag and Drop

```tsx
function Draggable(props) {
  const m = mouse()
  const isDragging = useState(false)
  const offset = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!m.isLeftPressed()) {
      isDragging.set(false)
    }
  })

  const handleMouseDown = (e) => {
    isDragging.set(true)
    offset.set({
      x: e.clientX - props.x,
      y: e.clientY - props.y
    })
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: isDragging ? m.position.x - offset.x : props.x,
        top: isDragging ? m.position.y - offset.y : props.y
      }}
      onmousedown={handleMouseDown}
    >
      {props.children}
    </div>
  )
}
```

### Right-Click Context Menu

```tsx
function ContextMenuArea() {
  const m = mouse()
  const menuPos = useState(null)

  useEffect(() => {
    if (m.isRightPressed()) {
      menuPos.set({ x: m.position.x, y: m.position.y })
    }
    if (m.isLeftPressed() && menuPos.valueOf()) {
      menuPos.set(null)
    }
  })

  return (
    <div oncontextmenu={(e) => e.preventDefault()}>
      {menuPos && <ContextMenu x={menuPos.x} y={menuPos.y} />}
    </div>
  )
}
```

## Behavior

- Tracks **global mouse position** by default
- Can track **relative to element** with target
- Updates on **every mouse move**
- Button states reset **each frame**

## Notes

- Use with `useLoop()` for interactive input
- Position is relative to viewport by default
- Prevent default context menu for right-click handling

## Demo

<script setup>
import UseMouseDemo from '../../components/UseMouseDemo.vue'
</script>

<UseMouseDemo />

## See Also

- [keyboard()](/docs/interactive/keyboard)
- [useLoop()](/docs/interactive/loop)
