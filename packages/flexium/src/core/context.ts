const contextMap = new Map<symbol, any>()

/**
 * Context for passing data through the component tree
 *
 * @example
 * ```tsx
 * const ThemeContext = new Context('light')
 *
 * function App() {
 *   return (
 *     <ThemeContext.Provider value="dark">
 *       <Child />
 *     </ThemeContext.Provider>
 *   )
 * }
 *
 * function Child() {
 *   const [theme] = use(ThemeContext)
 *   return <div>{theme}</div>
 * }
 * ```
 */
export class Context<T> {
    readonly id: symbol
    readonly defaultValue: T
    readonly Provider: (props: { value: T; children: any }) => any

    constructor(defaultValue: T) {
        this.id = Symbol('context')
        this.defaultValue = defaultValue
        this.Provider = (props: { value: T; children: any }) => props.children
        ;(this.Provider as any)._contextId = this.id
    }
}

// Internal: get context value (used by use.ts)
export function getContextValue<T>(ctx: Context<T>): T {
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
