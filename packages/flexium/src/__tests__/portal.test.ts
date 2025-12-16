/**
 * Portal Component Tests
 *
 * Portal로 다른 DOM 노드에 렌더링하는 기능 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, f, Portal } from '../dom'
import { state } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 50))

describe('Portal', () => {
  let container: HTMLDivElement
  let portalTarget: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.setAttribute('data-testid', 'app-root')
    document.body.appendChild(container)

    portalTarget = document.createElement('div')
    portalTarget.setAttribute('id', 'portal-root')
    document.body.appendChild(portalTarget)
  })

  afterEach(() => {
    document.body.removeChild(container)
    document.body.removeChild(portalTarget)
  })

  it('should render children into target element', () => {
    function App() {
      return f('div', {}, [
        f('p', {}, 'Main content'),
        f(Portal, { target: portalTarget }, [
          f('div', { 'data-testid': 'portal-content' }, 'Portal content')
        ])
      ])
    }

    render(f(App), container)

    // Content should be in portal target, not in main container
    expect(container.querySelector('[data-testid="portal-content"]')).toBeNull()
    expect(portalTarget.querySelector('[data-testid="portal-content"]')).not.toBeNull()
    expect(portalTarget.querySelector('[data-testid="portal-content"]')?.textContent).toBe('Portal content')
  })

  it('should render children into target specified by selector', () => {
    function App() {
      return f('div', {}, [
        f(Portal, { target: '#portal-root' }, [
          f('span', { 'data-testid': 'via-selector' }, 'Via selector')
        ])
      ])
    }

    render(f(App), container)

    expect(portalTarget.querySelector('[data-testid="via-selector"]')).not.toBeNull()
  })

  it('should handle dynamic portal content', async () => {
    function Modal({ isOpen }: { isOpen: boolean }) {
      if (!isOpen) return null

      return f(Portal, { target: portalTarget }, [
        f('div', { 'data-testid': 'modal-backdrop' }, [
          f('div', { 'data-testid': 'modal-content' }, 'Modal is open!')
        ])
      ])
    }

    function App() {
      const [isOpen, setIsOpen] = state(false)

      return f('div', {}, [
        f('button', {
          'data-testid': 'open-modal',
          onclick: () => setIsOpen(true)
        }, 'Open Modal'),
        f(Modal, { isOpen })
      ])
    }

    render(f(App), container)

    // Initially modal should not be visible
    expect(portalTarget.querySelector('[data-testid="modal-content"]')).toBeNull()

    // Open modal
    container.querySelector<HTMLButtonElement>('[data-testid="open-modal"]')?.click()
    await nextTick()

    // Portal content should now be rendered
    expect(portalTarget.querySelector('[data-testid="modal-content"]')).not.toBeNull()
  })

  it('should render initial portal content', async () => {
    // Test that Portal renders content to the target on initial mount
    function App() {
      return f('div', {}, [
        f(Portal, { target: portalTarget }, [
          f('div', { 'data-testid': 'portal-count' }, 'Static content')
        ])
      ])
    }

    render(f(App), container)
    await nextTick()

    expect(portalTarget.querySelector('[data-testid="portal-count"]')?.textContent).toBe('Static content')
  })

  it('should support multiple portals', async () => {
    // Test that multiple portals work independently
    function App() {
      return f('div', {}, [
        f(Portal, { target: portalTarget }, [
          f('div', { 'data-testid': 'portal-1' }, 'Portal 1')
        ]),
        f(Portal, { target: portalTarget }, [
          f('div', { 'data-testid': 'portal-2' }, 'Portal 2')
        ])
      ])
    }

    render(f(App), container)
    await nextTick()

    expect(portalTarget.querySelector('[data-testid="portal-1"]')).not.toBeNull()
    expect(portalTarget.querySelector('[data-testid="portal-2"]')).not.toBeNull()
  })

  it('should handle nested portals', async () => {
    const nestedTarget = document.createElement('div')
    nestedTarget.setAttribute('id', 'nested-portal')
    document.body.appendChild(nestedTarget)

    try {
      function App() {
        return f('div', {}, [
          f(Portal, { target: portalTarget }, [
            f('div', { 'data-testid': 'level-1' }, [
              'Level 1',
              f(Portal, { target: nestedTarget }, [
                f('div', { 'data-testid': 'level-2' }, 'Level 2')
              ])
            ])
          ])
        ])
      }

      render(f(App), container)

      expect(portalTarget.querySelector('[data-testid="level-1"]')).not.toBeNull()
      expect(nestedTarget.querySelector('[data-testid="level-2"]')).not.toBeNull()
    } finally {
      document.body.removeChild(nestedTarget)
    }
  })

  it('should warn when target is not found', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    function App() {
      return f(Portal, { target: '#non-existent' }, [
        f('div', {}, 'Content')
      ])
    }

    render(f(App), container)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Flexium Portal]'),
      expect.anything()
    )

    warnSpy.mockRestore()
  })
})

// Import vi for spy
import { vi } from 'vitest'
