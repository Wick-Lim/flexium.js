
import { state } from '../core/state'
import { createContext, context } from '../core/context'
import { jsx as f } from '../jsx-runtime'
import type { FNode, FNodeChild } from '../dom'
import {
    Location,
    RouterContext,
    RouteProps,
    RouteMatch,
    LinkProps
} from './types'
import { createRoutesFromChildren, matchRoutes, parseQuery, isUnsafePath } from './utils'

export * from './types'
export * from './utils'

// Contexts
export const RouterCtx = createContext<RouterContext>(null as any)
export const RouteDepthCtx = createContext<number>(0)

// -----------------------------------------------------------------------------
// Core Logic (createLocation)
// -----------------------------------------------------------------------------

// Core Logic (createLocation)
// -----------------------------------------------------------------------------

function location(): [Location, (path: string) => void] {
    const getDefaultLoc = (): Location => ({
        pathname: '/',
        search: '',
        hash: '',
        query: {},
    })

    const getLoc = (): Location => {
        if (typeof window === 'undefined') {
            return getDefaultLoc()
        }
        return {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            query: parseQuery(window.location.search),
        }
    }

    // Reactive state for location
    const [location, setLoc] = state<Location>(getLoc()) as [Location, (v: Location) => void]

    const navigate = (path: string) => {
        if (typeof window === 'undefined') return
        console.log('[Router] Navigate to:', path)
        if (isUnsafePath(path)) {
            console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
            return
        }
        window.history.pushState({}, '', path)
        const newLoc = getLoc()
        console.log('[Router] Setting new location:', newLoc)
        setLoc(newLoc)
    }

    // Listen to popstate
    const handlePopState = () => {
        setLoc(getLoc())
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('popstate', handlePopState)
    }

    return [location, navigate]
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

function isFNode(node: any): node is FNode {
    return node && typeof node === 'object' && ('type' in node || Array.isArray(node))
}

export function router(): RouterContext {
    const ctx = context(RouterCtx)
    if (!ctx) {
        throw new Error('router() must be called within a <Router> component')
    }
    return ctx
}

export function Router(props: { children: FNodeChild }) {
    const [loc, navigate] = location()

    // Parse children to find <Route> definitions
    let childrenList: any[] = Array.isArray(props.children) ? props.children : [props.children]

    // Note: We need to filter FNodes to valid Route components 
    const routeDefs = createRoutesFromChildren(childrenList.filter(c => isFNode(c) && c.type === Route))

    const [matches] = state<RouteMatch[]>(() => {
        const p = loc.pathname
        console.log('[Router] Computing matches for:', p)
        const m = matchRoutes(routeDefs, p) || []
        console.log('[Router] Matched:', m)
        return m
    })

    const [params] = state<Record<string, string>>(() => {
        const list = matches
        if (list.length > 0) {
            return list[list.length - 1].params
        }
        return {}
    })

    const routerContext: RouterContext = {
        location: loc,
        navigate,
        matches,
        params
    }

    // Render
    return () => {
        console.log('[Router] Rendering...')
        // 1. Matched Content
        let matchedContent: FNodeChild = null
        const currentMatches = matches

        if (currentMatches.length > 0) {
            const rootMatch = currentMatches[0]
            const Component = rootMatch.route.component

            // Guard Check
            let canRender = true
            if (rootMatch.route.beforeEnter) {
                const res = rootMatch.route.beforeEnter(rootMatch.params)
                if (res === false) canRender = false
            }

            if (canRender) {
                // We render the Root matched component.
                matchedContent = f(RouteDepthCtx.Provider, {
                    value: 1,
                    children: [
                        f(Component, { params: rootMatch.params })
                    ]
                })
            }
        }

        const renderedChildren = childrenList.map(child => {
            // Render non-Route children (Nav etc)
            // <Route> components return null naturally
            return child
        })

        return f(RouterCtx.Provider, {
            value: routerContext,
            children: [
                ...renderedChildren,
                matchedContent
            ]
        })
    }
}

export function Route(_props: RouteProps) {
    return null
}

export function Outlet() {
    const ctx = router() // Get router context
    const depth = (context(RouteDepthCtx) as number) || 0

    return () => {
        const ms = ctx.matches
        if (depth >= ms.length) return null

        const match = ms[depth]
        const Component = match.route.component

        // Guard
        if (match.route.beforeEnter) {
            if (match.route.beforeEnter(match.params) === false) return null
        }

        // Render next level
        return f(RouteDepthCtx.Provider, {
            value: depth + 1,
            children: [
                f(Component, { params: match.params })
            ]
        })
    }
}

export function Link(props: LinkProps) {
    const ctx = router()
    return f('a', {
        href: props.to,
        class: props.class,
        onclick: (e: Event) => {
            e.preventDefault()
            ctx.navigate(props.to)
        },
        children: props.children
    })
}
