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
} from './types'

/**
 * Props for Column component - vertical flex container
 */
export interface ColumnProps extends BaseComponentProps {
  /** Align items on cross axis (horizontal) */
  align?: ResponsiveValue<AlignItems>
  /** Justify items on main axis (vertical) */
  justify?: ResponsiveValue<JustifyContent>
  /** Enable wrapping of items */
  wrap?: ResponsiveValue<boolean>
  /** Reverse the direction */
  reverse?: boolean
  /** HTML element to render */
  as?: string
}

/**
 * Map justify shorthand to CSS value
 */
function mapJustifyContent(value: JustifyContent): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }
  return map[value] || value
}

/**
 * Map align shorthand to CSS value
 */
function mapAlignItems(value: AlignItems): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  }
  return map[value] || value
}

/**
 * Column - Vertical flex container
 *
 * A primitive layout component for arranging children in a vertical column
 * using flexbox. Supports alignment, justification, and responsive props.
 *
 * @example
 * ```tsx
 * <Column gap={8} padding={16}>
 *   <div>Top</div>
 *   <div>Bottom</div>
 * </Column>
 * ```
 *
 * @example
 * ```tsx
 * // Center content vertically and horizontally
 * <Column align="center" justify="center" height="100vh">
 *   <h1>Centered Content</h1>
 * </Column>
 * ```
 */
export function Column(props: ColumnProps): FNode {
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
    flexDirection: reverse ? 'column-reverse' : 'column',
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
