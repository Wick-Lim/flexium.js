import type { FNode, FNodeChild } from './dom/types'

export function jsx(type: any, props: any, key?: any): FNode {
    const { children, ...otherProps } = props || {}
    return {
        type,
        props: otherProps,
        children: Array.isArray(children) ? children : (children != null ? [children] : []),
        key
    }
}

export function jsxs(type: any, props: any, key?: any): FNode {
    return jsx(type, props, key)
}

// Development version (same as jsx for our purposes)
export function jsxDEV(type: any, props: any, key?: any): FNode {
    return jsx(type, props, key)
}

export function Fragment(props: any): FNodeChild {
    return props.children
}

export namespace JSX {
    export interface IntrinsicElements {
        [elemName: string]: any
    }
    export type Element = FNode | FNodeChild
    export interface ElementChildrenAttribute {
        children: {}
    }
}
