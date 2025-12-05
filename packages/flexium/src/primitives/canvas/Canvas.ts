/**
 * Canvas - Declarative canvas container with JSX drawing
 *
 * Supports Signal-based reactive rendering
 *
 * @example
 * ```tsx
 * const x = signal(50)
 *
 * <Canvas width={300} height={200}>
 *   <Rect x={x} y={50} width={100} height={50} fill="blue" />
 *   <Circle x={150} y={100} radius={30} fill="red" />
 * </Canvas>
 * ```
 */

import type { VNode } from '../../types'
import type { CanvasProps } from '../types'
import { normalizeStyle } from '../utils'
import { renderCanvasChildren } from './renderer'

export function Canvas(props: CanvasProps): VNode {
  const { width, height, children, style, id, ...rest } = props

  return {
    type: 'canvas',
    props: {
      ...rest,
      id,
      width,
      height,
      style: normalizeStyle(style),
      // Attach canvas renderer when element is mounted
      ref: (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Render canvas children with effect for reactivity
        // Import effect and onCleanup dynamically to avoid circular deps
        import('../../core/signal').then(({ effect, onCleanup }) => {
          let rafId: number | undefined

          effect(() => {
            // Use requestAnimationFrame for smooth rendering
            if (rafId) cancelAnimationFrame(rafId)

            rafId = requestAnimationFrame(() => {
              // Clear canvas
              ctx.clearRect(0, 0, width, height)

              // Render all children
              renderCanvasChildren(ctx, children, width, height)
            })

            // Cleanup RAF when effect is disposed
            onCleanup(() => {
              if (rafId) cancelAnimationFrame(rafId)
            })
          })
        })
      },
    },
    children: [],
  }
}
