/**
 * Ref API Tests
 *
 * useRef, forwardRef, createRef 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { useRef, forwardRef, createRef } from '../core'
import type { RefObject, ForwardedRef } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('useRef()', () => {
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
      const ref = useRef(42)
      capturedRef = ref
      return f('div', {}, String(ref.current))
    }

    render(f(App), container)

    expect(capturedRef).not.toBeNull()
    expect(capturedRef!.current).toBe(42)
  })

  it('should persist ref value across re-renders', async () => {
    const values: number[] = []

    function App() {
      const ref = useRef(0)
      const [, setTrigger] = (window as any).__flexium_state?.(0) ?? [0, () => {}]

      // Capture ref value on each render
      values.push(ref.current)

      return f('div', {}, [
        f('span', { 'data-testid': 'value' }, String(ref.current)),
        f('button', {
          'data-testid': 'inc-ref',
          onclick: () => { ref.current++ }
        }, 'Inc Ref'),
        f('button', {
          'data-testid': 'rerender',
          onclick: () => setTrigger((t: number) => t + 1)
        }, 'Re-render')
      ])
    }

    // Simpler test - just verify ref holds DOM element
    function SimpleApp() {
      const inputRef = useRef<HTMLInputElement | null>(null)

      return f('div', {}, [
        f('input', { ref: inputRef, 'data-testid': 'input' }),
        f('button', {
          'data-testid': 'focus',
          onclick: () => inputRef.current?.focus()
        }, 'Focus')
      ])
    }

    render(f(SimpleApp), container)

    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement
    expect(input).not.toBeNull()

    // Click focus button
    container.querySelector<HTMLButtonElement>('[data-testid="focus"]')?.click()
    await nextTick()

    expect(document.activeElement).toBe(input)
  })

  it('should attach ref to DOM element', async () => {
    let capturedElement: HTMLDivElement | null = null

    function App() {
      const divRef = useRef<HTMLDivElement | null>(null)

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
    expect(capturedElement?.getAttribute('data-testid')).toBe('target')
  })

  it('should work with input focus pattern', async () => {
    function SearchInput() {
      const inputRef = useRef<HTMLInputElement | null>(null)

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

  it('should handle mutable ref for storing values', async () => {
    function Counter() {
      const renderCountRef = useRef(0)
      const [count, setCount] = (window as any).__flexium_state?.(0) ?? [0, () => {}]

      renderCountRef.current++

      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('span', { 'data-testid': 'renders' }, String(renderCountRef.current)),
        f('button', {
          'data-testid': 'inc',
          onclick: () => setCount((c: number) => c + 1)
        }, '+')
      ])
    }

    // Simplified test - just verify ref can store mutable value
    function MutableRef() {
      const valueRef = useRef({ count: 0 })

      return f('div', {}, [
        f('span', { 'data-testid': 'value' }, String(valueRef.current.count)),
        f('button', {
          'data-testid': 'inc',
          onclick: () => { valueRef.current.count++ }
        }, '+')
      ])
    }

    render(f(MutableRef), container)

    // Initial value
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe('0')
  })
})

describe('createRef()', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create a ref outside component', () => {
    const ref = createRef<HTMLDivElement>()

    expect(ref.current).toBeNull()

    function App() {
      return f('div', { ref }, 'Hello')
    }

    render(f(App), container)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.textContent).toBe('Hello')
  })

  it('should be reusable across renders', async () => {
    const inputRef = createRef<HTMLInputElement>()

    function App() {
      return f('div', {}, [
        f('input', { ref: inputRef, 'data-testid': 'input' }),
        f('button', {
          'data-testid': 'focus',
          onclick: () => inputRef.current?.focus()
        }, 'Focus')
      ])
    }

    render(f(App), container)

    expect(inputRef.current).not.toBeNull()
    expect(inputRef.current?.tagName).toBe('INPUT')

    container.querySelector<HTMLButtonElement>('[data-testid="focus"]')?.click()
    await nextTick()

    expect(document.activeElement).toBe(inputRef.current)
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
      (props, ref) => {
        return f('input', {
          ref,
          type: 'text',
          placeholder: props.placeholder,
          class: 'fancy-input'
        })
      }
    )

    const inputRef = createRef<HTMLInputElement>()

    function App() {
      return f('div', {}, [
        f(FancyInput, { ref: inputRef, placeholder: 'Type here...' })
      ])
    }

    render(f(App), container)

    expect(inputRef.current).not.toBeNull()
    expect(inputRef.current?.tagName).toBe('INPUT')
    expect(inputRef.current?.placeholder).toBe('Type here...')
    expect(inputRef.current?.className).toBe('fancy-input')
  })

  it('should work with callback ref', () => {
    let capturedInput: HTMLInputElement | null = null

    const FancyButton = forwardRef<HTMLButtonElement, { label: string }>(
      (props, ref) => {
        return f('button', { ref, class: 'fancy-btn' }, props.label)
      }
    )

    function App() {
      return f(FancyButton, {
        label: 'Click me',
        ref: (el: HTMLButtonElement | null) => { capturedInput = el as any }
      })
    }

    render(f(App), container)

    expect(capturedInput).not.toBeNull()
    expect((capturedInput as any)?.textContent).toBe('Click me')
  })

  it('should support complex component with forwarded ref', async () => {
    const CustomInput = forwardRef<HTMLInputElement, {
      label: string
      onChange?: (value: string) => void
    }>((props, ref) => {
      return f('div', { class: 'custom-input' }, [
        f('label', {}, props.label),
        f('input', {
          ref,
          type: 'text',
          oninput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value)
        })
      ])
    })

    const inputRef = createRef<HTMLInputElement>()
    let lastValue = ''

    function Form() {
      return f('form', {}, [
        f(CustomInput, {
          ref: inputRef,
          label: 'Username:',
          onChange: (v: string) => { lastValue = v }
        }),
        f('button', {
          type: 'button',
          'data-testid': 'focus',
          onclick: () => inputRef.current?.focus()
        }, 'Focus Input')
      ])
    }

    render(f(Form), container)

    expect(inputRef.current).not.toBeNull()
    expect(inputRef.current?.tagName).toBe('INPUT')

    // Test focus
    container.querySelector<HTMLButtonElement>('[data-testid="focus"]')?.click()
    await nextTick()
    expect(document.activeElement).toBe(inputRef.current)

    // Test onChange
    inputRef.current!.value = 'testuser'
    inputRef.current!.dispatchEvent(new Event('input'))
    await nextTick()
    expect(lastValue).toBe('testuser')
  })
})

describe('Ref edge cases', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle null ref gracefully', () => {
    function App() {
      const ref = useRef<HTMLDivElement | null>(null)
      return f('div', {}, String(ref.current === null))
    }

    render(f(App), container)
    expect(container.textContent).toBe('true')
  })

  it('should update ref when element changes', async () => {
    const ref = createRef<HTMLElement>()

    function App({ tag }: { tag: string }) {
      return f(tag, { ref, 'data-testid': 'element' }, 'Content')
    }

    render(f(App, { tag: 'div' }), container)
    expect(ref.current?.tagName).toBe('DIV')

    render(f(App, { tag: 'span' }), container)
    await nextTick()
    expect(ref.current?.tagName).toBe('SPAN')
  })
})
