
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
    vnode: any
    props: any
}

// Render a function component with reactive re-rendering
function renderComponent(fnode: any, parent: HTMLElement): Node[] {
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

    // Create component instance with current props
    const instance: DOMComponentInstance = {
        hooks: [],
        hookIndex: 0,
        nodes: [],
        parent,
        vnode: fnode,
        props: mergeProps(fnode)
    }

    // Track if this is the first render
    let isFirstRender = true

    // Function to render the component
    const renderFn = () => {
        // Update props before rendering (in case fnode.props changed)
        instance.props = mergeProps(fnode)

        // Render component with hook context
        // Note: Context is already available from Provider rendering
        const result = runWithComponent(instance, () => fnode.type(instance.props))

        if (isFirstRender) {
            // First render: create new DOM nodes
            const newNodes = renderNode(result, parent)
            instance.nodes = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []
            isFirstRender = false
        } else {
            // Re-render: reconcile with existing DOM
            if (instance.nodes.length === 0) return

            // For simple case: just replace the content
            // This avoids the tempContainer issue
            const firstNode = instance.nodes[0]
            const nodeParent = firstNode.parentNode

            if (!nodeParent) {
                return
            }

            // Create marker to know where to insert
            const marker = document.createComment('flexium-marker')
            nodeParent.insertBefore(marker, firstNode)

            // Remove old nodes
            instance.nodes.forEach(node => {
                if (node.parentNode) {
                    node.parentNode.removeChild(node)
                }
            })

            // Render new nodes before marker
            const tempParent = marker.parentNode as HTMLElement
            const newNodes = renderNode(result, tempParent)
            const newNodesArray = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []

            // Move nodes before marker
            newNodesArray.forEach(node => {
                tempParent.insertBefore(node, marker)
            })

            // Remove marker
            tempParent.removeChild(marker)

            instance.nodes = newNodesArray
        }
    }

    // Wrap in effect for reactive re-rendering
    unsafeEffect(renderFn)

    return instance.nodes
}

function renderNode(fnode: any, parent: HTMLElement): Node | Node[] | null {
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

    // 3. Array -> render each item
    if (Array.isArray(fnode)) {
        const nodes: Node[] = [];
        fnode.forEach(child => {
            const result = renderNode(child, parent);
            if (result) {
                if (Array.isArray(result)) {
                    nodes.push(...result);
                } else {
                    nodes.push(result);
                }
            }
        });
        return nodes;
    }

    // 4. Object (VNode)
    if (typeof fnode === 'object') {
        // 4a. HTML Element (intrinsic)
        if (typeof fnode.type === 'string') {
            const dom = document.createElement(fnode.type);

            // Set props/attributes
            if (fnode.props) {
                Object.entries(fnode.props).forEach(([key, value]) => {
                    if (key.startsWith('on') && typeof value === 'function') {
                        // Event handler: onClick -> click
                        const eventName = key.slice(2).toLowerCase();
                        dom.addEventListener(eventName, value as EventListener);

                        // Store handlers for cleanup/reconciliation
                        if (!(dom as any).__eventHandlers) {
                            (dom as any).__eventHandlers = {};
                        }
                        (dom as any).__eventHandlers[eventName] = value;
                    } else {
                        // Regular attribute
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
                // Context Provider: set context permanently (no pop for now)
                // This allows child components rendered in effects to access context
                const contextId = (fnode.type as any)._contextId;
                const props = { ...fnode.props };
                if (fnode.children && fnode.children.length > 0) {
                    props.children = fnode.children.length === 1
                        ? fnode.children[0]
                        : fnode.children;
                }

                // Set context value (permanently for this render tree)
                pushContext(contextId, props.value);

                // Render children with context available
                const result = fnode.type(props);
                return renderNode(result, parent);
            } else {
                // Regular component: use reactive rendering
                return renderComponent(fnode, parent);
            }
        }
    }

    // Fallback: unknown type
    return null;
}

export function render(app: any, container: HTMLElement) {
    container.innerHTML = ''

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
            oldEl.setAttribute(attr.name, attr.value)
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
