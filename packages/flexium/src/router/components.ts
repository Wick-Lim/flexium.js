import { computed } from '../core/signal'
import { createLocation } from './core'
import { createRoutesFromChildren, matchRoutes } from './utils'
import { LinkProps, RouteProps, RouterContext } from './types'
import { f, isFNode } from '../renderers/dom/f'
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

export function Router(props: { children: FNodeChild }) {
  const [location, navigate] = createLocation()

  // Separate Route children from non-Route children (like Nav, etc.)
  const childArray = Array.isArray(props.children) ? props.children : [props.children]
  const nonRouteChildren: FNodeChild[] = []
  const routeChildren: FNodeChild[] = []

  for (const child of childArray) {
    if (isFNode(child) && typeof child.type === 'function' && child.type === Route) {
      routeChildren.push(child)
    } else {
      nonRouteChildren.push(child)
    }
  }

  // Parse route configuration from Route children only
  const routes = createRoutesFromChildren(routeChildren)

  // Compute matches
  const matches = computed(() => {
    const loc = location()
    return matchRoutes(routes, loc.pathname) || []
  })

  const params = computed(() => {
    const m = matches()
    if (m.length > 0) {
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

  return () => {
    const ms = matches()

    // Matched route component (or null if no match)
    let matchedContent: FNodeChild = null
    if (ms.length > 0) {
      const rootMatch = ms[0]

      // Check beforeEnter guard
      if (rootMatch.route.beforeEnter) {
        const result = rootMatch.route.beforeEnter(rootMatch.params)
        if (result !== false) {
          matchedContent = f(RouteDepthCtx.Provider, { value: 1 }, [
            f('div', { key: rootMatch.route.path, style: { display: 'contents' } }, [
              f(rootMatch.route.component, { params: rootMatch.params }),
            ]),
          ])
        }
      } else {
        matchedContent = f(RouteDepthCtx.Provider, { value: 1 }, [
          f('div', { key: rootMatch.route.path, style: { display: 'contents' } }, [
            f(rootMatch.route.component, { params: rootMatch.params }),
          ]),
        ])
      }
    }

    // Render non-Route children (like Nav) and the matched route wrapped in main
    return f(RouterCtx.Provider, { value: routerContext }, [
      ...nonRouteChildren,
      f('main', { id: 'main' }, [matchedContent]),
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
