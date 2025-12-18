import { css, cx } from 'flexium/css'
import { useTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface ChipProps {
  /** Chip label text */
  label: string
  /** Delete handler - shows X button when provided */
  onDelete?: (e: Event) => void
  /** Chip color */
  color?: 'primary' | 'secondary' | 'error'
  /** Chip variant */
  variant?: 'filled' | 'outlined'
  /** Chip size */
  size?: 'sm' | 'md' | 'lg'
  /** Disabled state */
  disabled?: boolean
  /** Custom className */
  className?: string
  /** Custom styles */
  style?: StyleObject
}

const sizeStyles = {
  sm: {
    height: 24,
    paddingX: 8,
    fontSize: 12,
    gap: 4,
    deleteSize: 14,
  },
  md: {
    height: 32,
    paddingX: 12,
    fontSize: 14,
    gap: 6,
    deleteSize: 16,
  },
  lg: {
    height: 40,
    paddingX: 16,
    fontSize: 16,
    gap: 8,
    deleteSize: 18,
  },
} as const

/**
 * Chip - Tag/chip component
 *
 * @example
 * ```tsx
 * <Chip label="React" />
 * <Chip label="TypeScript" color="primary" onDelete={() => {}} />
 * <Chip label="Disabled" variant="outlined" disabled />
 * <Chip label="Large" size="lg" />
 * ```
 */
export function Chip(props: ChipProps) {
  const {
    label,
    onDelete,
    color = 'secondary',
    variant = 'filled',
    size = 'md',
    disabled = false,
    className,
    style,
    ...rest
  } = props

  const theme = useTheme()
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
    height: sizeConfig.height,
    paddingLeft: sizeConfig.paddingX,
    paddingRight: onDelete ? sizeConfig.paddingX - 4 : sizeConfig.paddingX,
    gap: sizeConfig.gap,
    borderRadius: theme.borderRadius.full,
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'default',
    userSelect: 'none',
    transition: 'background-color 0.2s, border-color 0.2s, opacity 0.2s',
    ...(disabled && { opacity: 0.5 }),
  }

  // Variant-specific styles
  let variantStyles: StyleObject = {}

  if (variant === 'filled') {
    variantStyles = {
      backgroundColor: disabled ? theme.colors.border : themeColor,
      color: '#ffffff',
      border: 'none',
    }
  } else if (variant === 'outlined') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: disabled ? theme.colors.text.disabled : themeColor,
      border: `1px solid ${disabled ? theme.colors.border : themeColor}`,
    }
  }

  const chipClass = css({
    ...baseStyles,
    ...variantStyles,
    ...style,
  })

  // Delete button styles
  const deleteButtonClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeConfig.deleteSize,
    height: sizeConfig.deleteSize,
    padding: 0,
    margin: 0,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': disabled ? {} : {
      backgroundColor: variant === 'filled'
        ? 'rgba(0, 0, 0, 0.1)'
        : `${themeColor}20`,
    },
    '&:active': disabled ? {} : {
      backgroundColor: variant === 'filled'
        ? 'rgba(0, 0, 0, 0.2)'
        : `${themeColor}30`,
    },
  })

  const handleDelete = (e: Event) => {
    if (!disabled && onDelete) {
      e.stopPropagation()
      onDelete(e)
    }
  }

  return (
    <div class={cx(chipClass, className)} {...rest}>
      <span>{label}</span>
      {onDelete && (
        <button
          type="button"
          class={deleteButtonClass}
          onClick={handleDelete}
          disabled={disabled}
          aria-label="Delete"
        >
          <svg
            width={sizeConfig.deleteSize - 4}
            height={sizeConfig.deleteSize - 4}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
