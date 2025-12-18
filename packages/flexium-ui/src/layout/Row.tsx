import { css, cx } from 'flexium/css'
import type { RowProps, MainAxisAlignment, CrossAxisAlignment } from './types'

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
 * Row - Horizontal flex container
 *
 * @example
 * ```tsx
 * <Row gap={16} mainAxisAlignment="space-between">
 *   <Button>Cancel</Button>
 *   <Button>Save</Button>
 * </Row>
 * ```
 */
export function Row(props: RowProps) {
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
    wrap,
    className,
    style,
    children,
    ...rest
  } = props

  const rowClass = css({
    display: 'flex',
    flexDirection: 'row',
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
    ...(wrap && { flexWrap: 'wrap' }),
    ...style,
  })

  return (
    <div class={cx(rowClass, className)} {...rest}>
      {children}
    </div>
  )
}
