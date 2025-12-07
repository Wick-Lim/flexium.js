import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mouse, MouseButton } from '../mouse'

describe('mouse', () => {
  let target: HTMLDivElement

  beforeEach(() => {
    target = document.createElement('div')
    document.body.appendChild(target)
  })

  afterEach(() => {
    document.body.removeChild(target)
    vi.restoreAllMocks()
  })

  it('should create mouse state with all methods', () => {
    const m = mouse({ target })

    expect(m).toBeDefined()
    expect(m.position).toBeDefined()
    expect(m.delta).toBeDefined()
    expect(m.wheelDelta).toBeDefined()
    expect(typeof m.isPressed).toBe('function')
    expect(typeof m.isLeftPressed).toBe('function')
    expect(typeof m.isRightPressed).toBe('function')
    expect(typeof m.isMiddlePressed).toBe('function')
    expect(typeof m.clearFrameState).toBe('function')
    expect(typeof m.dispose).toBe('function')

    m.dispose()
  })

  it('should track mouse position', () => {
    const m = mouse({ target })

    expect(m.position().x).toBe(0)
    expect(m.position().y).toBe(0)

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 200 })
    )

    expect(m.position().x).toBe(100)
    expect(m.position().y).toBe(200)

    m.dispose()
  })

  it('should track mouse delta', () => {
    const m = mouse({ target })

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
    )
    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 150, clientY: 120 })
    )

    expect(m.delta().x).toBe(150) // 0 + 100 + 50
    expect(m.delta().y).toBe(120) // 0 + 100 + 20

    m.dispose()
  })

  it('should clear frame state', () => {
    const m = mouse({ target })

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
    )

    m.clearFrameState()

    expect(m.delta().x).toBe(0)
    expect(m.delta().y).toBe(0)

    m.dispose()
  })

  it('should detect left mouse button', () => {
    const m = mouse({ target })

    expect(m.isLeftPressed()).toBe(false)

    target.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))

    expect(m.isLeftPressed()).toBe(true)
    expect(m.isPressed(0)).toBe(true)

    target.dispatchEvent(new MouseEvent('mouseup', { button: 0 }))

    expect(m.isLeftPressed()).toBe(false)

    m.dispose()
  })

  it('should detect right mouse button', () => {
    const m = mouse({ target })

    expect(m.isRightPressed()).toBe(false)

    target.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))

    expect(m.isRightPressed()).toBe(true)
    expect(m.isPressed(2)).toBe(true)

    m.dispose()
  })

  it('should detect middle mouse button', () => {
    const m = mouse({ target })

    expect(m.isMiddlePressed()).toBe(false)

    target.dispatchEvent(new MouseEvent('mousedown', { button: 1 }))

    expect(m.isMiddlePressed()).toBe(true)
    expect(m.isPressed(1)).toBe(true)

    m.dispose()
  })

  it('should track wheel delta', () => {
    const m = mouse({ target })

    expect(m.wheelDelta()).toBe(0)

    target.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))

    expect(m.wheelDelta()).toBe(1) // Sign of deltaY

    target.dispatchEvent(new WheelEvent('wheel', { deltaY: -50 }))

    expect(m.wheelDelta()).toBe(0) // 1 + (-1)

    m.dispose()
  })

  it('should clear buttons on mouse leave', () => {
    const m = mouse({ target })

    target.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    expect(m.isLeftPressed()).toBe(true)

    target.dispatchEvent(new MouseEvent('mouseleave'))
    expect(m.isLeftPressed()).toBe(false)

    m.dispose()
  })

  it('should cleanup event listeners on dispose', () => {
    const removeEventListenerSpy = vi.spyOn(target, 'removeEventListener')
    const m = mouse({ target })

    m.dispose()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function)
    )
  })

  it('should track multiple button presses', () => {
    const m = mouse({ target })

    target.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    target.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))

    expect(m.isLeftPressed()).toBe(true)
    expect(m.isRightPressed()).toBe(true)

    target.dispatchEvent(new MouseEvent('mouseup', { button: 0 }))

    expect(m.isLeftPressed()).toBe(false)
    expect(m.isRightPressed()).toBe(true)

    m.dispose()
  })
})

describe('MouseButton constants', () => {
  it('should have button constants', () => {
    expect(MouseButton.Left).toBe(0)
    expect(MouseButton.Middle).toBe(1)
    expect(MouseButton.Right).toBe(2)
  })
})
