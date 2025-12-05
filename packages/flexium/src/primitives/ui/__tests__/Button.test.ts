/**
 * Button Component Tests
 *
 * Comprehensive tests for Button UI component
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createButton, createIconButton } from '../Button'
import { signal } from '../../../core/signal'

describe('Button Component', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('createButton() - Basic Creation', () => {
    it('should create a button element with default props', () => {
      const { element } = createButton({ children: 'Click me' })

      expect(element.tagName).toBe('BUTTON')
      expect(element.type).toBe('button')
      expect(element.textContent).toContain('Click me')
    })

    it('should apply default variant and size classes', () => {
      const { element } = createButton({ children: 'Button' })

      expect(element.className).toContain('button')
      expect(element.className).toContain('button-primary')
      expect(element.className).toContain('button-md')
    })

    it('should create button with custom ID', () => {
      const { element } = createButton({ id: 'submit-btn', children: 'Submit' })

      expect(element.id).toBe('submit-btn')
    })

    it('should apply custom className', () => {
      const { element } = createButton({
        className: 'custom-class',
        children: 'Button',
      })

      expect(element.className).toContain('custom-class')
    })

    it('should apply inline styles', () => {
      const { element } = createButton({
        style: { backgroundColor: 'red', color: 'white' } as any,
        children: 'Styled',
      })

      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.color).toBe('white')
    })
  })

  describe('Button Variants', () => {
    it('should apply primary variant class', () => {
      const { element } = createButton({
        variant: 'primary',
        children: 'Primary',
      })

      expect(element.className).toContain('button-primary')
    })

    it('should apply secondary variant class', () => {
      const { element } = createButton({
        variant: 'secondary',
        children: 'Secondary',
      })

      expect(element.className).toContain('button-secondary')
    })

    it('should apply outline variant class', () => {
      const { element } = createButton({
        variant: 'outline',
        children: 'Outline',
      })

      expect(element.className).toContain('button-outline')
    })

    it('should apply ghost variant class', () => {
      const { element } = createButton({
        variant: 'ghost',
        children: 'Ghost',
      })

      expect(element.className).toContain('button-ghost')
    })

    it('should apply danger variant class', () => {
      const { element } = createButton({
        variant: 'danger',
        children: 'Danger',
      })

      expect(element.className).toContain('button-danger')
    })
  })

  describe('Button Sizes', () => {
    it('should apply small size class', () => {
      const { element } = createButton({ size: 'sm', children: 'Small' })

      expect(element.className).toContain('button-sm')
    })

    it('should apply medium size class', () => {
      const { element } = createButton({ size: 'md', children: 'Medium' })

      expect(element.className).toContain('button-md')
    })

    it('should apply large size class', () => {
      const { element } = createButton({ size: 'lg', children: 'Large' })

      expect(element.className).toContain('button-lg')
    })
  })

  describe('Button Type Attribute', () => {
    it('should set type to button by default', () => {
      const { element } = createButton({ children: 'Button' })

      expect(element.type).toBe('button')
    })

    it('should set type to submit', () => {
      const { element } = createButton({ type: 'submit', children: 'Submit' })

      expect(element.type).toBe('submit')
    })

    it('should set type to reset', () => {
      const { element } = createButton({ type: 'reset', children: 'Reset' })

      expect(element.type).toBe('reset')
    })
  })

  describe('Full Width', () => {
    it('should apply full-width class when fullWidth is true', () => {
      const { element } = createButton({ fullWidth: true, children: 'Full' })

      expect(element.className).toContain('button-full-width')
    })

    it('should not apply full-width class when fullWidth is false', () => {
      const { element } = createButton({ fullWidth: false, children: 'Normal' })

      expect(element.className).not.toContain('button-full-width')
    })
  })

  describe('Disabled State', () => {
    it('should be enabled by default', () => {
      const { element } = createButton({ children: 'Button' })

      expect(element.disabled).toBe(false)
    })

    it('should be disabled when disabled is true', () => {
      const { element } = createButton({ disabled: true, children: 'Disabled' })

      expect(element.disabled).toBe(true)
      expect(element.getAttribute('aria-disabled')).toBe('true')
    })

    it('should be disabled when disabled is false', () => {
      const { element } = createButton({
        disabled: false,
        children: 'Enabled',
      })

      expect(element.disabled).toBe(false)
      expect(element.hasAttribute('aria-disabled')).toBe(false)
    })

    it('should react to disabled signal changes', () => {
      const disabledSignal = signal(false)
      const { element } = createButton({
        disabled: disabledSignal,
        children: 'Toggle',
      })

      expect(element.disabled).toBe(false)

      disabledSignal.set(true)
      expect(element.disabled).toBe(true)
      expect(element.getAttribute('aria-disabled')).toBe('true')

      disabledSignal.set(false)
      expect(element.disabled).toBe(false)
      expect(element.hasAttribute('aria-disabled')).toBe(false)
    })

    it('should prevent click when disabled', () => {
      const onPress = vi.fn()
      const { element } = createButton({
        disabled: true,
        onPress,
        children: 'Disabled',
      })
      container.appendChild(element)

      element.click()

      expect(onPress).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should not be loading by default', () => {
      const { element } = createButton({ children: 'Button' })

      expect(element.hasAttribute('aria-busy')).toBe(false)
      expect(element.disabled).toBe(false)
    })

    it('should show loading state when loading is true', () => {
      const { element } = createButton({
        loading: true,
        children: 'Button',
      })

      expect(element.disabled).toBe(true)
      expect(element.getAttribute('aria-busy')).toBe('true')

      const spinner = element.querySelector('.button-spinner')
      expect(spinner).toBeTruthy()
      expect((spinner as HTMLElement).style.display).toBe('inline-block')
    })

    it('should react to loading signal changes for aria-busy', async () => {
      const loadingSignal = signal(false)
      const { element } = createButton({
        loading: loadingSignal,
        children: 'Submit',
      })

      expect(element.hasAttribute('aria-busy')).toBe(false)

      loadingSignal.set(true)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(element.getAttribute('aria-busy')).toBe('true')

      loadingSignal.set(false)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(element.hasAttribute('aria-busy')).toBe(false)
    })

    it('should disable button when loading signal is true', async () => {
      const loadingSignal = signal(false)
      const { element } = createButton({
        loading: loadingSignal,
        children: 'Submit',
      })

      expect(element.disabled).toBe(false)

      loadingSignal.set(true)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(element.disabled).toBe(true)
    })

    it('should hide content when loading', () => {
      const { element } = createButton({
        loading: true,
        children: 'Loading',
      })

      const contentWrapper = element.querySelector('.button-content')
      expect(contentWrapper).toBeTruthy()
      expect((contentWrapper as HTMLElement).style.visibility).toBe('hidden')
    })

    it('should show loading text when loading', () => {
      const { element } = createButton({
        loading: true,
        loadingText: 'Processing...',
        children: 'Submit',
      })

      const textContent = element.querySelector('.button-text')
      expect(textContent?.textContent).toBe('Processing...')
    })

    it('should restore original text after loading', () => {
      const loadingSignal = signal(true)
      const { element } = createButton({
        loading: loadingSignal,
        loadingText: 'Loading...',
        children: 'Click me',
      })

      const textContent = element.querySelector('.button-text')
      expect(textContent?.textContent).toBe('Loading...')

      loadingSignal.set(false)
      expect(textContent?.textContent).toBe('Click me')
    })
  })

  describe('Icon Rendering', () => {
    it('should render left icon', () => {
      const leftIcon = document.createElement('span')
      leftIcon.textContent = '←'

      const { element } = createButton({
        leftIcon,
        children: 'Back',
      })

      const iconElement = element.querySelector('.button-icon-left')
      expect(iconElement).toBeTruthy()
      expect(iconElement?.textContent).toBe('←')
    })

    it('should render right icon', () => {
      const rightIcon = document.createElement('span')
      rightIcon.textContent = '→'

      const { element } = createButton({
        rightIcon,
        children: 'Next',
      })

      const iconElement = element.querySelector('.button-icon-right')
      expect(iconElement).toBeTruthy()
      expect(iconElement?.textContent).toBe('→')
    })

    it('should render both left and right icons', () => {
      const leftIcon = document.createElement('span')
      leftIcon.textContent = '←'
      const rightIcon = document.createElement('span')
      rightIcon.textContent = '→'

      const { element } = createButton({
        leftIcon,
        rightIcon,
        children: 'Both',
      })

      const leftIconElement = element.querySelector('.button-icon-left')
      const rightIconElement = element.querySelector('.button-icon-right')

      expect(leftIconElement).toBeTruthy()
      expect(rightIconElement).toBeTruthy()
      expect(leftIconElement?.textContent).toBe('←')
      expect(rightIconElement?.textContent).toBe('→')
    })

    it('should apply icon classes', () => {
      const leftIcon = document.createElement('span')
      const { element } = createButton({ leftIcon, children: 'Icon' })

      const iconElement = element.querySelector('.button-icon')
      expect(iconElement).toBeTruthy()
      expect(iconElement?.classList.contains('button-icon-left')).toBe(true)
    })
  })

  describe('Children Content Types', () => {
    it('should render string children', () => {
      const { element } = createButton({ children: 'Click me' })

      const textContent = element.querySelector('.button-text')
      expect(textContent?.textContent).toBe('Click me')
    })

    it('should render HTMLElement children', () => {
      const child = document.createElement('span')
      child.textContent = 'Custom Element'

      const { element } = createButton({ children: child })

      const textContent = element.querySelector('.button-text')
      expect(textContent?.querySelector('span')).toBeTruthy()
      expect(textContent?.textContent).toBe('Custom Element')
    })

    it('should render array of HTMLElement children', () => {
      const child1 = document.createElement('span')
      child1.textContent = 'First'
      const child2 = document.createElement('span')
      child2.textContent = 'Second'

      const { element } = createButton({ children: [child1, child2] })

      const textContent = element.querySelector('.button-text')
      expect(textContent?.querySelectorAll('span').length).toBe(2)
    })
  })

  describe('Event Handlers - onPress', () => {
    it('should call onPress on click', () => {
      const onPress = vi.fn()
      const { element } = createButton({ onPress, children: 'Click' })
      container.appendChild(element)

      element.click()

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should not call onPress when disabled', () => {
      const onPress = vi.fn()
      const { element } = createButton({
        onPress,
        disabled: true,
        children: 'Disabled',
      })
      container.appendChild(element)

      element.click()

      expect(onPress).not.toHaveBeenCalled()
    })

    it('should handle async onPress', async () => {
      const onPress = vi.fn().mockResolvedValue(undefined)
      const { element } = createButton({ onPress, children: 'Async' })
      container.appendChild(element)

      element.click()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should handle onPress errors gracefully', async () => {
      const onPress = vi.fn().mockRejectedValue(new Error('Test error'))
      const { element } = createButton({ onPress, children: 'Error' })
      container.appendChild(element)

      // Should not throw
      element.click()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(onPress).toHaveBeenCalledTimes(1)
    })
  })

  describe('Event Handlers - Pointer Events', () => {
    it('should call onPressStart on pointerdown', () => {
      const onPressStart = vi.fn()
      const { element } = createButton({
        onPress: () => {},
        onPressStart,
        children: 'Press',
      })
      container.appendChild(element)

      // Use MouseEvent as JSDOM doesn't fully support PointerEvent
      const event = new MouseEvent('pointerdown', { bubbles: true })
      element.dispatchEvent(event)

      expect(onPressStart).toHaveBeenCalledTimes(1)
    })

    it('should call onPressEnd on pointerup', () => {
      const onPressEnd = vi.fn()
      const { element } = createButton({
        onPress: () => {},
        onPressEnd,
        children: 'Press',
      })
      container.appendChild(element)

      const downEvent = new MouseEvent('pointerdown', { bubbles: true })
      element.dispatchEvent(downEvent)

      const upEvent = new MouseEvent('pointerup', { bubbles: true })
      element.dispatchEvent(upEvent)

      expect(onPressEnd).toHaveBeenCalledTimes(1)
    })

    it('should add pressed class on pointerdown', () => {
      const { element } = createButton({
        onPress: () => {},
        children: 'Press',
      })
      container.appendChild(element)

      const event = new MouseEvent('pointerdown', { bubbles: true })
      element.dispatchEvent(event)

      expect(element.classList.contains('button-pressed')).toBe(true)
    })

    it('should remove pressed class on pointerup', () => {
      const { element } = createButton({
        onPress: () => {},
        children: 'Press',
      })
      container.appendChild(element)

      const downEvent = new MouseEvent('pointerdown', { bubbles: true })
      element.dispatchEvent(downEvent)

      const upEvent = new MouseEvent('pointerup', { bubbles: true })
      element.dispatchEvent(upEvent)

      expect(element.classList.contains('button-pressed')).toBe(false)
    })

    it('should handle pointercancel', () => {
      const { element } = createButton({
        onPress: () => {},
        children: 'Press',
      })
      container.appendChild(element)

      const downEvent = new MouseEvent('pointerdown', { bubbles: true })
      element.dispatchEvent(downEvent)

      expect(element.classList.contains('button-pressed')).toBe(true)

      const cancelEvent = new MouseEvent('pointercancel', { bubbles: true })
      element.dispatchEvent(cancelEvent)

      expect(element.classList.contains('button-pressed')).toBe(false)
    })

    it('should not trigger press events when disabled', () => {
      const onPressStart = vi.fn()
      const onPressEnd = vi.fn()
      const { element } = createButton({
        onPress: () => {},
        onPressStart,
        onPressEnd,
        disabled: true,
        children: 'Disabled',
      })
      container.appendChild(element)

      const downEvent = new MouseEvent('pointerdown', { bubbles: true })
      element.dispatchEvent(downEvent)

      expect(onPressStart).not.toHaveBeenCalled()
      expect(element.classList.contains('button-pressed')).toBe(false)
    })
  })

  describe('Event Handlers - Keyboard Accessibility', () => {
    it('should trigger press on Enter key', () => {
      const onPress = vi.fn()
      const { element } = createButton({ onPress, children: 'Press' })
      container.appendChild(element)

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
      element.dispatchEvent(keydownEvent)

      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        bubbles: true,
      })
      element.dispatchEvent(keyupEvent)

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should trigger press on Space key', () => {
      const onPress = vi.fn()
      const { element } = createButton({ onPress, children: 'Press' })
      container.appendChild(element)

      const keydownEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      })
      element.dispatchEvent(keydownEvent)

      const keyupEvent = new KeyboardEvent('keyup', {
        key: ' ',
        bubbles: true,
      })
      element.dispatchEvent(keyupEvent)

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should add pressed class on keyboard press', () => {
      const { element } = createButton({
        onPress: () => {},
        children: 'Press',
      })
      container.appendChild(element)

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
      element.dispatchEvent(keydownEvent)

      expect(element.classList.contains('button-pressed')).toBe(true)
    })

    it('should remove pressed class on keyboard release', () => {
      const { element } = createButton({
        onPress: () => {},
        children: 'Press',
      })
      container.appendChild(element)

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
      element.dispatchEvent(keydownEvent)

      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        bubbles: true,
      })
      element.dispatchEvent(keyupEvent)

      expect(element.classList.contains('button-pressed')).toBe(false)
    })

    it('should not trigger on other keys', () => {
      const onPress = vi.fn()
      const { element } = createButton({ onPress, children: 'Press' })
      container.appendChild(element)

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
      })
      element.dispatchEvent(keydownEvent)

      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'a',
        bubbles: true,
      })
      element.dispatchEvent(keyupEvent)

      expect(onPress).not.toHaveBeenCalled()
    })

    it('should call onKeyDown handler', () => {
      const onKeyDown = vi.fn()
      const { element } = createButton({
        onPress: () => {},
        onKeyDown,
        children: 'Press',
      })
      container.appendChild(element)

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
      })
      element.dispatchEvent(event)

      expect(onKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Event Handlers - Focus and Blur', () => {
    it('should call onFocus handler', () => {
      const onFocus = vi.fn()
      const { element } = createButton({ onFocus, children: 'Focus' })
      container.appendChild(element)

      element.focus()

      expect(onFocus).toHaveBeenCalledTimes(1)
    })

    it('should call onBlur handler', () => {
      const onBlur = vi.fn()
      const { element } = createButton({ onBlur, children: 'Blur' })
      container.appendChild(element)

      element.focus()
      element.blur()

      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('ARIA Attributes', () => {
    it('should set aria-label', () => {
      const { element } = createButton({
        ariaLabel: 'Close dialog',
        children: 'X',
      })

      expect(element.getAttribute('aria-label')).toBe('Close dialog')
    })

    it('should set aria-describedby', () => {
      const { element } = createButton({
        ariaDescribedby: 'desc-1',
        children: 'Button',
      })

      expect(element.getAttribute('aria-describedby')).toBe('desc-1')
    })

    it('should set aria-expanded', () => {
      const { element } = createButton({
        ariaExpanded: true,
        children: 'Menu',
      })

      expect(element.getAttribute('aria-expanded')).toBe('true')
    })

    it('should set aria-pressed', () => {
      const { element } = createButton({
        ariaPressed: false,
        children: 'Toggle',
      })

      expect(element.getAttribute('aria-pressed')).toBe('false')
    })

    it('should set aria-controls', () => {
      const { element } = createButton({
        ariaControls: 'panel-1',
        children: 'Toggle',
      })

      expect(element.getAttribute('aria-controls')).toBe('panel-1')
    })

    it('should set aria-disabled when disabled', () => {
      const { element } = createButton({
        disabled: true,
        children: 'Disabled',
      })

      expect(element.getAttribute('aria-disabled')).toBe('true')
    })

    it('should set aria-busy when loading', () => {
      const { element } = createButton({
        loading: true,
        children: 'Loading',
      })

      expect(element.getAttribute('aria-busy')).toBe('true')
    })

    it('should set custom role', () => {
      const { element } = createButton({
        role: 'menuitem',
        children: 'Item',
      })

      expect(element.getAttribute('role')).toBe('menuitem')
    })
  })

  describe('Update Function', () => {
    it('should update button type', () => {
      const { element, update } = createButton({
        type: 'button',
        children: 'Button',
      })

      expect(element.type).toBe('button')

      update({ type: 'submit' })

      expect(element.type).toBe('submit')
    })

    it('should update className', () => {
      const { element, update } = createButton({
        className: 'initial',
        children: 'Button',
      })

      expect(element.className).toContain('initial')

      update({ className: 'updated' })

      expect(element.className).toContain('updated')
      expect(element.className).not.toContain('initial')
    })

    it('should update inline styles', () => {
      const { element, update } = createButton({ children: 'Button' })

      update({ style: { color: 'blue' } as any })

      expect(element.style.color).toBe('blue')
    })

    it('should update aria-label', () => {
      const { element, update } = createButton({
        ariaLabel: 'Initial',
        children: 'Button',
      })

      expect(element.getAttribute('aria-label')).toBe('Initial')

      update({ ariaLabel: 'Updated' })

      expect(element.getAttribute('aria-label')).toBe('Updated')
    })

    it('should update disabled state', () => {
      const { element, update } = createButton({
        disabled: false,
        children: 'Button',
      })

      expect(element.disabled).toBe(false)

      update({ disabled: true })

      expect(element.disabled).toBe(true)
    })

    it('should update loading state', () => {
      const { element, update } = createButton({
        loading: false,
        children: 'Button',
      })

      expect(element.hasAttribute('aria-busy')).toBe(false)

      update({ loading: true })

      expect(element.getAttribute('aria-busy')).toBe('true')
    })
  })

  describe('Dispose Function', () => {
    it('should remove event listeners on dispose', () => {
      const onPress = vi.fn()
      const { element, dispose } = createButton({
        onPress,
        children: 'Button',
      })
      container.appendChild(element)

      dispose()

      element.click()

      // Event should not fire after disposal
      expect(onPress).not.toHaveBeenCalled()
    })

    it('should cleanup effects on dispose', () => {
      const loadingSignal = signal(false)
      const { element, dispose } = createButton({
        loading: loadingSignal,
        children: 'Button',
      })

      dispose()

      loadingSignal.set(true)

      // Loading state should not update after disposal
      expect(element.hasAttribute('aria-busy')).toBe(false)
    })
  })

  describe('createIconButton()', () => {
    it('should create icon button with icon', () => {
      const icon = document.createElement('span')
      icon.textContent = '🔍'

      const { element } = createIconButton({
        icon,
        ariaLabel: 'Search',
      })

      expect(element.tagName).toBe('BUTTON')
      expect(element.className).toContain('icon-button')
      expect(element.textContent).toContain('🔍')
    })

    it('should apply aria-label to icon button', () => {
      const icon = document.createElement('span')
      icon.textContent = '✕'

      const { element } = createIconButton({
        icon,
        ariaLabel: 'Close',
      })

      expect(element.getAttribute('aria-label')).toBe('Close')
    })

    it('should inherit button props', () => {
      const icon = document.createElement('span')
      const onPress = vi.fn()

      const { element } = createIconButton({
        icon,
        ariaLabel: 'Click',
        variant: 'outline',
        size: 'sm',
        onPress,
      })

      expect(element.className).toContain('button-outline')
      expect(element.className).toContain('button-sm')

      element.click()
      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should combine icon-button class with custom className', () => {
      const icon = document.createElement('span')

      const { element } = createIconButton({
        icon,
        ariaLabel: 'Custom',
        className: 'custom-class',
      })

      expect(element.className).toContain('icon-button')
      expect(element.className).toContain('custom-class')
    })

    it('should handle disabled icon button', () => {
      const icon = document.createElement('span')

      const { element } = createIconButton({
        icon,
        ariaLabel: 'Disabled',
        disabled: true,
      })

      expect(element.disabled).toBe(true)
    })
  })

  describe('Form Integration', () => {
    it('should submit form when type is submit', () => {
      const form = document.createElement('form')
      const onSubmit = vi.fn((e) => e.preventDefault())
      form.addEventListener('submit', onSubmit)

      const { element } = createButton({
        type: 'submit',
        children: 'Submit',
      })

      form.appendChild(element)
      container.appendChild(form)

      element.click()

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('should reset form when type is reset', () => {
      const form = document.createElement('form')
      const input = document.createElement('input')
      input.type = 'text'
      input.value = 'test'
      form.appendChild(input)

      const { element } = createButton({
        type: 'reset',
        children: 'Reset',
      })

      form.appendChild(element)
      container.appendChild(form)

      element.click()

      expect(input.value).toBe('')
    })

    it('should not submit form when type is button', () => {
      const form = document.createElement('form')
      const onSubmit = vi.fn((e) => e.preventDefault())
      form.addEventListener('submit', onSubmit)

      const { element } = createButton({
        type: 'button',
        children: 'Button',
      })

      form.appendChild(element)
      container.appendChild(form)

      element.click()

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle complete button with all props', () => {
      const leftIcon = document.createElement('span')
      leftIcon.textContent = '←'
      const onPress = vi.fn()

      const { element } = createButton({
        type: 'submit',
        variant: 'primary',
        size: 'lg',
        disabled: false,
        loading: false,
        fullWidth: true,
        children: 'Submit Form',
        leftIcon,
        loadingText: 'Submitting...',
        className: 'custom-submit',
        style: { marginTop: '10px' } as any,
        id: 'submit-btn',
        ariaLabel: 'Submit the form',
        onPress,
      })

      expect(element.type).toBe('submit')
      expect(element.className).toContain('button-primary')
      expect(element.className).toContain('button-lg')
      expect(element.className).toContain('button-full-width')
      expect(element.className).toContain('custom-submit')
      expect(element.id).toBe('submit-btn')
      expect(element.getAttribute('aria-label')).toBe('Submit the form')
      expect(element.querySelector('.button-icon-left')).toBeTruthy()

      element.click()
      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should handle disabled button with loading state', () => {
      const disabledSignal = signal(false)
      const loadingSignal = signal(false)

      const { element } = createButton({
        disabled: disabledSignal,
        loading: loadingSignal,
        children: 'Process',
      })

      expect(element.disabled).toBe(false)

      loadingSignal.set(true)
      expect(element.disabled).toBe(true)
      expect(element.getAttribute('aria-busy')).toBe('true')

      disabledSignal.set(true)
      expect(element.disabled).toBe(true)

      loadingSignal.set(false)
      expect(element.disabled).toBe(true) // Still disabled due to disabledSignal
    })
  })
})
