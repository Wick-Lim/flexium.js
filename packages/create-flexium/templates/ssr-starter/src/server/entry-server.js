import { h } from 'flexium'
import { App } from '../client/App.js'

export function render(url) {
  // Create app instance
  const app = App()

  // Convert DOM node to HTML string
  function nodeToString(node) {
    if (typeof node === 'string' || typeof node === 'number') {
      return escapeHtml(String(node))
    }

    if (!node || !node.tagName) {
      return ''
    }

    const { tagName, props = {}, children = [] } = node
    const attrs = Object.entries(props)
      .filter(([key]) => key !== 'children' && !key.startsWith('on'))
      .map(([key, value]) => {
        if (key === 'class') return `class="${escapeHtml(value)}"`
        if (key === 'style' && typeof value === 'object') {
          const styleStr = Object.entries(value)
            .map(([k, v]) => `${k}:${v}`)
            .join(';')
          return `style="${escapeHtml(styleStr)}"`
        }
        return `${key}="${escapeHtml(String(value))}"`
      })
      .join(' ')

    const attrsStr = attrs ? ' ' + attrs : ''
    const childrenStr = children.map(nodeToString).join('')

    // Self-closing tags
    const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link']
    if (selfClosing.includes(tagName)) {
      return `<${tagName}${attrsStr} />`
    }

    return `<${tagName}${attrsStr}>${childrenStr}</${tagName}>`
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // Render app to string
  return nodeToString(app)
}
