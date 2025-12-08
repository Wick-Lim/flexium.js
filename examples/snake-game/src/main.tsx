/**
 * Snake Game - Flexium Interactive Module Example
 *
 * Demonstrates:
 * - useKeyboard() for arrow key input
 * - useMouse() for mouse tracking (pause on click)
 * - createLoop() for animation loop with delta time
 * - Canvas primitives for rendering
 * - Reactive state management with signals
 */

import { signal, effect } from 'flexium/core'
import { render } from 'flexium/dom'
import { Canvas, DrawRect, DrawText } from 'flexium/canvas'
import { useKeyboard, useMouse, createLoop, Keys } from 'flexium/interactive'

// Game constants
const GRID_SIZE = 20
const CELL_SIZE = 20
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE
const INITIAL_SPEED = 0.15 // Move every 0.15 seconds
const SPEED_INCREASE = 0.005 // Speed increases as score increases

// Direction enum
enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

// Types
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
const nextDirection = signal<Direction>(Direction.RIGHT)
const food = signal<Position>({ x: 15, y: 10 })

// Game logic
let moveTimer = 0

function generateFood(): Position {
  const snakePositions = snake.value
  let newFood: Position

  // Keep generating until we find a position not occupied by snake
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
  } while (snakePositions.some(segment =>
    segment.x === newFood.x && segment.y === newFood.y
  ))

  return newFood
}

function resetGame() {
  score.value = 0
  gameOver.value = false
  paused.value = false
  snake.value = [{ x: 10, y: 10 }]
  direction.value = Direction.RIGHT
  nextDirection.value = Direction.RIGHT
  food.value = generateFood()
  moveTimer = 0
}

function checkCollision(head: Position): boolean {
  // Wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    return true
  }

  // Self collision
  const body = snake.value.slice(1)
  return body.some(segment => segment.x === head.x && segment.y === head.y)
}

function moveSnake() {
  if (gameOver.value || paused.value) return

  // Update direction (prevent 180-degree turns)
  const currentDir = direction.value
  const nextDir = nextDirection.value

  if (
    (currentDir === Direction.UP && nextDir !== Direction.DOWN) ||
    (currentDir === Direction.DOWN && nextDir !== Direction.UP) ||
    (currentDir === Direction.LEFT && nextDir !== Direction.RIGHT) ||
    (currentDir === Direction.RIGHT && nextDir !== Direction.LEFT)
  ) {
    direction.value = nextDir
  }

  const currentSnake = snake.value
  const head = currentSnake[0]
  let newHead: Position

  // Calculate new head position based on direction
  switch (direction.value) {
    case Direction.UP:
      newHead = { x: head.x, y: head.y - 1 }
      break
    case Direction.DOWN:
      newHead = { x: head.x, y: head.y + 1 }
      break
    case Direction.LEFT:
      newHead = { x: head.x - 1, y: head.y }
      break
    case Direction.RIGHT:
      newHead = { x: head.x + 1, y: head.y }
      break
  }

  // Check collision
  if (checkCollision(newHead)) {
    gameOver.value = true
    return
  }

  // Create new snake
  const newSnake = [newHead, ...currentSnake]

  // Check if food is eaten
  if (newHead.x === food.value.x && newHead.y === food.value.y) {
    score.value++
    food.value = generateFood()
    // Don't remove tail - snake grows
  } else {
    // Remove tail - snake moves
    newSnake.pop()
  }

  snake.value = newSnake
}

function getCurrentSpeed(): number {
  // Speed increases with score
  return Math.max(0.05, INITIAL_SPEED - (score.value * SPEED_INCREASE))
}

