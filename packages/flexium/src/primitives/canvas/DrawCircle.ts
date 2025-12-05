/**
 * DrawCircle - Canvas circle primitive
 *
 * @example
 * ```tsx
 * <DrawCircle x={100} y={100} radius={50} fill="red" />
 * ```
 */

import type { FNode } from '../../types'
import type { DrawCircleProps } from '../types'

export function DrawCircle(props: DrawCircleProps): FNode {
  return {
    type: 'canvas-circle',
    props,
    children: [],
  }
}
