import type { Context } from './types'

export type { Context }

const contextMap = new Map<symbol, any>()

export function createContext<T>(defaultValue: T): Context<T> {
    const id = Symbol('context')
    const Provider = (props: { value: T; children: any }) => props.children;
    (Provider as any)._contextId = id
    return { Provider, id, defaultValue }
}

export function context<T>(ctx: Context<T>): T {
    return contextMap.has(ctx.id) ? contextMap.get(ctx.id) : ctx.defaultValue
}

// Internal helpers for renderer
export function pushContext(id: symbol, value: any) {
    const prev = contextMap.get(id)
    contextMap.set(id, value)
    return prev
}


export function popContext(id: symbol, prevValue: any) {
    if (prevValue === undefined) {
        contextMap.delete(id)
    } else {
        contextMap.set(id, prevValue)
    }
}

export function snapshotContext(): Map<symbol, any> {
    return new Map(contextMap)
}

export function runWithContext<R>(snapshot: Map<symbol, any>, fn: () => R): R {
    // 1. Save current context
    const prevContext = new Map(contextMap)

    // 2. Apply snapshot
    contextMap.clear()
    snapshot.forEach((value, key) => contextMap.set(key, value))

    try {
        return fn()
    } finally {
        // 3. Restore previous context
        contextMap.clear()
        prevContext.forEach((value, key) => contextMap.set(key, value))
    }
}
