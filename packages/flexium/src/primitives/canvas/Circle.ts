/**
 * Circle - Canvas circle primitive
 *
 * @example
 * ```tsx
 * <Circle x={100} y={100} radius={50} fill="red" />
 * ```
 */

import type { VNode } from '../../types'
import type { CircleProps } from '../types'

export function Circle(props: CircleProps): VNode {
  return {
    type: 'canvas-circle',
    props,
    children: [],
  }
}
