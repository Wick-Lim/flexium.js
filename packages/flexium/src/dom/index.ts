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
        const placeholder = document.createTextNode('')
        let currentDom: Node = placeholder

        effect(() => {
            const val = fnode()

            // If function returns primitives, update text
            if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null || val === undefined) {
                if (currentDom.nodeType === Node.TEXT_NODE) {
                    currentDom.textContent = String(val ?? '')
                } else {
                    const newText = document.createTextNode(String(val ?? ''))
                    currentDom.parentNode?.replaceChild(newText, currentDom)
                    currentDom = newText
                }
            } else {
                // If function returns an FNode (Dynamic Component), Re-render
                // NOTE: This is a Full Replacement strategy (Inefficient but correct for now)
                const newNode = createNode(val)
                if (currentDom.parentNode) {
                    currentDom.parentNode.replaceChild(newNode, currentDom)
                }
                currentDom = newNode
            }
        })
        return currentDom
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
