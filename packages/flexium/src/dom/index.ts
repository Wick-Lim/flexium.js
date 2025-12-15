
import { pushContext } from '../core/context'
import { runWithComponent, type ComponentInstance } from '../core/hook'
import { unsafeEffect } from '../core/effect'

// Types
export type FNodeChild = FNode | string | number | boolean | null | undefined | FNodeChild[] | (() => FNode)

export interface FNode {
    type: string | Function
    props: Record<string, any>
    children: FNodeChild[]
    key?: any
}

// Extended ComponentInstance for DOM tracking
interface DOMComponentInstance extends ComponentInstance {
    nodes: Node[]
    parent: HTMLElement
    fnode: any
    props: any
    key?: any
    renderFn?: () => void  // Store render function for manual updates
    children: Set<DOMComponentInstance>  // Track child component instances
    parentInstance?: DOMComponentInstance  // Track parent component instance
}

// Registry to store component instances by parent and key
const instanceRegistry = new WeakMap<HTMLElement, Map<any, DOMComponentInstance>>()

// Current rendering component instance (for tracking parent-child relationships)
let currentRenderingInstance: DOMComponentInstance | null = null

// Recursively remove component instance and all its children
function removeComponentInstance(instance: DOMComponentInstance): void {
    // First, recursively remove all child instances
    instance.children.forEach(child => {
        removeComponentInstance(child)
    })

    // Remove DOM nodes created by this instance
    instance.nodes.forEach(node => {
        if (node.parentNode) {
            node.parentNode.removeChild(node)
        }
    })

    // Clear the children set
    instance.children.clear()

    // Remove from parent's children set
    if (instance.parentInstance) {
        instance.parentInstance.children.delete(instance)
    }
}

