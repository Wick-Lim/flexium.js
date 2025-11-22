/**
 * Flexium Primitives
 *
 * All primitive components for building UIs
 */

// Motion components
export * from './motion';

// Form components
export * from './form';

// UI components
export * from './ui';

// Layout components (will be added by layout system)
export * from './layout/types';

// Cross-platform primitives
export { View } from './View';
export { Text } from './Text';
export { Image } from './Image';
export { Pressable } from './Pressable';
export { ScrollView } from './ScrollView';

// Canvas primitives
export {
  Canvas,
  Rect,
  Circle,
  Path,
  CanvasText,
  Line,
  Arc,
} from './canvas';

// Cross-platform types
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
} from './types';

// Utils
export { normalizeStyle } from './utils';
