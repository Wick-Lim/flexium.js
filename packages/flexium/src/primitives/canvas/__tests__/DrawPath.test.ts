/**
 * DrawPath Component Tests
 *
 * Comprehensive tests for DrawPath canvas primitive with SVG path data support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawPath } from '../DrawPath'
import { renderCanvasChildren } from '../renderer'
import { signal } from '../../../core/signal'

describe('DrawPath', () => {
  let ctx: CanvasRenderingContext2D
  let mockPath2D: any

  beforeEach(() => {
    // Mock Path2D constructor
    mockPath2D = {
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
    }

    global.Path2D = vi.fn((pathData?: string) => mockPath2D) as any

    // Mock canvas context
    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D
  })

  describe('VNode Creation', () => {
    it('should create a path VNode with correct type', () => {
      const path = DrawPath({ d: 'M 10 10 L 100 100' })

      expect(path.type).toBe('canvas-path')
      expect(path.children).toEqual([])
    })

    it('should pass path data string in props', () => {
      const pathData = 'M 10 10 L 100 100'
      const path = DrawPath({ d: pathData })

      expect(path.props.d).toBe(pathData)
    })

    it('should pass fill prop', () => {
      const path = DrawPath({ d: 'M 10 10', fill: 'red' })

      expect(path.props.fill).toBe('red')
    })

    it('should pass stroke prop', () => {
      const path = DrawPath({ d: 'M 10 10', stroke: 'blue' })

      expect(path.props.stroke).toBe('blue')
    })

    it('should pass strokeWidth prop', () => {
      const path = DrawPath({ d: 'M 10 10', strokeWidth: 3 })

      expect(path.props.strokeWidth).toBe(3)
    })

    it('should pass opacity prop', () => {
      const path = DrawPath({ d: 'M 10 10', opacity: 0.7 })

      expect(path.props.opacity).toBe(0.7)
    })

    it('should handle all props together', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'green',
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.5,
      })

      expect(path.props.d).toBe('M 10 10 L 50 50')
      expect(path.props.fill).toBe('green')
      expect(path.props.stroke).toBe('black')
      expect(path.props.strokeWidth).toBe(2)
      expect(path.props.opacity).toBe(0.5)
    })
  })

  describe('Path Data String Support', () => {
    it('should support MoveTo (M) command', () => {
      const path = DrawPath({ d: 'M 10 20', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 20')
    })

    it('should support LineTo (L) command', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 L 50 50')
    })

    it('should support horizontal line (H) command', () => {
      const path = DrawPath({ d: 'M 10 10 H 50', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 H 50')
    })

    it('should support vertical line (V) command', () => {
      const path = DrawPath({ d: 'M 10 10 V 50', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 V 50')
    })

    it('should support cubic Bezier curve (C) command', () => {
      const path = DrawPath({
        d: 'M 10 10 C 20 20, 40 20, 50 10',
        stroke: 'black',
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 C 20 20, 40 20, 50 10')
    })

    it('should support smooth cubic Bezier (S) command', () => {
      const path = DrawPath({ d: 'M 10 10 S 40 20, 50 10', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 S 40 20, 50 10')
    })

    it('should support quadratic Bezier curve (Q) command', () => {
      const path = DrawPath({ d: 'M 10 10 Q 25 40, 50 10', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 Q 25 40, 50 10')
    })

    it('should support smooth quadratic Bezier (T) command', () => {
      const path = DrawPath({ d: 'M 10 10 T 50 10', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 T 50 10')
    })

    it('should support arc (A) command', () => {
      const path = DrawPath({
        d: 'M 10 10 A 20 20 0 0 1 50 50',
        stroke: 'black',
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 A 20 20 0 0 1 50 50')
    })

    it('should support closePath (Z) command', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50 Z', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 L 50 50 Z')
    })

    it('should support complex path with multiple commands', () => {
      const complexPath = 'M 10 10 L 50 50 C 60 60, 70 60, 80 50 Z'
      const path = DrawPath({ d: complexPath, stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith(complexPath)
    })

    it('should support lowercase relative commands', () => {
      const path = DrawPath({ d: 'm 10 10 l 40 40', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('m 10 10 l 40 40')
    })

    it('should support mixed upper and lowercase commands', () => {
      const path = DrawPath({ d: 'M 10 10 l 40 40 L 80 80', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 l 40 40 L 80 80')
    })
  })

  describe('Rendering with Fill', () => {
    it('should render filled path', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'blue' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.fillStyle).toBe('blue')
      expect(ctx.fill).toHaveBeenCalledWith(mockPath2D)
    })

    it('should render with different fill colors', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'rgb(255, 0, 0)' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.fillStyle).toBe('rgb(255, 0, 0)')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render with hex color fill', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: '#FF5733' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.fillStyle).toBe('#FF5733')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should not fill when fill prop is undefined', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.fill).not.toHaveBeenCalled()
    })
  })

  describe('Rendering with Stroke', () => {
    it('should render stroked path', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', stroke: 'green' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.strokeStyle).toBe('green')
      expect(ctx.stroke).toHaveBeenCalledWith(mockPath2D)
    })

    it('should apply strokeWidth', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        stroke: 'black',
        strokeWidth: 5,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.lineWidth).toBe(5)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should use default strokeWidth of 1 when not specified', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.lineWidth).toBe(1)
    })

    it('should not stroke when stroke prop is undefined', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'blue' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.stroke).not.toHaveBeenCalled()
    })
  })

  describe('Fill and Stroke Together', () => {
    it('should render both fill and stroke', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'yellow',
        stroke: 'black',
        strokeWidth: 2,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.fillStyle).toBe('yellow')
      expect(ctx.strokeStyle).toBe('black')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.fill).toHaveBeenCalled()
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should fill before stroke', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'red',
        stroke: 'blue',
      })
      renderCanvasChildren(ctx, path, 100, 100)

      const fillCallOrder = ctx.fill.mock.invocationCallOrder[0]
      const strokeCallOrder = ctx.stroke.mock.invocationCallOrder[0]

      expect(fillCallOrder).toBeLessThan(strokeCallOrder)
    })
  })

  describe('Opacity Handling', () => {
    it('should apply opacity', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'blue',
        opacity: 0.5,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.globalAlpha).toBe(0.5)
    })

    it('should handle zero opacity', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'blue',
        opacity: 0,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.globalAlpha).toBe(0)
    })

    it('should handle full opacity', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'blue',
        opacity: 1,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.globalAlpha).toBe(1)
    })

    it('should not set globalAlpha when opacity is undefined', () => {
      const initialAlpha = ctx.globalAlpha
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'blue' })
      renderCanvasChildren(ctx, path, 100, 100)

      // globalAlpha should remain unchanged if opacity is not specified
      expect(ctx.globalAlpha).toBe(initialAlpha)
    })

    it('should apply opacity with both fill and stroke', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'red',
        stroke: 'black',
        opacity: 0.3,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.globalAlpha).toBe(0.3)
      expect(ctx.fill).toHaveBeenCalled()
      expect(ctx.stroke).toHaveBeenCalled()
    })
  })

  describe('Signal Support', () => {
    it('should support signal for path data', () => {
      // Create a proper signal with value, peek, and set methods
      const d = { value: 'M 10 10 L 50 50', peek: () => 'M 10 10 L 50 50', set: vi.fn() }
      const path = DrawPath({ d: d as any, stroke: 'black' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 L 50 50')
    })

    it('should support signal for fill', () => {
      const fill = { value: 'red', peek: () => 'red', set: vi.fn() }
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: fill as any })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.fillStyle).toBe('red')
    })

    it('should support signal for stroke', () => {
      const stroke = { value: 'blue', peek: () => 'blue', set: vi.fn() }
      const path = DrawPath({ d: 'M 10 10 L 50 50', stroke: stroke as any })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.strokeStyle).toBe('blue')
    })

    it('should support signal for strokeWidth', () => {
      const strokeWidth = { value: 10, peek: () => 10, set: vi.fn() }
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        stroke: 'black',
        strokeWidth: strokeWidth as any,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.lineWidth).toBe(10)
    })

    it('should support signal for opacity', () => {
      const opacity = { value: 0.7, peek: () => 0.7, set: vi.fn() }
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'green', opacity: opacity as any })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.globalAlpha).toBe(0.7)
    })

    it('should support multiple signals together', () => {
      const d = { value: 'M 10 10 L 50 50', peek: () => 'M 10 10 L 50 50', set: vi.fn() }
      const fill = { value: 'purple', peek: () => 'purple', set: vi.fn() }
      const stroke = { value: 'black', peek: () => 'black', set: vi.fn() }
      const strokeWidth = { value: 3, peek: () => 3, set: vi.fn() }
      const opacity = { value: 0.8, peek: () => 0.8, set: vi.fn() }

      const path = DrawPath({
        d: d as any,
        fill: fill as any,
        stroke: stroke as any,
        strokeWidth: strokeWidth as any,
        opacity: opacity as any
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(global.Path2D).toHaveBeenCalledWith('M 10 10 L 50 50')
      expect(ctx.fillStyle).toBe('purple')
      expect(ctx.strokeStyle).toBe('black')
      expect(ctx.lineWidth).toBe(3)
      expect(ctx.globalAlpha).toBe(0.8)
    })

    it('should update when signal value changes', () => {
      const fill = { value: 'red', peek: () => 'red', set: vi.fn() }
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: fill as any })

      renderCanvasChildren(ctx, path, 100, 100)
      expect(ctx.fillStyle).toBe('red')

      // Change signal value
      fill.value = 'blue'
      renderCanvasChildren(ctx, path, 100, 100)
      expect(ctx.fillStyle).toBe('blue')
    })
  })

  describe('Context State Management', () => {
    it('should call save before rendering', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'blue' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
    })

    it('should call restore after rendering', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'blue' })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should maintain save/restore order', () => {
      const path = DrawPath({ d: 'M 10 10 L 50 50', fill: 'blue' })
      renderCanvasChildren(ctx, path, 100, 100)

      const saveCallOrder = ctx.save.mock.invocationCallOrder[0]
      const restoreCallOrder = ctx.restore.mock.invocationCallOrder[0]

      expect(saveCallOrder).toBeLessThan(restoreCallOrder)
    })

    it('should isolate context state between paths', () => {
      const paths = [
        DrawPath({ d: 'M 10 10 L 50 50', fill: 'red', opacity: 0.5 }),
        DrawPath({ d: 'M 60 60 L 90 90', fill: 'blue', opacity: 0.8 }),
      ]

      renderCanvasChildren(ctx, paths, 100, 100)

      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty path data string', () => {
      const path = DrawPath({ d: '', stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(global.Path2D).toHaveBeenCalledWith('')
    })

    it('should handle path with only MoveTo command', () => {
      const path = DrawPath({ d: 'M 50 50', stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(global.Path2D).toHaveBeenCalledWith('M 50 50')
    })

    it('should handle path with whitespace variations', () => {
      const path = DrawPath({ d: '  M  10  10   L  50  50  ', stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(global.Path2D).toHaveBeenCalledWith(
        '  M  10  10   L  50  50  '
      )
    })

    it('should handle path with decimal coordinates', () => {
      const path = DrawPath({ d: 'M 10.5 20.7 L 50.3 80.9', stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(global.Path2D).toHaveBeenCalledWith('M 10.5 20.7 L 50.3 80.9')
    })

    it('should handle path with negative coordinates', () => {
      const path = DrawPath({ d: 'M -10 -20 L 50 50', stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(global.Path2D).toHaveBeenCalledWith('M -10 -20 L 50 50')
    })

    it('should handle very long path data', () => {
      const longPath = Array.from(
        { length: 100 },
        (_, i) => `L ${i * 10} ${i * 10}`
      ).join(' ')
      const path = DrawPath({ d: `M 0 0 ${longPath}`, stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 1000, 1000)).not.toThrow()
    })

    it('should handle path with scientific notation', () => {
      const path = DrawPath({ d: 'M 1e2 1e2 L 5e1 5e1', stroke: 'black' })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
    })

    it('should default to 1 when strokeWidth is 0 (falsy)', () => {
      // The renderer uses `strokeWidth || 1` to prevent invisible strokes
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        stroke: 'black',
        strokeWidth: 0,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      // When strokeWidth is 0 (falsy), it defaults to 1
      expect(ctx.lineWidth).toBe(1)
    })

    it('should handle very large strokeWidth', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        stroke: 'black',
        strokeWidth: 1000,
      })
      renderCanvasChildren(ctx, path, 100, 100)

      expect(ctx.lineWidth).toBe(1000)
    })
  })

  describe('Common Path Shapes', () => {
    it('should handle rectangle path', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 10 L 50 50 L 10 50 Z',
        fill: 'blue',
      })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should handle triangle path', () => {
      const path = DrawPath({
        d: 'M 50 10 L 90 90 L 10 90 Z',
        fill: 'red',
      })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should handle star path', () => {
      const path = DrawPath({
        d: 'M 50 0 L 60 40 L 100 40 L 70 60 L 80 100 L 50 75 L 20 100 L 30 60 L 0 40 L 40 40 Z',
        fill: 'gold',
        stroke: 'black',
      })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(ctx.fill).toHaveBeenCalled()
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should handle circular arc approximation', () => {
      const path = DrawPath({
        d: 'M 50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10',
        stroke: 'blue',
      })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should handle heart shape path', () => {
      const path = DrawPath({
        d: 'M 50 80 C 50 80, 30 60, 30 40 C 30 25, 45 25, 50 35 C 55 25, 70 25, 70 40 C 70 60, 50 80, 50 80',
        fill: 'red',
      })

      expect(() => renderCanvasChildren(ctx, path, 100, 100)).not.toThrow()
      expect(ctx.fill).toHaveBeenCalled()
    })
  })

  describe('Multiple Paths', () => {
    it('should render multiple paths', () => {
      const paths = [
        DrawPath({ d: 'M 10 10 L 30 30', stroke: 'red' }),
        DrawPath({ d: 'M 40 40 L 60 60', stroke: 'blue' }),
        DrawPath({ d: 'M 70 70 L 90 90', stroke: 'green' }),
      ]

      renderCanvasChildren(ctx, paths, 100, 100)

      expect(global.Path2D).toHaveBeenCalledTimes(3)
      expect(ctx.stroke).toHaveBeenCalledTimes(3)
      expect(ctx.save).toHaveBeenCalledTimes(3)
      expect(ctx.restore).toHaveBeenCalledTimes(3)
    })

    it('should maintain independent state for each path', () => {
      const paths = [
        DrawPath({ d: 'M 10 10 L 30 30', stroke: 'red', strokeWidth: 1 }),
        DrawPath({ d: 'M 40 40 L 60 60', stroke: 'blue', strokeWidth: 5 }),
      ]

      renderCanvasChildren(ctx, paths, 100, 100)

      // Each path should have its own context state
      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration with renderCanvasChildren', () => {
    it('should integrate properly with renderCanvasChildren', () => {
      const path = DrawPath({
        d: 'M 10 10 L 50 50',
        fill: 'purple',
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.8,
      })

      expect(() => renderCanvasChildren(ctx, path, 200, 200)).not.toThrow()

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.globalAlpha).toBe(0.8)
      expect(ctx.fillStyle).toBe('purple')
      expect(ctx.strokeStyle).toBe('black')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.fill).toHaveBeenCalled()
      expect(ctx.stroke).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should handle null children gracefully', () => {
      expect(() => renderCanvasChildren(ctx, null, 100, 100)).not.toThrow()
    })

    it('should skip non-path children', () => {
      const children = [
        { type: 'unknown', props: {} },
        DrawPath({ d: 'M 10 10 L 50 50', stroke: 'black' }),
      ]

      expect(() => renderCanvasChildren(ctx, children, 100, 100)).not.toThrow()
      expect(global.Path2D).toHaveBeenCalledTimes(1)
    })
  })
})
