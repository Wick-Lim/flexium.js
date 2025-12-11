/**
 * Button Component - Accessible button with unified touch/click handler
 *
 * Provides onPress handler that works consistently across mouse, touch, and keyboard
 * Includes full ARIA support and style props
 */

import { SignalNode, onCleanup, type Signal } from '../../core/signal'
import { effect } from '../../core/effect'
import { ErrorCodes, logError, logWarning } from '../../core/errors'
import { f } from '../../renderers/dom/f'
import type { FNode } from '../../core/renderer'

/**
 * Button variants
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Button type attribute
 */
export type ButtonType = 'button' | 'submit' | 'reset'

/**
 * Button component props
 */
export interface ButtonProps {
  type?: ButtonType
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: Signal<boolean> | SignalNode<boolean> | boolean
  loading?: Signal<boolean> | SignalNode<boolean> | boolean
  fullWidth?: boolean

  // Content
  children?: any
  leftIcon?: any
  rightIcon?: any
  loadingText?: string

  // Styling
  className?: string
  style?: Partial<CSSStyleDeclaration>

  // Accessibility
  id?: string
  role?: string
  ariaLabel?: string
  ariaDescribedby?: string
  ariaExpanded?: boolean
  ariaPressed?: boolean
  ariaControls?: string

  // Event handlers
  onPress?: (event: Event) => void | Promise<void>
  onPressStart?: (event: PointerEvent) => void
  onPressEnd?: (event: PointerEvent) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
}

/**
 * Button component - Accessible button with unified touch/click handler
 *
 * @example
 * ```tsx
 * <Button variant="primary" onPress={() => console.log('clicked')}>
 *   Click me
 * </Button>
 *
 * const loading = signal(false)
 * <Button loading={loading} loadingText="Saving...">
 *   Save
 * </Button>
 * ```
 */
