---
title: Interactive Apps - Build Games & Interactive Applications with Flexium
description: Create interactive canvas-based applications with Flexium's animation loop, keyboard, and mouse input systems. Optimized for performance with delta time and fixed timestep.
head:
  - - meta
    - property: og:title
      content: Interactive Apps - Flexium
  - - meta
    - property: og:description
      content: Complete interactive toolkit with animation loop, keyboard/mouse input, and reactive canvas rendering.
---

# Interactive Applications

Flexium provides a complete toolkit for building interactive canvas-based applications and games with a proper animation loop, keyboard input, mouse input, and declarative rendering.

## Why Flexium for Interactive Apps?

Traditional interactive development with canvas requires:
- Manual animation loop management
- Complex input state tracking
- Imperative rendering code
- Delta time calculations
- Fixed timestep for physics

Flexium handles all of this for you with a clean, reactive API.

## Quick Example

```tsx
import { useLoop, useKeyboard, Keys } from 'flexium/interactive'
import { Canvas, Circle } from 'flexium/canvas'

function SimpleGame() {
  let x = 200
  let y = 200
  const speed = 200 // pixels per second

  const kb = useKeyboard()

  const gameLoop = useLoop({
    onUpdate: (delta) => {
      // Handle input
      if (kb.isPressed(Keys.ArrowRight)) x += speed * delta
      if (kb.isPressed(Keys.ArrowLeft)) x -= speed * delta
      if (kb.isPressed(Keys.ArrowUp)) y -= speed * delta
      if (kb.isPressed(Keys.ArrowDown)) y += speed * delta
    },
    onRender: () => {
      // Render will trigger canvas update
      return (
        <Canvas width={400} height={400}>
          <Circle x={x} y={y} radius={20} fill="blue" />
        </Canvas>
      )
    }
  })

  gameLoop.start()

  return null // Rendering happens in game loop
}
```

## Animation Loop

The animation loop is the heart of any interactive application. It handles timing, updates, and rendering.

### useLoop()

Creates an animation loop with delta time and optional fixed timestep for physics.

```tsx
import { useLoop } from 'flexium/interactive'

const gameLoop = useLoop({
  fixedFps: 60,           // Target FPS for physics (default: 60)
  onUpdate: (delta) => {
    // Called every frame
    // delta = time since last frame in seconds
  },
  onFixedUpdate: (fixedDelta) => {
    // Called at fixed intervals
    // fixedDelta = 1/fixedFps (e.g., 1/60 = 0.016666...)
  },
  onRender: (alpha) => {
    // Called every frame for rendering
    // alpha = interpolation factor (0-1) for smooth rendering
  }
})

gameLoop.start()     // Start the loop
gameLoop.stop()      // Stop the loop
gameLoop.isRunning() // Check if running
gameLoop.getFps()    // Get current FPS
```

### Delta Time

Delta time represents the time elapsed since the last frame in seconds. Use it to make movement frame-rate independent:

```tsx
const speed = 100 // pixels per second

useLoop({
  onUpdate: (delta) => {
    // Without delta: moves 1 pixel per frame (varies with FPS)
    x += 1

    // With delta: moves 100 pixels per second (consistent)
    x += speed * delta
  }
})
```

### Fixed Timestep

For physics simulations, use `onFixedUpdate` to ensure deterministic behavior:

```tsx
const gameLoop = useLoop({
  fixedFps: 60, // Physics runs at 60 FPS

  onUpdate: (delta) => {
    // Variable timestep - good for input and game logic
  },

  onFixedUpdate: (fixedDelta) => {
    // Fixed timestep - perfect for physics
    // Always called with fixedDelta = 1/60 = 0.016666...
    velocityY += gravity * fixedDelta
    y += velocityY * fixedDelta
  },

  onRender: (alpha) => {
    // Interpolate between physics states for smooth rendering
    const renderY = y + velocityY * alpha * fixedDelta
  }
})
```

