import { jsx as f } from '../jsx-runtime'
import type { FNode, FNodeChild } from '../dom'
import type { RouteMatch } from './types'
import { RouterCtx, RouteDepthCtx } from './context'
import { createLocation } from './location'
import { createRoutesFromChildren, matchRoutes } from './utils'
import { Route } from './Route'

function isFNode(node: any): node is FNode {
    return node && typeof node === 'object' && ('type' in node || Array.isArray(node))
}

export function Routes(props: { children: FNodeChild }) {
    const [loc, navigate] = createLocation()

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

    const routerContext = {
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
