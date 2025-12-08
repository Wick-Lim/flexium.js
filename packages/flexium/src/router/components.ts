import { computed } from '../core/signal'
import { createLocation } from './core'
import { createRoutesFromChildren, matchRoutes } from './utils'
import { LinkProps, RouteProps, RouterContext } from './types'
import { f } from '../renderers/dom/f'
import { RouterCtx, RouteDepthCtx } from './context'
import { context } from '../core/context'
import type { FNodeChild } from '../core/renderer'

/**
 * Get the current router context.
 * Must be called within a <Router> component.
 *
 * @example
 * ```tsx
 * const r = router()
 * r.navigate('/dashboard')
 * ```
 */
export function router(): RouterContext {
  const ctx = context(RouterCtx)
  if (!ctx) {
    throw new Error('router() must be called within a <Router> component')
  }
  return ctx
}

/**
 * Alias for router() - Get the current router context.
 * Must be called within a <Router> component.
 *
 * @example
 * ```tsx
 * const router = useRouter()
 * router.navigate('/dashboard')
 * ```
 */
export const useRouter = router

export function Router(props: { children: FNodeChild }) {
  const [location, navigate] = createLocation()

  // Parse route configuration from children
  const routes = createRoutesFromChildren(props.children)

  // Compute matches
  const matches = computed(() => {
    const loc = location()
    return matchRoutes(routes, loc.pathname) || []
  })

  const params = computed(() => {
    const m = matches()
    if (m.length > 0) {
      // Merge params from all matches? Usually leaf params are most important.
      // Or combine them.
      return m[m.length - 1].params
    }
    return {}
  })

  const routerContext: RouterContext = {
    location,
    params,
    navigate,
    matches,
  }

  // Provide Context
  // We use a manual Provider wrapper because `Router` returns the root component
  // But Flexium context is stack-based.
  // We can wrap the result in a Provider component if we had one.
  // Or `mountReactive` supports context via `pushProvider` if the component has `_contextId`.
  // But `createContext` returns an object with `Provider` component.

  return () => {
    const ms = matches()
    // console.log('Router render, matches:', ms.length);

    // No match? Render nothing or 404?
    // Ideally user provides a "*" route.
    if (ms.length === 0) return null

    const rootMatch = ms[0]

    // Check beforeEnter guard
    if (rootMatch.route.beforeEnter) {
      const result = rootMatch.route.beforeEnter(rootMatch.params)
      if (result === false) return null
    }

    const RootComponent = rootMatch.route.component

    // We need to provide RouterCtx AND RouteDepthCtx (0 + 1 = 1 for next outlet)
    // Wait, Outlet at depth 0 should render match[0]?
    // No, Router renders match[0] (Root Layout).
    // Root Layout contains Outlet. Outlet renders match[1].
    // So Outlet needs depth 1.

    return f(RouterCtx.Provider, { value: routerContext }, [
      f(RouteDepthCtx.Provider, { value: 1 }, [
        f(RootComponent, { params: rootMatch.params }),
      ]),
    ])
  }
}

/**
 * Route configuration component.
 * Doesn't render anything directly; used by Router to build the route tree.
 */
export function Route(_props: RouteProps) {
  return null
}

/**
 * Renders the child route content.
 */
export function Outlet() {
  const router = context(RouterCtx)
  const depth = context(RouteDepthCtx) // Default 0

  // Safety check
  if (!router) return null

  return () => {
    const ms = router.matches()

    // Check if we have a match at this depth
    if (depth >= ms.length) return null

    const match = ms[depth]

    // Check beforeEnter guard
    if (match.route.beforeEnter) {
      const result = match.route.beforeEnter(match.params)
      if (result === false) return null
    }

    const Component = match.route.component

    // Render component and provide next depth
    return f(RouteDepthCtx.Provider, { value: depth + 1 }, [
      f(Component, { params: match.params }),
    ])
  }
}

export function Link(props: LinkProps) {
  const r = router()

  const handleClick = (e: Event) => {
    e.preventDefault()
    r.navigate(props.to)
  }

  return f(
    'a',
    {
      href: props.to,
      class: props.class,
      onclick: handleClick,
    },
    props.children
  )
}
