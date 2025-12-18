import { css, cx } from 'flexium/css'
import type { DividerProps } from './types'

/**
 * Divider - Separator line component
 *
 * Creates a horizontal or vertical separator line.
 * Horizontal dividers span full width, vertical dividers span full height.
 *
 * @example
 * ```tsx
 * <Column>
 *   <Text>Section 1</Text>
 *   <Divider />
 *   <Text>Section 2</Text>
 * </Column>
 *
 * <Row>
 *   <Text>Left</Text>
 *   <Divider orientation="vertical" />
 *   <Text>Right</Text>
 * </Row>
 * ```
 */
export function Divider(props: DividerProps) {
  const {
    orientation = 'horizontal',
    color = '#e0e0e0',
    thickness = 1,
    margin,
    className,
    style,
    ...rest
  } = props

  const isHorizontal = orientation === 'horizontal'

  const dividerClass = css({
    border: 'none',
    backgroundColor: color,
    ...(isHorizontal
      ? {
          width: '100%',
          height: thickness,
          marginTop: margin,
          marginBottom: margin,
        }
      : {
          width: thickness,
          height: '100%',
          marginLeft: margin,
          marginRight: margin,
        }),
    ...style,
  })

  return <div class={cx(dividerClass, className)} {...rest} />
}
