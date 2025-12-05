/**
 * DrawText - Canvas text primitive
 *
 * @example
 * ```tsx
 * <DrawText x={50} y={50} text="Hello Canvas" fontSize={20} fill="black" />
 * ```
 */

import type { FNode } from '../../types'
import type { DrawTextProps } from '../types'

export function DrawText(props: DrawTextProps): FNode {
  return {
    type: 'canvas-text',
    props,
    children: [],
  }
}
