/**
 * JSX Runtime Tests
 *
 * Comprehensive tests for jsx-runtime.ts which is critical infrastructure for JSX transformation.
 * Tests cover jsx(), jsxs(), Fragment, and all edge cases for children handling.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { jsx, jsxs, Fragment, jsxDEV } from '../jsx-runtime'
import type { FNode } from '../core/renderer'

describe('jsx() function', () => {
  describe('Basic Element Creation', () => {
    it('should create a basic element with no props or children', () => {
      const node = jsx('div', {})

      expect(node).toEqual({
        type: 'div',
        props: {},
        children: [],
        key: undefined,
      })
    })

    it('should create an element with string type', () => {
      const node = jsx('span', { children: 'Hello' })

      expect(node.type).toBe('span')
      expect(node.children).toEqual(['Hello'])
    })

    it('should create an element with function component type', () => {
      const Component = () => null
      const node = jsx(Component, {})

      expect(node.type).toBe(Component)
      expect(typeof node.type).toBe('function')
    })

    it('should create an element with custom element name', () => {
      const node = jsx('custom-element', {})

      expect(node.type).toBe('custom-element')
    })
  })

  describe('Props Handling', () => {
    it('should handle props without children or key', () => {
      const node = jsx('div', { className: 'container', id: 'main' })

      expect(node.props).toEqual({ className: 'container', id: 'main' })
      expect(node.children).toEqual([])
    })

    it('should exclude children from props', () => {
      const node = jsx('div', { className: 'test', children: 'content' })

      expect(node.props).toEqual({ className: 'test' })
      expect(node.props).not.toHaveProperty('children')
      expect(node.children).toEqual(['content'])
    })

    it('should exclude key from props', () => {
      const node = jsx('div', { className: 'test', key: 'my-key' })

      expect(node.props).toEqual({ className: 'test' })
      expect(node.props).not.toHaveProperty('key')
      expect(node.key).toBe('my-key')
    })

    it('should handle complex props object', () => {
      const onClick = () => {}
      const style = { color: 'red', fontSize: 16 }
      const node = jsx('button', {
        className: 'btn',
        style,
        onClick,
        disabled: false,
        'data-testid': 'test-btn',
      })

      expect(node.props).toEqual({
        className: 'btn',
        style,
        onClick,
        disabled: false,
        'data-testid': 'test-btn',
      })
    })

    it('should handle props with special characters', () => {
      const node = jsx('div', {
        'aria-label': 'Label',
        'data-value': '123',
      })

      expect(node.props).toEqual({
        'aria-label': 'Label',
        'data-value': '123',
      })
    })
  })

  describe('Key Prop Handling', () => {
    it('should extract string key from props', () => {
      const node = jsx('div', { key: 'unique-key', className: 'test' })

      expect(node.key).toBe('unique-key')
      expect(node.props).not.toHaveProperty('key')
    })

    it('should extract numeric key from props', () => {
      const node = jsx('div', { key: 123, className: 'test' })

      expect(node.key).toBe(123)
      expect(node.props).not.toHaveProperty('key')
    })

    it('should handle undefined key', () => {
      const node = jsx('div', { className: 'test' })

      expect(node.key).toBeUndefined()
    })

    it('should handle null key (converts to undefined)', () => {
      const node = jsx('div', { key: null, className: 'test' })

      // null keys are converted to undefined by createFNode
      expect(node.key).toBeUndefined()
      expect(node.props).not.toHaveProperty('key')
    })

    it('should handle zero as key', () => {
      const node = jsx('div', { key: 0 })

      expect(node.key).toBe(0)
    })

    it('should handle empty string as key', () => {
      const node = jsx('div', { key: '' })

      expect(node.key).toBe('')
    })
  })

  describe('Children Handling', () => {
    it('should handle single text child', () => {
      const node = jsx('div', { children: 'Hello World' })

      expect(node.children).toEqual(['Hello World'])
    })

    it('should handle single numeric child', () => {
      const node = jsx('div', { children: 42 })

      expect(node.children).toEqual([42])
    })

    it('should handle single element child', () => {
      const child = jsx('span', { children: 'text' })
      const node = jsx('div', { children: child })

      expect(node.children).toEqual([child])
      expect(node.children[0]).toBe(child)
    })

    it('should handle array of children', () => {
      const node = jsx('div', { children: ['Hello', ' ', 'World'] })

      expect(node.children).toEqual(['Hello', ' ', 'World'])
    })

    it('should handle mixed children types in array', () => {
      const child = jsx('span', {})
      const node = jsx('div', { children: ['text', 123, child] })

      expect(node.children).toEqual(['text', 123, child])
    })

    it('should handle empty children array', () => {
      const node = jsx('div', { children: [] })

      expect(node.children).toEqual([])
    })

    it('should handle undefined children', () => {
      const node = jsx('div', { children: undefined })

      expect(node.children).toEqual([])
    })
  })

  describe('Children Filtering', () => {
    it('should filter out null children', () => {
      const node = jsx('div', { children: null })

      expect(node.children).toEqual([])
    })

    it('should filter out false children', () => {
      const node = jsx('div', { children: false })

      expect(node.children).toEqual([])
    })

    it('should filter out null in children array', () => {
      const node = jsx('div', { children: ['Hello', null, 'World'] })

      expect(node.children).toEqual(['Hello', 'World'])
    })

    it('should filter out undefined in children array', () => {
      const node = jsx('div', { children: ['Hello', undefined, 'World'] })

      expect(node.children).toEqual(['Hello', 'World'])
    })

    it('should filter out false in children array', () => {
      const node = jsx('div', { children: ['Hello', false, 'World'] })

      expect(node.children).toEqual(['Hello', 'World'])
    })

    it('should filter multiple null/undefined/false values', () => {
      const node = jsx('div', {
        children: ['a', null, 'b', undefined, 'c', false, 'd'],
      })

      expect(node.children).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should keep truthy boolean values like true', () => {
      const node = jsx('div', { children: ['a', true, 'b'] })

      expect(node.children).toEqual(['a', true, 'b'])
    })

    it('should keep zero as a valid child', () => {
      const node = jsx('div', { children: [0, 'text', 0] })

      expect(node.children).toEqual([0, 'text', 0])
    })

    it('should keep empty string as valid child', () => {
      const node = jsx('div', { children: ['', 'text', ''] })

      expect(node.children).toEqual(['', 'text', ''])
    })
  })

  describe('Children Flattening', () => {
    it('should flatten nested children arrays', () => {
      const node = jsx('div', { children: [['a', 'b'], ['c', 'd']] })

      expect(node.children).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should flatten deeply nested children arrays', () => {
      const node = jsx('div', { children: [['a', ['b', ['c', 'd']]]] })

      expect(node.children).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should flatten and filter in correct order', () => {
      const node = jsx('div', {
        children: [['a', null], [undefined, 'b'], ['c', false, 'd']],
      })

      expect(node.children).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should handle mixed nested arrays and elements', () => {
      const child1 = jsx('span', { children: '1' })
      const child2 = jsx('span', { children: '2' })
      const node = jsx('div', { children: ['a', [child1, ['b', child2]], 'c'] })

      expect(node.children).toEqual(['a', child1, 'b', child2, 'c'])
    })

    it('should flatten empty arrays', () => {
      const node = jsx('div', { children: [[], 'a', [], 'b', []] })

      expect(node.children).toEqual(['a', 'b'])
    })

    it('should handle arrays with only null/undefined/false', () => {
      const node = jsx('div', { children: [[null], [undefined], [false]] })

      expect(node.children).toEqual([])
    })
  })

  describe('Component Functions', () => {
    it('should handle arrow function components', () => {
      const ArrowComponent = () => jsx('div', {})
      const node = jsx(ArrowComponent, { prop: 'value' })

      expect(node.type).toBe(ArrowComponent)
      expect(node.props).toEqual({ prop: 'value' })
    })

    it('should handle regular function components', () => {
      function RegularComponent() {
        return jsx('div', {})
      }
      const node = jsx(RegularComponent, { prop: 'value' })

      expect(node.type).toBe(RegularComponent)
      expect(node.props).toEqual({ prop: 'value' })
    })

    it('should handle components with children', () => {
      const Component = () => jsx('div', {})
      const node = jsx(Component, { children: 'Hello' })

      expect(node.type).toBe(Component)
      expect(node.children).toEqual(['Hello'])
    })
  })
})

describe('jsxs() function', () => {
  describe('Basic Functionality', () => {
    it('should create element with static children', () => {
      const node = jsxs('div', { children: ['a', 'b', 'c'] })

      expect(node.type).toBe('div')
      expect(node.children).toEqual(['a', 'b', 'c'])
    })

    it('should handle props like jsx()', () => {
      const node = jsxs('div', { className: 'test', id: 'main', children: [] })

      expect(node.props).toEqual({ className: 'test', id: 'main' })
    })

    it('should extract key from props', () => {
      const node = jsxs('div', { key: 'my-key', className: 'test' })

      expect(node.key).toBe('my-key')
      expect(node.props).not.toHaveProperty('key')
    })

    it('should create element without children', () => {
      const node = jsxs('div', {})

      expect(node.children).toEqual([])
    })
  })

  describe('Children Filtering (No Flattening)', () => {
    it('should filter null, undefined, false from children array', () => {
      const node = jsxs('div', { children: ['a', null, 'b', undefined, false] })

      expect(node.children).toEqual(['a', 'b'])
    })

    it('should NOT flatten nested arrays (optimization)', () => {
      const node = jsxs('div', { children: [['a', 'b'], ['c', 'd']] })

      // jsxs skips flattening, so nested arrays remain
      expect(node.children).toEqual([['a', 'b'], ['c', 'd']])
    })

    it('should filter at top level only', () => {
      const node = jsxs('div', { children: ['a', null, ['b', null], 'c'] })

      expect(node.children).toEqual(['a', ['b', null], 'c'])
      expect(node.children[1]).toEqual(['b', null])
    })

    it('should handle single child', () => {
      const node = jsxs('div', { children: 'single' })

      expect(node.children).toEqual(['single'])
    })

    it('should filter single null/undefined/false child', () => {
      const nodeNull = jsxs('div', { children: null })
      const nodeUndefined = jsxs('div', { children: undefined })
      const nodeFalse = jsxs('div', { children: false })

      expect(nodeNull.children).toEqual([])
      expect(nodeUndefined.children).toEqual([])
      expect(nodeFalse.children).toEqual([])
    })

    it('should keep truthy values', () => {
      const node = jsxs('div', { children: [0, '', true, 'text'] })

      expect(node.children).toEqual([0, '', true, 'text'])
    })
  })

  describe('jsxs vs jsx Differences', () => {
    it('jsxs should skip recursive flattening while jsx flattens', () => {
      const nestedChildren = [['a', ['b', 'c']], 'd']

      const jsxNode = jsx('div', { children: nestedChildren })
      const jsxsNode = jsxs('div', { children: nestedChildren })

      // jsx flattens recursively
      expect(jsxNode.children).toEqual(['a', 'b', 'c', 'd'])

      // jsxs does NOT flatten
      expect(jsxsNode.children).toEqual([['a', ['b', 'c']], 'd'])
    })

    it('both should filter null/undefined/false at their respective levels', () => {
      const children = ['a', null, 'b', undefined, false, 'c']

      const jsxNode = jsx('div', { children })
      const jsxsNode = jsxs('div', { children })

      // Both filter out null/undefined/false
      expect(jsxNode.children).toEqual(['a', 'b', 'c'])
      expect(jsxsNode.children).toEqual(['a', 'b', 'c'])
    })
  })
})

describe('Fragment', () => {
  describe('Basic Fragment Functionality', () => {
    it('should create a fragment with children', () => {
      const node = Fragment({ children: ['a', 'b', 'c'] })

      expect(node.type).toBe('fragment')
      expect(node.children).toEqual(['a', 'b', 'c'])
      expect(node.props).toEqual({})
    })

    it('should create a fragment without children', () => {
      const node = Fragment({})

      expect(node.type).toBe('fragment')
      expect(node.children).toEqual([])
      expect(node.props).toEqual({})
    })

    it('should handle undefined children prop', () => {
      const node = Fragment({ children: undefined })

      expect(node.type).toBe('fragment')
      expect(node.children).toEqual([])
    })

    it('should preserve children array as-is (no filtering)', () => {
      const node = Fragment({ children: ['a', null, undefined, false, 'b'] })

      // Fragment doesn't filter, just passes through
      expect(node.children).toEqual(['a', null, undefined, false, 'b'])
    })

    it('should work with jsx() wrapper', () => {
      const node = jsx(Fragment, { children: ['a', 'b'] })

      // When used with jsx(), Fragment gets processed
      expect(node.type).toBe(Fragment)
      expect(node.children).toEqual(['a', 'b'])
    })
  })

  describe('Fragment with Complex Children', () => {
    it('should handle nested elements as children', () => {
      const child1 = jsx('div', { children: 'Hello' })
      const child2 = jsx('span', { children: 'World' })
      const node = Fragment({ children: [child1, child2] })

      expect(node.children).toEqual([child1, child2])
    })

    it('should handle mixed types in children', () => {
      const element = jsx('div', {})
      const node = Fragment({ children: ['text', 123, true, element] })

      expect(node.children).toEqual(['text', 123, true, element])
    })
  })
})

describe('jsxDEV export', () => {
  it('should be an alias for jsx', () => {
    expect(jsxDEV).toBe(jsx)
  })

  it('should work exactly like jsx', () => {
    const props = { className: 'test', children: 'content', key: 'my-key' }

    const jsxNode = jsx('div', props)
    const jsxDEVNode = jsxDEV('div', props)

    expect(jsxDEVNode).toEqual(jsxNode)
  })
})

describe('jsx-dev-runtime exports', () => {
  it('should export all required functions from dev runtime', async () => {
    const devRuntime = await import('../jsx-dev-runtime')

    expect(devRuntime.jsx).toBeDefined()
    expect(devRuntime.jsxs).toBeDefined()
    expect(devRuntime.Fragment).toBeDefined()
    expect(devRuntime.jsxDEV).toBeDefined()
  })

  it('should export the same functions as jsx-runtime', async () => {
    const runtime = await import('../jsx-runtime')
    const devRuntime = await import('../jsx-dev-runtime')

    expect(devRuntime.jsx).toBe(runtime.jsx)
    expect(devRuntime.jsxs).toBe(runtime.jsxs)
    expect(devRuntime.Fragment).toBe(runtime.Fragment)
    expect(devRuntime.jsxDEV).toBe(runtime.jsxDEV)
  })
})

describe('Edge Cases and Performance', () => {
  describe('Large Children Arrays', () => {
    it('should handle large flat children array', () => {
      const children = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const node = jsx('div', { children })

      expect(node.children).toHaveLength(1000)
      expect(node.children[0]).toBe('item-0')
      expect(node.children[999]).toBe('item-999')
    })

    it('should handle large nested children array', () => {
      const children = Array.from({ length: 100 }, (_, i) => [
        `item-${i}`,
        `sub-${i}`,
      ])
      const node = jsx('div', { children })

      expect(node.children).toHaveLength(200)
      expect(node.children[0]).toBe('item-0')
      expect(node.children[1]).toBe('sub-0')
    })

    it('should filter large arrays with many null values', () => {
      const children = Array.from({ length: 1000 }, (_, i) =>
        i % 2 === 0 ? `item-${i}` : null
      )
      const node = jsx('div', { children })

      expect(node.children).toHaveLength(500)
      expect(node.children.every((child) => child !== null)).toBe(true)
    })
  })

  describe('Object Shape Consistency', () => {
    it('should maintain consistent object shape across different jsx calls', () => {
      const nodes = [
        jsx('div', {}),
        jsx('span', { className: 'test' }),
        jsx('p', { children: 'text', key: 'my-key' }),
        jsxs('div', { children: ['a', 'b'] }),
      ]

      const shapes = nodes.map((node) => Object.keys(node).join(','))
      const uniqueShapes = new Set(shapes)

      expect(uniqueShapes.size).toBe(1)
      expect([...uniqueShapes][0]).toBe('type,props,children,key')
    })
  })

  describe('Props Mutation Safety', () => {
    it('should not mutate input props object', () => {
      const props = { className: 'test', children: 'content', key: 'my-key' }
      const originalProps = { ...props }

      jsx('div', props)

      expect(props).toEqual(originalProps)
      expect(props).toHaveProperty('className')
      expect(props).toHaveProperty('children')
      expect(props).toHaveProperty('key')
    })

    it('should not mutate children array', () => {
      const children = ['a', 'b', 'c']
      const originalChildren = [...children]

      jsx('div', { children })

      expect(children).toEqual(originalChildren)
    })
  })

  describe('Special Cases', () => {
    it('should handle props with toString conflicts', () => {
      const props = {
        toString: 'not-a-function',
        valueOf: 'also-not-a-function',
      }
      const node = jsx('div', props)

      expect(node.props).toEqual(props)
    })

    it('should handle props with prototype properties', () => {
      const props = {
        constructor: 'constructor-value',
        hasOwnProperty: 'has-own-property-value',
      }
      const node = jsx('div', props)

      expect(node.props).toEqual(props)
    })

    it('should handle very deeply nested children', () => {
      let nested: any = 'deep'
      for (let i = 0; i < 100; i++) {
        nested = [nested]
      }

      const node = jsx('div', { children: nested })

      expect(node.children).toEqual(['deep'])
    })

    it('should handle conditional rendering patterns', () => {
      const condition = false
      const node = jsx('div', {
        children: [condition && 'should-not-appear', 'always-appears'],
      })

      expect(node.children).toEqual(['always-appears'])
    })

    it('should handle map with key pattern', () => {
      const items = ['a', 'b', 'c']
      const children = items.map((item, i) =>
        jsx('span', { key: i, children: item })
      )
      const node = jsx('div', { children })

      expect(node.children).toHaveLength(3)
      expect(node.children[0].key).toBe(0)
      expect(node.children[1].key).toBe(1)
      expect(node.children[2].key).toBe(2)
    })
  })
})
