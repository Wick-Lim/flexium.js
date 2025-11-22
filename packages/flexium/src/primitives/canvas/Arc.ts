/**
 * Arc - Canvas arc primitive
 *
 * @example
 * ```tsx
 * <Arc x={100} y={100} radius={50} startAngle={0} endAngle={Math.PI} fill="green" />
 * ```
 */

import type { VNode } from '../../types'
import type { ArcProps } from '../types'

export function Arc(props: ArcProps): VNode {
  return {
    type: 'canvas-arc',
    props,
    children: [],
  }
}
