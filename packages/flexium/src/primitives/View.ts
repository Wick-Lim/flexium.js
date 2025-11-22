/**
 * View - Universal container component
 *
 * Maps to:
 * - Web: <div>
 * - React Native: <View>
 *
 * @example
 * ```tsx
 * <View style={{ flex: 1, padding: 20 }}>
 *   <Text>Hello World</Text>
 * </View>
 * ```
 */

import type { VNode } from '../types'
import type { ViewProps } from './types'
import { normalizeStyle } from './utils'

export function View(props: ViewProps): VNode {
  const {
    children,
    style,
    onClick,
    onPress,
    class: className,
    className: cn,
    id,
    ...rest
  } = props

  return {
    type: 'div',
    props: {
      ...rest,
      id,
      class: className || cn,
      style: normalizeStyle(style),
      onclick: onClick || onPress,
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
