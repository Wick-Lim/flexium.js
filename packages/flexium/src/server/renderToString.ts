import type { FNode, FNodeChild } from '../dom/types'
import type { SSROptions, SSRResult } from './types'
import { escapeHtml, escapeAttribute } from './escape'
import {
  enterServerRender,
  exitServerRender,
  generateHydrationId
} from './serverState'
import { runWithComponent, ComponentInstance } from '../core/hook'
import { pushContext, popContext } from '../core/context'

// Self-closing HTML tags
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

// Attributes that should be rendered as boolean
const BOOLEAN_ATTRS = new Set([
  'disabled', 'checked', 'readonly', 'required', 'hidden',
  'selected', 'autofocus', 'autoplay', 'controls', 'loop', 'muted',
  'multiple', 'open', 'defer', 'async', 'novalidate'
])

// Attributes that need special handling
const ATTR_ALIASES: Record<string, string> = {
  className: 'class',
  htmlFor: 'for'
}

/**
 * Render component tree to HTML string with hydration markers
 */
export function renderToString(
  app: FNodeChild | (() => FNodeChild),
  options: SSROptions = {}
): SSRResult {
  const { hydrate = true } = options

  enterServerRender()

  try {
    // Normalize input - wrap function in FNode if needed
    let fnode: FNodeChild
    if (typeof app === 'function' && !isFNode(app)) {
      fnode = { type: app, props: {}, children: [], key: undefined }
    } else {
      fnode = app
    }

    const html = renderNodeToString(fnode, hydrate)
    const state = exitServerRender()

    return { html, state }
  } catch (error) {
    exitServerRender()
    throw error
  }
}

/**
 * Render component tree to static HTML (no hydration markers)
 * Use for email templates, static pages, etc.
 */
export function renderToStaticMarkup(app: FNodeChild | (() => FNodeChild)): string {
  const { html } = renderToString(app, { hydrate: false })
  return html
}

function isFNode(value: any): value is FNode {
  return value && typeof value === 'object' && 'type' in value && 'props' in value
}

function renderNodeToString(fnode: FNodeChild, includeHydrationMarkers: boolean): string {
  // Null/undefined/boolean -> empty string
  if (fnode === null || fnode === undefined || typeof fnode === 'boolean') {
    return ''
  }

  // String/number -> escaped text
  if (typeof fnode === 'string' || typeof fnode === 'number') {
    return escapeHtml(String(fnode))
  }

  // Array -> concatenate children
  if (Array.isArray(fnode)) {
    return fnode.map(child => renderNodeToString(child, includeHydrationMarkers)).join('')
  }

  // Function (standalone) -> wrap in FNode and render
  if (typeof fnode === 'function') {
    const wrappedFnode: FNode = { type: fnode, props: {}, children: [], key: undefined }
    return renderComponentToString(wrappedFnode, includeHydrationMarkers)
  }

  // Object (FNode)
  if (typeof fnode === 'object' && isFNode(fnode)) {
    // HTML element
    if (typeof fnode.type === 'string') {
      return renderElementToString(fnode, includeHydrationMarkers)
    }

    // Function component
    if (typeof fnode.type === 'function') {
      return renderComponentToString(fnode, includeHydrationMarkers)
    }
  }

  return ''
}

function renderElementToString(fnode: FNode, includeHydrationMarkers: boolean): string {
  const tag = fnode.type as string
  const attrs = renderAttributes(fnode.props, includeHydrationMarkers)

  // Handle dangerouslySetInnerHTML
  if (fnode.props?.dangerouslySetInnerHTML) {
    const innerHTML = fnode.props.dangerouslySetInnerHTML.__html || ''
    return `<${tag}${attrs}>${innerHTML}</${tag}>`
  }

  // Void elements (self-closing)
  if (VOID_ELEMENTS.has(tag)) {
    return `<${tag}${attrs}>`
  }

  // Render children
  const childrenHtml = (fnode.children || [])
    .map(child => renderNodeToString(child, includeHydrationMarkers))
    .join('')

  return `<${tag}${attrs}>${childrenHtml}</${tag}>`
}

function renderAttributes(props: Record<string, any>, includeHydrationMarkers: boolean): string {
  if (!props) return ''

  const parts: string[] = []

  // Add hydration ID if needed
  if (includeHydrationMarkers) {
    const fid = generateHydrationId()
    parts.push(`data-fid="${fid}"`)
  }

  for (const [key, value] of Object.entries(props)) {
    // Skip event handlers, refs, and internal props
    if (key.startsWith('on') || key === 'ref' || key === 'key' || key === 'children') continue
    if (key === 'dangerouslySetInnerHTML') continue

    // Skip undefined/null values
    if (value === undefined || value === null) continue

    // Handle aliased attributes
    const attrName = ATTR_ALIASES[key] || key

    // Handle style object
    if (key === 'style' && typeof value === 'object') {
      const styleStr = Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${kebabCase(k)}:${v}`)
        .join(';')
      if (styleStr) {
        parts.push(`style="${escapeAttribute(styleStr)}"`)
      }
      continue
    }

    // Handle boolean attributes
    if (BOOLEAN_ATTRS.has(attrName)) {
      if (value) parts.push(attrName)
      continue
    }

    // Handle false boolean values - skip entirely
    if (value === false) continue

    // Regular attribute
    parts.push(`${attrName}="${escapeAttribute(String(value))}"`)
  }

  return parts.length ? ' ' + parts.join(' ') : ''
}

function renderComponentToString(fnode: FNode, includeHydrationMarkers: boolean): string {
  const Component = fnode.type as Function

  // Merge props with children
  const props = { ...fnode.props }
  if (fnode.children && fnode.children.length > 0) {
    props.children = fnode.children.length === 1
      ? fnode.children[0]
      : fnode.children
  }

  // Check if this is a Context Provider
  const contextId = (Component as any)._contextId
  const isProvider = contextId !== undefined
  let prevContextValue: any

  if (isProvider) {
    prevContextValue = pushContext(contextId, props.value)
  }

  // Create minimal component instance for server (hooks support)
  const instance: ComponentInstance = {
    hooks: [],
    hookIndex: 0
  }

  try {
    // Run component with hook context
    const result = runWithComponent(instance, () => Component(props))

    // Render result
    return renderNodeToString(result, includeHydrationMarkers)
  } finally {
    // Restore context if it was a provider
    if (isProvider) {
      popContext(contextId, prevContextValue)
    }
  }
}

function kebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
