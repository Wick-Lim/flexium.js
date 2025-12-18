import type { Theme, DeepPartial } from './types'
import { defaultTheme } from './defaultTheme'

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const output = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key as keyof typeof source]
      const targetValue = target[key as keyof T]

      if (
        sourceValue !== undefined &&
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null
      ) {
        output[key as keyof T] = deepMerge(
          targetValue as object,
          sourceValue as DeepPartial<object>
        ) as T[keyof T]
      } else if (sourceValue !== undefined) {
        output[key as keyof T] = sourceValue as T[keyof T]
      }
    }
  }

  return output
}

/**
 * Create a custom theme by extending the default theme
 *
 * @example
 * ```ts
 * const darkTheme = createTheme({
 *   colors: {
 *     background: '#1a1a1a',
 *     text: { primary: '#ffffff' }
 *   }
 * })
 * ```
 */
export function createTheme(overrides: DeepPartial<Theme> = {}): Theme {
  return deepMerge(defaultTheme, overrides)
}
