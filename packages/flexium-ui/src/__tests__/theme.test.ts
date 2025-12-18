/**
 * Theme Module Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createTheme,
  defaultTheme,
  setTheme,
  getTheme,
  resetTheme,
} from '../theme'

describe('defaultTheme', () => {
  it('should have all required properties', () => {
    expect(defaultTheme.colors).toBeDefined()
    expect(defaultTheme.spacing).toBeDefined()
    expect(defaultTheme.typography).toBeDefined()
    expect(defaultTheme.borderRadius).toBeDefined()
    expect(defaultTheme.shadows).toBeDefined()
  })

  it('should have primary color', () => {
    expect(defaultTheme.colors.primary).toBe('#3b82f6')
  })

  it('should have spacing values', () => {
    expect(defaultTheme.spacing.sm).toBe(8)
    expect(defaultTheme.spacing.md).toBe(16)
  })
})

describe('createTheme()', () => {
  it('should return default theme when no overrides', () => {
    const theme = createTheme()
    expect(theme).toEqual(defaultTheme)
  })

  it('should merge top-level overrides', () => {
    const theme = createTheme({
      colors: {
        primary: '#ff0000',
      },
    })
    expect(theme.colors.primary).toBe('#ff0000')
    expect(theme.colors.secondary).toBe(defaultTheme.colors.secondary)
  })

  it('should deep merge nested overrides', () => {
    const theme = createTheme({
      colors: {
        text: {
          primary: '#000',
        },
      },
    })
    expect(theme.colors.text.primary).toBe('#000')
    expect(theme.colors.text.secondary).toBe(defaultTheme.colors.text.secondary)
  })

  it('should override spacing', () => {
    const theme = createTheme({
      spacing: {
        md: 20,
      },
    })
    expect(theme.spacing.md).toBe(20)
    expect(theme.spacing.sm).toBe(defaultTheme.spacing.sm)
  })
})

describe('setTheme() / getTheme() / resetTheme()', () => {
  beforeEach(() => {
    resetTheme()
  })

  it('should return default theme initially', () => {
    expect(getTheme()).toEqual(defaultTheme)
  })

  it('should set and get custom theme', () => {
    const customTheme = createTheme({
      colors: { primary: '#00ff00' },
    })
    setTheme(customTheme)
    expect(getTheme().colors.primary).toBe('#00ff00')
  })

  it('should reset to default theme', () => {
    const customTheme = createTheme({
      colors: { primary: '#00ff00' },
    })
    setTheme(customTheme)
    resetTheme()
    expect(getTheme()).toEqual(defaultTheme)
  })
})
