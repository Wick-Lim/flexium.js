import { css, cx } from 'flexium/css'
import { useTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface CardProps {
  /** Card content */
  children?: any
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Shadow elevation */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** Background color */
  background?: string
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}

/**
 * Card - Container component with elevation
 *
 * @example
 * ```tsx
 * <Card shadow="md" padding="lg">
 *   <Text variant="h3">Card Title</Text>
 *   <Text>Card content goes here</Text>
 * </Card>
 * ```
 */
export function Card(props: CardProps) {
  const {
    children,
    padding = 'md',
    shadow = 'sm',
    borderRadius = 'md',
    background,
    className,
    style,
    ...rest
  } = props

  const theme = useTheme()

  // Resolve padding
  const paddingValue = padding === 'none' ? 0 : theme.spacing[padding]

  // Resolve shadow
  const shadowValue = theme.shadows[shadow]

  // Resolve border radius
  const borderRadiusValue = theme.borderRadius[borderRadius]

  // Resolve background
  const backgroundColor = background || theme.colors.surface

  const cardClass = css({
    padding: paddingValue,
    boxShadow: shadowValue,
    borderRadius: borderRadiusValue,
    backgroundColor,
    ...style,
  })

  return (
    <div class={cx(cardClass, className)} {...rest}>
      {children}
    </div>
  )
}
