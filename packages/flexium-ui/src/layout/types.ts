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
