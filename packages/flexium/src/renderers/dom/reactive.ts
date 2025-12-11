/**
 * Reactive DOM Rendering
 *
 * Integrates the signal system with the DOM renderer to enable fine-grained
 * reactive updates. Only the specific DOM nodes that depend on changed signals
 * will be updated, without re-rendering the entire component tree.
 */

import type { FNode } from '../../core/renderer'
import { effect, isSignal, onCleanup, root } from '../../core/signal'
import type { Signal, Computed } from '../../core/signal'
import { domRenderer } from './index'
import { isFNode } from './f'
import {
  pushProvider,
} from '../../core/context'
import { reconcileArrays } from './reconcile'
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
import { setNode, getNode } from './node-map'

const REACTIVE_BINDINGS = new WeakMap<Node, Set<() => void>>()

/**
 * DOM Update Batching System
 * Batches DOM updates using requestAnimationFrame to improve performance
 * when multiple signals update simultaneously.
 */
type DOMUpdateTask = () => void

const domUpdateQueue = new Set<DOMUpdateTask>()
let isDOMUpdateScheduled = false

/**
 * Schedule a DOM update to be batched
 */
function scheduleDOMUpdate(task: DOMUpdateTask): void {
  domUpdateQueue.add(task)
  if (!isDOMUpdateScheduled) {
    isDOMUpdateScheduled = true
    // Use requestAnimationFrame to batch DOM updates with browser rendering cycle
    requestAnimationFrame(() => {
      flushDOMUpdates()
    })
  }
}

/**
 * Flush all pending DOM updates
 */
