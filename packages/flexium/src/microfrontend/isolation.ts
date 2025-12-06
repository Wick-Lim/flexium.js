/**
 * Style Isolation
 *
 * Provides style encapsulation for micro frontends using Shadow DOM
 * and CSS scoping techniques
 */

import type { StyleIsolationConfig } from './types'

/** Default isolation configuration */
const defaultConfig: StyleIsolationConfig = {
  shadowDOM: true,
  scopePrefix: 'mfe',
  inheritStyles: false,
  externalStyles: [],
}

/** Counter for generating unique scope IDs */
let scopeCounter = 0

/** Cache for scoped stylesheets */
const scopedStyleCache = new Map<string, string>()

/**
 * Generate a unique scope ID
 */
function generateScopeId(prefix: string = 'mfe'): string {
  return `${prefix}-${++scopeCounter}`
}

/**
 * Create an isolated container using Shadow DOM
 */
export function createIsolatedContainer(
  parent: HTMLElement,
  appName: string,
  config: Partial<StyleIsolationConfig> = {}
): {
  container: HTMLElement
  shadowRoot: ShadowRoot
  addStyles: (css: string) => HTMLStyleElement
  addStylesheet: (url: string) => Promise<HTMLLinkElement>
  cleanup: () => void
} {
  const fullConfig = { ...defaultConfig, ...config }

  // Create host element
  const host = document.createElement('div')
  host.setAttribute('data-micro-app', appName)
  host.setAttribute('data-isolated', 'true')
  parent.appendChild(host)

  // Attach shadow root
  const shadowRoot = host.attachShadow({ mode: 'open' })

  // Create container inside shadow
  const container = document.createElement('div')
  container.setAttribute('data-shadow-container', appName)
  container.style.display = 'contents'
  shadowRoot.appendChild(container)

  // Inherit styles if configured
  if (fullConfig.inheritStyles) {
    inheritParentStyles(shadowRoot)
  }

  // Load external stylesheets
  const loadedStylesheets: HTMLLinkElement[] = []
  if (fullConfig.externalStyles?.length) {
    for (const url of fullConfig.externalStyles) {
      addStylesheet(url).then((link) => loadedStylesheets.push(link))
    }
  }

  // Add styles helper
  function addStyles(css: string): HTMLStyleElement {
    const style = document.createElement('style')
    style.textContent = css
    shadowRoot.insertBefore(style, container)
    return style
  }

  // Add stylesheet helper
  async function addStylesheet(url: string): Promise<HTMLLinkElement> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.onload = () => resolve(link)
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`))
      shadowRoot.insertBefore(link, container)
    })
  }

  // Cleanup function
  function cleanup(): void {
    host.remove()
  }

  return {
    container,
    shadowRoot,
    addStyles,
    addStylesheet,
    cleanup,
  }
}

/**
 * Inherit styles from parent document into shadow root
 */
function inheritParentStyles(shadowRoot: ShadowRoot): void {
  // Copy document stylesheets
  const sheets = Array.from(document.styleSheets)
  for (const sheet of sheets) {
    try {
      if (sheet.href) {
        // External stylesheet - add link
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        shadowRoot.appendChild(link)
      } else if (sheet.cssRules) {
        // Inline styles - copy rules
        const style = document.createElement('style')
        let css = ''
        const rules = Array.from(sheet.cssRules)
        for (const rule of rules) {
          css += rule.cssText + '\n'
        }
        style.textContent = css
        shadowRoot.appendChild(style)
      }
    } catch (e) {
      // Skip cross-origin stylesheets
      console.warn('Could not inherit stylesheet:', e)
    }
  }
}

/**
 * Create a scoped style container (CSS scoping without Shadow DOM)
 */
export function createScopedContainer(
  parent: HTMLElement,
  appName: string,
  config: Partial<StyleIsolationConfig> = {}
): {
  container: HTMLElement
  scopeId: string
  addStyles: (css: string) => HTMLStyleElement
  cleanup: () => void
} {
  const fullConfig = { ...defaultConfig, ...config }
  const scopeId = generateScopeId(fullConfig.scopePrefix)

  // Create container with scope attribute
  const container = document.createElement('div')
  container.setAttribute('data-micro-app', appName)
  container.setAttribute('data-scope', scopeId)
  parent.appendChild(container)

  // Track added styles for cleanup
  const addedStyles: HTMLStyleElement[] = []

  // Add scoped styles
  function addStyles(css: string): HTMLStyleElement {
    const scopedCss = scopeStyles(css, scopeId)
    const style = document.createElement('style')
    style.setAttribute('data-scope', scopeId)
    style.textContent = scopedCss
    document.head.appendChild(style)
    addedStyles.push(style)
    return style
  }

  // Cleanup function
  function cleanup(): void {
    for (const style of addedStyles) {
      style.remove()
    }
    container.remove()
  }

  return {
    container,
    scopeId,
    addStyles,
    cleanup,
  }
}

/**
 * Scope CSS rules to a specific container
 */
export function scopeStyles(css: string, scopeId: string): string {
  // Check cache
  const cacheKey = `${scopeId}:${css}`
  if (scopedStyleCache.has(cacheKey)) {
    return scopedStyleCache.get(cacheKey)!
  }

  // Parse and scope CSS
  const scopedCss = css
    // Handle @keyframes (don't scope animation names inside)
    .replace(/@keyframes\s+([^\s{]+)/g, `@keyframes ${scopeId}-$1`)
    // Handle animation references
    .replace(/animation(-name)?\s*:\s*([^;}\s]+)/g, (match, prop, name) => {
      if (name === 'none' || name === 'inherit' || name === 'initial') {
        return match
      }
      return `animation${prop || ''}: ${scopeId}-${name}`
    })
    // Scope selectors
    .replace(
      /([^{}@]+)(\{[^{}]*\})/g,
      (match, selectors: string, block: string) => {
        // Don't scope @-rules (handled separately)
        if (selectors.trim().startsWith('@')) {
          return match
        }

        // Scope each selector
        const scopedSelectors = selectors
          .split(',')
          .map((selector: string) => {
            selector = selector.trim()
            if (!selector) return ''

            // Don't scope :root, :host, html, body
            if (/^(:root|:host|html|body)\b/.test(selector)) {
              return selector.replace(/^(:root|:host|html|body)/, `[data-scope="${scopeId}"]`)
            }

            // Scope the selector
            return `[data-scope="${scopeId}"] ${selector}`
          })
          .filter(Boolean)
          .join(', ')

        return scopedSelectors + block
      }
    )

  scopedStyleCache.set(cacheKey, scopedCss)
  return scopedCss
}

/**
 * Create a CSS-in-JS style helper with automatic scoping
 */
export function createStyleSheet(scopeId?: string): {
  css: (strings: TemplateStringsArray, ...values: unknown[]) => string
  keyframes: (strings: TemplateStringsArray, ...values: unknown[]) => string
  injectGlobal: (css: string) => void
} {
  const scope = scopeId ?? generateScopeId()

  return {
    css: (strings: TemplateStringsArray, ...values: unknown[]): string => {
      const css = strings.reduce(
        (acc, str, i) => acc + str + (values[i] ?? ''),
        ''
      )
      return scopeStyles(css, scope)
    },

    keyframes: (strings: TemplateStringsArray, ...values: unknown[]): string => {
      const css = strings.reduce(
        (acc, str, i) => acc + str + (values[i] ?? ''),
        ''
      )
      const name = `${scope}-kf-${Math.random().toString(36).substr(2, 6)}`
      const style = document.createElement('style')
      style.textContent = `@keyframes ${name} { ${css} }`
      document.head.appendChild(style)
      return name
    },

    injectGlobal: (css: string): void => {
      const style = document.createElement('style')
      style.textContent = css
      document.head.appendChild(style)
    },
  }
}

/**
 * Create a style isolation boundary component wrapper
 */
export function withStyleIsolation<Props = Record<string, unknown>>(
  renderFn: (container: HTMLElement, props: Props) => void | (() => void),
  config: Partial<StyleIsolationConfig> = {}
): (container: HTMLElement, props: Props & { appName?: string }) => () => void {
  return (container: HTMLElement, props: Props & { appName?: string }) => {
    const appName = props.appName ?? 'isolated-app'

    const fullConfig = { ...defaultConfig, ...config }
    let cleanup: (() => void) | undefined
    let innerCleanup: (() => void) | void

    if (fullConfig.shadowDOM) {
      const isolated = createIsolatedContainer(container, appName, fullConfig)
      innerCleanup = renderFn(isolated.container, props)
      cleanup = () => {
        if (typeof innerCleanup === 'function') innerCleanup()
        isolated.cleanup()
      }
    } else {
      const scoped = createScopedContainer(container, appName, fullConfig)
      innerCleanup = renderFn(scoped.container, props)
      cleanup = () => {
        if (typeof innerCleanup === 'function') innerCleanup()
        scoped.cleanup()
      }
    }

    return cleanup
  }
}

/**
 * Load CSS as a module (for dynamic CSS loading)
 */
export async function loadCSSModule(url: string): Promise<CSSStyleSheet> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load CSS: ${url}`)
  }

  const cssText = await response.text()

  // Use constructable stylesheets if available
  if ('CSSStyleSheet' in window && 'replace' in CSSStyleSheet.prototype) {
    const sheet = new CSSStyleSheet()
    await sheet.replace(cssText)
    return sheet
  }

  // Fallback: create a stylesheet from a style element
  const style = document.createElement('style')
  style.textContent = cssText
  document.head.appendChild(style)

  const sheet = style.sheet!
  style.remove()

  return sheet as CSSStyleSheet
}

