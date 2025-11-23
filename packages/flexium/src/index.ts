/**
 * Flexium - Next-generation UI/UX library
 *
 * Core exports for signal-based reactivity system
 */

// Core reactivity primitives
export { signal, computed, effect, batch, untrack, root, isSignal, onCleanup, createResource } from './core/signal'
export type { Signal, Computed, Resource } from './core/signal'

// Context
export { createContext, useContext } from './core/context'
export type { Context } from './core/context'

// Router
export * from './router'

// Store
export * from './store'

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
