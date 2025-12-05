/**
 * DrawLine - Canvas line primitive
 *
 * @example
 * ```tsx
 * <DrawLine x1={10} y1={10} x2={100} y2={100} stroke="black" strokeWidth={2} />
 * ```
 */

import type { FNode } from '../../types'
import type { DrawLineProps } from '../types'

export function DrawLine(props: DrawLineProps): FNode {
  return {
    type: 'canvas-line',
    props,
    children: [],
  }
}
