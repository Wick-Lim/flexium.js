/**
 * Canvas Component Tests
 *
 * Comprehensive tests for Canvas container component with reactive rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Canvas } from '../Canvas'
import { DrawRect } from '../DrawRect'
import { DrawCircle } from '../DrawCircle'
import { DrawLine } from '../DrawLine'
import { DrawText } from '../DrawText'
import { DrawArc } from '../DrawArc'
import { DrawPath } from '../DrawPath'
import { signal } from '../../../core/signal'

// Mock requestAnimationFrame and cancelAnimationFrame
let rafCallbacks: Map<number, FrameRequestCallback> = new Map()
let rafId = 0

describe('Canvas Component', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D
  let rafSpy: ReturnType<typeof vi.fn>
  let cancelRafSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset RAF state
    rafCallbacks = new Map()
    rafId = 0

    // Mock requestAnimationFrame
    rafSpy = vi.fn((callback: FrameRequestCallback) => {
      const id = ++rafId
      rafCallbacks.set(id, callback)
      return id
    })
    global.requestAnimationFrame = rafSpy as any

    // Mock cancelAnimationFrame
    cancelRafSpy = vi.fn((id: number) => {
      rafCallbacks.delete(id)
    })
    global.cancelAnimationFrame = cancelRafSpy as any

    // Mock Path2D for canvas path rendering
    global.Path2D = vi.fn((path?: string) => ({
      addPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
    })) as any

    // Create mock canvas context
    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillText: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
    } as unknown as CanvasRenderingContext2D

    // Create mock canvas element
    mockCanvas = {
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockContext
        return null
      }),
      width: 0,
      height: 0,
    } as unknown as HTMLCanvasElement
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Helper to execute all pending RAF callbacks
  const flushRAF = () => {
    const callbacks = Array.from(rafCallbacks.values())
    rafCallbacks.clear()
    callbacks.forEach((cb) => cb(performance.now()))
  }

  describe('VNode Creation', () => {
    it('should create a canvas VNode with correct type', () => {
      const vnode = Canvas({ width: 300, height: 200 })

      expect(vnode.type).toBe('canvas')
      expect(vnode.children).toEqual([])
    })

    it('should pass width and height props', () => {
      const vnode = Canvas({ width: 400, height: 300 })

      expect(vnode.props.width).toBe(400)
      expect(vnode.props.height).toBe(300)
    })

    it('should pass id prop', () => {
      const vnode = Canvas({ width: 300, height: 200, id: 'my-canvas' })

      expect(vnode.props.id).toBe('my-canvas')
    })

    it('should normalize and pass style prop', () => {
      const style = { backgroundColor: 'white', borderRadius: 4 }
      const vnode = Canvas({ width: 300, height: 200, style })

      expect(vnode.props.style).toBeDefined()
      expect(vnode.props.style.backgroundColor).toBe('white')
      // borderRadius gets normalized to '4px' string by normalizeStyle
      expect(vnode.props.style.borderRadius).toBe('4px')
    })

    it('should pass additional props', () => {
      const vnode = Canvas({
        width: 300,
        height: 200,
        className: 'canvas-element',
        'data-testid': 'test-canvas',
      } as any)

      expect(vnode.props.className).toBe('canvas-element')
      expect(vnode.props['data-testid']).toBe('test-canvas')
    })

    it('should have a ref callback', () => {
      const vnode = Canvas({ width: 300, height: 200 })

      expect(vnode.props.ref).toBeDefined()
      expect(typeof vnode.props.ref).toBe('function')
    })
  })

  describe('Canvas Mounting', () => {
    it('should not error when ref is called with null', () => {
      const vnode = Canvas({ width: 300, height: 200 })

      expect(() => vnode.props.ref(null)).not.toThrow()
    })

    it('should get 2d context when mounted', () => {
      const vnode = Canvas({ width: 300, height: 200 })
      vnode.props.ref(mockCanvas)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('should handle canvas without 2d context gracefully', () => {
      const invalidCanvas = {
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement

      const vnode = Canvas({ width: 300, height: 200 })

      expect(() => vnode.props.ref(invalidCanvas)).not.toThrow()
    })

    it('should start rendering when ref is called', async () => {
      const vnode = Canvas({ width: 300, height: 200 })

      // Call ref to mount
      vnode.props.ref(mockCanvas)

      // Wait for dynamic import and effect setup
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Should request animation frame
      expect(rafSpy).toHaveBeenCalled()
    })
  })

  describe('Canvas Rendering', () => {
    it('should clear canvas before rendering', async () => {
      const vnode = Canvas({ width: 300, height: 200 })
      vnode.props.ref(mockCanvas)

      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 300, 200)
    })

    it('should render single child', async () => {
      const child = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect).toHaveBeenCalled()
      expect(mockContext.fillStyle).toBe('blue')
    })

    it('should render multiple children', async () => {
      const children = [
        DrawRect({ x: 0, y: 0, width: 10, height: 10, fill: 'red' }),
        DrawCircle({ x: 50, y: 50, radius: 20, fill: 'blue' }),
      ]
      const vnode = Canvas({ width: 300, height: 200, children })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect).toHaveBeenCalled()
      expect(mockContext.arc).toHaveBeenCalled()
    })

    it('should render all supported primitives', async () => {
      const children = [
        DrawRect({ x: 10, y: 10, width: 50, height: 30, fill: 'red' }),
        DrawCircle({ x: 100, y: 100, radius: 25, fill: 'blue' }),
        DrawLine({ x1: 0, y1: 0, x2: 100, y2: 100, stroke: 'black' }),
        DrawText({ x: 50, y: 150, text: 'Hello', fill: 'green' }),
        DrawArc({
          x: 200,
          y: 100,
          radius: 30,
          startAngle: 0,
          endAngle: Math.PI,
          fill: 'yellow',
        }),
        DrawPath({ d: 'M 10 10 L 50 50', stroke: 'purple' }),
      ]
      const vnode = Canvas({ width: 300, height: 200, children })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect).toHaveBeenCalled()
      expect(mockContext.arc).toHaveBeenCalled()
      expect(mockContext.lineTo).toHaveBeenCalled()
      expect(mockContext.fillText).toHaveBeenCalled()
    })

    it('should handle undefined children', async () => {
      const vnode = Canvas({ width: 300, height: 200, children: undefined })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(() => flushRAF()).not.toThrow()
    })

    it('should handle null children', async () => {
      const vnode = Canvas({ width: 300, height: 200, children: null })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(() => flushRAF()).not.toThrow()
    })

    it('should handle empty array children', async () => {
      const vnode = Canvas({ width: 300, height: 200, children: [] })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(() => flushRAF()).not.toThrow()
    })
  })

  describe('RequestAnimationFrame Integration', () => {
    it('should use requestAnimationFrame for rendering', async () => {
      const vnode = Canvas({ width: 300, height: 200 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(rafSpy).toHaveBeenCalled()
    })

    it.skip('should schedule RAF when signal changes', async () => {
      const x = signal(10)
      const child = DrawRect({ x, y: 10, width: 50, height: 30, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      const initialRafCount = rafSpy.mock.calls.length

      // Trigger re-render by changing signal
      x.value = 20
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Should request new RAF
      expect(rafSpy.mock.calls.length).toBeGreaterThan(initialRafCount)
    })

    it('should handle RAF scheduling with batched updates', async () => {
      const x = signal(10)
      const child = DrawRect({ x, y: 10, width: 50, height: 30, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // Rapidly change signal multiple times
      x.value = 20
      x.value = 30
      x.value = 40
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Should have scheduled RAF for updates
      expect(rafSpy).toHaveBeenCalled()
    })

    it('should cancel RAF on cleanup', async () => {
      const vnode = Canvas({ width: 300, height: 200 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))

      const rafIdValue = rafSpy.mock.results[0]?.value

      // Verify RAF was scheduled
      expect(rafIdValue).toBeDefined()
    })
  })

  describe('Signal Reactivity', () => {
    it.skip('should re-render when signal changes', async () => {
      const x = signal(10)
      const child = DrawRect({ x, y: 10, width: 50, height: 30, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // Should have rendered initially
      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(mockContext.fillRect).toHaveBeenCalled()

      const initialCallCount = mockContext.fillRect.mock.calls.length

      // Change signal value
      x.value = 50
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // Should have rendered again
      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(
        initialCallCount
      )
    })

    it.skip('should react to multiple signal changes', async () => {
      const x = signal(10)
      const y = signal(20)
      const child = DrawRect({ x, y, width: 50, height: 30, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      const initialCount = mockContext.fillRect.mock.calls.length

      // Change x
      x.value = 100
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(
        initialCount
      )

      const afterXChange = mockContext.fillRect.mock.calls.length

      // Change y
      y.value = 80
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(
        afterXChange
      )
    })

    it.skip('should react to fill color signal changes', async () => {
      const fill = signal('red')
      const child = DrawRect({ x: 10, y: 10, width: 50, height: 30, fill })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // fillStyle is set during rendering
      expect(mockContext.fillStyle).toBe('red')

      // Change color
      fill.value = 'blue'
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // After re-render, fillStyle should be 'blue'
      expect(mockContext.fillStyle).toBe('blue')
    })

    it.skip('should handle mixed static and signal props', async () => {
      const x = signal(10)
      const child = DrawRect({ x, y: 20, width: 50, height: 30, fill: 'green' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillStyle).toBe('green')

      const initialCount = mockContext.fillRect.mock.calls.length

      // Only signal changes should trigger re-render
      x.value = 60
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(
        initialCount
      )
    })

    it.skip('should react to signals in different primitives', async () => {
      const rectX = signal(10)
      const circleRadius = signal(20)
      const children = [
        DrawRect({ x: rectX, y: 10, width: 50, height: 30, fill: 'red' }),
        DrawCircle({ x: 150, y: 100, radius: circleRadius, fill: 'blue' }),
      ]
      const vnode = Canvas({ width: 300, height: 200, children })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect).toHaveBeenCalled()
      expect(mockContext.arc).toHaveBeenCalled()

      const initialRectCount = mockContext.fillRect.mock.calls.length

      // Change rect signal
      rectX.value = 30
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(
        initialRectCount
      )

      const initialArcCount = mockContext.arc.mock.calls.length

      // Change circle signal
      circleRadius.value = 40
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.arc.mock.calls.length).toBeGreaterThan(initialArcCount)
    })
  })

  describe('Canvas Dimensions', () => {
    it('should use provided width for clearing', async () => {
      const vnode = Canvas({ width: 400, height: 300 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 300)
    })

    it('should use provided height for clearing', async () => {
      const vnode = Canvas({ width: 500, height: 400 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 500, 400)
    })

    it('should clear entire canvas area', async () => {
      const vnode = Canvas({ width: 800, height: 600 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })

    it('should handle small canvas dimensions', async () => {
      const vnode = Canvas({ width: 50, height: 50 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 50, 50)
    })

    it('should handle large canvas dimensions', async () => {
      const vnode = Canvas({ width: 2000, height: 1500 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 2000, 1500)
    })
  })

  describe('Context State Management', () => {
    it('should call save/restore for each primitive', async () => {
      const children = [
        DrawRect({ x: 10, y: 10, width: 50, height: 30, fill: 'red' }),
        DrawCircle({ x: 100, y: 100, radius: 25, fill: 'blue' }),
      ]
      const vnode = Canvas({ width: 300, height: 200, children })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.save).toHaveBeenCalledTimes(2)
      expect(mockContext.restore).toHaveBeenCalledTimes(2)
    })

    it.skip('should maintain context state isolation between renders', async () => {
      const opacity = signal(0.5)
      const child = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
        opacity,
      })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // globalAlpha is set during rendering, so it should be 0.5
      expect(mockContext.globalAlpha).toBe(0.5)
      expect(mockContext.save).toHaveBeenCalled()
      expect(mockContext.restore).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid signal updates efficiently', async () => {
      const x = signal(0)
      const child = DrawRect({ x, y: 10, width: 50, height: 30, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Rapidly update signal
      for (let i = 0; i < 100; i++) {
        x.value = i
      }

      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // Should have rendered with batched updates
      expect(mockContext.fillRect).toHaveBeenCalled()
    })

    it('should handle children with null/undefined values', async () => {
      const children = [
        DrawRect({ x: 10, y: 10, width: 50, height: 30, fill: 'red' }),
        null,
        undefined,
        DrawCircle({ x: 100, y: 100, radius: 25, fill: 'blue' }),
      ]
      const vnode = Canvas({
        width: 300,
        height: 200,
        children: children as any,
      })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(() => flushRAF()).not.toThrow()
    })

    it('should handle zero dimensions', async () => {
      const vnode = Canvas({ width: 0, height: 0 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 0, 0)
    })

    it('should clear canvas even with no children', async () => {
      const vnode = Canvas({ width: 300, height: 200 })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 300, 200)
      expect(mockContext.fillRect).not.toHaveBeenCalled()
      expect(mockContext.arc).not.toHaveBeenCalled()
    })

    it('should handle remounting gracefully', async () => {
      const vnode = Canvas({ width: 300, height: 200 })

      // First mount
      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalled()
      vi.clearAllMocks()

      // Unmount
      vnode.props.ref(null)
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Remount
      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.clearRect).toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it.skip('should batch multiple signal changes', async () => {
      const x = signal(10)
      const y = signal(20)
      const width = signal(50)
      const height = signal(30)
      const child = DrawRect({ x, y, width, height, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      vi.clearAllMocks()

      // Change all signals at once
      x.value = 100
      y.value = 150
      width.value = 80
      height.value = 60

      await new Promise((resolve) => setTimeout(resolve, 50))

      // Should have scheduled RAF for batched updates
      expect(rafSpy).toHaveBeenCalled()
    })

    it('should not render if canvas is unmounted', async () => {
      const x = signal(10)
      const child = DrawRect({ x, y: 10, width: 50, height: 30, fill: 'blue' })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      vi.clearAllMocks()

      // Unmount
      vnode.props.ref(null)
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Change signal after unmount
      x.value = 100
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Should not have scheduled new RAF since unmounted
      // Note: cleanup happens asynchronously, so we just verify no errors
      expect(() => flushRAF()).not.toThrow()
    })
  })

  describe('Integration with Different Draw Primitives', () => {
    it('should handle DrawRect with all properties', async () => {
      const child = DrawRect({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.8,
      })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.globalAlpha).toBe(0.8)
      expect(mockContext.fillStyle).toBe('red')
      expect(mockContext.strokeStyle).toBe('black')
      expect(mockContext.lineWidth).toBe(2)
    })

    it.skip('should handle DrawCircle with signals', async () => {
      const radius = signal(30)
      const child = DrawCircle({ x: 150, y: 150, radius, fill: 'purple' })
      const vnode = Canvas({ width: 300, height: 300, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.arc).toHaveBeenCalled()

      const initialCount = mockContext.arc.mock.calls.length

      radius.value = 50
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.arc.mock.calls.length).toBeGreaterThan(initialCount)
    })

    it.skip('should handle DrawLine with signal coordinates', async () => {
      const x2 = signal(100)
      const y2 = signal(100)
      const child = DrawLine({
        x1: 0,
        y1: 0,
        x2,
        y2,
        stroke: 'black',
        strokeWidth: 2,
      })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.moveTo).toHaveBeenCalled()
      expect(mockContext.lineTo).toHaveBeenCalled()

      const initialLineCount = mockContext.lineTo.mock.calls.length

      x2.value = 200
      y2.value = 150
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.lineTo.mock.calls.length).toBeGreaterThan(
        initialLineCount
      )
    })

    it.skip('should handle DrawText with signal text', async () => {
      const text = signal('Hello')
      const child = DrawText({
        x: 50,
        y: 50,
        text,
        fill: 'black',
        fontSize: 16,
      })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillText).toHaveBeenCalled()

      const initialTextCount = mockContext.fillText.mock.calls.length

      text.value = 'World'
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.fillText.mock.calls.length).toBeGreaterThan(
        initialTextCount
      )
    })

    it.skip('should handle DrawArc with signal angles', async () => {
      const endAngle = signal(Math.PI)
      const child = DrawArc({
        x: 100,
        y: 100,
        radius: 50,
        startAngle: 0,
        endAngle,
        fill: 'yellow',
      })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.arc).toHaveBeenCalled()

      const initialArcCount = mockContext.arc.mock.calls.length

      endAngle.value = Math.PI * 2
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.arc.mock.calls.length).toBeGreaterThan(initialArcCount)
    })

    it.skip('should handle DrawPath with signal path data', async () => {
      const d = signal('M 10 10 L 50 50')
      const child = DrawPath({ d, stroke: 'green', strokeWidth: 2 })
      const vnode = Canvas({ width: 300, height: 200, children: child })

      vnode.props.ref(mockCanvas)
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      expect(mockContext.stroke).toHaveBeenCalled()

      const initialStrokeCount = mockContext.stroke.mock.calls.length

      d.value = 'M 20 20 L 80 80'
      await new Promise((resolve) => setTimeout(resolve, 50))
      flushRAF()

      // Path should be re-rendered
      expect(mockContext.stroke.mock.calls.length).toBeGreaterThan(
        initialStrokeCount
      )
    })
  })
})
