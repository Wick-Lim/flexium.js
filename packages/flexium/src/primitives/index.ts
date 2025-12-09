/**
 * Flexium Primitives
 *
 * All primitive components for building UIs
 */

// Motion components (explicit exports for better tree-shaking)
export {
  MotionController,
  type AnimatableProps,
  type SpringConfig,
  type MotionProps,
  Transition,
  TransitionGroup,
  transitions,
  type TransitionPreset,
  type TransitionTiming,
  type TransitionProps,
  type TransitionGroupProps,
} from './motion'

// UI components (explicit exports for better tree-shaking)
export {
  Button,
  IconButton,
  type ButtonVariant,
  type ButtonSize,
  type ButtonType,
  type ButtonProps,
} from './ui'

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

// List component with optional virtualization
export { List } from './List'

export type {
  ListProps,
  FixedSizeConfig,
  VariableSizeConfig,
  SizeConfig,
} from './List'

// Utils
export { normalizeStyle } from './utils'
