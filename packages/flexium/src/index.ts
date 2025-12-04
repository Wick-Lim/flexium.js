/**
 * Flexium - Next-generation UI/UX library
 *
 * Core exports for signal-based reactivity system
 */

// Core reactivity primitives (public API - minimal surface)
export { effect, onMount } from './core/signal'
import { state as coreState, clearGlobalState } from './core/state'
import { StateGetter, StateSetter } from './core/state'
import { For } from './core/flow'

// Enhanced state function with .map helper
function state<T>(
  initialValueOrFetcher: T | ((...args: any[]) => T | Promise<T>), 
  options?: { key?: string }
): [StateGetter<T>, StateSetter<T>] {
  const [getter, setter] = coreState(initialValueOrFetcher, options);
  
  // Inject .map for list rendering optimization
  // Usage: { list.map(item => <div>{item}</div>) }
  (getter as any).map = (renderFn: (item: T extends (infer U)[] ? U : any, index: () => number) => any) => {
    // Return a VNode for <For>
    return {
        type: For,
        props: { each: getter },
        children: [renderFn],
        key: null
    };
  };
  
  return [getter, setter];
}

export { state, clearGlobalState }
export { For, Show, Switch, Match } from './core/flow'
export { Suspense } from './core/suspense'
export { ErrorBoundary, useErrorBoundary } from './core/error-boundary'
export { Portal } from './renderers/dom/portal'
// Export types
export type { StateGetter, StateSetter } from './core/state'

// Context
export { createContext, useContext } from './core/context'
export type { Context } from './core/context'

// Router
export * from './router'
export { Outlet } from './router/components' // Explicitly export Outlet if not covered by *



// Cross-platform primitives
export {
  Row,
  Column,
  Spacer,
  Grid,
  Stack,
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
  RowProps,
  ColumnProps,
  SpacerProps,
  GridProps,
  StackProps,
  BaseStyleProps,
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
