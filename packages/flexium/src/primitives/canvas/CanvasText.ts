/**
 * CanvasText - Canvas text primitive
 *
 * @example
 * ```tsx
 * <CanvasText x={50} y={50} text="Hello Canvas" fontSize={20} fill="black" />
 * ```
 */

import type { VNode } from '../../types'
import type { CanvasTextProps } from '../types'

export function CanvasText(props: CanvasTextProps): VNode {
  return {
    type: 'canvas-text',
    props,
    children: [],
  }
}
