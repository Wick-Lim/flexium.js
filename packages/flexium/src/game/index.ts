/**
 * Flexium Game Module
 *
 * Provides game development utilities for canvas-based games:
 * - Game loop with delta time and fixed timestep
 * - Keyboard input handling
 * - Mouse input handling
 */

// Core game loop
export { createGameLoop } from './gameLoop'
export type { GameLoop, GameLoopOptions } from './gameLoop'

// Input hooks
export { useKeyboard, Keys } from './useKeyboard'
export type { KeyboardState } from './useKeyboard'

export { useMouse, MouseButton } from './useMouse'
export type { MouseState, UseMouseOptions, Vec2 } from './useMouse'
