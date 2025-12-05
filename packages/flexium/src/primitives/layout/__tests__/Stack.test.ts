import { describe, it, expect } from 'vitest'
import { Stack } from '../Stack'

describe('Stack', () => {
  it('should create a VNode with display grid for stacking', () => {
    const result = Stack({ children: [] }) as any
    expect(result).toBeDefined()
    expect(result.type).toBe('div')
    expect(result.props.style.display).toBe('grid')
  })

  it('should have 1fr grid template for overlapping children', () => {
    const result = Stack({ children: [] }) as any
    expect(result.props.style.gridTemplateColumns).toBe('1fr')
    expect(result.props.style.gridTemplateRows).toBe('1fr')
  })

  it('should support align prop', () => {
    const result = Stack({ children: [], align: 'center' }) as any
    expect(result.props.style.alignItems).toBe('center')
  })

  it('should support justify prop', () => {
    const result = Stack({ children: [], justify: 'center' }) as any
    expect(result.props.style.justifyItems).toBe('center')
  })

  it('should support custom element via as prop', () => {
    const result = Stack({ children: [], as: 'div' }) as any
    expect(result.type).toBe('div')
  })

  it('should merge user styles', () => {
    const result = Stack({ children: [], style: { position: 'relative' } }) as any
    expect(result.props.style.position).toBe('relative')
  })

  it('should pass className', () => {
    const result = Stack({ children: [], className: 'stack-container' }) as any
    expect(result.props.className).toBe('stack-container')
  })

  it('should handle single child', () => {
    const child = { type: 'div', props: {}, children: [] }
    const result = Stack({ children: child }) as any
    expect(result).toBeDefined()
  })

  it('should handle array of children', () => {
    const children = [
      { type: 'div', props: {}, children: [] },
      { type: 'span', props: {}, children: [] }
    ]
    const result = Stack({ children }) as any
    expect(result).toBeDefined()
  })
})