// Render a function component with reactive re-rendering
function renderComponent(fnode: any, parent: HTMLElement, registryParent?: HTMLElement): Node[] {
    const effectiveRegistryParent = registryParent || parent
    // Merge props with children
    const mergeProps = (node: any) => {
        const props = { ...node.props }
        if (node.children && node.children.length > 0) {
            props.children = node.children.length === 1
                ? node.children[0]
                : node.children
        }
        return props
    }

    // Generate key for this component
    // Use explicit key if provided, otherwise generate auto-key based on render order
    const hasExplicitKey = fnode.key !== undefined

    // Get or create registry for this parent
    // Always use the effectiveRegistryParent for registry, not a temp container
    if (!instanceRegistry.has(effectiveRegistryParent)) {
        instanceRegistry.set(effectiveRegistryParent, new Map())
    }
    const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!

    // Generate key: explicit key, or auto-increment based on component type
    let key: any
    if (hasExplicitKey) {
        key = fnode.key
    } else {
        // Auto-generate unique key: componentType + instance number
        // Count how many instances of this type already exist
        let instanceCount = 0
        const componentName = fnode.type.name || 'anonymous'
        parentRegistry.forEach((_, k) => {
            if (typeof k === 'string' && k.startsWith(`__auto_${componentName}_`)) {
                instanceCount++
            }
        })
        key = `__auto_${componentName}_${instanceCount}`
    }

    // Try to reuse existing instance with same key
    if (parentRegistry.has(key)) {
        const instance = parentRegistry.get(key)!

        // Update fnode
        instance.fnode = fnode

        // Update props (non-reactive) - we'll trigger re-render manually
        const newProps = mergeProps(fnode)

        // Always update props (including children)
        instance.props = newProps

        // Always clear old children before re-rendering (they will be re-added during render)
        // This must be done BEFORE renderFn is called
        instance.children.clear()

        // Manually trigger re-render by calling renderFn
        if (instance.renderFn) {
            instance.renderFn()
        }

        return instance.nodes
    }

    // Create component instance with regular props (not reactive)
    const instance: DOMComponentInstance = {
        hooks: [],
        hookIndex: 0,
        nodes: [],
        parent,
        fnode: fnode,
        props: mergeProps(fnode),  // Regular props, we handle updates manually
        key,
        children: new Set(),
        parentInstance: currentRenderingInstance || undefined
    }

    // Register this instance as a child of the current rendering instance
    if (currentRenderingInstance) {
        currentRenderingInstance.children.add(instance)
    }

    // Store instance in registry
    parentRegistry.set(key, instance)

    // Track if this is the first render
    let isFirstRender = true

    // Function to render the component
    const renderFn = () => {
        const currentFnode = instance.fnode
        const currentProps = instance.props

        // Check if this is a Context Provider
        const isProvider = (currentFnode.type as any)._contextId !== undefined
        if (isProvider) {
            // Set context value before rendering
            pushContext((currentFnode.type as any)._contextId, currentProps.value)
        }

        // Set this instance as the current rendering instance
        const previousRenderingInstance = currentRenderingInstance
        currentRenderingInstance = instance

        // Render component with hook context
        const result = runWithComponent(instance, () => currentFnode.type(currentProps))

        // DON'T restore currentRenderingInstance yet - we need it for renderNode calls below
        // It will be restored at the end of this function

        if (isFirstRender) {
            // First render: create new DOM nodes
            const newNodes = renderNode(result, parent)
            instance.nodes = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []
            // Mark nodes as owned by this instance (for reconciliation)
            // Only set ownership if not already owned (child components set ownership first)
            instance.nodes.forEach(node => {
                if (!(node as any).__ownerInstance) {
                    (node as any).__ownerInstance = instance
                }
            })
            isFirstRender = false
        } else {
            // Re-render: reconcile with existing DOM
            // Don't early return if nodes is empty - component might render other components
            if (instance.nodes.length === 0) {
                // Component has no DOM nodes yet, might be rendering other components
                // Just re-render without reconciliation
                const newNodes = renderNode(result, parent)
                instance.nodes = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []
                // Restore previous rendering instance before returning
                currentRenderingInstance = previousRenderingInstance
                return
            }

            const firstNode = instance.nodes[0]
            const nodeParent = firstNode.parentNode as HTMLElement

            if (!nodeParent) {
                // Restore previous rendering instance before returning
                currentRenderingInstance = previousRenderingInstance
                return
            }

            // Create marker to know where to insert new nodes
            const marker = document.createComment('flexium-marker')
            const lastNode = instance.nodes[instance.nodes.length - 1]
            if (lastNode.nextSibling) {
                nodeParent.insertBefore(marker, lastNode.nextSibling)
            } else {
                nodeParent.appendChild(marker)
            }

            // Clear children references - actual cleanup happens via key-based registry
            // Don't call removeComponentInstance here as it removes DOM nodes that reconcile needs
            instance.children.clear()

            // Create temporary container for collecting new nodes
            const tempContainer = document.createElement('div')

            // Render into temp container, but use actual parent for registry
            const newNodes = renderNode(result, tempContainer, nodeParent)
            const newNodesArray = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []

            // Use reconcile to patch existing nodes instead of replacing
            const reconciledNodes = reconcile(instance.nodes, newNodesArray, nodeParent, marker)

            // Remove marker
            nodeParent.removeChild(marker)

            instance.nodes = reconciledNodes
        }

        // Restore previous rendering instance after all renderNode calls are done
        currentRenderingInstance = previousRenderingInstance
    }

    // Store renderFn for manual updates
    instance.renderFn = renderFn

    // Wrap in effect for reactive re-rendering
    unsafeEffect(renderFn)

    return instance.nodes
}

