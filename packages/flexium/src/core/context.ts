export interface Context<T> {
    Provider: (props: { value: T; children: any }) => any
    id: symbol
    defaultValue: T
}

const contextMap = new Map<symbol, any>()

export function createContext<T>(defaultValue: T): Context<T> {
    const id = Symbol('context')
    const Provider = (props: { value: T; children: any }) => props.children
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
