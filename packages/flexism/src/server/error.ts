/**
 * Flexism Error Handling
 *
 * Centralized error handling for SSR with dev/prod mode support
 */

import { renderToString } from 'flexium/server'
import type { FNodeChild } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FlexismError {
  /** Error message */
  message: string
  /** Error stack trace (dev only) */
  stack?: string
  /** HTTP status code */
  statusCode: number
  /** Error digest for logging */
  digest: string
  /** Original error */
  cause?: Error
}

export interface ErrorComponentProps {
  error: FlexismError
  reset: () => void
}

export interface ErrorModule {
  default: (props: ErrorComponentProps) => FNodeChild
}

export interface ErrorHandlerOptions {
  /** Enable development mode (shows stack traces) */
  dev?: boolean
  /** Server directory for error modules */
  serverDir?: string
  /** Custom error logger */
  logger?: (error: FlexismError) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Cache
// ─────────────────────────────────────────────────────────────────────────────

const errorModuleCache = new Map<string, ErrorModule | null>()

export function clearErrorCache(): void {
  errorModuleCache.clear()
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Creation
// ─────────────────────────────────────────────────────────────────────────────

let digestCounter = 0

/**
 * Create a FlexismError from any error
 */
export function createFlexismError(
  error: unknown,
  statusCode: number = 500
): FlexismError {
  const digest = `FLEXISM-${Date.now()}-${++digestCounter}`

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      statusCode,
      digest,
      cause: error,
    }
  }

  return {
    message: String(error),
    statusCode,
    digest,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Rendering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render error to HTML response
 */
export function renderErrorResponse(
  error: FlexismError,
  options: ErrorHandlerOptions = {}
): Response {
  const { dev = false, logger } = options

  // Log error
  if (logger) {
    logger(error)
  } else {
    console.error(`[flexism] Error ${error.digest}:`, error.cause || error.message)
  }

  // Generate error HTML
  const html = dev
    ? renderDevError(error)
    : renderProdError(error)

  return new Response(html, {
    status: error.statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

/**
 * Development error page with full details
 */
function renderDevError(error: FlexismError): string {
  const stackHtml = error.stack
    ? `<pre class="stack">${escapeHtml(error.stack)}</pre>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error: ${escapeHtml(error.message)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #fff;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .error-badge {
      display: inline-block;
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #f87171;
    }
    .message {
      background: #2a2a2a;
      border: 1px solid #404040;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
    }
    .stack {
      background: #0d0d0d;
      border: 1px solid #333;
      border-radius: 0.5rem;
      padding: 1rem;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.75rem;
      line-height: 1.6;
      overflow-x: auto;
      color: #a0a0a0;
    }
    .digest {
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="error-badge">${error.statusCode}</span>
    <h1>Server Error</h1>
    <div class="message">${escapeHtml(error.message)}</div>
    ${stackHtml}
    <div class="digest">Digest: ${error.digest}</div>
  </div>
</body>
</html>`
}

/**
 * Production error page (minimal info)
 */
function renderProdError(error: FlexismError): string {
  const title = getStatusTitle(error.statusCode)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${error.statusCode} - ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .container { padding: 2rem; }
    h1 {
      font-size: 4rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 1.5rem;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${error.statusCode}</h1>
    <p>${title}</p>
    <a href="/">Go back home</a>
  </div>
</body>
</html>`
}

function getStatusTitle(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'Bad Request'
    case 401: return 'Unauthorized'
    case 403: return 'Forbidden'
    case 404: return 'Page Not Found'
    case 405: return 'Method Not Allowed'
    case 500: return 'Internal Server Error'
    case 502: return 'Bad Gateway'
    case 503: return 'Service Unavailable'
    default: return 'Error'
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Error Component Support
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render error using a custom error component
 */
function renderErrorComponent(
  ErrorComponent: (props: ErrorComponentProps) => FNodeChild,
  error: FlexismError,
  dev: boolean
): Response {
  const resetScript = `<script>window.__flexism_reset = () => location.reload()</script>`

  const props: ErrorComponentProps = {
    error: dev ? error : { ...error, stack: undefined },
    reset: () => {}, // Client-side only
  }

  const content = ErrorComponent(props)
  const { html } = renderToString(content, { hydrate: false })

  const finalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error</title>
</head>
<body>
  ${html}
  ${resetScript}
</body>
</html>`

  return new Response(finalHtml, {
    status: error.statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

/**
 * Try to render using custom error.tsx component
 */
export async function renderCustomError(
  error: FlexismError,
  errorModulePath: string | undefined,
  options: ErrorHandlerOptions = {}
): Promise<Response | null> {
  if (!errorModulePath) return null

  const { dev = false, serverDir } = options
  if (!serverDir) return null

  const fullPath = `${serverDir}/${errorModulePath}`

  try {
    // Check cache first
    if (errorModuleCache.has(fullPath)) {
      const cached = errorModuleCache.get(fullPath)
      if (!cached || !cached.default) {
        return null
      }
      // Render using cached module
      const ErrorComponent = cached.default
      return renderErrorComponent(ErrorComponent, error, dev)
    }

    // Try to load the module
    let errorModule: ErrorModule
    try {
      errorModule = await import(fullPath)
      errorModuleCache.set(fullPath, errorModule)
    } catch {
      errorModuleCache.set(fullPath, null)
      return null
    }

    if (!errorModule.default) {
      return null
    }

    return renderErrorComponent(errorModule.default, error, dev)
  } catch (renderError) {
    console.error('[flexism] Failed to render custom error:', renderError)
    return null
  }
}
