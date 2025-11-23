/**
 * Flexium Primitives
 *
 * UX-first components (Motion, Form, UI elements) + Cross-platform primitives
 */

// Re-export core reactivity
export { effect, batch, untrack, root } from './core/signal'
export { state } from './core/state'

// Motion primitives
export { MotionController, createMotion, useMotion } from './primitives/motion/Motion'
export type { MotionProps, SpringConfig } from './primitives/motion/Motion'

// Form primitives
export { createForm } from './primitives/form/Form'
export { createInput, createInputField } from './primitives/form/Input'
export type {
  FormState,
  FieldState,
  ValidationRule
} from './primitives/form/Form'

// UI primitives
export { createButton, createIconButton } from './primitives/ui/Button'
export { createText, createHeading, createParagraph, createLabel, createCode } from './primitives/ui/Text'
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize
} from './primitives/ui/Button'

// Cross-platform primitives (web/mobile)
export { View } from './primitives/View'
export { Text } from './primitives/Text'
export { Image } from './primitives/Image'
export { Pressable } from './primitives/Pressable'
export { ScrollView } from './primitives/ScrollView'
export { Canvas, Rect, Circle, Path, CanvasText, Line, Arc } from './primitives/canvas'
export { normalizeStyle } from './primitives/utils'

export type {
  ViewProps,
  TextProps,
  ImageProps,
  PressableProps,
  ScrollViewProps,
  CommonStyle,
  TextStyle,
  RectProps,
  CircleProps,
  PathProps,
  CanvasTextProps,
  LineProps,
  ArcProps,
  CanvasProps,
} from './primitives/types'
