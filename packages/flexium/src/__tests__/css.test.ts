/**
 * CSS Module Tests
 *
 * Tests for: css, cx, styled, keyframes
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { css, cx, styled, keyframes, resetStyles, getStyles } from '../css'

describe('css()', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should generate a unique class name', () => {
    const className = css({ color: 'red' })
    expect(className).toMatch(/^fx-[a-z0-9]+$/)
  })

  it('should return same class name for same styles', () => {
    const class1 = css({ color: 'red' })
    const class2 = css({ color: 'red' })
    expect(class1).toBe(class2)
  })

  it('should return different class names for different styles', () => {
    const class1 = css({ color: 'red' })
    const class2 = css({ color: 'blue' })
    expect(class1).not.toBe(class2)
  })

  it('should handle numeric values with px unit', () => {
    css({ padding: 8 })
    const styles = getStyles()
    expect(styles).toContain('padding:8px')
  })

  it('should handle unitless properties without px', () => {
    css({ opacity: 0.5, zIndex: 10 })
    const styles = getStyles()
    expect(styles).toContain('opacity:0.5')
    expect(styles).toContain('z-index:10')
  })

  it('should handle nested selectors', () => {
    css({
      color: 'red',
      '&:hover': { color: 'blue' }
    })
    const styles = getStyles()
    expect(styles).toContain(':hover')
    expect(styles).toContain('color:blue')
  })

  it('should handle media queries', () => {
    css({
      padding: 16,
      '@media (max-width: 768px)': { padding: 8 }
    })
    const styles = getStyles()
    expect(styles).toContain('@media (max-width: 768px)')
    expect(styles).toContain('padding:8px')
  })

  it('should convert camelCase to kebab-case', () => {
    css({ backgroundColor: 'red', fontSize: 16 })
    const styles = getStyles()
    expect(styles).toContain('background-color:red')
    expect(styles).toContain('font-size:16px')
  })
})

describe('cx()', () => {
  it('should combine class names', () => {
    const result = cx('foo', 'bar', 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should filter out falsy values', () => {
    const result = cx('foo', false, null, undefined, 'bar', '', 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    const result = cx('btn', isActive && 'active', isDisabled && 'disabled')
    expect(result).toBe('btn active')
  })
})

describe('keyframes()', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should generate a unique animation name', () => {
    const name = keyframes({
      from: { opacity: 0 },
      to: { opacity: 1 }
    })
    expect(name).toMatch(/^fx-[a-z0-9]+$/)
  })

  it('should return same name for same keyframes', () => {
    const name1 = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
    const name2 = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
    expect(name1).toBe(name2)
  })

  it('should generate valid @keyframes CSS', () => {
    keyframes({
      from: { opacity: 0 },
      to: { opacity: 1 }
    })
    const styles = getStyles()
    expect(styles).toContain('@keyframes')
    expect(styles).toContain('from')
    expect(styles).toContain('to')
    expect(styles).toContain('opacity:0')
    expect(styles).toContain('opacity:1')
  })

  it('should handle percentage keyframes', () => {
    keyframes({
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.5)' },
      '100%': { transform: 'scale(1)' }
    })
    const styles = getStyles()
    expect(styles).toContain('0%')
    expect(styles).toContain('50%')
    expect(styles).toContain('100%')
  })
})

describe('styled()', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should create a styled component', () => {
    const Button = styled('button', {
      base: { padding: 8, color: 'white' }
    })

    expect(Button.displayName).toBe('Styled(button)')
  })

  it('should render with base styles', () => {
    const Button = styled('button', {
      base: { padding: 8 }
    })

    const result = Button({})
    expect(result.type).toBe('button')
    expect(result.props.className).toMatch(/^fx-[a-z0-9]+$/)
  })

  it('should apply variant styles', () => {
    const Button = styled('button', {
      base: { padding: 8 },
      variants: {
        size: {
          sm: { padding: 4 },
          lg: { padding: 16 }
        }
      }
    })

    const smResult = Button({ size: 'sm' })
    const lgResult = Button({ size: 'lg' })

    // Both should have different classNames due to variants
    expect(smResult.props.className).not.toBe(lgResult.props.className)
  })

  it('should apply default variants', () => {
    const Button = styled('button', {
      base: { padding: 8 },
      variants: {
        variant: {
          primary: { background: 'blue' },
          secondary: { background: 'gray' }
        }
      },
      defaultVariants: {
        variant: 'primary'
      }
    })

    const result = Button({})
    // Should have both base and default variant class
    expect(result.props.className.split(' ').length).toBe(2)
  })

  it('should pass through non-variant props', () => {
    const Button = styled('button', {
      base: { padding: 8 }
    })

    const result = Button({
      onClick: () => {},
      'data-testid': 'btn',
      disabled: true
    })

    expect(result.props.onClick).toBeDefined()
    expect(result.props['data-testid']).toBe('btn')
    expect(result.props.disabled).toBe(true)
  })

  it('should merge custom className', () => {
    const Button = styled('button', {
      base: { padding: 8 }
    })

    const result = Button({ className: 'custom-class' })
    expect(result.props.className).toContain('custom-class')
  })

  it('should handle children', () => {
    const Button = styled('button', {
      base: { padding: 8 }
    })

    const result = Button({ children: 'Click me' })
    expect(result.children).toContain('Click me')
  })
})

describe('SSR support', () => {
  beforeEach(() => {
    resetStyles()
  })

  it('should collect styles on server', () => {
    css({ color: 'red' })
    css({ padding: 8 })

    const styles = getStyles()
    expect(styles).toContain('color:red')
    expect(styles).toContain('padding:8px')
  })

  it('should reset styles between requests', () => {
    css({ color: 'red' })
    expect(getStyles()).toContain('color:red')

    resetStyles()
    expect(getStyles()).toBe('')
  })
})
