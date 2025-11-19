import { h } from '../../renderers/dom/h';
import { VNode } from '../../core/renderer';
import { BaseComponentProps, ResponsiveValue, stylePropsToCSS, mergeStyles, getBaseValue, toCSSValue } from './types';

/**
 * Props for Grid component - CSS Grid container
 */
export interface GridProps extends BaseComponentProps {
  /** Number of columns or column template */
  cols?: ResponsiveValue<number | string>;
  /** Number of rows or row template */
  rows?: ResponsiveValue<number | string>;
  /** Column gap */
  columnGap?: ResponsiveValue<number | string>;
  /** Row gap */
  rowGap?: ResponsiveValue<number | string>;
  /** Grid auto-flow direction */
  flow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  /** Auto columns size */
  autoColumns?: ResponsiveValue<string>;
  /** Auto rows size */
  autoRows?: ResponsiveValue<string>;
  /** Template areas */
  areas?: string;
  /** Align items in their grid areas */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify items in their grid areas */
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Align content within the grid */
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';
  /** Justify content within the grid */
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';
  /** HTML element to render */
  as?: string;
}

/**
 * Convert cols/rows value to CSS grid template
 */
function toGridTemplate(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`;
  }
  return value;
}

/**
 * Map alignment/justification shorthand to CSS value
 */
function mapAlignJustify(value: string): string {
  const map: Record<string, string> = {
    start: 'start',
    center: 'center',
    end: 'end',
    stretch: 'stretch',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };
  return map[value] || value;
}

/**
 * Grid - CSS Grid container
 *
 * A primitive layout component for creating grid-based layouts using CSS Grid.
 * Supports responsive columns, rows, gaps, and all standard grid properties.
 *
 * @example
 * ```tsx
 * // 3-column grid
 * <Grid cols={3} gap={16}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * ```
 *
 * @example
 * ```tsx
 * // Responsive grid
 * <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * ```
 *
 * @example
 * ```tsx
 * // Custom template
 * <Grid cols="200px 1fr 200px" rows="auto 1fr auto" gap={16}>
 *   <Header />
 *   <Sidebar />
 *   <Main />
 *   <Footer />
 * </Grid>
 * ```
 */
export function Grid(props: GridProps): VNode {
  const {
    children,
    cols,
    rows,
    columnGap,
    rowGap,
    flow,
    autoColumns,
    autoRows,
    areas,
    alignItems,
    justifyItems,
    alignContent,
    justifyContent,
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

  // Build grid container styles
  const gridStyles: Record<string, any> = {
    display: 'grid',
  };

  // Handle columns
  const colsValue = getBaseValue(cols);
  if (colsValue !== undefined) {
    gridStyles.gridTemplateColumns = toGridTemplate(colsValue);
  }

  // Handle rows
  const rowsValue = getBaseValue(rows);
  if (rowsValue !== undefined) {
    gridStyles.gridTemplateRows = toGridTemplate(rowsValue);
  }

  // Handle gaps
  const columnGapValue = getBaseValue(columnGap);
  if (columnGapValue !== undefined) {
    gridStyles.columnGap = toCSSValue(columnGapValue);
  }

  const rowGapValue = getBaseValue(rowGap);
  if (rowGapValue !== undefined) {
    gridStyles.rowGap = toCSSValue(rowGapValue);
  }

  // Handle auto flow
  if (flow) {
    gridStyles.gridAutoFlow = flow;
  }

  // Handle auto columns/rows
  const autoColumnsValue = getBaseValue(autoColumns);
  if (autoColumnsValue !== undefined) {
    gridStyles.gridAutoColumns = autoColumnsValue;
  }

  const autoRowsValue = getBaseValue(autoRows);
  if (autoRowsValue !== undefined) {
    gridStyles.gridAutoRows = autoRowsValue;
  }

  // Handle template areas
  if (areas) {
    gridStyles.gridTemplateAreas = areas;
  }

  // Handle alignment
  if (alignItems) {
    gridStyles.alignItems = mapAlignJustify(alignItems);
  }

  if (justifyItems) {
    gridStyles.justifyItems = mapAlignJustify(justifyItems);
  }

  if (alignContent) {
    gridStyles.alignContent = mapAlignJustify(alignContent);
  }

  if (justifyContent) {
    gridStyles.justifyContent = mapAlignJustify(justifyContent);
  }

  // Merge all styles
  const finalStyles = mergeStyles(
    { ...gridStyles, ...generatedStyles },
    userStyle
  );

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
    children
  );
}
