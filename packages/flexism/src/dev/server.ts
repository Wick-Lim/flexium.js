/**
 * Flexism Dev Server
 *
 * Development server with HMR (Hot Module Replacement)
 */

import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import { createCompiler } from '../compiler'
import { createRequestHandler, clearAllCaches } from '../server/handler'
import { createStaticHandler } from '../server/static'
import { HMRManager, getHMRClientScript, injectHMRScript } from './hmr'
import { getBuildCache } from '../compiler/incremental'
import { MemoryMonitor, formatBytes } from '../utils/memory'
import type { CompilerOptions, BuildResult } from '../compiler/types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DevServerOptions {
  /** Source directory */
  srcDir: string
  /** Output directory */
  outDir?: string
  /** Port to listen on */
  port?: number
  /** Host to bind to */
  host?: string
  /** Public directory for static files */
  publicDir?: string
  /** Enable HMR */
  hmr?: boolean
  /** Enable CSS hot reload (no page refresh) */
  cssHotReload?: boolean
  /** Open browser on start */
  open?: boolean
  /** Enable memory monitoring */
  memoryMonitor?: boolean
  /** Memory warning threshold in MB */
  memoryWarningMB?: number
  /** Custom request handler */
  onRequest?: (request: Request) => Promise<Response | null>
}


// ─────────────────────────────────────────────────────────────────────────────
// Dev Server
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create and start a development server
 *
 * @example
 * ```ts
 * const server = await createDevServer({
 *   srcDir: './src',
 *   port: 3000,
 *   hmr: true,
 * })
 *
 * console.log(`Dev server running at ${server.url}`)
 *
 * // Stop server
 * await server.close()
 * ```
 */
