/**
 * Flexism Request Handler
 *
 * Main entry point for handling HTTP requests with SSR
 */

import { renderToString } from 'flexium/server'
import type { FNodeChild } from '../types'
import { createRouter, type Router, type RouteMatch } from './router'
import { executeMiddlewareChain, clearMiddlewareCache } from './middleware'
import { composeLayouts, createDocumentShell, clearLayoutCache } from './layout'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RequestHandlerOptions {
  /** Path to manifest.json */
  manifestPath: string
  /** Path to server bundle directory */
  serverDir: string
  /** Path to client bundle (for script injection) */
  clientBundle: string
  /** Enable development mode features */
  dev?: boolean
}

export interface PageModule {
  /** Server loader function */
  loader?: (context: LoaderContext) => Promise<Record<string, unknown>>
  /** Client component function */
  Component?: (props: Record<string, unknown>) => FNodeChild
  /** Server-only component (no hydration) */
  default?: (props: Record<string, unknown>) => FNodeChild
}

export interface ApiModule {
  GET?: ApiHandler
  POST?: ApiHandler
  PUT?: ApiHandler
  DELETE?: ApiHandler
  PATCH?: ApiHandler
  HEAD?: ApiHandler
  OPTIONS?: ApiHandler
}

export interface LoaderContext {
  /** Request object */
  request: Request
  /** URL parameters */
  params: Record<string, string>
}

export type ApiHandler = (
  request: Request,
  context: LoaderContext
) => Response | Promise<Response>

export type RequestHandler = (request: Request) => Promise<Response>

// ─────────────────────────────────────────────────────────────────────────────
// Module Cache
// ─────────────────────────────────────────────────────────────────────────────

const pageModuleCache = new Map<string, PageModule>()
const apiModuleCache = new Map<string, ApiModule>()

/**
 * Clear all module caches (for HMR)
 */
