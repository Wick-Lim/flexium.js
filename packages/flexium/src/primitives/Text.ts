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

import type { VNode } from '../types'
import type { TextProps } from './types'
import { normalizeStyle } from './utils'

export function Text(props: TextProps): VNode {
  const {
    children,
    style,
    onClick,
    onPress,
    class: className,
    className: cn,
    ...rest
  } = props

  return {
    type: 'span',
    props: {
      ...rest,
      class: className || cn,
      style: normalizeStyle(style),
      onclick: onClick || onPress,
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
