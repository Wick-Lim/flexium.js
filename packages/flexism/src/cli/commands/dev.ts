import { resolve } from 'path'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { Readable } from 'stream'
import { createCompiler } from '../../compiler'
import { createRequestHandler, clearAllCaches } from '../../server/handler'
import { createInjectorStream, pipeToResponse } from '../../utils/stream'

const cyan = '\x1b[36m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'
const dim = '\x1b[2m'

// SSE clients for HMR
const hmrClients = new Set<ServerResponse>()

// HMR client script
const HMR_SCRIPT = `
<script>
(function() {
  var hmr = new EventSource('/__flexism_hmr');
  hmr.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'reload') {
      console.log('[flexism] Reloading...');
      hmr.close();
      location.reload();
    }
  };
  hmr.onerror = function() {
    console.log('[flexism] HMR disconnected');
  };
  window.addEventListener('beforeunload', function() {
    hmr.close();
  });
  window.addEventListener('pagehide', function() {
    hmr.close();
  });
})();
</script>`

export async function dev() {
  const cwd = process.cwd()
  const port = parseInt(process.env.PORT || '3000', 10)
  const outDir = resolve(cwd, '.flexism')

  console.log(`
${cyan}${bold}  ╔═══════════════════════════════════╗
  ║      flexism dev server           ║
  ╚═══════════════════════════════════╝${reset}
`)

  console.log(`${green}Starting development server...${reset}\n`)

  // Create compiler with dev settings
  const compiler = createCompiler({
    srcDir: resolve(cwd, 'src'),
    outDir,
    minify: false,
    sourcemap: true,
    target: 'esnext',
  })

  // Start watching and compiling
  await compiler.watch((result) => {
    console.log(`${dim}[${new Date().toLocaleTimeString()}]${reset} ${green}Rebuilt in ${result.buildTime}ms${reset}`)

    // Clear caches on rebuild
    clearAllCaches()

    // Notify all HMR clients
    broadcastHMR({ type: 'reload', buildTime: result.buildTime })
  })

  // Create request handler
  let handler = await createRequestHandler({
    manifestPath: resolve(outDir, 'manifest.json'),
    serverDir: resolve(outDir, 'server'),
    clientBundle: '/_flexism/index.js',
    dev: true,
  })

  // Create dev server
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${port}`)

    // Handle HMR SSE endpoint
    if (url.pathname === '/__flexism_hmr') {
      handleHMR(req, res)
      return
    }

    // Serve static files from .flexism/client (except SSE endpoints)
    if (url.pathname.startsWith('/_flexism/') && !url.pathname.startsWith('/_flexism/sse/')) {
      await serveStaticFile(req, res, cwd, url.pathname)
      return
    }

    // Handle routes via request handler
    try {
      const webRequest = toWebRequest(req, port)
      const response = await handler(webRequest)

      // Build headers (exclude content-length for streaming)
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-length') {
          headers[key] = value
        }
      })

      // Inject HMR script into HTML responses using streaming
      const contentType = response.headers.get('Content-Type') || ''
      if (contentType.includes('text/html') && response.body) {
        const injector = createInjectorStream('</body>', HMR_SCRIPT)
        const injectedStream = response.body.pipeThrough(injector)

        res.writeHead(response.status, {
          ...headers,
          'Content-Type': 'text/html; charset=utf-8',
        })
        await pipeToResponse(injectedStream, res)
      } else if (response.body) {
        // Non-HTML response - stream directly (zero-copy)
        res.writeHead(response.status, headers)
        await pipeToResponse(response.body, res)
      } else {
        // No body
        res.writeHead(response.status, headers)
        res.end()
      }
    } catch (error) {
      console.error(`${yellow}Request error:${reset}`, error)
      res.writeHead(500)
      res.end(`<pre>Error: ${error}</pre>`)
    }
  })

  server.listen(port, () => {
    console.log(`
${green}${bold}✓ Dev server ready${reset}

  ${dim}Local:${reset}   ${cyan}http://localhost:${port}${reset}
  ${dim}Network:${reset} ${cyan}http://${getNetworkAddress()}:${port}${reset}

  ${dim}Press Ctrl+C to stop${reset}
`)
  })

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log(`\n${dim}Shutting down...${reset}`)
    // Close all HMR connections
    for (const client of hmrClients) {
      client.end()
    }
    server.close()
    process.exit(0)
  })
}

/**
 * Handle SSE connection for HMR
 */
function handleHMR(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n')

  // Add to clients set
  hmrClients.add(res)

  // Remove on close
  req.on('close', () => {
    hmrClients.delete(res)
  })
}

/**
 * Broadcast HMR message to all clients
 */
function broadcastHMR(message: { type: string; [key: string]: any }) {
  const data = `data: ${JSON.stringify(message)}\n\n`
  for (const client of hmrClients) {
    client.write(data)
  }
}

/**
 * Serve static files from .flexism/client
 */
async function serveStaticFile(
  req: IncomingMessage,
  res: ServerResponse,
  cwd: string,
  pathname: string
) {
  const filePath = resolve(cwd, '.flexism/client', pathname.replace('/_flexism/', ''))
  try {
    const { readFile } = await import('fs/promises')
    const content = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': getContentType(filePath) })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

/**
 * Convert Node.js IncomingMessage to Web Request
 */
function toWebRequest(req: IncomingMessage, port: number): Request {
  const url = new URL(req.url || '/', `http://localhost:${port}`)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  const method = req.method || 'GET'

  // For methods with body, pass the Node.js stream as a web ReadableStream
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body = hasBody ? (Readable.toWeb(req) as ReadableStream<Uint8Array>) : undefined

  return new Request(url.toString(), {
    method,
    headers,
    body,
    // @ts-expect-error - duplex is needed for streaming body
    duplex: hasBody ? 'half' : undefined,
  })
}

/**
 * Inject HMR script into HTML
 */
function injectHMRScript(html: string): string {
  // Inject before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${HMR_SCRIPT}</body>`)
  }
  // Inject before </html>
  if (html.includes('</html>')) {
    return html.replace('</html>', `${HMR_SCRIPT}</html>`)
  }
  // Append to end
  return html + HMR_SCRIPT
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()
  const types: Record<string, string> = {
    js: 'application/javascript',
    mjs: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json',
    map: 'application/json',
  }
  return types[ext || ''] || 'application/octet-stream'
}

function getNetworkAddress(): string {
  try {
    const { networkInterfaces } = require('os')
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address
        }
      }
    }
  } catch {}
  return '0.0.0.0'
}
