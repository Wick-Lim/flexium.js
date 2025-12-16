import type { FNode, FNodeChild } from './index'
import { unsafeEffect } from '../core/effect'
import { runWithComponent, type ComponentInstance } from '../core/hook'
import { pushContext, popContext } from '../core/context'

export interface HydrateOptions {
  onMismatch?: (message: string, domNode: Node | null, fnode: any) => void
  recoverMismatch?: boolean
}

interface HydrationContext {
  options: HydrateOptions
  mismatches: string[]
}

function attachEventHandlers(element: Element, props: Record<string, any>): void {
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase()
      element.addEventListener(eventName, value as EventListener)

      if (!(element as any).__eventHandlers) {
        (element as any).__eventHandlers = {}
      }
      (element as any).__eventHandlers[eventName] = value
    }
  }
}

function hydrateComponent(
  domNode: Node,
  fnode: FNode,
  ctx: HydrationContext
): void {
  const Component = fnode.type as Function

  const props = { ...fnode.props }
  if (fnode.children && fnode.children.length > 0) {
    props.children = fnode.children.length === 1
      ? fnode.children[0]
      : fnode.children
  }

  const instance: ComponentInstance = {
    hooks: [],
    hookIndex: 0
  }

  const isProvider = (Component as any)._contextId !== undefined

  const hydrateRender = () => {
    let prevValue: any
    if (isProvider) {
      prevValue = pushContext((Component as any)._contextId, props.value)
    }

    const result = runWithComponent(instance, () => Component(props))
    hydrateNode(domNode, result, ctx)

    if (isProvider) {
      popContext((Component as any)._contextId, prevValue)
    }
  }

  unsafeEffect(hydrateRender)
}

function hydrateNode(
  domNode: Node,
  fnode: FNodeChild,
  ctx: HydrationContext
): void {
  if (fnode === null || fnode === undefined || typeof fnode === 'boolean') {
    return
  }

  if (typeof fnode === 'string' || typeof fnode === 'number') {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const expected = String(fnode)
      if (domNode.textContent !== expected) {
        const msg = `Text mismatch: "${domNode.textContent}" vs "${expected}"`
        ctx.mismatches.push(msg)
        ctx.options.onMismatch?.(msg, domNode, fnode)

        if (ctx.options.recoverMismatch) {
          domNode.textContent = expected
        }
      }
    }
    return
  }

  if (Array.isArray(fnode)) {
    const parent = domNode.parentNode
    if (!parent) return

    let currentDom: Node | null = domNode
    for (const child of fnode) {
      if (currentDom && child !== null && child !== undefined && typeof child !== 'boolean') {
        hydrateNode(currentDom, child, ctx)
        currentDom = currentDom.nextSibling
      }
    }
    return
  }

  if (typeof fnode === 'function') {
    hydrateNode(domNode, fnode(), ctx)
    return
  }

  if (typeof fnode === 'object' && 'type' in fnode) {
    const fnodeTyped = fnode as FNode

    if (typeof fnodeTyped.type === 'function') {
      hydrateComponent(domNode, fnodeTyped, ctx)
      return
    }

    if (typeof fnodeTyped.type === 'string') {
      if (domNode.nodeType !== Node.ELEMENT_NODE) {
        const msg = `Expected element node, got ${domNode.nodeType}`
        ctx.mismatches.push(msg)
        ctx.options.onMismatch?.(msg, domNode, fnode)
        return
      }

      const element = domNode as Element

      if (element.tagName.toLowerCase() !== fnodeTyped.type.toLowerCase()) {
        const msg = `Tag mismatch: "${element.tagName}" vs "${fnodeTyped.type}"`
        ctx.mismatches.push(msg)
        ctx.options.onMismatch?.(msg, domNode, fnode)
      }

      if (fnodeTyped.props) {
        attachEventHandlers(element, fnodeTyped.props)

        if (typeof fnodeTyped.props.ref === 'function') {
          fnodeTyped.props.ref(element)
        }
      }

      if (fnodeTyped.children && fnodeTyped.children.length > 0) {
        const childNodes = Array.from(element.childNodes)
          .filter(n => n.nodeType !== Node.COMMENT_NODE)

        let childIndex = 0
        for (const childFNode of fnodeTyped.children) {
          if (childFNode === null || childFNode === undefined || typeof childFNode === 'boolean') {
            continue
          }

          const childDom = childNodes[childIndex]
          if (childDom) {
            hydrateNode(childDom, childFNode, ctx)
          } else {
            const msg = `Missing DOM child at index ${childIndex}`
            ctx.mismatches.push(msg)
            ctx.options.onMismatch?.(msg, null, childFNode)
          }
          childIndex++
        }
      }
    }
  }
}

export function hydrate(
  app: FNode | FNodeChild | Function,
  container: HTMLElement,
  options: HydrateOptions = {}
): void {
  const ctx: HydrationContext = {
    options,
    mismatches: []
  }

  let normalizedApp = app
  if (typeof app === 'function') {
    normalizedApp = { type: app, props: {}, children: [] } as FNode
  }

  const firstChild = container.firstChild
  if (firstChild) {
    hydrateNode(firstChild, normalizedApp as FNodeChild, ctx)
  } else {
    const msg = 'No DOM content to hydrate'
    ctx.options.onMismatch?.(msg, null, app)
  }

  if (process.env.NODE_ENV === 'development' && ctx.mismatches.length > 0) {
    console.warn(`Hydration completed with ${ctx.mismatches.length} mismatch(es):`, ctx.mismatches)
  }
}
