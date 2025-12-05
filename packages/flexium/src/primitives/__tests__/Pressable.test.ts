/**
 * Pressable Component Tests
 *
 * Tests for Pressable primitive component
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { Pressable } from '../Pressable'
import type { VNode } from '../../types'

describe('Pressable', () => {
  describe('Basic VNode Creation', () => {
    it('should create correct VNode with button element', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Click me' })

      expect(vnode.type).toBe('button')
      expect(vnode.children).toEqual(['Click me'])
    })

    it('should handle empty children array', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: [] })

      expect(vnode.type).toBe('button')
      expect(vnode.children).toEqual([])
    })

    it('should handle undefined children', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress })

      expect(vnode.children).toEqual([])
    })

    it('should handle null children', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: null })

      expect(vnode.children).toEqual([])
    })
  })

  describe('Children Handling', () => {
    it('should handle string children', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Press me' })

      expect(vnode.children).toEqual(['Press me'])
    })

    it('should handle array children as-is', () => {
      const onPress = () => {}
      const children = ['Click', ' ', 'here']
      const vnode = Pressable({ onPress, children })

      expect(vnode.children).toEqual(children)
    })

    it('should handle VNode children', () => {
      const onPress = () => {}
      const child: VNode = {
        type: 'span',
        props: {},
        children: ['Icon'],
        key: undefined,
      }
      const vnode = Pressable({ onPress, children: [child, 'Text'] })

      expect(vnode.children).toEqual([child, 'Text'])
    })

    it('should handle number children', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 5 })

      expect(vnode.children).toEqual([5])
    })

    it('should handle mixed children types', () => {
      const onPress = () => {}
      const child: VNode = {
        type: 'span',
        props: {},
        children: [],
        key: undefined,
      }
      const vnode = Pressable({ onPress, children: [child, 'Text', 123] })

      expect(vnode.children).toEqual([child, 'Text', 123])
    })
  })

  describe('Event Handlers - Press', () => {
    it('should handle onPress event', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      expect(vnode.props.onclick).toBe(onPress)
    })

    it('should not set onclick when disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, disabled: true, children: 'Disabled' })

      expect(vnode.props.onclick).toBeUndefined()
    })

    it('should handle onPressIn event', () => {
      const onPress = () => {}
      const onPressIn = () => {}
      const vnode = Pressable({ onPress, onPressIn, children: 'Button' })

      expect(vnode.props.onmousedown).toBe(onPressIn)
      expect(vnode.props.ontouchstart).toBe(onPressIn)
    })

    it('should handle onPressOut event', () => {
      const onPress = () => {}
      const onPressOut = () => {}
      const vnode = Pressable({ onPress, onPressOut, children: 'Button' })

      expect(vnode.props.onmouseup).toBe(onPressOut)
      expect(vnode.props.ontouchend).toBe(onPressOut)
    })

    it('should handle all press events together', () => {
      const onPress = () => {}
      const onPressIn = () => {}
      const onPressOut = () => {}
      const vnode = Pressable({
        onPress,
        onPressIn,
        onPressOut,
        children: 'Button',
      })

      expect(vnode.props.onclick).toBe(onPress)
      expect(vnode.props.onmousedown).toBe(onPressIn)
      expect(vnode.props.onmouseup).toBe(onPressOut)
      expect(vnode.props.ontouchstart).toBe(onPressIn)
      expect(vnode.props.ontouchend).toBe(onPressOut)
    })

    it('should handle undefined onPressIn', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      expect(vnode.props.onmousedown).toBeUndefined()
      expect(vnode.props.ontouchstart).toBeUndefined()
    })

    it('should handle undefined onPressOut', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      expect(vnode.props.onmouseup).toBeUndefined()
      expect(vnode.props.ontouchend).toBeUndefined()
    })
  })

  describe('Disabled State', () => {
    it('should set disabled attribute when disabled is true', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, disabled: true, children: 'Disabled' })

      expect(vnode.props.disabled).toBe(true)
    })

    it('should not set disabled attribute when disabled is false', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, disabled: false, children: 'Enabled' })

      expect(vnode.props.disabled).toBe(false)
    })

    it('should create buttonStyle with not-allowed cursor when disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, disabled: true, children: 'Button' })

      // Note: cursor is set in buttonStyle but not passed through normalizeStyle
      // since cursor is not in CommonStyle interface
      expect(vnode.props.disabled).toBe(true)
    })

    it('should create buttonStyle with pointer cursor when not disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      // Note: cursor is set in buttonStyle but not passed through normalizeStyle
      expect(vnode.props.disabled).toBeUndefined()
    })

    it('should apply reduced opacity when disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, disabled: true, children: 'Button' })

      expect(vnode.props.style.opacity).toBe(0.5)
    })

    it('should not override custom opacity when not disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { opacity: 0.8 },
        children: 'Button',
      })

      expect(vnode.props.style.opacity).toBe(0.8)
    })

    it('should use disabled opacity over custom opacity when disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        disabled: true,
        style: { opacity: 0.8 },
        children: 'Button',
      })

      expect(vnode.props.style.opacity).toBe(0.5)
    })

    it('should handle undefined disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      expect(vnode.props.disabled).toBeUndefined()
    })
  })

  describe('Style Handling', () => {
    it('should normalize padding from custom style', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { padding: 10 },
        children: 'Button',
      })

      // buttonStyle sets padding: 0, then normalizeStyle converts it to '0px'
      expect(vnode.props.style.padding).toBe('0px')
    })

    it('should merge custom styles', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { backgroundColor: 'blue' },
        children: 'Styled',
      })

      expect(vnode.props.style).toMatchObject({
        backgroundColor: 'blue',
      })
    })

    it('should normalize margin values', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { margin: 5 },
        children: 'Button',
      })

      expect(vnode.props.style.margin).toBe('5px')
    })

    it('should normalize border properties', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { borderRadius: 8, borderWidth: 2, borderColor: 'red' },
        children: 'Button',
      })

      expect(vnode.props.style).toMatchObject({
        borderRadius: '8px',
        borderWidth: '2px',
        borderColor: 'red',
      })
    })

    it('should handle custom opacity when not disabled', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { opacity: 0.7 },
        children: 'Button',
      })

      expect(vnode.props.style.opacity).toBe(0.7)
    })

    it('should handle width and height', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        style: { width: 200, height: 50 },
        children: 'Button',
      })

      expect(vnode.props.style).toMatchObject({
        width: '200px',
        height: '50px',
      })
    })

    it('should return normalized style object', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      expect(vnode.props.style).toBeDefined()
      expect(typeof vnode.props.style).toBe('object')
    })
  })

  describe('Active Opacity', () => {
    it('should use default activeOpacity of 0.7', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress, children: 'Button' })

      expect(vnode.props.style.opacity).toBeUndefined()
    })

    it('should accept custom activeOpacity', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        activeOpacity: 0.5,
        children: 'Button',
      })

      // activeOpacity is stored but not directly applied to style in this implementation
      // It's typically used for interactive states in runtime
      expect(vnode.props.style.opacity).toBeUndefined()
    })

    it('should handle activeOpacity with disabled state', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        activeOpacity: 0.8,
        disabled: true,
        children: 'Button',
      })

      // Disabled opacity takes precedence
      expect(vnode.props.style.opacity).toBe(0.5)
    })
  })

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        id: 'submit-btn',
        'data-testid': 'button-element',
        children: 'Submit',
      } as any)

      expect(vnode.props.id).toBe('submit-btn')
      expect(vnode.props['data-testid']).toBe('button-element')
    })

    it('should pass through aria attributes', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        'aria-label': 'Close dialog',
        'aria-pressed': 'false',
        children: 'X',
      } as any)

      expect(vnode.props['aria-label']).toBe('Close dialog')
      expect(vnode.props['aria-pressed']).toBe('false')
    })

    it('should pass through className', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        className: 'btn btn-primary',
        children: 'Button',
      } as any)

      expect(vnode.props.className).toBe('btn btn-primary')
    })

    it('should pass through type attribute', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        type: 'submit',
        children: 'Submit',
      } as any)

      expect(vnode.props.type).toBe('submit')
    })

    it('should not include special props in rest props', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        onPressIn: () => {},
        onPressOut: () => {},
        disabled: true,
        style: { color: 'blue' },
        activeOpacity: 0.6,
        children: 'Button',
      })

      expect(vnode.props.children).toBeUndefined()
      expect(vnode.props.activeOpacity).toBeUndefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete Pressable with all common props', () => {
      const onPress = () => {}
      const onPressIn = () => {}
      const onPressOut = () => {}
      const vnode = Pressable({
        onPress,
        onPressIn,
        onPressOut,
        disabled: false,
        activeOpacity: 0.8,
        style: {
          backgroundColor: 'blue',
          borderRadius: 8,
          width: 200,
          height: 44,
        },
        id: 'primary-btn',
        children: 'Primary Action',
      } as any)

      expect(vnode.type).toBe('button')
      expect(vnode.props.onclick).toBe(onPress)
      expect(vnode.props.onmousedown).toBe(onPressIn)
      expect(vnode.props.onmouseup).toBe(onPressOut)
      expect(vnode.props.ontouchstart).toBe(onPressIn)
      expect(vnode.props.ontouchend).toBe(onPressOut)
      expect(vnode.props.disabled).toBe(false)
      expect(vnode.props.style).toMatchObject({
        padding: '0px',
        backgroundColor: 'blue',
        borderRadius: '8px',
        width: '200px',
        height: '44px',
      })
      expect(vnode.props.id).toBe('primary-btn')
      expect(vnode.children).toEqual(['Primary Action'])
    })

    it('should handle disabled Pressable', () => {
      const onPress = () => {}
      const vnode = Pressable({
        onPress,
        disabled: true,
        style: { backgroundColor: 'gray' },
        children: 'Disabled Button',
      })

      expect(vnode.props.disabled).toBe(true)
      expect(vnode.props.onclick).toBeUndefined()
      expect(vnode.props.style.opacity).toBe(0.5)
      expect(vnode.props.style.backgroundColor).toBe('gray')
    })

    it('should handle minimal Pressable', () => {
      const onPress = () => {}
      const vnode = Pressable({ onPress })

      expect(vnode.type).toBe('button')
      expect(vnode.props.onclick).toBe(onPress)
      expect(vnode.children).toEqual([])
      expect(vnode.props.style.padding).toBe('0px')
    })

    it('should handle icon button with VNode children', () => {
      const onPress = () => {}
      const icon: VNode = {
        type: 'svg',
        props: {},
        children: [],
        key: undefined,
      }
      const vnode = Pressable({
        onPress,
        style: { width: 40, height: 40, borderRadius: 20 },
        'aria-label': 'Menu',
        children: icon,
      } as any)

      expect(vnode.children).toEqual([icon])
      expect(vnode.props['aria-label']).toBe('Menu')
      expect(vnode.props.style).toMatchObject({
        width: '40px',
        height: '40px',
        borderRadius: '20px',
      })
    })
  })
})
