/**
 * Input Component Tests
 *
 * Comprehensive tests for signal-based input with two-way binding and accessibility
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { signal, effect } from '../../../core/signal'
import { createInput, createInputField, type InputProps } from '../Input'

describe('Input Component', () => {
  describe('createInput() - Basic VNode creation', () => {
    it('should create an input element with default type', () => {
      const { element } = createInput({})

      expect(element).toBeInstanceOf(HTMLInputElement)
      expect(element.type).toBe('text')
    })

    it('should create input with specified type', () => {
      const { element } = createInput({ type: 'email' })

      expect(element.type).toBe('email')
    })

    it('should create input with all common types', () => {
      const types = [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'time',
        'color',
      ] as const

      types.forEach((type) => {
        const { element } = createInput({ type })
        expect(element.type).toBe(type)
      })
    })

    it('should set basic attributes correctly', () => {
      const { element } = createInput({
        name: 'username',
        id: 'username-input',
        placeholder: 'Enter username',
        disabled: true,
        required: true,
        readonly: true,
        autoFocus: true,
      })

      expect(element.name).toBe('username')
      expect(element.id).toBe('username-input')
      expect(element.placeholder).toBe('Enter username')
      expect(element.disabled).toBe(true)
      expect(element.required).toBe(true)
      expect(element.readOnly).toBe(true)
      expect(element.autofocus).toBe(true)
    })

    it('should set validation attributes', () => {
      const { element } = createInput({
        maxLength: 50,
        minLength: 3,
        min: 0,
        max: 100,
        step: 5,
        pattern: '^[a-z]+$',
      })

      expect(element.maxLength).toBe(50)
      expect(element.minLength).toBe(3)
      expect(element.min).toBe('0')
      expect(element.max).toBe('100')
      expect(element.step).toBe('5')
      expect(element.pattern).toBe('^[a-z]+$')
    })

    it('should set file input attributes', () => {
      const { element } = createInput({
        type: 'file',
        multiple: true,
        accept: 'image/*',
      })

      expect(element.type).toBe('file')
      expect(element.multiple).toBe(true)
      expect(element.accept).toBe('image/*')
    })

    it('should apply className', () => {
      const { element } = createInput({
        className: 'custom-input primary-field',
      })

      expect(element.className).toBe('custom-input primary-field')
    })

    it('should apply inline styles', () => {
      const { element } = createInput({
        style: {
          width: '300px',
          backgroundColor: 'red',
        },
      })

      expect(element.style.width).toBe('300px')
      expect(element.style.backgroundColor).toBe('red')
    })

    it('should set autocomplete attribute', () => {
      const { element } = createInput({
        autoComplete: 'email',
      })

      expect(element.autocomplete).toBe('email')
    })
  })

  describe('Two-way signal binding with value prop', () => {
    it('should bind signal value to input', () => {
      const value = signal('hello')
      const { element } = createInput({ value })

      expect(element.value).toBe('hello')
    })

    it('should update input when signal changes', () => {
      const value = signal('initial')
      const { element } = createInput({ value })

      expect(element.value).toBe('initial')

      value.set('updated')

      expect(element.value).toBe('updated')
    })

    it('should update signal when input changes', () => {
      const value = signal('')
      const { element } = createInput({ value })

      element.value = 'new value'
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe('new value')
    })

    it('should maintain two-way binding across multiple changes', () => {
      const value = signal('a')
      const { element } = createInput({ value })

      // Signal to input
      value.set('b')
      expect(element.value).toBe('b')

      // Input to signal
      element.value = 'c'
      element.dispatchEvent(new Event('input'))
      expect(value.value).toBe('c')

      // Signal to input again
      value.set('d')
      expect(element.value).toBe('d')
    })

    it('should work without value signal (uncontrolled)', () => {
      const { element } = createInput({})

      element.value = 'test'

      expect(element.value).toBe('test')
    })

    it('should prevent infinite loops during signal updates', () => {
      const value = signal('initial')
      const { element } = createInput({ value })

      // This should not cause an infinite loop
      let effectCount = 0
      const dispose = effect(() => {
        value.value // read the signal
        effectCount++
      })

      value.set('changed')

      expect(effectCount).toBeLessThan(5) // should be 2: initial + update
      dispose()
    })
  })

  describe('Value type conversion (string/number)', () => {
    it('should convert number signal to string for text input', () => {
      const value = signal(42)
      const { element } = createInput({ type: 'text', value })

      expect(element.value).toBe('42')
    })

    it('should handle number type input and parse to number', () => {
      const value = signal(0)
      const { element } = createInput({ type: 'number', value })

      element.value = '123'
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe(123)
    })

    it('should handle decimal numbers correctly', () => {
      const value = signal(0)
      const { element } = createInput({ type: 'number', value })

      element.value = '3.14159'
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe(3.14159)
    })

    it('should handle negative numbers', () => {
      const value = signal(0)
      const { element } = createInput({ type: 'number', value })

      element.value = '-42'
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe(-42)
    })

    it('should default to 0 for invalid number input', () => {
      const value = signal(0)
      const { element } = createInput({ type: 'number', value })

      element.value = 'not a number'
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe(0)
    })

    it('should preserve string values for text inputs', () => {
      const value = signal('')
      const { element } = createInput({ type: 'text', value })

      element.value = '  spaced  '
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe('  spaced  ')
    })

    it('should handle empty string for number input', () => {
      const value = signal(0)
      const { element } = createInput({ type: 'number', value })

      element.value = ''
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe(0)
    })
  })

  describe('Error state management', () => {
    it('should add error class when error and touched', () => {
      const error = signal<string | null>('Invalid input')
      const touched = signal(true)
      const { element } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(true)
      expect(element.getAttribute('aria-invalid')).toBe('true')
    })

    it('should not add error class when error but not touched', () => {
      const error = signal<string | null>('Invalid input')
      const touched = signal(false)
      const { element } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(false)
      expect(element.getAttribute('aria-invalid')).toBeNull()
    })

    it('should not add error class when touched but no error', () => {
      const error = signal<string | null>(null)
      const touched = signal(true)
      const { element } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(false)
      expect(element.getAttribute('aria-invalid')).toBeNull()
    })

    it('should update error state reactively when error changes', () => {
      const error = signal<string | null>(null)
      const touched = signal(true)
      const { element } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(false)

      error.set('New error')

      expect(element.classList.contains('input-error')).toBe(true)
      expect(element.getAttribute('aria-invalid')).toBe('true')
    })

    it('should update error state reactively when touched changes', () => {
      const error = signal<string | null>('Error message')
      const touched = signal(false)
      const { element } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(false)

      touched.set(true)

      expect(element.classList.contains('input-error')).toBe(true)
      expect(element.getAttribute('aria-invalid')).toBe('true')
    })

    it('should remove error class when error is cleared', () => {
      const error = signal<string | null>('Error')
      const touched = signal(true)
      const { element } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(true)

      error.set(null)

      expect(element.classList.contains('input-error')).toBe(false)
      expect(element.getAttribute('aria-invalid')).toBeNull()
    })

    it('should handle aria-invalid prop without error signal', () => {
      const { element } = createInput({ ariaInvalid: true })

      expect(element.getAttribute('aria-invalid')).toBe('true')
    })

    it('should handle aria-invalid prop set to false', () => {
      const { element } = createInput({ ariaInvalid: false })

      expect(element.getAttribute('aria-invalid')).toBe('false')
    })
  })

  describe('Touch tracking (onBlur sets touched)', () => {
    it('should set touched signal on blur', () => {
      const touched = signal(false)
      const { element } = createInput({ touched })

      expect(touched.value).toBe(false)

      element.dispatchEvent(new FocusEvent('blur'))

      expect(touched.value).toBe(true)
    })

    it('should call custom onBlur handler', () => {
      const onBlur = vi.fn()
      const { element } = createInput({ onBlur })

      const event = new FocusEvent('blur')
      element.dispatchEvent(event)

      expect(onBlur).toHaveBeenCalledTimes(1)
      expect(onBlur).toHaveBeenCalledWith(event)
    })

    it('should call both touched and custom onBlur handler', () => {
      const touched = signal(false)
      const onBlur = vi.fn()
      const { element } = createInput({ touched, onBlur })

      const event = new FocusEvent('blur')
      element.dispatchEvent(event)

      expect(touched.value).toBe(true)
      expect(onBlur).toHaveBeenCalledTimes(1)
    })

    it('should not error if touched signal is not provided', () => {
      const onBlur = vi.fn()
      const { element } = createInput({ onBlur })

      expect(() => {
        element.dispatchEvent(new FocusEvent('blur'))
      }).not.toThrow()

      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('Accessibility attributes', () => {
    it('should set aria-label', () => {
      const { element } = createInput({ ariaLabel: 'Username field' })

      expect(element.getAttribute('aria-label')).toBe('Username field')
    })

    it('should set aria-describedby', () => {
      const { element } = createInput({ ariaDescribedby: 'help-text' })

      expect(element.getAttribute('aria-describedby')).toBe('help-text')
    })

    it('should set multiple ARIA attributes', () => {
      const { element } = createInput({
        ariaLabel: 'Email input',
        ariaDescribedby: 'email-help',
        ariaInvalid: true,
      })

      expect(element.getAttribute('aria-label')).toBe('Email input')
      expect(element.getAttribute('aria-describedby')).toBe('email-help')
      expect(element.getAttribute('aria-invalid')).toBe('true')
    })

    it('should set id for label association', () => {
      const { element } = createInput({ id: 'custom-id' })

      expect(element.id).toBe('custom-id')
    })
  })

  describe('Event handlers', () => {
    it('should call onInput handler', () => {
      const onInput = vi.fn()
      const { element } = createInput({ onInput })

      element.value = 'test'
      element.dispatchEvent(new Event('input'))

      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onInput).toHaveBeenCalledWith('test', expect.any(Event))
    })

    it('should call onChange handler', () => {
      const onChange = vi.fn()
      const { element } = createInput({ onChange })

      element.value = 'changed'
      element.dispatchEvent(new Event('change'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('changed', expect.any(Event))
    })

    it('should call onFocus handler', () => {
      const onFocus = vi.fn()
      const { element } = createInput({ onFocus })

      const event = new FocusEvent('focus')
      element.dispatchEvent(event)

      expect(onFocus).toHaveBeenCalledTimes(1)
      expect(onFocus).toHaveBeenCalledWith(event)
    })

    it('should call onKeyDown handler', () => {
      const onKeyDown = vi.fn()
      const { element } = createInput({ onKeyDown })

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      element.dispatchEvent(event)

      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(onKeyDown).toHaveBeenCalledWith(event)
    })

    it('should call onKeyUp handler', () => {
      const onKeyUp = vi.fn()
      const { element } = createInput({ onKeyUp })

      const event = new KeyboardEvent('keyup', { key: 'a' })
      element.dispatchEvent(event)

      expect(onKeyUp).toHaveBeenCalledTimes(1)
      expect(onKeyUp).toHaveBeenCalledWith(event)
    })

    it('should call onInput with signal binding', () => {
      const value = signal('')
      const onInput = vi.fn()
      const { element } = createInput({ value, onInput })

      element.value = 'typed'
      element.dispatchEvent(new Event('input'))

      expect(value.value).toBe('typed')
      expect(onInput).toHaveBeenCalledWith('typed', expect.any(Event))
    })

    it('should call onChange with signal binding', () => {
      const value = signal('')
      const onChange = vi.fn()
      const { element } = createInput({ value, onChange })

      element.value = 'completed'
      element.dispatchEvent(new Event('change'))

      expect(onChange).toHaveBeenCalledWith('completed', expect.any(Event))
    })

    it('should handle multiple event handlers together', () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()

      const { element } = createInput({
        onInput,
        onChange,
        onFocus,
        onBlur,
        onKeyDown,
        onKeyUp,
      })

      element.dispatchEvent(new FocusEvent('focus'))
      element.value = 'test'
      element.dispatchEvent(new Event('input'))
      element.dispatchEvent(new KeyboardEvent('keydown'))
      element.dispatchEvent(new KeyboardEvent('keyup'))
      element.dispatchEvent(new Event('change'))
      element.dispatchEvent(new FocusEvent('blur'))

      expect(onFocus).toHaveBeenCalledTimes(1)
      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(onKeyUp).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('update() function', () => {
    it('should update input type', () => {
      const { element, update } = createInput({ type: 'text' })

      expect(element.type).toBe('text')

      update({ type: 'email' })

      expect(element.type).toBe('email')
    })

    it('should update name attribute', () => {
      const { element, update } = createInput({ name: 'old-name' })

      expect(element.name).toBe('old-name')

      update({ name: 'new-name' })

      expect(element.name).toBe('new-name')
    })

    it('should update placeholder', () => {
      const { element, update } = createInput({ placeholder: 'Old' })

      update({ placeholder: 'New placeholder' })

      expect(element.placeholder).toBe('New placeholder')
    })

    it('should update disabled state', () => {
      const { element, update } = createInput({ disabled: false })

      update({ disabled: true })

      expect(element.disabled).toBe(true)
    })

    it('should update className', () => {
      const { element, update } = createInput({ className: 'old-class' })

      update({ className: 'new-class' })

      expect(element.className).toBe('new-class')
    })

    it('should update inline styles', () => {
      const { element, update } = createInput({
        style: { color: 'red' },
      })

      update({ style: { color: 'blue', fontSize: '16px' } })

      expect(element.style.color).toBe('blue')
      expect(element.style.fontSize).toBe('16px')
    })

    it('should update aria-label', () => {
      const { element, update } = createInput({ ariaLabel: 'Old label' })

      update({ ariaLabel: 'New label' })

      expect(element.getAttribute('aria-label')).toBe('New label')
    })

    it('should update multiple properties at once', () => {
      const { element, update } = createInput({
        type: 'text',
        disabled: false,
        placeholder: 'Old',
      })

      update({
        type: 'email',
        disabled: true,
        placeholder: 'New',
      })

      expect(element.type).toBe('email')
      expect(element.disabled).toBe(true)
      expect(element.placeholder).toBe('New')
    })
  })

  describe('dispose() function', () => {
    it('should clean up signal effects', () => {
      const value = signal('test')
      const { element, dispose } = createInput({ value })

      dispose()

      // After disposal, changing signal should not update element
      value.set('changed')

      // Element should still have old value since effect was disposed
      expect(element.value).toBe('test')
    })

    it('should remove event listeners', () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const onBlur = vi.fn()
      const onFocus = vi.fn()

      const { element, dispose } = createInput({
        onInput,
        onChange,
        onBlur,
        onFocus,
      })

      dispose()

      element.dispatchEvent(new Event('input'))
      element.dispatchEvent(new Event('change'))
      element.dispatchEvent(new FocusEvent('blur'))
      element.dispatchEvent(new FocusEvent('focus'))

      expect(onInput).not.toHaveBeenCalled()
      expect(onChange).not.toHaveBeenCalled()
      expect(onBlur).not.toHaveBeenCalled()
      expect(onFocus).not.toHaveBeenCalled()
    })

    it('should clean up error state effects', () => {
      const error = signal<string | null>('Error')
      const touched = signal(true)
      const { element, dispose } = createInput({ error, touched })

      expect(element.classList.contains('input-error')).toBe(true)

      dispose()

      error.set(null)

      // Should still have error class since effect was disposed
      expect(element.classList.contains('input-error')).toBe(true)
    })

    it('should be safe to call multiple times', () => {
      const { dispose } = createInput({})

      expect(() => {
        dispose()
        dispose()
        dispose()
      }).not.toThrow()
    })
  })

  describe('createInputField() - Wrapper with label and error', () => {
    it('should create wrapper div with input', () => {
      const { element, input } = createInputField({})

      expect(element).toBeInstanceOf(HTMLDivElement)
      expect(element.className).toBe('input-field')
      expect(input).toBeInstanceOf(HTMLInputElement)
      expect(element.contains(input)).toBe(true)
    })

    it('should create label when provided', () => {
      const { element } = createInputField({ label: 'Username' })

      const label = element.querySelector('label')
      expect(label).toBeTruthy()
      expect(label?.textContent).toBe('Username')
      expect(label?.className).toBe('input-label')
    })

    it('should not create label when not provided', () => {
      const { element } = createInputField({})

      const label = element.querySelector('label')
      expect(label).toBeNull()
    })

    it('should link label to input with htmlFor', () => {
      const { element, input } = createInputField({
        label: 'Email',
        id: 'email-input',
      })

      const label = element.querySelector('label')
      expect(label?.htmlFor).toBe('email-input')
      expect(input.id).toBe('email-input')
    })

    it('should auto-generate ID if not provided', () => {
      const { element, input } = createInputField({ label: 'Name' })

      const label = element.querySelector('label')
      expect(input.id).toBeTruthy()
      expect(input.id).toMatch(/^input-/)
      expect(label?.htmlFor).toBe(input.id)
    })

    it('should create helper text element', () => {
      const { element } = createInputField({
        helperText: 'Enter your email address',
      })

      const helper = element.querySelector('.input-helper')
      expect(helper).toBeTruthy()
      expect(helper?.textContent).toBe('Enter your email address')
    })

    it('should link helper text with aria-describedby', () => {
      const { element, input } = createInputField({
        id: 'test-input',
        helperText: 'Help text',
      })

      const helper = element.querySelector('.input-helper')
      expect(helper?.id).toBe('test-input-helper')
      expect(input.getAttribute('aria-describedby')).toBe('test-input-helper')
    })

    it('should create error message element when error signal provided', () => {
      const error = signal<string | null>('Invalid value')
      const { element } = createInputField({ error })

      const errorEl = element.querySelector('.input-error-message')
      expect(errorEl).toBeTruthy()
      expect(errorEl?.getAttribute('role')).toBe('alert')
      expect(errorEl?.getAttribute('aria-live')).toBe('polite')
    })

    it('should display error message reactively', () => {
      const error = signal<string | null>(null)
      const { element } = createInputField({ error })

      const errorEl = element.querySelector(
        '.input-error-message'
      ) as HTMLDivElement
      expect(errorEl.style.display).toBe('none')
      expect(errorEl.textContent).toBe('')

      error.set('This field is required')

      expect(errorEl.style.display).toBe('block')
      expect(errorEl.textContent).toBe('This field is required')
    })

    it('should hide error message when error is cleared', () => {
      const error = signal<string | null>('Error message')
      const { element } = createInputField({ error })

      const errorEl = element.querySelector(
        '.input-error-message'
      ) as HTMLDivElement
      expect(errorEl.style.display).toBe('block')

      error.set(null)

      expect(errorEl.style.display).toBe('none')
      expect(errorEl.textContent).toBe('')
    })

    it('should not create error element when showError is false', () => {
      const error = signal<string | null>('Error')
      const { element } = createInputField({ error, showError: false })

      const errorEl = element.querySelector('.input-error-message')
      expect(errorEl).toBeNull()
    })

    it('should link error message with aria-describedby when no helper text', () => {
      const error = signal<string | null>('Error')
      const { input } = createInputField({ id: 'test', error })

      expect(input.getAttribute('aria-describedby')).toBe('test-error')
    })

    it('should prefer helper text for aria-describedby over error', () => {
      const error = signal<string | null>('Error')
      const { input } = createInputField({
        id: 'test',
        error,
        helperText: 'Help',
      })

      expect(input.getAttribute('aria-describedby')).toBe('test-helper')
    })

    it('should pass through input props', () => {
      const value = signal('test')
      const { input } = createInputField({
        type: 'email',
        name: 'email',
        placeholder: 'Enter email',
        value,
      })

      expect(input.type).toBe('email')
      expect(input.name).toBe('email')
      expect(input.placeholder).toBe('Enter email')
      expect(input.value).toBe('test')
    })

    it('should create complete input field with all features', () => {
      const value = signal('')
      const error = signal<string | null>(null)
      const touched = signal(false)

      const { element, input } = createInputField({
        label: 'Email Address',
        helperText: 'We will never share your email',
        value,
        error,
        touched,
        type: 'email',
        name: 'email',
        required: true,
      })

      const label = element.querySelector('label')
      const helper = element.querySelector('.input-helper')
      const errorEl = element.querySelector('.input-error-message')

      expect(label?.textContent).toBe('Email Address')
      expect(helper?.textContent).toBe('We will never share your email')
      expect(errorEl).toBeTruthy()
      expect(input.type).toBe('email')
      expect(input.name).toBe('email')
      expect(input.required).toBe(true)
    })

    it('should clean up all effects on dispose', () => {
      const error = signal<string | null>('Error')
      const { element, dispose } = createInputField({ error })

      const errorEl = element.querySelector(
        '.input-error-message'
      ) as HTMLDivElement
      expect(errorEl.style.display).toBe('block')

      dispose()

      error.set(null)

      // Should still show error since effect was disposed
      expect(errorEl.style.display).toBe('block')
    })

    it('should generate unique IDs for multiple fields', () => {
      const field1 = createInputField({ label: 'Field 1' })
      const field2 = createInputField({ label: 'Field 2' })

      expect(field1.input.id).not.toBe(field2.input.id)

      field1.dispose()
      field2.dispose()
    })
  })

  describe('Integration tests', () => {
    it('should handle complete form field lifecycle', () => {
      const value = signal('')
      const error = signal<string | null>(null)
      const touched = signal(false)

      const { element, input, dispose } = createInputField({
        label: 'Username',
        value,
        error,
        touched,
        helperText: 'Choose a unique username',
      })

      // Initial state
      expect(input.value).toBe('')
      expect(input.classList.contains('input-error')).toBe(false)

      // User types
      input.value = 'john'
      input.dispatchEvent(new Event('input'))
      expect(value.value).toBe('john')

      // User leaves field
      input.dispatchEvent(new FocusEvent('blur'))
      expect(touched.value).toBe(true)

      // Validation sets error
      error.set('Username already taken')

      const errorEl = element.querySelector('.input-error-message')
      expect(errorEl?.textContent).toBe('Username already taken')
      expect(input.classList.contains('input-error')).toBe(true)

      // User corrects input
      input.value = 'john_doe'
      input.dispatchEvent(new Event('input'))
      expect(value.value).toBe('john_doe')

      // Validation clears error
      error.set(null)
      expect(input.classList.contains('input-error')).toBe(false)

      dispose()
    })

    it('should work with number inputs and validation', () => {
      const value = signal(0)
      const error = signal<string | null>(null)
      const touched = signal(false)

      const { input, dispose } = createInputField({
        type: 'number',
        label: 'Age',
        value,
        error,
        touched,
        min: 18,
        max: 100,
      })

      // Set valid number
      input.value = '25'
      input.dispatchEvent(new Event('input'))

      expect(value.value).toBe(25)
      expect(input.min).toBe('18')
      expect(input.max).toBe('100')

      dispose()
    })

    it('should support disabled state changes', () => {
      const { element, update, dispose } = createInput({
        disabled: false,
      })

      expect(element.disabled).toBe(false)

      update({ disabled: true })

      expect(element.disabled).toBe(true)

      dispose()
    })
  })
})
