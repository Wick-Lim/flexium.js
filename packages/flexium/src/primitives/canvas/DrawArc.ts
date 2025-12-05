/**
 * DrawArc - Canvas arc primitive
 *
 * @example
 * ```tsx
 * <DrawArc x={100} y={100} radius={50} startAngle={0} endAngle={Math.PI} fill="green" />
 * ```
 */

import type { VNode } from '../../types'
import type { DrawArcProps } from '../types'

export function DrawArc(props: DrawArcProps): VNode {
  return {
    type: 'canvas-arc',
    props,
    children: [],
  }
}
