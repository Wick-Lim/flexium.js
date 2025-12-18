import { css, cx } from 'flexium/css'
import { getTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface SwitchProps {
  /** Checked state */
  checked?: boolean
  /** Change handler */
  onChange?: (e: Event) => void
  /** Switch label */
  label?: string
  /** Disabled state */
  disabled?: boolean
  /** Switch size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
  /** Additional input props */
  [key: string]: any
}

const sizeStyles = {
  sm: { width: 32, height: 18, thumbSize: 14, translateX: 14, fontSize: 'sm' },
  md: { width: 44, height: 24, thumbSize: 20, translateX: 20, fontSize: 'md' },
  lg: { width: 56, height: 30, thumbSize: 26, translateX: 26, fontSize: 'lg' },
} as const

/**
 * Switch - Animated toggle switch component
 *
 * @example
 * ```tsx
 * <Switch
 *   label="Enable notifications"
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 * />
 * <Switch
 *   label="Dark mode"
 *   size="lg"
 * />
 * ```
 */
export function Switch(props: SwitchProps) {
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

  const theme = getTheme()
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

  // Switch track styles
  const trackClass = css({
    position: 'relative',
    display: 'inline-block',
    width: sizeConfig.width,
    height: sizeConfig.height,
    minWidth: sizeConfig.width,
    minHeight: sizeConfig.height,
    borderRadius: theme.borderRadius.full,
    backgroundColor: checked ? theme.colors.primary : theme.colors.border,
    transition: 'background-color 0.2s',
    '&:hover': disabled ? {} : {
      backgroundColor: checked ? theme.colors.primary : theme.colors.text.secondary,
    },
  })

  // Switch thumb styles
  const thumbClass = css({
    position: 'absolute',
    top: (sizeConfig.height - sizeConfig.thumbSize) / 2,
    left: checked ? sizeConfig.translateX : (sizeConfig.height - sizeConfig.thumbSize) / 2,
    width: sizeConfig.thumbSize,
    height: sizeConfig.thumbSize,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#ffffff',
    boxShadow: theme.shadows.sm,
    transition: 'left 0.2s',
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
      <div class={trackClass} onClick={handleClick}>
        <div class={thumbClass} />
      </div>
      {label && <span class={labelClass}>{label}</span>}
    </label>
  )
}
