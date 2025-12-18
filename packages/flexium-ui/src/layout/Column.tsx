import { css, cx } from 'flexium/css'
import type { ColumnProps, MainAxisAlignment, CrossAxisAlignment } from './types'

/**
 * Map alignment values to CSS
 */
function mapMainAlignment(align?: MainAxisAlignment): string | undefined {
  if (!align) return undefined
  const map: Record<MainAxisAlignment, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly',
  }
  return map[align]
}

function mapCrossAlignment(align?: CrossAxisAlignment): string | undefined {
  if (!align) return undefined
  const map: Record<CrossAxisAlignment, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
    baseline: 'baseline',
  }
  return map[align]
}

/**
 * Column - Vertical flex container
 *
 * @example
 * ```tsx
 * <Column gap={16} mainAxisAlignment="center">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Column>
 * ```
 */
export function Column(props: ColumnProps) {
  const {
    flex,
    gap,
    padding,
    margin,
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    overflow,
    background,
    borderRadius,
    mainAxisAlignment,
    crossAxisAlignment,
    className,
    style,
    children,
    ...rest
  } = props

  const columnClass = css({
    display: 'flex',
    flexDirection: 'column',
    ...(flex !== undefined && { flex }),
    ...(gap !== undefined && { gap }),
    ...(padding !== undefined && { padding }),
    ...(margin !== undefined && { margin }),
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minWidth !== undefined && { minWidth }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(minHeight !== undefined && { minHeight }),
    ...(maxHeight !== undefined && { maxHeight }),
    ...(overflow && { overflow }),
    ...(background && { background }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...(mainAxisAlignment && { justifyContent: mapMainAlignment(mainAxisAlignment) }),
    ...(crossAxisAlignment && { alignItems: mapCrossAlignment(crossAxisAlignment) }),
    ...style,
  })

  return (
    <div class={cx(columnClass, className)} {...rest}>
      {children}
    </div>
  )
}
