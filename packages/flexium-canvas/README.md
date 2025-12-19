# Flexium Canvas

[![npm version](https://img.shields.io/npm/v/flexium-canvas.svg)](https://www.npmjs.com/package/flexium-canvas)
[![npm downloads](https://img.shields.io/npm/dm/flexium-canvas.svg)](https://www.npmjs.com/package/flexium-canvas)
[![license](https://img.shields.io/npm/l/flexium-canvas.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

Canvas and interactive modules for Flexium - WebGL, keyboard, mouse, and game loop.

## Installation

```bash
npm install flexium-canvas flexium
```

## Features

- **Canvas Rendering** - 2D and WebGL canvas support
- **Keyboard Input** - Reactive keyboard state management
- **Mouse Input** - Mouse position, buttons, and events
- **Game Loop** - Fixed timestep game loop with delta time

## Usage

### Canvas Component

```tsx
import { Canvas } from 'flexium-canvas/dom'

function Game() {
  return (
    <Canvas
      width={800}
      height={600}
      onDraw={(ctx) => {
        ctx.fillStyle = 'blue'
        ctx.fillRect(100, 100, 50, 50)
      }}
    />
  )
}
```

### Keyboard Input

```tsx
import { useKeyboard } from 'flexium-canvas/interactive'

function Player() {
  const keyboard = useKeyboard()

  if (keyboard.isPressed('ArrowLeft')) {
    // Move left
  }
  if (keyboard.isPressed('Space')) {
    // Jump
  }
}
```

### Mouse Input

```tsx
import { useMouse } from 'flexium-canvas/interactive'

function Cursor() {
  const mouse = useMouse()

  return (
    <div style={{ left: mouse.x, top: mouse.y }}>
      {mouse.isPressed(0) ? 'Clicking!' : 'Move me'}
    </div>
  )
}
```

### Game Loop

```tsx
import { useGameLoop } from 'flexium-canvas/interactive'

function Game() {
  useGameLoop((delta) => {
    // Update game state
    player.x += velocity * delta
  })
}
```

## Package Structure

```
flexium-canvas
├── /            # Core canvas utilities
├── /dom         # Canvas component for DOM
└── /interactive # Keyboard, mouse, game loop
```

## Requirements

- Flexium >= 0.15.0

## License

MIT
