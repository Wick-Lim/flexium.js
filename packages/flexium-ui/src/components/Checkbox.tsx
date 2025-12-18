import { css, cx } from 'flexium/css'
import { useTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface CheckboxProps {
  /** Checked state */
  checked?: boolean
  /** Change handler */
  onChange?: (e: Event) => void
  /** Checkbox label */
  label?: string
  /** Disabled state */
  disabled?: boolean
  /** Checkbox size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Additional input props */
  [key: string]: any
}

const sizeStyles = {
  sm: { size: 16, iconSize: 10, fontSize: 'sm' },
  md: { size: 20, iconSize: 12, fontSize: 'md' },
  lg: { size: 24, iconSize: 14, fontSize: 'lg' },
} as const

/**
 * Checkbox - Custom styled checkbox component
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms"
 *   checked={accepted}
 *   onChange={(e) => setAccepted(e.target.checked)}
 * />
 * <Checkbox
 *   label="Subscribe to newsletter"
 *   size="lg"
 * />
 * ```
 */
export function Checkbox(props: CheckboxProps) {
  const {
    checked,
    onChange,
    label,
    disabled,
    size = 'md',
    className,
    style,
    ...rest
  } = props

  const theme = useTheme()
  const sizeConfig = sizeStyles[size]

  // Container styles
  const containerClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    ...style,
  })

  // Hidden native input
  const hiddenInputClass = css({
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  })

  // Custom checkbox box styles
  const checkboxBoxClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeConfig.size,
    height: sizeConfig.size,
    minWidth: sizeConfig.size,
    minHeight: sizeConfig.size,
    borderRadius: theme.borderRadius.sm,
    border: `2px solid ${checked ? theme.colors.primary : theme.colors.border}`,
    backgroundColor: checked ? theme.colors.primary : theme.colors.background,
    transition: 'background-color 0.2s, border-color 0.2s',
    '&:hover': disabled ? {} : {
      borderColor: checked ? theme.colors.primary : theme.colors.text.secondary,
    },
  })

  // Checkmark icon styles
  const checkmarkClass = css({
    display: checked ? 'block' : 'none',
    width: sizeConfig.iconSize,
    height: sizeConfig.iconSize,
    color: '#ffffff',
  })

  // Label styles
  const labelClass = css({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize[sizeConfig.fontSize as keyof typeof theme.typography.fontSize],
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.normal,
  })

  const handleClick = (e: MouseEvent) => {
    if (disabled) return

    // Create a synthetic event that mimics the native input change event
    const syntheticEvent = {
      target: { checked: !checked },
      currentTarget: { checked: !checked },
    } as any

    onChange?.(syntheticEvent)
  }

  return (
    <label class={cx(containerClass, className)}>
      <input
        type="checkbox"
        class={hiddenInputClass}
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <div class={checkboxBoxClass} onClick={handleClick}>
        <svg
          class={checkmarkClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      {label && <span class={labelClass}>{label}</span>}
    </label>
  )
}
