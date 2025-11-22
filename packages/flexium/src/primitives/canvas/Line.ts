/**
 * Line - Canvas line primitive
 *
 * @example
 * ```tsx
 * <Line x1={10} y1={10} x2={100} y2={100} stroke="black" strokeWidth={2} />
 * ```
 */

import type { VNode } from '../../types'
import type { LineProps } from '../types'

export function Line(props: LineProps): VNode {
  return {
    type: 'canvas-line',
    props,
    children: [],
  }
}
