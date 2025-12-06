/**
 * Text - Universal text display component
 *
 * Maps to:
 * - Web: <span>
 * - React Native: <Text>
 *
 * @example
 * ```tsx
 * <Text style={{ color: 'blue', fontSize: 16 }}>
 *   Hello World
 * </Text>
 * ```
 */

import type { FNode } from '../types'
import type { TextProps } from './types'
import { normalizeStyle } from './utils'

export function Text(props: TextProps): FNode {
  const { children, style, onPress, class: className, ...rest } = props

  return {
    type: 'span',
    props: {
      ...rest,
      class: className,
      style: normalizeStyle(style),
      onclick: onPress,
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
