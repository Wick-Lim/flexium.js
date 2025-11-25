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

// Layout components
export {
  Row,
  Column,
  Spacer,
  Grid,
  Stack,
} from './layout';

export type {
  RowProps,
  ColumnProps,
  SpacerProps,
  GridProps,
  StackProps,
  CommonStyle as BaseStyleProps,
} from './layout';


// Cross-platform primitives
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
