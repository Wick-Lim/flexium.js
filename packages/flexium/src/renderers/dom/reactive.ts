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
  isStateValue,
  getStateSignal,
  setCurrentComponent,
  createComponentInstance,
  resetHookIndex,
} from '../../core/state'
import {
  isListComponent,
  mountListComponent,
  ListComponent,
} from '../../primitives/List'
import { logError, ErrorCodes } from '../../core/errors'
import {
  isReactiveArrayResult,
  mountReactiveArray,
  ReactiveArrayResult,
} from '../../core/reactive-array'
import { setNode, getNode } from './node-map'

const REACTIVE_BINDINGS = new WeakMap<Node, Set<() => void>>()

/**
 * Register a dispose function for a node's reactive bindings.
 * Ensures the bindings set exists and adds the dispose function to it.
 */
function registerReactiveBinding(node: Node, dispose: () => void): void {
  let bindings = REACTIVE_BINDINGS.get(node)
  if (!bindings) {
    bindings = new Set()
    REACTIVE_BINDINGS.set(node, bindings)
  }
  bindings.add(dispose)
}

/**
 * Mount a virtual node reactively to the DOM.
 *
 * This is the core rendering function that handles all node types:
 * - FNodes (both built-in elements and function components)
 * - Strings and numbers (text nodes)
 * - Signals and computed values (reactive children)
 * - StateValues from the state() API
 * - ListComponents and ReactiveArrayResults
 * - Arrays and fragments
 *
 * Reactive values are automatically tracked and DOM updates occur
 * only when the specific values change (fine-grained reactivity).
 *
 * @param vnode - The virtual node to mount
 * @param container - Optional parent node to append to
 * @returns The created DOM node, or null for empty/boolean values
 *
 * @example
 * ```tsx
 * // Mount a simple element
 * const node = mountReactive(<div>Hello</div>, document.body)
 *
 * // Mount a reactive signal
 * const count = signal(0)
 * mountReactive(() => <span>{count.value}</span>, container)
 * ```
 */
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
    | ListComponent<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ReactiveArrayResult<any, any>,
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
    registerReactiveBinding(marker, listDispose)

    return container ? parent.firstChild : parent
  }

  // Handle ReactiveArrayResult from items.map() syntax
  if (isReactiveArrayResult(vnode)) {
    const startMarker = document.createTextNode('')
    const parent = container || document.createDocumentFragment()
    domRenderer.appendChild(parent, startMarker)

    const arrayDispose = mountReactiveArray(
      vnode,
      parent,
      startMarker,
      (childVnode) => mountReactive(childVnode),
      cleanupReactive
    )

    registerReactiveBinding(startMarker, arrayDispose)

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
              } catch (e) {
                logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
              }
            }
            currentNode = startNode
          }
        }
      })

      registerReactiveBinding(startNode, dispose)

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
            } catch (e) {
              logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
            }
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
            } catch (e) {
              logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
            }
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
              } catch (e) {
                logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
              }
            }
            currentNode = startNode
          }
        }
        currentFNode = value
      }
    })

    registerReactiveBinding(startNode, dispose)

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
    // Handle function components
    if (typeof vnode.type === 'function') {
      const component = vnode.type
      const startNode = document.createTextNode('')
      const parent = container || document.createDocumentFragment()
      domRenderer.appendChild(parent, startNode)

      let currentNodes: Node[] = []
      const contextSnapshot = captureContext()

      // Create component instance for hook tracking
      const componentInstance = createComponentInstance()

      const dispose = effect(() => {
        // Reset hook index for each render
        resetHookIndex(componentInstance)

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
                  } catch (e) {
                    logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
                  }
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
              // Set current component for hook tracking
              setCurrentComponent(componentInstance)
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
            } finally {
              // Clear current component
              setCurrentComponent(null)
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

      registerReactiveBinding(startNode, dispose)

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

// Sentinel value to detect first run
const UNINITIALIZED = Symbol('uninitialized')

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
      // Track previous value to avoid unnecessary DOM updates
      // Use sentinel for first run to ensure initial value is set
      let prevValue: unknown = UNINITIALIZED
      const dispose = effect(() => {
        const newValue = value.value
        // Only update DOM if value actually changed (always update on first run)
        if (newValue !== prevValue) {
          domRenderer.updateNode(
            node,
            { [key]: prevValue === UNINITIALIZED ? undefined : prevValue },
            { [key]: newValue }
          )
          prevValue = newValue
        }
      })
      disposers.push(dispose)
      continue
    }

    if (typeof value === 'function') {
      // Track previous value to avoid unnecessary DOM updates
      // Use sentinel for first run to ensure initial value is set
      let prevValue: unknown = UNINITIALIZED
      const dispose = effect(() => {
        try {
          const newValue = value()
          // Only update DOM if value actually changed (always update on first run)
          if (newValue !== prevValue) {
            domRenderer.updateNode(
              node,
              { [key]: prevValue === UNINITIALIZED ? undefined : prevValue },
              { [key]: newValue }
            )
            prevValue = newValue
          }
        } catch (e) {
          logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'updateNode', prop: key }, e)
        }
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
  if (node.childNodes && node.childNodes.length > 0) {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      cleanupReactive(child)
    }
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
  registerReactiveBinding(textNode, dispose)
  return textNode
}
