import type { FNode, FNodeChild } from './types'
import type { SerializedState } from '../server/types'
import { runWithComponent, type ComponentInstance } from '../core/hook'
import { pushContext, popContext } from '../core/context'
import { unsafeEffect } from '../core/lifecycle'

// Hydration state
let isHydrating = false
let hydrationCursor: Node | null = null
let hydrationState: SerializedState | null = null

export interface HydrateOptions {
  /**
   * Serialized state from server
   * Typically embedded in HTML as JSON script tag
   */
  state?: SerializedState

  /**
   * Called when hydration completes successfully
   */
  onHydrated?: () => void

  /**
   * Called when hydration fails (falls back to full render)
   */
  onMismatch?: (error: Error) => void
}

// Extended ComponentInstance for DOM tracking (same as render.ts)
interface DOMComponentInstance extends ComponentInstance {
  nodes: Node[]
  parent: HTMLElement
  fnode: any
  props: any
  key?: any
  renderFn?: () => void
  children: Set<DOMComponentInstance>
  parentInstance?: DOMComponentInstance
}

// Registry for hydrated components
const hydratedInstanceRegistry = new WeakMap<HTMLElement, Map<any, DOMComponentInstance>>()
let currentHydratingInstance: DOMComponentInstance | null = null

export function getIsHydrating(): boolean {
  return isHydrating
}

export function getHydrationState(): SerializedState | null {
  return hydrationState
}

/**
 * Hydrate server-rendered HTML with client-side interactivity
 */
export function hydrate(
  app: FNodeChild | (() => FNodeChild),
  container: HTMLElement,
  options: HydrateOptions = {}
): void {
  const { state, onHydrated, onMismatch } = options

  // Store state for rehydration
  hydrationState = state || null

  // Initialize hydration mode
  isHydrating = true
  hydrationCursor = container.firstChild

  try {
    // Normalize input
    let fnode: FNodeChild
    if (typeof app === 'function' && !isFNode(app)) {
      fnode = { type: app, props: {}, children: [], key: undefined }
    } else {
      fnode = app
    }

    // Hydrate the tree
    hydrateNode(fnode, container)

    onHydrated?.()
  } catch (error) {
    // Hydration mismatch - fall back to full render
    console.warn('[Flexium] Hydration mismatch, falling back to full render:', error)
    onMismatch?.(error as Error)

    // Clear and re-render
    container.innerHTML = ''
    // Import dynamically to avoid circular deps
    import('./render').then(({ render }) => {
      render(app, container)
    })
  } finally {
    isHydrating = false
    hydrationCursor = null
    hydrationState = null
  }
}

function isFNode(value: any): value is FNode {
  return value && typeof value === 'object' && 'type' in value && 'props' in value
}

function hydrateNode(fnode: FNodeChild, parent: HTMLElement): Node | Node[] | null {
  // Null/undefined/boolean -> skip empty text nodes
  if (fnode === null || fnode === undefined || typeof fnode === 'boolean') {
    // Server might have rendered an empty text node
    skipEmptyTextNodes()
    return null
  }

  // String/number -> expect text node
  if (typeof fnode === 'string' || typeof fnode === 'number') {
    return hydrateTextNode(String(fnode))
  }

  // Array -> hydrate each child
  if (Array.isArray(fnode)) {
    const nodes: Node[] = []
    for (const child of fnode) {
      const result = hydrateNode(child, parent)
      if (result) {
        if (Array.isArray(result)) {
          nodes.push(...result)
        } else {
          nodes.push(result)
        }
      }
    }
    return nodes
  }

  // Function (standalone) -> wrap in FNode and hydrate
  if (typeof fnode === 'function') {
    const wrappedFnode: FNode = { type: fnode, props: {}, children: [], key: undefined }
    return hydrateComponent(wrappedFnode, parent)
  }

  // Object (FNode)
  if (typeof fnode === 'object' && isFNode(fnode)) {
    if (typeof fnode.type === 'string') {
      return hydrateElement(fnode)
    }

    if (typeof fnode.type === 'function') {
      return hydrateComponent(fnode, parent)
    }
  }

  return null
}

function skipEmptyTextNodes(): void {
  while (
    hydrationCursor &&
    hydrationCursor.nodeType === Node.TEXT_NODE &&
    (!hydrationCursor.textContent || hydrationCursor.textContent.trim() === '')
  ) {
    hydrationCursor = hydrationCursor.nextSibling
  }
}

