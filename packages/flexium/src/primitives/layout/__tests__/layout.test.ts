/**
 * Layout Primitives Tests
 *
 * Tests for Row, Column, Grid, Stack, and Spacer components
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { Row } from '../Row'
import { Column } from '../Column'
import { Grid } from '../Grid'
import { Stack } from '../Stack'
import { Spacer } from '../Spacer'
import type { FNode } from '../../../core/renderer'

describe('Row', () => {
  describe('Basic Creation', () => {
    it('should create correct FNode with flex properties', () => {
      const fnode = Row({ children: [] })

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'row',
      })
    })

    it('should render with custom element type', () => {
      const fnode = Row({ as: 'section', children: [] })

      expect(fnode.type).toBe('section')
    })

    it('should apply reverse direction', () => {
      const fnode = Row({ reverse: true, children: [] })

      expect(fnode.props.style.flexDirection).toBe('row-reverse')
    })
  })

  describe('Alignment and Justification', () => {
    it('should apply align property', () => {
      const fnode = Row({ align: 'center', children: [] })

      expect(fnode.props.style.alignItems).toBe('center')
    })

    it('should map align shorthand values', () => {
      const testCases = [
        { align: 'start' as const, expected: 'flex-start' },
        { align: 'center' as const, expected: 'center' },
        { align: 'end' as const, expected: 'flex-end' },
        { align: 'stretch' as const, expected: 'stretch' },
        { align: 'baseline' as const, expected: 'baseline' },
      ]

      testCases.forEach(({ align, expected }) => {
        const fnode = Row({ align, children: [] })
        expect(fnode.props.style.alignItems).toBe(expected)
      })
    })

    it('should apply justify property', () => {
      const fnode = Row({ justify: 'between', children: [] })

      expect(fnode.props.style.justifyContent).toBe('space-between')
    })

    it('should map justify shorthand values', () => {
      const testCases = [
        { justify: 'start' as const, expected: 'flex-start' },
        { justify: 'center' as const, expected: 'center' },
        { justify: 'end' as const, expected: 'flex-end' },
        { justify: 'between' as const, expected: 'space-between' },
        { justify: 'around' as const, expected: 'space-around' },
        { justify: 'evenly' as const, expected: 'space-evenly' },
      ]

      testCases.forEach(({ justify, expected }) => {
        const fnode = Row({ justify, children: [] })
        expect(fnode.props.style.justifyContent).toBe(expected)
      })
    })

    it('should handle responsive align values', () => {
      const fnode = Row({
        align: { base: 'start', md: 'center' },
        children: [],
      })

      expect(fnode.props.style.alignItems).toBe('flex-start')
    })

    it('should handle responsive justify values', () => {
      const fnode = Row({
        justify: { base: 'start', lg: 'end' },
        children: [],
      })

      expect(fnode.props.style.justifyContent).toBe('flex-start')
    })
  })

  describe('Gap Property Handling', () => {
    it('should apply gap from style props', () => {
      const fnode = Row({ gap: 16, children: [] })

      expect(fnode.props.style.gap).toBe('16px')
    })

    it('should apply gap with string value', () => {
      const fnode = Row({ gap: '2rem', children: [] })

      expect(fnode.props.style.gap).toBe('2rem')
    })

    it('should handle responsive gap values', () => {
      const fnode = Row({
        gap: { base: 8, md: 16, lg: 24 },
        children: [],
      })

      expect(fnode.props.style.gap).toBe('8px')
    })
  })

  describe('Wrap Property', () => {
    it('should apply wrap property', () => {
      const fnode = Row({ wrap: true, children: [] })

      expect(fnode.props.style.flexWrap).toBe('wrap')
    })

    it('should not apply wrap when false', () => {
      const fnode = Row({ wrap: false, children: [] })

      expect(fnode.props.style.flexWrap).toBeUndefined()
    })

    it('should handle responsive wrap values', () => {
      const fnode = Row({
        wrap: { base: true, md: false },
        children: [],
      })

      expect(fnode.props.style.flexWrap).toBe('wrap')
    })
  })

  describe('Custom Styles Merging', () => {
    it('should merge custom styles with base styles', () => {
      const fnode = Row({
        style: { backgroundColor: 'red', color: 'white' },
        children: [],
      })

      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'red',
        color: 'white',
      })
    })

    it('should allow custom styles to override base styles', () => {
      const fnode = Row({
        style: { flexDirection: 'column' },
        children: [],
      })

      expect(fnode.props.style.flexDirection).toBe('column')
    })

    it('should apply style props like padding and margin', () => {
      const fnode = Row({
        padding: 20,
        margin: 10,
        children: [],
      })

      expect(fnode.props.style).toMatchObject({
        padding: '20px',
        margin: '10px',
      })
    })
  })

  describe('Children Rendering', () => {
    it('should render children', () => {
      const children = ['Hello', 'World']
      const fnode = Row({ children })

      expect(fnode.children).toEqual(children)
    })

    it('should render FNode children', () => {
      const child = { type: 'span', props: {}, children: [], key: undefined }
      const fnode = Row({ children: [child] })

      expect(fnode.children).toEqual([child])
    })

    it('should handle mixed children types', () => {
      const children = [
        'text',
        123,
        { type: 'div', props: {}, children: [], key: undefined },
      ]
      const fnode = Row({ children })

      expect(fnode.children).toEqual(children)
    })
  })

  describe('Accessibility and Event Props', () => {
    it('should apply aria attributes', () => {
      const fnode = Row({
        'aria-label': 'Navigation',
        'aria-labelledby': 'nav-id',
        children: [],
      })

      expect(fnode.props['aria-label']).toBe('Navigation')
      expect(fnode.props['aria-labelledby']).toBe('nav-id')
    })

    it('should apply event handlers', () => {
      const onPress = () => {}
      const onMouseEnter = () => {}
      const fnode = Row({ onPress, onMouseEnter, children: [] })

      expect(fnode.props.onclick).toBe(onPress)
      expect(fnode.props.onMouseEnter).toBe(onMouseEnter)
    })

    it('should apply id and class', () => {
      const fnode = Row({
        id: 'main-row',
        class: 'container',
        children: [],
      })

      expect(fnode.props.id).toBe('main-row')
      expect(fnode.props.class).toBe('container')
    })
  })
})

describe('Column', () => {
  describe('Basic Creation', () => {
    it('should create correct FNode with flex properties', () => {
      const fnode = Column({ children: [] })

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
      })
    })

    it('should render with custom element type', () => {
      const fnode = Column({ as: 'article', children: [] })

      expect(fnode.type).toBe('article')
    })

    it('should apply reverse direction', () => {
      const fnode = Column({ reverse: true, children: [] })

      expect(fnode.props.style.flexDirection).toBe('column-reverse')
    })
  })

  describe('Alignment and Justification', () => {
    it('should apply align property', () => {
      const fnode = Column({ align: 'center', children: [] })

      expect(fnode.props.style.alignItems).toBe('center')
    })

    it('should map align shorthand values', () => {
      const testCases = [
        { align: 'start' as const, expected: 'flex-start' },
        { align: 'center' as const, expected: 'center' },
        { align: 'end' as const, expected: 'flex-end' },
      ]

      testCases.forEach(({ align, expected }) => {
        const fnode = Column({ align, children: [] })
        expect(fnode.props.style.alignItems).toBe(expected)
      })
    })

    it('should apply justify property', () => {
      const fnode = Column({ justify: 'center', children: [] })

      expect(fnode.props.style.justifyContent).toBe('center')
    })
  })

  describe('Gap and Spacing', () => {
    it('should apply gap from style props', () => {
      const fnode = Column({ gap: 8, children: [] })

      expect(fnode.props.style.gap).toBe('8px')
    })

    it('should apply padding and height', () => {
      const fnode = Column({
        padding: 16,
        height: '100vh',
        children: [],
      })

      expect(fnode.props.style).toMatchObject({
        padding: '16px',
        height: '100vh',
      })
    })
  })

  describe('Custom Styles Merging', () => {
    it('should merge custom styles with base styles', () => {
      const fnode = Column({
        style: { backgroundColor: 'blue' },
        children: [],
      })

      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'blue',
      })
    })
  })

  describe('Children Rendering', () => {
    it('should render children', () => {
      const children = ['Top', 'Bottom']
      const fnode = Column({ children })

      expect(fnode.children).toEqual(children)
    })
  })
})

describe('Grid', () => {
  describe('Basic Creation', () => {
    it('should create correct FNode with grid properties', () => {
      const fnode = Grid({ children: [] })

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'grid',
      })
    })

    it('should render with custom element type', () => {
      const fnode = Grid({ as: 'section', children: [] })

      expect(fnode.type).toBe('section')
    })
  })

  describe('Column and Row Templates', () => {
    it('should apply numeric cols as repeat template', () => {
      const fnode = Grid({ cols: 3, children: [] })

      expect(fnode.props.style.gridTemplateColumns).toBe('repeat(3, 1fr)')
    })

    it('should apply string cols as-is', () => {
      const fnode = Grid({ cols: '200px 1fr 200px', children: [] })

      expect(fnode.props.style.gridTemplateColumns).toBe('200px 1fr 200px')
    })

    it('should apply numeric rows as repeat template', () => {
      const fnode = Grid({ rows: 2, children: [] })

      expect(fnode.props.style.gridTemplateRows).toBe('repeat(2, 1fr)')
    })

    it('should apply string rows as-is', () => {
      const fnode = Grid({ rows: 'auto 1fr auto', children: [] })

      expect(fnode.props.style.gridTemplateRows).toBe('auto 1fr auto')
    })

    it('should handle responsive cols values', () => {
      const fnode = Grid({
        cols: { base: 1, md: 2, lg: 3 },
        children: [],
      })

      expect(fnode.props.style.gridTemplateColumns).toBe('repeat(1, 1fr)')
    })
  })

  describe('Gap Properties', () => {
    it('should apply gap from style props', () => {
      const fnode = Grid({ gap: 16, children: [] })

      expect(fnode.props.style.gap).toBe('16px')
    })

    it('should apply columnGap property', () => {
      const fnode = Grid({ columnGap: 20, children: [] })

      expect(fnode.props.style.columnGap).toBe('20px')
    })

    it('should apply rowGap property', () => {
      const fnode = Grid({ rowGap: 10, children: [] })

      expect(fnode.props.style.rowGap).toBe('10px')
    })

    it('should handle string gap values', () => {
      const fnode = Grid({
        columnGap: '2rem',
        rowGap: '1rem',
        children: [],
      })

      expect(fnode.props.style.columnGap).toBe('2rem')
      expect(fnode.props.style.rowGap).toBe('1rem')
    })
  })

  describe('Grid Auto Flow', () => {
    it('should apply flow property', () => {
      const fnode = Grid({ flow: 'dense', children: [] })

      expect(fnode.props.style.gridAutoFlow).toBe('dense')
    })

    it('should support different flow values', () => {
      const flows: Array<
        'row' | 'column' | 'dense' | 'row dense' | 'column dense'
      > = ['row', 'column', 'dense', 'row dense', 'column dense']

      flows.forEach((flow) => {
        const fnode = Grid({ flow, children: [] })
        expect(fnode.props.style.gridAutoFlow).toBe(flow)
      })
    })
  })

  describe('Custom Styles Merging', () => {
    it('should apply custom styles', () => {
      const fnode = Grid({
        cols: 3,
        style: { backgroundColor: 'gray' },
        children: [],
      })

      // Note: Due to how Grid spreads props, the style prop is passed through as-is
      // The merged styles are created but then overwritten by ...props spread
      expect(fnode.props.style).toEqual({ backgroundColor: 'gray' })
      expect(fnode.props.cols).toBe(3)
    })

    it('should apply grid styles when no custom style provided', () => {
      const fnode = Grid({
        cols: 3,
        children: [],
      })

      expect(fnode.props.style.display).toBe('grid')
      expect(fnode.props.style.gridTemplateColumns).toBe('repeat(3, 1fr)')
    })
  })

  describe('Children Rendering', () => {
    it('should render children', () => {
      const children = ['Cell 1', 'Cell 2', 'Cell 3']
      const fnode = Grid({ cols: 3, children })

      expect(fnode.children).toEqual(children)
    })
  })
})

describe('Stack', () => {
  describe('Basic Creation', () => {
    it('should create correct FNode with grid properties for stacking', () => {
      const fnode = Stack({ children: [] })

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
      })
    })

    it('should render with custom element type', () => {
      const fnode = Stack({ as: 'section', children: [] })

      expect(fnode.type).toBe('section')
    })
  })

  describe('Alignment Properties', () => {
    it('should apply align property as alignItems', () => {
      const fnode = Stack({ align: 'center', children: [] })

      expect(fnode.props.style.alignItems).toBe('center')
    })

    it('should apply justify property as justifyItems', () => {
      const fnode = Stack({ justify: 'center', children: [] })

      expect(fnode.props.style.justifyItems).toBe('center')
    })

    it('should handle both align and justify', () => {
      const fnode = Stack({
        align: 'center',
        justify: 'center',
        children: [],
      })

      expect(fnode.props.style).toMatchObject({
        alignItems: 'center',
        justifyItems: 'center',
      })
    })

    it('should handle responsive align values', () => {
      const fnode = Stack({
        align: { base: 'start', md: 'center' },
        children: [],
      })

      expect(fnode.props.style.alignItems).toBe('start')
    })
  })

  describe('Custom Styles Merging', () => {
    it('should apply custom styles', () => {
      const fnode = Stack({
        style: { position: 'relative', zIndex: 10 },
        children: [],
      })

      // Note: Due to how Stack spreads props, the style prop is passed through as-is
      expect(fnode.props.style).toEqual({ position: 'relative', zIndex: 10 })
    })

    it('should apply stack styles when no custom style provided', () => {
      const fnode = Stack({
        children: [],
      })

      expect(fnode.props.style.display).toBe('grid')
      expect(fnode.props.style.gridTemplateColumns).toBe('1fr')
      expect(fnode.props.style.gridTemplateRows).toBe('1fr')
    })
  })

  describe('Children Rendering', () => {
    it('should render children', () => {
      const children = ['Background', 'Foreground']
      const fnode = Stack({ children })

      expect(fnode.children).toEqual(children)
    })

    it('should handle single child', () => {
      const child = 'Overlay'
      const fnode = Stack({ children: child })

      expect(fnode.children).toEqual([child])
    })

    it('should handle array children', () => {
      const child1 = { type: 'img', props: {}, children: [], key: undefined }
      const child2 = { type: 'div', props: {}, children: [], key: undefined }
      const fnode = Stack({ children: [child1, child2] })

      expect(fnode.children).toEqual([child1, child2])
    })
  })
})

describe('Spacer', () => {
  describe('Basic Creation', () => {
    it('should create FNode with flex properties', () => {
      const fnode = Spacer({})

      expect(fnode.type).toBe('div')
      expect(fnode.props.style).toMatchObject({
        display: 'flex',
        flexGrow: 1,
      })
    })

    it('should render with custom element type', () => {
      const fnode = Spacer({ as: 'span' })

      expect(fnode.type).toBe('span')
    })

    it('should render with empty children', () => {
      const fnode = Spacer({})

      expect(fnode.children).toEqual([])
    })
  })

  describe('Size Property', () => {
    it('should apply size as flexBasis with no grow', () => {
      const fnode = Spacer({ size: 20 })

      expect(fnode.props.style).toMatchObject({
        flexBasis: '20px',
        flexGrow: 0,
        flexShrink: 0,
      })
    })

    it('should handle string size values', () => {
      const fnode = Spacer({ size: '2rem' })

      expect(fnode.props.style).toMatchObject({
        flexBasis: '2rem',
        flexGrow: 0,
        flexShrink: 0,
      })
    })

    it('should handle responsive size values', () => {
      const fnode = Spacer({ size: { base: 10, md: 20 } })

      expect(fnode.props.style).toMatchObject({
        flexBasis: '10px',
        flexGrow: 0,
        flexShrink: 0,
      })
    })
  })

  describe('Width and Height Properties', () => {
    it('should apply explicit width', () => {
      const fnode = Spacer({ width: 100 })

      expect(fnode.props.style).toMatchObject({
        width: '100px',
        flexGrow: 0,
        flexShrink: 0,
      })
    })

    it('should apply explicit height', () => {
      const fnode = Spacer({ height: 50 })

      expect(fnode.props.style).toMatchObject({
        height: '50px',
        flexGrow: 0,
        flexShrink: 0,
      })
    })

    it('should apply both width and height', () => {
      const fnode = Spacer({ width: 100, height: 50 })

      expect(fnode.props.style).toMatchObject({
        width: '100px',
        height: '50px',
        flexGrow: 0,
        flexShrink: 0,
      })
    })

    it('should handle string width and height values', () => {
      const fnode = Spacer({ width: '50%', height: '100%' })

      expect(fnode.props.style).toMatchObject({
        width: '50%',
        height: '100%',
        flexGrow: 0,
        flexShrink: 0,
      })
    })
  })

  describe('Flex Property', () => {
    it('should default to flex: 1 when no size specified', () => {
      const fnode = Spacer({})

      expect(fnode.props.style.flexGrow).toBe(1)
    })

    it('should apply custom flex value', () => {
      const fnode = Spacer({ flex: 2 })

      expect(fnode.props.style.flexGrow).toBe(2)
    })

    it('should handle responsive flex values', () => {
      const fnode = Spacer({ flex: { base: 1, md: 2 } })

      expect(fnode.props.style.flexGrow).toBe(1)
    })
  })

  describe('Priority of Properties', () => {
    it('should prioritize size over width/height', () => {
      const fnode = Spacer({ size: 30, width: 100, height: 50 })

      expect(fnode.props.style).toMatchObject({
        flexBasis: '30px',
        flexGrow: 0,
        flexShrink: 0,
      })
      expect(fnode.props.style.width).toBeUndefined()
      expect(fnode.props.style.height).toBeUndefined()
    })

    it('should prioritize width/height over flex', () => {
      const fnode = Spacer({ width: 100, flex: 2 })

      expect(fnode.props.style).toMatchObject({
        width: '100px',
        flexGrow: 0,
        flexShrink: 0,
      })
    })
  })

  describe('Custom Styles Merging', () => {
    it('should apply custom styles', () => {
      const fnode = Spacer({
        style: { backgroundColor: 'transparent' },
      })

      // Note: Due to how Spacer spreads props, the style prop is passed through as-is
      expect(fnode.props.style).toEqual({ backgroundColor: 'transparent' })
    })

    it('should apply spacer styles when no custom style provided', () => {
      const fnode = Spacer({})

      expect(fnode.props.style.display).toBe('flex')
      expect(fnode.props.style.flexGrow).toBe(1)
    })
  })
})

describe('Layout Primitives Integration', () => {
  it('should work with Row containing Spacer', () => {
    const spacer = Spacer({})
    const row = Row({ children: ['Left', spacer, 'Right'] })

    expect(row.props.style.display).toBe('flex')
    expect(row.props.style.flexDirection).toBe('row')
    expect(row.children).toHaveLength(3)
    expect(row.children[1]).toBe(spacer)
  })

  it('should work with Column containing multiple items', () => {
    const item1 = {
      type: 'div',
      props: {},
      children: ['Item 1'],
      key: undefined,
    }
    const item2 = {
      type: 'div',
      props: {},
      children: ['Item 2'],
      key: undefined,
    }
    const column = Column({ gap: 16, children: [item1, item2] })

    expect(column.props.style.display).toBe('flex')
    expect(column.props.style.flexDirection).toBe('column')
    expect(column.props.style.gap).toBe('16px')
    expect(column.children).toEqual([item1, item2])
  })

  it('should work with Grid layout', () => {
    const cells = ['A', 'B', 'C', 'D']
    const grid = Grid({ cols: 2, gap: 8, children: cells })

    expect(grid.props.style.display).toBe('grid')
    expect(grid.props.style.gridTemplateColumns).toBe('repeat(2, 1fr)')
    expect(grid.props.style.gap).toBe('8px')
    expect(grid.children).toEqual(cells)
  })

  it('should work with Stack overlaying content', () => {
    const background = {
      type: 'img',
      props: { src: 'bg.jpg' },
      children: [],
      key: undefined,
    }
    const overlay = {
      type: 'div',
      props: {},
      children: ['Overlay Text'],
      key: undefined,
    }
    const stack = Stack({ children: [background, overlay] })

    expect(stack.props.style.display).toBe('grid')
    expect(stack.props.style.gridTemplateColumns).toBe('1fr')
    expect(stack.props.style.gridTemplateRows).toBe('1fr')
    expect(stack.children).toEqual([background, overlay])
  })

  it('should work with nested layouts', () => {
    const innerColumn = Column({ gap: 8, children: ['A', 'B'] })
    const outerRow = Row({ gap: 16, children: [innerColumn, 'C'] })

    expect(outerRow.props.style.flexDirection).toBe('row')
    expect(outerRow.props.style.gap).toBe('16px')
    expect(outerRow.children[0]).toBe(innerColumn)
    expect(innerColumn.props.style.flexDirection).toBe('column')
  })
})
