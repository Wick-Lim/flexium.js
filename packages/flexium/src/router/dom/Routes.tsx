import { jsx as f } from '../../jsx-runtime'
import type { FNode, FNodeChild } from '../../dom'
import { RouterCtx, RouteDepthCtx, location } from '../router'
import { createRoutesFromChildren, matchRoutes } from '../utils'
import { Route } from './Route'

function isFNode(node: any): node is FNode {
    return node && typeof node === 'object' && ('type' in node || Array.isArray(node))
}

export function Routes(props: { children: FNodeChild }) {
    const [currentLocation, navigate] = location()

    // Parse children to find <Route> definitions and other content
    let childrenList: any[] = Array.isArray(props.children) ? props.children : [props.children]

    // Separate routes from other children (like Nav components)
    const routeNodes = childrenList.filter(child => isFNode(child) && child.type === Route)
    const otherChildren = childrenList.filter(child => !isFNode(child) || child.type !== Route)

    // Create route definitions
    const routeDefinitions = createRoutesFromChildren(routeNodes)

    // DIRECT access to currentLocation.pathname
    // This should trigger reactive tracking in the component's effect context
    const currentPath = currentLocation.pathname
    const matches = matchRoutes(routeDefinitions, currentPath) || []
    const params = matches.length > 0 ? matches[matches.length - 1].params : {}

    const routerContext = {
        location: currentLocation,
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
            const result = rootMatch.route.beforeEnter(rootMatch.params)
            if (result !== false) {
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
