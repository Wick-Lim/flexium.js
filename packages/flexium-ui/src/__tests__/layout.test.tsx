/**
 * Layout Components Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetStyles, getStyles } from 'flexium/css'
import { Column, Row } from '../layout'

describe('Column', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should render a div with flex-direction: column', () => {
    const result = Column({})
    expect(result.type).toBe('div')
    expect(result.props.class).toMatch(/^fx-[a-z0-9]+$/)

    const styles = getStyles()
    expect(styles).toContain('flex-direction:column')
  })

  it('should apply gap', () => {
    Column({ gap: 16 })
    const styles = getStyles()
    expect(styles).toContain('gap:16px')
  })

  it('should apply padding', () => {
    Column({ padding: 24 })
    const styles = getStyles()
    expect(styles).toContain('padding:24px')
  })

  it('should apply mainAxisAlignment', () => {
    Column({ mainAxisAlignment: 'center' })
    const styles = getStyles()
    expect(styles).toContain('justify-content:center')
  })

  it('should apply crossAxisAlignment', () => {
    Column({ crossAxisAlignment: 'center' })
    const styles = getStyles()
    expect(styles).toContain('align-items:center')
  })

  it('should render children', () => {
    const result = Column({ children: 'Hello' })
    expect(result.children).toContain('Hello')
  })

  it('should merge custom className', () => {
    const result = Column({ className: 'custom' })
    expect(result.props.class).toContain('custom')
  })
})

describe('Row', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should render a div with flex-direction: row', () => {
    const result = Row({})
    expect(result.type).toBe('div')
    expect(result.props.class).toMatch(/^fx-[a-z0-9]+$/)

    const styles = getStyles()
    expect(styles).toContain('flex-direction:row')
  })

  it('should apply gap', () => {
    Row({ gap: 8 })
    const styles = getStyles()
    expect(styles).toContain('gap:8px')
  })

  it('should apply mainAxisAlignment: space-between', () => {
    Row({ mainAxisAlignment: 'space-between' })
    const styles = getStyles()
    expect(styles).toContain('justify-content:space-between')
  })

  it('should apply wrap', () => {
    Row({ wrap: true })
    const styles = getStyles()
    expect(styles).toContain('flex-wrap:wrap')
  })

  it('should apply flex', () => {
    Row({ flex: 1 })
    const styles = getStyles()
    expect(styles).toContain('flex:1')
  })

  it('should apply width and height', () => {
    Row({ width: 100, height: 50 })
    const styles = getStyles()
    expect(styles).toContain('width:100px')
    expect(styles).toContain('height:50px')
  })
})
