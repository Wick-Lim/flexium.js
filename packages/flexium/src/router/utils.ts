import { RouteDef, RouteMatch } from './types'

// Simple query parser (native URLSearchParams fallback)
export function parseQuery(search: string): Record<string, string> {
  if (!search) return {}
  if (typeof URLSearchParams !== 'undefined') {
    const params = new URLSearchParams(search)
    const res: Record<string, string> = {}
    params.forEach((v, k) => res[k] = v)
    return res
  }
  return search
    .substring(1)
    .split('&')
    .reduce((acc, part) => {
      const [key, value] = part.split('=')
      if (key) acc[decodeURIComponent(key)] = decodeURIComponent(value || '')
      return acc
    }, {} as Record<string, string>)
}

export function isUnsafePath(path: string): boolean {
  // Prevent prototype pollution or massive strings
  if (path.length > 2048) return true
  if (path.includes('__proto__') || path.includes('constructor')) return true
  // Basic XSS check for javascript: protocol
  if (/^\s*javascript:/i.test(path)) return true
  return false
}

// Convert children FNodes to RouteDefs
export function createRoutesFromChildren(children: any[]): RouteDef[] {
  const routes: RouteDef[] = []

  children.forEach(child => {
    if (!child) return

    // Assuming child is an FNode-like object (config)
    // In Flexium, Route component returns null, but 'createNode' isn't called here.
    // We are traversing the props passed to Router.

    const { path, component, children: subChildren, beforeEnter } = child.props || {}

    const route: RouteDef = {
      path: path || '/',
      component: component,
      beforeEnter
    }

    if (subChildren) {
      // If subChildren is array
      const kids = Array.isArray(subChildren) ? subChildren : [subChildren]
      // We expect the children of a Route to be other Routes
      // However, the 'children' prop in JSX might be the Route components themselves.
      route.children = createRoutesFromChildren(kids)
    }

    // Also check child.children if props.children is empty (direct FNode structure)
    if (!route.children && child.children && child.children.length > 0) {
      route.children = createRoutesFromChildren(child.children)
    }

    routes.push(route)
  })
  return routes
}

// Simple Matcher
export function matchRoutes(routes: RouteDef[], locationPathname: string): RouteMatch[] | null {
  // We want to find the best matching branch

  for (const route of routes) {
    // 1. Match current segment
    // Simple exact match or parameter match logic needed?
    // Let's implement simple param matching: /user/:id

    const routePath = route.path
    const isParam = routePath.includes(':')

    let match = false
    let params: Record<string, string> = {}
    let matchedPath = ''
    let remainingPath = locationPathname

    if (routePath === '/' || routePath === '') {
      // Root Match?
      if (locationPathname === '/') {
        match = true
        matchedPath = '/'
        remainingPath = ''
      } else if (locationPathname.startsWith('/')) {
        // Non-exact match for root? usually root / matches everything as prefix if we talk about nesting.
        // But typically / matches exact or it's a layout.
        // Let's assume / is valid prefix.
        match = true
        matchedPath = '/'
        // remainingPath stays same? No, remove /
      }
    } else {
      // Regex match for params
      // Convert /user/:id to ^/user/([^/]+)
      const paramNames: string[] = []
      const regexPath = routePath.replace(/:([^/]+)/g, (_, key) => {
        paramNames.push(key)
        return '([^/]+)'
      })

      // We match against startDate of remainingPath?
      // This DFS is getting complex for a pure function without improved tree structure.
      // Let's simplify: Standard React Router v6 style matching is complex.
      // Let's do simple flat matching for Hackernews (mostly flat or 1 level depth).
      // Actually, we can use a recursive matcher.

      // Current implementation assumption:
      // paths are absolute or relative?
      // Let's assume simplified recursive checker.

      const matchResult = matchPath(routePath, locationPathname)
      if (matchResult) {
        return [{ route, params: matchResult.params, pathname: matchResult.path }]
        // What about children?
        // If we match /user/:id, and we have children...
        // But HackerNews routes in App.tsx are siblings: /news/:page, /item/:id
        // So flat matching is enough for now.
      }
    }
  }
  return null
}

function matchPath(routePath: string, locationPath: string) {
  // 1. Split into segments
  const routeSegs = routePath.split('/').filter(Boolean)
  const locSegs = locationPath.split('/').filter(Boolean)

  if (routeSegs.length !== locSegs.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < routeSegs.length; i++) {
    const r = routeSegs[i]
    const l = locSegs[i]

    if (r.startsWith(':')) {
      const key = r.slice(1)
      params[key] = l
    } else if (r !== l) {
      return null
    }
  }

  return { params, path: locationPath }
}
