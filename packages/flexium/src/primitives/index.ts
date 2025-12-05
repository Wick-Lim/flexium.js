/**
 * Flexium Primitives
 *
 * All primitive components for building UIs
 */

// Motion components
export * from './motion'

// Form components
export * from './form'

// UI components
export * from './ui'

// Layout components
export { Row, Column, Spacer, Grid, Stack } from './layout'

export type {
  RowProps,
  ColumnProps,
  SpacerProps,
  GridProps,
  StackProps,
  CommonStyle as BaseStyleProps,
} from './layout'

// Cross-platform primitives
export { Text } from './Text'
export { Image } from './Image'
export { Pressable } from './Pressable'
export { ScrollView } from './ScrollView'

// Canvas primitives
export {
  Canvas,
  DrawRect,
  DrawCircle,
  DrawPath,
  DrawText,
  DrawLine,
  DrawArc,
} from './canvas'

// Cross-platform types
export type {
  TextProps,
  ImageProps,
  PressableProps,
  ScrollViewProps,
  CommonStyle,
  TextStyle,
  DrawRectProps,
  DrawCircleProps,
  DrawPathProps,
  DrawTextProps,
  DrawLineProps,
  DrawArcProps,
  CanvasProps,
} from './types'

// VirtualList for efficient large list rendering
export {
  VirtualList,
  isVirtualListComponent,
  VIRTUALLIST_MARKER,
} from './VirtualList'

export type {
  VirtualListProps,
  VirtualListComponent,
  FixedSizeConfig,
  VariableSizeConfig,
  SizeConfig,
} from './VirtualList'

// Utils
export { normalizeStyle } from './utils'
