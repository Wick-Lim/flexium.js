/**
 * Flexium Interactive
 *
 * Utilities for building interactive applications, games, and animations.
 * Provides animation loop, input handling, and more.
 *
 * @example
 * ```tsx
 * import { Canvas, DrawRect } from 'flexium/canvas'
 * import { createLoop, useKeyboard, useMouse } from 'flexium/interactive'
 *
 * const keyboard = useKeyboard()
 * const mouse = useMouse()
 *
 * const playerX = signal(100)
 * const playerY = signal(100)
 *
 * const loop = createLoop({
 *   onUpdate(delta) {
 *     const speed = 200 * delta
 *
 *     if (keyboard.isPressed('keyw')) playerY.value -= speed
 *     if (keyboard.isPressed('keys')) playerY.value += speed
 *     if (keyboard.isPressed('keya')) playerX.value -= speed
 *     if (keyboard.isPressed('keyd')) playerX.value += speed
 *
 *     keyboard.clearFrameState()
 *   }
 * })
 *
 * loop.start()
 * ```
 */

// Re-export all interactive utilities
export * from './interactive/index'