function flushDOMUpdates(): void {
  isDOMUpdateScheduled = false
  if (domUpdateQueue.size === 0) return

  // Performance: Convert Set to array for faster iteration
  const queue = Array.from(domUpdateQueue)
  domUpdateQueue.clear()

  // Execute all DOM updates
  for (let i = 0; i < queue.length; i++) {
    queue[i]()
  }
}

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
 * - ListComponents
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
  node:
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
    | ListComponent<any>,
  container?: Node
): Node | null {
  // Handle null/undefined/boolean (falsy JSX values)
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null
  }

  // Handle List component
  if (isListComponent(node)) {
    const parent = container || document.createDocumentFragment()

    const listDispose = mountListComponent(
      node,
      parent,
      (childNode) => mountReactive(childNode),
      cleanupReactive
    )

    // Create a marker for cleanup tracking
    const marker = document.createTextNode('')
    registerReactiveBinding(marker, listDispose)

    return container ? parent.firstChild : parent
  }

  // Handle StateValue (from state() API)
  if (isStateValue(node)) {
    const sig = getStateSignal(node)
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
          // Performance: Batch simple text node updates
          const textNode = currentNode as Text
          const textValue = String(value)
          scheduleDOMUpdate(() => {
            domRenderer.updateTextNode(textNode, textValue)
          })
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newNode = mountReactive(value as any)
          if (newNode) {
            if (currentNode && currentNode !== startNode) {
              if (currentNode.parentNode === currentContainer) {
                // Optimize: if both old and new are text nodes, just update content
                if (
                  currentNode.nodeType === Node.TEXT_NODE &&
                  newNode.nodeType === Node.TEXT_NODE
                ) {
                  // Performance: Batch text node updates
                  const textNode = currentNode as Text
                  const textContent = newNode.textContent || ''
                  scheduleDOMUpdate(() => {
                    domRenderer.updateTextNode(textNode, textContent)
                  })
                  // Don't update currentNode reference since we reused it
                } else {
                  currentContainer.replaceChild(newNode, currentNode)
                  currentNode = newNode
                }
              } else {
                currentContainer.insertBefore(newNode, startNode.nextSibling)
                currentNode = newNode
              }
            } else {
              currentContainer.insertBefore(newNode, startNode.nextSibling)
              currentNode = newNode
            }
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
  if (isSignal(node) || typeof node === 'function') {
    const startNode = document.createTextNode('')
    const parent = container || document.createDocumentFragment()
    domRenderer.appendChild(parent, startNode)

    let currentNodes: Node[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentFNode: any = null
    let currentFNodeList: FNode[] = []

    const dispose = effect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = isSignal(node) ? (node as Signal<any>).value : (node as () => unknown)()
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
          // Clean up old nodes first
          for (const childNode of currentNodes) {
            cleanupReactive(childNode)
            if (childNode.parentNode === currentContainer) {
              try {
                currentContainer.removeChild(childNode)
              } catch (e) {
                logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
              }
            }
          }
          currentNodes = []

          const fragment = document.createDocumentFragment()
          for (const child of newFNodes) {
            const childNode = mountReactive(child, fragment)
            if (childNode && typeof child === 'object') {
              setNode(child, childNode)
            }
          }
          currentNodes = Array.from(fragment.childNodes)
          currentContainer.insertBefore(fragment, startNode.nextSibling)
        }
        currentFNodeList = newFNodes
        currentFNode = value
        return
      }

      if (currentFNodeList.length > 0) {
        for (const childFNode of currentFNodeList) {
          const childNode = getNode(childFNode)
          if (childNode && childNode.parentNode === currentContainer) {
            cleanupReactive(childNode)
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
        // Clean up old nodes first
        for (const childNode of currentNodes) {
          cleanupReactive(childNode)
          if (childNode.parentNode === currentContainer) {
            try {
              currentContainer.removeChild(childNode)
            } catch (e) {
              logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
            }
          }
        }
        currentNodes = []

        if (
          (typeof value === 'string' || typeof value === 'number')
        ) {
          const textNode = domRenderer.createTextNode(String(value))
          currentContainer.insertBefore(textNode, startNode.nextSibling)
          currentNodes = [textNode]
        } else {
          const newNode = mountReactive(value)
          if (newNode) {
            // If newNode is a fragment, track all children
            if (newNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
              currentNodes = Array.from(newNode.childNodes)
              currentContainer.insertBefore(newNode, startNode.nextSibling)
            } else {
              currentContainer.insertBefore(newNode, startNode.nextSibling)
              currentNodes = [newNode]
            }
          }
        }
        currentFNode = value
      }
    })

    registerReactiveBinding(startNode, dispose)

    return container ? startNode : parent
  }

  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment()
    for (const child of node) {
      mountReactive(child, fragment)
    }
    if (container) {
      domRenderer.appendChild(container, fragment)
    }
    return fragment
  }

  // Handle text nodes
  if (typeof node === 'string' || typeof node === 'number') {
    const textNode = domRenderer.createTextNode(String(node))
    if (container) domRenderer.appendChild(container, textNode)
    return textNode
  }

  // Handle FNodes
  if (isFNode(node)) {
    // Handle function components
    if (typeof node.type === 'function') {
      const component = node.type
      const startNode = document.createTextNode('')
      const parent = container || document.createDocumentFragment()
      domRenderer.appendChild(parent, startNode)

      let currentNodes: Node[] = []
      let currentFNodeList: FNode[] = []

      // Create component instance for hook tracking
      const componentInstance = createComponentInstance()

      const dispose = effect(() => {
        try {
          // Reset hook index for each render
          resetHookIndex(componentInstance)

          // Use root() to track any effects created inside the component
          // These will be automatically cleaned up when disposeRoot is called
          // Use root() to track any effects created inside the component
          // These will be automatically cleaned up when disposeRoot is called
          root((disposeRoot) => {
            // Register disposeRoot to cleanup component's internal effects
            onCleanup(disposeRoot)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contextId = (component as any)._contextId
            if (contextId) {
              pushProvider(contextId, node.props.value)
            }

            let result
            try {
              // Set current component for hook tracking
              setCurrentComponent(componentInstance)
              result = component({ ...node.props, children: node.children })
            } finally {
              // Clear current component
              setCurrentComponent(null)
            }

            // Attempt Reconciliation for Arrays (e.g. items.map)
            // This enables efficient list updates without full re-render
            const isArray = Array.isArray(result)
            // Check if it's a list of FNodes (elements) that we can reconcile
            // We skip reconciliation for primitives or fragments to be safe for now
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const canReconcile = isArray && (result as unknown as any[]).every(item =>
              isFNode(item) && item.type !== 'fragment'
            )

            if (canReconcile) {
              const parent = startNode.parentNode
              if (parent) {
                // Normalize result to FNode[] (already checked, but for type safety)
                const newFNodes = result as unknown as FNode[]

                // Use reconcileArrays to diff/patch the DOM
                reconcileArrays(
                  parent,
                  currentFNodeList,
                  newFNodes,
                  startNode.nextSibling
                )

                // Update state for next render
                currentFNodeList = newFNodes
                // Update currentNodes so we know what to remove if we switch to fallback
                currentNodes = newFNodes.map(fn => getNode(fn)).filter(n => n != null) as Node[]
                return
              }
            }

            // Fallback: Standard Mount (Destroy & Recreate)
            // Clean up old nodes first
            const currentParent = startNode.parentNode
            if (currentParent) {
              // If we were using reconciliation, currentFNodeList handles the nodes
              // If not, currentNodes handles them.
              // We iterate currentNodes to be safe.
              for (const childNode of currentNodes) {
                cleanupReactive(childNode)
                // Only remove if still attached (reconcileArrays might have moved them)
                if (childNode.parentNode === currentParent) {
                  try {
                    currentParent.removeChild(childNode)
                  } catch (e) {
                    logError(ErrorCodes.DOM_CLEANUP_FAILED, { operation: 'removeChild' }, e)
                  }
                }
              }
            }
            currentNodes = []
            currentFNodeList = []

            const fragment = document.createDocumentFragment()
            mountReactive(result, fragment)

            if (currentParent) {
              currentNodes = Array.from(fragment.childNodes)
              currentParent.insertBefore(fragment, startNode.nextSibling)
            }
          })
        } finally {
          // No popProvider needed with Owner-based context
        }
      })

      registerReactiveBinding(startNode, dispose)

      return container ? startNode : parent
    }

    // Handle fragments
    if (node.type === 'fragment') {
      const fragment = document.createDocumentFragment()
      for (const child of node.children) {
        mountReactive(child, fragment)
      }
      if (container) {
        domRenderer.appendChild(container, fragment)
      }
      return fragment
    }

    // Handle built-in elements
    const domNode = domRenderer.createNode(node.type, node.props)
    const disposeProps = setupReactiveProps(domNode, node.props)
    if (disposeProps.length > 0) {
      REACTIVE_BINDINGS.set(domNode, new Set(disposeProps))
    }

    for (const child of node.children) {
      mountReactive(child, domNode)
    }

    if (container) {
      domRenderer.appendChild(container, domNode)
    }

    // Handle ref (callback or object with .current)
    const ref = node.props.ref
    if (ref) {
      if (typeof ref === 'function') {
        // Callback ref
        ref(domNode)
        registerReactiveBinding(domNode, () => {
          ref(null)
        })
      } else if (typeof ref === 'object' && 'current' in ref) {
        // Object ref (like useRef)
        ref.current = domNode
        registerReactiveBinding(domNode, () => {
          ref.current = null
        })
      }
    }

    return domNode
  }

  return null
}

