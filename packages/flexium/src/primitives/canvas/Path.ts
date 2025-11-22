/**
 * Path - Canvas path primitive
 *
 * @example
 * ```tsx
 * <Path d="M 10 10 L 100 100" stroke="black" strokeWidth={2} />
 * ```
 */

import type { VNode } from '../../types'
import type { PathProps } from '../types'

export function Path(props: PathProps): VNode {
  return {
    type: 'canvas-path',
    props,
    children: [],
  }
}
