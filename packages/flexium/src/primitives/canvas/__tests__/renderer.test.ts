import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderCanvasChildren } from '../renderer'
import { DrawRect } from '../DrawRect'
import { DrawCircle } from '../DrawCircle'
import { DrawLine } from '../DrawLine'
import { DrawText } from '../DrawText'
import { DrawArc } from '../DrawArc'
import { DrawPath } from '../DrawPath'

describe('Canvas Renderer', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    // Mock canvas context
    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
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
  })

  describe('renderCanvasChildren', () => {
    it('should handle null children', () => {
      expect(() => renderCanvasChildren(ctx, null, 100, 100)).not.toThrow()
    })

    it('should handle empty array', () => {
      expect(() => renderCanvasChildren(ctx, [], 100, 100)).not.toThrow()
    })

    it('should handle single child', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'red',
      })
      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, 30)
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should handle array of children', () => {
      const children = [
        DrawRect({ x: 0, y: 0, width: 10, height: 10, fill: 'red' }),
        DrawCircle({ x: 50, y: 50, radius: 20, fill: 'blue' }),
      ]

      renderCanvasChildren(ctx, children, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalled()
    })
  })

  describe('DrawRect', () => {
    it('should create a rect FNode', () => {
      const rect = DrawRect({ x: 10, y: 20, width: 100, height: 50 })

      expect(rect.type).toBe('canvas-rect')
      expect(rect.props.x).toBe(10)
      expect(rect.props.y).toBe(20)
      expect(rect.props.width).toBe(100)
      expect(rect.props.height).toBe(50)
    })

    it('should render filled rect', () => {
      const rect = DrawRect({
        x: 10,
        y: 10,
        width: 50,
        height: 30,
        fill: 'blue',
      })
      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillStyle).toBe('blue')
      expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 50, 30)
    })

    it('should render stroked rect', () => {
      const rect = DrawRect({
        x: 5,
        y: 5,
        width: 40,
        height: 20,
        stroke: 'green',
        strokeWidth: 2,
      })
      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.strokeStyle).toBe('green')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.strokeRect).toHaveBeenCalledWith(5, 5, 40, 20)
    })

    it('should support signal-like values', () => {
      // Create mock signal-like objects that match what unwrapSignal/isSignal expects
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const x = mockSignal(15)
      const y = mockSignal(25)
      const rect = DrawRect({
        x: x as any,
        y: y as any,
        width: 30,
        height: 20,
        fill: 'red',
      })

      renderCanvasChildren(ctx, rect, 100, 100)

      expect(ctx.fillRect).toHaveBeenCalledWith(15, 25, 30, 20)
    })

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
  })

  describe('DrawCircle', () => {
    it('should create a circle FNode', () => {
      const circle = DrawCircle({ x: 50, y: 50, radius: 25 })

      expect(circle.type).toBe('canvas-circle')
      expect(circle.props.x).toBe(50)
      expect(circle.props.y).toBe(50)
      expect(circle.props.radius).toBe(25)
    })

    it('should render filled circle', () => {
      const circle = DrawCircle({ x: 100, y: 100, radius: 50, fill: 'purple' })
      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalledWith(100, 100, 50, 0, 2 * Math.PI)
      expect(ctx.fillStyle).toBe('purple')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render stroked circle', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 30,
        stroke: 'orange',
        strokeWidth: 3,
      })
      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.strokeStyle).toBe('orange')
      expect(ctx.lineWidth).toBe(3)
      expect(ctx.stroke).toHaveBeenCalled()
    })
  })

  describe('DrawLine', () => {
    it('should create a line FNode', () => {
      const line = DrawLine({ x1: 0, y1: 0, x2: 100, y2: 100 })

      expect(line.type).toBe('canvas-line')
      expect(line.props.x1).toBe(0)
      expect(line.props.y1).toBe(0)
      expect(line.props.x2).toBe(100)
      expect(line.props.y2).toBe(100)
    })

    it('should render line', () => {
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: 80,
        y2: 90,
        stroke: 'black',
        strokeWidth: 2,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalledWith(10, 20)
      expect(ctx.lineTo).toHaveBeenCalledWith(80, 90)
      expect(ctx.strokeStyle).toBe('black')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.stroke).toHaveBeenCalled()
    })
  })

  describe('DrawText', () => {
    it('should create a text FNode', () => {
      const text = DrawText({ x: 10, y: 30, text: 'Hello' })

      expect(text.type).toBe('canvas-text')
      expect(text.props.text).toBe('Hello')
    })

    it('should render text', () => {
      const text = DrawText({
        x: 20,
        y: 40,
        text: 'Test',
        fill: 'black',
        fontSize: 16,
        fontFamily: 'Arial',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.font).toContain('16px')
      expect(ctx.font).toContain('Arial')
      expect(ctx.fillStyle).toBe('black')
      expect(ctx.fillText).toHaveBeenCalledWith('Test', 20, 40)
    })
  })

  describe('DrawArc', () => {
    it('should create an arc FNode', () => {
      const arc = DrawArc({
        x: 50,
        y: 50,
        radius: 40,
        startAngle: 0,
        endAngle: Math.PI,
      })

      expect(arc.type).toBe('canvas-arc')
      expect(arc.props.startAngle).toBe(0)
      expect(arc.props.endAngle).toBe(Math.PI)
    })

    it('should render arc', () => {
      const arc = DrawArc({
        x: 75,
        y: 75,
        radius: 50,
        startAngle: 0,
        endAngle: Math.PI / 2,
        fill: 'yellow',
      })
      renderCanvasChildren(ctx, arc, 150, 150)

      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalledWith(75, 75, 50, 0, Math.PI / 2, false)
      expect(ctx.fill).toHaveBeenCalled()
    })
  })

  describe('DrawPath', () => {
    it('should create a path FNode', () => {
      const path = DrawPath({ d: 'M 10 10 L 100 10', stroke: 'black' })

      expect(path.type).toBe('canvas-path')
      expect(path.props.d).toBe('M 10 10 L 100 10')
    })
  })
})
