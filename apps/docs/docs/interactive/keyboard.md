# keyboard()

Track keyboard input for games and interactive applications.

## Import

```tsx
import { keyboard, Keys } from 'flexium/interactive'
```

## Signature

```ts
function keyboard(): KeyboardState

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
  const kb = keyboard()

  const gameLoop = useLoop({
    onUpdate: () => {
      if (kb.isPressed(Keys.ArrowUp)) {
        moveUp()
      }
      if (kb.isPressed(Keys.ArrowDown)) {
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
  const kb = keyboard()

  useEffect(() => {
    if (kb.isPressed('w') || kb.isPressed('W')) {
      player.y -= speed
    }
    if (kb.isPressed('s') || kb.isPressed('S')) {
      player.y += speed
    }
    if (kb.isPressed('a') || kb.isPressed('A')) {
      player.x -= speed
    }
    if (kb.isPressed('d') || kb.isPressed('D')) {
      player.x += speed
    }
  })
}
```

### Jump Detection

```tsx
const kb = keyboard()

const gameLoop = useLoop({
  onUpdate: () => {
    // Only jump on initial press, not while held
    if (kb.isJustPressed(Keys.Space)) {
      player.jump()
    }
  }
})
```

### Pause Menu

```tsx
const [paused] = useState(false)
const kb = keyboard()

useEffect(() => {
  if (kb.isJustPressed(Keys.Escape)) {
    paused.set(p => !p)
  }
})
```

### Multiple Keys

```tsx
const kb = keyboard()

// Sprint while holding shift
const speed = kb.isPressed(Keys.Shift) ? 10 : 5

// Combo detection
if (kb.isPressed(Keys.Control) && kb.isJustPressed('s')) {
  save()
}
```

### Debug Display

```tsx
function DebugOverlay() {
  const kb = keyboard()

  return (
    <div class="debug">
      Pressed keys: {() => Array.from(kb.keys()).join(', ')}
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

- [mouse()](/docs/interactive/mouse)
- [useLoop()](/docs/interactive/loop)
