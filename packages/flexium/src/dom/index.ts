
import { unsafeEffect } from '../core/effect'
import { pushContext, popContext, snapshotContext, runWithContext } from '../core/context'
import { runWithComponent, ComponentInstance } from '../core/hook'

// Types
export type FNodeChild = string | number | boolean | null | undefined | FNode | (() => FNodeChild) | FNodeChild[]

export interface FNodeProps {
    [key: string]: any
    children?: FNodeChild[]
}

export interface FNode {
    type: string | Function
    props: FNodeProps
    children: FNodeChild[]
    key?: string | number
}

function createNode(fnode: FNodeChild): Node {
    // null/undefined/boolean -> empty text
    if (fnode === null || fnode === undefined || typeof fnode === 'boolean') {
        return document.createTextNode('')
    }

    // Reference/Primitive -> Text
    if (typeof fnode === 'string' || typeof fnode === 'number') {
        return document.createTextNode(String(fnode))
    }


    // FNode
    if (typeof fnode === 'object') {
        // Array? -> Fragment
        if (Array.isArray(fnode)) {
            const frag = document.createDocumentFragment()
            fnode.forEach(child => {
                const node = createNode(child)
                frag.appendChild(node)
            })
            return frag
        }

        const { type, props, children } = fnode

        // HTML Element
        if (typeof type === 'string') {
            const el = document.createElement(type)

            // Props
            if (props) {
                // Store event handlers for reconciliation
                const eventHandlers: Record<string, any> = {}

                Object.keys(props).forEach(key => {
                    const value = props[key]

                    if (key.startsWith('on') && typeof value === 'function') {
                        const event = key.toLowerCase().slice(2)
                        el.addEventListener(event, value)
                        eventHandlers[event] = value
                    } else if (key === 'ref' && typeof value === 'function') {
                        // Handle ref callback
                        value(el)
                    } else if (typeof value === 'function') {
                        // Dynamic Prop
                        unsafeEffect(() => {
                            setAttribute(el, key, value())
                        })
                    } else {
                        // Static Prop
                        setAttribute(el, key, value)
                    }
                })

                // Store handlers on element for reconciliation
                if (Object.keys(eventHandlers).length > 0) {
                    (el as any).__eventHandlers = eventHandlers
                }
            }

            // Children
            children.forEach((child: any) => {
                const childNode = createNode(child)
                el.appendChild(childNode)
            })

            return el
        }

        // Function Component
        if (typeof type === 'function') {
            // Context Provider Check
            const contextId = (type as any)._contextId
            if (contextId) {
                const prev = pushContext(contextId, props.value)
                try {
                    // Provider returns children typically
                    const result = type({ ...props, children })
                    return createNode(result)
                } finally {
                    popContext(contextId, prev)
                }
            }

            // Normal Component
            // Support React-style Components with Hooks

            const marker = document.createTextNode('')
            let currentNodes: Node[] = []

            // Create a persistent component instance for hooks
            const componentInstance: ComponentInstance = {
                hooks: [],
                hookIndex: 0
            }

            // Capture context snapshot for async updates inside the component effect
            const ctxSnapshot = snapshotContext()

            unsafeEffect(() => {
                runWithContext(ctxSnapshot, () => {
                    runWithComponent(componentInstance, () => {
                        const result = type({ ...props, children })
                        const newNode = createNode(result)

                        // Get new nodes from result
                        let newNodes: Node[]
                        if (newNode instanceof DocumentFragment) {
                            newNodes = Array.from(newNode.childNodes)
                        } else {
                            newNodes = [newNode]
                        }

                        if (marker.parentNode) {
                            // Use reconciliation instead of removing all nodes
                            currentNodes = reconcile(currentNodes, newNodes, marker.parentNode, marker)
                        } else {
                            currentNodes = newNodes
                        }
                    })
                })
            })

            const frag = document.createDocumentFragment()
            currentNodes.forEach(node => frag.appendChild(node))
            frag.appendChild(marker)
            return frag
        }
    }

    return document.createTextNode(String(fnode))
}

export function render(app: any, container: HTMLElement) {
    // If app is a function (Component), execute it to get the FNode
    const node = typeof app === 'function' ? app() : app

    container.innerHTML = ''
    const dom = createNode(node)
    if (dom) {
        container.appendChild(dom)
    }
}

// f() - Create FNodes without JSX
export function f(
    type: string | Function,
    props?: FNodeProps | null,
    ...children: FNodeChild[]
): FNode {
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
    } else if (key === 'value' && (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
    )) {
        (el as any).value = value
    } else if (key === 'checked' && el instanceof HTMLInputElement) {
        el.checked = !!value
    } else {
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

function reconcile(oldNodes: Node[], newNodes: Node[], parent: Node, beforeMarker: Node): Node[] {
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
