/**
 * Flexium Interactive Module
 *
 * Provides utilities for interactive applications:
 * - Animation loop with delta time and fixed timestep
 * - Keyboard input handling
 * - Mouse input handling
 */

// Core loop
export { createLoop } from './loop'
export type { Loop, LoopOptions } from './loop'

// Input hooks
export { useKeyboard, Keys } from './useKeyboard'
export type { KeyboardState } from './useKeyboard'

export { useMouse, MouseButton } from './useMouse'
export type { MouseState, UseMouseOptions, Vec2 } from './useMouse'