**When to use each:**
- `onUpdate`: Input handling, game logic, AI
- `onFixedUpdate`: Physics, collision detection
- `onRender`: Drawing to canvas

### FPS Counter

Monitor performance with the built-in FPS counter:

```tsx
const gameLoop = useLoop({
  onRender: () => {
    const fps = gameLoop.getFps()
    console.log(`Running at ${fps} FPS`)
  }
})
```

## Keyboard Input

`useKeyboard()` provides reactive keyboard state tracking with support for key press, hold, and release detection.

### Basic Usage

```tsx
import { useKeyboard, Keys } from 'flexium/interactive'

const kb = useKeyboard()

// Check if key is currently pressed
if (kb.isPressed(Keys.Space)) {
  player.jump()
}

// Check if key was just pressed this frame
if (kb.isJustPressed(Keys.KeyE)) {
  player.interact()
}

// Check if key was just released this frame
if (kb.isJustReleased(Keys.ShiftLeft)) {
  player.stopSprinting()
}

// Get all pressed keys
const pressedKeys = kb.getPressedKeys()
console.log(pressedKeys) // ['keyw', 'space', ...]
```

### Keys Enum

The `Keys` enum provides convenient constants for common keys:

```tsx
import { Keys } from 'flexium/interactive'

// Arrow keys
Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight

// WASD
Keys.KeyW, Keys.KeyA, Keys.KeyS, Keys.KeyD

// Common keys
Keys.Space, Keys.Enter, Keys.Escape, Keys.Tab

// Modifiers
Keys.ShiftLeft, Keys.ShiftRight
Keys.ControlLeft, Keys.ControlRight
Keys.AltLeft, Keys.AltRight

// Numbers
Keys.Digit0, Keys.Digit1, Keys.Digit2, ..., Keys.Digit9
```

### Custom Target

By default, keyboard events are tracked on `window`. You can specify a different target:

```tsx
const canvasElement = document.querySelector('canvas')
const kb = useKeyboard(canvasElement)
```

### Movement Example

```tsx
const kb = useKeyboard()
const speed = 200

useLoop({
  onUpdate: (delta) => {
    let vx = 0
    let vy = 0

    // WASD movement
    if (kb.isPressed(Keys.KeyW)) vy -= 1
    if (kb.isPressed(Keys.KeyS)) vy += 1
    if (kb.isPressed(Keys.KeyA)) vx -= 1
    if (kb.isPressed(Keys.KeyD)) vx += 1

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy)
      vx /= length
      vy /= length
    }

    // Apply movement
    player.x += vx * speed * delta
    player.y += vy * speed * delta

    // Sprint modifier
    if (kb.isPressed(Keys.ShiftLeft)) {
      player.speed = speed * 2
    } else {
      player.speed = speed
    }
  }
})
```

### Reactive Keyboard State

Access the reactive signal for advanced use cases:

```tsx
const kb = useKeyboard()

// Watch for any key state changes
useEffect(() => {
  const pressedKeys = kb.keys
  console.log('Pressed keys:', Array.from(pressedKeys))
})
```

### Pattern: isPressed vs isJustPressed

- **`isPressed(key)`**: True while key is held down (continuous)
  - Use for: Movement, aiming, holding actions

- **`isJustPressed(key)`**: True only on the first frame when key is pressed (one-shot)
  - Use for: Jumping, shooting, interactions, menu navigation

- **`isJustReleased(key)`**: True only when key is released (one-shot)
  - Use for: Charge-up actions, sprint toggle

```tsx
onUpdate: (delta) => {
  // Continuous movement
  if (kb.isPressed(Keys.ArrowRight)) {
    player.x += speed * delta
  }

  // One-shot jump
  if (kb.isJustPressed(Keys.Space)) {
    if (player.onGround) {
      player.velocityY = -jumpForce
    }
  }

  // Toggle sprint on release
  if (kb.isJustReleased(Keys.ShiftLeft)) {
    player.isSprinting = !player.isSprinting
  }
}
```

