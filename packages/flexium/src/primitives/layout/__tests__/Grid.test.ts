import { describe, it, expect } from 'vitest'
import { Grid } from '../Grid'

describe('Grid', () => {
  it('should create a VNode with display grid', () => {
    const result = Grid({ children: [] }) as any
    expect(result).toBeDefined()
    expect(result.type).toBe('div')
    expect(result.props.style.display).toBe('grid')
  })

  it('should support cols as number', () => {
    const result = Grid({ children: [], cols: 3 }) as any
    expect(result.props.style.gridTemplateColumns).toBe('repeat(3, 1fr)')
  })

  it('should support cols as string template', () => {
    const result = Grid({ children: [], cols: '1fr 2fr 1fr' }) as any
    expect(result.props.style.gridTemplateColumns).toBe('1fr 2fr 1fr')
  })

  it('should support rows as number', () => {
    const result = Grid({ children: [], rows: 2 }) as any
    expect(result.props.style.gridTemplateRows).toBe('repeat(2, 1fr)')
  })

  it('should support columnGap', () => {
    const result = Grid({ children: [], columnGap: 16 }) as any
    expect(result.props.style.columnGap).toBe('16px')
  })

  it('should support rowGap', () => {
    const result = Grid({ children: [], rowGap: 8 }) as any
    expect(result.props.style.rowGap).toBe('8px')
  })

  it('should support flow prop', () => {
    const result = Grid({ children: [], flow: 'column' }) as any
    expect(result.props.style.gridAutoFlow).toBe('column')
  })

  it('should support custom element via as prop', () => {
    const result = Grid({ children: [], as: 'section' }) as any
    expect(result.type).toBe('section')
  })

  it('should support gap prop from base styles', () => {
    const result = Grid({ children: [], gap: 20 }) as any
    expect(result.props.style.gap).toBe('20px')
  })

  it('should merge user styles', () => {
    const result = Grid({ children: [], style: { minHeight: '100px' } }) as any
    expect(result.props.style.minHeight).toBe('100px')
  })
})
