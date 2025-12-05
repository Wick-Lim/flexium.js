import { describe, it, expect } from 'vitest'
import { Spacer } from '../Spacer'

describe('Spacer', () => {
  it('should create a FNode with display flex', () => {
    const result = Spacer({}) as any
    expect(result).toBeDefined()
    expect(result.type).toBe('div')
    expect(result.props.style.display).toBe('flex')
  })

  it('should default to flexGrow 1 when no size specified', () => {
    const result = Spacer({}) as any
    expect(result.props.style.flexGrow).toBe(1)
  })

  it('should support size prop as fixed basis', () => {
    const result = Spacer({ size: 20 }) as any
    expect(result.props.style.flexBasis).toBe('20px')
    expect(result.props.style.flexGrow).toBe(0)
    expect(result.props.style.flexShrink).toBe(0)
  })

  it('should support size prop as string', () => {
    const result = Spacer({ size: '2rem' }) as any
    expect(result.props.style.flexBasis).toBe('2rem')
  })

  it('should support explicit width', () => {
    const result = Spacer({ width: 100 }) as any
    expect(result.props.style.width).toBe('100px')
    expect(result.props.style.flexGrow).toBe(0)
  })

  it('should support explicit height', () => {
    const result = Spacer({ height: 50 }) as any
    expect(result.props.style.height).toBe('50px')
    expect(result.props.style.flexGrow).toBe(0)
  })

  it('should support custom flex value', () => {
    const result = Spacer({ flex: 2 }) as any
    expect(result.props.style.flexGrow).toBe(2)
  })

  it('should support custom element via as prop', () => {
    const result = Spacer({ as: 'span' }) as any
    expect(result.type).toBe('span')
  })

  it('should merge user styles', () => {
    const result = Spacer({ style: { backgroundColor: 'transparent' } }) as any
    expect(result.props.style.backgroundColor).toBe('transparent')
  })

  it('should pass className', () => {
    const result = Spacer({ className: 'my-spacer' }) as any
    expect(result.props.className).toBe('my-spacer')
  })
})