export async function createDevServer(options: DevServerOptions) {
  const {
    srcDir,
    outDir = '.flexism',
    port = 3000,
    host = 'localhost',
    publicDir = 'public',
    hmr = true,
    cssHotReload = true,
    open = false,
    memoryMonitor = true,
    memoryWarningMB = 500,
    onRequest,
  } = options

  // Initialize compiler
  const compiler = createCompiler({
    srcDir,
    outDir,
    mode: 'development',
  })

  // Initialize build cache
  const buildCache = getBuildCache()

  // Initial build
  console.log('[flexism] Starting dev server...')
  let buildResult = await compiler.compile()
  console.log(`[flexism] Initial build completed in ${buildResult.buildTime}ms`)

  // Create request handler
  let requestHandler = await createRequestHandler({
    manifestPath: buildResult.manifestPath,
    serverDir: path.join(outDir, 'server'),
    clientBundle: '/_flexism/client/index.js',
    dev: true,
  })

  // Static file handlers
  const publicHandler = publicDir && fs.existsSync(publicDir)
    ? createStaticHandler({ publicDir, cache: false })
    : null

  const clientHandler = createStaticHandler({
    publicDir: path.join(outDir, 'client'),
    prefix: '/_flexism/client',
    cache: false,
  })

  // Initialize memory monitor
  let monitor: MemoryMonitor | null = null
  if (memoryMonitor) {
    monitor = new MemoryMonitor({
      interval: 30000,
      thresholds: {
        warning: memoryWarningMB * 1024 * 1024,
        critical: memoryWarningMB * 2 * 1024 * 1024,
      },
      onEvent: (type, stats) => {
        if (type === 'warning') {
          console.warn(`[flexism] Memory warning: ${formatBytes(stats.current.heapUsed)} used`)
        } else if (type === 'critical') {
          console.error(`[flexism] Memory critical: ${formatBytes(stats.current.heapUsed)} used`)
          // Clear caches to free memory
          clearAllCaches()
          buildCache.clear()
          console.log('[flexism] Caches cleared to reduce memory usage')
        } else if (type === 'recovered') {
          console.log(`[flexism] Memory recovered: ${formatBytes(stats.current.heapUsed)}`)
        }
      },
    })
    monitor.start()
  }

  // Initialize HMR manager
  let hmrManager: HMRManager | null = null

  if (hmr) {
    hmrManager = new HMRManager({
      srcDir,
      outDir,
      cssHotReload,
      granularUpdates: true,
      debounceMs: 100,
    })

    // Handle file changes
    hmrManager.on('update', async (update) => {
      // CSS updates don't need rebuild
      if (update.type === 'css-update') {
        console.log(`[flexism] CSS updated: ${path.basename(update.file)}`)
        return
      }

      console.log(`[flexism] File changed: ${path.basename(update.file)}`)

      try {
        // Clear caches
        clearAllCaches()

        // Invalidate build cache for changed file
        buildCache.invalidate(update.file)

        // Rebuild
        const startTime = Date.now()
        buildResult = await compiler.compile()
        console.log(`[flexism] Rebuilt in ${Date.now() - startTime}ms`)

        // Recreate handler with new manifest
        requestHandler = await createRequestHandler({
          manifestPath: buildResult.manifestPath,
          serverDir: path.join(outDir, 'server'),
          clientBundle: '/_flexism/client/index.js',
          dev: true,
        })
      } catch (error) {
        console.error('[flexism] Build error:', error)
        hmrManager!.sendError(String(error))
      }
    })

    hmrManager.start()

    // Keep-alive interval
    setInterval(() => hmrManager!.keepAlive(), 30000)
  }

  // Create HTTP server
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${host}:${port}`)
      const request = toWebRequest(req, url)

      // HMR endpoint
      if (url.pathname === '/__hmr' && hmrManager) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        })

        const clientId = hmrManager.addClient(
          (data) => res.write(data),
          () => res.end()
        )

        req.on('close', () => {
          hmrManager!.removeClient(clientId)
        })

        return
      }

      // Custom request handler
      if (onRequest) {
        const customResponse = await onRequest(request)
        if (customResponse) {
          await sendResponse(res, customResponse)
          return
        }
      }

      // Client bundle
      if (url.pathname.startsWith('/_flexism/client')) {
        const result = await clientHandler(request)
        if (result.served) {
          // Inject HMR client
          if (url.pathname.endsWith('/index.js') && hmrManager) {
            const body = await result.response.text()
            const hmrClient = getHMRClientScript()
            await sendResponse(res, new Response(hmrClient + '\n' + body, {
              headers: result.response.headers,
            }))
            return
          }
          await sendResponse(res, result.response)
          return
        }
      }

      // Public static files
      if (publicHandler) {
        const result = await publicHandler(request)
        if (result.served) {
          await sendResponse(res, result.response)
          return
        }
      }

      // SSR handler
      const response = await requestHandler(request)

      // Inject HMR script into HTML
      if (hmrManager && response.headers.get('Content-Type')?.includes('text/html')) {
        const html = await response.text()
        const injected = injectHMRScript(html)
        await sendResponse(res, new Response(injected, {
          status: response.status,
          headers: response.headers,
        }))
        return
      }

      await sendResponse(res, response)
    } catch (error) {
      console.error('[flexism] Request error:', error)
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })

  // Start listening
  await new Promise<void>((resolve) => {
    server.listen(port, host, () => {
      resolve()
    })
  })

  const serverUrl = `http://${host}:${port}`
  console.log(`[flexism] Dev server running at ${serverUrl}`)

  // Open browser
  if (open) {
    const { exec } = await import('child_process')
    const command = process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'
    exec(`${command} ${serverUrl}`)
  }

  return {
    url: serverUrl,
    port,
    host,
    hmr: hmrManager,
    memory: monitor,
    buildCache,

    async close() {
      // Stop HMR manager
      hmrManager?.stop()

      // Stop memory monitor
      monitor?.stop()

      // Clear build cache
      buildCache.clear()

      // Close HTTP server
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      console.log('[flexism] Dev server stopped')
    },

    broadcast(message: object) {
      if (hmrManager) {
        hmrManager.broadcast({
          type: 'full-reload',
          file: '',
          timestamp: Date.now(),
          ...message,
        })
      }
    },

    /** Get memory stats */
    getMemoryStats() {
      return monitor?.getStats() ?? null
    },

    /** Get build cache stats */
    getCacheStats() {
      return buildCache.stats()
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function toWebRequest(req: http.IncomingMessage, url: URL): Request {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method || '')
      ? undefined
      : req as unknown as ReadableStream,
  })
}

async function sendResponse(res: http.ServerResponse, response: Response) {
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })
  res.writeHead(response.status, headers)

  if (response.body) {
    const reader = response.body.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    } finally {
      reader.releaseLock()
    }
  }

  res.end()
}


// ─────────────────────────────────────────────────────────────────────────────
// CLI Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start dev server from CLI
 */
export async function startDevServer(args: string[] = process.argv.slice(2)) {
  const options: DevServerOptions = {
    srcDir: './src',
    port: 3000,
  }

  // Parse CLI args
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--port' || arg === '-p') {
      options.port = parseInt(args[++i], 10)
    } else if (arg === '--host' || arg === '-h') {
      options.host = args[++i]
    } else if (arg === '--src') {
      options.srcDir = args[++i]
    } else if (arg === '--open' || arg === '-o') {
      options.open = true
    } else if (arg === '--no-hmr') {
      options.hmr = false
    }
  }

  const server = await createDevServer(options)

  // Handle shutdown
  process.on('SIGINT', async () => {
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await server.close()
    process.exit(0)
  })

  return server
}
