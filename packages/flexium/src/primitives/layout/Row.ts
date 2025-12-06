import { f } from '../../renderers/dom/h'
import { FNode } from '../../core/renderer'
import {
  BaseComponentProps,
  AlignItems,
  JustifyContent,
  ResponsiveValue,
  stylePropsToCSS,
  mergeStyles,
  getBaseValue,
  mapJustifyContent,
  mapAlignItems,
} from './types'

/**
 * Props for Row component - horizontal flex container
 */
export interface RowProps extends BaseComponentProps {
  /** Align items on cross axis (vertical) */
  align?: ResponsiveValue<AlignItems>
  /** Justify items on main axis (horizontal) */
  justify?: ResponsiveValue<JustifyContent>
  /** Enable wrapping of items */
  wrap?: ResponsiveValue<boolean>
  /** Reverse the direction */
  reverse?: boolean
  /** HTML element to render */
  as?: string
}

/**
 * Row - Horizontal flex container
 *
 * A primitive layout component for arranging children in a horizontal row
 * using flexbox. Supports alignment, justification, and responsive props.
 *
 * @example
 * ```tsx
 * <Row gap={16} align="center" justify="between">
 *   <div>Left</div>
 *   <div>Right</div>
 * </Row>
 * ```
 *
 * @example
 * ```tsx
 * // Responsive gap
 * <Row gap={{ base: 8, md: 16, lg: 24 }}>
 *   <Button>One</Button>
 *   <Button>Two</Button>
 * </Row>
 * ```
 */
export function Row(props: RowProps): FNode {
  const {
    children,
    align,
    justify,
    wrap,
    reverse = false,
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
  } = props

  // Generate styles from style props
  const generatedStyles = stylePropsToCSS(styleProps)

  // Build flex container styles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flexStyles: Record<string, any> = {
    display: 'flex',
    flexDirection: reverse ? 'row-reverse' : 'row',
  }

  // Handle alignment
  const alignValue = getBaseValue(align)
  if (alignValue) {
    flexStyles.alignItems = mapAlignItems(alignValue as AlignItems)
  }

  // Handle justification
  const justifyValue = getBaseValue(justify)
  if (justifyValue) {
    flexStyles.justifyContent = mapJustifyContent(
      justifyValue as JustifyContent
    )
  }

  // Handle wrap
  const wrapValue = getBaseValue(wrap)
  if (wrapValue) {
    flexStyles.flexWrap = 'wrap'
  }

  // Merge all styles
  const finalStyles = mergeStyles(
    { ...flexStyles, ...generatedStyles },
    userStyle
  )

  // Create element
  return f(
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
    children
  )
}
