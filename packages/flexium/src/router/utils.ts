import { RouteDefinition, RouteMatch } from './types'

// Simple query parser (native URLSearchParams fallback) - internal use only
function parseQuery(search: string): Record<string, string> {
  if (!search) return {}
  if (typeof URLSearchParams !== 'undefined') {
    const params = new URLSearchParams(search)
    const result: Record<string, string> = {}
    params.forEach((value, key) => result[key] = value)
    return result
  }
  return search
    .substring(1)
    .split('&')
    .reduce((accumulator, part) => {
      const [key, value] = part.split('=')
      if (key) accumulator[decodeURIComponent(key)] = decodeURIComponent(value || '')
      return accumulator
    }, {} as Record<string, string>)
}

function isUnsafePath(path: string): boolean {
  // Handle undefined or null path
  if (!path || typeof path !== 'string') return true
  // Prevent prototype pollution or massive strings
  if (path.length > 2048) return true
  if (path.includes('__proto__') || path.includes('constructor')) return true
  // Basic XSS check for javascript: protocol
  if (/^\s*javascript:/i.test(path)) return true
  return false
}

// Convert children FNodes to RouteDefinitions - internal use only
function createRoutesFromChildren(children: any[]): RouteDefinition[] {
  const routes: RouteDefinition[] = []

  children.forEach(child => {
    if (!child) return

    // Assuming child is an FNode-like object (config)
    // In Flexium, Route component returns null, but 'createNode' isn't called here.
    // We are traversing the props passed to Router.

    const { path, component, children: subChildren, beforeEnter } = child.props || {}

    const route: RouteDefinition = {
      path: path || '/',
      component: component,
      beforeEnter
    }

    if (subChildren) {
      // If subChildren is array
      const nestedChildren = Array.isArray(subChildren) ? subChildren : [subChildren]
      // We expect the children of a Route to be other Routes
      // However, the 'children' prop in JSX might be the Route components themselves.
      route.children = createRoutesFromChildren(nestedChildren)
    }

    // Also check child.children if props.children is empty (direct FNode structure)
    if (!route.children && child.children && child.children.length > 0) {
      route.children = createRoutesFromChildren(child.children)
    }

    routes.push(route)
  })
  return routes
}

// Simple Matcher - internal use only
function matchRoutes(routes: RouteDefinition[], locationPathname: string): RouteMatch[] | null {
  // We want to find the best matching branch

  for (const route of routes) {
    // 1. Match current segment
    // Simple exact match or parameter match logic needed?
    // Let's implement simple param matching: /user/:id

    const routePath = route.path

    const matchResult = matchPath(routePath, locationPathname)
    if (matchResult) {
      return [{ route, params: matchResult.params, pathname: matchResult.path }]
    }
  }
  return null
}

function matchPath(routePath: string, locationPath: string) {
  // 1. Split into segments
  const routeSegments = routePath.split('/').filter(Boolean)
  const locationSegments = locationPath.split('/').filter(Boolean)

  if (routeSegments.length !== locationSegments.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i]
    const locationSegment = locationSegments[i]

    if (routeSegment.startsWith(':')) {
      const key = routeSegment.slice(1)
      params[key] = locationSegment
    } else if (routeSegment !== locationSegment) {
      return null
    }
  }

  return { params, path: locationPath }
}

// Export only what's needed by other router files
export { parseQuery, isUnsafePath, createRoutesFromChildren, matchRoutes }
