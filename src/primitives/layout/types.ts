/**
 * Responsive value type supporting base and breakpoint-specific values
 */
export type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

/**
 * Alignment values for flex containers
 */
export type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Justify content values for flex containers
 */
export type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Flex direction values
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Common style props for all layout primitives
 */
export interface StyleProps {
  // Spacing
  padding?: ResponsiveValue<number | string>;
  paddingX?: ResponsiveValue<number | string>;
  paddingY?: ResponsiveValue<number | string>;
  paddingTop?: ResponsiveValue<number | string>;
  paddingRight?: ResponsiveValue<number | string>;
  paddingBottom?: ResponsiveValue<number | string>;
  paddingLeft?: ResponsiveValue<number | string>;

  margin?: ResponsiveValue<number | string>;
  marginX?: ResponsiveValue<number | string>;
  marginY?: ResponsiveValue<number | string>;
  marginTop?: ResponsiveValue<number | string>;
  marginRight?: ResponsiveValue<number | string>;
  marginBottom?: ResponsiveValue<number | string>;
  marginLeft?: ResponsiveValue<number | string>;

  gap?: ResponsiveValue<number | string>;

  // Sizing
  width?: ResponsiveValue<number | string>;
  height?: ResponsiveValue<number | string>;
  minWidth?: ResponsiveValue<number | string>;
  maxWidth?: ResponsiveValue<number | string>;
  minHeight?: ResponsiveValue<number | string>;
  maxHeight?: ResponsiveValue<number | string>;

  // Flex
  flex?: ResponsiveValue<number | string>;
  flexGrow?: ResponsiveValue<number>;
  flexShrink?: ResponsiveValue<number>;
  flexBasis?: ResponsiveValue<number | string>;

  // Colors
  bg?: string;
  backgroundColor?: string;
  color?: string;

  // Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: ResponsiveValue<number | string>;
  borderWidth?: ResponsiveValue<number | string>;
  borderColor?: string;
  borderStyle?: string;

  // Typography
  fontSize?: ResponsiveValue<number | string>;
  fontWeight?: ResponsiveValue<number | string>;
  fontFamily?: string;
  lineHeight?: ResponsiveValue<number | string>;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: ResponsiveValue<number | string>;
  right?: ResponsiveValue<number | string>;
  bottom?: ResponsiveValue<number | string>;
  left?: ResponsiveValue<number | string>;
  zIndex?: number;

  // Display
  display?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Opacity & Visibility
  opacity?: number;
  visibility?: 'visible' | 'hidden' | 'collapse';

  // Cursor
  cursor?: string;

  // Other
  boxShadow?: string;
  transition?: string;
  transform?: string;
}

/**
 * Base component props
 */
export interface BaseComponentProps extends StyleProps {
  children?: any;
  className?: string;
  style?: CSSProperties;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
}

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Default breakpoint values (in pixels)
 */
export const defaultBreakpoints: BreakpointConfig = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

/**
 * Convert a value to CSS string (add 'px' if it's a number)
 */
export function toCSSValue(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

/**
 * Check if a value is a responsive object
 */
export function isResponsiveValue<T>(value: any): value is { base?: T; sm?: T; md?: T; lg?: T; xl?: T } {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && ('base' in value || 'sm' in value || 'md' in value || 'lg' in value || 'xl' in value);
}

/**
 * Get base value from responsive value or return value as-is
 */
export function getBaseValue<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined) return undefined;
  if (isResponsiveValue(value)) {
    return value.base ?? value.sm ?? value.md ?? value.lg ?? value.xl;
  }
  return value;
}

/**
 * CSS Properties type
 */
export interface CSSProperties {
  [key: string]: string | number | undefined;
}

/**
 * Convert style props to inline CSS styles
 * Only handles base (non-responsive) values for inline styles
 */
