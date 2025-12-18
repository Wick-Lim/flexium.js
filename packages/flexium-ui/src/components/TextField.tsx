import { css, cx } from 'flexium/css'
import { getTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface TextFieldProps {
  /** Input value */
  value?: string
  /** Change handler */
  onChange?: (e: Event) => void
  /** Placeholder text */
  placeholder?: string
  /** Field label */
  label?: string
  /** Error message */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Input type */
  type?: 'text' | 'password' | 'email'
  /** Input size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Additional input props */
  [key: string]: any
}

const sizeStyles = {
  sm: { paddingX: 8, paddingY: 6, fontSize: 'sm' },
  md: { paddingX: 12, paddingY: 8, fontSize: 'md' },
  lg: { paddingX: 16, paddingY: 10, fontSize: 'lg' },
} as const

/**
 * TextField - Text input component
 *
 * @example
 * ```tsx
 * <TextField
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   onChange={(e) => console.log(e.target.value)}
 * />
 * <TextField
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 * />
 * ```
 */
export function TextField(props: TextFieldProps) {
  const {
    value,
    onChange,
    placeholder,
    label,
    error,
    disabled,
    type = 'text',
    size = 'md',
    className,
    style,
    ...rest
  } = props

  const theme = getTheme()
  const sizeConfig = sizeStyles[size]

  // Container styles
  const containerClass = css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    width: '100%',
  })

  // Label styles
  const labelClass = css({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize[sizeConfig.fontSize as keyof typeof theme.typography.fontSize],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: 0,
  })

  // Input styles
  const inputStyles: StyleObject = {
    display: 'block',
    width: '100%',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize[sizeConfig.fontSize as keyof typeof theme.typography.fontSize],
    lineHeight: theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
    border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: `${sizeConfig.paddingY}px ${sizeConfig.paddingX}px`,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: disabled ? 'not-allowed' : 'text',
    ...(disabled && {
      opacity: 0.5,
      backgroundColor: theme.colors.surface,
    }),
    '&:focus': disabled ? {} : {
      borderColor: error ? theme.colors.error : theme.colors.primary,
      boxShadow: `0 0 0 3px ${error ? theme.colors.error : theme.colors.primary}20`,
    },
    '&::placeholder': {
      color: theme.colors.text.disabled,
    },
  }

  const inputClass = css({
    ...inputStyles,
    ...style,
  })

  // Error message styles
  const errorClass = css({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    margin: 0,
  })

  return (
    <div class={cx(containerClass, className)}>
      {label && <label class={labelClass}>{label}</label>}
      <input
        type={type}
        class={inputClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {error && <span class={errorClass}>{error}</span>}
    </div>
  )
}