### Cleanup

Call `clearFrameState()` at the end of each frame to reset just-pressed/just-released states:

```tsx
const kb = useKeyboard()

useLoop({
  onUpdate: (delta) => {
    // Handle input
    if (kb.isJustPressed(Keys.Space)) {
      console.log('Jump!')
    }
  },
  onRender: () => {
    // Clear frame state after processing
    kb.clearFrameState()
  }
})
```

Don't forget to dispose when done:

```tsx
onCleanup(() => {
  kb.dispose()
})
```

## Mouse Input

`useMouse()` provides reactive mouse state tracking with position, buttons, and wheel delta.

### Basic Usage

```tsx
import { useMouse, MouseButton } from 'flexium/interactive'

const m = useMouse()

// Get current mouse position
const pos = m.position
console.log(pos.x, pos.y)

// Check button states
if (m.isLeftPressed()) {
  player.shoot()
}

if (m.isRightPressed()) {
  player.aim()
}

if (m.isMiddlePressed()) {
  camera.reset()
}

// Or use button numbers directly
if (m.isPressed(MouseButton.Left)) {
  // same as isLeftPressed()
}
```

### Mouse Position

The position is relative to the target element (or canvas if specified):

```tsx
const m = useMouse({ canvas: myCanvas })

// Position is in canvas coordinates
useEffect(() => {
  const pos = m.position
  console.log(`Mouse at: ${pos.x}, ${pos.y}`)
})
```

### Mouse Delta

Track mouse movement since last frame:

```tsx
const m = useMouse()

onUpdate: (delta) => {
  const delta = m.delta

  // Camera rotation based on mouse movement
  camera.rotateX(delta.y * sensitivity)
  camera.rotateY(delta.x * sensitivity)
}
```

### Mouse Wheel

Detect scroll wheel input:

```tsx
const m = useMouse()

onUpdate: () => {
  const wheel = m.wheelDelta

  if (wheel !== 0) {
    camera.zoom += wheel * zoomSpeed
  }
}
```

### Canvas Integration

When using with canvas, provide the canvas element for proper coordinate calculation:

```tsx
function Game() {
  let canvasRef: HTMLCanvasElement | undefined

  const m = useMouse({
    canvas: () => canvasRef // Pass as getter or direct reference
  })

  return (
    <Canvas
      ref={(el) => canvasRef = el}
      width={800}
      height={600}
    >
      <Circle
        x={m.position.x}
        y={m.position.y}
        radius={10}
        fill="red"
      />
    </Canvas>
  )
}
```

### MouseButton Enum

```tsx
import { MouseButton } from 'flexium/interactive'

MouseButton.Left   // 0
MouseButton.Middle // 1
MouseButton.Right  // 2
```

### Cleanup

Clear frame state and dispose when done:

```tsx
const m = useMouse()

useLoop({
  onRender: () => {
    // Clear delta after each frame
    m.clearFrameState()
  }
})

onCleanup(() => {
  m.dispose()
})
```

## Complete Example: Top-Down Shooter

Here's a complete game combining all the systems:

