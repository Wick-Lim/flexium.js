import { use } from '../../core/use'
import { useContext } from '../../core/context'
import { jsx as f } from '../../jsx-runtime'
import { RouteDepthCtx, useRouter } from '../router'

export function Outlet() {
    const routerContext = useRouter()
    const depth = (useContext(RouteDepthCtx) as number) || 0

    const [matches] = use(() => routerContext.matches)

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
