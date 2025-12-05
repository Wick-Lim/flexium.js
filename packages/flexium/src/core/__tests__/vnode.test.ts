/**
 * VNode Tests
 *
 * Tests for the createFNode function and VNode structure
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { createFNode, createVNode } from '../vnode'
import type { FNode } from '../renderer'

describe('createFNode', () => {
  describe('Basic Creation', () => {
    it('should create an FNode with string type', () => {
      const node = createFNode('div', {}, [])

      expect(node).toEqual({
        type: 'div',
        props: {},
        children: [],
        key: undefined
      })
    })

    it('should create an FNode with function type', () => {
      const Component = () => null
      const node = createFNode(Component, {}, [])

      expect(node.type).toBe(Component)
      expect(node.props).toEqual({})
      expect(node.children).toEqual([])
      expect(node.key).toBeUndefined()
    })

    it('should create an FNode with props', () => {
      const props = { className: 'container', id: 'main' }
      const node = createFNode('div', props, [])

      expect(node.props).toBe(props)
      expect(node.props).toEqual({ className: 'container', id: 'main' })
    })

    it('should create an FNode with children', () => {
      const children = ['Hello', 'World']
      const node = createFNode('div', {}, children)

      expect(node.children).toBe(children)
      expect(node.children).toEqual(['Hello', 'World'])
    })

    it('should create an FNode with numeric key', () => {
      const node = createFNode('div', {}, [], 123)

      expect(node.key).toBe(123)
    })

    it('should create an FNode with string key', () => {
      const node = createFNode('div', {}, [], 'unique-key')

      expect(node.key).toBe('unique-key')
    })

    it('should handle null key as undefined', () => {
      const node = createFNode('div', {}, [], null)

      expect(node.key).toBeUndefined()
    })

    it('should handle undefined key', () => {
      const node = createFNode('div', {}, [], undefined)

      expect(node.key).toBeUndefined()
    })
  })

  describe('Object Shape Consistency (Monomorphism)', () => {
    it('should create objects with same property order', () => {
      const node1 = createFNode('div', {}, [])
      const node2 = createFNode('span', { id: 'test' }, ['text'], 'key')

      const keys1 = Object.keys(node1)
      const keys2 = Object.keys(node2)

      expect(keys1).toEqual(['type', 'props', 'children', 'key'])
      expect(keys2).toEqual(['type', 'props', 'children', 'key'])
    })

    it('should always include key property even when undefined', () => {
      const nodeWithoutKey = createFNode('div', {}, [])
      const nodeWithKey = createFNode('div', {}, [], 'my-key')

      expect('key' in nodeWithoutKey).toBe(true)
      expect('key' in nodeWithKey).toBe(true)
    })

    it('should maintain consistent shape across multiple creations', () => {
      const nodes = [
        createFNode('div', {}, []),
        createFNode('span', { className: 'test' }, []),
        createFNode('p', {}, ['text'], 1),
        createFNode('button', { onClick: () => {} }, ['Click'], 'btn')
      ]

      const shapes = nodes.map(node => Object.keys(node).join(','))
      const uniqueShapes = new Set(shapes)

      expect(uniqueShapes.size).toBe(1)
      expect([...uniqueShapes][0]).toBe('type,props,children,key')
    })
  })

  describe('Complex Props and Children', () => {
    it('should handle complex props object', () => {
      const props = {
        className: 'container',
        style: { color: 'red', fontSize: 16 },
        onClick: () => {},
        'data-testid': 'my-component',
        disabled: false
      }
      const node = createFNode('button', props, [])

      expect(node.props).toBe(props)
      expect(node.props.className).toBe('container')
      expect(node.props.style).toEqual({ color: 'red', fontSize: 16 })
      expect(typeof node.props.onClick).toBe('function')
    })

    it('should handle nested children', () => {
      const child1 = createFNode('span', {}, ['Hello'])
      const child2 = createFNode('strong', {}, ['World'])
      const node = createFNode('div', {}, [child1, child2])

      expect(node.children).toHaveLength(2)
      expect(node.children[0]).toBe(child1)
      expect(node.children[1]).toBe(child2)
    })

    it('should handle mixed children types', () => {
      const childNode = createFNode('span', {}, [])
      const children = [
        'text',
        123,
        true,
        null,
        undefined,
        childNode
      ]
      const node = createFNode('div', {}, children)

      expect(node.children).toEqual(children)
      expect(node.children).toHaveLength(6)
    })

    it('should handle array of children', () => {
      const nestedChildren = [
        ['a', 'b'],
        createFNode('span', {}, []),
        ['c', 'd']
      ]
      const node = createFNode('div', {}, nestedChildren)

      expect(node.children).toEqual(nestedChildren)
    })
  })

  describe('Component Functions', () => {
    it('should handle arrow function components', () => {
      const ArrowComponent = () => createFNode('div', {}, [])
      const node = createFNode(ArrowComponent, { prop: 'value' }, [])

      expect(node.type).toBe(ArrowComponent)
      expect(typeof node.type).toBe('function')
    })

    it('should handle regular function components', () => {
      function RegularComponent() {
        return createFNode('div', {}, [])
      }
      const node = createFNode(RegularComponent, {}, [])

      expect(node.type).toBe(RegularComponent)
      expect(typeof node.type).toBe('function')
    })

    it('should handle class components', () => {
      class ClassComponent {
        render() {
          return createFNode('div', {}, [])
        }
      }
      const node = createFNode(ClassComponent, {}, [])

      expect(node.type).toBe(ClassComponent)
      expect(typeof node.type).toBe('function')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty props object', () => {
      const node = createFNode('div', {}, [])

      expect(node.props).toEqual({})
      expect(Object.keys(node.props)).toHaveLength(0)
    })

    it('should handle empty children array', () => {
      const node = createFNode('div', {}, [])

      expect(node.children).toEqual([])
      expect(node.children).toHaveLength(0)
    })

    it('should handle zero as key', () => {
      const node = createFNode('div', {}, [], 0)

      expect(node.key).toBe(0)
    })

    it('should handle empty string as key', () => {
      const node = createFNode('div', {}, [], '')

      expect(node.key).toBe('')
    })

    it('should not mutate input props', () => {
      const props = { className: 'test' }
      const originalProps = { ...props }
      const node = createFNode('div', props, [])

      expect(node.props).toBe(props)
      expect(props).toEqual(originalProps)
    })

    it('should not mutate input children', () => {
      const children = ['a', 'b', 'c']
      const originalChildren = [...children]
      const node = createFNode('div', {}, children)

      expect(node.children).toBe(children)
      expect(children).toEqual(originalChildren)
    })
  })

  describe('Type Checking', () => {
    it('should accept any string as type', () => {
      const types = ['div', 'span', 'custom-element', 'MyComponent']

      types.forEach(type => {
        const node = createFNode(type, {}, [])
        expect(node.type).toBe(type)
      })
    })

    it('should accept any function as type', () => {
      const Component1 = () => null
      const Component2 = function() { return null }
      const Component3 = class { render() { return null } }

      expect(createFNode(Component1, {}, []).type).toBe(Component1)
      expect(createFNode(Component2, {}, []).type).toBe(Component2)
      expect(createFNode(Component3, {}, []).type).toBe(Component3)
    })
  })

  describe('Return Value Structure', () => {
    it('should return a plain object', () => {
      const node = createFNode('div', {}, [])

      expect(typeof node).toBe('object')
      expect(node).not.toBeNull()
      expect(Array.isArray(node)).toBe(false)
    })

    it('should have exactly 4 properties', () => {
      const node = createFNode('div', {}, [])

      expect(Object.keys(node)).toHaveLength(4)
    })

    it('should conform to FNode interface', () => {
      const node: FNode = createFNode('div', { id: 'test' }, ['content'], 'key')

      expect(node).toHaveProperty('type')
      expect(node).toHaveProperty('props')
      expect(node).toHaveProperty('children')
      expect(node).toHaveProperty('key')
    })
  })
})

describe('createVNode (deprecated)', () => {
  it('should be an alias for createFNode', () => {
    expect(createVNode).toBe(createFNode)
  })

  it('should work exactly like createFNode', () => {
    const props = { className: 'test' }
    const children = ['text']
    const key = 'my-key'

    const fnodeResult = createFNode('div', props, children, key)
    const vnodeResult = createVNode('div', props, children, key)

    expect(vnodeResult).toEqual(fnodeResult)
  })
})
