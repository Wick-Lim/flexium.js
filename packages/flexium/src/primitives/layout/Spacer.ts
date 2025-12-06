import { f } from '../../renderers/dom/f'
import { FNode } from '../../core/renderer'
import {
  BaseComponentProps,
  ResponsiveValue,
  stylePropsToCSS,
  mergeStyles,
  getBaseValue,
  toCSSValue,
} from './types'

export interface SpacerProps extends BaseComponentProps {
  /** Size on main axis (width for Row, height for Column) */
  size?: ResponsiveValue<number | string>
  /** Explicit width */
  width?: ResponsiveValue<number | string>
  /** Explicit height */
  height?: ResponsiveValue<number | string>
  /** Flex grow factor (defaults to 1 if no size specified) */
  flex?: ResponsiveValue<number>
  /** HTML element to render */
  as?: string
}

/**
 * Spacer - Flexible spacing component
 *
 * Used to create space between elements or push elements apart.
 * By default, it grows to fill available space using flex: 1.
 * Can be used in both horizontal (Row) and vertical (Column) layouts.
 *
 * @example
 * ```tsx
 * <Row>
 *   <Text>Left</Text>
 *   <Spacer />
 *   <Text>Right</Text>
 * </Row>
 * ```
 */
export function Spacer(props: SpacerProps): FNode {
  const {
    size,
    width,
    height,
    flex,
    as = 'div',
    class: className,
    style: userStyle,
    ...styleProps
  } = props

  const generatedStyles = stylePropsToCSS(styleProps)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: Record<string, any> = {
    display: 'flex',
  }

  // If explicit size provided, use it
  const sizeVal = getBaseValue(size)
  if (sizeVal !== undefined) {
    styles.flexBasis = toCSSValue(sizeVal)
    styles.flexGrow = 0
    styles.flexShrink = 0
  } else {
    // Otherwise check width/height
    const w = getBaseValue(width)
    const h = getBaseValue(height)

    if (w !== undefined || h !== undefined) {
      if (w !== undefined) styles.width = toCSSValue(w)
      if (h !== undefined) styles.height = toCSSValue(h)
      styles.flexGrow = 0
      styles.flexShrink = 0
    } else {
      // If no size at all, act as flexible spacer
      styles.flexGrow = getBaseValue(flex) ?? 1
    }
  }

  const finalStyles = mergeStyles({ ...styles, ...generatedStyles }, userStyle)

  return f(as, { style: finalStyles, class: className, ...props }, [])
}