// Main game component
function SnakeGame() {
  // Setup input handlers
  const keyboard = useKeyboard()
  const mouse = useMouse()

  // Setup animation loop
  const loop = createLoop({
    onUpdate: (delta) => {
      if (gameOver.value || paused.value) return

      moveTimer += delta
      const speed = getCurrentSpeed()

      if (moveTimer >= speed) {
        moveSnake()
        moveTimer = 0
      }
    }
  })

  // Start loop on mount
  effect(() => {
    loop.start()
    return () => loop.stop()
  })

  // Handle keyboard input
  effect(() => {
    // Read keyboard state to track changes
    keyboard.keys.value

    if (keyboard.isPressed(Keys.ArrowUp) || keyboard.isPressed(Keys.KeyW)) {
      nextDirection.value = Direction.UP
    } else if (keyboard.isPressed(Keys.ArrowDown) || keyboard.isPressed(Keys.KeyS)) {
      nextDirection.value = Direction.DOWN
    } else if (keyboard.isPressed(Keys.ArrowLeft) || keyboard.isPressed(Keys.KeyA)) {
      nextDirection.value = Direction.LEFT
    } else if (keyboard.isPressed(Keys.ArrowRight) || keyboard.isPressed(Keys.KeyD)) {
      nextDirection.value = Direction.RIGHT
    }

    // Space to pause/unpause
    if (keyboard.isJustPressed(Keys.Space)) {
      if (!gameOver.value) {
        paused.value = !paused.value
      }
      keyboard.clearFrameState()
    }

    // Enter to restart when game over
    if (keyboard.isJustPressed(Keys.Enter) && gameOver.value) {
      resetGame()
      keyboard.clearFrameState()
    }
  })

  // Handle mouse input - click to pause/unpause
  effect(() => {
    if (mouse.isLeftPressed() && !gameOver.value) {
      // Toggle pause on click
      const wasPressed = paused.value
      setTimeout(() => {
        if (!gameOver.value) {
          paused.value = !wasPressed
        }
      }, 100)
    }
  })

  // Render game
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h1>Snake Game</h1>

      <div class="score">
        Score: {score}
      </div>

      {() => gameOver.value ? (
        <div class="game-over">Game Over!</div>
      ) : paused.value ? (
        <div style={{ color: '#f39c12', fontSize: '18px', fontWeight: 600 }}>Paused</div>
      ) : null}

      <Canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {/* Background */}
        <DrawRect
          x={0}
          y={0}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          fill="#f0f0f0"
        />

        {/* Grid lines */}
        {() => {
          const lines: any[] = []
          for (let i = 0; i <= GRID_SIZE; i++) {
            // Vertical lines
            lines.push(
              <DrawRect
                key={`v-${i}`}
                x={i * CELL_SIZE}
                y={0}
                width={1}
                height={CANVAS_HEIGHT}
                fill="#e0e0e0"
              />
            )
            // Horizontal lines
            lines.push(
              <DrawRect
                key={`h-${i}`}
                x={0}
                y={i * CELL_SIZE}
                width={CANVAS_WIDTH}
                height={1}
                fill="#e0e0e0"
              />
            )
          }
          return lines
        }}

        {/* Food */}
        {() => (
          <DrawRect
            x={food.value.x * CELL_SIZE + 2}
            y={food.value.y * CELL_SIZE + 2}
            width={CELL_SIZE - 4}
            height={CELL_SIZE - 4}
            fill="#e74c3c"
            stroke="#c0392b"
            lineWidth={2}
          />
        )}

        {/* Snake */}
        {() => snake.value.map((segment, index) => {
          const isHead = index === 0
          return (
            <DrawRect
              key={`snake-${index}`}
              x={segment.x * CELL_SIZE + 1}
              y={segment.y * CELL_SIZE + 1}
              width={CELL_SIZE - 2}
              height={CELL_SIZE - 2}
              fill={isHead ? '#27ae60' : '#2ecc71'}
              stroke="#229954"
              lineWidth={1}
            />
          )
        })}

        {/* Game Over overlay */}
        {() => gameOver.value ? (
          <>
            <DrawRect
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill="rgba(0, 0, 0, 0.5)"
            />
            <DrawText
              x={CANVAS_WIDTH / 2}
              y={CANVAS_HEIGHT / 2 - 20}
              text="GAME OVER"
              fontSize={32}
              fill="white"
              textAlign="center"
              textBaseline="middle"
              fontWeight="bold"
            />
            <DrawText
              x={CANVAS_WIDTH / 2}
              y={CANVAS_HEIGHT / 2 + 20}
              text={`Score: ${score.value}`}
              fontSize={24}
              fill="white"
              textAlign="center"
              textBaseline="middle"
            />
          </>
        ) : paused.value ? (
          <>
            <DrawRect
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill="rgba(0, 0, 0, 0.3)"
            />
            <DrawText
              x={CANVAS_WIDTH / 2}
              y={CANVAS_HEIGHT / 2}
              text="PAUSED"
              fontSize={32}
              fill="white"
              textAlign="center"
              textBaseline="middle"
              fontWeight="bold"
            />
          </>
        ) : null}
      </Canvas>

      <div class="controls">
        <strong>Controls:</strong><br />
        Arrow Keys or WASD - Move<br />
        Space or Click - Pause<br />
        Enter - Restart (when game over)
      </div>

      {() => gameOver.value ? (
        <button onclick={resetGame}>Play Again</button>
      ) : null}
    </div>
  )
}

// Mount app
render(SnakeGame(), document.getElementById('app')!)
