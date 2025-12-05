/**
 * Flexium Canvas Renderer
 *
 * Canvas 2D rendering system with signal-based reactivity.
 * Supports declarative drawing primitives that automatically re-render
 * when signal values change.
 *
 * @example
 * ```tsx
 * import { Canvas, DrawRect, DrawCircle } from 'flexium/canvas'
 * import { signal } from 'flexium/core'
 *
 * const x = signal(50)
 *
 * <Canvas width={300} height={200}>
 *   <DrawRect x={x} y={50} width={100} height={50} fill="blue" />
 *   <DrawCircle x={150} y={100} radius={30} fill="red" />
 * </Canvas>
 * ```
 */

// Re-export core reactivity
export { signal, computed, effect, root } from './core/signal'
export type { Signal, Computed } from './core/signal'

// Canvas primitives
export { Canvas } from './primitives/canvas/Canvas'
export { DrawRect } from './primitives/canvas/DrawRect'
export { DrawCircle } from './primitives/canvas/DrawCircle'
export { DrawArc } from './primitives/canvas/DrawArc'
export { DrawLine } from './primitives/canvas/DrawLine'
export { DrawPath } from './primitives/canvas/DrawPath'
export { DrawText } from './primitives/canvas/DrawText'

// Canvas renderer utilities
export { renderCanvasChildren } from './primitives/canvas/renderer'
export { unwrapSignal } from './primitives/canvas/utils'

// Canvas types
export type {
  CanvasProps,
  DrawRectProps,
  DrawCircleProps,
  DrawArcProps,
  DrawLineProps,
  DrawPathProps,
  DrawTextProps,
} from './primitives/types'