/**
 * Apply constructable stylesheet to shadow root
 */
export function adoptStyles(
  shadowRoot: ShadowRoot,
  ...sheets: CSSStyleSheet[]
): void {
  // Check for adoptedStyleSheets support
  const hasAdoptedStyleSheets = 'adoptedStyleSheets' in shadowRoot &&
    typeof (shadowRoot as ShadowRoot & { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets !== 'undefined'

  if (hasAdoptedStyleSheets) {
    shadowRoot.adoptedStyleSheets = [
      ...shadowRoot.adoptedStyleSheets,
      ...sheets,
    ]
  } else {
    // Fallback for browsers without adoptedStyleSheets
    for (const sheet of sheets) {
      const style = document.createElement('style')
      try {
        let css = ''
        const rules = sheet.cssRules ? Array.from(sheet.cssRules) : []
        for (const rule of rules) {
          css += rule.cssText + '\n'
        }
        style.textContent = css
        shadowRoot.appendChild(style)
      } catch (e) {
        console.warn('Could not adopt stylesheet:', e)
      }
    }
  }
}

/**
 * Reset styles within a container (CSS reset for isolation)
 */
export function createResetStyles(): string {
  return `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    :host {
      all: initial;
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: inherit;
    }

    h1, h2, h3, h4, h5, h6, p, ul, ol {
      margin: 0;
      padding: 0;
    }

    ul, ol {
      list-style: none;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    button, input, select, textarea {
      font: inherit;
      color: inherit;
    }

    img, video {
      max-width: 100%;
      height: auto;
    }
  `
}
