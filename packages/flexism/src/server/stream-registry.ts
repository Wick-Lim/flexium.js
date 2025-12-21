/**
 * Stream Registry
 *
 * Runtime registry for Stream SSE handlers.
 * Populated at build time, used at runtime to handle SSE requests.
 */

import * as path from 'path'
import { sse } from './sse'

export type StreamHandler = (
  params: Record<string, string>
) => AsyncIterable<unknown> | AsyncGenerator<unknown, void, unknown>

interface RegisteredStream {
  id: string
  handler: StreamHandler
  modulePath: string
}

class StreamRegistry {
  private handlers = new Map<string, RegisteredStream>()

  /**
   * Register a stream handler
   */
  register(id: string, handler: StreamHandler, modulePath: string): void {
    this.handlers.set(id, { id, handler, modulePath })
  }

  /**
   * Register multiple handlers from a module's __streamHandlers export
   */
  registerModule(
    handlers: Record<string, StreamHandler>,
    modulePath: string
  ): void {
    for (const [id, handler] of Object.entries(handlers)) {
      this.register(id, handler, modulePath)
    }
  }

  /**
   * Get a stream handler by ID
   */
  get(id: string): RegisteredStream | undefined {
    return this.handlers.get(id)
  }

  /**
   * Check if a stream handler exists
   */
  has(id: string): boolean {
    return this.handlers.has(id)
  }

  /**
   * Get all registered stream IDs
   */
  getIds(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Clear all handlers (for HMR)
   */
  clear(): void {
    this.handlers.clear()
  }

  /**
   * Handle SSE request for a stream
   */
  async handleRequest(
    id: string,
    request: Request
  ): Promise<Response> {
    const registered = this.handlers.get(id)

    if (!registered) {
      return new Response(`Stream not found: ${id}`, { status: 404 })
    }

    // Extract params from URL query string
    const url = new URL(request.url)
    const params: Record<string, string> = {}
    for (const [key, value] of url.searchParams) {
      params[key] = value
    }

    try {
      // Create async generator from handler
      const iterable = registered.handler(params)

      // Create SSE response
      const { headers, body } = sse(iterable)

      return new Response(body, { headers })
    } catch (error) {
      console.error(`[flexism] Stream handler error for ${id}:`, error)
      return new Response(
        JSON.stringify({ error: 'Stream handler error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}

// Global singleton
export const streamRegistry = new StreamRegistry()

/**
 * Load stream handlers from manifest with security validation
 */
export async function loadStreamHandlers(
  manifest: { streams?: Record<string, { handlerModule: string }> },
  serverDir: string
): Promise<void> {
  if (!manifest.streams) return

  const resolvedServerDir = path.resolve(serverDir)

  for (const [id, entry] of Object.entries(manifest.streams)) {
    try {
      // Validate handler module name format
      if (!isValidHandlerModule(entry.handlerModule)) {
        console.error(`[flexism] Invalid handler module name: ${entry.handlerModule}`)
        continue
      }

      // Resolve and validate path is within serverDir (prevent path traversal)
      const modulePath = path.resolve(resolvedServerDir, entry.handlerModule)
      if (!modulePath.startsWith(resolvedServerDir + path.sep)) {
        console.error(`[flexism] Path traversal blocked: ${entry.handlerModule}`)
        continue
      }

      const module = await import(modulePath)

      if (module.__streamHandlers?.[id]) {
        streamRegistry.register(id, module.__streamHandlers[id], modulePath)
      }
    } catch (error) {
      console.error(`[flexism] Failed to load stream handler ${id}:`, error)
    }
  }
}

/**
 * Validate handler module name follows expected pattern
 */
function isValidHandlerModule(name: string): boolean {
  // Must start with __stream_ and end with .js
  // Only allow alphanumeric, underscore, and dot
  return /^__stream_[a-zA-Z0-9_]+\.js$/.test(name)
}
