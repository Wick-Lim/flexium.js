/**
 * ScrollView - Universal scrollable container
 *
 * Maps to:
 * - Web: <div> with overflow
 * - React Native: <ScrollView>
 *
 * @example
 * ```tsx
 * <ScrollView style={{ height: 300 }}>
 *   <View>...</View>
 *   <View>...</View>
 * </ScrollView>
 * ```
 */

import type { VNode } from '../types'
import type { ScrollViewProps } from './types'
import { normalizeStyle } from './utils'

export function ScrollView(props: ScrollViewProps): VNode {
  const {
    children,
    style,
    horizontal,
    showsHorizontalScrollIndicator = true,
    showsVerticalScrollIndicator = true,
    ...rest
  } = props

  const scrollStyle = {
    ...style,
    overflow: 'auto',
    overflowX: horizontal ? 'auto' : 'hidden',
    overflowY: horizontal ? 'hidden' : 'auto',
    WebkitOverflowScrolling: 'touch',
  }

  // Hide scrollbars if requested
  const additionalStyle: Record<string, any> = {}
  if (!showsHorizontalScrollIndicator || !showsVerticalScrollIndicator) {
    additionalStyle.scrollbarWidth = 'none' // Firefox
    additionalStyle.msOverflowStyle = 'none' // IE/Edge
  }

  return {
    type: 'div',
    props: {
      ...rest,
      style: {
        ...normalizeStyle(scrollStyle),
        ...additionalStyle,
      },
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
