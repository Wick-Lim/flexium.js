import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createIsolatedContainer,
  createScopedContainer,
  scopeStyles,
  createStyleSheet,
  createResetStyles,
} from '../isolation'

describe('Style Isolation', () => {
  let testContainer: HTMLElement

  beforeEach(() => {
    testContainer = document.createElement('div')
    testContainer.id = 'test-isolation-container'
    document.body.appendChild(testContainer)
  })

  afterEach(() => {
    testContainer.remove()
  })

  describe('createIsolatedContainer', () => {
    it('should create a shadow DOM container', () => {
      const { container, shadowRoot, cleanup } = createIsolatedContainer(
        testContainer,
        'test-app'
      )

      expect(shadowRoot).toBeDefined()
      expect(container.parentNode).toBe(shadowRoot)
      expect(
        testContainer.querySelector('[data-micro-app="test-app"]')
      ).toBeDefined()

      cleanup()
    })

    it('should add styles to shadow root', () => {
      const { shadowRoot, addStyles, cleanup } = createIsolatedContainer(
        testContainer,
        'style-test'
      )

      const style = addStyles('.test { color: red; }')

      expect(style.textContent).toBe('.test { color: red; }')
      expect(shadowRoot.querySelector('style')).toBe(style)

      cleanup()
    })

    it('should add stylesheet links', async () => {
      const { shadowRoot, addStylesheet, cleanup } = createIsolatedContainer(
        testContainer,
        'link-test'
      )

      // Mock stylesheet URL (won't actually load)
      const promise = addStylesheet('https://example.com/styles.css')

      const link = shadowRoot.querySelector('link')
      expect(link).toBeDefined()
      expect(link?.href).toBe('https://example.com/styles.css')

      // Trigger load event manually
      link?.dispatchEvent(new Event('load'))

      const result = await promise
      expect(result).toBe(link)

      cleanup()
    })

    it('should clean up on cleanup()', () => {
      const { cleanup } = createIsolatedContainer(testContainer, 'cleanup-test')

      expect(
        testContainer.querySelector('[data-micro-app="cleanup-test"]')
      ).toBeDefined()

      cleanup()

      expect(
        testContainer.querySelector('[data-micro-app="cleanup-test"]')
      ).toBeNull()
    })
  })

  describe('createScopedContainer', () => {
    it('should create a scoped container with scope ID', () => {
      const { container, scopeId, cleanup } = createScopedContainer(
        testContainer,
        'scoped-app'
      )

      expect(container.getAttribute('data-scope')).toBe(scopeId)
      expect(scopeId).toMatch(/^mfe-\d+$/)

      cleanup()
    })

    it('should add scoped styles', () => {
      const { scopeId, addStyles, cleanup } = createScopedContainer(
        testContainer,
        'scoped-styles'
      )

      const style = addStyles('.button { color: blue; }')

      expect(style.textContent).toContain(`[data-scope="${scopeId}"]`)
      expect(document.head.querySelector(`[data-scope="${scopeId}"]`)).toBe(
        style
      )

      cleanup()
    })

    it('should remove styles on cleanup', () => {
      const { scopeId, addStyles, cleanup } = createScopedContainer(
        testContainer,
        'cleanup-styles'
      )

      addStyles('.test { color: green; }')
      expect(
        document.head.querySelector(`[data-scope="${scopeId}"]`)
      ).toBeDefined()

      cleanup()

      expect(
        document.head.querySelector(`[data-scope="${scopeId}"]`)
      ).toBeNull()
    })
  })

  describe('scopeStyles', () => {
    it('should scope simple selectors', () => {
      const scoped = scopeStyles('.button { color: red; }', 'scope-1')

      expect(scoped).toContain('[data-scope="scope-1"] .button')
    })

    it('should scope multiple selectors', () => {
      const scoped = scopeStyles('.a, .b { color: blue; }', 'scope-2')

      expect(scoped).toContain('[data-scope="scope-2"] .a')
      expect(scoped).toContain('[data-scope="scope-2"] .b')
    })

    it('should handle :root selector', () => {
      const scoped = scopeStyles(':root { --color: red; }', 'scope-3')

      expect(scoped).toContain('[data-scope="scope-3"]')
    })

    it('should scope keyframes', () => {
      const scoped = scopeStyles(
        '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
        'scope-4'
      )

      expect(scoped).toContain('@keyframes scope-4-fadeIn')
    })

    it('should update animation references', () => {
      const scoped = scopeStyles(
        '.element { animation: fadeIn 1s; }',
        'scope-5'
      )

      expect(scoped).toContain('animation: scope-5-fadeIn')
    })
  })

  describe('createStyleSheet', () => {
    it('should create CSS with scoping', () => {
      const sheet = createStyleSheet('sheet-scope')

      const css = sheet.css`.button { padding: 10px; }`

      expect(css).toContain('[data-scope="sheet-scope"]')
      expect(css).toContain('.button')
    })

    it('should create keyframes with unique names', () => {
      const sheet = createStyleSheet('kf-scope')

      const animationName = sheet.keyframes`
        from { opacity: 0; }
        to { opacity: 1; }
      `

      expect(animationName).toContain('kf-scope-kf-')
    })

    it('should inject global styles', () => {
      const sheet = createStyleSheet('global-scope')

      sheet.injectGlobal('body { margin: 0; }')

      const styles = Array.from(document.head.querySelectorAll('style'))
      const globalStyle = styles.find((s) =>
        s.textContent?.includes('body { margin: 0; }')
      )

      expect(globalStyle).toBeDefined()

      globalStyle?.remove()
    })
  })

  describe('createResetStyles', () => {
    it('should return reset CSS string', () => {
      const reset = createResetStyles()

      expect(reset).toContain('box-sizing: border-box')
      expect(reset).toContain(':host')
      expect(reset).toContain('all: initial')
    })
  })
})
