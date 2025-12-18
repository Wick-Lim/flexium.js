import { css, cx } from 'flexium/css'
import { getTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface TextProps {
  /** Text variant */
  variant?: 'body' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4'
  /** Text color */
  color?: 'primary' | 'secondary' | 'disabled' | string
  /** Font weight */
  weight?: 'normal' | 'medium' | 'bold'
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Make text non-selectable */
  noSelect?: boolean
  /** Truncate text with ellipsis */
  truncate?: boolean
  /** Number of lines to show (requires truncate) */
  lines?: number
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Children */
  children?: any
}

type VariantConfig = {
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  lineHeight: 'tight' | 'normal' | 'relaxed'
  weight?: 'normal' | 'medium' | 'bold'
}

const variantStyles: Record<TextProps['variant'] & string, VariantConfig> = {
  body: { fontSize: 'md', lineHeight: 'normal' },
  caption: { fontSize: 'sm', lineHeight: 'normal' },
  h1: { fontSize: 'xl', lineHeight: 'tight', weight: 'bold' },
  h2: { fontSize: 'lg', lineHeight: 'tight', weight: 'bold' },
  h3: { fontSize: 'md', lineHeight: 'tight', weight: 'bold' },
  h4: { fontSize: 'sm', lineHeight: 'tight', weight: 'medium' },
}

/**
 * Text - Typography component
 *
 * @example
 * ```tsx
 * <Text variant="h1">Hello World</Text>
 * <Text color="secondary">Subtitle</Text>
 * <Text truncate lines={2}>Long text...</Text>
 * ```
 */
export function Text(props: TextProps) {
  const {
    variant = 'body',
    color = 'primary',
    weight,
    align,
    noSelect,
    truncate,
    lines,
    className,
    style,
    children,
    ...rest
  } = props

  const theme = getTheme()
  const variantConfig = variantStyles[variant]

  // Resolve color
  let resolvedColor: string
  if (color === 'primary') {
    resolvedColor = theme.colors.text.primary
  } else if (color === 'secondary') {
    resolvedColor = theme.colors.text.secondary
  } else if (color === 'disabled') {
    resolvedColor = theme.colors.text.disabled
  } else {
    resolvedColor = color
  }

  // Resolve font weight
  const fontWeight = weight
    ? theme.typography.fontWeight[weight]
    : variantConfig.weight
      ? theme.typography.fontWeight[variantConfig.weight as keyof typeof theme.typography.fontWeight]
      : theme.typography.fontWeight.normal

  const textClass = css({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize[variantConfig.fontSize as keyof typeof theme.typography.fontSize],
    fontWeight,
    lineHeight: theme.typography.lineHeight[variantConfig.lineHeight as keyof typeof theme.typography.lineHeight],
    color: resolvedColor,
    margin: 0,
    ...(align && { textAlign: align }),
    ...(noSelect && { userSelect: 'none' }),
    ...(truncate && !lines && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...(truncate && lines && {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': lines,
      '-webkit-box-orient': 'vertical',
    }),
    ...style,
  })

  // Choose element based on variant
  const Tag = variant.startsWith('h') ? variant : 'span'

  return (
    <Tag class={cx(textClass, className)} {...rest}>
      {children}
    </Tag>
  )
}
