/**
 * Flexism Router
 *
 * Route matching and module loading for SSR
 */

import type { RouteInfo, BuildManifest } from '../compiler/types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RouteMatch {
  /** Matched route info */
  route: RouteInfo
  /** Extracted URL parameters */
  params: Record<string, string>
}

export interface RouterOptions {
  /** Path to manifest.json */
  manifestPath: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export class Router {
  private manifest: BuildManifest | null = null
  private manifestPath: string
  private compiledPatterns: Map<string, CompiledPattern> = new Map()

  constructor(options: RouterOptions) {
    this.manifestPath = options.manifestPath
  }

  /**
   * Load or reload manifest
   */
  async loadManifest(): Promise<void> {
    const fs = await import('fs/promises')
    try {
      const content = await fs.readFile(this.manifestPath, 'utf-8')
      this.manifest = JSON.parse(content)
      this.compilePatterns()
    } catch {
      this.manifest = { routes: [], layouts: {}, middlewares: {}, errors: {}, loadings: {}, streams: {} }
    }
  }

  /**
   * Pre-compile route patterns for faster matching
   */
  private compilePatterns(): void {
    this.compiledPatterns.clear()

    for (const route of this.manifest?.routes ?? []) {
      const compiled = compilePattern(route.path)
      this.compiledPatterns.set(route.path, compiled)
    }
  }

  /**
   * Match a pathname against routes
   */
  match(pathname: string): RouteMatch | null {
    if (!this.manifest) return null

    // Normalize pathname
    const normalizedPath = normalizePath(pathname)

    for (const route of this.manifest.routes) {
      const pattern = this.compiledPatterns.get(route.path)
      if (!pattern) continue

      const params = matchPattern(pattern, normalizedPath)
      if (params !== null) {
        return { route, params }
      }
    }

    return null
  }

  /**
   * Get all routes
   */
  getRoutes(): RouteInfo[] {
    return this.manifest?.routes ?? []
  }

  /**
   * Get the full manifest
   */
  getManifest(): BuildManifest | null {
    return this.manifest
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern Matching
// ─────────────────────────────────────────────────────────────────────────────

interface CompiledPattern {
  /** Original pattern */
  pattern: string
  /** Regex for matching */
  regex: RegExp
  /** Parameter names in order */
  paramNames: string[]
  /** Whether this is a catch-all route */
  isCatchAll: boolean
}

/**
 * Compile a route pattern into a regex
 *
 * Examples:
 * - /users → /^\/users$/
 * - /users/:id → /^\/users\/([^/]+)$/
 * - /blog/:...slug → /^\/blog\/(.+)$/
 */
function compilePattern(pattern: string): CompiledPattern {
  const paramNames: string[] = []
  let isCatchAll = false

  // Escape special regex characters except our param markers
  let regexStr = pattern
    .split('/')
    .map((segment) => {
      // Catch-all parameter :...slug
      if (segment.startsWith(':...')) {
        const name = segment.slice(4)
        paramNames.push(name)
        isCatchAll = true
        return '(.+)'
      }

      // Named parameter :id
      if (segment.startsWith(':')) {
        const name = segment.slice(1)
        paramNames.push(name)
        return '([^/]+)'
      }

      // Static segment - escape regex special chars
      return escapeRegex(segment)
    })
    .join('/')

  // Add anchors
  regexStr = `^${regexStr}$`

  return {
    pattern,
    regex: new RegExp(regexStr),
    paramNames,
    isCatchAll,
  }
}

/**
 * Match a pathname against a compiled pattern
 * Returns params object if matched, null if not
 */
function matchPattern(
  compiled: CompiledPattern,
  pathname: string
): Record<string, string> | null {
  const match = pathname.match(compiled.regex)
  if (!match) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < compiled.paramNames.length; i++) {
    const name = compiled.paramNames[i]
    const value = match[i + 1]

    if (value !== undefined) {
      // For catch-all, split into array-like access via path
      params[name] = decodeURIComponent(value)
    }
  }

  return params
}

/**
 * Normalize pathname
 */
function normalizePath(pathname: string): string {
  // Remove trailing slash (except for root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  // Ensure leading slash
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname
  }

  return pathname
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a router instance
 */
export function createRouter(options: RouterOptions): Router {
  return new Router(options)
}
