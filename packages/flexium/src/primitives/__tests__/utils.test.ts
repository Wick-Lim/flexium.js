import { describe, it, expect } from 'vitest'
import { normalizeStyle } from '../utils'

describe('normalizeStyle', () => {
  describe('empty/undefined input', () => {
    it('should return empty object for undefined', () => {
      expect(normalizeStyle(undefined)).toEqual({})
    })

    it('should return empty object for null-like values', () => {
      expect(normalizeStyle(undefined)).toEqual({})
    })

    it('should return empty object for empty style', () => {
      expect(normalizeStyle({})).toEqual({})
    })
  })

  describe('layout properties', () => {
    it('should normalize display', () => {
      expect(normalizeStyle({ display: 'flex' })).toEqual({ display: 'flex' })
    })

    it('should normalize flex', () => {
      expect(normalizeStyle({ flex: 1 })).toEqual({ flex: 1 })
      expect(normalizeStyle({ flex: 0 })).toEqual({ flex: 0 })
    })

    it('should normalize flexDirection', () => {
      expect(normalizeStyle({ flexDirection: 'row' })).toEqual({ flexDirection: 'row' })
      expect(normalizeStyle({ flexDirection: 'column' })).toEqual({ flexDirection: 'column' })
    })

    it('should normalize flexWrap', () => {
      expect(normalizeStyle({ flexWrap: 'wrap' })).toEqual({ flexWrap: 'wrap' })
    })

    it('should normalize justifyContent', () => {
      expect(normalizeStyle({ justifyContent: 'center' })).toEqual({ justifyContent: 'center' })
    })

    it('should normalize alignItems', () => {
      expect(normalizeStyle({ alignItems: 'center' })).toEqual({ alignItems: 'center' })
    })

    it('should normalize alignSelf', () => {
      expect(normalizeStyle({ alignSelf: 'flex-start' })).toEqual({ alignSelf: 'flex-start' })
    })

    it('should normalize gap with px suffix', () => {
      expect(normalizeStyle({ gap: 16 })).toEqual({ gap: '16px' })
      expect(normalizeStyle({ gap: 0 })).toEqual({ gap: '0px' })
    })
  })

  describe('padding properties', () => {
    it('should normalize padding', () => {
      expect(normalizeStyle({ padding: 10 })).toEqual({ padding: '10px' })
    })

    it('should normalize individual padding properties', () => {
      expect(normalizeStyle({ paddingTop: 5 })).toEqual({ paddingTop: '5px' })
      expect(normalizeStyle({ paddingRight: 10 })).toEqual({ paddingRight: '10px' })
      expect(normalizeStyle({ paddingBottom: 15 })).toEqual({ paddingBottom: '15px' })
      expect(normalizeStyle({ paddingLeft: 20 })).toEqual({ paddingLeft: '20px' })
    })

    it('should normalize paddingHorizontal to left and right', () => {
      expect(normalizeStyle({ paddingHorizontal: 12 })).toEqual({
        paddingLeft: '12px',
        paddingRight: '12px',
      })
    })

    it('should normalize paddingVertical to top and bottom', () => {
      expect(normalizeStyle({ paddingVertical: 8 })).toEqual({
        paddingTop: '8px',
        paddingBottom: '8px',
      })
    })

    it('should handle zero padding', () => {
      expect(normalizeStyle({ padding: 0 })).toEqual({ padding: '0px' })
    })
  })

  describe('margin properties', () => {
    it('should normalize margin', () => {
      expect(normalizeStyle({ margin: 10 })).toEqual({ margin: '10px' })
    })

    it('should normalize individual margin properties', () => {
      expect(normalizeStyle({ marginTop: 5 })).toEqual({ marginTop: '5px' })
      expect(normalizeStyle({ marginRight: 10 })).toEqual({ marginRight: '10px' })
      expect(normalizeStyle({ marginBottom: 15 })).toEqual({ marginBottom: '15px' })
      expect(normalizeStyle({ marginLeft: 20 })).toEqual({ marginLeft: '20px' })
    })

    it('should normalize marginHorizontal to left and right', () => {
      expect(normalizeStyle({ marginHorizontal: 12 })).toEqual({
        marginLeft: '12px',
        marginRight: '12px',
      })
    })

    it('should normalize marginVertical to top and bottom', () => {
      expect(normalizeStyle({ marginVertical: 8 })).toEqual({
        marginTop: '8px',
        marginBottom: '8px',
      })
    })
  })

  describe('sizing properties', () => {
    it('should normalize width as number', () => {
      expect(normalizeStyle({ width: 100 })).toEqual({ width: '100px' })
    })

    it('should normalize width as string', () => {
      expect(normalizeStyle({ width: '50%' })).toEqual({ width: '50%' })
      expect(normalizeStyle({ width: 'auto' })).toEqual({ width: 'auto' })
    })

    it('should normalize height as number', () => {
      expect(normalizeStyle({ height: 200 })).toEqual({ height: '200px' })
    })

    it('should normalize height as string', () => {
      expect(normalizeStyle({ height: '100vh' })).toEqual({ height: '100vh' })
    })

    it('should normalize minWidth and maxWidth', () => {
      expect(normalizeStyle({ minWidth: 50, maxWidth: 500 })).toEqual({
        minWidth: '50px',
        maxWidth: '500px',
      })
    })

    it('should normalize minHeight and maxHeight', () => {
      expect(normalizeStyle({ minHeight: 100, maxHeight: 800 })).toEqual({
        minHeight: '100px',
        maxHeight: '800px',
      })
    })
  })

  describe('visual properties', () => {
    it('should normalize backgroundColor', () => {
      expect(normalizeStyle({ backgroundColor: '#ff0000' })).toEqual({
        backgroundColor: '#ff0000',
      })
    })

    it('should normalize borderRadius', () => {
      expect(normalizeStyle({ borderRadius: 8 })).toEqual({ borderRadius: '8px' })
    })

    it('should normalize individual border radius properties', () => {
      expect(normalizeStyle({ borderTopLeftRadius: 4 })).toEqual({
        borderTopLeftRadius: '4px',
      })
      expect(normalizeStyle({ borderTopRightRadius: 4 })).toEqual({
        borderTopRightRadius: '4px',
      })
      expect(normalizeStyle({ borderBottomLeftRadius: 4 })).toEqual({
        borderBottomLeftRadius: '4px',
      })
      expect(normalizeStyle({ borderBottomRightRadius: 4 })).toEqual({
        borderBottomRightRadius: '4px',
      })
    })

    it('should normalize opacity', () => {
      expect(normalizeStyle({ opacity: 0.5 })).toEqual({ opacity: 0.5 })
      expect(normalizeStyle({ opacity: 0 })).toEqual({ opacity: 0 })
      expect(normalizeStyle({ opacity: 1 })).toEqual({ opacity: 1 })
    })
  })

  describe('border properties', () => {
    it('should normalize borderWidth', () => {
      expect(normalizeStyle({ borderWidth: 1 })).toEqual({ borderWidth: '1px' })
    })

    it('should normalize borderColor', () => {
      expect(normalizeStyle({ borderColor: '#000000' })).toEqual({
        borderColor: '#000000',
      })
    })

    it('should normalize individual border width properties', () => {
      expect(normalizeStyle({ borderTopWidth: 1 })).toEqual({ borderTopWidth: '1px' })
      expect(normalizeStyle({ borderRightWidth: 2 })).toEqual({ borderRightWidth: '2px' })
      expect(normalizeStyle({ borderBottomWidth: 3 })).toEqual({ borderBottomWidth: '3px' })
      expect(normalizeStyle({ borderLeftWidth: 4 })).toEqual({ borderLeftWidth: '4px' })
    })
  })

  describe('position properties', () => {
    it('should normalize position', () => {
      expect(normalizeStyle({ position: 'absolute' })).toEqual({ position: 'absolute' })
      expect(normalizeStyle({ position: 'relative' })).toEqual({ position: 'relative' })
    })

    it('should normalize position offsets', () => {
      expect(normalizeStyle({ top: 10 })).toEqual({ top: '10px' })
      expect(normalizeStyle({ right: 20 })).toEqual({ right: '20px' })
      expect(normalizeStyle({ bottom: 30 })).toEqual({ bottom: '30px' })
      expect(normalizeStyle({ left: 40 })).toEqual({ left: '40px' })
    })

    it('should normalize zIndex', () => {
      expect(normalizeStyle({ zIndex: 100 })).toEqual({ zIndex: 100 })
      expect(normalizeStyle({ zIndex: 0 })).toEqual({ zIndex: 0 })
    })
  })

  describe('transform property', () => {
    it('should normalize transform', () => {
      expect(normalizeStyle({ transform: 'translateX(10px)' })).toEqual({
        transform: 'translateX(10px)',
      })
      expect(normalizeStyle({ transform: 'rotate(45deg) scale(1.5)' })).toEqual({
        transform: 'rotate(45deg) scale(1.5)',
      })
    })
  })

  describe('text properties', () => {
    it('should normalize color', () => {
      expect(normalizeStyle({ color: '#333333' })).toEqual({ color: '#333333' })
    })

    it('should normalize fontSize', () => {
      expect(normalizeStyle({ fontSize: 16 })).toEqual({ fontSize: '16px' })
    })

    it('should normalize fontWeight', () => {
      expect(normalizeStyle({ fontWeight: 'bold' })).toEqual({ fontWeight: 'bold' })
      expect(normalizeStyle({ fontWeight: '600' })).toEqual({ fontWeight: '600' })
    })

    it('should normalize fontFamily', () => {
      expect(normalizeStyle({ fontFamily: 'Arial, sans-serif' })).toEqual({
        fontFamily: 'Arial, sans-serif',
      })
    })

    it('should normalize fontStyle', () => {
      expect(normalizeStyle({ fontStyle: 'italic' })).toEqual({ fontStyle: 'italic' })
    })

    it('should normalize textAlign', () => {
      expect(normalizeStyle({ textAlign: 'center' })).toEqual({ textAlign: 'center' })
    })

    it('should normalize textDecoration', () => {
      expect(normalizeStyle({ textDecoration: 'underline' })).toEqual({
        textDecoration: 'underline',
      })
    })

    it('should normalize lineHeight', () => {
      expect(normalizeStyle({ lineHeight: 24 })).toEqual({ lineHeight: '24px' })
    })

    it('should normalize letterSpacing', () => {
      expect(normalizeStyle({ letterSpacing: 2 })).toEqual({ letterSpacing: '2px' })
    })
  })

  describe('combined styles', () => {
    it('should handle multiple properties together', () => {
      const result = normalizeStyle({
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        margin: 8,
        width: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
      })

      expect(result).toEqual({
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        margin: '8px',
        width: '200px',
        backgroundColor: '#fff',
        borderRadius: '8px',
      })
    })

    it('should handle text style with layout', () => {
      const result = normalizeStyle({
        display: 'flex',
        fontSize: 14,
        color: '#333',
        padding: 10,
      })

      expect(result).toEqual({
        display: 'flex',
        fontSize: '14px',
        color: '#333',
        padding: '10px',
      })
    })
  })
})
