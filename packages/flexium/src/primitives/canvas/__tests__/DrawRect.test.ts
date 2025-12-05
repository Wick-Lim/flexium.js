/**
 * DrawRect Component Tests
 *
 * Comprehensive tests for DrawRect canvas primitive including FNode creation,
 * rendering, signal reactivity, and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawRect } from '../DrawRect'
import { renderCanvasChildren } from '../renderer'

describe('DrawRect', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    // Mock canvas context
    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D
  })

  describe('FNode Creation', () => {
    it('should create a FNode with correct type', () => {
      const fnode = DrawRect({ x: 10, y: 20, width: 100, height: 50 })

      expect(fnode.type).toBe('canvas-rect')
    })

    it('should create a FNode with empty children array', () => {
      const fnode = DrawRect({ x: 10, y: 20, width: 100, height: 50 })

      expect(fnode.children).toEqual([])
      expect(Array.isArray(fnode.children)).toBe(true)
    })

    it('should pass all props correctly', () => {
      const fnode = DrawRect({
        x: 15,
        y: 25,
        width: 120,
        height: 60,
        fill: 'blue',
        stroke: 'red',
        strokeWidth: 3,
        opacity: 0.7,
      })

      expect(fnode.props.x).toBe(15)
      expect(fnode.props.y).toBe(25)
      expect(fnode.props.width).toBe(120)
      expect(fnode.props.height).toBe(60)
      expect(fnode.props.fill).toBe('blue')
      expect(fnode.props.stroke).toBe('red')
      expect(fnode.props.strokeWidth).toBe(3)
      expect(fnode.props.opacity).toBe(0.7)
    })

    it('should handle minimal props', () => {
      const fnode = DrawRect({
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      })

      expect(fnode.props.x).toBe(0)
      expect(fnode.props.y).toBe(0)
      expect(fnode.props.width).toBe(50)
      expect(fnode.props.height).toBe(50)
      expect(fnode.props.fill).toBeUndefined()
      expect(fnode.props.stroke).toBeUndefined()
    })
  })

  describe('Filled Rectangles', () => {
    it('should render filled rectangle', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.fillStyle).toBe('blue')
      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, 30)
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should render filled rectangle with different colors', () => {
      const colors = ['red', 'green', '#ff00ff', 'rgb(255, 0, 0)', 'rgba(0, 255, 0, 0.5)']

      colors.forEach((color) => {
        vi.clearAllMocks()
        const rect = DrawRect({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          fill: color,
        })

        renderCanvasChildren(ctx, rect, 100, 100)

        expect(ctx.fillStyle).toBe(color)
        expect(ctx.fillRect).toHaveBeenCalled()
      })
    })

    it('should not call fillRect when fill is undefined', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).not.toHaveBeenCalled()
    })

    it('should render filled rectangle at different positions', () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 200 },
        { x: -10, y: -10 },
      ]

      positions.forEach((pos) => {
        vi.clearAllMocks()
        const rect = DrawRect({
          ...pos,
          width: 50,
          height: 30,
          fill: 'red',
        })

        renderCanvasChildren(ctx, rect, 300, 300)

        expect(ctx.fillRect).toHaveBeenCalledWith(pos.x, pos.y, 50, 30)
      })
    })

    it('should render filled rectangle with different sizes', () => {
      const sizes = [
        { width: 10, height: 10 },
        { width: 100, height: 50 },
        { width: 1, height: 1 },
        { width: 500, height: 300 },
      ]

      sizes.forEach((size) => {
        vi.clearAllMocks()
        const rect = DrawRect({
          x: 0,
          y: 0,
          ...size,
          fill: 'blue',
        })

        renderCanvasChildren(ctx, rect, 600, 400)

        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, size.width, size.height)
      })
    })
  })

  describe('Stroked Rectangles', () => {
    it('should render stroked rectangle', () => {
      const rect = DrawRect({
        x: 5,
        y: 5,
        width: 40,
        height: 20,
        stroke: 'green',
        strokeWidth: 2,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.strokeStyle).toBe('green')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.strokeRect).toHaveBeenCalledWith(5, 5, 40, 20)
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should use default stroke width of 1 when not specified', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        stroke: 'black',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.lineWidth).toBe(1)
      expect(ctx.strokeRect).toHaveBeenCalled()
    })

    it('should not call strokeRect when stroke is undefined', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        strokeWidth: 5,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.strokeRect).not.toHaveBeenCalled()
    })

    it('should render stroked rectangle with different stroke widths', () => {
      const strokeWidths = [0.5, 1, 2, 5, 10, 20]

      strokeWidths.forEach((width) => {
        vi.clearAllMocks()
        const rect = DrawRect({
          x: 10,
          y: 10,
          width: 50,
          height: 30,
          stroke: 'black',
          strokeWidth: width,
        })

        renderCanvasChildren(ctx, rect, 100, 100)

        expect(ctx.lineWidth).toBe(width)
        expect(ctx.strokeRect).toHaveBeenCalled()
      })
    })

    it('should render stroked rectangle with different colors', () => {
      const colors = ['black', 'white', '#00ff00', 'rgb(0, 0, 255)']

      colors.forEach((color) => {
        vi.clearAllMocks()
        const rect = DrawRect({
          x: 10,
          y: 10,
          width: 50,
          height: 30,
          stroke: color,
          strokeWidth: 2,
        })

        renderCanvasChildren(ctx, rect, 100, 100)

        expect(ctx.strokeStyle).toBe(color)
        expect(ctx.strokeRect).toHaveBeenCalled()
      })
    })
  })

  describe('Fill and Stroke Combined', () => {
    it('should render rectangle with both fill and stroke', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
        stroke: 'red',
        strokeWidth: 2,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillStyle).toBe('blue')
      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, 30)
      expect(ctx.strokeStyle).toBe('red')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.strokeRect).toHaveBeenCalledWith(10, 10, 50, 30)
    })

    it('should call fillRect before strokeRect', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'yellow',
        stroke: 'black',
        strokeWidth: 3,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      const fillIndex = ctx.fillRect.mock.invocationCallOrder[0]
      const strokeIndex = ctx.strokeRect.mock.invocationCallOrder[0]

      expect(fillIndex).toBeLessThan(strokeIndex)
    })
  })

  describe('Opacity Handling', () => {
    it('should apply opacity', () => {
      const rect = DrawRect({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'red',
        opacity: 0.5,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(0.5)
    })

    it('should apply different opacity values', () => {
      const opacities = [0, 0.25, 0.5, 0.75, 1]

      opacities.forEach((opacity) => {
        vi.clearAllMocks()
        ctx.globalAlpha = 1

        const rect = DrawRect({
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          fill: 'blue',
          opacity,
        })

        renderCanvasChildren(ctx, rect, 100, 100)

        expect(ctx.globalAlpha).toBe(opacity)
      })
    })

    it('should not change opacity when not specified', () => {
      ctx.globalAlpha = 1

      const rect = DrawRect({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(1)
    })

    it('should apply opacity to both fill and stroke', () => {
      const rect = DrawRect({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.3,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(0.3)
      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.strokeRect).toHaveBeenCalled()
    })
  })

  describe('Signal Support', () => {
    it('should support signal for x position', () => {
      // Create mock signal-like objects that match what unwrapSignal/isSignal expects
      const x = { value: 15, peek: () => 15, set: () => {} }
      const rect = DrawRect({
        x: x as any,
        y: 25,
        width: 30,
        height: 20,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(15, 25, 30, 20)
    })

    it('should support signal for y position', () => {
      const y = { value: 35, peek: () => 35, set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: y as any,
        width: 30,
        height: 20,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 35, 30, 20)
    })

    it('should support signal for width', () => {
      const width = { value: 80, peek: () => 80, set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: width as any,
        height: 20,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 80, 20)
    })

    it('should support signal for height', () => {
      const height = { value: 60, peek: () => 60, set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 30,
        height: height as any,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 30, 60)
    })

    it('should support signal for fill color', () => {
      const fill = { value: 'purple', peek: () => 'purple', set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 30,
        height: 20,
        fill: fill as any,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillStyle).toBe('purple')
      expect(ctx.fillRect).toHaveBeenCalled()
    })

    it('should support signal for stroke color', () => {
      const stroke = { value: 'orange', peek: () => 'orange', set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 30,
        height: 20,
        stroke: stroke as any,
        strokeWidth: 2,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.strokeStyle).toBe('orange')
      expect(ctx.strokeRect).toHaveBeenCalled()
    })

    it('should support signal for strokeWidth', () => {
      const strokeWidth = { value: 5, peek: () => 5, set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 30,
        height: 20,
        stroke: 'black',
        strokeWidth: strokeWidth as any,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.lineWidth).toBe(5)
      expect(ctx.strokeRect).toHaveBeenCalled()
    })

    it('should support signal for opacity', () => {
      const opacity = { value: 0.7, peek: () => 0.7, set: () => {} }
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 30,
        height: 20,
        fill: 'red',
        opacity: opacity as any,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(0.7)
    })

    it('should support multiple signals simultaneously', () => {
      const x = { value: 15, peek: () => 15, set: () => {} }
      const y = { value: 25, peek: () => 25, set: () => {} }
      const width = { value: 45, peek: () => 45, set: () => {} }
      const height = { value: 35, peek: () => 35, set: () => {} }
      const fill = { value: 'green', peek: () => 'green', set: () => {} }
      const stroke = { value: 'blue', peek: () => 'blue', set: () => {} }
      const strokeWidth = { value: 3, peek: () => 3, set: () => {} }
      const opacity = { value: 0.8, peek: () => 0.8, set: () => {} }

      const rect = DrawRect({
        x: x as any,
        y: y as any,
        width: width as any,
        height: height as any,
        fill: fill as any,
        stroke: stroke as any,
        strokeWidth: strokeWidth as any,
        opacity: opacity as any,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(0.8)
      expect(ctx.fillStyle).toBe('green')
      expect(ctx.fillRect).toHaveBeenCalledWith(15, 25, 45, 35)
      expect(ctx.strokeStyle).toBe('blue')
      expect(ctx.lineWidth).toBe(3)
      expect(ctx.strokeRect).toHaveBeenCalledWith(15, 25, 45, 35)
    })

    it('should unwrap updated signal values', () => {
      const xSignal = { value: 10, peek: () => 10, set: (v: number) => { xSignal.value = v } }
      const rect = DrawRect({
        x: xSignal as any,
        y: 10,
        width: 30,
        height: 20,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)
      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 30, 20)

      vi.clearAllMocks()

      // Update signal value
      xSignal.value = 50

      renderCanvasChildren(ctx, rect, 100, 100)
      expect(ctx.fillRect).toHaveBeenCalledWith(50, 10, 30, 20)
    })
  })

  describe('Context State Management', () => {
    it('should call save before rendering', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
    })

    it('should call restore after rendering', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should call save before restore', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      const saveIndex = ctx.save.mock.invocationCallOrder[0]
      const restoreIndex = ctx.restore.mock.invocationCallOrder[0]

      expect(saveIndex).toBeLessThan(restoreIndex)
    })

    it('should isolate context state between multiple rectangles', () => {
      const rect1 = DrawRect({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'red',
        opacity: 0.5,
      })

      const rect2 = DrawRect({
        x: 20,
        y: 20,
        width: 10,
        height: 10,
        fill: 'blue',
        opacity: 1,
      })

      renderCanvasChildren(ctx, [rect1, rect2], 100, 100)

      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero width', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 0,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 0, 30)
    })

    it('should handle zero height', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 0,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, 0)
    })

    it('should handle zero dimensions', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 0,
        height: 0,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 0, 0)
    })

    it('should handle negative x position', () => {
      const rect = DrawRect({
        x: -10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(-10, 10, 50, 30)
    })

    it('should handle negative y position', () => {
      const rect = DrawRect({
        x: 10,
        y: -20,
        width: 50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, -20, 50, 30)
    })

    it('should handle negative width', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: -50,
        height: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, -50, 30)
    })

    it('should handle negative height', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: -30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, -30)
    })

    it('should handle negative dimensions', () => {
      const rect = DrawRect({
        x: 50,
        y: 50,
        width: -40,
        height: -40,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(50, 50, -40, -40)
    })

    it('should handle very large dimensions', () => {
      const rect = DrawRect({
        x: 0,
        y: 0,
        width: 10000,
        height: 10000,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 10000, 10000)
    })

    it('should handle fractional coordinates', () => {
      const rect = DrawRect({
        x: 10.5,
        y: 20.3,
        width: 50.7,
        height: 30.9,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(10.5, 20.3, 50.7, 30.9)
    })

    it('should handle zero opacity', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
        opacity: 0,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(0)
      expect(ctx.fillRect).toHaveBeenCalled()
    })

    it('should handle opacity greater than 1', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
        opacity: 2,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(2)
    })

    it('should handle negative opacity', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
        opacity: -0.5,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.globalAlpha).toBe(-0.5)
    })

    it('should handle zero strokeWidth (defaults to 1)', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        stroke: 'black',
        strokeWidth: 0,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      // Zero strokeWidth defaults to 1 in the renderer
      expect(ctx.lineWidth).toBe(1)
      expect(ctx.strokeRect).toHaveBeenCalled()
    })

    it('should handle very large strokeWidth', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        stroke: 'black',
        strokeWidth: 100,
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.lineWidth).toBe(100)
      expect(ctx.strokeRect).toHaveBeenCalled()
    })

    it('should handle rectangle without any styling', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
      })

      expect(() => renderCanvasChildren(ctx, rect, 100, 100)).not.toThrow()

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
      expect(ctx.fillRect).not.toHaveBeenCalled()
      expect(ctx.strokeRect).not.toHaveBeenCalled()
    })
  })

  describe('Integration with Renderer', () => {
    it('should render as part of multiple children', () => {
      const rect1 = DrawRect({
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        fill: 'red',
      })

      const rect2 = DrawRect({
        x: 60,
        y: 60,
        width: 40,
        height: 40,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, [rect1, rect2], 200, 200)

      expect(ctx.fillRect).toHaveBeenCalledTimes(2)
      expect(ctx.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 50, 50)
      expect(ctx.fillRect).toHaveBeenNthCalledWith(2, 60, 60, 40, 40)
    })

    it('should not break when rendered with null children', () => {
      const children = [
        DrawRect({ x: 0, y: 0, width: 10, height: 10, fill: 'red' }),
        null,
        DrawRect({ x: 20, y: 20, width: 10, height: 10, fill: 'blue' }),
      ]

      expect(() => renderCanvasChildren(ctx, children, 100, 100)).not.toThrow()
    })

    it('should handle canvas dimensions different from rect bounds', () => {
      const rect = DrawRect({
        x: 500,
        y: 500,
        width: 100,
        height: 100,
        fill: 'blue',
      })

      expect(() => renderCanvasChildren(ctx, rect, 300, 300)).not.toThrow()
      expect(ctx.fillRect).toHaveBeenCalledWith(500, 500, 100, 100)
    })
  })
})
