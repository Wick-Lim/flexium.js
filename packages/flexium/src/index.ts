/**
 * Flexium - Next-generation UI/UX library
 *
 * Core exports for signal-based reactivity system
 */

// Core reactivity primitives
export { signal, computed, effect, batch, untrack, root, isSignal } from './core/signal'
export type { Signal, Computed } from './core/signal'

// Cross-platform primitives
export {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Canvas,
  Rect,
  Circle,
  Path,
  CanvasText,
  Line,
  Arc,
  normalizeStyle,
} from './primitives'

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
} from './primitives'
