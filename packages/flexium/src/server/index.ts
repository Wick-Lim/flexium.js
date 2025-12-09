import { isSignal } from '../core/signal'

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderToString(node: any): string {
  if (node === null || node === undefined || node === false) {
    return ''
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return escapeHtml(String(node))
  }

  if (Array.isArray(node)) {
    return node.map(renderToString).join('')
  }

  if (isSignal(node)) {
    return renderToString(node.value)
  }

  // Handle fragments (type === null or type === 'fragment')
  if (node.type === null || node.type === 'fragment') {
    const children = node.children || node.props?.children
    if (children) {
      return Array.isArray(children)
        ? children.map(renderToString).join('')
        : renderToString(children)
    }
    return ''
  }

  if (typeof node.type === 'function') {
    const result = node.type({ ...node.props, children: node.children })
    return renderToString(result)
  }

  if (typeof node.type === 'string') {
    const { type, props, children } = node
    let html = `<${type}`

    if (props) {
      for (const key in props) {
        const value = props[key]
        if (
          key === 'children' ||
          key.startsWith('on') ||
          value === null ||
          value === undefined ||
          value === false
        ) {
          continue
        }

        // Security: Validate attribute name to prevent injection
        // Only allow alphanumeric, hyphens, and colons
        if (!/^[a-zA-Z0-9-:]+$/.test(key)) {
          continue
        }

        if (key === 'className' || key === 'class') {
          html += ` class="${escapeHtml(value)}"`
        } else if (key === 'style' && typeof value === 'object') {
          const styleStr = Object.entries(value)
            .map(
              ([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`
            )
            .join(';')
          html += ` style="${escapeHtml(styleStr)}"`
        } else {
          html += ` ${key}="${escapeHtml(String(value))}"`
        }
      }
    }

    if (VOID_ELEMENTS.has(type)) {
      html += '/>'
    } else {
      html += '>'
      if (children) {
        html += Array.isArray(children)
          ? children.map(renderToString).join('')
          : renderToString(children)
      }
      html += `</${type}>`
    }

    return html
  }

  return ''
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
