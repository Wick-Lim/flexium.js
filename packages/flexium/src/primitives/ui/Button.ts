/**
 * Button Component - Accessible button with unified touch/click handler
 *
 * Provides onPress handler that works consistently across mouse, touch, and keyboard
 * Includes full ARIA support and style props
 */

import { signal, effect, type Signal } from '../../core/signal'
import { ErrorCodes, logError, logWarning } from '../../core/errors'

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
  disabled?: Signal<boolean> | boolean
  loading?: Signal<boolean> | boolean
  fullWidth?: boolean

  // Content
  children?: string | HTMLElement | HTMLElement[]
  leftIcon?: HTMLElement
  rightIcon?: HTMLElement
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
 * Create a button element with unified press handling
 */
export function createButton(props: ButtonProps): {
  element: HTMLButtonElement
  update: (newProps: Partial<ButtonProps>) => void
  dispose: () => void
} {
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

  // Create button element
  const button = document.createElement('button')
  button.type = type

  // Set ID
  if (id) button.id = id

  // Set role (default is 'button')
  if (role) button.setAttribute('role', role)

  // Apply base classes
  const classes = ['button', `button-${variant}`, `button-${size}`]
  if (fullWidth) classes.push('button-full-width')
  if (className) classes.push(className)
  button.className = classes.join(' ')

  // Apply inline styles
  if (style) {
    Object.assign(button.style, style)
  }

  // Accessibility attributes
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel)
  if (ariaDescribedby) button.setAttribute('aria-describedby', ariaDescribedby)
  if (ariaExpanded !== undefined)
    button.setAttribute('aria-expanded', String(ariaExpanded))
  if (ariaPressed !== undefined)
    button.setAttribute('aria-pressed', String(ariaPressed))
  if (ariaControls) button.setAttribute('aria-controls', ariaControls)

  // Track effects for cleanup
  const disposers: (() => void)[] = []

  // Content wrapper for managing icons and text
  const contentWrapper = document.createElement('span')
  contentWrapper.className = 'button-content'

  // Loading spinner
  const loadingSpinner = document.createElement('span')
  loadingSpinner.className = 'button-spinner'
  loadingSpinner.setAttribute('aria-hidden', 'true')
  loadingSpinner.style.display = 'none'

  // Assemble button content
  button.appendChild(loadingSpinner)

  if (leftIcon) {
    leftIcon.className = 'button-icon button-icon-left'
    contentWrapper.appendChild(leftIcon)
  }

  const textContent = document.createElement('span')
  textContent.className = 'button-text'
  if (typeof children === 'string') {
    textContent.textContent = children
  } else if (children instanceof HTMLElement) {
    textContent.appendChild(children)
  } else if (Array.isArray(children)) {
    children.forEach((child) => textContent.appendChild(child))
  }
  contentWrapper.appendChild(textContent)

  if (rightIcon) {
    rightIcon.className = 'button-icon button-icon-right'
    contentWrapper.appendChild(rightIcon)
  }

  button.appendChild(contentWrapper)

  // Handle disabled state
  const disabledSignal =
    typeof disabled === 'boolean' ? signal(disabled) : disabled
  const disabledEffect = effect(() => {
    button.disabled = disabledSignal.value
    if (disabledSignal.value) {
      button.setAttribute('aria-disabled', 'true')
    } else {
      button.removeAttribute('aria-disabled')
    }
  })
  disposers.push(disabledEffect)

  // Handle loading state
  const loadingSignal = typeof loading === 'boolean' ? signal(loading) : loading
  const loadingEffect = effect(() => {
    const isLoading = loadingSignal.value

    if (isLoading) {
      // Show spinner
      loadingSpinner.style.display = 'inline-block'
      contentWrapper.style.visibility = 'hidden'

      // Update text for screen readers
      if (loadingText) {
        textContent.textContent = loadingText
      }

      // Disable button during loading
      button.disabled = true
      button.setAttribute('aria-busy', 'true')
    } else {
      // Hide spinner
      loadingSpinner.style.display = 'none'
      contentWrapper.style.visibility = 'visible'

      // Restore original text
      if (typeof children === 'string') {
        textContent.textContent = children
      }

      button.removeAttribute('aria-busy')
    }
  })
  disposers.push(loadingEffect)

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

    disposers.push(() => {
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
    disposers.push(() => button.removeEventListener('focus', onFocus))
  }

  if (onBlur) {
    button.addEventListener('blur', onBlur)
    disposers.push(() => button.removeEventListener('blur', onBlur))
  }

  // Update function
  function update(newProps: Partial<ButtonProps>): void {
    if (newProps.type !== undefined) button.type = newProps.type
    if (newProps.className !== undefined) {
      const classes = ['button', `button-${variant}`, `button-${size}`]
      if (fullWidth) classes.push('button-full-width')
      if (newProps.className) classes.push(newProps.className)
      button.className = classes.join(' ')
    }

    if (newProps.style) {
      Object.assign(button.style, newProps.style)
    }

    if (newProps.ariaLabel !== undefined) {
      button.setAttribute('aria-label', newProps.ariaLabel)
    }

    if (newProps.disabled !== undefined) {
      const newDisabled =
        typeof newProps.disabled === 'boolean'
          ? signal(newProps.disabled)
          : newProps.disabled
      disabledSignal.set(newDisabled.value)
    }

    if (newProps.loading !== undefined) {
      const newLoading =
        typeof newProps.loading === 'boolean'
          ? signal(newProps.loading)
          : newProps.loading
      loadingSignal.set(newLoading.value)
    }
  }

  // Cleanup function
  function dispose(): void {
    disposers.forEach((d) => d())
  }

  return {
    element: button,
    update,
    dispose,
  }
}

/**
 * Create an icon button (button with only an icon)
 */
export function createIconButton(props: ButtonProps & { icon: HTMLElement }): {
  element: HTMLButtonElement
  dispose: () => void
} {
  const { icon, ariaLabel, ...buttonProps } = props

  if (!ariaLabel) {
    logWarning(ErrorCodes.BUTTON_MISSING_ARIA_LABEL)
  }

  const { element, dispose } = createButton({
    ...buttonProps,
    children: icon,
    ariaLabel,
    className: `icon-button ${buttonProps.className || ''}`,
  })

  return {
    element,
    dispose,
  }
}
