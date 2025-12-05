import { describe, it, expect } from 'vitest'
import { Row } from '../Row'

describe('Row', () => {
  it('should create a VNode with display flex', () => {
    const result = Row({ children: [] }) as any
    expect(result).toBeDefined()
    expect(result.type).toBe('div')
    expect(result.props.style.display).toBe('flex')
    expect(result.props.style.flexDirection).toBe('row')
  })

  it('should support reverse direction', () => {
    const result = Row({ children: [], reverse: true }) as any
    expect(result.props.style.flexDirection).toBe('row-reverse')
  })

  it('should support align prop', () => {
    const result = Row({ children: [], align: 'center' }) as any
    expect(result.props.style.alignItems).toBe('center')
  })

  it('should support justify prop', () => {
    const result = Row({ children: [], justify: 'between' }) as any
    expect(result.props.style.justifyContent).toBe('space-between')
  })

  it('should support wrap prop', () => {
    const result = Row({ children: [], wrap: true }) as any
    expect(result.props.style.flexWrap).toBe('wrap')
  })

  it('should support custom element via as prop', () => {
    const result = Row({ children: [], as: 'section' }) as any
    expect(result.type).toBe('section')
  })

  it('should support gap prop', () => {
    const result = Row({ children: [], gap: 16 }) as any
    expect(result.props.style.gap).toBe('16px')
  })

  it('should support padding prop', () => {
    const result = Row({ children: [], padding: 8 }) as any
    expect(result.props.style.padding).toBe('8px')
  })

  it('should merge user styles', () => {
    const result = Row({ children: [], style: { backgroundColor: 'red' } }) as any
    expect(result.props.style.backgroundColor).toBe('red')
    expect(result.props.style.display).toBe('flex')
  })

  it('should pass className', () => {
    const result = Row({ children: [], className: 'my-row' }) as any
    expect(result.props.className).toBe('my-row')
  })
})
