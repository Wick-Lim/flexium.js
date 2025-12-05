# useMouse()

Track mouse position and button states.

## Import

```tsx
import { useMouse } from 'flexium/game'
```

## Signature

```ts
function useMouse(target?: HTMLElement): MouseState

interface MouseState {
  x: Accessor<number>
  y: Accessor<number>
  isPressed: (button?: number) => boolean
  isJustPressed: (button?: number) => boolean
  isJustReleased: (button?: number) => boolean
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `x` | `Accessor<number>` | Current X position |
| `y` | `Accessor<number>` | Current Y position |
| `isPressed` | `(button?) => boolean` | Check if button is held |
| `isJustPressed` | `(button?) => boolean` | Check if button just pressed |
| `isJustReleased` | `(button?) => boolean` | Check if button just released |

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
  const mouse = useMouse()

  return (
    <div>
      Position: {mouse.x()}, {mouse.y()}
    </div>
  )
}
```

### Canvas Drawing

```tsx
function DrawingApp() {
  const canvasRef = ref(null)
  const mouse = useMouse()
  const [isDrawing, setIsDrawing] = state(false)

  effect(() => {
    if (mouse.isPressed(0)) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.lineTo(mouse.x(), mouse.y())
      ctx.stroke()
    }
  })

  return <canvas ref={canvasRef} />
}
```

### Click Detection

```tsx
const mouse = useMouse()

const gameLoop = createGameLoop({
  onUpdate: () => {
    if (mouse.isJustPressed(0)) {
      handleClick(mouse.x(), mouse.y())
    }
  }
})
```

### Cursor Following

```tsx
function Cursor() {
  const mouse = useMouse()

  return (
    <div
      class="custom-cursor"
      style={{
        transform: `translate(${mouse.x()}px, ${mouse.y()}px)`
      }}
    />
  )
}
```

### Canvas-Relative Position

```tsx
function CanvasGame() {
  let canvasRef

  const mouse = useMouse()

  const getCanvasPosition = () => {
    if (!canvasRef) return { x: 0, y: 0 }
    const rect = canvasRef.getBoundingClientRect()
    return {
      x: mouse.x() - rect.left,
      y: mouse.y() - rect.top
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
  const mouse = useMouse()
  const [isDragging, setIsDragging] = state(false)
  const [offset, setOffset] = state({ x: 0, y: 0 })

  effect(() => {
    if (mouse.isJustReleased(0)) {
      setIsDragging(false)
    }
  })

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setOffset({
      x: e.clientX - props.x,
      y: e.clientY - props.y
    })
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: isDragging() ? mouse.x() - offset().x : props.x,
        top: isDragging() ? mouse.y() - offset().y : props.y
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
  const mouse = useMouse()
  const [menuPos, setMenuPos] = state(null)

  effect(() => {
    if (mouse.isJustPressed(2)) {
      setMenuPos({ x: mouse.x(), y: mouse.y() })
    }
    if (mouse.isJustPressed(0) && menuPos()) {
      setMenuPos(null)
    }
  })

  return (
    <div oncontextmenu={(e) => e.preventDefault()}>
      <Show when={menuPos}>
        <ContextMenu x={menuPos().x} y={menuPos().y} />
      </Show>
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

- Use with `createGameLoop` for game input
- Position is relative to viewport by default
- Prevent default context menu for right-click handling

## See Also

- [useKeyboard()](/docs/game/use-keyboard)
- [createGameLoop()](/docs/game/game-loop)
