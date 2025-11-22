/**
 * Rect - Canvas rectangle primitive
 *
 * @example
 * ```tsx
 * <Rect x={10} y={10} width={100} height={50} fill="blue" />
 * ```
 */

import type { VNode } from '../../types'
import type { RectProps } from '../types'

export function Rect(props: RectProps): VNode {
  return {
    type: 'canvas-rect',
    props,
    children: [],
  }
}
