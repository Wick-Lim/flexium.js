import { pushContext } from '../core/context'
import { runWithComponent, type ComponentInstance } from '../core/hook'
import { unsafeEffect } from '../core/lifecycle'

// Extended ComponentInstance for DOM tracking
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

// Registry to store component instances by parent and key
const instanceRegistry = new WeakMap<HTMLElement, Map<any, DOMComponentInstance>>()

// Current rendering component instance (for tracking parent-child relationships)
let currentRenderingInstance: DOMComponentInstance | null = null

// Recursively remove component instance and all its children
function removeComponentInstance(instance: DOMComponentInstance): void {
    instance.children.forEach(child => {
        removeComponentInstance(child)
    })

    instance.nodes.forEach(node => {
        if (node.parentNode) {
            node.parentNode.removeChild(node)
        }
    })

    instance.children.clear()

    if (instance.parentInstance) {
        instance.parentInstance.children.delete(instance)
    }
}

// Render a function component with reactive re-rendering
function renderComponent(fnode: any, parent: HTMLElement, registryParent?: HTMLElement): Node[] {
    const effectiveRegistryParent = registryParent || parent

    const mergeProps = (node: any) => {
        const props = { ...node.props }
        if (node.children && node.children.length > 0) {
            props.children = node.children.length === 1
                ? node.children[0]
                : node.children
        }
        return props
    }

    const hasExplicitKey = fnode.key !== undefined

    if (!instanceRegistry.has(effectiveRegistryParent)) {
        instanceRegistry.set(effectiveRegistryParent, new Map())
    }
    const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!

    let key: any
    if (hasExplicitKey) {
        key = fnode.key
    } else {
        let instanceCount = 0
        const componentName = fnode.type.name || 'anonymous'
        parentRegistry.forEach((_, k) => {
            if (typeof k === 'string' && k.startsWith(`__auto_${componentName}_`)) {
                instanceCount++
            }
        })
        key = `__auto_${componentName}_${instanceCount}`
    }

    if (parentRegistry.has(key)) {
        const instance = parentRegistry.get(key)!
        instance.fnode = fnode
        const newProps = mergeProps(fnode)
        instance.props = newProps
        instance.children.clear()

        if (instance.renderFn) {
            instance.renderFn()
        }

        return instance.nodes
    }

    const instance: DOMComponentInstance = {
        hooks: [],
        hookIndex: 0,
        nodes: [],
        parent,
        fnode: fnode,
        props: mergeProps(fnode),
        key,
        children: new Set(),
        parentInstance: currentRenderingInstance || undefined
    }

    if (currentRenderingInstance) {
        currentRenderingInstance.children.add(instance)
    }

    parentRegistry.set(key, instance)

    let isFirstRender = true

    const renderFn = () => {
        const currentFnode = instance.fnode
        const currentProps = instance.props

        const isProvider = (currentFnode.type as any)._contextId !== undefined
        if (isProvider) {
            pushContext((currentFnode.type as any)._contextId, currentProps.value)
        }

        const previousRenderingInstance = currentRenderingInstance
        currentRenderingInstance = instance

        const result = runWithComponent(instance, () => currentFnode.type(currentProps))

        if (isFirstRender) {
            const newNodes = renderNode(result, parent)
            instance.nodes = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []
            instance.nodes.forEach(node => {
                if (!(node as any).__ownerInstance) {
                    (node as any).__ownerInstance = instance
                }
            })
            isFirstRender = false
        } else {
            if (instance.nodes.length === 0) {
                const newNodes = renderNode(result, parent)
                instance.nodes = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []
                currentRenderingInstance = previousRenderingInstance
                return
            }

            const firstNode = instance.nodes[0]
            const nodeParent = firstNode.parentNode as HTMLElement

            if (!nodeParent) {
                currentRenderingInstance = previousRenderingInstance
                return
            }

            const marker = document.createComment('flexium-marker')
            const lastNode = instance.nodes[instance.nodes.length - 1]
            if (lastNode.nextSibling) {
                nodeParent.insertBefore(marker, lastNode.nextSibling)
            } else {
                nodeParent.appendChild(marker)
            }

            instance.children.clear()

            const tempContainer = document.createElement('div')
            const newNodes = renderNode(result, tempContainer, nodeParent)
            const newNodesArray = newNodes ? (Array.isArray(newNodes) ? newNodes : [newNodes]) : []

            const reconciledNodes = reconcile(instance.nodes, newNodesArray, nodeParent, marker)

            nodeParent.removeChild(marker)

            instance.nodes = reconciledNodes
        }

        currentRenderingInstance = previousRenderingInstance
    }

    instance.renderFn = renderFn

    unsafeEffect(renderFn)

    return instance.nodes
}

