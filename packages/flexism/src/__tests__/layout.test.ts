/**
 * Layout Tests
 */

import { describe, it, expect } from 'vitest'
import { createDocumentShell } from '../server/layout'

describe('Layout', () => {
  describe('createDocumentShell', () => {
    it('should create basic HTML document', () => {
      const html = createDocumentShell({
        content: '<div>Hello World</div>',
      })

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<div id="app"><div>Hello World</div></div>')
    })

    it('should include title when provided', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        title: 'My App',
      })

      expect(html).toContain('<title>My App</title>')
    })

    it('should set custom language', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        lang: 'ko',
      })

      expect(html).toContain('<html lang="ko">')
    })

    it('should include scripts', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        scripts: ['/app.js', '/vendor.js'],
      })

      expect(html).toContain('<script type="module" src="/app.js"></script>')
      expect(html).toContain('<script type="module" src="/vendor.js"></script>')
    })

    it('should include styles', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        styles: ['/main.css', '/theme.css'],
      })

      expect(html).toContain('<link rel="stylesheet" href="/main.css">')
      expect(html).toContain('<link rel="stylesheet" href="/theme.css">')
    })

    it('should include head content', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        head: '<meta name="description" content="Test page">',
      })

      expect(html).toContain('<meta name="description" content="Test page">')
    })

    it('should include state script', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        stateScript: '<script>window.__STATE__={}</script>',
      })

      expect(html).toContain('<script>window.__STATE__={}</script>')
    })

    it('should include body attributes', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        bodyAttrs: 'class="dark-mode"',
      })

      expect(html).toContain('<body class="dark-mode">')
    })

    it('should escape HTML in title', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        title: '<script>alert("xss")</script>',
      })

      expect(html).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;')
      expect(html).not.toContain('<script>alert("xss")</script>')
    })

    it('should escape quotes in attributes', () => {
      const html = createDocumentShell({
        content: '<div>Hello</div>',
        scripts: ['/app.js?foo="bar"'],
      })

      expect(html).toContain('src="/app.js?foo=&quot;bar&quot;"')
    })
  })
})
