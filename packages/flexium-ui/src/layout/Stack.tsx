import { css, cx } from 'flexium/css'
import type { StackProps } from './types'

/**
 * Stack - Z-axis layering component
 *
 * Creates a position: relative container where children are positioned
 * absolutely for z-axis stacking. Useful for overlays, badges on avatars, etc.
 *
 * @example
 * ```tsx
 * <Stack width={100} height={100}>
 *   <Image src="avatar.jpg" />
 *   <Badge>5</Badge>
 * </Stack>
 * ```
 */
export function Stack(props: StackProps) {
  const {
    children,
    className,
    style,
    width,
    height,
    padding,
    margin,
    background,
    borderRadius,
    ...rest
  } = props

  const stackClass = css({
    position: 'relative',
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(padding !== undefined && { padding }),
    ...(margin !== undefined && { margin }),
    ...(background && { background }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...style,
  })

  const childWrapperClass = css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  })

  // Wrap children in absolute positioning containers
  const wrappedChildren = Array.isArray(children)
    ? children.map((child, index) => (
        <div key={index} class={childWrapperClass}>
          {child}
        </div>
      ))
    : children && (
        <div class={childWrapperClass}>
          {children}
        </div>
      )

  return (
    <div class={cx(stackClass, className)} {...rest}>
      {wrappedChildren}
    </div>
  )
}
