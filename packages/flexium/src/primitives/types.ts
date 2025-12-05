/**
 * Cross-platform Primitives Type Definitions
 *
 * These types work across web (DOM) and React Native
 */

import type { Signal } from '../core/signal'

/**
 * Common style properties that work on both web and React Native
 * Based on Flexbox layout model
 */
export interface CommonStyle {
  // Layout
  display?: 'flex' | 'none'
  flex?: number
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch'
  gap?: number

  // Spacing
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingHorizontal?: number
  paddingVertical?: number
  margin?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  marginHorizontal?: number
  marginVertical?: number

  // Sizing
  width?: number | string
  height?: number | string
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number

  // Visual
  backgroundColor?: string
  borderRadius?: number
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomLeftRadius?: number
  borderBottomRightRadius?: number
  opacity?: number

  // Border
  borderWidth?: number
  borderColor?: string
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number

  // Position
  position?: 'relative' | 'absolute'
  top?: number
  right?: number
  bottom?: number
  left?: number
  zIndex?: number

  // Transform
  transform?: string
}

/**
 * Text-specific style properties
 */
export interface TextStyle extends CommonStyle {
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textDecoration?: 'none' | 'underline' | 'line-through'
  lineHeight?: number
  letterSpacing?: number
}

/**
 * Text component props
 * Universal text display
 */
export interface TextProps {
  children?: any
  style?: TextStyle
  onClick?: () => void
  onPress?: () => void
  class?: string
  className?: string
}

/**
 * Image component props
 */
export interface ImageProps {
  src: string
  alt?: string
  width?: number
  height?: number
  style?: CommonStyle
  onLoad?: () => void
  onError?: () => void
}

/**
 * Pressable component props
 * Universal touchable/clickable element
 */
export interface PressableProps {
  children?: any
  onPress: () => void
  onPressIn?: () => void
  onPressOut?: () => void
  disabled?: boolean
  style?: CommonStyle
  activeOpacity?: number
}

/**
 * ScrollView component props
 */
export interface ScrollViewProps {
  children?: any
  style?: CommonStyle
  horizontal?: boolean
  showsHorizontalScrollIndicator?: boolean
  showsVerticalScrollIndicator?: boolean
}

// ===== Canvas Types =====

/**
 * Canvas container props
 */
export interface CanvasProps {
  width: number
  height: number
  children?: any
  style?: CommonStyle
  id?: string
}

/**
 * Rectangle drawing props
 */
export interface DrawRectProps {
  x: number | Signal<number>
  y: number | Signal<number>
  width: number | Signal<number>
  height: number | Signal<number>
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}

/**
 * Circle drawing props
 */
export interface DrawCircleProps {
  x: number | Signal<number>
  y: number | Signal<number>
  radius: number | Signal<number>
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}

/**
 * Path drawing props
 */
export interface DrawPathProps {
  d: string | Signal<string>
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}

/**
 * Canvas text drawing props
 */
export interface DrawTextProps {
  x: number | Signal<number>
  y: number | Signal<number>
  text: string | Signal<string>
  fill?: string | Signal<string>
  fontSize?: number | Signal<number>
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | number
  textAlign?: 'left' | 'center' | 'right'
  textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'
}

/**
 * Line drawing props
 */
export interface DrawLineProps {
  x1: number | Signal<number>
  y1: number | Signal<number>
  x2: number | Signal<number>
  y2: number | Signal<number>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}

/**
 * Arc drawing props
 */
export interface DrawArcProps {
  x: number | Signal<number>
  y: number | Signal<number>
  radius: number | Signal<number>
  startAngle: number | Signal<number>
  endAngle: number | Signal<number>
  counterclockwise?: boolean
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}

/**
 * Canvas drawing context
 */
export interface CanvasDrawingContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}