```tsx
import { useLoop, useKeyboard, useMouse, Keys } from 'flexium/interactive'
import { Canvas, Circle, Rect, CanvasText } from 'flexium/canvas'
import { useState } from 'flexium/core'

function TopDownShooter() {
  // Game state
  const [score, setScore] = useState(0)
  const player = { x: 400, y: 300, radius: 20, speed: 250 }
  const bullets: Array<{ x: number; y: number; vx: number; vy: number }> = []
  const enemies: Array<{ x: number; y: number; radius: 15 }> = []

  // Input
  const kb = useKeyboard()
  const m = useMouse()

  // Spawn enemies
  let spawnTimer = 0
  const spawnInterval = 2 // seconds

  // Game loop
  const gameLoop = useLoop({
    onUpdate: (delta) => {
      // Player movement
      let vx = 0
      let vy = 0

      if (kb.isPressed(Keys.KeyW)) vy -= 1
      if (kb.isPressed(Keys.KeyS)) vy += 1
      if (kb.isPressed(Keys.KeyA)) vx -= 1
      if (kb.isPressed(Keys.KeyD)) vx += 1

      // Normalize diagonal movement
      if (vx !== 0 && vy !== 0) {
        const len = Math.sqrt(vx * vx + vy * vy)
        vx /= len
        vy /= len
      }

      player.x += vx * player.speed * delta
      player.y += vy * player.speed * delta

      // Keep player in bounds
      player.x = Math.max(player.radius, Math.min(800 - player.radius, player.x))
      player.y = Math.max(player.radius, Math.min(600 - player.radius, player.y))

      // Shooting
      if (m.isLeftPressed()) {
        const mousePos = m.position
        const dx = mousePos.x - player.x
        const dy = mousePos.y - player.y
        const len = Math.sqrt(dx * dx + dy * dy)

        bullets.push({
          x: player.x,
          y: player.y,
          vx: (dx / len) * 500,
          vy: (dy / len) * 500
        })
      }

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]
        bullet.x += bullet.vx * delta
        bullet.y += bullet.vy * delta

        // Remove off-screen bullets
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
          bullets.splice(i, 1)
        }
      }

      // Spawn enemies
      spawnTimer += delta
      if (spawnTimer >= spawnInterval) {
        spawnTimer = 0
        const side = Math.floor(Math.random() * 4)
        let x, y

        switch (side) {
          case 0: x = Math.random() * 800; y = -20; break // top
          case 1: x = Math.random() * 800; y = 620; break // bottom
          case 2: x = -20; y = Math.random() * 600; break // left
          case 3: x = 820; y = Math.random() * 600; break // right
        }

        enemies.push({ x, y, radius: 15 })
      }

      // Move enemies toward player
      for (const enemy of enemies) {
        const dx = player.x - enemy.x
        const dy = player.y - enemy.y
        const len = Math.sqrt(dx * dx + dy * dy)

        enemy.x += (dx / len) * 100 * delta
        enemy.y += (dy / len) * 100 * delta
      }

      // Collision: bullets vs enemies
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]

        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j]
          const dx = bullet.x - enemy.x
          const dy = bullet.y - enemy.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < enemy.radius + 5) {
            bullets.splice(i, 1)
            enemies.splice(j, 1)
            setScore(s => s + 10)
            break
          }
        }
      }

      // Clear input states
      kb.clearFrameState()
      m.clearFrameState()
    },

    onRender: () => {
      // Render will happen here or separately
    }
  })

  gameLoop.start()

  // Render function
  return () => (
    <Canvas width={800} height={600} style={{ border: '2px solid black' }}>
      {/* Background */}
      <Rect x={0} y={0} width={800} height={600} fill="#111" />

      {/* Player */}
      <Circle
        x={player.x}
        y={player.y}
        radius={player.radius}
        fill="blue"
        stroke="white"
        strokeWidth={2}
      />

      {/* Crosshair at mouse */}
      <Circle
        x={m.position.x}
        y={m.position.y}
        radius={3}
        stroke="white"
        strokeWidth={1}
      />

      {/* Bullets */}
      {bullets.map((bullet, i) => (
        <Circle
          key={i}
          x={bullet.x}
          y={bullet.y}
          radius={5}
          fill="yellow"
        />
      ))}

      {/* Enemies */}
      {enemies.map((enemy, i) => (
        <Circle
          key={i}
          x={enemy.x}
          y={enemy.y}
          radius={enemy.radius}
          fill="red"
          stroke="darkred"
          strokeWidth={2}
        />
      ))}

      {/* Score */}
      <CanvasText
        x={10}
        y={30}
        text={`Score: ${score}`}
        fontSize={24}
        fontWeight="bold"
        fill="white"
      />

      {/* FPS */}
      <CanvasText
        x={700}
        y={30}
        text={`FPS: ${gameLoop.getFps()}`}
        fontSize={16}
        fill="white"
      />
    </Canvas>
  )
}
```

