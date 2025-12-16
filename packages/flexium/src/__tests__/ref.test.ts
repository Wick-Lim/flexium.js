/**
 * Ref API Tests
 *
 * ref, forwardRef 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { ref, forwardRef } from '../core'
import type { RefObject } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('ref()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create a ref with initial value', () => {
    let capturedRef: RefObject<number> | null = null

    function App() {
      const myRef = ref(42)
      capturedRef = myRef
      return f('div', {}, String(myRef.current))
    }

    render(f(App), container)

    expect(capturedRef).not.toBeNull()
    expect(capturedRef!.current).toBe(42)
  })

  it('should attach ref to DOM element', async () => {
    let capturedElement: HTMLDivElement | null = null

    function App() {
      const divRef = ref<HTMLDivElement | null>(null)

      return f('div', {}, [
        f('div', { ref: divRef, 'data-testid': 'target' }, 'Target'),
        f('button', {
          'data-testid': 'check',
          onclick: () => { capturedElement = divRef.current }
        }, 'Check')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="check"]')?.click()
    await nextTick()

    expect(capturedElement).not.toBeNull()
    expect(capturedElement?.textContent).toBe('Target')
  })

  it('should work with input focus pattern', async () => {
    function SearchInput() {
      const inputRef = ref<HTMLInputElement | null>(null)

      const focusInput = () => {
        inputRef.current?.focus()
      }

      return f('div', {}, [
        f('input', {
          ref: inputRef,
          type: 'text',
          'data-testid': 'search-input',
          placeholder: 'Search...'
        }),
        f('button', {
          'data-testid': 'focus-btn',
          onclick: focusInput
        }, 'Focus')
      ])
    }

    render(f(SearchInput), container)

    const input = container.querySelector('[data-testid="search-input"]') as HTMLInputElement
    expect(document.activeElement).not.toBe(input)

    container.querySelector<HTMLButtonElement>('[data-testid="focus-btn"]')?.click()
    await nextTick()

    expect(document.activeElement).toBe(input)
  })

  it('should handle mutable ref for storing values', () => {
    function MutableRef() {
      const valueRef = ref({ count: 0 })

      return f('div', {}, [
        f('span', { 'data-testid': 'value' }, String(valueRef.current.count)),
        f('button', {
          'data-testid': 'inc',
          onclick: () => { valueRef.current.count++ }
        }, '+')
      ])
    }

    render(f(MutableRef), container)
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe('0')
  })

  it('should handle null ref gracefully', () => {
    function App() {
      const myRef = ref<HTMLDivElement | null>(null)
      return f('div', {}, String(myRef.current === null))
    }

    render(f(App), container)
    expect(container.textContent).toBe('true')
  })
})

describe('forwardRef()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should forward ref to child element', () => {
    const FancyInput = forwardRef<HTMLInputElement, { placeholder: string }>(
      (props, forwardedRef) => {
        return f('input', {
          ref: forwardedRef,
          type: 'text',
          placeholder: props.placeholder,
          class: 'fancy-input'
        })
      }
    )

    let capturedInput: HTMLInputElement | null = null

    function App() {
      const inputRef = ref<HTMLInputElement | null>(null)

      return f('div', {}, [
        f(FancyInput, { ref: inputRef, placeholder: 'Type here...' }),
        f('button', {
          'data-testid': 'check',
          onclick: () => { capturedInput = inputRef.current }
        }, 'Check')
      ])
    }

    render(f(App), container)

    container.querySelector<HTMLButtonElement>('[data-testid="check"]')?.click()

    expect(capturedInput).not.toBeNull()
    expect(capturedInput?.tagName).toBe('INPUT')
    expect(capturedInput?.placeholder).toBe('Type here...')
  })

  it('should work with callback ref', () => {
    let capturedButton: HTMLButtonElement | null = null

    const FancyButton = forwardRef<HTMLButtonElement, { label: string }>(
      (props, forwardedRef) => {
        return f('button', { ref: forwardedRef, class: 'fancy-btn' }, props.label)
      }
    )

    function App() {
      return f(FancyButton, {
        label: 'Click me',
        ref: (el: HTMLButtonElement | null) => { capturedButton = el }
      })
    }

    render(f(App), container)

    expect(capturedButton).not.toBeNull()
    expect(capturedButton?.textContent).toBe('Click me')
  })

  it('should support complex component with forwarded ref', async () => {
    const CustomInput = forwardRef<HTMLInputElement, {
      label: string
      onChange?: (value: string) => void
    }>((props, forwardedRef) => {
      return f('div', { class: 'custom-input' }, [
        f('label', {}, props.label),
        f('input', {
          ref: forwardedRef,
          type: 'text',
          oninput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value)
        })
      ])
    })

    let lastValue = ''
    let capturedInput: HTMLInputElement | null = null

    function Form() {
      const inputRef = ref<HTMLInputElement | null>(null)

      return f('form', {}, [
        f(CustomInput, {
          ref: inputRef,
          label: 'Username:',
          onChange: (v: string) => { lastValue = v }
        }),
        f('button', {
          type: 'button',
          'data-testid': 'focus',
          onclick: () => {
            capturedInput = inputRef.current
            inputRef.current?.focus()
          }
        }, 'Focus Input')
      ])
    }

    render(f(Form), container)

    container.querySelector<HTMLButtonElement>('[data-testid="focus"]')?.click()
    await nextTick()

    expect(capturedInput).not.toBeNull()
    expect(document.activeElement).toBe(capturedInput)

    // Test onChange
    capturedInput!.value = 'testuser'
    capturedInput!.dispatchEvent(new Event('input'))
    await nextTick()
    expect(lastValue).toBe('testuser')
  })
})
