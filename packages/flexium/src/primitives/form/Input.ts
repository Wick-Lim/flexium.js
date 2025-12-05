/**
 * Input Component - Controlled input with signal binding and accessibility
 *
 * Provides reactive input elements with error states and ARIA attributes
 * Works seamlessly with the Form component
 */

import { effect, type Signal } from '../../core/signal'

/**
 * Input types
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color'
  | 'file'

/**
 * Input component props
 */
export interface InputProps {
  type?: InputType
  name?: string
  value?: Signal<string | number>
  placeholder?: string
  disabled?: boolean
  required?: boolean
  readonly?: boolean
  autoComplete?: string
  autoFocus?: boolean
  maxLength?: number
  minLength?: number
  min?: number | string
  max?: number | string
  step?: number | string
  pattern?: string
  multiple?: boolean // For file inputs
  accept?: string // For file inputs

  // Error state
  error?: Signal<string | null>
  touched?: Signal<boolean>

  // Styling
  className?: string
  style?: Partial<CSSStyleDeclaration>

  // Accessibility
  id?: string
  ariaLabel?: string
  ariaDescribedby?: string
  ariaInvalid?: boolean

  // Event handlers
  onInput?: (value: string, event: Event) => void
  onChange?: (value: string, event: Event) => void
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
}

/**
 * Create a controlled input element
 */
export function createInput(props: InputProps): {
  element: HTMLInputElement
  update: (newProps: Partial<InputProps>) => void
  dispose: () => void
} {
  const {
    type = 'text',
    name,
    value,
    placeholder,
    disabled = false,
    required = false,
    readonly = false,
    autoComplete,
    autoFocus = false,
    maxLength,
    minLength,
    min,
    max,
    step,
    pattern,
    multiple = false,
    accept,
    error,
    touched,
    className = '',
    style,
    id,
    ariaLabel,
    ariaDescribedby,
    ariaInvalid,
    onInput,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  } = props

  // Create input element
  const input = document.createElement('input')
  input.type = type

  // Set basic attributes
  if (name) input.name = name
  if (id) input.id = id
  if (placeholder) input.placeholder = placeholder
  if (autoComplete) input.autocomplete = autoComplete as AutoFill
  if (pattern) input.pattern = pattern
  if (accept) input.accept = accept

  input.disabled = disabled
  input.required = required
  input.readOnly = readonly
  input.autofocus = autoFocus
  input.multiple = multiple

  if (maxLength !== undefined) input.maxLength = maxLength
  if (minLength !== undefined) input.minLength = minLength
  if (min !== undefined) input.min = String(min)
  if (max !== undefined) input.max = String(max)
  if (step !== undefined) input.step = String(step)

  // Apply className
  if (className) {
    input.className = className
  }

  // Apply inline styles
  if (style) {
    Object.assign(input.style, style)
  }

  // Accessibility attributes
  if (ariaLabel) {
    input.setAttribute('aria-label', ariaLabel)
  }

  if (ariaDescribedby) {
    input.setAttribute('aria-describedby', ariaDescribedby)
  }

  // Track effects for cleanup
  const disposers: (() => void)[] = []

  // Bind value signal (two-way binding)
  if (value) {
    // Update input when signal changes
    const valueEffect = effect(() => {
      const currentValue = value.value
      if (input.value !== String(currentValue)) {
        input.value = String(currentValue)
      }
    })
    disposers.push(valueEffect)

    // Update signal when input changes
    const handleInputEvent = (e: Event) => {
      const newValue =
        type === 'number' ? parseFloat(input.value) || 0 : input.value

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value.set(newValue as any)

      if (onInput) {
        onInput(input.value, e)
      }
    }

    const handleChangeEvent = (e: Event) => {
      if (onChange) {
        onChange(input.value, e)
      }
    }

    input.addEventListener('input', handleInputEvent)
    input.addEventListener('change', handleChangeEvent)

    disposers.push(() => {
      input.removeEventListener('input', handleInputEvent)
      input.removeEventListener('change', handleChangeEvent)
    })
  } else {
    // Uncontrolled input with event handlers
    if (onInput) {
      const handleInputEvent = (e: Event) => onInput(input.value, e)
      input.addEventListener('input', handleInputEvent)
      disposers.push(() => input.removeEventListener('input', handleInputEvent))
    }

    if (onChange) {
      const handleChangeEvent = (e: Event) => onChange(input.value, e)
      input.addEventListener('change', handleChangeEvent)
      disposers.push(() =>
        input.removeEventListener('change', handleChangeEvent)
      )
    }
  }

  // Handle error state
  if (error && touched) {
    const errorEffect = effect(() => {
      const hasError = error.value && touched.value

      // Update aria-invalid
      if (hasError) {
        input.setAttribute('aria-invalid', 'true')
        input.classList.add('input-error')
      } else {
        input.removeAttribute('aria-invalid')
        input.classList.remove('input-error')
      }
    })
    disposers.push(errorEffect)
  } else if (ariaInvalid !== undefined) {
    input.setAttribute('aria-invalid', String(ariaInvalid))
  }

  // Blur handler
  if (onBlur || touched) {
    const handleBlur = (e: FocusEvent) => {
      if (touched) {
        touched.set(true)
      }
      if (onBlur) {
        onBlur(e)
      }
    }
    input.addEventListener('blur', handleBlur)
    disposers.push(() => input.removeEventListener('blur', handleBlur))
  }

  // Focus handler
  if (onFocus) {
    input.addEventListener('focus', onFocus)
    disposers.push(() => input.removeEventListener('focus', onFocus))
  }

  // Keyboard handlers
  if (onKeyDown) {
    input.addEventListener('keydown', onKeyDown)
    disposers.push(() => input.removeEventListener('keydown', onKeyDown))
  }

  if (onKeyUp) {
    input.addEventListener('keyup', onKeyUp)
    disposers.push(() => input.removeEventListener('keyup', onKeyUp))
  }

  // Update function
  function update(newProps: Partial<InputProps>): void {
    if (newProps.type !== undefined) input.type = newProps.type
    if (newProps.name !== undefined) input.name = newProps.name
    if (newProps.placeholder !== undefined)
      input.placeholder = newProps.placeholder
    if (newProps.disabled !== undefined) input.disabled = newProps.disabled
    if (newProps.required !== undefined) input.required = newProps.required
    if (newProps.readonly !== undefined) input.readOnly = newProps.readonly
    if (newProps.className !== undefined) input.className = newProps.className

    if (newProps.style) {
      Object.assign(input.style, newProps.style)
    }

    if (newProps.ariaLabel !== undefined) {
      input.setAttribute('aria-label', newProps.ariaLabel)
    }
  }

  // Cleanup function
  function dispose(): void {
    disposers.forEach((d) => d())
  }

  return {
    element: input,
    update,
    dispose,
  }
}

