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

import type { FNode } from '../../types'
import type { CanvasProps } from '../types'
import { normalizeStyle } from '../utils'
import { renderCanvasChildren } from './renderer'

export function Canvas(props: CanvasProps): FNode {
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

        // SSR guard: skip canvas rendering on server
        if (typeof requestAnimationFrame === 'undefined') return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Render canvas children with effect for reactivity
        // Import effect and onCleanup dynamically to avoid circular deps
        import('../../core/signal')
          .then(({ effect, onCleanup, isSignal }) => {
            let rafId: number | undefined

            const scheduleRender = () => {
              if (rafId !== undefined) {
                cancelAnimationFrame(rafId)
              }

              rafId = requestAnimationFrame(() => {
                // Clear canvas
                ctx.clearRect(0, 0, width, height)

                // Render all children
                renderCanvasChildren(ctx, children, width, height)

                rafId = undefined
              })
            }

            effect(() => {
              // To track signal dependencies, we need to access them in the effect
              // Walk through children and touch any signals to track dependencies
              const childArray = Array.isArray(children) ? children : [children]
              for (const child of childArray) {
                if (child && child.props) {
                  // Touch each prop to track signal dependencies
                  for (const key in child.props) {
                    const value = child.props[key]
                    // If it's a signal, access its value to track it
                    if (isSignal(value)) {
                      void value.value // Touch the signal to track dependency
                    }
                  }
                }
              }

              // Now schedule the actual render
              scheduleRender()

              // Cleanup RAF when effect is disposed
              onCleanup(() => {
                if (rafId !== undefined) {
                  cancelAnimationFrame(rafId)
                  rafId = undefined
                }
              })
            })
          })
          .catch((err) => {
            console.error('[Flexium Canvas] Failed to load signal module:', err)
          })
      },
    },
    children: [],
  }
}
