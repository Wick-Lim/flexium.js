/**
 * DrawRect - Canvas rectangle primitive
 *
 * @example
 * ```tsx
 * <DrawRect x={10} y={10} width={100} height={50} fill="blue" />
 * ```
 */

import type { VNode } from '../../types'
import type { DrawRectProps } from '../types'

export function DrawRect(props: DrawRectProps): VNode {
  return {
    type: 'canvas-rect',
    props,
    children: [],
  }
}
