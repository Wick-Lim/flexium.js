# createGameLoop()

Create a consistent game loop with delta time.

## Import

```tsx
import { createGameLoop } from 'flexium/game'
```

## Signature

```ts
function createGameLoop(options: GameLoopOptions): GameLoop

interface GameLoopOptions {
  onUpdate: (delta: number) => void
  onRender?: () => void
  targetFPS?: number
}

interface GameLoop {
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
| `start` | `() => void` | Start the game loop |
| `stop` | `() => void` | Stop the game loop |
| `isRunning` | `Accessor<boolean>` | Whether loop is running |

## Usage

### Basic Game Loop

```tsx
function Game() {
  const gameLoop = createGameLoop({
    onUpdate: (delta) => {
      // delta is time since last frame in seconds
      updateGame(delta)
    }
  })

  effect(() => {
    gameLoop.start()
    return () => gameLoop.stop()
  })

  return <Canvas />
}
```

### With Delta Time Movement

```tsx
const speed = 200 // pixels per second

const gameLoop = createGameLoop({
  onUpdate: (delta) => {
    // Consistent movement regardless of frame rate
    player.x += speed * delta
  }
})
```

### Separate Update and Render

```tsx
const gameLoop = createGameLoop({
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

const gameLoop = createGameLoop({
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
  const [paused, setPaused] = state(false)
  const keyboard = useKeyboard()

  const gameLoop = createGameLoop({
    onUpdate: (delta) => {
      if (paused()) return
      updateGame(delta)
    }
  })

  effect(() => {
    if (keyboard.isJustPressed(Keys.Escape)) {
      setPaused(p => !p)
    }
  })

  return (
    <div>
      <Canvas />
      <Show when={paused}>
        <PauseMenu onResume={() => setPaused(false)} />
      </Show>
    </div>
  )
}
```

### Frame Rate Display

```tsx
function FPSCounter() {
  const [fps, setFPS] = state(0)
  let frameCount = 0
  let lastTime = performance.now()

  const gameLoop = createGameLoop({
    onUpdate: () => {
      frameCount++
      const now = performance.now()

      if (now - lastTime >= 1000) {
        setFPS(frameCount)
        frameCount = 0
        lastTime = now
      }
    }
  })

  effect(() => {
    gameLoop.start()
    return () => gameLoop.stop()
  })

  return <div>FPS: {fps}</div>
}
```

### Game State Machine

```tsx
const [gameState, setGameState] = state('menu')

const gameLoop = createGameLoop({
  onUpdate: (delta) => {
    switch (gameState()) {
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

- [useKeyboard()](/docs/game/use-keyboard)
- [useMouse()](/docs/game/use-mouse)
- [&lt;Canvas /&gt;](/docs/canvas/canvas)
