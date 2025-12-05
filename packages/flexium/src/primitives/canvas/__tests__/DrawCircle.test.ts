/**
 * DrawCircle Component Tests
 *
 * Comprehensive tests for DrawCircle canvas primitive
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawCircle } from '../DrawCircle'
import { renderCanvasChildren } from '../renderer'

describe('DrawCircle', () => {
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

  describe('VNode Creation', () => {
    it('should create a circle VNode with correct type', () => {
      const circle = DrawCircle({ x: 50, y: 50, radius: 25 })

      expect(circle.type).toBe('canvas-circle')
      expect(circle.children).toEqual([])
    })

    it('should pass x, y, and radius props', () => {
      const circle = DrawCircle({ x: 100, y: 150, radius: 30 })

      expect(circle.props.x).toBe(100)
      expect(circle.props.y).toBe(150)
      expect(circle.props.radius).toBe(30)
    })

    it('should pass fill color prop', () => {
      const circle = DrawCircle({ x: 50, y: 50, radius: 25, fill: 'blue' })

      expect(circle.props.fill).toBe('blue')
    })

    it('should pass stroke and strokeWidth props', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        stroke: 'red',
        strokeWidth: 3,
      })

      expect(circle.props.stroke).toBe('red')
      expect(circle.props.strokeWidth).toBe(3)
    })

    it('should pass opacity prop', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'green',
        opacity: 0.7,
      })

      expect(circle.props.opacity).toBe(0.7)
    })

    it('should handle all props together', () => {
      const circle = DrawCircle({
        x: 75,
        y: 100,
        radius: 40,
        fill: 'purple',
        stroke: 'orange',
        strokeWidth: 2,
        opacity: 0.5,
      })

      expect(circle.props.x).toBe(75)
      expect(circle.props.y).toBe(100)
      expect(circle.props.radius).toBe(40)
      expect(circle.props.fill).toBe('purple')
      expect(circle.props.stroke).toBe('orange')
      expect(circle.props.strokeWidth).toBe(2)
      expect(circle.props.opacity).toBe(0.5)
    })
  })

  describe('Filled Circles', () => {
    it('should render filled circle with red color', () => {
      const circle = DrawCircle({ x: 100, y: 100, radius: 50, fill: 'red' })
      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalledWith(100, 100, 50, 0, 2 * Math.PI)
      expect(ctx.fillStyle).toBe('red')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render filled circle with blue color', () => {
      const circle = DrawCircle({ x: 75, y: 75, radius: 30, fill: 'blue' })
      renderCanvasChildren(ctx, circle, 150, 150)

      expect(ctx.fillStyle).toBe('blue')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render filled circle with green color', () => {
      const circle = DrawCircle({ x: 50, y: 50, radius: 20, fill: 'green' })
      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.fillStyle).toBe('green')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render filled circle with purple color', () => {
      const circle = DrawCircle({
        x: 100,
        y: 100,
        radius: 50,
        fill: 'purple',
      })
      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.fillStyle).toBe('purple')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render filled circle with hex color', () => {
      const circle = DrawCircle({
        x: 80,
        y: 80,
        radius: 35,
        fill: '#FF5733',
      })
      renderCanvasChildren(ctx, circle, 160, 160)

      expect(ctx.fillStyle).toBe('#FF5733')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render filled circle with rgb color', () => {
      const circle = DrawCircle({
        x: 90,
        y: 90,
        radius: 40,
        fill: 'rgb(255, 100, 50)',
      })
      renderCanvasChildren(ctx, circle, 180, 180)

      expect(ctx.fillStyle).toBe('rgb(255, 100, 50)')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render filled circle with rgba color', () => {
      const circle = DrawCircle({
        x: 70,
        y: 70,
        radius: 25,
        fill: 'rgba(100, 150, 200, 0.8)',
      })
      renderCanvasChildren(ctx, circle, 140, 140)

      expect(ctx.fillStyle).toBe('rgba(100, 150, 200, 0.8)')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should render large filled circle', () => {
      const circle = DrawCircle({
        x: 250,
        y: 250,
        radius: 150,
        fill: 'orange',
      })
      renderCanvasChildren(ctx, circle, 500, 500)

      expect(ctx.arc).toHaveBeenCalledWith(250, 250, 150, 0, 2 * Math.PI)
      expect(ctx.fillStyle).toBe('orange')
    })

    it('should render small filled circle', () => {
      const circle = DrawCircle({ x: 10, y: 10, radius: 3, fill: 'black' })
      renderCanvasChildren(ctx, circle, 20, 20)

      expect(ctx.arc).toHaveBeenCalledWith(10, 10, 3, 0, 2 * Math.PI)
      expect(ctx.fillStyle).toBe('black')
    })
  })

  describe('Stroked Circles', () => {
    it('should render stroked circle with default strokeWidth', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 30,
        stroke: 'orange',
      })
      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalledWith(50, 50, 30, 0, 2 * Math.PI)
      expect(ctx.strokeStyle).toBe('orange')
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render stroked circle with strokeWidth 2', () => {
      const circle = DrawCircle({
        x: 60,
        y: 60,
        radius: 35,
        stroke: 'red',
        strokeWidth: 2,
      })
      renderCanvasChildren(ctx, circle, 120, 120)

      expect(ctx.strokeStyle).toBe('red')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render stroked circle with strokeWidth 5', () => {
      const circle = DrawCircle({
        x: 75,
        y: 75,
        radius: 40,
        stroke: 'blue',
        strokeWidth: 5,
      })
      renderCanvasChildren(ctx, circle, 150, 150)

      expect(ctx.strokeStyle).toBe('blue')
      expect(ctx.lineWidth).toBe(5)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render thin stroked circle', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        stroke: 'green',
        strokeWidth: 1,
      })
      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.lineWidth).toBe(1)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render thick stroked circle', () => {
      const circle = DrawCircle({
        x: 100,
        y: 100,
        radius: 60,
        stroke: 'purple',
        strokeWidth: 10,
      })
      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.lineWidth).toBe(10)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render stroked circle with hex color', () => {
      const circle = DrawCircle({
        x: 80,
        y: 80,
        radius: 45,
        stroke: '#00FF00',
        strokeWidth: 3,
      })
      renderCanvasChildren(ctx, circle, 160, 160)

      expect(ctx.strokeStyle).toBe('#00FF00')
      expect(ctx.lineWidth).toBe(3)
    })
  })

  describe('Fill and Stroke Combined', () => {
    it('should render circle with both fill and stroke', () => {
      const circle = DrawCircle({
        x: 100,
        y: 100,
        radius: 50,
        fill: 'yellow',
        stroke: 'black',
        strokeWidth: 2,
      })
      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.fillStyle).toBe('yellow')
      expect(ctx.fill).toHaveBeenCalled()
      expect(ctx.strokeStyle).toBe('black')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should render circle with fill and stroke in different colors', () => {
      const circle = DrawCircle({
        x: 75,
        y: 75,
        radius: 40,
        fill: 'lightblue',
        stroke: 'darkblue',
        strokeWidth: 3,
      })
      renderCanvasChildren(ctx, circle, 150, 150)

      expect(ctx.fillStyle).toBe('lightblue')
      expect(ctx.strokeStyle).toBe('darkblue')
      expect(ctx.lineWidth).toBe(3)
    })

    it('should render circle with fill and thick stroke', () => {
      const circle = DrawCircle({
        x: 90,
        y: 90,
        radius: 45,
        fill: 'pink',
        stroke: 'red',
        strokeWidth: 8,
      })
      renderCanvasChildren(ctx, circle, 180, 180)

      expect(ctx.fillStyle).toBe('pink')
      expect(ctx.strokeStyle).toBe('red')
      expect(ctx.lineWidth).toBe(8)
    })

    it('should call fill before stroke when both are present', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
      })
      renderCanvasChildren(ctx, circle, 100, 100)

      // Get call order by checking mock call indices
      const fillCallIndex = ctx.fill.mock.invocationCallOrder[0]
      const strokeCallIndex = ctx.stroke.mock.invocationCallOrder[0]

      expect(fillCallIndex).toBeLessThan(strokeCallIndex)
    })
  })

  describe('Opacity Handling', () => {
    it('should apply opacity 0.5', () => {
      const circle = DrawCircle({
        x: 100,
        y: 100,
        radius: 50,
        fill: 'blue',
        opacity: 0.5,
      })
      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.globalAlpha).toBe(0.5)
    })

    it('should apply opacity 0.3', () => {
      const circle = DrawCircle({
        x: 75,
        y: 75,
        radius: 35,
        fill: 'red',
        opacity: 0.3,
      })
      renderCanvasChildren(ctx, circle, 150, 150)

      expect(ctx.globalAlpha).toBe(0.3)
    })

    it('should apply opacity 0.8', () => {
      const circle = DrawCircle({
        x: 60,
        y: 60,
        radius: 30,
        fill: 'green',
        opacity: 0.8,
      })
      renderCanvasChildren(ctx, circle, 120, 120)

      expect(ctx.globalAlpha).toBe(0.8)
    })

    it('should apply opacity 0.1 (very transparent)', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'purple',
        opacity: 0.1,
      })
      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.globalAlpha).toBe(0.1)
    })

    it('should apply opacity 1.0 (fully opaque)', () => {
      const circle = DrawCircle({
        x: 80,
        y: 80,
        radius: 40,
        fill: 'orange',
        opacity: 1.0,
      })
      renderCanvasChildren(ctx, circle, 160, 160)

      expect(ctx.globalAlpha).toBe(1.0)
    })

    it('should apply opacity to stroked circle', () => {
      const circle = DrawCircle({
        x: 70,
        y: 70,
        radius: 35,
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.6,
      })
      renderCanvasChildren(ctx, circle, 140, 140)

      expect(ctx.globalAlpha).toBe(0.6)
    })

    it('should apply opacity to circle with both fill and stroke', () => {
      const circle = DrawCircle({
        x: 90,
        y: 90,
        radius: 45,
        fill: 'yellow',
        stroke: 'brown',
        strokeWidth: 3,
        opacity: 0.7,
      })
      renderCanvasChildren(ctx, circle, 180, 180)

      expect(ctx.globalAlpha).toBe(0.7)
    })
  })

  describe('Signal-like Value Support', () => {
    it('should support signal-like x value', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const x = mockSignal(75)
      const circle = DrawCircle({
        x: x as any,
        y: 50,
        radius: 25,
        fill: 'red',
      })

      renderCanvasChildren(ctx, circle, 150, 100)

      expect(ctx.arc).toHaveBeenCalledWith(75, 50, 25, 0, 2 * Math.PI)
    })

    it('should support signal-like y value', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const y = mockSignal(80)
      const circle = DrawCircle({
        x: 60,
        y: y as any,
        radius: 30,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, circle, 120, 160)

      expect(ctx.arc).toHaveBeenCalledWith(60, 80, 30, 0, 2 * Math.PI)
    })

    it('should support signal-like radius value', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const radius = mockSignal(40)
      const circle = DrawCircle({
        x: 100,
        y: 100,
        radius: radius as any,
        fill: 'green',
      })

      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.arc).toHaveBeenCalledWith(100, 100, 40, 0, 2 * Math.PI)
    })

    it('should support signal-like fill value', () => {
      const mockSignal = (val: string) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const fill = mockSignal('purple')
      const circle = DrawCircle({
        x: 70,
        y: 70,
        radius: 35,
        fill: fill as any,
      })

      renderCanvasChildren(ctx, circle, 140, 140)

      expect(ctx.fillStyle).toBe('purple')
    })

    it('should support signal-like stroke value', () => {
      const mockSignal = (val: string) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const stroke = mockSignal('orange')
      const circle = DrawCircle({
        x: 60,
        y: 60,
        radius: 30,
        stroke: stroke as any,
        strokeWidth: 2,
      })

      renderCanvasChildren(ctx, circle, 120, 120)

      expect(ctx.strokeStyle).toBe('orange')
    })

    it('should support signal-like strokeWidth value', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const strokeWidth = mockSignal(5)
      const circle = DrawCircle({
        x: 80,
        y: 80,
        radius: 40,
        stroke: 'black',
        strokeWidth: strokeWidth as any,
      })

      renderCanvasChildren(ctx, circle, 160, 160)

      expect(ctx.lineWidth).toBe(5)
    })

    it('should support signal-like opacity value', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const opacity = mockSignal(0.4)
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'red',
        opacity: opacity as any,
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.globalAlpha).toBe(0.4)
    })

    it('should support multiple signal-like values', () => {
      const mockSignal = <T,>(val: T) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const x = mockSignal(90)
      const y = mockSignal(110)
      const radius = mockSignal(45)
      const fill = mockSignal('cyan')

      const circle = DrawCircle({
        x: x as any,
        y: y as any,
        radius: radius as any,
        fill: fill as any,
      })

      renderCanvasChildren(ctx, circle, 200, 200)

      expect(ctx.arc).toHaveBeenCalledWith(90, 110, 45, 0, 2 * Math.PI)
      expect(ctx.fillStyle).toBe('cyan')
    })

    it('should support all props as signals', () => {
      const mockSignal = <T,>(val: T) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })
      const x = mockSignal(100)
      const y = mockSignal(120)
      const radius = mockSignal(50)
      const fill = mockSignal('magenta')
      const stroke = mockSignal('navy')
      const strokeWidth = mockSignal(4)
      const opacity = mockSignal(0.75)

      const circle = DrawCircle({
        x: x as any,
        y: y as any,
        radius: radius as any,
        fill: fill as any,
        stroke: stroke as any,
        strokeWidth: strokeWidth as any,
        opacity: opacity as any,
      })

      renderCanvasChildren(ctx, circle, 250, 250)

      expect(ctx.arc).toHaveBeenCalledWith(100, 120, 50, 0, 2 * Math.PI)
      expect(ctx.fillStyle).toBe('magenta')
      expect(ctx.strokeStyle).toBe('navy')
      expect(ctx.lineWidth).toBe(4)
      expect(ctx.globalAlpha).toBe(0.75)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero radius', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 0,
        fill: 'red',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.arc).toHaveBeenCalledWith(50, 50, 0, 0, 2 * Math.PI)
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should handle negative x coordinate', () => {
      const circle = DrawCircle({
        x: -10,
        y: 50,
        radius: 20,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.arc).toHaveBeenCalledWith(-10, 50, 20, 0, 2 * Math.PI)
    })

    it('should handle negative y coordinate', () => {
      const circle = DrawCircle({
        x: 50,
        y: -15,
        radius: 25,
        fill: 'green',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.arc).toHaveBeenCalledWith(50, -15, 25, 0, 2 * Math.PI)
    })

    it('should handle negative radius (should still render)', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: -10,
        fill: 'purple',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      // Canvas API will throw for negative radius, but we pass it through
      expect(ctx.arc).toHaveBeenCalledWith(50, 50, -10, 0, 2 * Math.PI)
    })

    it('should handle very small radius (fractional)', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 0.5,
        fill: 'orange',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.arc).toHaveBeenCalledWith(50, 50, 0.5, 0, 2 * Math.PI)
    })

    it('should handle very large radius', () => {
      const circle = DrawCircle({
        x: 500,
        y: 500,
        radius: 1000,
        fill: 'yellow',
      })

      renderCanvasChildren(ctx, circle, 2000, 2000)

      expect(ctx.arc).toHaveBeenCalledWith(500, 500, 1000, 0, 2 * Math.PI)
    })

    it('should handle fractional coordinates', () => {
      const circle = DrawCircle({
        x: 50.5,
        y: 75.7,
        radius: 25.3,
        fill: 'pink',
      })

      renderCanvasChildren(ctx, circle, 150, 150)

      expect(ctx.arc).toHaveBeenCalledWith(50.5, 75.7, 25.3, 0, 2 * Math.PI)
    })

    it('should handle zero strokeWidth (defaults to 1)', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        stroke: 'black',
        strokeWidth: 0,
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      // strokeWidth of 0 defaults to 1 in the renderer
      expect(ctx.lineWidth).toBe(1)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should handle opacity 0 (fully transparent)', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'red',
        opacity: 0,
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.globalAlpha).toBe(0)
    })

    it('should handle circle at origin', () => {
      const circle = DrawCircle({
        x: 0,
        y: 0,
        radius: 10,
        fill: 'blue',
      })

      renderCanvasChildren(ctx, circle, 50, 50)

      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 10, 0, 2 * Math.PI)
    })

    it('should handle circle outside canvas bounds', () => {
      const circle = DrawCircle({
        x: 200,
        y: 200,
        radius: 50,
        fill: 'green',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      // Should still attempt to render
      expect(ctx.arc).toHaveBeenCalledWith(200, 200, 50, 0, 2 * Math.PI)
    })

    it('should handle circle without fill or stroke', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      // Should create path but not fill or stroke
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalledWith(50, 50, 25, 0, 2 * Math.PI)
    })
  })

  describe('Context State Management', () => {
    it('should call save before rendering', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'red',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.save.mock.invocationCallOrder[0]).toBeLessThan(
        ctx.beginPath.mock.invocationCallOrder[0]
      )
    })

    it('should call restore after rendering', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'red',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      expect(ctx.restore).toHaveBeenCalled()
      expect(ctx.fill.mock.invocationCallOrder[0]).toBeLessThan(
        ctx.restore.mock.invocationCallOrder[0]
      )
    })

    it('should save and restore for each circle', () => {
      const circles = [
        DrawCircle({ x: 30, y: 30, radius: 15, fill: 'red' }),
        DrawCircle({ x: 70, y: 70, radius: 20, fill: 'blue' }),
      ]

      renderCanvasChildren(ctx, circles, 100, 100)

      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })
  })

  describe('Rendering Order', () => {
    it('should follow correct rendering sequence for filled circle', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        fill: 'red',
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      const saveOrder = ctx.save.mock.invocationCallOrder[0]
      const beginPathOrder = ctx.beginPath.mock.invocationCallOrder[0]
      const arcOrder = ctx.arc.mock.invocationCallOrder[0]
      const fillOrder = ctx.fill.mock.invocationCallOrder[0]
      const restoreOrder = ctx.restore.mock.invocationCallOrder[0]

      expect(saveOrder).toBeLessThan(beginPathOrder)
      expect(beginPathOrder).toBeLessThan(arcOrder)
      expect(arcOrder).toBeLessThan(fillOrder)
      expect(fillOrder).toBeLessThan(restoreOrder)
    })

    it('should follow correct rendering sequence for stroked circle', () => {
      const circle = DrawCircle({
        x: 50,
        y: 50,
        radius: 25,
        stroke: 'black',
        strokeWidth: 2,
      })

      renderCanvasChildren(ctx, circle, 100, 100)

      const saveOrder = ctx.save.mock.invocationCallOrder[0]
      const beginPathOrder = ctx.beginPath.mock.invocationCallOrder[0]
      const arcOrder = ctx.arc.mock.invocationCallOrder[0]
      const strokeOrder = ctx.stroke.mock.invocationCallOrder[0]
      const restoreOrder = ctx.restore.mock.invocationCallOrder[0]

      expect(saveOrder).toBeLessThan(beginPathOrder)
      expect(beginPathOrder).toBeLessThan(arcOrder)
      expect(arcOrder).toBeLessThan(strokeOrder)
      expect(strokeOrder).toBeLessThan(restoreOrder)
    })
  })
})
