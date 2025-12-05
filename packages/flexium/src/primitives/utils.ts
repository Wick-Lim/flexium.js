/**
 * Primitive utilities
 */

import type { CommonStyle, TextStyle } from './types'

/**
 * Normalize CommonStyle to CSS properties
 */
export function normalizeStyle(
  style?: CommonStyle | TextStyle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  if (!style) return {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const css: Record<string, any> = {}

  // Layout
  if (style.display) css.display = style.display
  if (style.flex !== undefined) css.flex = style.flex
  if (style.flexDirection) css.flexDirection = style.flexDirection
  if (style.flexWrap) css.flexWrap = style.flexWrap
  if (style.justifyContent) css.justifyContent = style.justifyContent
  if (style.alignItems) css.alignItems = style.alignItems
  if (style.alignSelf) css.alignSelf = style.alignSelf
  if (style.gap !== undefined) css.gap = `${style.gap}px`

  // Spacing - padding
  if (style.padding !== undefined) css.padding = `${style.padding}px`
  if (style.paddingTop !== undefined) css.paddingTop = `${style.paddingTop}px`
  if (style.paddingRight !== undefined)
    css.paddingRight = `${style.paddingRight}px`
  if (style.paddingBottom !== undefined)
    css.paddingBottom = `${style.paddingBottom}px`
  if (style.paddingLeft !== undefined)
    css.paddingLeft = `${style.paddingLeft}px`
  if (style.paddingHorizontal !== undefined) {
    css.paddingLeft = `${style.paddingHorizontal}px`
    css.paddingRight = `${style.paddingHorizontal}px`
  }
  if (style.paddingVertical !== undefined) {
    css.paddingTop = `${style.paddingVertical}px`
    css.paddingBottom = `${style.paddingVertical}px`
  }

  // Spacing - margin
  if (style.margin !== undefined) css.margin = `${style.margin}px`
  if (style.marginTop !== undefined) css.marginTop = `${style.marginTop}px`
  if (style.marginRight !== undefined)
    css.marginRight = `${style.marginRight}px`
  if (style.marginBottom !== undefined)
    css.marginBottom = `${style.marginBottom}px`
  if (style.marginLeft !== undefined) css.marginLeft = `${style.marginLeft}px`
  if (style.marginHorizontal !== undefined) {
    css.marginLeft = `${style.marginHorizontal}px`
    css.marginRight = `${style.marginHorizontal}px`
  }
  if (style.marginVertical !== undefined) {
    css.marginTop = `${style.marginVertical}px`
    css.marginBottom = `${style.marginVertical}px`
  }

  // Sizing
  if (style.width !== undefined)
    css.width =
      typeof style.width === 'number' ? `${style.width}px` : style.width
  if (style.height !== undefined)
    css.height =
      typeof style.height === 'number' ? `${style.height}px` : style.height
  if (style.minWidth !== undefined) css.minWidth = `${style.minWidth}px`
  if (style.maxWidth !== undefined) css.maxWidth = `${style.maxWidth}px`
  if (style.minHeight !== undefined) css.minHeight = `${style.minHeight}px`
  if (style.maxHeight !== undefined) css.maxHeight = `${style.maxHeight}px`

  // Visual
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor
  if (style.borderRadius !== undefined)
    css.borderRadius = `${style.borderRadius}px`
  if (style.borderTopLeftRadius !== undefined)
    css.borderTopLeftRadius = `${style.borderTopLeftRadius}px`
  if (style.borderTopRightRadius !== undefined)
    css.borderTopRightRadius = `${style.borderTopRightRadius}px`
  if (style.borderBottomLeftRadius !== undefined)
    css.borderBottomLeftRadius = `${style.borderBottomLeftRadius}px`
  if (style.borderBottomRightRadius !== undefined)
    css.borderBottomRightRadius = `${style.borderBottomRightRadius}px`
  if (style.opacity !== undefined) css.opacity = style.opacity

  // Border
  if (style.borderWidth !== undefined)
    css.borderWidth = `${style.borderWidth}px`
  if (style.borderColor) css.borderColor = style.borderColor
  if (style.borderTopWidth !== undefined)
    css.borderTopWidth = `${style.borderTopWidth}px`
  if (style.borderRightWidth !== undefined)
    css.borderRightWidth = `${style.borderRightWidth}px`
  if (style.borderBottomWidth !== undefined)
    css.borderBottomWidth = `${style.borderBottomWidth}px`
  if (style.borderLeftWidth !== undefined)
    css.borderLeftWidth = `${style.borderLeftWidth}px`

  // Position
  if (style.position) css.position = style.position
  if (style.top !== undefined) css.top = `${style.top}px`
  if (style.right !== undefined) css.right = `${style.right}px`
  if (style.bottom !== undefined) css.bottom = `${style.bottom}px`
  if (style.left !== undefined) css.left = `${style.left}px`
  if (style.zIndex !== undefined) css.zIndex = style.zIndex

  // Transform
  if (style.transform) css.transform = style.transform

  // Text-specific (if TextStyle)
  const textStyle = style as TextStyle
  if (textStyle.color) css.color = textStyle.color
  if (textStyle.fontSize !== undefined) css.fontSize = `${textStyle.fontSize}px`
  if (textStyle.fontWeight) css.fontWeight = textStyle.fontWeight
  if (textStyle.fontFamily) css.fontFamily = textStyle.fontFamily
  if (textStyle.fontStyle) css.fontStyle = textStyle.fontStyle
  if (textStyle.textAlign) css.textAlign = textStyle.textAlign
  if (textStyle.textDecoration) css.textDecoration = textStyle.textDecoration
  if (textStyle.lineHeight !== undefined)
    css.lineHeight = `${textStyle.lineHeight}px`
  if (textStyle.letterSpacing !== undefined)
    css.letterSpacing = `${textStyle.letterSpacing}px`

  return css
}
