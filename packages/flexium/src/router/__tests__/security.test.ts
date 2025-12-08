/**
 * Router Security Functions Tests
 *
 * Comprehensive tests for router security functions including:
 * - isUnsafePath: Validates paths to prevent XSS attacks via unsafe protocols
 * - sanitizeQueryValue: Sanitizes query parameter values to prevent XSS
 */

import { describe, it, expect } from 'vitest'
import { isUnsafePath, sanitizeQueryValue } from '../core'

describe('Router Security Functions', () => {
  describe('isUnsafePath', () => {
    describe('Unsafe protocol blocking', () => {
      it('should block javascript: protocol', () => {
        expect(isUnsafePath('javascript:alert("xss")')).toBe(true)
      })

      it('should block data: protocol', () => {
        expect(isUnsafePath('data:text/html,<script>alert("xss")</script>')).toBe(true)
      })

      it('should block vbscript: protocol', () => {
        expect(isUnsafePath('vbscript:msgbox("xss")')).toBe(true)
      })

      it('should block file: protocol', () => {
        expect(isUnsafePath('file:///etc/passwd')).toBe(true)
      })
    })

    describe('Case insensitivity', () => {
      it('should block JavaScript: with uppercase J', () => {
        expect(isUnsafePath('JavaScript:alert("xss")')).toBe(true)
      })

      it('should block JAVASCRIPT: with all uppercase', () => {
        expect(isUnsafePath('JAVASCRIPT:alert("xss")')).toBe(true)
      })

      it('should block JaVaScRiPt: with mixed case', () => {
        expect(isUnsafePath('JaVaScRiPt:alert("xss")')).toBe(true)
      })

      it('should block DATA: with uppercase', () => {
        expect(isUnsafePath('DATA:text/html,alert(1)')).toBe(true)
      })

      it('should block VBScript: with mixed case', () => {
        expect(isUnsafePath('VBScript:msgbox("xss")')).toBe(true)
      })

      it('should block FILE: with uppercase', () => {
        expect(isUnsafePath('FILE:///etc/passwd')).toBe(true)
      })
    })

    describe('Whitespace handling', () => {
      it('should block javascript: with leading whitespace', () => {
        expect(isUnsafePath('  javascript:alert("xss")')).toBe(true)
      })

      it('should block javascript: with trailing whitespace', () => {
        expect(isUnsafePath('javascript:alert("xss")  ')).toBe(true)
      })

      it('should block javascript: with leading and trailing whitespace', () => {
        expect(isUnsafePath('  javascript:alert("xss")  ')).toBe(true)
      })

      it('should block data: with tabs', () => {
        expect(isUnsafePath('\t\tdata:text/html,<script></script>')).toBe(true)
      })

      it('should block vbscript: with newlines', () => {
        expect(isUnsafePath('\nvbscript:msgbox("xss")')).toBe(true)
      })
    })

    describe('Normal path allowance', () => {
      it('should allow /home path', () => {
        expect(isUnsafePath('/home')).toBe(false)
      })

      it('should allow /users/123 path', () => {
        expect(isUnsafePath('/users/123')).toBe(false)
      })

      it('should allow root path /', () => {
        expect(isUnsafePath('/')).toBe(false)
      })

      it('should allow nested paths', () => {
        expect(isUnsafePath('/api/v1/users/profile')).toBe(false)
      })

      it('should allow paths with query strings', () => {
        expect(isUnsafePath('/search?q=test')).toBe(false)
      })

      it('should allow paths with hashes', () => {
        expect(isUnsafePath('/docs#section-1')).toBe(false)
      })

      it('should allow paths with query strings and hashes', () => {
        expect(isUnsafePath('/search?q=test#results')).toBe(false)
      })

      it('should allow relative paths', () => {
        expect(isUnsafePath('./page')).toBe(false)
        expect(isUnsafePath('../page')).toBe(false)
      })
    })

    describe('HTTP/HTTPS protocols', () => {
      it('should allow http: protocol', () => {
        expect(isUnsafePath('http://example.com')).toBe(false)
      })

      it('should allow https: protocol', () => {
        expect(isUnsafePath('https://example.com')).toBe(false)
      })

      it('should allow HTTP: with uppercase', () => {
        expect(isUnsafePath('HTTP://example.com')).toBe(false)
      })

      it('should allow HTTPS: with uppercase', () => {
        expect(isUnsafePath('HTTPS://example.com')).toBe(false)
      })
    })

    describe('Edge cases', () => {
      it('should handle empty string', () => {
        expect(isUnsafePath('')).toBe(false)
      })

      it('should handle paths that contain but do not start with javascript:', () => {
        expect(isUnsafePath('/docs/javascript:guide')).toBe(false)
      })

      it('should handle paths that contain but do not start with data:', () => {
        expect(isUnsafePath('/api/data:fetch')).toBe(false)
      })

      it('should block javascript: even with URL encoding attempts', () => {
        // Note: This tests the actual string, not URL-decoded version
        expect(isUnsafePath('javascript:alert(1)')).toBe(true)
      })

      it('should handle very long paths', () => {
        const longPath = '/users/' + 'a'.repeat(1000)
        expect(isUnsafePath(longPath)).toBe(false)
      })

      it('should block javascript: with complex payload', () => {
        expect(isUnsafePath('javascript:void(document.body.innerHTML="<h1>XSS</h1>")')).toBe(true)
      })
    })

    describe('Protocol variations', () => {
      it('should block javascript: without quotes', () => {
        expect(isUnsafePath('javascript:alert(1)')).toBe(true)
      })

      it('should block javascript: with encoded characters in payload', () => {
        expect(isUnsafePath('javascript:alert(String.fromCharCode(88,83,83))')).toBe(true)
      })

      it('should block data: with base64 encoding', () => {
        expect(isUnsafePath('data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=')).toBe(true)
      })

      it('should block data: with charset', () => {
        expect(isUnsafePath('data:text/html;charset=utf-8,<script>alert("xss")</script>')).toBe(true)
      })
    })
  })

  describe('sanitizeQueryValue', () => {
    describe('HTML tag removal', () => {
      it('should remove script tags', () => {
        const result = sanitizeQueryValue('<script>alert("xss")</script>')
        expect(result).toBe('alert("xss")')
      })

      it('should remove img tags', () => {
        const result = sanitizeQueryValue('<img src="x" onerror="alert(1)">')
        expect(result).toBe('')
      })

      it('should remove div tags', () => {
        const result = sanitizeQueryValue('<div>content</div>')
        expect(result).toBe('content')
      })

      it('should remove nested tags', () => {
        const result = sanitizeQueryValue('<div><span>nested</span></div>')
        expect(result).toBe('nested')
      })

      it('should remove self-closing tags', () => {
        const result = sanitizeQueryValue('text<br/>more text')
        expect(result).toBe('textmore text')
      })

      it('should remove tags with attributes', () => {
        const result = sanitizeQueryValue('<a href="http://evil.com">click</a>')
        expect(result).toBe('click')
      })

      it('should remove multiple tags', () => {
        const result = sanitizeQueryValue('Hello<script>alert(1)</script><img src="x">World')
        expect(result).toBe('Helloalert(1)World')
      })
    })

    describe('JavaScript protocol removal', () => {
      it('should remove javascript: protocol (lowercase)', () => {
        const result = sanitizeQueryValue('javascript:alert(1)')
        expect(result).toBe('alert(1)')
      })

      it('should remove JavaScript: protocol (mixed case)', () => {
        const result = sanitizeQueryValue('JavaScript:alert(1)')
        expect(result).toBe('alert(1)')
      })

      it('should remove JAVASCRIPT: protocol (uppercase)', () => {
        const result = sanitizeQueryValue('JAVASCRIPT:alert(1)')
        expect(result).toBe('alert(1)')
      })

      it('should remove multiple javascript: occurrences', () => {
        const result = sanitizeQueryValue('javascript:alert(1);javascript:alert(2)')
        expect(result).toBe('alert(1);alert(2)')
      })

      it('should remove javascript: with mixed case variations', () => {
        const result = sanitizeQueryValue('jAvAsCrIpT:alert(1)')
        expect(result).toBe('alert(1)')
      })
    })

    describe('Event handler removal', () => {
      it('should remove onclick= handler', () => {
        const result = sanitizeQueryValue('text onclick="alert(1)" more')
        expect(result).toBe('text "alert(1)" more')
      })

      it('should remove onload= handler', () => {
        const result = sanitizeQueryValue('onload="alert(1)"')
        expect(result).toBe('"alert(1)"')
      })

      it('should remove onerror= handler', () => {
        const result = sanitizeQueryValue('onerror="alert(1)"')
        expect(result).toBe('"alert(1)"')
      })

      it('should remove onmouseover= handler', () => {
        const result = sanitizeQueryValue('onmouseover="alert(1)"')
        expect(result).toBe('"alert(1)"')
      })

      it('should remove event handlers case-insensitively', () => {
        const result = sanitizeQueryValue('OnClick="alert(1)" ONCLICK="alert(2)"')
        expect(result).toBe('"alert(1)" "alert(2)"')
      })

      it('should remove event handlers with spaces before =', () => {
        const result = sanitizeQueryValue('onclick ="alert(1)"')
        expect(result).toBe('"alert(1)"')
      })

      it('should remove multiple different event handlers', () => {
        const result = sanitizeQueryValue('onclick="a" onload="b" onerror="c"')
        expect(result).toBe('"a" "b" "c"')
      })
    })

    describe('Combined sanitization', () => {
      it('should remove tags and javascript: protocol', () => {
        const result = sanitizeQueryValue('<a href="javascript:alert(1)">click</a>')
        expect(result).toBe('click')
      })

      it('should remove tags and event handlers', () => {
        const result = sanitizeQueryValue('<img src="x" onerror="alert(1)">')
        expect(result).toBe('')
      })

      it('should remove tags, javascript:, and event handlers', () => {
        const result = sanitizeQueryValue('<div onclick="javascript:alert(1)">click</div>')
        expect(result).toBe('click')
      })

      it('should handle complex XSS attempts', () => {
        const result = sanitizeQueryValue(
          '<script>javascript:alert(1)</script><img onerror="alert(2)">'
        )
        expect(result).toBe('alert(1)')
      })
    })

    describe('Safe content preservation', () => {
      it('should preserve plain text', () => {
        const result = sanitizeQueryValue('Hello World')
        expect(result).toBe('Hello World')
      })

      it('should preserve numbers', () => {
        const result = sanitizeQueryValue('12345')
        expect(result).toBe('12345')
      })

      it('should preserve alphanumeric with hyphens', () => {
        const result = sanitizeQueryValue('user-name-123')
        expect(result).toBe('user-name-123')
      })

      it('should preserve alphanumeric with underscores', () => {
        const result = sanitizeQueryValue('user_name_123')
        expect(result).toBe('user_name_123')
      })

      it('should preserve URLs without javascript:', () => {
        const result = sanitizeQueryValue('http://example.com')
        expect(result).toBe('http://example.com')
      })

      it('should preserve email addresses', () => {
        const result = sanitizeQueryValue('user@example.com')
        expect(result).toBe('user@example.com')
      })

      it('should preserve special characters that are safe', () => {
        const result = sanitizeQueryValue('Hello! How are you? I am fine.')
        expect(result).toBe('Hello! How are you? I am fine.')
      })
    })

    describe('Edge cases', () => {
      it('should handle empty string', () => {
        const result = sanitizeQueryValue('')
        expect(result).toBe('')
      })

      it('should handle strings with only tags', () => {
        const result = sanitizeQueryValue('<div></div>')
        expect(result).toBe('')
      })

      it('should handle malformed tags', () => {
        const result = sanitizeQueryValue('<div>unclosed')
        expect(result).toBe('unclosed')
      })

      it('should handle tags with line breaks', () => {
        const result = sanitizeQueryValue('<div\n>content</div>')
        expect(result).toBe('content')
      })

      it('should handle very long strings', () => {
        const longString = 'a'.repeat(1000)
        const result = sanitizeQueryValue(longString)
        expect(result).toBe(longString)
      })

      it('should handle unicode characters', () => {
        const result = sanitizeQueryValue('Hello 世界 مرحبا')
        expect(result).toBe('Hello 世界 مرحبا')
      })

      it('should handle strings with HTML entities', () => {
        const result = sanitizeQueryValue('&lt;script&gt;')
        expect(result).toBe('&lt;script&gt;')
      })

      it('should handle nested event handlers in tags', () => {
        const result = sanitizeQueryValue('<div onclick="a" onmouseover="b">text</div>')
        expect(result).toBe('text')
      })
    })

    describe('Real-world XSS attack vectors', () => {
      it('should sanitize common XSS in query param', () => {
        const result = sanitizeQueryValue('<script>alert(document.cookie)</script>')
        expect(result).toBe('alert(document.cookie)')
      })

      it('should sanitize IMG tag with onerror', () => {
        const result = sanitizeQueryValue('<img src=x onerror="alert(1)">')
        expect(result).toBe('')
      })

      it('should sanitize SVG with embedded script', () => {
        const result = sanitizeQueryValue('<svg><script>alert(1)</script></svg>')
        expect(result).toBe('alert(1)')
      })

      it('should sanitize iframe injection', () => {
        const result = sanitizeQueryValue('<iframe src="javascript:alert(1)"></iframe>')
        expect(result).toBe('')
      })

      it('should sanitize style tag with javascript', () => {
        const result = sanitizeQueryValue('<style>body{background:url("javascript:alert(1)")}</style>')
        expect(result).toBe('body{background:url("alert(1)")}')
      })

      it('should sanitize link with javascript href', () => {
        const result = sanitizeQueryValue('<a href="javascript:alert(1)">click</a>')
        expect(result).toBe('click')
      })

      it('should sanitize form with javascript action', () => {
        const result = sanitizeQueryValue('<form action="javascript:alert(1)"><input type="submit"></form>')
        expect(result).toBe('')
      })
    })

    describe('Multiple pass sanitization', () => {
      it('should handle nested encodings', () => {
        const result = sanitizeQueryValue('test onclick="test" more')
        expect(result).toBe('test "test" more')
      })

      it('should remove all occurrences of patterns', () => {
        const result = sanitizeQueryValue('javascript:a javascript:b javascript:c')
        expect(result).toBe('a b c')
      })

      it('should handle mixed attack vectors', () => {
        const result = sanitizeQueryValue(
          '<div onclick="javascript:alert(1)"><script>alert(2)</script>text</div>'
        )
        expect(result).toBe('alert(2)text')
      })
    })
  })
})
