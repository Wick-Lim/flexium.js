/**
 * Flexism Middleware Execution
 *
 * Executes middleware chain before route handlers
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MiddlewareContext {
  /** Request object */
  request: Request
  /** URL parameters */
  params: Record<string, string>
  /** Proceed to next middleware or route handler */
  next: () => Promise<Response>
}

export type MiddlewareHandler = (
  request: Request,
  context: MiddlewareContext
) => Response | void | Promise<Response | void>

export interface MiddlewareModule {
  /** File path of the middleware */
  path: string
  /** Middleware handler function */
  handler: MiddlewareHandler
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Cache
// ─────────────────────────────────────────────────────────────────────────────

const moduleCache = new Map<string, MiddlewareModule>()

/**
 * Load a middleware module
 */
export async function loadMiddleware(
  middlewarePath: string
): Promise<MiddlewareModule> {
  // Check cache
  const cached = moduleCache.get(middlewarePath)
  if (cached) return cached

  // Dynamic import
  const mod = await import(middlewarePath)
  const handler = mod.middleware || mod.default

  if (typeof handler !== 'function') {
    throw new Error(
      `Middleware at ${middlewarePath} must export a 'middleware' or 'default' function`
    )
  }

  const module: MiddlewareModule = {
    path: middlewarePath,
    handler,
  }

  moduleCache.set(middlewarePath, module)
  return module
}

/**
 * Clear module cache (for development HMR)
 */
export function clearMiddlewareCache(): void {
  moduleCache.clear()
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware Chain Execution
// ─────────────────────────────────────────────────────────────────────────────

export interface ExecuteMiddlewareOptions {
  /** Request object */
  request: Request
  /** URL parameters */
  params: Record<string, string>
  /** Middleware file paths (outermost first) */
  middlewarePaths: string[]
  /** Final handler to call after all middleware */
  handler: () => Promise<Response>
}

/**
 * Execute middleware chain
 *
 * Middleware are executed outermost → innermost → handler
 * Each middleware can:
 * - Return a Response to short-circuit
 * - Return void/undefined to continue to next
 * - Call next() explicitly to continue (for async operations after)
 *
 * @example
 * ```ts
 * // middleware.ts
 * export async function middleware(request, ctx) {
 *   const session = await getSession(request)
 *   if (!session) {
 *     return Response.redirect('/login')
 *   }
 *   // Continue to next middleware or handler
 * }
 * ```
 */
export async function executeMiddlewareChain(
  options: ExecuteMiddlewareOptions
): Promise<Response> {
  const { request, params, middlewarePaths, handler } = options

  // Load all middleware modules
  const middlewares: MiddlewareModule[] = []
  for (const path of middlewarePaths) {
    try {
      const mod = await loadMiddleware(path)
      middlewares.push(mod)
    } catch (error) {
      console.error(`[flexism] Failed to load middleware: ${path}`, error)
      // Skip failed middleware in development
    }
  }

  // Create chain executor
  let index = 0

  const next = async (): Promise<Response> => {
    // All middleware executed, call final handler
    if (index >= middlewares.length) {
      return handler()
    }

    const middleware = middlewares[index++]

    // Create context for this middleware
    const context: MiddlewareContext = {
      request,
      params,
      next,
    }

    // Execute middleware
    const result = await middleware.handler(request, context)

    // If middleware returned a Response, use it
    if (result instanceof Response) {
      return result
    }

    // Otherwise, continue to next middleware
    return next()
  }

  return next()
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a redirect response
 */
export function redirect(url: string, status: 302 | 301 | 307 | 308 = 302): Response {
  return new Response(null, {
    status,
    headers: { Location: url },
  })
}

/**
 * Create a JSON response
 */
export function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}