function renderNode(fnode: any, parent: HTMLElement, registryParent?: HTMLElement): Node | Node[] | null {
    const effectiveRegistryParent = registryParent || parent

    if (fnode === null || fnode === undefined || typeof fnode === 'boolean') {
        const node = document.createTextNode('')
        parent.appendChild(node)
        return node
    }

    if (typeof fnode === 'string' || typeof fnode === 'number') {
        const node = document.createTextNode(String(fnode))
        parent.appendChild(node)
        return node
    }

    if (Array.isArray(fnode)) {
        const oldKeysSet = new Set<any>()
        if (instanceRegistry.has(effectiveRegistryParent)) {
            const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!
            parentRegistry.forEach((_, key) => oldKeysSet.add(key))
        }

        const nodes: Node[] = []
        fnode.forEach((child) => {
            const result = renderNode(child, parent, registryParent)
            if (result) {
                if (Array.isArray(result)) {
                    nodes.push(...result)
                } else {
                    nodes.push(result)
                }
            }
        })

        const newKeysSet = new Set<any>()
        if (instanceRegistry.has(effectiveRegistryParent)) {
            const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!
            parentRegistry.forEach((_, key) => newKeysSet.add(key))
        }

        if (instanceRegistry.has(effectiveRegistryParent)) {
            const parentRegistry = instanceRegistry.get(effectiveRegistryParent)!
            const keysToRemove: any[] = []

            oldKeysSet.forEach(key => {
                if (!newKeysSet.has(key)) {
                    const instance = parentRegistry.get(key)
                    if (instance) {
                        removeComponentInstance(instance)
                        keysToRemove.push(key)
                    }
                }
            })

            keysToRemove.forEach(key => parentRegistry.delete(key))
        }

        return nodes
    }

    if (typeof fnode === 'object') {
        if (typeof fnode.type === 'string') {
            const dom = document.createElement(fnode.type)

            if (fnode.props) {
                Object.entries(fnode.props).forEach(([key, value]) => {
                    if (key === 'ref') {
                        // Handle both callback refs and RefObject
                        if (typeof value === 'function') {
                            value(dom)
                        } else if (value && typeof value === 'object' && 'current' in value) {
                            value.current = dom
                        }
                    } else if (key.startsWith('on') && typeof value === 'function') {
                        const eventName = key.slice(2).toLowerCase()
                        dom.addEventListener(eventName, value as EventListener)

                        if (!(dom as any).__eventHandlers) {
                            (dom as any).__eventHandlers = {}
                        }
                        (dom as any).__eventHandlers[eventName] = value
                    } else if (key !== 'ref') {
                        setAttribute(dom, key, value)
                    }
                })
            }

            if (fnode.children && fnode.children.length > 0) {
                fnode.children.forEach((child: any) => {
                    renderNode(child, dom)
                })
            }

            parent.appendChild(dom)
            return dom
        }

        if (typeof fnode.type === 'function') {
            return renderComponent(fnode, parent, registryParent)
        }
    }

    return null
}