export function stylePropsToCSS(props: StyleProps): CSSProperties {
  const styles: CSSProperties = {};

  // Spacing - padding
  const padding = getBaseValue(props.padding);
  const paddingX = getBaseValue(props.paddingX);
  const paddingY = getBaseValue(props.paddingY);

  if (padding !== undefined) styles.padding = toCSSValue(padding);
  if (paddingX !== undefined) {
    styles.paddingLeft = toCSSValue(paddingX);
    styles.paddingRight = toCSSValue(paddingX);
  }
  if (paddingY !== undefined) {
    styles.paddingTop = toCSSValue(paddingY);
    styles.paddingBottom = toCSSValue(paddingY);
  }
  if (props.paddingTop !== undefined) styles.paddingTop = toCSSValue(getBaseValue(props.paddingTop));
  if (props.paddingRight !== undefined) styles.paddingRight = toCSSValue(getBaseValue(props.paddingRight));
  if (props.paddingBottom !== undefined) styles.paddingBottom = toCSSValue(getBaseValue(props.paddingBottom));
  if (props.paddingLeft !== undefined) styles.paddingLeft = toCSSValue(getBaseValue(props.paddingLeft));

  // Spacing - margin
  const margin = getBaseValue(props.margin);
  const marginX = getBaseValue(props.marginX);
  const marginY = getBaseValue(props.marginY);

  if (margin !== undefined) styles.margin = toCSSValue(margin);
  if (marginX !== undefined) {
    styles.marginLeft = toCSSValue(marginX);
    styles.marginRight = toCSSValue(marginX);
  }
  if (marginY !== undefined) {
    styles.marginTop = toCSSValue(marginY);
    styles.marginBottom = toCSSValue(marginY);
  }
  if (props.marginTop !== undefined) styles.marginTop = toCSSValue(getBaseValue(props.marginTop));
  if (props.marginRight !== undefined) styles.marginRight = toCSSValue(getBaseValue(props.marginRight));
  if (props.marginBottom !== undefined) styles.marginBottom = toCSSValue(getBaseValue(props.marginBottom));
  if (props.marginLeft !== undefined) styles.marginLeft = toCSSValue(getBaseValue(props.marginLeft));

  // Gap
  if (props.gap !== undefined) styles.gap = toCSSValue(getBaseValue(props.gap));

  // Sizing
  if (props.width !== undefined) styles.width = toCSSValue(getBaseValue(props.width));
  if (props.height !== undefined) styles.height = toCSSValue(getBaseValue(props.height));
  if (props.minWidth !== undefined) styles.minWidth = toCSSValue(getBaseValue(props.minWidth));
  if (props.maxWidth !== undefined) styles.maxWidth = toCSSValue(getBaseValue(props.maxWidth));
  if (props.minHeight !== undefined) styles.minHeight = toCSSValue(getBaseValue(props.minHeight));
  if (props.maxHeight !== undefined) styles.maxHeight = toCSSValue(getBaseValue(props.maxHeight));

  // Flex
  if (props.flex !== undefined) styles.flex = getBaseValue(props.flex);
  if (props.flexGrow !== undefined) styles.flexGrow = getBaseValue(props.flexGrow);
  if (props.flexShrink !== undefined) styles.flexShrink = getBaseValue(props.flexShrink);
  if (props.flexBasis !== undefined) styles.flexBasis = toCSSValue(getBaseValue(props.flexBasis));

  // Colors
  if (props.bg) styles.backgroundColor = props.bg;
  if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
  if (props.color) styles.color = props.color;

  // Border
  if (props.border) styles.border = props.border;
  if (props.borderTop) styles.borderTop = props.borderTop;
  if (props.borderRight) styles.borderRight = props.borderRight;
  if (props.borderBottom) styles.borderBottom = props.borderBottom;
  if (props.borderLeft) styles.borderLeft = props.borderLeft;
  if (props.borderRadius !== undefined) styles.borderRadius = toCSSValue(getBaseValue(props.borderRadius));
  if (props.borderWidth !== undefined) styles.borderWidth = toCSSValue(getBaseValue(props.borderWidth));
  if (props.borderColor) styles.borderColor = props.borderColor;
  if (props.borderStyle) styles.borderStyle = props.borderStyle;

  // Typography
  if (props.fontSize !== undefined) styles.fontSize = toCSSValue(getBaseValue(props.fontSize));
  if (props.fontWeight !== undefined) styles.fontWeight = getBaseValue(props.fontWeight);
  if (props.fontFamily) styles.fontFamily = props.fontFamily;
  if (props.lineHeight !== undefined) styles.lineHeight = toCSSValue(getBaseValue(props.lineHeight));
  if (props.textAlign) styles.textAlign = props.textAlign;

  // Position
  if (props.position) styles.position = props.position;
  if (props.top !== undefined) styles.top = toCSSValue(getBaseValue(props.top));
  if (props.right !== undefined) styles.right = toCSSValue(getBaseValue(props.right));
  if (props.bottom !== undefined) styles.bottom = toCSSValue(getBaseValue(props.bottom));
  if (props.left !== undefined) styles.left = toCSSValue(getBaseValue(props.left));
  if (props.zIndex !== undefined) styles.zIndex = props.zIndex;

  // Display
  if (props.display) styles.display = props.display;
  if (props.overflow) styles.overflow = props.overflow;
  if (props.overflowX) styles.overflowX = props.overflowX;
  if (props.overflowY) styles.overflowY = props.overflowY;

  // Opacity & Visibility
  if (props.opacity !== undefined) styles.opacity = props.opacity;
  if (props.visibility) styles.visibility = props.visibility;

  // Cursor
  if (props.cursor) styles.cursor = props.cursor;

  // Other
  if (props.boxShadow) styles.boxShadow = props.boxShadow;
  if (props.transition) styles.transition = props.transition;
  if (props.transform) styles.transform = props.transform;

  return styles;
}

/**
 * Merge user styles with generated styles
 */
export function mergeStyles(generatedStyles: CSSProperties, userStyle?: CSSProperties): CSSProperties {
  if (!userStyle) return generatedStyles;
  return { ...generatedStyles, ...userStyle };
}
