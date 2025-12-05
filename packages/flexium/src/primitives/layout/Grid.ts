import { f } from '../../renderers/dom/h'
import { FNode } from '../../core/renderer'
import {
  BaseComponentProps,
  ResponsiveValue,
  stylePropsToCSS,
  mergeStyles,
  getBaseValue,
  toCSSValue,
} from './types'

export interface GridProps extends BaseComponentProps {
  /** Number of columns or column template */
  cols?: ResponsiveValue<number | string>
  /** Number of rows or row template */
  rows?: ResponsiveValue<number | string>
  /** Column gap */
  columnGap?: ResponsiveValue<number | string>
  /** Row gap */
  rowGap?: ResponsiveValue<number | string>
  /** Grid auto flow */
  flow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
  /** Auto columns size */
  autoColumns?: ResponsiveValue<string>
  /** Auto rows size */
  autoRows?: ResponsiveValue<string>
  as?: string
}

function toGridTemplate(value: number | string): string {
  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`
  }
  return value
}

/**
 * Grid - 2D layout container
 *
 * A primitive layout component based on CSS Grid.
 * Supports responsive columns, rows, gaps, and all standard grid properties.
 *
 * @example
 * ```tsx
 * // 3-column grid
 * <Grid cols={3} gap={16}>
 *   <div />
 *   <div />
 *   <div />
 * </Grid>
 * ```
 */
export function Grid(props: GridProps): FNode {
  const {
    children,
    cols,
    rows,
    columnGap,
    rowGap,
    flow,
    autoColumns,
    autoRows,
    as = 'div',
    className,
    style: userStyle,
    ...styleProps
  } = props

  const generatedStyles = stylePropsToCSS(styleProps)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridStyles: Record<string, any> = {
    display: 'grid',
  }

  const colsValue = getBaseValue(cols)
  if (colsValue !== undefined) {
    gridStyles.gridTemplateColumns = toGridTemplate(colsValue)
  }

  const rowsValue = getBaseValue(rows)
  if (rowsValue !== undefined) {
    gridStyles.gridTemplateRows = toGridTemplate(rowsValue)
  }

  const colGap = getBaseValue(columnGap)
  if (colGap !== undefined) {
    gridStyles.columnGap = toCSSValue(colGap)
  }

  const rGap = getBaseValue(rowGap)
  if (rGap !== undefined) {
    gridStyles.rowGap = toCSSValue(rGap)
  }

  if (flow) {
    gridStyles.gridAutoFlow = flow
  }

  const finalStyles = mergeStyles(
    { ...gridStyles, ...generatedStyles },
    userStyle
  )

  return f(as, { style: finalStyles, className, ...props }, children)
}
