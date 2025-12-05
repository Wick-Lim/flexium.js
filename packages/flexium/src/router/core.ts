/**
 * Router Core Module
 *
 * Provides core routing functionality including location management,
 * path matching, and navigation.
 */

import { signal, Signal } from '../core/signal'
import { Location } from './types'

/**
 * Creates a reactive location signal and navigate function.
 *
 * The location signal automatically updates when:
 * - navigate() is called
 * - Browser back/forward buttons are used (popstate event)
 *
 * @returns Tuple of [location signal, navigate function]
 *
 * @example
 * ```tsx
 * const [location, navigate] = createLocation();
 * // Access current path
 * console.log(location().pathname);
 * // Navigate to new path
 * navigate('/users/123');
 * ```
 */
export function createLocation(): [Signal<Location>, (path: string) => void] {
  const getLoc = (): Location => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    query: parseQuery(window.location.search),
  })

  const loc = signal(getLoc())

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    loc.value = getLoc()
  }

  window.addEventListener('popstate', () => {
    loc.value = getLoc()
  })

  return [loc, navigate]
}

/**
 * Parses URL search string into key-value object
 * @param search - URL search string (e.g., "?foo=bar&baz=qux")
 * @returns Object with query parameters
 */
function parseQuery(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  const query: Record<string, string> = {}
  params.forEach((value, key) => {
    query[key] = value
  })
  return query
}

/**
 * Matches a pathname against a route pattern.
 *
 * Supports dynamic segments with `:param` syntax.
 *
 * @param pathname - Current URL pathname (e.g., "/users/123")
 * @param routePath - Route pattern (e.g., "/users/:id")
 * @returns Object with `matches` boolean and extracted `params`
 *
 * @example
 * ```tsx
 * const result = matchPath('/users/123', '/users/:id');
 * // { matches: true, params: { id: '123' } }
 * ```
 */
export function matchPath(
  pathname: string,
  routePath: string
): { matches: boolean; params: Record<string, string> } {
  const paramNames: string[] = []
  const regexPath = routePath.replace(/:([^/]+)/g, (_, paramName) => {
    paramNames.push(paramName)
    return '([^/]+)'
  })

  const regex = new RegExp(`^${regexPath}$`)
  const match = pathname.match(regex)

  if (!match) {
    return { matches: false, params: {} }
  }

  const params: Record<string, string> = {}
  match.slice(1).forEach((value, index) => {
    params[paramNames[index]] = value
  })

  return { matches: true, params }
}
