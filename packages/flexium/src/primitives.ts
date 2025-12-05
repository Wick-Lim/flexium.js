/**
 * Flexium Primitives - Core Bundle
 *
 * Lightweight core primitives for cross-platform development.
 * For Motion, Form, and UI components, import from separate entry points:
 * - import { createMotion, useMotion } from 'flexium/primitives/motion'
 * - import { createForm, createInput } from 'flexium/primitives/form'
 * - import { createButton, createText } from 'flexium/primitives/ui'
 */

// Re-export core reactivity
export { effect, root } from './core/signal'
export { state } from './core/state'

// Layout primitives
export { Row, Column, Stack, Grid, Spacer } from './primitives/layout'

// Basic cross-platform primitives (web/mobile)
export { Text } from './primitives/Text'
export { Image } from './primitives/Image'
export { Pressable } from './primitives/Pressable'
export { ScrollView } from './primitives/ScrollView'
export { Canvas, DrawRect, DrawCircle, DrawPath, DrawText, DrawLine, DrawArc } from './primitives/canvas'
export { normalizeStyle } from './primitives/utils'

// Types
export type {
  TextProps,
  ImageProps,
  PressableProps,
  ScrollViewProps,
  CanvasProps,
  DrawRectProps,
  DrawCircleProps,
  DrawPathProps,
  DrawTextProps,
  DrawLineProps,
  DrawArcProps,
  TextStyle,
} from './primitives/types'

export type {
  RowProps,
  ColumnProps,
  StackProps,
  GridProps,
  SpacerProps,
  BaseStyleProps,
  CommonStyle,
} from './primitives/layout'
