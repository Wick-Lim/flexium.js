import type { FNode } from './types'

/**
 * f() - Create FNodes without JSX
 */
export function f(
    type: string | Function,
    props?: any,
    ...children: any[]
): FNode {
    return {
        type,
        props: props || {},
        children,
        key: props?.key
    }
}
