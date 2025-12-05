/**
 * DrawText Canvas Primitive Tests
 *
 * Comprehensive tests for DrawText canvas text rendering primitive
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawText } from '../DrawText'
import { renderCanvasChildren } from '../renderer'

describe('DrawText', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    // Mock canvas context
    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      font: '',
      textAlign: 'left' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
    } as unknown as CanvasRenderingContext2D
  })

  describe('VNode Creation', () => {
    it('should create a text VNode with correct type', () => {
      const text = DrawText({ x: 10, y: 20, text: 'Hello' })

      expect(text.type).toBe('canvas-text')
      expect(text.children).toEqual([])
    })

    it('should pass all props correctly', () => {
      const text = DrawText({
        x: 50,
        y: 100,
        text: 'Test Text',
        fill: 'blue',
        fontSize: 24,
        fontFamily: 'Arial',
      })

      expect(text.props.x).toBe(50)
      expect(text.props.y).toBe(100)
      expect(text.props.text).toBe('Test Text')
      expect(text.props.fill).toBe('blue')
      expect(text.props.fontSize).toBe(24)
      expect(text.props.fontFamily).toBe('Arial')
    })

    it('should handle minimal props', () => {
      const text = DrawText({ x: 0, y: 0, text: 'A' })

      expect(text.props.x).toBe(0)
      expect(text.props.y).toBe(0)
      expect(text.props.text).toBe('A')
    })
  })

  describe('Text Rendering with Fill Color', () => {
    it('should render text with fill color', () => {
      const text = DrawText({
        x: 20,
        y: 40,
        text: 'Hello Canvas',
        fill: 'black',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillStyle).toBe('black')
      expect(ctx.fillText).toHaveBeenCalledWith('Hello Canvas', 20, 40)
      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should render text with different fill colors', () => {
      const colors = ['red', 'blue', 'green', '#FF5733', 'rgba(0,0,0,0.5)']

      colors.forEach((color) => {
        const text = DrawText({ x: 10, y: 10, text: 'Test', fill: color })
        renderCanvasChildren(ctx, text, 100, 100)
        expect(ctx.fillStyle).toBe(color)
      })
    })

    it('should not render text without fill color', () => {
      const text = DrawText({ x: 10, y: 10, text: 'No Fill' })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillText).not.toHaveBeenCalled()
    })
  })

  describe('Font Properties', () => {
    describe('fontSize', () => {
      it('should apply default font size when not specified', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Default',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('12px')
      })

      it('should apply custom font size', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Custom Size',
          fill: 'black',
          fontSize: 24,
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('24px')
      })

      it('should handle various font sizes', () => {
        const sizes = [8, 12, 16, 20, 24, 32, 48, 72]

        sizes.forEach((size) => {
          const text = DrawText({
            x: 10,
            y: 10,
            text: 'Test',
            fill: 'black',
            fontSize: size,
          })
          renderCanvasChildren(ctx, text, 100, 100)
          expect(ctx.font).toContain(`${size}px`)
        })
      })

      it('should handle small font sizes', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Tiny',
          fill: 'black',
          fontSize: 6,
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('6px')
      })

      it('should handle large font sizes', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Large',
          fill: 'black',
          fontSize: 128,
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('128px')
      })
    })

    describe('fontFamily', () => {
      it('should apply default font family when not specified', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Default Font',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('sans-serif')
      })

      it('should apply custom font family', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Custom Font',
          fill: 'black',
          fontFamily: 'Arial',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('Arial')
      })

      it('should handle various font families', () => {
        const fonts = [
          'Arial',
          'Helvetica',
          'Times New Roman',
          'Courier',
          'Georgia',
          'Verdana',
          'monospace',
        ]

        fonts.forEach((font) => {
          const text = DrawText({
            x: 10,
            y: 10,
            text: 'Test',
            fill: 'black',
            fontFamily: font,
          })
          renderCanvasChildren(ctx, text, 100, 100)
          expect(ctx.font).toContain(font)
        })
      })
    })

    describe('fontWeight', () => {
      it('should apply default font weight when not specified', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Normal Weight',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('normal')
      })

      it('should apply bold font weight', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Bold Text',
          fill: 'black',
          fontWeight: 'bold',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('bold')
      })

      it('should apply numeric font weight', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Weight 700',
          fill: 'black',
          fontWeight: 700,
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.font).toContain('700')
      })

      it('should handle various font weights', () => {
        const weights = ['normal', 'bold', 100, 300, 400, 600, 900]

        weights.forEach((weight) => {
          const text = DrawText({
            x: 10,
            y: 10,
            text: 'Test',
            fill: 'black',
            fontWeight: weight as 'normal' | 'bold' | number,
          })
          renderCanvasChildren(ctx, text, 100, 100)
          expect(ctx.font).toContain(String(weight))
        })
      })
    })

    it('should combine all font properties correctly', () => {
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'Full Font',
        fill: 'black',
        fontSize: 20,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.font).toBe('bold 20px Helvetica')
    })

    it('should format font string with numeric weight', () => {
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'Numeric Weight',
        fill: 'black',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 600,
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.font).toBe('600 16px Arial')
    })
  })

  describe('Text Alignment', () => {
    describe('textAlign', () => {
      it('should apply default text align when not specified', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Default Align',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textAlign).toBe('left')
      })

      it('should apply left text align', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Left',
          fill: 'black',
          textAlign: 'left',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textAlign).toBe('left')
      })

      it('should apply center text align', () => {
        const text = DrawText({
          x: 50,
          y: 10,
          text: 'Center',
          fill: 'black',
          textAlign: 'center',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textAlign).toBe('center')
      })

      it('should apply right text align', () => {
        const text = DrawText({
          x: 90,
          y: 10,
          text: 'Right',
          fill: 'black',
          textAlign: 'right',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textAlign).toBe('right')
      })

      it('should handle all textAlign values', () => {
        const alignments: Array<'left' | 'center' | 'right'> = [
          'left',
          'center',
          'right',
        ]

        alignments.forEach((align) => {
          const text = DrawText({
            x: 10,
            y: 10,
            text: 'Test',
            fill: 'black',
            textAlign: align,
          })
          renderCanvasChildren(ctx, text, 100, 100)
          expect(ctx.textAlign).toBe(align)
        })
      })
    })

    describe('textBaseline', () => {
      it('should apply default text baseline when not specified', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Default Baseline',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textBaseline).toBe('alphabetic')
      })

      it('should apply top text baseline', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Top',
          fill: 'black',
          textBaseline: 'top',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textBaseline).toBe('top')
      })

      it('should apply middle text baseline', () => {
        const text = DrawText({
          x: 10,
          y: 50,
          text: 'Middle',
          fill: 'black',
          textBaseline: 'middle',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textBaseline).toBe('middle')
      })

      it('should apply bottom text baseline', () => {
        const text = DrawText({
          x: 10,
          y: 90,
          text: 'Bottom',
          fill: 'black',
          textBaseline: 'bottom',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textBaseline).toBe('bottom')
      })

      it('should apply alphabetic text baseline', () => {
        const text = DrawText({
          x: 10,
          y: 50,
          text: 'Alphabetic',
          fill: 'black',
          textBaseline: 'alphabetic',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.textBaseline).toBe('alphabetic')
      })

      it('should handle all textBaseline values', () => {
        const baselines: Array<'top' | 'middle' | 'bottom' | 'alphabetic'> = [
          'top',
          'middle',
          'bottom',
          'alphabetic',
        ]

        baselines.forEach((baseline) => {
          const text = DrawText({
            x: 10,
            y: 10,
            text: 'Test',
            fill: 'black',
            textBaseline: baseline,
          })
          renderCanvasChildren(ctx, text, 100, 100)
          expect(ctx.textBaseline).toBe(baseline)
        })
      })
    })

    it('should combine textAlign and textBaseline', () => {
      const text = DrawText({
        x: 50,
        y: 50,
        text: 'Centered',
        fill: 'black',
        textAlign: 'center',
        textBaseline: 'middle',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.textAlign).toBe('center')
      expect(ctx.textBaseline).toBe('middle')
    })
  })

  describe('Opacity Handling', () => {
    it('should not apply opacity if not specified', () => {
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'No Opacity',
        fill: 'black',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      // globalAlpha should remain at default 1
      expect(ctx.globalAlpha).toBe(1)
    })

    it('should handle opacity when implemented', () => {
      // Note: The current implementation doesn't support opacity for text
      // This test documents the expected behavior if it's added
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'With Opacity',
        fill: 'black',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      // Currently opacity is not supported for DrawText
      // If implemented, this would check: expect(ctx.globalAlpha).toBe(0.5)
      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })
  })

  describe('Signal-like Value Support', () => {
    it('should support signal-like x coordinate', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const x = mockSignal(30)
      const text = DrawText({
        x: x as any,
        y: 40,
        text: 'Signal X',
        fill: 'black',
      })

      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillText).toHaveBeenCalledWith('Signal X', 30, 40)
    })

    it('should support signal-like y coordinate', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const y = mockSignal(60)
      const text = DrawText({
        x: 20,
        y: y as any,
        text: 'Signal Y',
        fill: 'black',
      })

      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillText).toHaveBeenCalledWith('Signal Y', 20, 60)
    })

    it('should support signal-like text value', () => {
      const mockSignal = (val: string) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const textValue = mockSignal('Dynamic Text')
      const text = DrawText({
        x: 10,
        y: 10,
        text: textValue as any,
        fill: 'black',
      })

      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillText).toHaveBeenCalledWith('Dynamic Text', 10, 10)
    })

    it('should support signal-like fill color', () => {
      const mockSignal = (val: string) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const fill = mockSignal('blue')
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'Signal Fill',
        fill: fill as any,
      })

      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillStyle).toBe('blue')
    })

    it('should support signal-like fontSize', () => {
      const mockSignal = (val: number) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const fontSize = mockSignal(36)
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'Signal Size',
        fill: 'black',
        fontSize: fontSize as any,
      })

      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.font).toContain('36px')
    })

    it('should support multiple signal-like values', () => {
      const mockSignal = <T,>(val: T) => ({
        value: val,
        peek: () => val,
        set: () => {},
      })

      const x = mockSignal(15)
      const y = mockSignal(25)
      const textValue = mockSignal('All Signals')
      const fontSize = mockSignal(18)
      const fill = mockSignal('red')

      const text = DrawText({
        x: x as any,
        y: y as any,
        text: textValue as any,
        fill: fill as any,
        fontSize: fontSize as any,
      })

      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.fillText).toHaveBeenCalledWith('All Signals', 15, 25)
      expect(ctx.fillStyle).toBe('red')
      expect(ctx.font).toContain('18px')
    })
  })

  describe('Edge Cases', () => {
    describe('Empty and Special Text', () => {
      it('should handle empty string', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('', 10, 10)
      })

      it('should handle single character', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'A',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('A', 10, 10)
      })

      it('should handle whitespace', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '   ',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('   ', 10, 10)
      })

      it('should handle newline characters', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Line 1\nLine 2',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('Line 1\nLine 2', 10, 10)
      })

      it('should handle tab characters', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: 'Col1\tCol2',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('Col1\tCol2', 10, 10)
      })
    })

    describe('Special Characters', () => {
      it('should handle Unicode characters', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '你好世界',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('你好世界', 10, 10)
      })

      it('should handle emoji', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '👋🌍',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('👋🌍', 10, 10)
      })

      it('should handle symbols and special characters', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '©®™€£¥',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('©®™€£¥', 10, 10)
      })

      it('should handle mathematical symbols', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '∑∫π√∞',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('∑∫π√∞', 10, 10)
      })

      it('should handle HTML entities as plain text', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: '&lt;div&gt;',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('&lt;div&gt;', 10, 10)
      })

      it('should handle quotes', () => {
        const text = DrawText({
          x: 10,
          y: 10,
          text: `"Hello" and 'World'`,
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith(`"Hello" and 'World'`, 10, 10)
      })
    })

    describe('Long Text', () => {
      it('should handle very long text', () => {
        const longText = 'A'.repeat(1000)
        const text = DrawText({
          x: 10,
          y: 10,
          text: longText,
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith(longText, 10, 10)
      })

      it('should handle multiline text', () => {
        const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4'
        const text = DrawText({
          x: 10,
          y: 10,
          text: multilineText,
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith(multilineText, 10, 10)
      })
    })

    describe('Coordinates', () => {
      it('should handle zero coordinates', () => {
        const text = DrawText({
          x: 0,
          y: 0,
          text: 'Origin',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('Origin', 0, 0)
      })

      it('should handle negative coordinates', () => {
        const text = DrawText({
          x: -10,
          y: -20,
          text: 'Negative',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('Negative', -10, -20)
      })

      it('should handle large coordinates', () => {
        const text = DrawText({
          x: 10000,
          y: 20000,
          text: 'Far Away',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('Far Away', 10000, 20000)
      })

      it('should handle decimal coordinates', () => {
        const text = DrawText({
          x: 10.5,
          y: 20.7,
          text: 'Decimal',
          fill: 'black',
        })
        renderCanvasChildren(ctx, text, 100, 100)

        expect(ctx.fillText).toHaveBeenCalledWith('Decimal', 10.5, 20.7)
      })
    })
  })

  describe('Context State Management', () => {
    it('should save and restore context state', () => {
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'State Test',
        fill: 'black',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.save).toHaveBeenCalledTimes(1)
      expect(ctx.restore).toHaveBeenCalledTimes(1)
    })

    it('should restore context state after rendering', () => {
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'Restore Test',
        fill: 'black',
        fontSize: 24,
        fontFamily: 'Arial',
        textAlign: 'center',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      // Verify save was called before restore
      const saveCallOrder = ctx.save.mock.invocationCallOrder[0]
      const restoreCallOrder = ctx.restore.mock.invocationCallOrder[0]
      expect(saveCallOrder).toBeLessThan(restoreCallOrder)
    })

    it('should isolate context changes between multiple text renders', () => {
      const text1 = DrawText({
        x: 10,
        y: 10,
        text: 'First',
        fill: 'red',
        fontSize: 12,
      })
      const text2 = DrawText({
        x: 50,
        y: 50,
        text: 'Second',
        fill: 'blue',
        fontSize: 24,
      })

      renderCanvasChildren(ctx, [text1, text2], 100, 100)

      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration with Other Properties', () => {
    it('should render with all properties combined', () => {
      const text = DrawText({
        x: 100,
        y: 200,
        text: 'Complete Text',
        fill: 'rgba(255, 0, 0, 0.8)',
        fontSize: 32,
        fontFamily: 'Georgia',
        fontWeight: 'bold',
        textAlign: 'center',
        textBaseline: 'middle',
      })
      renderCanvasChildren(ctx, text, 400, 400)

      expect(ctx.fillStyle).toBe('rgba(255, 0, 0, 0.8)')
      expect(ctx.font).toBe('bold 32px Georgia')
      expect(ctx.textAlign).toBe('center')
      expect(ctx.textBaseline).toBe('middle')
      expect(ctx.fillText).toHaveBeenCalledWith('Complete Text', 100, 200)
    })

    it('should handle minimal configuration', () => {
      const text = DrawText({
        x: 10,
        y: 10,
        text: 'Minimal',
        fill: 'black',
      })
      renderCanvasChildren(ctx, text, 100, 100)

      expect(ctx.font).toBe('normal 12px sans-serif')
      expect(ctx.textAlign).toBe('left')
      expect(ctx.textBaseline).toBe('alphabetic')
      expect(ctx.fillText).toHaveBeenCalledWith('Minimal', 10, 10)
    })
  })

  describe('Multiple Text Elements', () => {
    it('should render multiple text elements', () => {
      const texts = [
        DrawText({ x: 10, y: 10, text: 'First', fill: 'red' }),
        DrawText({ x: 10, y: 30, text: 'Second', fill: 'blue' }),
        DrawText({ x: 10, y: 50, text: 'Third', fill: 'green' }),
      ]

      renderCanvasChildren(ctx, texts, 100, 100)

      expect(ctx.fillText).toHaveBeenCalledTimes(3)
      expect(ctx.fillText).toHaveBeenNthCalledWith(1, 'First', 10, 10)
      expect(ctx.fillText).toHaveBeenNthCalledWith(2, 'Second', 10, 30)
      expect(ctx.fillText).toHaveBeenNthCalledWith(3, 'Third', 10, 50)
    })

    it('should maintain separate styles for each text element', () => {
      const texts = [
        DrawText({
          x: 10,
          y: 10,
          text: 'Small',
          fill: 'black',
          fontSize: 10,
        }),
        DrawText({
          x: 10,
          y: 30,
          text: 'Large',
          fill: 'black',
          fontSize: 30,
        }),
      ]

      renderCanvasChildren(ctx, texts, 100, 100)

      // Each should have saved and restored context
      expect(ctx.save).toHaveBeenCalledTimes(2)
      expect(ctx.restore).toHaveBeenCalledTimes(2)
    })
  })
})
