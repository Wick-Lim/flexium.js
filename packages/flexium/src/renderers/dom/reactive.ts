/**
 * Reactive DOM Rendering
 *
 * Integrates the signal system with the DOM renderer to enable fine-grained
 * reactive updates. Only the specific DOM nodes that depend on changed signals
 * will be updated, without re-rendering the entire component tree.
 */

import type { FNode } from '../../core/renderer'
import { effect, isSignal, onCleanup } from '../../core/signal'
import type { Signal, Computed } from '../../core/signal'
import { domRenderer } from './index'
import { isFNode } from './f'
import {
  pushProvider,
  popProvider,
  context,
  captureContext,
  runWithContext,
} from '../../core/context'
import { reconcileArrays } from './reconcile'
import { SuspenseCtx } from '../../core/suspense'
import { ErrorBoundaryCtx } from '../../core/error-boundary'
import {
  isForComponent,
  mountForComponent,
  For,
  ForComponent,
} from '../../core/flow'
import { isStateValue, getStateSignal } from '../../core/state'
import {
  isListComponent,
  mountListComponent,
  ListComponent,
} from '../../primitives/List'
import { setNode, getNode } from './node-map'

const REACTIVE_BINDINGS = new WeakMap<Node, Set<() => void>>()

export function mountReactive(
  vnode:
    | FNode
    | string
    | number
    | boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Signal<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Computed<any>
    | null
    | undefined
    | Function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ForComponent<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ListComponent<any>,
  container?: Node
): Node | null {
  // Handle null/undefined/boolean (falsy JSX values)
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return null
  }

  // Handle List component
  if (isListComponent(vnode)) {
    const parent = container || document.createDocumentFragment()

    const listDispose = mountListComponent(
      vnode,
      parent,
      (childVnode) => mountReactive(childVnode),
      cleanupReactive
    )

    // Create a marker for cleanup tracking
    const marker = document.createTextNode('')
    if (!REACTIVE_BINDINGS.has(marker)) {
      REACTIVE_BINDINGS.set(marker, new Set())
    }
    REACTIVE_BINDINGS.get(marker)!.add(listDispose)

    return container ? parent.firstChild : parent
  }

  // Handle For component with direct DOM caching (no FNode intermediate)
  if (isForComponent(vnode)) {
    const startMarker = document.createTextNode('')
    const parent = container || document.createDocumentFragment()
    domRenderer.appendChild(parent, startMarker)

    const forDispose = mountForComponent(
      vnode,
      parent,
      startMarker,
      (childVnode) => mountReactive(childVnode),
      cleanupReactive
    )

    if (!REACTIVE_BINDINGS.has(startMarker)) {
      REACTIVE_BINDINGS.set(startMarker, new Set())
    }
    REACTIVE_BINDINGS.get(startMarker)!.add(forDispose)

    return container ? startMarker : parent
  }

  // Handle StateValue (from state() API)
  if (isStateValue(vnode)) {
    const sig = getStateSignal(vnode)
    if (sig) {
      const startNode = document.createTextNode('')
      const parent = container || document.createDocumentFragment()
      domRenderer.appendChild(parent, startNode)

      let currentNode: Node | null = startNode

      const dispose = effect(() => {
        const value = sig.value
        const currentContainer = startNode.parentNode
        if (!currentContainer) return

        if (
          (typeof value === 'string' || typeof value === 'number') &&
          currentNode &&
          currentNode.nodeType === Node.TEXT_NODE &&
          currentNode !== startNode
        ) {
          domRenderer.updateTextNode(currentNode as Text, String(value))
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newNode = mountReactive(value as any)
          if (newNode) {
            if (currentNode && currentNode !== startNode) {
              if (currentNode.parentNode === currentContainer) {
                currentContainer.replaceChild(newNode, currentNode)
              } else {
                currentContainer.insertBefore(newNode, startNode.nextSibling)
              }
            } else {
              currentContainer.insertBefore(newNode, startNode.nextSibling)
            }
            currentNode = newNode
          } else {
            if (
              currentNode &&
              currentNode !== startNode &&
              currentNode.parentNode === currentContainer
            ) {
              try {
                currentContainer.removeChild(currentNode)
              } catch (e) {}
            }
            currentNode = startNode
          }
        }
      })

      if (!REACTIVE_BINDINGS.has(startNode)) {
        REACTIVE_BINDINGS.set(startNode, new Set())
      }
      REACTIVE_BINDINGS.get(startNode)!.add(dispose)

      return container ? startNode : parent
    }
  }

  // Handle signals and functions (reactive children)
  if (isSignal(vnode) || typeof vnode === 'function') {
    const startNode = document.createTextNode('')
    const parent = container || document.createDocumentFragment()
    domRenderer.appendChild(parent, startNode)

    let currentNode: Node | null = startNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentFNode: any = null
    let currentFNodeList: FNode[] = []

    const dispose = effect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = isSignal(vnode) ? (vnode as Signal<any>).value : vnode()
      const currentContainer = startNode.parentNode

      // Safety check: if node is detached, we can't update siblings
      if (!currentContainer) return

      if (Array.isArray(value)) {
        const newFNodes = value.filter((c) => c != null)
        if (currentFNodeList.length > 0) {
          const nextSibling = startNode.nextSibling
          // Note: reconcileArrays expects parent, oldFNodes, newFNodes, nextSibling
          reconcileArrays(
            currentContainer,
            currentFNodeList,
            newFNodes,
            nextSibling
          )
        } else {
          if (currentNode && currentNode !== startNode) {
            try {
              currentContainer.removeChild(currentNode)
            } catch (e) {}
          }
          const fragment = document.createDocumentFragment()
          for (const child of newFNodes) {
            const childNode = mountReactive(child, fragment)
            if (childNode && typeof child === 'object') {
              setNode(child, childNode)
            }
          }
          currentContainer.insertBefore(fragment, startNode.nextSibling)
        }
        currentFNodeList = newFNodes
        currentFNode = value
        currentNode = startNode
        return
      }

      if (currentFNodeList.length > 0) {
        for (const childFNode of currentFNodeList) {
          const childNode = getNode(childFNode)
          if (childNode && childNode.parentNode === currentContainer) {
            try {
              currentContainer.removeChild(childNode)
            } catch (e) {}
          }
        }
        currentFNodeList = []
      }

      if (value !== currentFNode) {
        if (
          (typeof value === 'string' || typeof value === 'number') &&
          currentNode &&
          currentNode.nodeType === Node.TEXT_NODE &&
          currentNode !== startNode
        ) {
          domRenderer.updateTextNode(currentNode as Text, String(value))
        } else {
          const newNode = mountReactive(value)
          if (newNode) {
            if (currentNode && currentNode !== startNode) {
              if (currentNode.parentNode === currentContainer) {
                currentContainer.replaceChild(newNode, currentNode)
              } else {
                currentContainer.insertBefore(newNode, startNode.nextSibling)
              }
            } else {
              currentContainer.insertBefore(newNode, startNode.nextSibling)
            }
            currentNode = newNode
          } else {
            if (
              currentNode &&
              currentNode !== startNode &&
              currentNode.parentNode === currentContainer
            ) {
              try {
                currentContainer.removeChild(currentNode)
              } catch (e) {}
            }
            currentNode = startNode
          }
        }
        currentFNode = value
      }
    })

    if (!REACTIVE_BINDINGS.has(startNode)) {
      REACTIVE_BINDINGS.set(startNode, new Set())
    }
    REACTIVE_BINDINGS.get(startNode)!.add(dispose)

    return container ? startNode : parent
  }

  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment()
    for (const child of vnode) {
      mountReactive(child, fragment)
    }
    if (container) {
      domRenderer.appendChild(container, fragment)
    }
    return fragment
  }

  // Handle text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    const textNode = domRenderer.createTextNode(String(vnode))
    if (container) domRenderer.appendChild(container, textNode)
    return textNode
  }

  // Handle FNodes
  if (isFNode(vnode)) {
    // Handle For component specially (direct DOM caching)
    if (vnode.type === For) {
      const forComp = For({
        each: vnode.props.each as (() => unknown[]),
        children: vnode.children as unknown as ((
          item: unknown,
          index: () => number
        ) => FNode)[],
      })
      return mountReactive(forComp, container)
    }

    // Handle function components
    if (typeof vnode.type === 'function') {
      const component = vnode.type
      const startNode = document.createTextNode('')
      const parent = container || document.createDocumentFragment()
      domRenderer.appendChild(parent, startNode)

      let currentNodes: Node[] = []
      const contextSnapshot = captureContext()

      const dispose = effect(() => {
        runWithContext(contextSnapshot, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const contextId = (component as any)._contextId
          if (contextId) {
            pushProvider(contextId, vnode.props.value)
          }

          onCleanup(() => {
            const currentParent = startNode.parentNode
            if (currentParent) {
              let nodeToRemove = startNode.nextSibling
              for (let i = 0; i < currentNodes.length; i++) {
                if (nodeToRemove) {
                  const next = nodeToRemove.nextSibling
                  cleanupReactive(nodeToRemove)
                  try {
                    currentParent.removeChild(nodeToRemove)
                  } catch (e) {}
                  nodeToRemove = next
                }
              }
            } else {
              // If startNode is detached, just cleanup reactions
              currentNodes.forEach(cleanupReactive)
            }
            currentNodes = []
          })

          try {
            let result

            try {
              result = component({ ...vnode.props, children: vnode.children })
            } catch (err) {
              if (err instanceof Promise) {
                const suspense = context(SuspenseCtx)
                if (suspense) {
                  suspense.registerPromise(err)
                  result = null
                } else {
                  throw err
                }
              } else {
                const errorBoundaryCtx = context(ErrorBoundaryCtx)
                if (errorBoundaryCtx) {
                  errorBoundaryCtx.setError(err)
                  result = null
                } else {
                  throw err
                }
              }
            }

            const fragment = document.createDocumentFragment()
            mountReactive(result, fragment)

            const currentParent = startNode.parentNode
            if (currentParent) {
              currentNodes = Array.from(fragment.childNodes)
              currentParent.insertBefore(fragment, startNode.nextSibling)
            }
          } finally {
            if (contextId) {
              popProvider(contextId)
            }
          }
        })
      })

      if (!REACTIVE_BINDINGS.has(startNode)) {
        REACTIVE_BINDINGS.set(startNode, new Set())
      }
      REACTIVE_BINDINGS.get(startNode)!.add(dispose)

      return container ? startNode : parent
    }

    // Handle fragments
    if (vnode.type === 'fragment') {
      const fragment = document.createDocumentFragment()
      for (const child of vnode.children) {
        mountReactive(child, fragment)
      }
      if (container) {
        domRenderer.appendChild(container, fragment)
      }
      return fragment
    }

    // Handle built-in elements
    const node = domRenderer.createNode(vnode.type, vnode.props)
    const disposeProps = setupReactiveProps(node, vnode.props)
    if (disposeProps.length > 0) {
      REACTIVE_BINDINGS.set(node, new Set(disposeProps))
    }

    for (const child of vnode.children) {
      mountReactive(child, node)
    }

    if (container) {
      domRenderer.appendChild(container, node)
    }

    return node
  }

  return null
}

