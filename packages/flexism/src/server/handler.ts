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
import {
  createFlexismError,
  renderErrorResponse,
  renderCustomError,
  clearErrorCache,
  type FlexismError,
} from './error'
import { streamRegistry, loadStreamHandlers } from './stream-registry'

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
  clearErrorCache()
  streamRegistry.clear()
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

  // Load stream handlers from manifest
  const manifest = router.getManifest()
  if (manifest) {
    await loadStreamHandlers(manifest, serverDir)
  }

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)

    // Reload manifest in dev mode for each request
    if (dev) {
      await router.loadManifest()
      clearAllCaches()
      // Reload stream handlers
      const freshManifest = router.getManifest()
      if (freshManifest) {
        await loadStreamHandlers(freshManifest, serverDir)
      }
    }

    // Handle SSE stream endpoints
    if (url.pathname.startsWith('/_flexism/sse/')) {
      const streamId = url.pathname.replace('/_flexism/sse/', '')
      return streamRegistry.handleRequest(streamId, request)
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
      handler: () => handleRoute(request, match, { serverDir, clientBundle, dev }),
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Rendering Helper
// ─────────────────────────────────────────────────────────────────────────────

interface RenderErrorOptions {
  error: FlexismError
  errorModulePath?: string
  serverDir: string
  dev: boolean
}

/**
 * Render error response, trying custom error.tsx first
 */
async function renderRouteError(options: RenderErrorOptions): Promise<Response> {
  const { error, errorModulePath, serverDir, dev } = options

  // Try custom error component first
  if (errorModulePath) {
    const customResponse = await renderCustomError(error, errorModulePath, {
      dev,
      serverDir,
    })
    if (customResponse) {
      return customResponse
    }
  }

  // Fall back to default error response
  return renderErrorResponse(error, { dev })
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Handling
// ─────────────────────────────────────────────────────────────────────────────

interface HandleRouteOptions {
  serverDir: string
  clientBundle: string
  dev?: boolean
}

async function handleRoute(
  request: Request,
  match: RouteMatch,
  options: HandleRouteOptions
): Promise<Response> {
  const { route, params } = match
  const { serverDir, clientBundle, dev = false } = options

  // Handle API routes
  if (route.type === 'api') {
    return handleApiRoute(request, match, { serverDir, dev })
  }

  // Handle page/component routes
  return handlePageRoute(request, match, { serverDir, clientBundle, dev })
}

interface ApiRouteOptions {
  serverDir: string
  dev?: boolean
}

/**
 * Handle API route (GET, POST, etc.)
 */
async function handleApiRoute(
  request: Request,
  match: RouteMatch,
  options: ApiRouteOptions
): Promise<Response> {
  const { route, params } = match
  const { serverDir, dev = false } = options

  // Get module path from manifest
  if (!route.serverModule) {
    const error = createFlexismError(
      new Error(`No server module for route: ${route.path}`),
      500
    )
    return renderErrorResponse(error, { dev })
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
  } catch (err) {
    const error = createFlexismError(err, 500)
    return renderErrorResponse(error, { dev })
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
  } catch (err) {
    const error = createFlexismError(err, 500)
    return renderErrorResponse(error, { dev })
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
  const { serverDir, clientBundle, dev = false } = options
  const context: LoaderContext = { request, params }

  // Helper to render errors with custom error.tsx support
  const handleError = (err: unknown, statusCode = 500) => {
    const error = createFlexismError(err, statusCode)
    return renderRouteError({
      error,
      errorModulePath: route.errorModule,
      serverDir,
      dev,
    })
  }

  // Get module path from manifest
  if (!route.serverModule) {
    return handleError(new Error(`No server module for route: ${route.path}`))
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
  } catch (err) {
    return handleError(err)
  }

  // Execute loader to get page data
  let pageData: Record<string, unknown> = {}
  if (pageModule.loader) {
    try {
      pageData = await pageModule.loader(context)
    } catch (err) {
      return handleError(err)
    }
  }

  // Get component (either hydrating or server-only)
  const PageComponent = pageModule.Component || pageModule.default
  if (!PageComponent) {
    return handleError(new Error(`No component found in: ${modulePath}`))
  }

  // Render page content
  let pageContent: FNodeChild
  try {
    pageContent = PageComponent(pageData)
  } catch (err) {
    return handleError(err)
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
  } catch (err) {
    // Layout errors are non-fatal, fall back to page content
    console.error(`[flexism] Layout composition error:`, err)
    fullContent = pageContent
  }

  // Extract stream refs from page data
  const streamRefs = pageData.__streams as Record<string, unknown> | undefined

  // Render to HTML
  try {
    const { html, state } = renderToString(fullContent, { hydrate: true })

    // Merge loader data (pageData) with render state for client hydration
    const fullState = {
      ...state,
      ...pageData,
    }

    // Check if root layout provides full HTML document
    const isFullDocument = html.trimStart().startsWith('<!DOCTYPE') ||
                           html.trimStart().startsWith('<html')

    let finalHtml: string
    if (isFullDocument) {
      // Layout provides full document, just inject scripts
      finalHtml = injectScripts(html, clientBundle, fullState, streamRefs)
    } else {
      // Wrap in document shell
      const streamScript = streamRefs ? createStreamScript(streamRefs) : ''
      finalHtml = createDocumentShell({
        content: html,
        scripts: [clientBundle],
        stateScript: (fullState ? createStateScript(fullState) : '') + streamScript,
      })
    }

    return new Response(finalHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    return handleError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inject scripts into HTML document
 */
function injectScripts(
  html: string,
  clientBundle: string,
  state: any,
  streams?: Record<string, unknown>
): string {
  const stateScript = state ? createStateScript(state) : ''
  const streamScript = streams ? createStreamScript(streams) : ''
  const clientScript = `<script type="module" src="${clientBundle}"></script>`

  // Inject before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${stateScript}${streamScript}${clientScript}</body>`)
  }

  // Append to end if no </body>
  return html + stateScript + streamScript + clientScript
}

/**
 * Create state serialization script
 */
function createStateScript(state: any): string {
  const json = JSON.stringify(state)
  return `<script>window.__FLEXISM_STATE__=${json}</script>`
}

/**
 * Create stream refs serialization script
 */
function createStreamScript(streams: Record<string, unknown>): string {
  const json = JSON.stringify(streams)
  return `<script>window.__FLEXISM_STREAMS__=${json}</script>`
}
