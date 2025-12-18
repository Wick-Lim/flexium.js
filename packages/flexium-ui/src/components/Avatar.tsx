import { css, cx } from 'flexium/css'
import { getTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface AvatarProps {
  /** Image source URL */
  src?: string
  /** Alt text for image */
  alt?: string
  /** Name for fallback initials */
  name?: string
  /** Avatar size - preset or custom number in pixels */
  size?: 'sm' | 'md' | 'lg' | number
  /** Avatar shape */
  shape?: 'circle' | 'square'
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}

const sizeConfig = {
  sm: 32,
  md: 40,
  lg: 48,
} as const

/**
 * Get initials from a name string
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate a consistent color from a string
 */
function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    '#f87171', // red
    '#fb923c', // orange
    '#fbbf24', // yellow
    '#34d399', // green
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#f472b6', // pink
  ]

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Avatar - User avatar component
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" size="lg" />
 * <Avatar name="Jane Smith" shape="square" size={60} />
 * ```
 */
export function Avatar(props: AvatarProps) {
  const {
    src,
    alt,
    name = '',
    size = 'md',
    shape = 'circle',
    className,
    style,
    ...rest
  } = props

  const theme = getTheme()

  // Resolve size to number
  const sizeValue = typeof size === 'number' ? size : sizeConfig[size]
  const fontSize = Math.floor(sizeValue * 0.4)

  // Base styles
  const baseStyles: StyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeValue,
    height: sizeValue,
    borderRadius: shape === 'circle' ? theme.borderRadius.full : theme.borderRadius.md,
    overflow: 'hidden',
    fontFamily: theme.typography.fontFamily,
    fontSize,
    fontWeight: theme.typography.fontWeight.medium,
    userSelect: 'none',
    flexShrink: 0,
  }

  const avatarClass = css({
    ...baseStyles,
    ...style,
  })

  // If we have an image source, render image
  if (src) {
    const imgClass = css({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    })

    return (
      <div class={cx(avatarClass, className)} {...rest}>
        <img src={src} alt={alt || name} class={imgClass} />
      </div>
    )
  }

  // Otherwise, render initials with background color
  const initials = name ? getInitials(name) : '?'
  const bgColor = name ? stringToColor(name) : theme.colors.secondary

  const fallbackClass = css({
    backgroundColor: bgColor,
    color: '#ffffff',
  })

  return (
    <div class={cx(avatarClass, fallbackClass, className)} {...rest}>
      {initials}
    </div>
  )
}
