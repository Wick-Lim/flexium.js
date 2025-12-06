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

import type { FNode } from '../types'
import type { ScrollViewProps } from './types'
import { normalizeStyle } from './utils'

export function ScrollView(props: ScrollViewProps): FNode {
  const {
    children,
    style,
    horizontal = false,
    showScrollbarX = true,
    showScrollbarY = true,
    ...rest
  } = props

  const scrollStyle: Record<string, unknown> = {
    ...style,
    overflowX: horizontal ? 'auto' : 'hidden',
    overflowY: horizontal ? 'hidden' : 'auto',
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
  }

  // Hide scrollbars if requested (CSS scrollbar-width for Firefox/modern browsers)
  if (!showScrollbarX || !showScrollbarY) {
    scrollStyle.scrollbarWidth = 'none'
  }

  return {
    type: 'div',
    props: {
      ...rest,
      style: normalizeStyle(scrollStyle as Parameters<typeof normalizeStyle>[0]),
    },
    children: Array.isArray(children) ? children : children ? [children] : [],
  }
}
