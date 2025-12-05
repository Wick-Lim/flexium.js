/**
 * Pressable - Universal touchable/clickable component
 *
 * Maps to:
 * - Web: <button>
 * - React Native: <Pressable>
 *
 * @example
 * ```tsx
 * <Pressable
 *   onPress={() => console.log('pressed')}
 *   style={{ padding: 10 }}
 * >
 *   <Text>Click Me</Text>
 * </Pressable>
 * ```
 */

import type { VNode } from '../types'
import type { PressableProps } from './types'
import { normalizeStyle } from './utils'

export function Pressable(props: PressableProps): VNode {
  const {
    children,
    onPress,
    onPressIn,
    onPressOut,
    disabled,
    style,
    activeOpacity: _activeOpacity = 0.7,
    ...rest
  } = props

  const buttonStyle = {
    ...style,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : style?.opacity,
    border: 'none',
    background: 'none',
    padding: 0,
  }

  return {
    type: 'button',
    props: {
      ...rest,
      disabled,
      style: normalizeStyle(buttonStyle),
      onclick: disabled ? undefined : onPress,
      onmousedown: onPressIn,
      onmouseup: onPressOut,
      ontouchstart: onPressIn,
      ontouchend: onPressOut,
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