function renderNode(fnode: any, parent: HTMLElement, registryParent?: HTMLElement): Node | Node[] | null {
    // Use registryParent for instance lookups if provided, otherwise use parent
    const effectiveRegistryParent = registryParent || parent
    // 1. null/undefined/boolean -> empty text
    if (fnode === null || fnode === undefined || typeof fnode === 'boolean') {
        const node = document.createTextNode('');
        parent.appendChild(node);
        return node;
    }

    // 2. Primitive (string/number) -> Text
    if (typeof fnode === 'string' || typeof fnode === 'number') {
        const node = document.createTextNode(String(fnode));
        parent.appendChild(node);
        return node;
    }

    // 3. Array -> render each item with key-based reconciliation
    if (Array.isArray(fnode)) {
        // Store old registry keys before rendering
        const oldKeysSet = new Set<any>()
        if (instanceRegistry.has(effectiveRegistryParent)) {
            const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!
            parentRegistry.forEach((_, key) => oldKeysSet.add(key))
        }

        // Render all children
        const nodes: Node[] = [];
        fnode.forEach((child) => {
            const result = renderNode(child, parent, registryParent);
            if (result) {
                if (Array.isArray(result)) {
                    nodes.push(...result);
                } else {
                    nodes.push(result);
                }
            }
        });

        // After rendering, check which keys are still in the registry (= were reused or created)
        const newKeysSet = new Set<any>()
        if (instanceRegistry.has(effectiveRegistryParent)) {
            const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!
            parentRegistry.forEach((_, key) => newKeysSet.add(key))
        }

        // Remove instances that existed before but don't exist now
        if (instanceRegistry.has(effectiveRegistryParent)) {
            const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!
            const keysToRemove: any[] = []

            oldKeysSet.forEach(key => {
                if (!newKeysSet.has(key)) {
                    const instance = parentRegistry.get(key)
                    if (instance) {
                        // Recursively remove component instance and all its children
                        removeComponentInstance(instance)
                        keysToRemove.push(key)
                    }
                }
            })

            // Clean up registry
            keysToRemove.forEach(key => parentRegistry.delete(key))
        }

        return nodes;
    }

    // 4. Object (FNode)
    if (typeof fnode === 'object') {
        // 4a. HTML Element (intrinsic)
        if (typeof fnode.type === 'string') {
            const dom = document.createElement(fnode.type);

            // Set props/attributes
            if (fnode.props) {
                Object.entries(fnode.props).forEach(([key, value]) => {
                    if (key === 'ref' && typeof value === 'function') {
                        // ref callback - call with the DOM element
                        value(dom);
                    } else if (key.startsWith('on') && typeof value === 'function') {
                        // Event handler: onClick -> click
                        const eventName = key.slice(2).toLowerCase();
                        dom.addEventListener(eventName, value as EventListener);

                        // Store handlers for cleanup/reconciliation
                        if (!(dom as any).__eventHandlers) {
                            (dom as any).__eventHandlers = {};
                        }
                        (dom as any).__eventHandlers[eventName] = value;
                    } else if (key !== 'ref') {
                        // Regular attribute (skip ref if not a function)
                        setAttribute(dom, key, value);
                    }
                });
            }

            // Render children
            if (fnode.children && fnode.children.length > 0) {
                fnode.children.forEach((child: any) => {
                    renderNode(child, dom);
                });
            }

            parent.appendChild(dom);
            return dom;
        }

        // 4b. Function Component
        if (typeof fnode.type === 'function') {
            // Check if this is a Context Provider
            const isProvider = (fnode.type as any)._contextId !== undefined;

            if (isProvider) {
                // Context Provider: treat like regular component for reactivity
                // This ensures providers re-render when their children change
                return renderComponent(fnode, parent, registryParent);
            } else {
                // Regular component: use reactive rendering
                return renderComponent(fnode, parent, registryParent);
            }
        }
    }

    // Fallback: unknown type
    return null;
}

export function render(app: any, container: HTMLElement) {
    container.innerHTML = ''

    // Handle raw function components by wrapping them in an FNode
    if (typeof app === 'function') {
        app = { type: app, props: {}, children: [], key: undefined }
    }

    renderNode(app, container);
}

// f() - Create FNodes without JSX
export function f(
    type: string | Function,
    props?: any,
    ...children: any[]
): any {
    return {
        type,
        props: props || {},
        children,
        key: props?.key
    }
}

function setAttribute(el: Element, key: string, value: any) {
    if (value === null || value === undefined) {
        el.removeAttribute(key)
    } else if (key === 'style' && typeof value === 'object') {
        // Handle style object
        Object.assign((el as HTMLElement).style, value)
    } else if (key === 'class') {
        // Handle class specially (className property)
        el.className = String(value)
    } else if (key in el && typeof (el as any)[key] !== 'function') {
        // Property-first approach: use DOM property if available
        // This automatically handles: disabled, checked, value, readonly, etc.
        (el as any)[key] = value
    } else {
        // Fallback to setAttribute for custom/data attributes
        el.setAttribute(key, String(value))
    }
}

// Reconciliation helpers
function canReuse(oldNode: Node, newNode: Node): boolean {
    if (oldNode.nodeType !== newNode.nodeType) return false
    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        return (oldNode as Element).tagName === (newNode as Element).tagName
    }
    return true
}