// Sentinel value to detect first run
const UNINITIALIZED = Symbol('uninitialized')

function setupReactiveProps(
  node: HTMLElement | SVGElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
): (() => void)[] {
  const disposers: (() => void)[] = []

  // Performance: Filter reactive props in a single pass
  // Only process props that are signals or functions (reactive props)
  // Skip event handlers (they are handled separately in updateNode)
  const reactiveProps: Array<[string, unknown]> = []
  for (const key in props) {
    // Skip event handlers (they are handled separately in updateNode)
    if (key.startsWith('on')) continue
    
    const value = props[key]
    // Only collect reactive props (signals or functions)
    if (isSignal(value) || typeof value === 'function') {
      reactiveProps.push([key, value])
    }
  }

  // Process only reactive props (reduces iterations)
  for (const [key, value] of reactiveProps) {
    if (isSignal(value)) {
      // Track previous value to avoid unnecessary DOM updates
      // Use sentinel for first run to ensure initial value is set
      let prevValue: unknown = UNINITIALIZED
      const dispose = effect(() => {
        const newValue = value.value
        // Only update DOM if value actually changed (always update on first run)
        if (newValue !== prevValue) {
          // Performance: Batch DOM node updates
          const oldPropValue = prevValue === UNINITIALIZED ? undefined : prevValue
          scheduleDOMUpdate(() => {
            domRenderer.updateNode(
              node,
              { [key]: oldPropValue },
              { [key]: newValue }
            )
          })
          prevValue = newValue
        }
      })
      disposers.push(dispose)
    } else {
      // value is a function (already checked in filter above)
      // Track previous value to avoid unnecessary DOM updates
      // Use sentinel for first run to ensure initial value is set
      let prevValue: unknown = UNINITIALIZED
      const dispose = effect(() => {
        try {
          const newValue = value()
          // Only update DOM if value actually changed (always update on first run)
          if (newValue !== prevValue) {
            // Performance: Batch DOM node updates
            const oldPropValue = prevValue === UNINITIALIZED ? undefined : prevValue
            scheduleDOMUpdate(() => {
              domRenderer.updateNode(
                node,
                { [key]: oldPropValue },
                { [key]: newValue }
              )
            })
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
  let currentFNode: FNode | null = null

  return {
    render(node: FNode) {
      // Performance: If rendering the same node, skip cleanup (optimization for re-renders)
      const isSameNode = currentFNode === node

      if (!isSameNode && currentRootNode) {
        cleanupReactive(currentRootNode)
        // Performance: Use removeChild instead of innerHTML when possible (faster)
        // Only use innerHTML if container has many children
        if (container.childNodes.length === 1) {
          container.removeChild(currentRootNode)
        } else {
          container.innerHTML = ''
        }
        currentRootNode = null
      }

      if (rootDispose) {
        rootDispose()
        rootDispose = null
      }

      rootDispose = effect(() => {
        // Performance: Only clear if we have existing content and it's different
        if (!isSameNode && container.firstChild) {
          // Performance: Use removeChild for single child, innerHTML for multiple
          if (container.childNodes.length === 1) {
            container.removeChild(container.firstChild!)
          } else {
            container.innerHTML = ''
          }
        }
        currentRootNode = mountReactive(node, container)
        currentFNode = node
      })
    },
    unmount() {
      if (rootDispose) {
        rootDispose()
        rootDispose = null
      }
      cleanupReactive(container)
      // Performance: Use removeChild when possible
      if (container.childNodes.length === 1) {
        container.removeChild(container.firstChild!)
      } else {
        container.innerHTML = ''
      }
      currentRootNode = null
      currentFNode = null
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
    // Performance: Batch text node updates
    scheduleDOMUpdate(() => {
      domRenderer.updateTextNode(textNode, text)
    })
  })
  registerReactiveBinding(textNode, dispose)
  return textNode
}
