import { h, isVNode } from '../../renderers/dom/h';
import { VNode } from '../../core/renderer';
import { BaseComponentProps, AlignItems, JustifyContent, ResponsiveValue, stylePropsToCSS, mergeStyles, getBaseValue } from './types';

/**
 * Props for Stack component - layered positioning
 */
export interface StackProps extends BaseComponentProps {
  /** Align items on cross axis */
  align?: ResponsiveValue<AlignItems>;
  /** Justify items on main axis */
  justify?: ResponsiveValue<JustifyContent>;
  /** HTML element to render */
  as?: string;
}

/**
 * Map justify shorthand to CSS value
 */
function mapJustifyContent(value: JustifyContent): string {
  const map: Record<JustifyContent, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };
  return map[value] || value;
}

/**
 * Map align shorthand to CSS value
 */
function mapAlignItems(value: AlignItems): string {
  const map: Record<AlignItems, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };
  return map[value] || value;
}

/**
 * Stack - Layered positioning container
 *
 * A primitive layout component for layering children on top of each other.
 * Uses CSS Grid for perfect overlap and supports alignment/justification.
 * All children are positioned in the same grid cell, creating a z-index stack.
 *
 * @example
 * ```tsx
 * <Stack>
 *   <Image src="background.jpg" />
 *   <Text color="white">Overlay text</Text>
 * </Stack>
 * ```
 *
 * @example
 * ```tsx
 * // Center overlay content
 * <Stack align="center" justify="center" height={400}>
 *   <Image src="hero.jpg" />
 *   <Column gap={16} zIndex={1}>
 *     <h1>Hero Title</h1>
 *     <Button>Call to Action</Button>
 *   </Column>
 * </Stack>
 * ```
 */
export function Stack(props: StackProps): VNode {
  const {
    children,
    align,
    justify,
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

  // Build stack container styles using CSS Grid
  const stackStyles: Record<string, any> = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
  };

  // Handle alignment
  const alignValue = getBaseValue(align);
  if (alignValue) {
    stackStyles.alignItems = mapAlignItems(alignValue);
  }

  // Handle justification
  const justifyValue = getBaseValue(justify);
  if (justifyValue) {
    stackStyles.justifyItems = mapJustifyContent(justifyValue);
  }

  // Merge all styles
  const finalStyles = mergeStyles(
    { ...stackStyles, ...generatedStyles },
    userStyle
  );

  // Process children to ensure they're all in the same grid cell
  const childrenArray = Array.isArray(children) ? children : [children];
  const wrappedChildren = childrenArray.map((child: any) => {
    if (!isVNode(child)) return child;

    // Apply grid positioning to ensure all children stack
    const childStyle = {
      gridColumn: '1',
      gridRow: '1',
      ...(child.props?.style || {}),
    };

    // Clone the VNode with updated style
    return {
      ...child,
      props: {
        ...child.props,
        style: childStyle,
      },
    };
  });

  // Create element
  return h(
    as,
    {
      style: finalStyles,
      className,
      id,
      role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      onClick,
      onMouseEnter,
      onMouseLeave,
    },
    ...wrappedChildren
  );
}
