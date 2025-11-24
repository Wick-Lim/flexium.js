/**
 * ScrollView - Universal scrollable container
 *
 * Maps to:
 * - Web: <div style="overflow: scroll">
 * - React Native: <ScrollView>
 *
 * @example
 * ```tsx
 * <ScrollView style={{ height: 300 }}>
 *   <Column>...</Column>
 *   <Column>...</Column>
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
    horizontal = false,
    showsHorizontalScrollIndicator = true,
    showsVerticalScrollIndicator = true,
    ...rest
  } = props

  const scrollStyle = {
    ...style,
    overflowX: horizontal ? 'auto' : 'hidden',
    overflowY: horizontal ? 'hidden' : 'auto',
    display: 'flex' as const,
    flexDirection: (horizontal ? 'row' : 'column') as 'row' | 'column',
  }

  // Hide scrollbars if requested
  if (!showsHorizontalScrollIndicator) {
    // Note: This requires CSS usually, setting inline for demo
    // scrollStyle.scrollbarWidth = 'none'
  }

  return {
    type: 'div',
    props: {
      ...rest,
      style: normalizeStyle(scrollStyle as any),
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
