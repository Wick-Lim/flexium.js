
import { state } from '../core/state'
import { reactive } from '../core/reactive'
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

    // Create a reactive location object
    const location = reactive<Location>(getLoc())

    const updateLocation = (newLoc: Location) => {
        location.pathname = newLoc.pathname
        location.search = newLoc.search
        location.hash = newLoc.hash
        location.query = newLoc.query
    }

    const navigate = (path: string) => {
        if (typeof window === 'undefined') return
        if (isUnsafePath(path)) {
            console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
            return
        }
        window.history.pushState({}, '', path)
        const newLoc = getLoc()
        updateLocation(newLoc)
    }

    // Listen to popstate
    const handlePopState = () => {
        updateLocation(getLoc())
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
        throw new Error('router() must be called within a <Routes> component')
    }
    return ctx
}

// Routes provides routing context and handles route matching/rendering
export function Routes(props: { children: FNodeChild }) {
    const [loc, navigate] = location()

    // Parse children to find <Route> definitions and other content
    let childrenList: any[] = Array.isArray(props.children) ? props.children : [props.children]

    // Separate routes from other children (like Nav components)
    const routeNodes = childrenList.filter(c => isFNode(c) && c.type === Route)
    const otherChildren = childrenList.filter(c => !isFNode(c) || c.type !== Route)

    // Create route definitions
    const routeDefs = createRoutesFromChildren(routeNodes)

    // Compute current matches based on location
    const currentPath = loc.pathname
    const matches = matchRoutes(routeDefs, currentPath) || []
    const params = matches.length > 0 ? matches[matches.length - 1].params : {}

    const routerContext: RouterContext = {
        location: loc,
        navigate,
        matches: matches,
        params: params
    }

    // Render matched component
    let matchedContent: FNodeChild = null

    if (matches.length > 0) {
        const rootMatch = matches[0]
        const Component = rootMatch.route.component

        // Guard Check
        if (rootMatch.route.beforeEnter) {
            const res = rootMatch.route.beforeEnter(rootMatch.params)
            if (res !== false) {
                matchedContent = f(RouteDepthCtx.Provider, {
                    value: 1,
                    children: f(Component, { params: rootMatch.params })
                })
            }
        } else {
            matchedContent = f(RouteDepthCtx.Provider, {
                value: 1,
                children: f(Component, { params: rootMatch.params })
            })
        }
    }

    return f(RouterCtx.Provider, {
        value: routerContext,
        children: [...otherChildren, matchedContent]
    })
}

// Keep Router as alias for backward compatibility (deprecated)
export const Router = Routes

export function Route(_props: RouteProps) {
    return null
}

export function Outlet() {
    const ctx = router()
    const depth = (context(RouteDepthCtx) as number) || 0

    const [matches] = state(() => ctx.matches)

    if (depth >= matches.length) return null

    const match = matches[depth]
    const Component = match.route.component

    // Guard
    if (match.route.beforeEnter) {
        if (match.route.beforeEnter(match.params) === false) return null
    }

    // Render next level
    return f(RouteDepthCtx.Provider, {
        value: depth + 1,
        children: f(Component, { params: match.params })
    })
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
