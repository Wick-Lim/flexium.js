/**
 * Cross-platform Primitives Type Definitions
 *
 * These types work across web (DOM) and React Native
 */

import type { StateValue } from '../core/state'

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
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | number
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  style?: TextStyle
  /** Press/click handler (unified API for web and mobile) */
  onPress?: () => void
  /** CSS class name */
  class?: string
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  style?: CommonStyle
  horizontal?: boolean
  /** Show horizontal scrollbar (default: true) */
  showScrollbarX?: boolean
  /** Show vertical scrollbar (default: true) */
  showScrollbarY?: boolean
}

// ===== Canvas Types =====

/**
 * Canvas container props
 */
export interface CanvasProps {
  width: number
  height: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  style?: CommonStyle
  id?: string
}

/**
 * Rectangle drawing props
 */
export interface DrawRectProps {
  x: number | StateValue<number>
  y: number | StateValue<number>
  width: number | StateValue<number>
  height: number | StateValue<number>
  fill?: string | StateValue<string>
  stroke?: string | StateValue<string>
  strokeWidth?: number | StateValue<number>
  opacity?: number | StateValue<number>
}

/**
 * Circle drawing props
 */
export interface DrawCircleProps {
  x: number | StateValue<number>
  y: number | StateValue<number>
  radius: number | StateValue<number>
  fill?: string | StateValue<string>
  stroke?: string | StateValue<string>
  strokeWidth?: number | StateValue<number>
  opacity?: number | StateValue<number>
}

/**
 * Path drawing props
 */
export interface DrawPathProps {
  d: string | StateValue<string>
  fill?: string | StateValue<string>
  stroke?: string | StateValue<string>
  strokeWidth?: number | StateValue<number>
  opacity?: number | StateValue<number>
}

/**
 * Canvas text drawing props
 */
export interface DrawTextProps {
  x: number | StateValue<number>
  y: number | StateValue<number>
  text: string | StateValue<string>
  fill?: string | StateValue<string>
  fontSize?: number | StateValue<number>
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | number
  textAlign?: 'left' | 'center' | 'right'
  textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'
}

/**
 * Line drawing props
 */
export interface DrawLineProps {
  x1: number | StateValue<number>
  y1: number | StateValue<number>
  x2: number | StateValue<number>
  y2: number | StateValue<number>
  stroke?: string | StateValue<string>
  strokeWidth?: number | StateValue<number>
  opacity?: number | StateValue<number>
}

/**
 * Arc drawing props
 */
export interface DrawArcProps {
  x: number | StateValue<number>
  y: number | StateValue<number>
  radius: number | StateValue<number>
  startAngle: number | StateValue<number>
  endAngle: number | StateValue<number>
  counterclockwise?: boolean
  fill?: string | StateValue<string>
  stroke?: string | StateValue<string>
  strokeWidth?: number | StateValue<number>
  opacity?: number | StateValue<number>
}
