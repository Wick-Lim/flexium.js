/**
 * Flexium Interactive Module
 *
 * Provides utilities for interactive applications:
 * - Animation loop with delta time and fixed timestep
 * - Keyboard input handling
 * - Mouse input handling
 *
 * Philosophy: No hooks, just factory functions that return signal-based state.
 */

// Core loop
export { createLoop } from './loop'
export type { Loop, LoopOptions } from './loop'

// Input handlers (factory functions, not hooks)
export { keyboard, Keys } from './keyboard'
export type { KeyboardState } from './keyboard'

export { mouse, MouseButton } from './mouse'
export type { MouseState, MouseOptions, Vec2 } from './mouse'