function updateAttributes(oldEl: Element, newEl: Element): void {
    // Remove old attributes
    const oldAttrs = Array.from(oldEl.attributes)
    oldAttrs.forEach(attr => {
        if (!newEl.hasAttribute(attr.name)) {
            oldEl.removeAttribute(attr.name)
        }
    })

    // Set/update new attributes
    const newAttrs = Array.from(newEl.attributes)
    newAttrs.forEach(attr => {
        if (oldEl.getAttribute(attr.name) !== attr.value) {
            // Use DOM property for value/checked to preserve focus
            if (attr.name === 'value' && 'value' in oldEl) {
                (oldEl as HTMLInputElement).value = attr.value
            } else if (attr.name === 'checked' && 'checked' in oldEl) {
                (oldEl as HTMLInputElement).checked = attr.value === 'true' || attr.value === ''
            } else {
                oldEl.setAttribute(attr.name, attr.value)
            }
        }
    })

    // Update event handlers
    const oldHandlers = (oldEl as any).__eventHandlers || {}
    const newHandlers = (newEl as any).__eventHandlers || {}

    // Remove old handlers
    Object.keys(oldHandlers).forEach(event => {
        if (!newHandlers[event]) {
            oldEl.removeEventListener(event, oldHandlers[event])
        }
    })

    // Add/update new handlers
    Object.keys(newHandlers).forEach(event => {
        if (oldHandlers[event] !== newHandlers[event]) {
            if (oldHandlers[event]) {
                oldEl.removeEventListener(event, oldHandlers[event])
            }
            oldEl.addEventListener(event, newHandlers[event])
        }
    })

    // Update stored handlers
    if (Object.keys(newHandlers).length > 0) {
        (oldEl as any).__eventHandlers = newHandlers
    } else {
        delete (oldEl as any).__eventHandlers
    }

    // Special handling for form input values
    if (oldEl instanceof HTMLInputElement && newEl instanceof HTMLInputElement) {
        if (oldEl.value !== newEl.value) {
            oldEl.value = newEl.value
        }
        if (oldEl.checked !== newEl.checked) {
            oldEl.checked = newEl.checked
        }
    }
    if (oldEl instanceof HTMLTextAreaElement && newEl instanceof HTMLTextAreaElement) {
        if (oldEl.value !== newEl.value) {
            oldEl.value = newEl.value
        }
    }
    if (oldEl instanceof HTMLSelectElement && newEl instanceof HTMLSelectElement) {
        if (oldEl.value !== newEl.value) {
            oldEl.value = newEl.value
        }
    }
}

function reconcileChildren(oldEl: Element, newEl: Element): void {
    const oldChildren = Array.from(oldEl.childNodes)
    const newChildren = Array.from(newEl.childNodes)
    const maxLen = Math.max(oldChildren.length, newChildren.length)

    for (let i = 0; i < maxLen; i++) {
        const oldChild = oldChildren[i]
        const newChild = newChildren[i]

        if (!oldChild && newChild) {
            // Add new child
            oldEl.appendChild(newChild)
        } else if (oldChild && !newChild) {
            // Remove old child
            oldEl.removeChild(oldChild)
        } else if (oldChild && newChild) {
            // Patch child
            patchNode(oldChild, newChild, oldEl)
        }
    }
}

function patchNode(oldNode: Node, newNode: Node, parent: Element): void {
    if (canReuse(oldNode, newNode)) {
        // Transfer component instance ownership from newNode to oldNode
        // This ensures component instances reference actual DOM nodes after reconciliation
        const ownerInstance = (newNode as any).__ownerInstance as DOMComponentInstance | undefined
        if (ownerInstance) {
            const idx = ownerInstance.nodes.indexOf(newNode)
            if (idx !== -1) {
                ownerInstance.nodes[idx] = oldNode
            }
            ;(oldNode as any).__ownerInstance = ownerInstance
            delete (newNode as any).__ownerInstance
        }
        // Reuse node
        if (oldNode.nodeType === Node.TEXT_NODE) {
            // Update text content
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue
            }
        } else if (oldNode.nodeType === Node.ELEMENT_NODE) {
            // Update element
            updateAttributes(oldNode as Element, newNode as Element)
            reconcileChildren(oldNode as Element, newNode as Element)
        }
    } else {
        // Different type, replace
        parent.replaceChild(newNode, oldNode)
    }
}

// Exported for future use (Phase 2: Reactive rendering)
export function reconcile(oldNodes: Node[], newNodes: Node[], parent: Node, beforeMarker: Node): Node[] {
    const maxLen = Math.max(oldNodes.length, newNodes.length)
    const resultNodes: Node[] = []

    for (let i = 0; i < maxLen; i++) {
        const oldNode = oldNodes[i]
        const newNode = newNodes[i]

        if (!oldNode && newNode) {
            // Add new node
            parent.insertBefore(newNode, beforeMarker)
            resultNodes.push(newNode)
        } else if (oldNode && !newNode) {
            // Remove old node
            if (oldNode.parentNode) {
                parent.removeChild(oldNode)
            }
        } else if (oldNode && newNode) {
            // Patch node
            patchNode(oldNode, newNode, parent as Element)
            resultNodes.push(oldNode)
        }
    }

    return resultNodes
}
