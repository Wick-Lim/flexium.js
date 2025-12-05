# useKeyboard()

Track keyboard input for games and interactive applications.

## Import

```tsx
import { useKeyboard, Keys } from 'flexium/interactive'
```

## Signature

```ts
function useKeyboard(): KeyboardState

interface KeyboardState {
  isPressed: (key: string) => boolean
  isJustPressed: (key: string) => boolean
  isJustReleased: (key: string) => boolean
  keys: Accessor<Set<string>>
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `isPressed` | `(key) => boolean` | Check if key is currently held |
| `isJustPressed` | `(key) => boolean` | Check if key was pressed this frame |
| `isJustReleased` | `(key) => boolean` | Check if key was released this frame |
| `keys` | `Accessor<Set<string>>` | All currently pressed keys |

## Keys Constants

```ts
import { Keys } from 'flexium/interactive'

Keys.ArrowUp
Keys.ArrowDown
Keys.ArrowLeft
Keys.ArrowRight
Keys.Space
Keys.Enter
Keys.Escape
Keys.Shift
Keys.Control
Keys.Alt
// ... and more
```

## Usage

### Basic Usage

```tsx
function Game() {
  const keyboard = useKeyboard()

  const loop = createLoop({
    onUpdate: () => {
      if (keyboard.isPressed(Keys.ArrowUp)) {
        moveUp()
      }
      if (keyboard.isPressed(Keys.ArrowDown)) {
        moveDown()
      }
    }
  })

  return <Canvas />
}
```

### WASD Controls

```tsx
function PlayerController() {
  const keyboard = useKeyboard()

  effect(() => {
    if (keyboard.isPressed('w') || keyboard.isPressed('W')) {
      player.y -= speed
    }
    if (keyboard.isPressed('s') || keyboard.isPressed('S')) {
      player.y += speed
    }
    if (keyboard.isPressed('a') || keyboard.isPressed('A')) {
      player.x -= speed
    }
    if (keyboard.isPressed('d') || keyboard.isPressed('D')) {
      player.x += speed
    }
  })
}
```

### Jump Detection

```tsx
const keyboard = useKeyboard()

const loop = createLoop({
  onUpdate: () => {
    // Only jump on initial press, not while held
    if (keyboard.isJustPressed(Keys.Space)) {
      player.jump()
    }
  }
})
```

### Pause Menu

```tsx
const [paused, setPaused] = state(false)
const keyboard = useKeyboard()

effect(() => {
  if (keyboard.isJustPressed(Keys.Escape)) {
    setPaused(p => !p)
  }
})
```

### Multiple Keys

```tsx
const keyboard = useKeyboard()

// Sprint while holding shift
const speed = keyboard.isPressed(Keys.Shift) ? 10 : 5

// Combo detection
if (keyboard.isPressed(Keys.Control) && keyboard.isJustPressed('s')) {
  save()
}
```

### Debug Display

```tsx
function DebugOverlay() {
  const keyboard = useKeyboard()

  return (
    <div class="debug">
      Pressed keys: {() => Array.from(keyboard.keys()).join(', ')}
    </div>
  )
}
```

## Behavior

- **Automatically attaches** event listeners
- **Cleans up** on component unmount
- Tracks **key state** per frame
- Supports **any key code**

## Notes

- Works with both key codes and key values
- Use `isJustPressed` for single-fire actions
- Use `isPressed` for continuous actions
- Remember to handle both lowercase and uppercase for letter keys

## Demo

<script setup>
import UseKeyboardDemo from '../../components/UseKeyboardDemo.vue'
</script>

<UseKeyboardDemo />

## See Also

- [useMouse()](/docs/interactive/use-mouse)
- [createLoop()](/docs/interactive/loop)
