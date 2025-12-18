/**
 * StyleSheet manager
 * Uses adoptedStyleSheets for efficient style injection
 * Falls back to server-side collection when not available (SSR, jsdom)
 */

// Cache to track which styles have been inserted
let cache = new Map<string, boolean>()

// Server-side collected styles
let serverStyles: string[] = []

// Browser stylesheet (lazy initialized)
let browserSheet: CSSStyleSheet | null = null

/**
 * Check if adoptedStyleSheets is supported
 */
function supportsAdoptedStyleSheets(): boolean {
  return (
    typeof document !== 'undefined' &&
    'adoptedStyleSheets' in document &&
    typeof CSSStyleSheet !== 'undefined' &&
    'replaceSync' in CSSStyleSheet.prototype
  )
}

function getBrowserSheet(): CSSStyleSheet | null {
  if (!supportsAdoptedStyleSheets()) {
    return null
  }

  if (!browserSheet) {
    browserSheet = new CSSStyleSheet()
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, browserSheet]
  }
  return browserSheet
}

/**
 * Insert a CSS rule
 */
export function insert(hash: string, css: string): void {
  if (cache.has(hash)) {
    return
  }

  cache.set(hash, true)

  const sheet = getBrowserSheet()
  if (sheet) {
    try {
      sheet.insertRule(css, sheet.cssRules.length)
    } catch (e) {
      // Handle invalid CSS gracefully in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[flexium/css] Invalid CSS rule:', css, e)
      }
    }
  } else {
    // Server-side or unsupported environment: collect styles
    serverStyles.push(css)
  }
}

/**
 * Check if a hash is already in the cache
 */
export function has(hash: string): boolean {
  return cache.has(hash)
}

/**
 * Get all collected styles for SSR
 */
export function getStyles(): string {
  return serverStyles.join('')
}

/**
 * Get styles as a style tag for SSR
 */
export function getStyleTag(): string {
  const styles = getStyles()
  if (!styles) return ''
  return `<style data-flexium-css>${styles}</style>`
}

/**
 * Reset collected styles and cache (for SSR between requests or testing)
 */
export function resetStyles(): void {
  serverStyles = []
  cache = new Map()
  browserSheet = null
}

/**
 * Hydrate styles on the client
 * Call this after SSR to sync the cache with server-rendered styles
 */
export function hydrateStyles(): void {
  if (typeof document === 'undefined') return

  const styleTag = document.querySelector('style[data-flexium-css]')
  if (styleTag) {
    // Parse and cache existing styles
    const text = styleTag.textContent || ''
    const classRegex = /\.fx-[a-z0-9]+/g
    let match
    while ((match = classRegex.exec(text)) !== null) {
      const hash = match[0].slice(1) // Remove the dot
      cache.set(hash, true)
    }
  }
}

// Auto-hydrate on client (only if adoptedStyleSheets is supported)
if (supportsAdoptedStyleSheets()) {
  hydrateStyles()
}
