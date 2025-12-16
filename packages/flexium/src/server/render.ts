import type { FNode, FNodeChild } from '../dom'
import { escapeHtml, escapeAttribute, isValidAttributeName } from './escape'
import { createSSRContext, runWithSSRContext, type SSRContext } from './context'
import { pushContext, popContext } from '../core/context'

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

const EVENT_HANDLER_REGEX = /^on[A-Z]/

function serializeStyle(style: Record<string, any>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}:${value}`
    })
    .join(';')
}

function serializeAttributes(props: Record<string, any>): string {
  const attrs: string[] = []

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'key' || key === 'ref') continue
    if (EVENT_HANDLER_REGEX.test(key)) continue
    if (value === null || value === undefined || value === false) continue
    if (!isValidAttributeName(key)) continue

    let attrName = key
    if (key === 'className') attrName = 'class'
    if (key === 'htmlFor') attrName = 'for'

    if (value === true) {
      attrs.push(attrName)
    } else if (key === 'style' && typeof value === 'object') {
      attrs.push(`style="${escapeAttribute(serializeStyle(value))}"`)
    } else {
      attrs.push(`${attrName}="${escapeAttribute(String(value))}"`)
    }
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : ''
}

function renderNode(node: FNodeChild, ctx: SSRContext): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }

  if (typeof node === 'string') {
    return escapeHtml(node)
  }
  if (typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(child => renderNode(child, ctx)).join('')
  }

  if (typeof node === 'function') {
    return renderNode(node(), ctx)
  }

  if (typeof node === 'object' && 'type' in node) {
    const fnode = node as FNode

    if (typeof fnode.type === 'string') {
      return renderElement(fnode, ctx)
    }

    if (typeof fnode.type === 'function') {
      return renderComponent(fnode, ctx)
    }
  }

  return ''
}

function renderElement(fnode: FNode, ctx: SSRContext): string {
  const tag = fnode.type as string
  const attrs = serializeAttributes(fnode.props || {})

  if (VOID_ELEMENTS.has(tag)) {
    return `<${tag}${attrs}/>`
  }

  const children = fnode.children || []
  const childrenHtml = children.map(child => renderNode(child, ctx)).join('')

  return `<${tag}${attrs}>${childrenHtml}</${tag}>`
}

function renderComponent(fnode: FNode, ctx: SSRContext): string {
  const Component = fnode.type as Function

  const props = { ...fnode.props }
  if (fnode.children && fnode.children.length > 0) {
    props.children = fnode.children.length === 1
      ? fnode.children[0]
      : fnode.children
  }

  try {
    // Context Provider handling
    if ((Component as any)._contextId !== undefined) {
      const contextId = (Component as any)._contextId
      const prevValue = pushContext(contextId, props.value)
      const result = renderNode(props.children, ctx)
      popContext(contextId, prevValue)
      return result
    }

    const result = Component(props)
    return renderNode(result, ctx)

  } catch (error) {
    ctx.errors.push(error as Error)
    if (process.env.NODE_ENV === 'development') {
      return `<!-- SSR Error: ${escapeHtml(String(error))} -->`
    }
    return ''
  }
}

export function renderToString(node: FNode | FNodeChild): string {
  const ctx = createSSRContext()

  return runWithSSRContext(ctx, () => {
    let normalizedNode = node
    if (typeof node === 'function') {
      normalizedNode = { type: node, props: {}, children: [] } as FNode
    }

    return renderNode(normalizedNode, ctx)
  })
}

export function renderToStaticMarkup(node: FNode | FNodeChild): string {
  return renderToString(node)
}
