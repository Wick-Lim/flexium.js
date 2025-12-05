import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useMouse, MouseButton } from '../useMouse'

describe('useMouse', () => {
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
    const mouse = useMouse({ target })

    expect(mouse).toBeDefined()
    expect(mouse.position).toBeDefined()
    expect(mouse.delta).toBeDefined()
    expect(mouse.wheelDelta).toBeDefined()
    expect(typeof mouse.isPressed).toBe('function')
    expect(typeof mouse.isLeftPressed).toBe('function')
    expect(typeof mouse.isRightPressed).toBe('function')
    expect(typeof mouse.isMiddlePressed).toBe('function')
    expect(typeof mouse.clearFrameState).toBe('function')
    expect(typeof mouse.dispose).toBe('function')

    mouse.dispose()
  })

  it('should track mouse position', () => {
    const mouse = useMouse({ target })

    expect(mouse.position().x).toBe(0)
    expect(mouse.position().y).toBe(0)

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 200 })
    )

    expect(mouse.position().x).toBe(100)
    expect(mouse.position().y).toBe(200)

    mouse.dispose()
  })

  it('should track mouse delta', () => {
    const mouse = useMouse({ target })

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
    )
    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 150, clientY: 120 })
    )

    expect(mouse.delta().x).toBe(150) // 0 + 100 + 50
    expect(mouse.delta().y).toBe(120) // 0 + 100 + 20

    mouse.dispose()
  })

  it('should clear frame state', () => {
    const mouse = useMouse({ target })

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
    )

    mouse.clearFrameState()

    expect(mouse.delta().x).toBe(0)
    expect(mouse.delta().y).toBe(0)

    mouse.dispose()
  })

  it('should detect left mouse button', () => {
    const mouse = useMouse({ target })

    expect(mouse.isLeftPressed()).toBe(false)

    target.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))

    expect(mouse.isLeftPressed()).toBe(true)
    expect(mouse.isPressed(0)).toBe(true)

    target.dispatchEvent(new MouseEvent('mouseup', { button: 0 }))

    expect(mouse.isLeftPressed()).toBe(false)

    mouse.dispose()
  })

  it('should detect right mouse button', () => {
    const mouse = useMouse({ target })

    expect(mouse.isRightPressed()).toBe(false)

    target.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))

    expect(mouse.isRightPressed()).toBe(true)
    expect(mouse.isPressed(2)).toBe(true)

    mouse.dispose()
  })

  it('should detect middle mouse button', () => {
    const mouse = useMouse({ target })

    expect(mouse.isMiddlePressed()).toBe(false)

    target.dispatchEvent(new MouseEvent('mousedown', { button: 1 }))

    expect(mouse.isMiddlePressed()).toBe(true)
    expect(mouse.isPressed(1)).toBe(true)

    mouse.dispose()
  })

  it('should track wheel delta', () => {
    const mouse = useMouse({ target })

    expect(mouse.wheelDelta()).toBe(0)

    target.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))

    expect(mouse.wheelDelta()).toBe(1) // Sign of deltaY

    target.dispatchEvent(new WheelEvent('wheel', { deltaY: -50 }))

    expect(mouse.wheelDelta()).toBe(0) // 1 + (-1)

    mouse.dispose()
  })

  it('should clear buttons on mouse leave', () => {
    const mouse = useMouse({ target })

    target.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    expect(mouse.isLeftPressed()).toBe(true)

    target.dispatchEvent(new MouseEvent('mouseleave'))
    expect(mouse.isLeftPressed()).toBe(false)

    mouse.dispose()
  })

  it('should cleanup event listeners on dispose', () => {
    const removeEventListenerSpy = vi.spyOn(target, 'removeEventListener')
    const mouse = useMouse({ target })

    mouse.dispose()

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
    const mouse = useMouse({ target })

    target.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    target.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))

    expect(mouse.isLeftPressed()).toBe(true)
    expect(mouse.isRightPressed()).toBe(true)

    target.dispatchEvent(new MouseEvent('mouseup', { button: 0 }))

    expect(mouse.isLeftPressed()).toBe(false)
    expect(mouse.isRightPressed()).toBe(true)

    mouse.dispose()
  })
})

describe('MouseButton constants', () => {
  it('should have button constants', () => {
    expect(MouseButton.Left).toBe(0)
    expect(MouseButton.Middle).toBe(1)
    expect(MouseButton.Right).toBe(2)
  })
})
