import type { StyleObject } from 'flexium/css'

/**
 * Common flex properties for Column/Row
 */
export interface FlexProps {
  /** Flex grow/shrink value */
  flex?: number | string
  /** Gap between children */
  gap?: number | string
  /** Padding */
  padding?: number | string
  /** Margin */
  margin?: number | string
  /** Width */
  width?: number | string
  /** Height */
  height?: number | string
  /** Min width */
  minWidth?: number | string
  /** Max width */
  maxWidth?: number | string
  /** Min height */
  minHeight?: number | string
  /** Max height */
  maxHeight?: number | string
  /** Overflow behavior */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  /** Background color */
  background?: string
  /** Border radius */
  borderRadius?: number | string
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Children */
  children?: any
}

/**
 * Main axis alignment (justify-content)
 */
export type MainAxisAlignment =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

/**
 * Cross axis alignment (align-items)
 */
export type CrossAxisAlignment =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'baseline'

/**
 * Column props (vertical layout)
 */
export interface ColumnProps extends FlexProps {
  /** Main axis alignment (vertical) */
  mainAxisAlignment?: MainAxisAlignment
  /** Cross axis alignment (horizontal) */
  crossAxisAlignment?: CrossAxisAlignment
}

/**
 * Row props (horizontal layout)
 */
export interface RowProps extends FlexProps {
  /** Main axis alignment (horizontal) */
  mainAxisAlignment?: MainAxisAlignment
  /** Cross axis alignment (vertical) */
  crossAxisAlignment?: CrossAxisAlignment
  /** Wrap children */
  wrap?: boolean
}

/**
 * Stack props (z-axis layering)
 */
export interface StackProps {
  /** Children to stack */
  children?: any
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Width */
  width?: number | string
  /** Height */
  height?: number | string
  /** Padding */
  padding?: number | string
  /** Margin */
  margin?: number | string
  /** Background color */
  background?: string
  /** Border radius */
  borderRadius?: number | string
}

/**
 * Divider props
 */
export interface DividerProps {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical'
  /** Color of the divider */
  color?: string
  /** Thickness of the divider */
  thickness?: number | string
  /** Margin around the divider */
  margin?: number | string
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}

/**
 * Scroll props
 */
export interface ScrollProps {
  /** Scroll direction */
  direction?: 'x' | 'y' | 'both'
  /** Children to render */
  children?: any
  /** Height of the scroll container */
  height?: number | string
  /** Width of the scroll container */
  width?: number | string
  /** Hide scrollbar */
  hideScrollbar?: boolean
  /** Padding */
  padding?: number | string
  /** Margin */
  margin?: number | string
  /** Background color */
  background?: string
  /** Border radius */
  borderRadius?: number | string
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}
