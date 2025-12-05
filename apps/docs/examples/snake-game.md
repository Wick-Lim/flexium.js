---
title: Snake Game - Game Development
description: Build a classic Snake game using Flexium's game module with keyboard input, game loop, and canvas rendering.
head:
  - - meta
    - property: og:title
      content: Snake Game Example - Flexium
  - - meta
    - property: og:description
      content: Complete Snake game demonstrating Flexium's game development capabilities.
---

# Snake Game

This example demonstrates game development with Flexium using the game module.

## Features Demonstrated

- `useKeyboard()` for arrow key input
- `useMouse()` for mouse tracking and click events
- `createGameLoop()` for game loop with delta time
- Canvas primitives for rendering
- Reactive state management with signals

## Complete Code

```tsx
import { signal, effect } from 'flexium/core'
import { mount } from 'flexium/dom'
import { Canvas, DrawRect, DrawText } from 'flexium/canvas'
import { useKeyboard, useMouse, createGameLoop, Keys } from 'flexium/game'

// Game constants
const GRID_SIZE = 20
const CELL_SIZE = 20
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE

// Direction enum
enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

interface Position {
  x: number
  y: number
}

// Game state
const score = signal(0)
const gameOver = signal(false)
const paused = signal(false)
const snake = signal<Position[]>([{ x: 10, y: 10 }])
const direction = signal<Direction>(Direction.RIGHT)
const food = signal<Position>({ x: 15, y: 10 })

function SnakeGame() {
  const keyboard = useKeyboard()
  const mouse = useMouse()

  // Setup game loop
  const gameLoop = createGameLoop({
    onUpdate: (delta) => {
      if (gameOver.value || paused.value) return
      // Move snake based on direction
      moveSnake()
    }
  })

  // Start game loop on mount
  effect(() => {
    gameLoop.start()
    return () => gameLoop.stop()
  })

  // Handle keyboard input
  effect(() => {
    if (keyboard.isPressed(Keys.ArrowUp)) {
      direction.value = Direction.UP
    } else if (keyboard.isPressed(Keys.ArrowDown)) {
      direction.value = Direction.DOWN
    }
    // ... handle other directions
  })

  return (
    <div>
      <h1>Snake Game</h1>
      <div>Score: {score}</div>

      <Canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {/* Background */}
        <DrawRect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#f0f0f0" />

        {/* Food */}
        {() => (
          <DrawRect
            x={food.value.x * CELL_SIZE + 2}
            y={food.value.y * CELL_SIZE + 2}
            width={CELL_SIZE - 4}
            height={CELL_SIZE - 4}
            fill="#e74c3c"
          />
        )}

        {/* Snake */}
        {() => snake.value.map((segment, index) => (
          <DrawRect
            key={`snake-${index}`}
            x={segment.x * CELL_SIZE + 1}
            y={segment.y * CELL_SIZE + 1}
            width={CELL_SIZE - 2}
            height={CELL_SIZE - 2}
            fill={index === 0 ? '#27ae60' : '#2ecc71'}
          />
        ))}

        {/* Game Over overlay */}
        {() => gameOver.value && (
          <>
            <DrawRect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="rgba(0,0,0,0.5)" />
            <DrawText
              x={CANVAS_WIDTH / 2}
              y={CANVAS_HEIGHT / 2}
              text="GAME OVER"
              fontSize={32}
              fill="white"
              textAlign="center"
            />
          </>
        )}
      </Canvas>

      <div>
        <strong>Controls:</strong> Arrow Keys or WASD - Move | Space - Pause
      </div>
    </div>
  )
}

mount(SnakeGame, document.getElementById('app')!)
```

## Key Concepts

### Game Loop

The `createGameLoop` hook provides a consistent update cycle with delta time:

```tsx
const gameLoop = createGameLoop({
  onUpdate: (delta) => {
    // delta is time since last frame in seconds
    moveTimer += delta
    if (moveTimer >= MOVE_SPEED) {
      moveSnake()
      moveTimer = 0
    }
  }
})
```

### Keyboard Input

The `useKeyboard` hook provides easy access to keyboard state:

```tsx
const keyboard = useKeyboard()

// Check if key is currently pressed
if (keyboard.isPressed(Keys.ArrowUp)) { ... }

// Check if key was just pressed this frame
if (keyboard.isJustPressed(Keys.Space)) { ... }
```

### Canvas Rendering

Canvas primitives make it easy to draw game graphics:

```tsx
<Canvas width={400} height={400}>
  <DrawRect x={0} y={0} width={100} height={100} fill="red" />
  <DrawText x={50} y={50} text="Hello" fontSize={24} fill="white" />
</Canvas>
```
