import type { StyleObject, VariantConfig, StyledConfig } from './types'
import type { FNode } from '../dom/types'
import { css, cx } from './css'

// HTML element tag names
type HTMLTag = 'a' | 'abbr' | 'address' | 'area' | 'article' | 'aside' | 'audio' |
  'b' | 'base' | 'bdi' | 'bdo' | 'blockquote' | 'body' | 'br' | 'button' |
  'canvas' | 'caption' | 'cite' | 'code' | 'col' | 'colgroup' |
  'data' | 'datalist' | 'dd' | 'del' | 'details' | 'dfn' | 'dialog' | 'div' | 'dl' | 'dt' |
  'em' | 'embed' |
  'fieldset' | 'figcaption' | 'figure' | 'footer' | 'form' |
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'head' | 'header' | 'hgroup' | 'hr' | 'html' |
  'i' | 'iframe' | 'img' | 'input' | 'ins' |
  'kbd' |
  'label' | 'legend' | 'li' | 'link' |
  'main' | 'map' | 'mark' | 'menu' | 'meta' | 'meter' |
  'nav' | 'noscript' |
  'object' | 'ol' | 'optgroup' | 'option' | 'output' |
  'p' | 'picture' | 'pre' | 'progress' |
  'q' |
  'rp' | 'rt' | 'ruby' |
  's' | 'samp' | 'script' | 'search' | 'section' | 'select' | 'slot' | 'small' | 'source' | 'span' | 'strong' | 'style' | 'sub' | 'summary' | 'sup' | 'svg' |
  'table' | 'tbody' | 'td' | 'template' | 'textarea' | 'tfoot' | 'th' | 'thead' | 'time' | 'title' | 'tr' | 'track' |
  'u' | 'ul' |
  'var' | 'video' |
  'wbr'

/**
 * Create a styled component with variant support
 *
 * @example
 * ```tsx
 * const Button = styled('button', {
 *   base: {
 *     padding: '8px 16px',
 *     border: 'none',
 *     borderRadius: 4,
 *     cursor: 'pointer'
 *   },
 *   variants: {
 *     variant: {
 *       primary: { backgroundColor: 'blue', color: 'white' },
 *       secondary: { backgroundColor: 'gray', color: 'black' }
 *     },
 *     size: {
 *       sm: { padding: '4px 8px', fontSize: 12 },
 *       md: { padding: '8px 16px', fontSize: 14 },
 *       lg: { padding: '12px 24px', fontSize: 16 }
 *     }
 *   },
 *   defaultVariants: {
 *     variant: 'primary',
 *     size: 'md'
 *   }
 * })
 *
 * // Usage
 * <Button variant="secondary" size="lg">Click me</Button>
 * ```
 */
export function styled<
  T extends HTMLTag,
  V extends VariantConfig = Record<string, never>
>(
  tag: T,
  config: StyledConfig<V>
): StyledComponent<T, V> {
  const { base, variants, defaultVariants, compoundVariants } = config

  // Pre-compute base class
  const baseClass = css(base)

  // Cache for variant classes
  const variantCache = new Map<string, string>()

  // Get or create variant class
  function getVariantClass(variantName: string, variantValue: string): string {
    const cacheKey = `${variantName}:${variantValue}`
    let className = variantCache.get(cacheKey)

    if (!className && variants?.[variantName]?.[variantValue]) {
      className = css(variants[variantName][variantValue])
      variantCache.set(cacheKey, className)
    }

    return className || ''
  }

  // Compound variant cache
  const compoundCache = new Map<string, string>()

  function StyledComponent(props: StyledComponentProps<V>): FNode {
    const { children, className: userClassName, ...rest } = props as any

    // Separate variant props from element props
    const variantProps: Record<string, string> = {}
    const elementProps: Record<string, any> = {}

    for (const key in rest) {
      if (variants && key in variants) {
        variantProps[key] = rest[key] ?? (defaultVariants as any)?.[key]
      } else {
        elementProps[key] = rest[key]
      }
    }

    // Apply default variants for missing props
    if (defaultVariants) {
      for (const key in defaultVariants) {
        if (!(key in variantProps)) {
          variantProps[key] = String(defaultVariants[key as keyof typeof defaultVariants])
        }
      }
    }

    // Collect variant classes
    const variantClasses: string[] = []
    for (const [name, value] of Object.entries(variantProps)) {
      if (value) {
        const vc = getVariantClass(name, String(value))
        if (vc) variantClasses.push(vc)
      }
    }

    // Check compound variants
    if (compoundVariants) {
      for (const compound of compoundVariants) {
        const { css: compoundStyles, ...conditions } = compound

        // Check if all conditions match
        let matches = true
        for (const [key, value] of Object.entries(conditions)) {
          if (variantProps[key] !== value) {
            matches = false
            break
          }
        }

        if (matches) {
          // Generate cache key from conditions
          const cacheKey = JSON.stringify(conditions)
          let compoundClass = compoundCache.get(cacheKey)

          if (!compoundClass) {
            compoundClass = css(compoundStyles)
            compoundCache.set(cacheKey, compoundClass)
          }

          variantClasses.push(compoundClass)
        }
      }
    }

    // Combine all classes
    const finalClassName = cx(baseClass, ...variantClasses, userClassName)

    // Return FNode element
    return {
      type: tag,
      props: { ...elementProps, className: finalClassName },
      children: Array.isArray(children) ? children : children != null ? [children] : [],
      key: undefined
    }
  }

  // Mark as styled component
  StyledComponent.displayName = `Styled(${tag})`

  return StyledComponent as unknown as StyledComponent<T, V>
}

// Types
type StyledComponent<
  T extends HTMLTag,
  V extends VariantConfig
> = {
  (props: StyledComponentProps<V>): FNode
  displayName: string
}

type StyledComponentProps<V extends VariantConfig> = {
  [K in keyof V]?: keyof V[K]
} & {
  children?: any
  className?: string
  [key: string]: any
}
