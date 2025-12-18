import { css, cx } from 'flexium/css'
import { getTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface ButtonProps {
  /** Button variant */
  variant?: 'filled' | 'outlined' | 'text'
  /** Button color */
  color?: 'primary' | 'secondary' | 'error'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Full width button */
  fullWidth?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Click handler */
  onClick?: (e: Event) => void
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Children */
  children?: any
}

const sizeStyles = {
  sm: { paddingX: 12, paddingY: 6, fontSize: 'sm' },
  md: { paddingX: 16, paddingY: 8, fontSize: 'md' },
  lg: { paddingX: 24, paddingY: 12, fontSize: 'lg' },
} as const

/**
 * Button - Interactive button component
 *
 * @example
 * ```tsx
 * <Button onClick={() => console.log('clicked')}>Click me</Button>
 * <Button variant="outlined" color="secondary">Cancel</Button>
 * <Button variant="text" size="sm">Learn more</Button>
 * ```
 */
export function Button(props: ButtonProps) {
  const {
    variant = 'filled',
    color = 'primary',
    size = 'md',
    fullWidth,
    disabled,
    onClick,
    type = 'button',
    className,
    style,
    children,
    ...rest
  } = props

  const theme = getTheme()
  const sizeConfig = sizeStyles[size]

  // Get color from theme
  const themeColor = color === 'primary'
    ? theme.colors.primary
    : color === 'secondary'
      ? theme.colors.secondary
      : theme.colors.error

  // Base styles
  const baseStyles: StyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize[sizeConfig.fontSize as keyof typeof theme.typography.fontSize],
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: 1,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s, opacity 0.2s',
    padding: `${sizeConfig.paddingY}px ${sizeConfig.paddingX}px`,
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.5 }),
  }

  // Variant-specific styles
  let variantStyles: StyleObject = {}

  if (variant === 'filled') {
    variantStyles = {
      backgroundColor: themeColor,
      color: '#ffffff',
      '&:hover': disabled ? {} : {
        opacity: 0.9,
      },
      '&:active': disabled ? {} : {
        opacity: 0.8,
      },
    }
  } else if (variant === 'outlined') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: themeColor,
      border: `1px solid ${themeColor}`,
      '&:hover': disabled ? {} : {
        backgroundColor: `${themeColor}10`,
      },
      '&:active': disabled ? {} : {
        backgroundColor: `${themeColor}20`,
      },
    }
  } else if (variant === 'text') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: themeColor,
      '&:hover': disabled ? {} : {
        backgroundColor: `${themeColor}10`,
      },
      '&:active': disabled ? {} : {
        backgroundColor: `${themeColor}20`,
      },
    }
  }

  const buttonClass = css({
    ...baseStyles,
    ...variantStyles,
    ...style,
  })

  return (
    <button
      type={type}
      class={cx(buttonClass, className)}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
