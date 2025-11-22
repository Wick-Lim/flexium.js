import { h } from '../../renderers/dom/h';
import { VNode } from '../../core/renderer';
import { BaseComponentProps, ResponsiveValue, stylePropsToCSS, mergeStyles, getBaseValue } from './types';

/**
 * Props for Spacer component - flexible spacing
 */
export interface SpacerProps extends Omit<BaseComponentProps, 'children'> {
  /** Size of spacer (defaults to flex: 1 if not specified) */
  size?: ResponsiveValue<number | string>;
  /** Minimum size */
  minSize?: ResponsiveValue<number | string>;
  /** Maximum size */
  maxSize?: ResponsiveValue<number | string>;
  /** Direction of the spacer (horizontal or vertical) */
  direction?: 'horizontal' | 'vertical';
  /** HTML element to render */
  as?: string;
}

/**
 * Spacer - Flexible spacing component
 *
 * A primitive component that creates flexible space between elements.
 * By default, it grows to fill available space using flex: 1.
 * Can be used in both horizontal (Row) and vertical (Column) layouts.
 *
 * @example
 * ```tsx
 * // Push button to the right
 * <Row>
 *   <Button>Left</Button>
 *   <Spacer />
 *   <Button>Right</Button>
 * </Row>
 * ```
 *
 * @example
 * ```tsx
 * // Fixed size spacer
 * <Column>
 *   <Header />
 *   <Spacer size={32} />
 *   <Content />
 * </Column>
 * ```
 *
 * @example
 * ```tsx
 * // Spacer with min/max constraints
 * <Row>
 *   <Sidebar />
 *   <Spacer minSize={16} maxSize={64} />
 *   <Main />
 * </Row>
 * ```
 */
export function Spacer(props: SpacerProps): VNode {
  const {
    size,
    minSize,
    maxSize,
    direction = 'horizontal',
    as = 'div',
    className,
    style: userStyle,
    // Base component props
    id,
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    onClick,
    onMouseEnter,
    onMouseLeave,
    // Extract style props
    ...styleProps
  } = props;

  // Generate styles from style props
  const generatedStyles = stylePropsToCSS(styleProps);

  // Build spacer styles
  const spacerStyles: Record<string, any> = {};

  // Handle size
  const sizeValue = getBaseValue(size);
  if (sizeValue !== undefined) {
    if (typeof sizeValue === 'number') {
      // Numeric size means fixed dimension
      if (direction === 'horizontal') {
        spacerStyles.width = `${sizeValue}px`;
        spacerStyles.flexShrink = 0;
      } else {
        spacerStyles.height = `${sizeValue}px`;
        spacerStyles.flexShrink = 0;
      }
    } else if (typeof sizeValue === 'string') {
      // String size can be any CSS value
      if (direction === 'horizontal') {
        spacerStyles.width = sizeValue;
      } else {
        spacerStyles.height = sizeValue;
      }
    }
  } else {
    // Default: flexible spacer that grows
    spacerStyles.flex = 1;
  }

  // Handle min size
  const minSizeValue = getBaseValue(minSize);
  if (minSizeValue !== undefined) {
    const minValue = typeof minSizeValue === 'number' ? `${minSizeValue}px` : minSizeValue;
    if (direction === 'horizontal') {
      spacerStyles.minWidth = minValue;
    } else {
      spacerStyles.minHeight = minValue;
    }
  }

  // Handle max size
  const maxSizeValue = getBaseValue(maxSize);
  if (maxSizeValue !== undefined) {
    const maxValue = typeof maxSizeValue === 'number' ? `${maxSizeValue}px` : maxSizeValue;
    if (direction === 'horizontal') {
      spacerStyles.maxWidth = maxValue;
    } else {
      spacerStyles.maxHeight = maxValue;
    }
  }

  // Ensure proper behavior in flex containers
  if (!spacerStyles.flexShrink) {
    spacerStyles.flexShrink = 1;
  }

  // Merge all styles
  const finalStyles = mergeStyles(
    { ...spacerStyles, ...generatedStyles },
    userStyle
  );

  // Create element
  return h(as, {
    style: finalStyles,
    className,
    id,
    role: role || 'presentation',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    onClick,
    onMouseEnter,
    onMouseLeave,
  });
}