function setAttribute(el: Element, key: string, value: any) {
    if (value === null || value === undefined) {
        el.removeAttribute(key)
    } else if (key === 'style' && typeof value === 'object') {
        Object.assign((el as HTMLElement).style, value)
    } else if (key === 'class') {
        el.className = String(value)
    } else if (key in el && typeof (el as any)[key] !== 'function') {
        (el as any)[key] = value
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
    const oldAttrs = Array.from(oldEl.attributes)
    oldAttrs.forEach(attr => {
        if (!newEl.hasAttribute(attr.name)) {
            oldEl.removeAttribute(attr.name)
        }
    })

    const newAttrs = Array.from(newEl.attributes)
    newAttrs.forEach(attr => {
        if (oldEl.getAttribute(attr.name) !== attr.value) {
            if (attr.name === 'value' && 'value' in oldEl) {
                (oldEl as HTMLInputElement).value = attr.value
            } else if (attr.name === 'checked' && 'checked' in oldEl) {
                (oldEl as HTMLInputElement).checked = attr.value === 'true' || attr.value === ''
            } else {
                oldEl.setAttribute(attr.name, attr.value)
            }
        }
    })

    const oldHandlers = (oldEl as any).__eventHandlers || {}
    const newHandlers = (newEl as any).__eventHandlers || {}

    Object.keys(oldHandlers).forEach(event => {
        if (!newHandlers[event]) {
            oldEl.removeEventListener(event, oldHandlers[event])
        }
    })

    Object.keys(newHandlers).forEach(event => {
        if (oldHandlers[event] !== newHandlers[event]) {
            if (oldHandlers[event]) {
                oldEl.removeEventListener(event, oldHandlers[event])
            }
            oldEl.addEventListener(event, newHandlers[event])
        }
    })

    if (Object.keys(newHandlers).length > 0) {
        (oldEl as any).__eventHandlers = newHandlers
    } else {
        delete (oldEl as any).__eventHandlers
    }

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
            oldEl.appendChild(newChild)
        } else if (oldChild && !newChild) {
            oldEl.removeChild(oldChild)
        } else if (oldChild && newChild) {
            patchNode(oldChild, newChild, oldEl)
        }
    }
}

function patchNode(oldNode: Node, newNode: Node, parent: Element): void {
    if (canReuse(oldNode, newNode)) {
        const ownerInstance = (newNode as any).__ownerInstance as DOMComponentInstance | undefined
        if (ownerInstance) {
            const idx = ownerInstance.nodes.indexOf(newNode)
            if (idx !== -1) {
                ownerInstance.nodes[idx] = oldNode
            }
            ;(oldNode as any).__ownerInstance = ownerInstance
            delete (newNode as any).__ownerInstance
        }

        if (oldNode.nodeType === Node.TEXT_NODE) {
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue
            }
        } else if (oldNode.nodeType === Node.ELEMENT_NODE) {
            updateAttributes(oldNode as Element, newNode as Element)
            reconcileChildren(oldNode as Element, newNode as Element)
        }
    } else {
        parent.replaceChild(newNode, oldNode)
    }
}

export function reconcile(oldNodes: Node[], newNodes: Node[], parent: Node, beforeMarker: Node): Node[] {
    const maxLen = Math.max(oldNodes.length, newNodes.length)
    const resultNodes: Node[] = []

    for (let i = 0; i < maxLen; i++) {
        const oldNode = oldNodes[i]
        const newNode = newNodes[i]

        if (!oldNode && newNode) {
            parent.insertBefore(newNode, beforeMarker)
            resultNodes.push(newNode)
        } else if (oldNode && !newNode) {
            if (oldNode.parentNode) {
                parent.removeChild(oldNode)
            }
        } else if (oldNode && newNode) {
            patchNode(oldNode, newNode, parent as Element)
            resultNodes.push(oldNode)
        }
    }

    return resultNodes
}

export function render(app: any, container: HTMLElement): () => void {
    container.innerHTML = ''

    if (typeof app === 'function') {
        app = { type: app, props: {}, children: [], key: undefined }
    }

    renderNode(app, container)

    // Return dispose function
    return () => {
        // Remove all component instances registered under this container
        if (instanceRegistry.has(container)) {
            const registry = instanceRegistry.get(container)!
            registry.forEach(instance => {
                removeComponentInstance(instance)
            })
            registry.clear()
            instanceRegistry.delete(container)
        }
        // Clear container
        container.innerHTML = ''
    }
}