## Best Practices

### 1. Use Delta Time

Always use delta time for movement and time-based calculations:

```tsx
// Bad - frame rate dependent
x += 5

// Good - frame rate independent
x += speed * delta
```

### 2. Separate Logic and Rendering

Keep game logic in `onUpdate` and rendering in `onRender`:

```tsx
useLoop({
  onUpdate: (delta) => {
    // Game logic, physics, input
    updatePlayer(delta)
    updateEnemies(delta)
    checkCollisions()
  },

  onRender: (alpha) => {
    // Only rendering
    drawEverything()
  }
})
```

### 3. Use Fixed Timestep for Physics

Physics simulations should use `onFixedUpdate`:

```tsx
useLoop({
  fixedFps: 60,

  onFixedUpdate: (fixedDelta) => {
    // Deterministic physics
    velocity.y += gravity * fixedDelta
    position.y += velocity.y * fixedDelta
  }
})
```

### 4. Clear Input States

Always clear frame-specific input states:

```tsx
useLoop({
  onRender: () => {
    kb.clearFrameState()
    m.clearFrameState()
  }
})
```

### 5. Cleanup Resources

Dispose of input handlers when done:

```tsx
onCleanup(() => {
  gameLoop.stop()
  kb.dispose()
  m.dispose()
})
```

### 6. Use Object Pools

For bullets, particles, etc., reuse objects instead of creating new ones:

```tsx
const bulletPool: Bullet[] = []

function getBullet() {
  return bulletPool.pop() || createBullet()
}

function returnBullet(bullet: Bullet) {
  bulletPool.push(bullet)
}
```

### 7. Cap Delta Time

The game loop automatically caps delta at 250ms to prevent spiral of death. If you do manual timing, cap it:

```tsx
const cappedDelta = Math.min(delta, 0.1) // Cap at 100ms
```

## Integration with Canvas

Flexium's game module integrates seamlessly with Canvas primitives:

```tsx
import { useLoop } from 'flexium/interactive'
import { Canvas, Circle, Rect } from 'flexium/canvas'
import { useState } from 'flexium/core'

function GameExample() {
  const [entities, setEntities] = useState([
    { x: 100, y: 100, color: 'red' },
    { x: 200, y: 150, color: 'blue' }
  ])

  useLoop({
    onUpdate: (delta) => {
      // Update entity positions
      setEntities(prev => prev.map(e => ({
        ...e,
        x: e.x + Math.sin(Date.now() / 1000) * 100 * delta
      })))
    }
  })

  return (
    <Canvas width={400} height={300}>
      {entities().map((e, i) => (
        <Circle
          key={i}
          x={e.x}
          y={e.y}
          radius={20}
          fill={e.color}
        />
      ))}
    </Canvas>
  )
}
```

The canvas automatically re-renders when state changes, giving you the best of both worlds: imperative game loop control with declarative rendering.

## TypeScript Support

All game APIs are fully typed:

```tsx
import type { Loop, KeyboardState, MouseState } from 'flexium/interactive'

const game: Loop = useLoop({
  onUpdate: (delta: number) => {
    // delta is typed as number
  }
})

const kb: KeyboardState = useKeyboard()
const m: MouseState = useMouse()
```

## Next Steps

- Learn more about [Canvas Primitives](/guide/canvas)
- Explore [Animation](/guide/animation) for easing and tweening
- Check out [Performance](/guide/performance) optimization tips
- See the [Showcase](/showcase) for live demos
