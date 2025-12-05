/**
 * DrawPath - Canvas path primitive
 *
 * @example
 * ```tsx
 * <DrawPath d="M 10 10 L 100 100" stroke="black" strokeWidth={2} />
 * ```
 */

import type { FNode } from '../../types'
import type { DrawPathProps } from '../types'

export function DrawPath(props: DrawPathProps): FNode {
  return {
    type: 'canvas-path',
    props,
    children: [],
  }
}
