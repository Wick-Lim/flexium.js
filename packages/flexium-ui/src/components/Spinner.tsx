import { css, cx, keyframes } from 'flexium/css'
import { useTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg'
  /** Spinner color */
  color?: 'primary' | 'secondary' | string
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 40,
} as const

const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

/**
 * Spinner - Loading spinner component
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="primary" />
 * <Spinner color="#ff0000" />
 * ```
 */
export function Spinner(props: SpinnerProps) {
  const {
    size = 'md',
    color = 'primary',
    className,
    style,
    ...rest
  } = props

  const theme = useTheme()

  // Resolve size
  const spinnerSize = sizeMap[size]
  const borderWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4

  // Resolve color
  let spinnerColor: string
  if (color === 'primary') {
    spinnerColor = theme.colors.primary
  } else if (color === 'secondary') {
    spinnerColor = theme.colors.secondary
  } else {
    spinnerColor = color
  }

  const spinnerClass = css({
    width: spinnerSize,
    height: spinnerSize,
    border: `${borderWidth}px solid ${spinnerColor}20`,
    borderTop: `${borderWidth}px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: `${spinAnimation} 0.8s linear infinite`,
    ...style,
  })

  return (
    <div class={cx(spinnerClass, className)} {...rest} />
  )
}
