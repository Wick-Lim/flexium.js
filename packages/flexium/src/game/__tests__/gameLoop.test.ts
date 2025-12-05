import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGameLoop } from '../gameLoop'

describe('createGameLoop', () => {
  let mockRaf: typeof requestAnimationFrame
  let mockCancelRaf: typeof cancelAnimationFrame
  let callbacks: Array<(time: number) => void>

  beforeEach(() => {
    callbacks = []
    let frameId = 0

    mockRaf = vi.fn((cb: FrameRequestCallback) => {
      frameId++
      callbacks.push((time) => cb(time))
      return frameId
    })

    mockCancelRaf = vi.fn()

    vi.stubGlobal('requestAnimationFrame', mockRaf)
    vi.stubGlobal('cancelAnimationFrame', mockCancelRaf)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper to simulate frames
  function simulateFrame(timeMs: number) {
    const cbs = [...callbacks]
    callbacks = []
    cbs.forEach((cb) => cb(timeMs))
  }

  it('should create a game loop with default options', () => {
    const loop = createGameLoop()

    expect(loop).toBeDefined()
    expect(typeof loop.start).toBe('function')
    expect(typeof loop.stop).toBe('function')
    expect(typeof loop.isRunning).toBe('function')
    expect(typeof loop.getFps).toBe('function')
  })

  it('should start and stop correctly', () => {
    const loop = createGameLoop()

    expect(loop.isRunning()).toBe(false)

    loop.start()
    expect(loop.isRunning()).toBe(true)

    loop.stop()
    expect(loop.isRunning()).toBe(false)
  })

  it('should call requestAnimationFrame on start', () => {
    const loop = createGameLoop()

    loop.start()

    expect(mockRaf).toHaveBeenCalled()

    loop.stop()
  })

  it('should call onUpdate with delta time', () => {
    const onUpdate = vi.fn()
    const loop = createGameLoop({ onUpdate })

    loop.start()
    simulateFrame(1000) // First frame initializes lastTime
    simulateFrame(1016) // Second frame processes the update

    expect(onUpdate).toHaveBeenCalled()
    const delta = onUpdate.mock.calls[0][0]
    expect(typeof delta).toBe('number')
    expect(delta).toBeGreaterThanOrEqual(0)

    loop.stop()
  })

  it('should call onFixedUpdate', () => {
    const onFixedUpdate = vi.fn()
    const loop = createGameLoop({
      fixedFps: 60,
      onFixedUpdate,
    })

    loop.start()
    simulateFrame(1000) // First frame initializes lastTime
    simulateFrame(1020) // Second frame processes fixed updates (20ms delta)

    expect(onFixedUpdate).toHaveBeenCalled()

    loop.stop()
  })

  it('should call onRender with alpha value', () => {
    const onRender = vi.fn()
    const loop = createGameLoop({ onRender })

    loop.start()
    simulateFrame(1000) // First frame initializes lastTime
    simulateFrame(1016) // Second frame processes render

    expect(onRender).toHaveBeenCalled()
    const alpha = onRender.mock.calls[0][0]
    expect(typeof alpha).toBe('number')

    loop.stop()
  })

  it('should not start if already running', () => {
    const loop = createGameLoop()

    loop.start()
    const callCount = (mockRaf as ReturnType<typeof vi.fn>).mock.calls.length

    loop.start() // Second start should be ignored
    expect((mockRaf as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      callCount
    )

    loop.stop()
  })

  it('should return 0 FPS initially', () => {
    const loop = createGameLoop()

    expect(loop.getFps()).toBe(0)
  })

  it('should call cancelAnimationFrame on stop', () => {
    const loop = createGameLoop()

    loop.start()
    loop.stop()

    expect(mockCancelRaf).toHaveBeenCalled()
  })

  it('should cap delta time at 250ms', () => {
    const onUpdate = vi.fn()
    const loop = createGameLoop({ onUpdate })

    loop.start()
    simulateFrame(1000) // First frame initializes lastTime
    simulateFrame(1500) // Second frame with 500ms delta (should be capped at 250ms)

    const delta = onUpdate.mock.calls[0][0]
    expect(delta).toBeLessThanOrEqual(0.25)

    loop.stop()
  })

  it('should call onFixedUpdate multiple times for long frames', () => {
    const onFixedUpdate = vi.fn()
    const loop = createGameLoop({
      fixedFps: 60, // 16.67ms per frame
      onFixedUpdate,
    })

    loop.start()
    simulateFrame(1000) // First frame initializes lastTime
    simulateFrame(1100) // Second frame with 100ms delta (should trigger ~6 fixed updates)

    expect(onFixedUpdate.mock.calls.length).toBeGreaterThan(1)

    loop.stop()
  })

  it('should stop processing after stop is called', () => {
    const onUpdate = vi.fn()
    const loop = createGameLoop({ onUpdate })

    loop.start()
    loop.stop()

    // Clear previous calls
    onUpdate.mockClear()

    // Simulate frame after stop
    simulateFrame(1016)

    // Should not call onUpdate because loop is stopped
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
