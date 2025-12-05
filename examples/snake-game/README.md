# Snake Game - Flexium Game Module Example

A classic Snake game implementation demonstrating Flexium's game development capabilities.

## Features Demonstrated

This example showcases the following Flexium APIs:

### Game Module APIs

- **`useKeyboard()`** - Reactive keyboard input handling
  - Arrow keys and WASD for snake movement
  - Space for pause/unpause
  - Enter to restart game
  - Prevents invalid 180-degree turns

- **`useMouse()`** - Mouse input tracking
  - Click anywhere on screen to pause/unpause
  - Demonstrates canvas-independent mouse interaction

- **`createGameLoop()`** - Game loop with delta time
  - Smooth frame-independent animation
  - Delta time based movement
  - Progressive difficulty (speed increases with score)

### Canvas Primitives

- **`Canvas`** - Main canvas container with reactive rendering
- **`DrawRect`** - Rectangles for snake segments, food, and grid
- **`DrawText`** - Text rendering for game over and pause states

### Core Flexium Features

- **Reactive Signals** - Game state management (score, snake position, direction)
- **Effects** - Automatic updates when state changes
- **JSX** - Declarative UI and canvas rendering

## Game Mechanics

- Snake grows by eating red food
- Game over on wall or self-collision
- Speed increases as score increases
- Grid-based movement with smooth rendering
- Visual grid for better spatial awareness

## Controls

- **Arrow Keys** or **WASD** - Control snake direction
- **Space** or **Mouse Click** - Pause/unpause game
- **Enter** - Restart game (when game over)

## Running the Example

From this directory:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Or from the workspace root:

```bash
# Run this specific example
npm run dev:examples -- snake-game
```

## Code Structure

```
snake-game/
├── src/
│   └── main.tsx          # Main game implementation
├── index.html            # HTML template with styles
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── README.md            # This file
```

## Key Implementation Details

### Game Loop
```tsx
const gameLoop = createGameLoop({
  onUpdate: (delta) => {
    moveTimer += delta
    if (moveTimer >= getCurrentSpeed()) {
      moveSnake()
      moveTimer = 0
    }
  }
})
```

### Keyboard Input
```tsx
const keyboard = useKeyboard()

effect(() => {
  if (keyboard.isPressed(Keys.ArrowUp)) {
    nextDirection.value = Direction.UP
  }
  // ... other directions
})
```

### Mouse Input
```tsx
const mouse = useMouse()

effect(() => {
  if (mouse.isLeftPressed()) {
    paused.value = !paused.value
  }
})
```

### Canvas Rendering
```tsx
<Canvas width={400} height={400}>
  {/* Snake segments */}
  {() => snake.value.map((segment, index) => (
    <DrawRect
      x={segment.x * CELL_SIZE}
      y={segment.y * CELL_SIZE}
      width={CELL_SIZE}
      height={CELL_SIZE}
      fill={index === 0 ? '#27ae60' : '#2ecc71'}
    />
  ))}

  {/* Food */}
  <DrawRect
    x={food.value.x * CELL_SIZE}
    y={food.value.y * CELL_SIZE}
    width={CELL_SIZE}
    height={CELL_SIZE}
    fill="#e74c3c"
  />
</Canvas>
```

## Learning Points

1. **Frame-Independent Movement** - Using delta time ensures consistent gameplay regardless of frame rate
2. **Reactive State** - All game state is managed with signals, enabling automatic UI updates
3. **Input Handling** - Demonstrates both keyboard and mouse input with proper state management
4. **Canvas Rendering** - Shows how to render complex, dynamic canvas content with JSX
5. **Game Logic** - Classic snake game mechanics with collision detection and growth

## Extending the Example

Ideas for enhancement:

- Add difficulty levels
- Implement power-ups (speed boost, slow down, etc.)
- Add sound effects
- Create a high score system with localStorage
- Add obstacles on the grid
- Implement different game modes
- Add mobile touch controls
- Create a main menu screen

## Browser Support

Requires a modern browser with support for:
- ES2020+ JavaScript
- Canvas API
- RequestAnimationFrame API

## License

MIT
