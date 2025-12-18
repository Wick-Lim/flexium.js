import type { StyleObject } from './types'
import { hash } from './runtime/hash'
import { serialize } from './runtime/serialize'
import { insert, has } from './runtime/sheet'

/**
 * Create a CSS class from a style object
 *
 * @example
 * ```tsx
 * const buttonClass = css({
 *   padding: '8px 16px',
 *   backgroundColor: 'blue',
 *   color: 'white',
 *   '&:hover': {
 *     backgroundColor: 'darkblue'
 *   }
 * })
 *
 * <button className={buttonClass}>Click me</button>
 * ```
 */
export function css(styles: StyleObject): string {
  // Generate unique hash from style object
  const key = JSON.stringify(styles)
  const className = hash(key)

  // Skip if already inserted
  if (has(className)) {
    return className
  }

  // Serialize and insert CSS
  const cssText = serialize(styles, '.' + className)
  insert(className, cssText)

  return className
}

/**
 * Combine multiple class names, filtering out falsy values
 *
 * @example
 * ```tsx
 * const className = cx(
 *   baseClass,
 *   isActive && activeClass,
 *   variant === 'primary' && primaryClass
 * )
 * ```
 */
export function cx(
  ...classes: (string | boolean | null | undefined)[]
): string {
  return classes.filter(Boolean).join(' ')
}
