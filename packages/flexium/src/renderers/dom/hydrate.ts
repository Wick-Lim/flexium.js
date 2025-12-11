import { isSignal } from '../../core/state'
import { effect } from '../../core/effect'

/**
 * SVG Attribute Case Mapping
 * React-like camelCase to SVG case-sensitive attributes
 */
const SVG_ATTR_MAP: Record<string, string> = {
  viewBox: 'viewBox',
  preserveAspectRatio: 'preserveAspectRatio',
  strokeWidth: 'stroke-width',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  fillOpacity: 'fill-opacity',
  strokeOpacity: 'stroke-opacity',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  clipPath: 'clip-path',
  markerEnd: 'marker-end',
  markerStart: 'marker-start',
  markerMid: 'marker-mid',
}

/**
 * Hydration options
 */
export interface HydrateOptions {
  /** Called when hydration encounters a mismatch */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMismatch?: (message: string, domNode: Node | null, vnode: any) => void
  /** Whether to recover from mismatches by re-rendering */
  recoverMismatch?: boolean
}

/**
 * Hydrate server-rendered HTML with client-side interactivity
 *
 * This function walks the existing DOM tree and attaches event handlers,
 * sets up signal bindings, and validates that the DOM matches the expected vnode structure.
 *
 * @param vnode - Virtual node to hydrate against
 * @param container - Container element with server-rendered HTML
 * @param options - Hydration options
 *
 * @example
 * ```tsx
 * // Server rendered HTML in #app
 * hydrate(<App />, document.getElementById('app'));
 * ```
 */
export function hydrate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vnode: any,
  container: Element,
  options: HydrateOptions = {}
) {
  const { onMismatch, recoverMismatch = false } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMismatch = (message: string, domNode: Node | null, vn: any) => {
    if (onMismatch) {
      onMismatch(message, domNode, vn)
    } else if (typeof __DEV__ !== 'undefined' ? __DEV__ : false) {
      console.warn(`[Flexium Hydration] ${message}`)
    }
  }

  hydrateNode(vnode, container.firstChild as Node, {
    handleMismatch,
    recoverMismatch,
  })
}

interface HydrateContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleMismatch: (message: string, domNode: Node | null, vnode: any) => void
  recoverMismatch: boolean
}

function hydrateNode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vnode: any,
  domNode: Node | null,
  ctx: HydrateContext
): Node | null {
  if (vnode === null || vnode === undefined || vnode === false) {
    return domNode
  }

  if (!domNode) {
    ctx.handleMismatch('No DOM node found for vnode', domNode, vnode)
    return null
  }

  // Handle text/number primitives
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const text = String(vnode)
      if (domNode.textContent !== text) {
        ctx.handleMismatch(
          `Text mismatch: "${domNode.textContent}" vs "${text}"`,
          domNode,
          vnode
        )
        domNode.textContent = text
      }
      return domNode.nextSibling
    } else {
      ctx.handleMismatch(
        `Expected text node, got ${domNode.nodeType}`,
        domNode,
        vnode
      )
      return domNode.nextSibling
    }
  }

  // Handle signals - create reactive binding
  if (isSignal(vnode)) {
    if (domNode.nodeType === Node.TEXT_NODE) {
      effect(() => {
        domNode.textContent = String((vnode as any)())
      })
      return domNode.nextSibling
    }
  }

  // Handle computed values
  if (typeof vnode === 'function') {
    // Create reactive binding for computed/derived values
    effect(() => {
      const value = vnode()
      if (domNode.nodeType === Node.TEXT_NODE) {
        domNode.textContent = String(value)
      }
    })
    return domNode.nextSibling
  }

  // Handle function components
  if (typeof vnode.type === 'function') {
    const result = vnode.type({ ...vnode.props, children: vnode.children })
    return hydrateNode(result, domNode, ctx)
  }

  // Handle fragments
  if (vnode.type === 'fragment' || vnode.type === null) {
    let currentNode: Node | null = domNode
    const children = vnode.children || []
    for (const child of children) {
      currentNode = hydrateNode(child, currentNode, ctx)
    }
    return currentNode
  }

  // Handle element vnodes
  if (typeof vnode.type === 'string') {
    if (domNode.nodeType !== Node.ELEMENT_NODE) {
      ctx.handleMismatch(
        `Expected element node, got ${domNode.nodeType}`,
        domNode,
        vnode
      )
      return domNode.nextSibling
    }

    const el = domNode as Element
    const tagName = el.tagName.toLowerCase()

    if (tagName !== vnode.type.toLowerCase()) {
      ctx.handleMismatch(
        `Tag mismatch: "${tagName}" vs "${vnode.type}"`,
        domNode,
        vnode
      )
      return domNode.nextSibling
    }

    // Hydrate props
    if (vnode.props) {
      hydrateProps(el, vnode.props, ctx)
    }

    // Hydrate children
    let childDom = el.firstChild
    if (vnode.children) {
      const children = Array.isArray(vnode.children)
        ? vnode.children.flat()
        : [vnode.children]
      for (const child of children) {
        if (child === null || child === undefined || child === false) continue
        childDom = hydrateNode(child, childDom, ctx) as ChildNode | null
      }
    }

    return el.nextSibling
  }

  return domNode?.nextSibling || null
}

/**
 * Hydrate element props - attach events, set up reactive bindings
 */
function hydrateProps(
  el: Element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>,
  ctx: HydrateContext
): void {
  for (const key in props) {
    const value = props[key]

    if (key === 'children' || key === 'key' || key === 'ref') {
      // Handle ref callback
      if (key === 'ref' && typeof value === 'function') {
        value(el)
      }
      continue
    }

    // Event handlers
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, value)
      continue
    }

    // Reactive props (signals)
    if (isSignal(value)) {
      const propName = key === 'className' ? 'class' : key
      effect(() => {
        const val = (value as any)()
        if (propName === 'class') {
          el.setAttribute('class', String(val))
        } else if (propName === 'style' && typeof val === 'object') {
          Object.assign((el as HTMLElement).style, val)
        } else {
          // Handle SVG attributes
          const attrName = SVG_ATTR_MAP[propName] || propName

          if (propName in el && !(el instanceof SVGElement)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ; (el as any)[propName] = val
          } else {
            el.setAttribute(attrName, String(val))
          }
        }
      })
      continue
    }

    // Validate static props match (in development)
    if (typeof __DEV__ !== 'undefined' ? __DEV__ : false) {
      if (key === 'className' || key === 'class') {
        const domClass = el.getAttribute('class') || ''
        if (domClass !== value) {
          ctx.handleMismatch(
            `Class mismatch on <${el.tagName.toLowerCase()}>: "${domClass}" vs "${value}"`,
            el,
            props
          )
        }
      }
    }
  }
}

// Declare global __DEV__ for development mode detection
declare global {
  const __DEV__: boolean | undefined
}
