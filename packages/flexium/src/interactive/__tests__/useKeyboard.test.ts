import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { keyboard, Keys } from '../keyboard'

describe('keyboard', () => {
  let target: EventTarget

  beforeEach(() => {
    target = new EventTarget()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create keyboard state with all methods', () => {
    const kb = keyboard(target)

    expect(kb).toBeDefined()
    expect(typeof kb.isPressed).toBe('function')
    expect(typeof kb.isJustPressed).toBe('function')
    expect(typeof kb.isJustReleased).toBe('function')
    expect(typeof kb.getPressedKeys).toBe('function')
    expect(typeof kb.clearFrameState).toBe('function')
    expect(typeof kb.dispose).toBe('function')
    expect(kb.keys).toBeDefined()

    kb.dispose()
  })

  it('should detect key press', () => {
    const kb = keyboard(target)

    expect(kb.isPressed('KeyA')).toBe(false)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))

    expect(kb.isPressed('KeyA')).toBe(true)
    expect(kb.isPressed('keya')).toBe(true) // Case insensitive

    kb.dispose()
  })

  it('should detect key release', () => {
    const kb = keyboard(target)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))
    expect(kb.isPressed('KeyA')).toBe(true)

    target.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))
    expect(kb.isPressed('KeyA')).toBe(false)

    kb.dispose()
  })

  it('should track just pressed state', () => {
    const kb = keyboard(target)

    expect(kb.isJustPressed('KeyA')).toBe(false)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))

    expect(kb.isJustPressed('KeyA')).toBe(true)

    // After clearing frame state, just pressed should be false
    kb.clearFrameState()
    expect(kb.isJustPressed('KeyA')).toBe(false)

    kb.dispose()
  })

  it('should track just released state', () => {
    const kb = keyboard(target)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))
    target.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))

    expect(kb.isJustReleased('KeyA')).toBe(true)

    kb.clearFrameState()
    expect(kb.isJustReleased('KeyA')).toBe(false)

    kb.dispose()
  })

  it('should get all pressed keys', () => {
    const kb = keyboard(target)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }))

    const pressed = kb.getPressedKeys()
    expect(pressed).toContain('keya')
    expect(pressed).toContain('keyb')
    expect(pressed.length).toBe(2)

    kb.dispose()
  })

  it('should update keys signal on key events', () => {
    const kb = keyboard(target)

    expect(kb.keys().size).toBe(0)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))

    expect(kb.keys().has('space')).toBe(true)

    kb.dispose()
  })

  it('should not register same key twice', () => {
    const kb = keyboard(target)

    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))

    expect(kb.getPressedKeys().length).toBe(1)

    kb.dispose()
  })

  it('should cleanup event listeners on dispose', () => {
    const removeEventListenerSpy = vi.spyOn(target, 'removeEventListener')
    const kb = keyboard(target)

    kb.dispose()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function)
    )
  })
})

describe('Keys constants', () => {
  it('should have arrow keys', () => {
    expect(Keys.ArrowUp).toBe('arrowup')
    expect(Keys.ArrowDown).toBe('arrowdown')
    expect(Keys.ArrowLeft).toBe('arrowleft')
    expect(Keys.ArrowRight).toBe('arrowright')
  })

  it('should have WASD keys', () => {
    expect(Keys.KeyW).toBe('keyw')
    expect(Keys.KeyA).toBe('keya')
    expect(Keys.KeyS).toBe('keys')
    expect(Keys.KeyD).toBe('keyd')
  })

  it('should have common keys', () => {
    expect(Keys.Space).toBe('space')
    expect(Keys.Enter).toBe('enter')
    expect(Keys.Escape).toBe('escape')
  })
})