function setupReactiveProps(
  node: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
): (() => void)[] {
  const disposers: (() => void)[] = []
  for (const key in props) {
    const value = props[key]
    if (key.startsWith('on')) continue

    if (isSignal(value)) {
      const dispose = effect(() => {
        domRenderer.updateNode(
          node,
          { [key]: undefined },
          { [key]: value.value }
        )
      })
      disposers.push(dispose)
      continue
    }

    if (typeof value === 'function') {
      const dispose = effect(() => {
        try {
          domRenderer.updateNode(node, { [key]: undefined }, { [key]: value() })
        } catch (e) {}
      })
      disposers.push(dispose)
    }
  }
  return disposers
}

export function cleanupReactive(node: Node): void {
  const bindings = REACTIVE_BINDINGS.get(node)
  if (bindings) {
    bindings.forEach((dispose) => dispose())
    REACTIVE_BINDINGS.delete(node)
  }
  if (node.childNodes) {
    node.childNodes.forEach((child) => cleanupReactive(child))
  }
}

export function createReactiveRoot(container: HTMLElement) {
  let rootDispose: (() => void) | null = null
  let currentRootNode: Node | null = null

  return {
    render(vnode: FNode) {
      if (currentRootNode) {
        cleanupReactive(currentRootNode)
        container.innerHTML = ''
        currentRootNode = null
      }
      if (rootDispose) {
        rootDispose()
        rootDispose = null
      }

      rootDispose = effect(() => {
        container.innerHTML = ''
        currentRootNode = mountReactive(vnode, container)
      })
    },
    unmount() {
      if (rootDispose) {
        rootDispose()
        rootDispose = null
      }
      cleanupReactive(container)
      container.innerHTML = ''
    },
  }
}

/**
 * Create a reactive text node that updates when the getter returns a new value
 */
export function reactiveText(getText: () => string): Text {
  const textNode = document.createTextNode('')
  const dispose = effect(() => {
    const text = getText()
    domRenderer.updateTextNode(textNode, text)
  })
  REACTIVE_BINDINGS.set(textNode, new Set([dispose]))
  return textNode
}
