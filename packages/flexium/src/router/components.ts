import { ComputedNode, type SignalNode } from '../core/signal'
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
  const matches = new ComputedNode(() => {
    const loc = location.get()
    return matchRoutes(routes, loc.pathname) || []
  })

  const params = new ComputedNode(() => {
    const m = matches.get()
    if (m.length > 0) {
      return m[m.length - 1].params
    }
    return {}
  })

  // Create routerContext as a stable object
  // The signals (location, params, matches) are already reactive
  // We create a proxy to ensure property access is properly tracked
  // When accessing location, params, or matches, automatically read the signal's value
  // to register subscriptions (similar to how state() proxy works)
  const routerContext: RouterContext = new Proxy({
    location,
    params,
    navigate,
    matches,
  } as any, {
    get(target, prop) {
      const value = target[prop as keyof RouterContext]

      // For signal/computed properties (location, params, matches),
      // return a proxy that automatically reads the signal's value when properties are accessed
      // This makes router() work like state() - property access triggers tracking
      if (prop === 'location' || prop === 'params' || prop === 'matches') {
        const signal = value as SignalNode<unknown> | ComputedNode<unknown>

        // Create a callable target function (like state proxy does)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = () => signal.get()

        // Return a proxy that wraps the signal and automatically reads its value
        // when properties are accessed, ensuring subscriptions are registered
        // This follows the same pattern as state() proxy for consistency
        return new Proxy(target, {
          // Make the proxy callable - returns current value
          apply() {
            return signal.get()
          },

          get(_target, innerProp) {
            // Accessing .value triggers subscription registration via signal's value getter
            if (innerProp === 'value') {
              return signal.get()
            }

            // Allow direct access to peek() without tracking
            if (innerProp === 'peek') {
              return signal.peek
            }

            // Calling as function also triggers subscription
            if (innerProp === Symbol.toPrimitive || innerProp === 'toString' || innerProp === 'valueOf') {
              return () => signal.get()
            }

            // For other signal properties (set, etc.), access them normally
            const signalProp = (signal as any)[innerProp]
            if (typeof signalProp === 'function') {
              return signalProp.bind(signal)
            }

            // If the signal's value is an object, access its properties
            // This enables r.location.pathname and r.params.id to work and register subscriptions
            // Note: accessing signal.value here tracks the signal in any enclosing effect
            const currentValue = signal.get()
            if (currentValue !== null && typeof currentValue === 'object') {
              const obj = currentValue as Record<string | symbol, unknown>
              const objProp = obj[innerProp]
              // If it's a function (like array methods), bind it to the current value
              if (typeof objProp === 'function') {
                return objProp.bind(currentValue)
              }
              return objProp
            }

            return signalProp
          },

          // For property checks (like 'id' in params)
          has(_target, innerProp) {
            if (innerProp === 'value' || innerProp === 'peek') return true
            const currentValue = signal.get()
            if (currentValue !== null && typeof currentValue === 'object') {
              return innerProp in (currentValue as object)
            }
            return innerProp in signal
          },

          // For Object.keys, for...in loops
          ownKeys(_target) {
            const currentValue = signal.get()
            if (currentValue !== null && typeof currentValue === 'object') {
              return Reflect.ownKeys(currentValue as object)
            }
            return []
          },

          getOwnPropertyDescriptor(_target, innerProp) {
            const currentValue = signal.get()
            if (currentValue !== null && typeof currentValue === 'object') {
              const desc = Object.getOwnPropertyDescriptor(currentValue as object, innerProp)
              if (desc) {
                return { ...desc, configurable: true }
              }
            }
            return undefined
          }
        })
      }

      // For navigate, return as-is
      return value
    }
  }) as RouterContext

  return () => {
    const ms = matches.get()

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
  const depth = context(RouteDepthCtx) || 0 // Default 0

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
