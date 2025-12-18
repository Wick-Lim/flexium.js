import { css, cx } from 'flexium/css'
import { getTheme } from '../theme'
import type { StyleObject } from 'flexium/css'

export interface ModalProps {
  /** Whether the modal is open */
  open?: boolean
  /** Close handler */
  onClose?: () => void
  /** Modal content */
  children?: any
  /** Modal title */
  title?: string
  /** Modal size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className for modal content */
  className?: string
  /** Custom styles for modal content */
  style?: StyleObject
}

const sizeMap = {
  sm: 400,
  md: 600,
  lg: 800,
} as const

/**
 * Modal - Modal dialog component
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm Action">
 *   <Text>Are you sure you want to proceed?</Text>
 *   <Button onClick={() => setOpen(false)}>Cancel</Button>
 * </Modal>
 * ```
 */
export function Modal(props: ModalProps) {
  const {
    open = false,
    onClose,
    children,
    title,
    size = 'md',
    className,
    style,
    ...rest
  } = props

  const theme = getTheme()

  if (!open) {
    return null
  }

  const backdropClass = css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: theme.spacing.md,
  })

  const modalClass = css({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    maxWidth: sizeMap[size],
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    ...style,
  })

  const headerClass = css({
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border}`,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  })

  const contentClass = css({
    padding: theme.spacing.lg,
  })

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  const handleContentClick = (e: MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div class={backdropClass} onClick={handleBackdropClick}>
      <div class={cx(modalClass, className)} onClick={handleContentClick} {...rest}>
        {title && <h2 class={headerClass}>{title}</h2>}
        <div class={contentClass}>{children}</div>
      </div>
    </div>
  )
}
