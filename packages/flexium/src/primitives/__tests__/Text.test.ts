/**
 * Text Component Tests
 *
 * Tests for Text primitive component
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { Text } from '../Text'
import type { VNode } from '../../types'

describe('Text', () => {
  describe('Basic VNode Creation', () => {
    it('should create correct VNode with span element', () => {
      const vnode = Text({ children: 'Hello' })

      expect(vnode.type).toBe('span')
      expect(vnode.children).toEqual(['Hello'])
    })

    it('should create VNode with empty children array when no children provided', () => {
      const vnode = Text({})

      expect(vnode.type).toBe('span')
      expect(vnode.children).toEqual([])
    })

    it('should handle undefined children', () => {
      const vnode = Text({ children: undefined })

      expect(vnode.children).toEqual([])
    })

    it('should handle null children', () => {
      const vnode = Text({ children: null })

      expect(vnode.children).toEqual([])
    })
  })

  describe('Children Handling', () => {
    it('should handle string children', () => {
      const vnode = Text({ children: 'Hello World' })

      expect(vnode.children).toEqual(['Hello World'])
    })

    it('should handle number children', () => {
      const vnode = Text({ children: 42 })

      expect(vnode.children).toEqual([42])
    })

    it('should handle boolean children', () => {
      const vnode = Text({ children: true })

      expect(vnode.children).toEqual([true])
    })

    it('should handle array children as-is', () => {
      const children = ['Hello', ' ', 'World']
      const vnode = Text({ children })

      expect(vnode.children).toEqual(children)
    })

    it('should handle mixed array children', () => {
      const children = ['Text', 123, true]
      const vnode = Text({ children })

      expect(vnode.children).toEqual(children)
    })

    it('should handle VNode children', () => {
      const child: VNode = {
        type: 'span',
        props: {},
        children: ['nested'],
        key: undefined,
      }
      const vnode = Text({ children: [child] })

      expect(vnode.children).toEqual([child])
    })

    it('should handle empty string children as empty array', () => {
      const vnode = Text({ children: '' })

      // Empty string is falsy, so it returns empty array
      expect(vnode.children).toEqual([])
    })

    it('should handle zero as children as empty array', () => {
      const vnode = Text({ children: 0 })

      // Zero is falsy, so it returns empty array
      expect(vnode.children).toEqual([])
    })
  })

  describe('Style Normalization', () => {
    it('should normalize text color', () => {
      const vnode = Text({ style: { color: 'blue' }, children: 'Colored' })

      expect(vnode.props.style).toMatchObject({
        color: 'blue',
      })
    })

    it('should normalize fontSize to pixels', () => {
      const vnode = Text({ style: { fontSize: 16 }, children: 'Text' })

      expect(vnode.props.style.fontSize).toBe('16px')
    })

    it('should normalize fontWeight', () => {
      const vnode = Text({ style: { fontWeight: 'bold' }, children: 'Bold' })

      expect(vnode.props.style.fontWeight).toBe('bold')
    })

    it('should normalize fontFamily', () => {
      const vnode = Text({
        style: { fontFamily: 'Arial, sans-serif' },
        children: 'Text',
      })

      expect(vnode.props.style.fontFamily).toBe('Arial, sans-serif')
    })

    it('should normalize textAlign', () => {
      const vnode = Text({
        style: { textAlign: 'center' },
        children: 'Centered',
      })

      expect(vnode.props.style.textAlign).toBe('center')
    })

    it('should normalize textDecoration', () => {
      const vnode = Text({
        style: { textDecoration: 'underline' },
        children: 'Underlined',
      })

      expect(vnode.props.style.textDecoration).toBe('underline')
    })

    it('should normalize lineHeight to pixels', () => {
      const vnode = Text({ style: { lineHeight: 24 }, children: 'Text' })

      expect(vnode.props.style.lineHeight).toBe('24px')
    })

    it('should normalize letterSpacing to pixels', () => {
      const vnode = Text({ style: { letterSpacing: 2 }, children: 'Spaced' })

      expect(vnode.props.style.letterSpacing).toBe('2px')
    })

    it('should normalize fontStyle', () => {
      const vnode = Text({ style: { fontStyle: 'italic' }, children: 'Italic' })

      expect(vnode.props.style.fontStyle).toBe('italic')
    })

    it('should handle multiple style properties', () => {
      const vnode = Text({
        style: {
          color: 'red',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'right',
        },
        children: 'Styled',
      })

      expect(vnode.props.style).toMatchObject({
        color: 'red',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'right',
      })
    })

    it('should handle common style properties', () => {
      const vnode = Text({
        style: {
          padding: 10,
          margin: 5,
          backgroundColor: 'yellow',
        },
        children: 'Boxed',
      })

      expect(vnode.props.style).toMatchObject({
        padding: '10px',
        margin: '5px',
        backgroundColor: 'yellow',
      })
    })

    it('should handle opacity', () => {
      const vnode = Text({ style: { opacity: 0.5 }, children: 'Transparent' })

      expect(vnode.props.style.opacity).toBe(0.5)
    })

    it('should return empty object when style is undefined', () => {
      const vnode = Text({ children: 'Plain' })

      expect(vnode.props.style).toEqual({})
    })
  })

  describe('Event Handlers', () => {
    it('should handle onClick event', () => {
      const onClick = () => {}
      const vnode = Text({ onClick, children: 'Clickable' })

      expect(vnode.props.onclick).toBe(onClick)
    })

    it('should handle onPress event', () => {
      const onPress = () => {}
      const vnode = Text({ onPress, children: 'Pressable' })

      expect(vnode.props.onclick).toBe(onPress)
    })

    it('should prioritize onClick over onPress', () => {
      const onClick = () => {}
      const onPress = () => {}
      const vnode = Text({ onClick, onPress, children: 'Click' })

      expect(vnode.props.onclick).toBe(onClick)
    })

    it('should handle undefined onClick', () => {
      const vnode = Text({ children: 'Text' })

      expect(vnode.props.onclick).toBeUndefined()
    })
  })

  describe('Class Name Handling', () => {
    it('should apply class prop', () => {
      const vnode = Text({ class: 'text-primary', children: 'Classed' })

      expect(vnode.props.class).toBe('text-primary')
    })

    it('should apply className prop', () => {
      const vnode = Text({ className: 'text-secondary', children: 'Classed' })

      expect(vnode.props.class).toBe('text-secondary')
    })

    it('should prioritize class over className', () => {
      const vnode = Text({
        class: 'class-prop',
        className: 'className-prop',
        children: 'Text',
      })

      expect(vnode.props.class).toBe('class-prop')
    })

    it('should handle undefined class', () => {
      const vnode = Text({ children: 'Text' })

      expect(vnode.props.class).toBeUndefined()
    })
  })

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const vnode = Text({
        id: 'my-text',
        'data-testid': 'text-element',
        children: 'Text',
      } as any)

      expect(vnode.props.id).toBe('my-text')
      expect(vnode.props['data-testid']).toBe('text-element')
    })

    it('should pass through aria attributes', () => {
      const vnode = Text({
        'aria-label': 'Text label',
        'aria-describedby': 'desc-id',
        children: 'Accessible',
      } as any)

      expect(vnode.props['aria-label']).toBe('Text label')
      expect(vnode.props['aria-describedby']).toBe('desc-id')
    })

    it('should not include special props in rest props', () => {
      const vnode = Text({
        children: 'Text',
        style: { color: 'blue' },
        onClick: () => {},
        class: 'test',
      })

      expect(vnode.props.children).toBeUndefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete Text with all props', () => {
      const onClick = () => {}
      const vnode = Text({
        children: 'Complete Text',
        style: {
          color: 'blue',
          fontSize: 16,
          fontWeight: 'bold',
          padding: 10,
        },
        onClick,
        class: 'text-class',
        id: 'text-1',
      } as any)

      expect(vnode.type).toBe('span')
      expect(vnode.children).toEqual(['Complete Text'])
      expect(vnode.props.style).toMatchObject({
        color: 'blue',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '10px',
      })
      expect(vnode.props.onclick).toBe(onClick)
      expect(vnode.props.class).toBe('text-class')
      expect(vnode.props.id).toBe('text-1')
    })

    it('should handle minimal Text props', () => {
      const vnode = Text({})

      expect(vnode.type).toBe('span')
      expect(vnode.children).toEqual([])
      expect(vnode.props.style).toEqual({})
      expect(vnode.props.onclick).toBeUndefined()
      expect(vnode.props.class).toBeUndefined()
    })
  })
})
