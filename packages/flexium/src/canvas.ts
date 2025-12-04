/**
 * Flexium Canvas Renderer
 *
 * Canvas 2D rendering system with signal-based reactivity.
 * Supports declarative drawing primitives that automatically re-render
 * when signal values change.
 *
 * @example
 * ```tsx
 * import { Canvas, Rect, Circle } from 'flexium/canvas'
 * import { signal } from 'flexium'
 *
 * const x = signal(50)
 *
 * <Canvas width={300} height={200}>
 *   <Rect x={x} y={50} width={100} height={50} fill="blue" />
 *   <Circle x={150} y={100} radius={30} fill="red" />
 * </Canvas>
 * ```
 */

// Re-export core reactivity
export { signal, computed, effect, root } from './core/signal'
export type { Signal, Computed } from './core/signal'

// Canvas primitives
export { Canvas } from './primitives/canvas/Canvas'
export { Rect } from './primitives/canvas/Rect'
export { Circle } from './primitives/canvas/Circle'
export { Arc } from './primitives/canvas/Arc'
export { Line } from './primitives/canvas/Line'
export { Path } from './primitives/canvas/Path'
export { CanvasText } from './primitives/canvas/CanvasText'

// Canvas renderer utilities
export { renderCanvasChildren } from './primitives/canvas/renderer'
export { unwrapSignal } from './primitives/canvas/utils'

// Canvas types
export type {
    CanvasProps,
    RectProps,
    CircleProps,
    ArcProps,
    LineProps,
    PathProps,
    CanvasTextProps
} from './primitives/types'