export function Button(props: ButtonProps): FNode {
  const {
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    children,
    leftIcon,
    rightIcon,
    loadingText = 'Loading...',
    className = '',
    style,
    id,
    role,
    ariaLabel,
    ariaDescribedby,
    ariaExpanded,
    ariaPressed,
    ariaControls,
    onPress,
    onPressStart,
    onPressEnd,
    onFocus,
    onBlur,
    onKeyDown,
  } = props

  // Build class names
  const classes = ['button', `button-${variant}`, `button-${size}`]
  if (fullWidth) classes.push('button-full-width')
  if (className) classes.push(className)

  // Build props for the button element
  const buttonProps: Record<string, any> = {
    type,
    class: classes.join(' '),
    style,
  }

  if (id) buttonProps.id = id
  if (role) buttonProps.role = role
  if (ariaLabel) buttonProps['aria-label'] = ariaLabel
  if (ariaDescribedby) buttonProps['aria-describedby'] = ariaDescribedby
  if (ariaExpanded !== undefined) buttonProps['aria-expanded'] = ariaExpanded
  if (ariaPressed !== undefined) buttonProps['aria-pressed'] = ariaPressed
  if (ariaControls) buttonProps['aria-controls'] = ariaControls

  // Add ref callback to set up reactive behavior
  buttonProps.ref = (button: HTMLButtonElement | null) => {
    if (!button) return

    // Convert disabled/loading to signals if needed
    // Safety: we normalize to an object with .value property (both Signal and SignalNode have it now)
    const disabledSignal =
      typeof disabled === 'boolean' ? new SignalNode(disabled) : disabled
    const loadingSignal = typeof loading === 'boolean' ? new SignalNode(loading) : loading

    // Find content elements after mount
    const contentWrapper = button.querySelector('.button-content') as HTMLElement
    const loadingSpinner = button.querySelector('.button-spinner') as HTMLElement
    const textContent = button.querySelector('.button-text') as HTMLElement

    // Handle disabled state
    effect(() => {
      const val = disabledSignal.value // Works for SignalNode and Signal(Proxy)
      button.disabled = val
      if (val) {
        button.setAttribute('aria-disabled', 'true')
      } else {
        button.removeAttribute('aria-disabled')
      }
    })

    // Handle loading state
    effect(() => {
      const isLoading = loadingSignal.value

      if (isLoading) {
        // Show spinner
        if (loadingSpinner) loadingSpinner.style.display = 'inline-block'
        if (contentWrapper) contentWrapper.style.visibility = 'hidden'

        // Update text for screen readers
        if (loadingText && textContent) {
          textContent.textContent = loadingText
        }

        // Disable button during loading
        button.disabled = true
        button.setAttribute('aria-busy', 'true')
      } else {
        // Hide spinner
        if (loadingSpinner) loadingSpinner.style.display = 'none'
        if (contentWrapper) contentWrapper.style.visibility = 'visible'

        // Restore original text
        if (typeof children === 'string' && textContent) {
          textContent.textContent = children
        }

        button.removeAttribute('aria-busy')
      }
    })

    // Unified press handler (works for mouse, touch, and keyboard)
    if (onPress) {
      let isPressing = false

      // Pointer down (mouse/touch start)
      const handlePointerDown = (e: PointerEvent) => {
        if (button.disabled) return

        isPressing = true
        button.classList.add('button-pressed')

        if (onPressStart) {
          onPressStart(e)
        }
      }

      // Pointer up (mouse/touch end)
      const handlePointerUp = (e: PointerEvent) => {
        if (!isPressing) return

        isPressing = false
        button.classList.remove('button-pressed')

        if (onPressEnd) {
          onPressEnd(e)
        }
      }

      // Click (fires after pointer up)
      const handleClick = async (e: Event) => {
        if (button.disabled) {
          e.preventDefault()
          return
        }

        try {
          await onPress(e)
        } catch (error) {
          logError(ErrorCodes.BUTTON_HANDLER_FAILED, undefined, error)
        }
      }

      // Keyboard (Enter/Space)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (button.disabled) return

        // Enter or Space triggers press
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          isPressing = true
          button.classList.add('button-pressed')

          if (onPressStart) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPressStart(e as any)
          }
        }

        // Custom keydown handler
        if (onKeyDown) {
          onKeyDown(e)
        }
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        if (button.disabled) return

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          isPressing = false
          button.classList.remove('button-pressed')

          if (onPressEnd) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPressEnd(e as any)
          }

          // Trigger press
          handleClick(e)
        }
      }

      // Pointer cancel (touch interrupted)
      const handlePointerCancel = () => {
        isPressing = false
        button.classList.remove('button-pressed')
      }

      button.addEventListener('pointerdown', handlePointerDown)
      button.addEventListener('pointerup', handlePointerUp)
      button.addEventListener('click', handleClick)
      button.addEventListener('keydown', handleKeyDown)
      button.addEventListener('keyup', handleKeyUp)
      button.addEventListener('pointercancel', handlePointerCancel)

      onCleanup(() => {
        button.removeEventListener('pointerdown', handlePointerDown)
        button.removeEventListener('pointerup', handlePointerUp)
        button.removeEventListener('click', handleClick)
        button.removeEventListener('keydown', handleKeyDown)
        button.removeEventListener('keyup', handleKeyUp)
        button.removeEventListener('pointercancel', handlePointerCancel)
      })
    }

    // Focus/blur handlers
    if (onFocus) {
      button.addEventListener('focus', onFocus)
      onCleanup(() => button.removeEventListener('focus', onFocus))
    }

    if (onBlur) {
      button.addEventListener('blur', onBlur)
      onCleanup(() => button.removeEventListener('blur', onBlur))
    }
  }

  // Build button content structure
  const buttonChildren = [
    // Loading spinner
    f('span', {
      class: 'button-spinner',
      'aria-hidden': 'true',
      style: { display: 'none' },
    }),
    // Content wrapper with icons and text
    f(
      'span',
      { class: 'button-content' },
      [
        leftIcon && f('span', { class: 'button-icon button-icon-left' }, leftIcon),
        f('span', { class: 'button-text' }, children),
        rightIcon &&
        f('span', { class: 'button-icon button-icon-right' }, rightIcon),
      ].filter(Boolean)
    ),
  ]

  return f('button', buttonProps, buttonChildren)
}

/**
 * IconButton component - Button with only an icon
 *
 * @example
 * ```tsx
 * <IconButton icon={<i class="icon-close" />} ariaLabel="Close" onPress={handleClose} />
 * ```
 */
export function IconButton(props: ButtonProps & { icon: any }): FNode {
  const { icon, ariaLabel, className, ...buttonProps } = props

  if (!ariaLabel) {
    logWarning(ErrorCodes.BUTTON_MISSING_ARIA_LABEL)
  }

  return Button({
    ...buttonProps,
    children: icon,
    ariaLabel,
    className: `icon-button ${className || ''}`,
  })
}
