/**
 * Flexium Game
 *
 * Game development utilities for building canvas-based games.
 * Provides game loop, input handling, and more.
 *
 * @example
 * ```tsx
 * import { Canvas, DrawRect } from 'flexium/canvas'
 * import { createGameLoop, useKeyboard, useMouse } from 'flexium/game'
 *
 * const keyboard = useKeyboard()
 * const mouse = useMouse()
 *
 * const playerX = signal(100)
 * const playerY = signal(100)
 *
 * const game = createGameLoop({
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
 * game.start()
 * ```
 */

// Re-export all game utilities
export * from './game/index'
