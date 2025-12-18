/**
 * Flexium CSS - Zero-runtime CSS-in-JS
 *
 * Features:
 * - css() - Create CSS classes from style objects
 * - styled() - Create styled components with variants
 * - keyframes() - Define CSS animations
 *
 * @example
 * ```tsx
 * import { css, styled, keyframes } from 'flexium/css'
 *
 * // Simple class
 * const btn = css({ padding: 8, color: 'blue' })
 *
 * // Styled component with variants
 * const Button = styled('button', {
 *   base: { padding: 8 },
 *   variants: {
 *     size: { sm: { padding: 4 }, lg: { padding: 16 } }
 *   }
 * })
 *
 * // Animation
 * const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
 * ```
 *
 * @packageDocumentation
 */

// Core API
export { css, cx } from './css'
export { styled } from './styled'
export { keyframes } from './keyframes'

// SSR utilities
export {
  getStyles,
  getStyleTag,
  resetStyles,
  hydrateStyles
} from './runtime/sheet'

// Types
export type {
  StyleObject,
  CSSProperties,
  CSSValue,
  KeyframeDefinition,
  VariantConfig,
  StyledConfig,
  DefaultVariants,
  StyledProps
} from './types'
