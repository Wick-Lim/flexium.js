import type { KeyframeDefinition, CSSValue } from './types'
import { hash } from './runtime/hash'
import { serializeKeyframes } from './runtime/serialize'
import { insert, has } from './runtime/sheet'

/**
 * Create a keyframes animation
 *
 * @example
 * ```tsx
 * const fadeIn = keyframes({
 *   from: { opacity: 0 },
 *   to: { opacity: 1 }
 * })
 *
 * const slideIn = keyframes({
 *   '0%': { transform: 'translateX(-100%)' },
 *   '100%': { transform: 'translateX(0)' }
 * })
 *
 * const className = css({
 *   animation: `${fadeIn} 0.3s ease-in-out`
 * })
 * ```
 */
export function keyframes(definition: KeyframeDefinition): string {
  // Generate unique name from keyframe definition
  const key = JSON.stringify(definition)
  const name = hash(key)

  // Skip if already inserted
  if (has(name)) {
    return name
  }

  // Serialize and insert keyframes
  const cssText = serializeKeyframes(name, definition as Record<string, Record<string, CSSValue>>)
  insert(name, cssText)

  return name
}
