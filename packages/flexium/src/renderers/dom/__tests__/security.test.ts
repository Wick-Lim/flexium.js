/**
 * Security Functions Tests
 *
 * Tests for security-related functions including XSS prevention
 * through HTML attribute value escaping.
 */

import { describe, it, expect } from 'vitest'
import { escapeAttrValue } from '../index'

describe('Security Functions', () => {
  describe('escapeAttrValue', () => {
    describe('Basic character escaping', () => {
      it('should escape & to &amp;', () => {
        const result = escapeAttrValue('Tom & Jerry')
        expect(result).toBe('Tom &amp; Jerry')
      })

      it('should escape " to &quot;', () => {
        const result = escapeAttrValue('Say "hello"')
        expect(result).toBe('Say &quot;hello&quot;')
      })

      it('should escape \' to &#39;', () => {
        const result = escapeAttrValue("It's working")
        expect(result).toBe('It&#39;s working')
      })

      it('should escape < to &lt;', () => {
        const result = escapeAttrValue('a < b')
        expect(result).toBe('a &lt; b')
      })

      it('should escape > to &gt;', () => {
        const result = escapeAttrValue('a > b')
        expect(result).toBe('a &gt; b')
      })
    })

    describe('Combined dangerous characters', () => {
      it('should escape all dangerous characters together', () => {
        const result = escapeAttrValue('<script>"alert(\'xss\')"</script>')
        expect(result).toBe('&lt;script&gt;&quot;alert(&#39;xss&#39;)&quot;&lt;/script&gt;')
      })

      it('should escape multiple ampersands', () => {
        const result = escapeAttrValue('a && b && c')
        expect(result).toBe('a &amp;&amp; b &amp;&amp; c')
      })

      it('should escape mixed quotes', () => {
        const result = escapeAttrValue('He said "I\'m here"')
        expect(result).toBe('He said &quot;I&#39;m here&quot;')
      })

      it('should escape HTML tag with attributes', () => {
        const result = escapeAttrValue('<img src="x" onerror="alert(\'XSS\')">')
        expect(result).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(&#39;XSS&#39;)&quot;&gt;')
      })

      it('should escape data URI with special characters', () => {
        const result = escapeAttrValue('data:text/html,<script>alert("xss")</script>')
        expect(result).toBe('data:text/html,&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      })
    })

    describe('XSS attack prevention', () => {
      it('should escape javascript: protocol attempt', () => {
        const result = escapeAttrValue('javascript:alert("xss")')
        expect(result).toBe('javascript:alert(&quot;xss&quot;)')
      })

      it('should escape event handler injection', () => {
        const result = escapeAttrValue('" onclick="alert(\'xss\')"')
        expect(result).toBe('&quot; onclick=&quot;alert(&#39;xss&#39;)&quot;')
      })

      it('should escape attribute breakout attempt', () => {
        const result = escapeAttrValue('"><script>alert("xss")</script><"')
        expect(result).toBe('&quot;&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&lt;&quot;')
      })

      it('should escape nested HTML tags', () => {
        const result = escapeAttrValue('<div><span onclick="alert(\'xss\')">click</span></div>')
        expect(result).toBe('&lt;div&gt;&lt;span onclick=&quot;alert(&#39;xss&#39;)&quot;&gt;click&lt;/span&gt;&lt;/div&gt;')
      })

      it('should escape SVG with script', () => {
        const result = escapeAttrValue('<svg><script>alert("xss")</script></svg>')
        expect(result).toBe('&lt;svg&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&lt;/svg&gt;')
      })
    })

    describe('Edge cases', () => {
      it('should handle empty strings', () => {
        const result = escapeAttrValue('')
        expect(result).toBe('')
      })

      it('should handle strings with no special characters', () => {
        const result = escapeAttrValue('Hello World 123')
        expect(result).toBe('Hello World 123')
      })

      it('should handle strings with only special characters', () => {
        const result = escapeAttrValue('&"\'<>')
        expect(result).toBe('&amp;&quot;&#39;&lt;&gt;')
      })

      it('should handle already escaped entities', () => {
        const result = escapeAttrValue('&amp; &quot;')
        expect(result).toBe('&amp;amp; &amp;quot;')
      })

      it('should handle unicode characters with special characters', () => {
        const result = escapeAttrValue('Hello 世界 & "测试"')
        expect(result).toBe('Hello 世界 &amp; &quot;测试&quot;')
      })

      it('should handle long strings with multiple escapes', () => {
        const longString = 'a'.repeat(100) + '<script>"xss"</script>' + 'b'.repeat(100)
        const result = escapeAttrValue(longString)
        const expected = 'a'.repeat(100) + '&lt;script&gt;&quot;xss&quot;&lt;/script&gt;' + 'b'.repeat(100)
        expect(result).toBe(expected)
      })

      it('should handle newlines and tabs', () => {
        const result = escapeAttrValue('line1\nline2\tindented')
        expect(result).toBe('line1\nline2\tindented')
      })

      it('should escape consecutive special characters', () => {
        const result = escapeAttrValue('<<>>&&&"""\'\'\'')
        expect(result).toBe('&lt;&lt;&gt;&gt;&amp;&amp;&amp;&quot;&quot;&quot;&#39;&#39;&#39;')
      })
    })

    describe('Real-world scenarios', () => {
      it('should escape URL with query parameters', () => {
        const result = escapeAttrValue('https://example.com?name="John"&age=30')
        expect(result).toBe('https://example.com?name=&quot;John&quot;&amp;age=30')
      })

      it('should escape HTML entity references', () => {
        const result = escapeAttrValue('Price: 5 &euro; < 10 &pound;')
        expect(result).toBe('Price: 5 &amp;euro; &lt; 10 &amp;pound;')
      })

      it('should escape JSON-like strings', () => {
        const result = escapeAttrValue('{"name":"John","age":30}')
        expect(result).toBe('{&quot;name&quot;:&quot;John&quot;,&quot;age&quot;:30}')
      })

      it('should escape email addresses with special characters', () => {
        const result = escapeAttrValue('user+tag@example.com')
        expect(result).toBe('user+tag@example.com')
      })

      it('should escape math expressions', () => {
        const result = escapeAttrValue('if (x < 5 && y > 3)')
        expect(result).toBe('if (x &lt; 5 &amp;&amp; y &gt; 3)')
      })
    })

    describe('Escape order consistency', () => {
      it('should maintain consistent escape order for ampersands', () => {
        // Ensures ampersands are escaped first to prevent double-escaping
        const result = escapeAttrValue('&lt;')
        expect(result).toBe('&amp;lt;')
      })

      it('should handle pre-escaped ampersands correctly', () => {
        const result = escapeAttrValue('&amp;')
        expect(result).toBe('&amp;amp;')
      })
    })
  })
})
