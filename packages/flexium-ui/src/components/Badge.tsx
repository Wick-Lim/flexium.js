import { css, cx } from 'flexium/css'
import { useTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface BadgeProps {
  /** Badge content - string or number */
  content?: string | number
  /** Badge color */
  color?: 'primary' | 'secondary' | 'error'
  /** Badge size */
  size?: 'sm' | 'md' | 'lg'
  /** Dot mode - show only a dot without content */
  dot?: boolean
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}

const sizeStyles = {
  sm: {
    height: 16,
    minWidth: 16,
    fontSize: 10,
    padding: '0 4px',
  },
  md: {
    height: 20,
    minWidth: 20,
    fontSize: 12,
    padding: '0 6px',
  },
  lg: {
    height: 24,
    minWidth: 24,
    fontSize: 14,
    padding: '0 8px',
  },
} as const

const dotSizeStyles = {
  sm: 8,
  md: 10,
  lg: 12,
} as const

/**
 * Badge - Badge/counter component
 *
 * @example
 * ```tsx
 * <Badge content={5} />
 * <Badge content="NEW" color="primary" />
 * <Badge dot color="error" />
 * <Badge content={99} size="lg" />
 * ```
 */
export function Badge(props: BadgeProps) {
  const {
    content,
    color = 'primary',
    size = 'md',
    dot = false,
    className,
    style,
    ...rest
  } = props

  const theme = useTheme()

  // Get color from theme
  const themeColor = color === 'primary'
    ? theme.colors.primary
    : color === 'secondary'
      ? theme.colors.secondary
      : theme.colors.error

  // Dot mode
  if (dot) {
    const dotSize = dotSizeStyles[size]
    const dotClass = css({
      display: 'inline-block',
      width: dotSize,
      height: dotSize,
      borderRadius: theme.borderRadius.full,
      backgroundColor: themeColor,
      flexShrink: 0,
      ...style,
    })

    return <span class={cx(dotClass, className)} {...rest} />
  }

  // Regular badge mode
  const sizeConfig = sizeStyles[size]

  const badgeClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizeConfig.height,
    minWidth: sizeConfig.minWidth,
    padding: sizeConfig.padding,
    borderRadius: theme.borderRadius.full,
    backgroundColor: themeColor,
    color: '#ffffff',
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    flexShrink: 0,
    ...style,
  })

  return (
    <span class={cx(badgeClass, className)} {...rest}>
      {content}
    </span>
  )
}
