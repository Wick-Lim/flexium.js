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
  /** Open browser on start */
  open?: boolean
  /** Custom request handler */
  onRequest?: (request: Request) => Promise<Response | null>
}

interface HMRClient {
  id: string
  send: (data: string) => void
  close: () => void
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
    open = false,
    onRequest,
  } = options

  // Initialize compiler
  const compiler = createCompiler({
    srcDir,
    outDir,
    mode: 'development',
  })

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

  // HMR clients
  const hmrClients: Map<string, HMRClient> = new Map()
  let clientIdCounter = 0

  // File watcher
  let watcher: fs.FSWatcher | null = null

  if (hmr) {
    watcher = fs.watch(srcDir, { recursive: true }, async (event, filename) => {
      if (!filename) return

      // Ignore non-source files
      const ext = path.extname(filename)
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return

      console.log(`[flexism] File changed: ${filename}`)

      try {
        // Clear caches
        clearAllCaches()

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

        // Notify HMR clients
        broadcastHMR({ type: 'reload', file: filename })
      } catch (error) {
        console.error('[flexism] Build error:', error)
        broadcastHMR({ type: 'error', error: String(error) })
      }
    })
  }

  function broadcastHMR(message: object) {
    const data = JSON.stringify(message)
    for (const client of hmrClients.values()) {
      try {
        client.send(`data: ${data}\n\n`)
      } catch {
        hmrClients.delete(client.id)
      }
    }
  }

  // Create HTTP server
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${host}:${port}`)
      const request = toWebRequest(req, url)

      // HMR endpoint
      if (url.pathname === '/__hmr' && hmr) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        })

        const clientId = String(++clientIdCounter)
        const client: HMRClient = {
          id: clientId,
          send: (data) => res.write(data),
          close: () => res.end(),
        }

        hmrClients.set(clientId, client)

        // Send connected message
        client.send(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

        // Keep connection alive
        const keepAlive = setInterval(() => {
          client.send(': keepalive\n\n')
        }, 30000)

        req.on('close', () => {
          clearInterval(keepAlive)
          hmrClients.delete(clientId)
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
          if (url.pathname.endsWith('/index.js') && hmr) {
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
      if (hmr && response.headers.get('Content-Type')?.includes('text/html')) {
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

    async close() {
      watcher?.close()
      for (const client of hmrClients.values()) {
        client.close()
      }
      hmrClients.clear()
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      console.log('[flexism] Dev server stopped')
    },

    broadcast(message: object) {
      broadcastHMR(message)
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

function getHMRClientScript(): string {
  return `
// Flexism HMR Client
(function() {
  if (typeof window === 'undefined') return;

  var es = new EventSource('/__hmr');
  var reconnectTimer = null;

  es.onmessage = function(e) {
    try {
      var data = JSON.parse(e.data);
      console.log('[HMR]', data.type, data.file || '');

      if (data.type === 'reload') {
        window.location.reload();
      } else if (data.type === 'error') {
        console.error('[HMR] Build error:', data.error);
        showError(data.error);
      }
    } catch (err) {
      console.error('[HMR] Parse error:', err);
    }
  };

  es.onerror = function() {
    es.close();
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(function() {
        reconnectTimer = null;
        window.location.reload();
      }, 2000);
    }
  };

  function showError(error) {
    var overlay = document.getElementById('flexism-error-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'flexism-error-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);color:#ff5555;padding:20px;font-family:monospace;white-space:pre-wrap;z-index:99999;overflow:auto';
      document.body.appendChild(overlay);
    }
    overlay.textContent = 'Build Error:\\n\\n' + error;
    overlay.onclick = function() { overlay.remove(); };
  }
})();
`
}

function injectHMRScript(html: string): string {
  const script = `<script>${getHMRClientScript()}</script>`

  // Inject before </body> or at the end
  if (html.includes('</body>')) {
    return html.replace('</body>', script + '</body>')
  }
  return html + script
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