function hydrateTextNode(text: string): Node | null {
  skipEmptyTextNodes()

  const current = hydrationCursor

  if (!current) {
    // No node to hydrate - this is okay for conditional rendering
    return null
  }

  if (current.nodeType !== Node.TEXT_NODE) {
    // Try to find a text node nearby (whitespace handling)
    if (text.trim() === '') {
      return null
    }
    throw new Error(`Hydration mismatch: expected text node "${text}", got ${current.nodeName}`)
  }

  // Update cursor
  hydrationCursor = current.nextSibling

  return current
}

function hydrateElement(fnode: FNode): Node {
  skipEmptyTextNodes()

  const current = hydrationCursor as Element
  const tag = fnode.type as string

  // Validate element type
  if (!current || current.nodeType !== Node.ELEMENT_NODE) {
    throw new Error(`Hydration mismatch: expected element <${tag}>, got ${current?.nodeName || 'nothing'}`)
  }

  if (current.tagName.toLowerCase() !== tag.toLowerCase()) {
    throw new Error(`Hydration mismatch: expected <${tag}>, got <${current.tagName.toLowerCase()}>`)
  }

  // Attach event handlers and refs (don't modify DOM structure)
  if (fnode.props) {
    for (const [key, value] of Object.entries(fnode.props)) {
      if (key === 'ref') {
        if (typeof value === 'function') {
          value(current)
        } else if (value && typeof value === 'object' && 'current' in value) {
          value.current = current
        }
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        current.addEventListener(eventName, value as EventListener)

        // Store for reconciliation
        if (!(current as any).__eventHandlers) {
          (current as any).__eventHandlers = {}
        }
        (current as any).__eventHandlers[eventName] = value
      }
    }
  }

  // Move cursor past this element
  hydrationCursor = current.nextSibling

  // Hydrate children
  if (fnode.children && fnode.children.length > 0) {
    const savedCursor = hydrationCursor

    hydrationCursor = current.firstChild

    for (const child of fnode.children) {
      hydrateNode(child, current as HTMLElement)
    }

    hydrationCursor = savedCursor
  }

  return current
}

function hydrateComponent(fnode: FNode, parent: HTMLElement): Node | Node[] | null {
  const Component = fnode.type as Function

  // Merge props
  const props = { ...fnode.props }
  if (fnode.children && fnode.children.length > 0) {
    props.children = fnode.children.length === 1
      ? fnode.children[0]
      : fnode.children
  }

  // Handle context providers
  const contextId = (Component as any)._contextId
  const isProvider = contextId !== undefined
  let prevContextValue: any

  if (isProvider) {
    prevContextValue = pushContext(contextId, props.value)
  }

  // Generate key (same logic as render.ts)
  if (!hydratedInstanceRegistry.has(parent)) {
    hydratedInstanceRegistry.set(parent, new Map())
  }
  const parentRegistry = hydratedInstanceRegistry.get(parent)!

  const hasExplicitKey = fnode.key !== undefined
  let key: any
  if (hasExplicitKey) {
    key = fnode.key
  } else {
    let instanceCount = 0
    const componentName = (Component as any).name || 'anonymous'
    parentRegistry.forEach((_, k) => {
      if (typeof k === 'string' && k.startsWith(`__auto_${componentName}_`)) {
        instanceCount++
      }
    })
    key = `__auto_${componentName}_${instanceCount}`
  }

  // Create component instance
  const instance: DOMComponentInstance = {
    hooks: [],
    hookIndex: 0,
    nodes: [],
    parent,
    fnode,
    props,
    key,
    children: new Set(),
    parentInstance: currentHydratingInstance || undefined
  }

  if (currentHydratingInstance) {
    currentHydratingInstance.children.add(instance)
  }

  parentRegistry.set(key, instance)

  const previousHydratingInstance = currentHydratingInstance
  currentHydratingInstance = instance

  try {
    // First render during hydration - just match DOM
    const result = runWithComponent(instance, () => Component(props))
    const nodes = hydrateNode(result, parent)
    instance.nodes = nodes ? (Array.isArray(nodes) ? nodes : [nodes]) : []

    // Set up reactive re-rendering for future updates
    let isFirstRender = true
    const renderFn = () => {
      if (isFirstRender) {
        isFirstRender = false
        return // Skip first render, already done during hydration
      }

      // Re-render logic (same as render.ts but simplified)
      const currentProps = instance.props
      runWithComponent(instance, () => Component(currentProps))

      // For subsequent renders, use full render path
      // This will be handled by the normal reconciliation
    }

    instance.renderFn = renderFn
    unsafeEffect(renderFn)

    return instance.nodes
  } finally {
    currentHydratingInstance = previousHydratingInstance

    if (isProvider) {
      popContext(contextId, prevContextValue)
    }
  }
}
