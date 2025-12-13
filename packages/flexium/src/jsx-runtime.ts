export function jsx(type: any, props: any, key?: any) {
    const { children, ...otherProps } = props || {}
    return {
        type,
        props: otherProps,
        children: Array.isArray(children) ? children : (children ? [children] : []),
        key
    }
}

export function jsxs(type: any, props: any, key?: any) {
    return jsx(type, props, key)
}

export function Fragment(props: any) {
    return props.children
}

export namespace JSX {
    export interface IntrinsicElements {
        [elemName: string]: any
    }
    export type Element = {
        type: any
        props: any
        key: any
        children: any
    } | (() => Element)
    export interface ElementChildrenAttribute {
        children: {}
    }
}
