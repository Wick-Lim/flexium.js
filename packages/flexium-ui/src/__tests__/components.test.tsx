/**
 * Component Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetStyles, getStyles } from 'flexium/css'
import { defaultTheme } from '../theme'
import { Text, Button } from '../components'

describe('Text', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should render a span by default', () => {
    const result = Text({ children: 'Hello' })
    expect(result.type).toBe('span')
  })

  it('should render h1 for h1 variant', () => {
    const result = Text({ variant: 'h1', children: 'Title' })
    expect(result.type).toBe('h1')
  })

  it('should render h2 for h2 variant', () => {
    const result = Text({ variant: 'h2', children: 'Subtitle' })
    expect(result.type).toBe('h2')
  })

  it('should apply font styles', () => {
    Text({ children: 'Hello' })
    const styles = getStyles()
    expect(styles).toContain(`font-family:${defaultTheme.typography.fontFamily}`)
  })

  it('should apply text color', () => {
    Text({ color: 'primary', children: 'Hello' })
    const styles = getStyles()
    expect(styles).toContain(`color:${defaultTheme.colors.text.primary}`)
  })

  it('should apply custom color', () => {
    Text({ color: '#ff0000', children: 'Hello' })
    const styles = getStyles()
    expect(styles).toContain('color:#ff0000')
  })

  it('should apply text alignment', () => {
    Text({ align: 'center', children: 'Hello' })
    const styles = getStyles()
    expect(styles).toContain('text-align:center')
  })

  it('should apply noSelect', () => {
    Text({ noSelect: true, children: 'Hello' })
    const styles = getStyles()
    expect(styles).toContain('user-select:none')
  })

  it('should apply truncate', () => {
    Text({ truncate: true, children: 'Long text' })
    const styles = getStyles()
    expect(styles).toContain('text-overflow:ellipsis')
    expect(styles).toContain('white-space:nowrap')
  })

  it('should merge custom className', () => {
    const result = Text({ className: 'custom', children: 'Hello' })
    expect(result.props.class).toContain('custom')
  })
})

describe('Button', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should render a button element', () => {
    const result = Button({ children: 'Click' })
    expect(result.type).toBe('button')
  })

  it('should have type="button" by default', () => {
    const result = Button({ children: 'Click' })
    expect(result.props.type).toBe('button')
  })

  it('should support type="submit"', () => {
    const result = Button({ type: 'submit', children: 'Submit' })
    expect(result.props.type).toBe('submit')
  })

  it('should apply filled variant styles', () => {
    Button({ variant: 'filled', children: 'Click' })
    const styles = getStyles()
    expect(styles).toContain(`background-color:${defaultTheme.colors.primary}`)
    expect(styles).toContain('color:#ffffff')
  })

  it('should apply outlined variant styles', () => {
    Button({ variant: 'outlined', children: 'Click' })
    const styles = getStyles()
    expect(styles).toContain('background-color:transparent')
    expect(styles).toContain('border:1px solid')
  })

  it('should apply text variant styles', () => {
    Button({ variant: 'text', children: 'Click' })
    const styles = getStyles()
    expect(styles).toContain('background-color:transparent')
  })

  it('should apply disabled state', () => {
    const result = Button({ disabled: true, children: 'Click' })
    expect(result.props.disabled).toBe(true)
    const styles = getStyles()
    expect(styles).toContain('cursor:not-allowed')
    expect(styles).toContain('opacity:0.5')
  })

  it('should apply fullWidth', () => {
    Button({ fullWidth: true, children: 'Click' })
    const styles = getStyles()
    expect(styles).toContain('width:100%')
  })

  it('should apply different sizes', () => {
    resetStyles()
    Button({ size: 'sm', children: 'Small' })
    const smStyles = getStyles()
    expect(smStyles).toContain('padding:6px 12px')

    resetStyles()
    Button({ size: 'lg', children: 'Large' })
    const lgStyles = getStyles()
    expect(lgStyles).toContain('padding:12px 24px')
  })

  it('should pass onClick when not disabled', () => {
    const handler = () => {}
    const result = Button({ onClick: handler, children: 'Click' })
    expect(result.props.onClick).toBe(handler)
  })

  it('should not pass onClick when disabled', () => {
    const handler = () => {}
    const result = Button({ onClick: handler, disabled: true, children: 'Click' })
    expect(result.props.onClick).toBeUndefined()
  })

  it('should merge custom className', () => {
    const result = Button({ className: 'custom', children: 'Click' })
    expect(result.props.class).toContain('custom')
  })
})
