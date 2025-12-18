import { css, cx } from 'flexium/css'
import type { ScrollProps } from './types'

/**
 * Scroll - Scrollable container component
 *
 * Creates a scrollable container with customizable scroll direction
 * and optional scrollbar hiding.
 *
 * @example
 * ```tsx
 * <Scroll direction="y" height={300}>
 *   <Column>
 *     {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 *   </Column>
 * </Scroll>
 *
 * <Scroll direction="x" width="100%" hideScrollbar>
 *   <Row gap={16}>
 *     {images.map(img => <Image key={img.id} src={img.url} />)}
 *   </Row>
 * </Scroll>
 * ```
 */
export function Scroll(props: ScrollProps) {
  const {
    direction = 'y',
    children,
    height,
    width,
    hideScrollbar = false,
    padding,
    margin,
    background,
    borderRadius,
    className,
    style,
    ...rest
  } = props

  // Determine overflow styles based on direction
  const getOverflowStyles = () => {
    switch (direction) {
      case 'x':
        return { overflowX: 'auto' as const, overflowY: 'hidden' as const }
      case 'y':
        return { overflowX: 'hidden' as const, overflowY: 'auto' as const }
      case 'both':
        return { overflow: 'auto' as const }
      default:
        return { overflowY: 'auto' as const }
    }
  }

  const scrollClass = css({
    ...getOverflowStyles(),
    ...(height !== undefined && { height }),
    ...(width !== undefined && { width }),
    ...(padding !== undefined && { padding }),
    ...(margin !== undefined && { margin }),
    ...(background && { background }),
    ...(borderRadius !== undefined && { borderRadius }),
    // Hide scrollbar styles
    ...(hideScrollbar && {
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE and Edge
      '&::-webkit-scrollbar': {
        display: 'none', // Chrome, Safari, Opera
      },
    }),
    ...style,
  })

  return (
    <div class={cx(scrollClass, className)} {...rest}>
      {children}
    </div>
  )
}
