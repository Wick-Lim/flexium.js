import type { Theme } from './types'
import { defaultTheme } from './defaultTheme'

/**
 * Global theme state
 * Simple approach without React Context
 */
let currentTheme: Theme = defaultTheme

/**
 * Set the current theme
 */
export function setTheme(theme: Theme): void {
  currentTheme = theme
}

/**
 * Get the current theme
 */
export function getTheme(): Theme {
  return currentTheme
}

/**
 * Reset to default theme
 */
export function resetTheme(): void {
  currentTheme = defaultTheme
}