export function clearAllCaches(): void {
  pageModuleCache.clear()
  apiModuleCache.clear()
  clearMiddlewareCache()
  clearLayoutCache()
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Handler Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a request handler for the Flexism application
 *
 * @example
 * ```ts
 * const handler = await createRequestHandler({
 *   manifestPath: '.flexism/manifest.json',
 *   serverDir: '.flexism/server',
 *   clientBundle: '/_flexism/index.js',
 * })
 *
 * // Use with Node.js HTTP server
 * http.createServer(async (req, res) => {
 *   const response = await handler(toWebRequest(req))
 *   // ... send response
 * })
 * ```
 */
export async function createRequestHandler(
  options: RequestHandlerOptions
): Promise<RequestHandler> {
  const { manifestPath, serverDir, clientBundle, dev = false } = options

  // Create router
  const router = createRouter({ manifestPath })
  await router.loadManifest()

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)

    // Reload manifest in dev mode for each request
    if (dev) {
      await router.loadManifest()
      clearAllCaches()
    }

    // Match route
    const match = router.match(url.pathname)

    if (!match) {
      return new Response('Not Found', { status: 404 })
    }

    // Execute middleware chain and route handler
    return executeMiddlewareChain({
      request,
      params: match.params,
      middlewarePaths: match.route.middlewares,
      handler: () => handleRoute(request, match, { serverDir, clientBundle }),
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Handling
// ─────────────────────────────────────────────────────────────────────────────

interface HandleRouteOptions {
  serverDir: string
  clientBundle: string
}

async function handleRoute(
  request: Request,
  match: RouteMatch,
  options: HandleRouteOptions
): Promise<Response> {
  const { route, params } = match
  const { serverDir, clientBundle } = options

  // Handle API routes
  if (route.type === 'api') {
    return handleApiRoute(request, match, serverDir)
  }

  // Handle page/component routes
  return handlePageRoute(request, match, { serverDir, clientBundle })
}

/**
 * Handle API route (GET, POST, etc.)
 */
async function handleApiRoute(
  request: Request,
  match: RouteMatch,
  serverDir: string
): Promise<Response> {
  const { route, params } = match

  // Get module path from manifest
  if (!route.serverModule) {
    console.error(`[flexism] No server module for route: ${route.path}`)
    return new Response('Internal Server Error', { status: 500 })
  }

  const modulePath = `${serverDir}/${route.serverModule}`
  let apiModule: ApiModule

  try {
    const cached = apiModuleCache.get(modulePath)
    if (cached) {
      apiModule = cached
    } else {
      apiModule = await import(modulePath)
      apiModuleCache.set(modulePath, apiModule)
    }
  } catch (error) {
    console.error(`[flexism] Failed to load API module: ${modulePath}`, error)
    return new Response('Internal Server Error', { status: 500 })
  }

  // Get handler for HTTP method
  const method = request.method.toUpperCase() as keyof ApiModule
  const handler = apiModule[method]

  if (!handler) {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: Object.keys(apiModule).join(', ') },
    })
  }

  // Execute handler
  try {
    return await handler(request, { request, params })
  } catch (error) {
    console.error(`[flexism] API handler error:`, error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

/**
 * Handle page route with SSR
 */
async function handlePageRoute(
  request: Request,
  match: RouteMatch,
  options: HandleRouteOptions
): Promise<Response> {
  const { route, params } = match
  const { serverDir, clientBundle } = options
  const context: LoaderContext = { request, params }

  // Get module path from manifest
  if (!route.serverModule) {
    console.error(`[flexism] No server module for route: ${route.path}`)
    return new Response('Internal Server Error', { status: 500 })
  }

  const modulePath = `${serverDir}/${route.serverModule}`
  let pageModule: PageModule

  try {
    const cached = pageModuleCache.get(modulePath)
    if (cached) {
      pageModule = cached
    } else {
      pageModule = await import(modulePath)
      pageModuleCache.set(modulePath, pageModule)
    }
  } catch (error) {
    console.error(`[flexism] Failed to load page module: ${modulePath}`, error)
    return new Response('Internal Server Error', { status: 500 })
  }

  // Execute loader to get page data
  let pageData: Record<string, unknown> = {}
  if (pageModule.loader) {
    try {
      pageData = await pageModule.loader(context)
    } catch (error) {
      console.error(`[flexism] Loader error:`, error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }

  // Get component (either hydrating or server-only)
  const PageComponent = pageModule.Component || pageModule.default
  if (!PageComponent) {
    console.error(`[flexism] No component found in: ${modulePath}`)
    return new Response('Internal Server Error', { status: 500 })
  }

  // Render page content
  let pageContent: FNodeChild
  try {
    pageContent = PageComponent(pageData)
  } catch (error) {
    console.error(`[flexism] Component render error:`, error)
    return new Response('Internal Server Error', { status: 500 })
  }

  // Compose with layouts
  let fullContent: FNodeChild
  try {
    fullContent = await composeLayouts({
      layoutModules: route.layouts,
      serverDir,
      pageContent,
      context: { request, params },
    })
  } catch (error) {
    console.error(`[flexism] Layout composition error:`, error)
    fullContent = pageContent
  }

  // Render to HTML
  try {
    const { html, state } = renderToString(fullContent, { hydrate: true })

    // Check if root layout provides full HTML document
    const isFullDocument = html.trimStart().startsWith('<!DOCTYPE') ||
                           html.trimStart().startsWith('<html')

    let finalHtml: string
    if (isFullDocument) {
      // Layout provides full document, just inject scripts
      finalHtml = injectScripts(html, clientBundle, state)
    } else {
      // Wrap in document shell
      finalHtml = createDocumentShell({
        content: html,
        scripts: [clientBundle],
        stateScript: state ? createStateScript(state) : '',
      })
    }

    return new Response(finalHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error(`[flexism] Render error:`, error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inject scripts into HTML document
 */
function injectScripts(html: string, clientBundle: string, state: any): string {
  const stateScript = state ? createStateScript(state) : ''
  const clientScript = `<script type="module" src="${clientBundle}"></script>`

  // Inject before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${stateScript}${clientScript}</body>`)
  }

  // Append to end if no </body>
  return html + stateScript + clientScript
}

/**
 * Create state serialization script
 */
function createStateScript(state: any): string {
  const json = JSON.stringify(state)
  return `<script>window.__FLEXISM_STATE__=${json}</script>`
}
