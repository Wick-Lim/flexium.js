import { describe, it, expect } from 'vitest'
import { Column } from '../Column'

describe('Column', () => {
  it('should create a VNode with display flex and column direction', () => {
    const result = Column({ children: [] }) as any
    expect(result).toBeDefined()
    expect(result.type).toBe('div')
    expect(result.props.style.display).toBe('flex')
    expect(result.props.style.flexDirection).toBe('column')
  })

  it('should support reverse direction', () => {
    const result = Column({ children: [], reverse: true }) as any
    expect(result.props.style.flexDirection).toBe('column-reverse')
  })

  it('should support align prop', () => {
    const result = Column({ children: [], align: 'center' }) as any
    expect(result.props.style.alignItems).toBe('center')
  })

  it('should support justify prop', () => {
    const result = Column({ children: [], justify: 'end' }) as any
    expect(result.props.style.justifyContent).toBe('flex-end')
  })

  it('should support wrap prop', () => {
    const result = Column({ children: [], wrap: true }) as any
    expect(result.props.style.flexWrap).toBe('wrap')
  })

  it('should support custom element via as prop', () => {
    const result = Column({ children: [], as: 'article' }) as any
    expect(result.type).toBe('article')
  })

  it('should support gap prop', () => {
    const result = Column({ children: [], gap: 24 }) as any
    expect(result.props.style.gap).toBe('24px')
  })

  it('should support margin prop', () => {
    const result = Column({ children: [], margin: 12 }) as any
    expect(result.props.style.margin).toBe('12px')
  })

  it('should merge user styles', () => {
    const result = Column({ children: [], style: { border: '1px solid black' } }) as any
    expect(result.props.style.border).toBe('1px solid black')
    expect(result.props.style.display).toBe('flex')
  })

  it('should pass id and role', () => {
    const result = Column({ children: [], id: 'main-column', role: 'main' }) as any
    expect(result.props.id).toBe('main-column')
    expect(result.props.role).toBe('main')
  })
})
