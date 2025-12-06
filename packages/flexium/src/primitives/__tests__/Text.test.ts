/**
 * Text Component Tests
 *
 * Tests for Text primitive component
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { Text } from '../Text'
import type { FNode } from '../../types'

describe('Text', () => {
  describe('Basic FNode Creation', () => {
    it('should create correct FNode with span element', () => {
      const fnode = Text({ children: 'Hello' })

      expect(fnode.type).toBe('span')
      expect(fnode.children).toEqual(['Hello'])
    })

    it('should create FNode with empty children array when no children provided', () => {
      const fnode = Text({})

      expect(fnode.type).toBe('span')
      expect(fnode.children).toEqual([])
    })

    it('should handle undefined children', () => {
      const fnode = Text({ children: undefined })

      expect(fnode.children).toEqual([])
    })

    it('should handle null children', () => {
      const fnode = Text({ children: null })

      expect(fnode.children).toEqual([])
    })
  })

  describe('Children Handling', () => {
    it('should handle string children', () => {
      const fnode = Text({ children: 'Hello World' })

      expect(fnode.children).toEqual(['Hello World'])
    })

    it('should handle number children', () => {
      const fnode = Text({ children: 42 })

      expect(fnode.children).toEqual([42])
    })

    it('should handle boolean children', () => {
      const fnode = Text({ children: true })

      expect(fnode.children).toEqual([true])
    })

    it('should handle array children as-is', () => {
      const children = ['Hello', ' ', 'World']
      const fnode = Text({ children })

      expect(fnode.children).toEqual(children)
    })

    it('should handle mixed array children', () => {
      const children = ['Text', 123, true]
      const fnode = Text({ children })

      expect(fnode.children).toEqual(children)
    })

    it('should handle FNode children', () => {
      const child: FNode = {
        type: 'span',
        props: {},
        children: ['nested'],
        key: undefined,
      }
      const fnode = Text({ children: [child] })

      expect(fnode.children).toEqual([child])
    })

    it('should handle empty string children as empty array', () => {
      const fnode = Text({ children: '' })

      // Empty string is falsy, so it returns empty array
      expect(fnode.children).toEqual([])
    })

    it('should handle zero as children as empty array', () => {
      const fnode = Text({ children: 0 })

      // Zero is falsy, so it returns empty array
      expect(fnode.children).toEqual([])
    })
  })

  describe('Style Normalization', () => {
    it('should normalize text color', () => {
      const fnode = Text({ style: { color: 'blue' }, children: 'Colored' })

      expect(fnode.props.style).toMatchObject({
        color: 'blue',
      })
    })

    it('should normalize fontSize to pixels', () => {
      const fnode = Text({ style: { fontSize: 16 }, children: 'Text' })

      expect(fnode.props.style.fontSize).toBe('16px')
    })

    it('should normalize fontWeight', () => {
      const fnode = Text({ style: { fontWeight: 'bold' }, children: 'Bold' })

      expect(fnode.props.style.fontWeight).toBe('bold')
    })

    it('should normalize fontFamily', () => {
      const fnode = Text({
        style: { fontFamily: 'Arial, sans-serif' },
        children: 'Text',
      })

      expect(fnode.props.style.fontFamily).toBe('Arial, sans-serif')
    })

    it('should normalize textAlign', () => {
      const fnode = Text({
        style: { textAlign: 'center' },
        children: 'Centered',
      })

      expect(fnode.props.style.textAlign).toBe('center')
    })

    it('should normalize textDecoration', () => {
      const fnode = Text({
        style: { textDecoration: 'underline' },
        children: 'Underlined',
      })

      expect(fnode.props.style.textDecoration).toBe('underline')
    })

    it('should normalize lineHeight to pixels', () => {
      const fnode = Text({ style: { lineHeight: 24 }, children: 'Text' })

      expect(fnode.props.style.lineHeight).toBe('24px')
    })

    it('should normalize letterSpacing to pixels', () => {
      const fnode = Text({ style: { letterSpacing: 2 }, children: 'Spaced' })

      expect(fnode.props.style.letterSpacing).toBe('2px')
    })

    it('should normalize fontStyle', () => {
      const fnode = Text({ style: { fontStyle: 'italic' }, children: 'Italic' })

      expect(fnode.props.style.fontStyle).toBe('italic')
    })

    it('should handle multiple style properties', () => {
      const fnode = Text({
        style: {
          color: 'red',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'right',
        },
        children: 'Styled',
      })

      expect(fnode.props.style).toMatchObject({
        color: 'red',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'right',
      })
    })

    it('should handle common style properties', () => {
      const fnode = Text({
        style: {
          padding: 10,
          margin: 5,
          backgroundColor: 'yellow',
        },
        children: 'Boxed',
      })

      expect(fnode.props.style).toMatchObject({
        padding: '10px',
        margin: '5px',
        backgroundColor: 'yellow',
      })
    })

    it('should handle opacity', () => {
      const fnode = Text({ style: { opacity: 0.5 }, children: 'Transparent' })

      expect(fnode.props.style.opacity).toBe(0.5)
    })

    it('should return empty object when style is undefined', () => {
      const fnode = Text({ children: 'Plain' })

      expect(fnode.props.style).toEqual({})
    })
  })

  describe('Event Handlers', () => {
    it('should handle onPress event', () => {
      const onPress = () => {}
      const fnode = Text({ onPress, children: 'Pressable' })

      expect(fnode.props.onclick).toBe(onPress)
    })

    it('should handle undefined onPress', () => {
      const fnode = Text({ children: 'Text' })

      expect(fnode.props.onclick).toBeUndefined()
    })
  })

  describe('Class Name Handling', () => {
    it('should apply class prop', () => {
      const fnode = Text({ class: 'text-primary', children: 'Classed' })

      expect(fnode.props.class).toBe('text-primary')
    })

    it('should handle undefined class', () => {
      const fnode = Text({ children: 'Text' })

      expect(fnode.props.class).toBeUndefined()
    })
  })

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const fnode = Text({
        id: 'my-text',
        'data-testid': 'text-element',
        children: 'Text',
      } as any)

      expect(fnode.props.id).toBe('my-text')
      expect(fnode.props['data-testid']).toBe('text-element')
    })

    it('should pass through aria attributes', () => {
      const fnode = Text({
        'aria-label': 'Text label',
        'aria-describedby': 'desc-id',
        children: 'Accessible',
      } as any)

      expect(fnode.props['aria-label']).toBe('Text label')
      expect(fnode.props['aria-describedby']).toBe('desc-id')
    })

    it('should not include special props in rest props', () => {
      const fnode = Text({
        children: 'Text',
        style: { color: 'blue' },
        onPress: () => {},
        class: 'test',
      })

      expect(fnode.props.children).toBeUndefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete Text with all props', () => {
      const onPress = () => {}
      const fnode = Text({
        children: 'Complete Text',
        style: {
          color: 'blue',
          fontSize: 16,
          fontWeight: 'bold',
          padding: 10,
        },
        onPress,
        class: 'text-class',
        id: 'text-1',
      } as any)

      expect(fnode.type).toBe('span')
      expect(fnode.children).toEqual(['Complete Text'])
      expect(fnode.props.style).toMatchObject({
        color: 'blue',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '10px',
      })
      expect(fnode.props.onclick).toBe(onPress)
      expect(fnode.props.class).toBe('text-class')
      expect(fnode.props.id).toBe('text-1')
    })

    it('should handle minimal Text props', () => {
      const fnode = Text({})

      expect(fnode.type).toBe('span')
      expect(fnode.children).toEqual([])
      expect(fnode.props.style).toEqual({})
      expect(fnode.props.onclick).toBeUndefined()
      expect(fnode.props.class).toBeUndefined()
    })
  })
})