/**
 * Create an input wrapper with label and error message
 */
export function createInputField(
  props: InputProps & {
    label?: string
    helperText?: string
    showError?: boolean
  }
): {
  element: HTMLDivElement
  input: HTMLInputElement
  dispose: () => void
} {
  const {
    label,
    helperText,
    error,
    showError = true,
    id: providedId,
    ...inputProps
  } = props

  // Generate unique ID if not provided
  const inputId =
    providedId || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  // Create wrapper
  const wrapper = document.createElement('div')
  wrapper.className = 'input-field'

  // Create label if provided
  let labelElement: HTMLLabelElement | null = null
  if (label) {
    labelElement = document.createElement('label')
    labelElement.htmlFor = inputId
    labelElement.textContent = label
    labelElement.className = 'input-label'
    wrapper.appendChild(labelElement)
  }

  // Create input
  const { element: input, dispose: disposeInput } = createInput({
    ...inputProps,
    id: inputId,
    error,
    ariaDescribedby: helperText ? helperId : errorId,
  })
  wrapper.appendChild(input)

  // Create helper text
  let helperElement: HTMLDivElement | null = null
  if (helperText) {
    helperElement = document.createElement('div')
    helperElement.id = helperId
    helperElement.className = 'input-helper'
    helperElement.textContent = helperText
    wrapper.appendChild(helperElement)
  }

  // Create error message
  let errorElement: HTMLDivElement | null = null
  const disposers: (() => void)[] = [disposeInput]

  if (error && showError) {
    errorElement = document.createElement('div')
    errorElement.id = errorId
    errorElement.className = 'input-error-message'
    errorElement.setAttribute('role', 'alert')
    errorElement.setAttribute('aria-live', 'polite')
    wrapper.appendChild(errorElement)

    // Update error message reactively
    const errorEffect = effect(() => {
      const errorMessage = error.value
      if (errorMessage && errorElement) {
        errorElement.textContent = errorMessage
        errorElement.style.display = 'block'
      } else if (errorElement) {
        errorElement.textContent = ''
        errorElement.style.display = 'none'
      }
    })
    disposers.push(errorEffect)
  }

  // Cleanup
  function dispose(): void {
    disposers.forEach((d) => d())
  }

  return {
    element: wrapper,
    input,
    dispose,
  }
}
