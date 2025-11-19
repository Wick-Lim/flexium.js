/**
 * Layout Primitives
 *
 * Core layout components for building flexible, responsive interfaces.
 * All components use inline styles and support responsive props.
 */

// Export components
export { Row } from './Row';
export { Column } from './Column';
export { Stack } from './Stack';
export { Grid } from './Grid';
export { Spacer } from './Spacer';

// Export types
export type { RowProps } from './Row';
export type { ColumnProps } from './Column';
export type { StackProps } from './Stack';
export type { GridProps } from './Grid';
export type { SpacerProps } from './Spacer';

// Export shared types
export type {
  StyleProps,
  BaseComponentProps,
  ResponsiveValue,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BreakpointConfig,
  CSSProperties,
} from './types';

export {
  defaultBreakpoints,
  toCSSValue,
  isResponsiveValue,
  getBaseValue,
  stylePropsToCSS,
  mergeStyles,
} from './types';
