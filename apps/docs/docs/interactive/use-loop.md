# useLoop()

Create a consistent animation/game loop with delta time.

<script setup>
import SnakeGameDemo from '../../components/SnakeGameDemo.vue'
</script>

## Live Demo

Use arrow keys or WASD to control the snake:

<ClientOnly>
  <SnakeGameDemo />
</ClientOnly>

## Import

```tsx
import { useLoop } from 'flexium-canvas'
```

## Signature

```ts
function useLoop(options: LoopOptions): Loop

interface LoopOptions {
  onUpdate: (delta: number) => void
  onRender?: () => void
  targetFPS?: number
}

interface Loop {
  start: () => void
  stop: () => void
  isRunning: Accessor<boolean>
}
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `onUpdate` | `(delta) => void` | Called each frame with delta time in seconds |
| `onRender` | `() => void` | Optional separate render callback |
| `targetFPS` | `number` | Target frames per second (default: 60) |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `start` | `() => void` | Start the loop |
| `stop` | `() => void` | Stop the loop |
| `isRunning` | `Accessor<boolean>` | Whether loop is running |

## Usage

### Basic Loop

```tsx
function Game() {
  const gameLoop = useLoop({
    onUpdate: (delta) => {
      // delta is time since last frame in seconds
      updateGame(delta)
    }
  })

  use(() => {
    gameLoop.start()
    return () => gameLoop.stop()
  })

  return <Canvas />
}
```

### With Delta Time Movement

```tsx
const speed = 200 // pixels per second

const gameLoop = useLoop({
  onUpdate: (delta) => {
    // Consistent movement regardless of frame rate
    player.x += speed * delta
  }
})
```

### Separate Update and Render

```tsx
const gameLoop = useLoop({
  onUpdate: (delta) => {
    // Physics, AI, input handling
    updatePhysics(delta)
    updateAI(delta)
    handleInput()
  },
  onRender: () => {
    // Drawing
    ctx.clearRect(0, 0, width, height)
    drawEntities()
    drawUI()
  }
})
```

### Fixed Time Step

```tsx
let accumulator = 0
const FIXED_STEP = 1 / 60 // 60 updates per second

const gameLoop = useLoop({
  onUpdate: (delta) => {
    accumulator += delta

    while (accumulator >= FIXED_STEP) {
      fixedUpdate(FIXED_STEP)
      accumulator -= FIXED_STEP
    }

    // Interpolate for smooth rendering
    render(accumulator / FIXED_STEP)
  }
})
```

### Pause/Resume

```tsx
function PausableGame() {
  const [paused, setPaused] = use(false)
  const kb = useKeyboard()

  const gameLoop = useLoop({
    onUpdate: (delta) => {
      if (paused) return
      updateGame(delta)
    }
  })

  use(() => {
    if (kb.isJustPressed(Keys.Escape)) {
      setPaused(p => !p)
    }
  })

  return (
    <div>
      <Canvas />
      {paused && <PauseMenu onResume={() => setPaused(false)} />}
    </div>
  )
}
```

### Frame Rate Display

```tsx
function FPSCounter() {
  const [fps, setFps] = use(0)
  let frameCount = 0
  let lastTime = performance.now()

  const gameLoop = useLoop({
    onUpdate: () => {
      frameCount++
      const now = performance.now()

      if (now - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = now
      }
    }
  })

  use(() => {
    gameLoop.start()
    return () => gameLoop.stop()
  })

  return <div>FPS: {fps}</div>
}
```

### State Machine

```tsx
const [gameState, setGameState] = use('menu')

const gameLoop = useLoop({
  onUpdate: (delta) => {
    switch (gameState) {
      case 'menu':
        updateMenu()
        break
      case 'playing':
        updateGame(delta)
        break
      case 'paused':
        // Don't update
        break
      case 'gameover':
        updateGameOver()
        break
    }
  }
})
```

## Behavior

- Uses **requestAnimationFrame** for timing
- Delta time is in **seconds**
- Automatically handles **tab visibility**
- Stops cleanly when disposed

## Notes

- Always multiply movement by delta for consistent speed
- Clean up by calling `stop()` in effect cleanup
- Use fixed time step for physics if needed
- Delta is clamped to prevent large jumps after tab switch

## See Also

- [useKeyboard()](/docs/interactive/use-keyboard)
- [useMouse()](/docs/interactive/use-mouse)
- [&lt;Canvas /&gt;](/docs/canvas/canvas)
