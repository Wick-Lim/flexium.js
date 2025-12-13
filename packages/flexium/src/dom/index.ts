import { effect } from '../core/effect'

import { pushContext, popContext } from '../core/context'

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

    // Function -> Reactive Text Binding (if returns primitive) or Component (if returns FNode?)
    // This ambiguity is tricky. For now, assume functions in children array are signals/computations.
    if (typeof fnode === 'function') {
        const marker = document.createTextNode('')
        let currentNodes: Node[] = []

        effect(() => {
            const val = fnode()
            const newNode = createNode(val)

            // Capture new nodes before they are inserted (if Fragment, children disappear)
            let newNodes: Node[]
            if (newNode instanceof DocumentFragment) {
                newNodes = Array.from(newNode.childNodes)
            } else {
                newNodes = [newNode]
            }

            if (marker.parentNode) {
                // Update: Remove old nodes, Insert new nodes
                currentNodes.forEach(node => {
                    if (node.parentNode) node.parentNode.removeChild(node)
                })

                // Insert new nodes before marker
                // Note: If newNode is Fragment, insertBefore handles it correctly
                marker.parentNode.insertBefore(newNode, marker)

                currentNodes = newNodes
            } else {
                // Initial Render: We can't insert yet since we are not in DOM
                // We rely on the return value being used by the caller
                currentNodes = newNodes
            }
        })

        // Return a Fragment containing the content + marker
        const frag = document.createDocumentFragment()
        currentNodes.forEach(node => frag.appendChild(node))
        frag.appendChild(marker)
        return frag
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
                Object.keys(props).forEach(key => {
                    const value = props[key]

                    if (key.startsWith('on') && typeof value === 'function') {
                        const event = key.toLowerCase().slice(2)
                        el.addEventListener(event, value)
                    } else if (typeof value === 'function') {
                        // Dynamic Prop
                        effect(() => {
                            setAttribute(el, key, value())
                        })
                    } else {
                        // Static Prop
                        setAttribute(el, key, value)
                    }
                })
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

            // Execute component function
            const result = type({ ...props, children })
            return createNode(result)
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

function setAttribute(el: Element, key: string, value: any) {
    if (value === null || value === undefined) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, String(value))
    }
}
