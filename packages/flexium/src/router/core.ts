/**
 * Router Core Module
 *
 * Provides core routing functionality including location management,
 * path matching, and navigation.
 */

import { SignalNode } from '../core/signal'
import { Location } from './types'

/**
 * Creates a reactive location signal and navigate function.
 *
 * The location signal automatically updates when:
 * - navigate() is called
 * - Browser back/forward buttons are used (popstate event)
 *
 * @returns Tuple of [location signal, navigate function, cleanup function]
 *
 * @example
 * ```tsx
 * const [location, navigate, cleanup] = createLocation();
 * // Access current path
 * console.log(location().pathname);
 * // Navigate to new path
 * navigate('/users/123');
 * // Cleanup when done (removes popstate listener)
 * cleanup();
 * ```
 */
export function createLocation(): [SignalNode<Location>, (path: string) => void, () => void] {
  // SSR guard: return safe defaults on server
  const getDefaultLoc = (): Location => ({
    pathname: '/',
    search: '',
    hash: '',
    query: {},
  })

  const getLoc = (): Location => {
    if (typeof window === 'undefined') {
      return getDefaultLoc()
    }
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      query: parseQuery(window.location.search),
    }
  }

  const loc = new SignalNode(getLoc())

  const navigate = (path: string) => {
    // SSR guard
    if (typeof window === 'undefined') return

    // Security: Validate path to prevent javascript: and other dangerous protocols
    if (isUnsafePath(path)) {
      console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
      return
    }
    window.history.pushState({}, '', path)
    loc.set(getLoc())
  }

  // SSR guard for popstate listener
  const handlePopState = () => {
    try {
      loc.set(getLoc())
    } catch (error) {
      console.error('[Flexium Router] Error handling popstate:', error)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState)
  }

  // Cleanup function to remove listener
  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', handlePopState)
    }
  }

  return [loc, navigate, cleanup]
}

/**
 * Check if a path contains unsafe protocols (XSS prevention)
 * @param path - Path to validate
 * @returns true if path is unsafe
 */
export function isUnsafePath(path: string): boolean {
  const normalizedPath = path.trim().toLowerCase()
  const unsafeProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  return unsafeProtocols.some(protocol => normalizedPath.startsWith(protocol))
}

/**
 * Sanitize query parameter value to prevent XSS
 * @param value - Query parameter value
 * @returns Sanitized value
 */
export function sanitizeQueryValue(value: string): string {
  // Remove potential script tags and event handlers
  return value
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
}

/**
 * Parses URL search string into key-value object
 * @param search - URL search string (e.g., "?foo=bar&baz=qux")
 * @returns Object with query parameters
 */
// Dangerous keys that could lead to prototype pollution
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function parseQuery(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  // Use Object.create(null) to prevent prototype pollution
  const query: Record<string, string> = Object.create(null)
  params.forEach((value, key) => {
    // Sanitize both key and value to prevent XSS
    const sanitizedKey = sanitizeQueryValue(key)
    const sanitizedValue = sanitizeQueryValue(value)
    // Block dangerous keys to prevent prototype pollution
    if (sanitizedKey && !DANGEROUS_KEYS.has(sanitizedKey)) {
      query[sanitizedKey] = sanitizedValue
    }
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
