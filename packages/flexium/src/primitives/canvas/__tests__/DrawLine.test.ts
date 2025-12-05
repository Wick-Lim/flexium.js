/**
 * DrawLine Component Tests
 *
 * Comprehensive tests for DrawLine canvas primitive
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawLine } from '../DrawLine'
import { renderCanvasChildren } from '../renderer'

describe('DrawLine', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    // Mock canvas context
    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      globalAlpha: 1,
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'butt' as CanvasLineCap,
      lineJoin: 'miter' as CanvasLineJoin,
    } as unknown as CanvasRenderingContext2D
  })

  describe('FNode Creation', () => {
    it('should create a line FNode with correct type', () => {
      const line = DrawLine({ x1: 0, y1: 0, x2: 100, y2: 100 })

      expect(line.type).toBe('canvas-line')
      expect(line.children).toEqual([])
    })

    it('should create FNode with all props', () => {
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'red',
        strokeWidth: 3,
        opacity: 0.7,
      })

      expect(line.type).toBe('canvas-line')
      expect(line.props.x1).toBe(10)
      expect(line.props.y1).toBe(20)
      expect(line.props.x2).toBe(100)
      expect(line.props.y2).toBe(200)
      expect(line.props.stroke).toBe('red')
      expect(line.props.strokeWidth).toBe(3)
      expect(line.props.opacity).toBe(0.7)
    })

    it('should create FNode with minimal props', () => {
      const line = DrawLine({ x1: 50, y1: 50, x2: 150, y2: 150 })

      expect(line.type).toBe('canvas-line')
      expect(line.props.x1).toBe(50)
      expect(line.props.y1).toBe(50)
      expect(line.props.x2).toBe(150)
      expect(line.props.y2).toBe(150)
      expect(line.props.stroke).toBeUndefined()
      expect(line.props.strokeWidth).toBeUndefined()
      expect(line.props.opacity).toBeUndefined()
    })

    it('should pass through coordinate values unchanged', () => {
      const line = DrawLine({ x1: 0, y1: 0, x2: 100, y2: 100 })

      expect(line.props.x1).toBe(0)
      expect(line.props.y1).toBe(0)
      expect(line.props.x2).toBe(100)
      expect(line.props.y2).toBe(100)
    })
  })

  describe('Basic Line Rendering', () => {
    it('should render a basic line', () => {
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: 80,
        y2: 90,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalledWith(10, 20)
      expect(ctx.lineTo).toHaveBeenCalledWith(80, 90)
      expect(ctx.strokeStyle).toBe('black')
      expect(ctx.stroke).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should render line without explicit stroke (default to black)', () => {
      const line = DrawLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.stroke).toHaveBeenCalled()
      expect(ctx.strokeStyle).toBe('black')
    })

    it('should render horizontal line', () => {
      const line = DrawLine({
        x1: 0,
        y1: 50,
        x2: 100,
        y2: 50,
        stroke: 'blue',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(0, 50)
      expect(ctx.lineTo).toHaveBeenCalledWith(100, 50)
      expect(ctx.strokeStyle).toBe('blue')
    })

    it('should render vertical line', () => {
      const line = DrawLine({
        x1: 50,
        y1: 0,
        x2: 50,
        y2: 100,
        stroke: 'green',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(50, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(50, 100)
      expect(ctx.strokeStyle).toBe('green')
    })

    it('should render diagonal line', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'red',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(100, 100)
    })
  })

  describe('Stroke Colors', () => {
    it('should render line with black stroke', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.strokeStyle).toBe('black')
    })

    it('should render line with red stroke', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'red',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.strokeStyle).toBe('red')
    })

    it('should render line with hex color', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: '#ff5500',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.strokeStyle).toBe('#ff5500')
    })

    it('should render line with rgb color', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'rgb(255, 100, 50)',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.strokeStyle).toBe('rgb(255, 100, 50)')
    })

    it('should render line with rgba color', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'rgba(255, 100, 50, 0.5)',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.strokeStyle).toBe('rgba(255, 100, 50, 0.5)')
    })
  })

  describe('Stroke Width', () => {
    it('should render line with default strokeWidth (1)', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.lineWidth).toBe(1)
    })

    it('should render line with strokeWidth 2', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        strokeWidth: 2,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.lineWidth).toBe(2)
    })

    it('should render line with strokeWidth 5', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        strokeWidth: 5,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.lineWidth).toBe(5)
    })

    it('should render line with thin strokeWidth (0.5)', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        strokeWidth: 0.5,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.lineWidth).toBe(0.5)
    })

    it('should render line with thick strokeWidth (10)', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        strokeWidth: 10,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.lineWidth).toBe(10)
    })
  })

  describe('Opacity Handling', () => {
    it('should not set globalAlpha when opacity is undefined', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      // globalAlpha should remain at default value
      expect(ctx.globalAlpha).toBe(1)
    })

    it('should apply opacity 0.5', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        opacity: 0.5,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.globalAlpha).toBe(0.5)
    })

    it('should apply opacity 0.8', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        opacity: 0.8,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.globalAlpha).toBe(0.8)
    })

    it('should apply opacity 0 (fully transparent)', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        opacity: 0,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.globalAlpha).toBe(0)
    })

    it('should apply opacity 1 (fully opaque)', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        opacity: 1,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.globalAlpha).toBe(1)
    })

    it('should combine opacity with stroke color', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'rgba(255, 0, 0, 0.5)',
        opacity: 0.7,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.globalAlpha).toBe(0.7)
      expect(ctx.strokeStyle).toBe('rgba(255, 0, 0, 0.5)')
    })
  })

  describe('Signal Support', () => {
    it('should support signal for x1', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const x1 = mockSignal(15)
      const line = DrawLine({
        x1: x1 as any,
        y1: 20,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })

      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.moveTo).toHaveBeenCalledWith(15, 20)
    })

    it('should support signal for y1', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const y1 = mockSignal(25)
      const line = DrawLine({
        x1: 10,
        y1: y1 as any,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })

      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.moveTo).toHaveBeenCalledWith(10, 25)
    })

    it('should support signal for x2', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const x2 = mockSignal(150)
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: x2 as any,
        y2: 100,
        stroke: 'black',
      })

      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.lineTo).toHaveBeenCalledWith(150, 100)
    })

    it('should support signal for y2', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const y2 = mockSignal(175)
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: 100,
        y2: y2 as any,
        stroke: 'black',
      })

      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.lineTo).toHaveBeenCalledWith(100, 175)
    })

    it('should support signals for all coordinates', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const x1 = mockSignal(5)
      const y1 = mockSignal(10)
      const x2 = mockSignal(95)
      const y2 = mockSignal(90)

      const line = DrawLine({
        x1: x1 as any,
        y1: y1 as any,
        x2: x2 as any,
        y2: y2 as any,
        stroke: 'black',
      })

      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(5, 10)
      expect(ctx.lineTo).toHaveBeenCalledWith(95, 90)
    })

    it('should support signal for stroke', () => {
      const mockSignal = (val: string) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const stroke = mockSignal('purple')
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: stroke as any,
      })

      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.strokeStyle).toBe('purple')
    })

    it('should support signal for strokeWidth', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const strokeWidth = mockSignal(7)
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        strokeWidth: strokeWidth as any,
      })

      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.lineWidth).toBe(7)
    })

    it('should support signal for opacity', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const opacity = mockSignal(0.6)
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        opacity: opacity as any,
      })

      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.globalAlpha).toBe(0.6)
    })

    it('should support mixed static and signal props', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const x2 = mockSignal(120)
      const strokeWidth = mockSignal(3)

      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: x2 as any,
        y2: 80,
        stroke: 'blue',
        strokeWidth: strokeWidth as any,
      })

      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.moveTo).toHaveBeenCalledWith(10, 20)
      expect(ctx.lineTo).toHaveBeenCalledWith(120, 80)
      expect(ctx.strokeStyle).toBe('blue')
      expect(ctx.lineWidth).toBe(3)
    })
  })

  describe('Edge Cases', () => {
    it('should render line with same start and end points (zero-length line)', () => {
      const line = DrawLine({
        x1: 50,
        y1: 50,
        x2: 50,
        y2: 50,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(50, 50)
      expect(ctx.lineTo).toHaveBeenCalledWith(50, 50)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render line with negative coordinates', () => {
      const line = DrawLine({
        x1: -10,
        y1: -20,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.moveTo).toHaveBeenCalledWith(-10, -20)
      expect(ctx.lineTo).toHaveBeenCalledWith(100, 100)
    })

    it('should render line with both negative start and end points', () => {
      const line = DrawLine({
        x1: -50,
        y1: -30,
        x2: -10,
        y2: -5,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.moveTo).toHaveBeenCalledWith(-50, -30)
      expect(ctx.lineTo).toHaveBeenCalledWith(-10, -5)
    })

    it('should render line from positive to negative coordinates', () => {
      const line = DrawLine({
        x1: 50,
        y1: 50,
        x2: -20,
        y2: -10,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(50, 50)
      expect(ctx.lineTo).toHaveBeenCalledWith(-20, -10)
    })

    it('should render line with zero coordinates', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(0, 0)
    })

    it('should render line extending beyond canvas bounds', () => {
      const line = DrawLine({
        x1: 50,
        y1: 50,
        x2: 500,
        y2: 500,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(50, 50)
      expect(ctx.lineTo).toHaveBeenCalledWith(500, 500)
    })

    it('should render line with very large coordinates', () => {
      const line = DrawLine({
        x1: 10000,
        y1: 20000,
        x2: 50000,
        y2: 60000,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(10000, 20000)
      expect(ctx.lineTo).toHaveBeenCalledWith(50000, 60000)
    })

    it('should render line with fractional coordinates', () => {
      const line = DrawLine({
        x1: 10.5,
        y1: 20.7,
        x2: 100.3,
        y2: 150.9,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.moveTo).toHaveBeenCalledWith(10.5, 20.7)
      expect(ctx.lineTo).toHaveBeenCalledWith(100.3, 150.9)
    })

    it('should render very short line (1px)', () => {
      const line = DrawLine({
        x1: 50,
        y1: 50,
        x2: 51,
        y2: 50,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.moveTo).toHaveBeenCalledWith(50, 50)
      expect(ctx.lineTo).toHaveBeenCalledWith(51, 50)
    })

    it('should handle strokeWidth of 0 (defaults to 1)', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        strokeWidth: 0,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      // When strokeWidth is 0, renderer defaults to 1
      expect(ctx.lineWidth).toBe(1)
      expect(ctx.stroke).toHaveBeenCalled()
    })
  })

  describe('Context State Management', () => {
    it('should call save before rendering', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
    })

    it('should call restore after rendering', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should call save before restore', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 100, 100)

      const saveOrder = (ctx.save as any).mock.invocationCallOrder[0]
      const restoreOrder = (ctx.restore as any).mock.invocationCallOrder[0]

      expect(saveOrder).toBeLessThan(restoreOrder)
    })

    it('should restore context state after rendering with opacity', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        stroke: 'black',
        opacity: 0.5,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })
  })

  describe('Rendering Order', () => {
    it('should call canvas methods in correct order', () => {
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: 80,
        y2: 90,
        stroke: 'red',
        strokeWidth: 3,
        opacity: 0.8,
      })
      renderCanvasChildren(ctx, line, 100, 100)

      // Get call orders
      const saveOrder = (ctx.save as any).mock.invocationCallOrder[0]
      const beginPathOrder = (ctx.beginPath as any).mock.invocationCallOrder[0]
      const moveToOrder = (ctx.moveTo as any).mock.invocationCallOrder[0]
      const lineToOrder = (ctx.lineTo as any).mock.invocationCallOrder[0]
      const strokeOrder = (ctx.stroke as any).mock.invocationCallOrder[0]
      const restoreOrder = (ctx.restore as any).mock.invocationCallOrder[0]

      // Verify order
      expect(saveOrder).toBeLessThan(beginPathOrder)
      expect(beginPathOrder).toBeLessThan(moveToOrder)
      expect(moveToOrder).toBeLessThan(lineToOrder)
      expect(lineToOrder).toBeLessThan(strokeOrder)
      expect(strokeOrder).toBeLessThan(restoreOrder)
    })
  })

  describe('Multiple Lines', () => {
    it('should render multiple lines', () => {
      const lines = [
        DrawLine({ x1: 0, y1: 0, x2: 100, y2: 100, stroke: 'red' }),
        DrawLine({ x1: 100, y1: 0, x2: 0, y2: 100, stroke: 'blue' }),
      ]

      renderCanvasChildren(ctx, lines, 100, 100)

      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.beginPath).toHaveBeenCalledTimes(2)
      expect(ctx.stroke).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })

    it('should render lines with different properties', () => {
      const lines = [
        DrawLine({
          x1: 0,
          y1: 50,
          x2: 100,
          y2: 50,
          stroke: 'red',
          strokeWidth: 1,
        }),
        DrawLine({
          x1: 0,
          y1: 60,
          x2: 100,
          y2: 60,
          stroke: 'blue',
          strokeWidth: 3,
        }),
        DrawLine({
          x1: 0,
          y1: 70,
          x2: 100,
          y2: 70,
          stroke: 'green',
          strokeWidth: 5,
        }),
      ]

      renderCanvasChildren(ctx, lines, 100, 100)

      expect(ctx.stroke).toHaveBeenCalledTimes(3)
    })
  })

  describe('Integration with Canvas Dimensions', () => {
    it('should render line in small canvas', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 50,
        y2: 50,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 50, 50)

      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(50, 50)
    })

    it('should render line in large canvas', () => {
      const line = DrawLine({
        x1: 0,
        y1: 0,
        x2: 2000,
        y2: 1500,
        stroke: 'black',
      })
      renderCanvasChildren(ctx, line, 2000, 1500)

      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(2000, 1500)
    })
  })

  describe('Combined Properties', () => {
    it('should render line with all properties set', () => {
      const line = DrawLine({
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 150,
        stroke: '#ff5500',
        strokeWidth: 4,
        opacity: 0.75,
      })
      renderCanvasChildren(ctx, line, 200, 200)

      expect(ctx.globalAlpha).toBe(0.75)
      expect(ctx.strokeStyle).toBe('#ff5500')
      expect(ctx.lineWidth).toBe(4)
      expect(ctx.moveTo).toHaveBeenCalledWith(10, 20)
      expect(ctx.lineTo).toHaveBeenCalledWith(100, 150)
      expect(ctx.stroke).toHaveBeenCalled()
    })
  })
})
