import { RouteDef, RouteMatch } from './types'
import type { FNodeChild } from '../core/renderer'
import { isFNode } from '../renderers/dom/f'

/**
 * Flatten the children of <Router> or <Route> into a route configuration tree.
 * Note: This assumes `children` are FNodes representing <Route> components.
 */
export function createRoutesFromChildren(children: FNodeChild): RouteDef[] {
  const routes: RouteDef[] = []

  const childArray = Array.isArray(children) ? children : [children]

  for (const child of childArray) {
    if (!isFNode(child)) {
      continue
    }

    const { path, index, component, beforeEnter } = child.props as {
      path?: string
      index?: boolean
      component?: Function
      beforeEnter?: (
        params: Record<string, string>
      ) => boolean | Promise<boolean>
    }
    const nestedChildren = child.children

    // Skip routes without a component (unless they have children as layout routes)
    if (!component && !nestedChildren) {
      console.warn(
        `[Flexium Router] Route "${path || '(index)'}" has no component and no children. Skipping.`
      )
      continue
    }

    const route: RouteDef = {
      path: path || '',
      index: !!index,
      component: component || (() => null),
      children: nestedChildren ? createRoutesFromChildren(nestedChildren) : [],
      beforeEnter,
    }

    routes.push(route)
  }

  return routes
}

/**
 * Match a URL against a route tree.
 * Returns an array of matches (from root to leaf).
 */
export function matchRoutes(
  routes: RouteDef[],
  location: string
): RouteMatch[] | null {
  for (const route of routes) {
    const result = matchRouteBranch(route, location, '')
    if (result) return result
  }
  return null
}

function matchRouteBranch(
  route: RouteDef,
  location: string,
  parentPath: string
): RouteMatch[] | null {
  let fullPath = parentPath
  if (route.path) {
    fullPath =
      parentPath.replace(/\/$/, '') + '/' + route.path.replace(/^\//, '')
  }

  const isLeaf = route.children.length === 0
  const matcher = compilePath(fullPath, !isLeaf)
  const match = location.match(matcher)

  if (match) {
    const [matchedPath, ...paramValues] = match
    const paramsObj = extractParams(fullPath, paramValues)

    const currentMatch: RouteMatch = {
      route,
      params: paramsObj,
      pathname: matchedPath,
    }

    if (isLeaf) {
      // Exact match required for leaf
      if (matchedPath === location) return [currentMatch]
      return null
    }

    // Has children: try to match one of them
    // If no children match, and this route is an index route?
    // Or if this route matches partially, maybe an index child matches the rest?

    for (const child of route.children) {
      const childMatches = matchRouteBranch(child, location, fullPath)
      if (childMatches) {
        return [currentMatch, ...childMatches]
      }
    }

    // If no children matched, but we matched exactly this layout route?
    // E.g. /users matches /users layout, and maybe it renders index?
    if (matchedPath === location) {
      // Check for index route
      const indexRoute = route.children.find((c) => c.index)
      if (indexRoute) {
        return [
          currentMatch,
          { route: indexRoute, params: {}, pathname: matchedPath },
        ]
      }
      // Just the layout? Maybe.
      return [currentMatch]
    }
  }

  return null
}

function compilePath(path: string, prefix: boolean): RegExp {
  const regexPath = path.replace(/:([^/]+)/g, () => '([^/]+)')

  // If path is exactly "/", and we want prefix matching, it should match everything
  if (regexPath === '/' && prefix) {
    return new RegExp('^')
  }

  // If prefix matching allowed, ensure we match segment boundary
  return new RegExp(`^${regexPath}${prefix ? '(?:/|$)' : '$'}`)
}

function extractParams(path: string, values: string[]): Record<string, string> {
  const params: Record<string, string> = {}
  let i = 0
  // Re-parse to find param names... inefficient but works
  path.replace(/:([^/]+)/g, (_, paramName) => {
    params[paramName] = values[i++]
    return ''
  })
  return params
}
