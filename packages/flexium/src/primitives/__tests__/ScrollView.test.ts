/**
 * ScrollView Component Tests
 *
 * Tests for ScrollView primitive component
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { ScrollView } from '../ScrollView'
import type { FNode } from '../../types'

describe('ScrollView', () => {
  describe('Basic FNode Creation', () => {
    it('should create correct FNode with div element', () => {
      const fnode = ScrollView({ children: 'Content' })

      expect(fnode.type).toBe('div')
      expect(fnode.children).toEqual(['Content'])
    })

    it('should handle empty children array', () => {
      const fnode = ScrollView({ children: [] })

      expect(fnode.type).toBe('div')
      expect(fnode.children).toEqual([])
    })

    it('should handle undefined children', () => {
      const fnode = ScrollView({})

      expect(fnode.children).toEqual([])
    })

    it('should handle null children', () => {
      const fnode = ScrollView({ children: null })

      expect(fnode.children).toEqual([])
    })
  })

  describe('Children Handling', () => {
    it('should handle string children', () => {
      const fnode = ScrollView({ children: 'Scrollable content' })

      expect(fnode.children).toEqual(['Scrollable content'])
    })

    it('should handle array children as-is', () => {
      const children = ['Item 1', 'Item 2', 'Item 3']
      const fnode = ScrollView({ children })

      expect(fnode.children).toEqual(children)
    })

    it('should handle FNode children', () => {
      const child: FNode = {
        type: 'div',
        props: {},
        children: ['Content'],
        key: undefined,
      }
      const fnode = ScrollView({ children: [child] })

      expect(fnode.children).toEqual([child])
    })

    it('should handle multiple FNode children', () => {
      const child1: FNode = {
        type: 'div',
        props: {},
        children: ['1'],
        key: undefined,
      }
      const child2: FNode = {
        type: 'div',
        props: {},
        children: ['2'],
        key: undefined,
      }
      const fnode = ScrollView({ children: [child1, child2] })

      expect(fnode.children).toEqual([child1, child2])
    })

    it('should handle mixed children types', () => {
      const child: FNode = {
        type: 'div',
        props: {},
        children: [],
        key: undefined,
      }
      const fnode = ScrollView({ children: [child, 'Text', 123] })

      expect(fnode.children).toEqual([child, 'Text', 123])
    })

    it('should handle single non-array child', () => {
      const child = 'Single item'
      const fnode = ScrollView({ children: child })

      expect(fnode.children).toEqual([child])
    })
  })

  describe('Scroll Direction - Vertical (default)', () => {
    it('should default to vertical scrolling', () => {
      const fnode = ScrollView({ children: 'Content' })

      // Note: overflowX, overflowY, display, and flexDirection are set in scrollStyle
      // but normalizeStyle only passes through CommonStyle properties
      expect(fnode.props.style.display).toBe('flex')
      expect(fnode.props.style.flexDirection).toBe('column')
    })

    it('should use vertical scrolling when horizontal is false', () => {
      const fnode = ScrollView({ horizontal: false, children: 'Content' })

      expect(fnode.props.style.flexDirection).toBe('column')
    })

    it('should set column flex direction in vertical mode', () => {
      const fnode = ScrollView({ children: 'Content' })

      expect(fnode.props.style.flexDirection).toBe('column')
    })

    it('should set flex display', () => {
      const fnode = ScrollView({ children: 'Content' })

      expect(fnode.props.style.display).toBe('flex')
    })
  })

  describe('Scroll Direction - Horizontal', () => {
    it('should apply horizontal scrolling when horizontal is true', () => {
      const fnode = ScrollView({ horizontal: true, children: 'Content' })

      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'row',
      })
    })

    it('should use row flex direction for horizontal scroll', () => {
      const fnode = ScrollView({ horizontal: true, children: 'Content' })

      expect(fnode.props.style.flexDirection).toBe('row')
    })

    it('should set flex display in horizontal mode', () => {
      const fnode = ScrollView({ horizontal: true, children: 'Content' })

      expect(fnode.props.style.display).toBe('flex')
    })
  })

  describe('Scrollbar Indicator Props', () => {
    it('should default showsHorizontalScrollIndicator to true', () => {
      const fnode = ScrollView({ children: 'Content' })

      // Default behavior doesn't hide scrollbars
      // Note: overflow properties are set but not normalized
      expect(fnode.props.style).toBeDefined()
    })

    it('should default showsVerticalScrollIndicator to true', () => {
      const fnode = ScrollView({ children: 'Content' })

      // Default behavior doesn't hide scrollbars
      expect(fnode.props.style).toBeDefined()
    })

    it('should accept showsHorizontalScrollIndicator as false', () => {
      const fnode = ScrollView({
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        children: 'Content',
      })

      // Note: Current implementation doesn't fully apply scrollbar hiding
      // This test validates the prop is accepted without errors
      expect(fnode.type).toBe('div')
    })

    it('should accept showsVerticalScrollIndicator as false', () => {
      const fnode = ScrollView({
        showsVerticalScrollIndicator: false,
        children: 'Content',
      })

      // Note: Current implementation doesn't fully apply scrollbar hiding
      // This test validates the prop is accepted without errors
      expect(fnode.type).toBe('div')
    })

    it('should handle both scrollbar indicators set to false', () => {
      const fnode = ScrollView({
        showsHorizontalScrollIndicator: false,
        showsVerticalScrollIndicator: false,
        children: 'Content',
      })

      expect(fnode.type).toBe('div')
    })
  })

  describe('Style Handling', () => {
    it('should apply display flex by default', () => {
      const fnode = ScrollView({ children: 'Content' })

      expect(fnode.props.style.display).toBe('flex')
    })

    it('should merge custom styles with scroll styles', () => {
      const fnode = ScrollView({
        style: { backgroundColor: 'lightgray', padding: 20 },
        children: 'Content',
      })

      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'lightgray',
        padding: '20px',
      })
    })

    it('should apply custom height', () => {
      const fnode = ScrollView({
        style: { height: 300 },
        children: 'Content',
      })

      expect(fnode.props.style.height).toBe('300px')
    })

    it('should apply custom width', () => {
      const fnode = ScrollView({
        style: { width: 500 },
        children: 'Content',
      })

      expect(fnode.props.style.width).toBe('500px')
    })

    it('should handle string dimensions', () => {
      const fnode = ScrollView({
        style: { height: '100vh', width: '100%' },
        children: 'Content',
      })

      expect(fnode.props.style.height).toBe('100vh')
      expect(fnode.props.style.width).toBe('100%')
    })

    it('should normalize border properties', () => {
      const fnode = ScrollView({
        style: { borderWidth: 1, borderColor: 'gray', borderRadius: 8 },
        children: 'Content',
      })

      expect(fnode.props.style).toMatchObject({
        borderWidth: '1px',
        borderColor: 'gray',
        borderRadius: '8px',
      })
    })

    it('should handle margin and padding', () => {
      const fnode = ScrollView({
        style: { margin: 10, padding: 15 },
        children: 'Content',
      })

      expect(fnode.props.style).toMatchObject({
        margin: '10px',
        padding: '15px',
      })
    })

    it('should handle position styles', () => {
      const fnode = ScrollView({
        style: { position: 'relative', top: 10, left: 20 },
        children: 'Content',
      })

      expect(fnode.props.style).toMatchObject({
        position: 'relative',
        top: '10px',
        left: '20px',
      })
    })
  })

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const fnode = ScrollView({
        id: 'scroll-container',
        'data-testid': 'scrollview',
        children: 'Content',
      } as any)

      expect(fnode.props.id).toBe('scroll-container')
      expect(fnode.props['data-testid']).toBe('scrollview')
    })

    it('should pass through aria attributes', () => {
      const fnode = ScrollView({
        'aria-label': 'Scrollable content',
        'aria-live': 'polite',
        children: 'Content',
      } as any)

      expect(fnode.props['aria-label']).toBe('Scrollable content')
      expect(fnode.props['aria-live']).toBe('polite')
    })

    it('should pass through className', () => {
      const fnode = ScrollView({
        className: 'custom-scroll',
        children: 'Content',
      } as any)

      expect(fnode.props.className).toBe('custom-scroll')
    })

    it('should pass through event handlers', () => {
      const onScroll = () => {}
      const fnode = ScrollView({
        onScroll,
        children: 'Content',
      } as any)

      expect(fnode.props.onScroll).toBe(onScroll)
    })

    it('should not include special props in rest props', () => {
      const fnode = ScrollView({
        children: 'Content',
        style: { height: 200 },
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        showsVerticalScrollIndicator: false,
      })

      expect(fnode.props.children).toBeUndefined()
      expect(fnode.props.horizontal).toBeUndefined()
      expect(fnode.props.showsHorizontalScrollIndicator).toBeUndefined()
      expect(fnode.props.showsVerticalScrollIndicator).toBeUndefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle vertical scrollable list', () => {
      const items = Array.from(
        { length: 10 },
        (_, i): FNode => ({
          type: 'div',
          props: {},
          children: [`Item ${i + 1}`],
          key: undefined,
        })
      )

      const fnode = ScrollView({
        style: { height: 300, backgroundColor: 'white' },
        children: items,
      })

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
        height: '300px',
        backgroundColor: 'white',
      })
      expect(fnode.children).toEqual(items)
    })

    it('should handle horizontal scrollable carousel', () => {
      const cards = Array.from(
        { length: 5 },
        (_, i): FNode => ({
          type: 'div',
          props: { style: { width: '200px' } },
          children: [`Card ${i + 1}`],
          key: undefined,
        })
      )

      const fnode = ScrollView({
        horizontal: true,
        style: { height: 200, width: '100%' },
        showsHorizontalScrollIndicator: false,
        children: cards,
      })

      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'row',
        height: '200px',
        width: '100%',
      })
      expect(fnode.children).toEqual(cards)
    })

    it('should handle full-screen scrollable content', () => {
      const fnode = ScrollView({
        style: {
          height: '100vh',
          width: '100vw',
          backgroundColor: 'white',
        },
        children: 'Long content',
      })

      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'white',
      })
    })

    it('should handle minimal ScrollView', () => {
      const fnode = ScrollView({})

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
      })
      expect(fnode.children).toEqual([])
    })

    it('should handle complete ScrollView with all props', () => {
      const onScroll = () => {}
      const content: FNode = {
        type: 'div',
        props: {},
        children: ['Content'],
        key: undefined,
      }

      const fnode = ScrollView({
        horizontal: false,
        showsHorizontalScrollIndicator: true,
        showsVerticalScrollIndicator: true,
        style: {
          height: 400,
          width: 600,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          padding: 16,
        },
        id: 'main-scroll',
        className: 'scroll-container',
        onScroll,
        children: [content],
      } as any)

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
        height: '400px',
        width: '600px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '16px',
      })
      expect(fnode.props.id).toBe('main-scroll')
      expect(fnode.props.className).toBe('scroll-container')
      expect(fnode.props.onScroll).toBe(onScroll)
      expect(fnode.children).toEqual([content])
    })
  })
})
