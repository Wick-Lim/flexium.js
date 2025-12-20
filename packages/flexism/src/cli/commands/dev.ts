import { resolve } from 'path'
import { createServer } from 'http'
import { createCompiler } from '../../compiler'

const cyan = '\x1b[36m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'
const dim = '\x1b[2m'

export async function dev() {
  const cwd = process.cwd()
  const port = parseInt(process.env.PORT || '3000', 10)

  console.log(`
${cyan}${bold}  ╔═══════════════════════════════════╗
  ║      flexism dev server           ║
  ╚═══════════════════════════════════╝${reset}
`)

  console.log(`${green}Starting development server...${reset}\n`)

  // Create compiler with dev settings
  const compiler = createCompiler({
    srcDir: resolve(cwd, 'src'),
    outDir: resolve(cwd, '.flexism'),
    minify: false,
    sourcemap: true,
    target: 'esnext',
  })

  // Start watching and compiling
  await compiler.watch((result) => {
    console.log(`${dim}[${new Date().toLocaleTimeString()}]${reset} ${green}Rebuilt in ${result.buildTime}ms${reset}`)
  })

  // Create dev server
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${port}`)

    // Serve static files from .flexism/client
    if (url.pathname.startsWith('/_flexism/')) {
      const filePath = resolve(cwd, '.flexism/client', url.pathname.replace('/_flexism/', ''))
      try {
        const { readFile } = await import('fs/promises')
        const content = await readFile(filePath)
        res.writeHead(200, { 'Content-Type': getContentType(filePath) })
        res.end(content)
        return
      } catch {
        res.writeHead(404)
        res.end('Not found')
        return
      }
    }

    // Handle SSR for routes
    try {
      const html = await renderRoute(url.pathname, resolve(cwd, '.flexism'))
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    } catch (error) {
      console.error(`${yellow}Render error:${reset}`, error)
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
    server.close()
    process.exit(0)
  })
}

async function renderRoute(pathname: string, outDir: string): Promise<string> {
  // Load manifest
  const { readFile } = await import('fs/promises')
  const manifestPath = resolve(outDir, 'manifest.json')

  let manifest
  try {
    const content = await readFile(manifestPath, 'utf-8')
    manifest = JSON.parse(content)
  } catch {
    manifest = { routes: [] }
  }

  // Find matching route
  const route = manifest.routes?.find((r: any) =>
    matchRoute(pathname, r.route)
  )

  // Generate HTML shell
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexism App</title>
</head>
<body>
  <div id="app">
    ${route ? `<!-- Route: ${route.route} -->` : '<!-- No matching route -->'}
  </div>
  <script type="module" src="/_flexism/index.js"></script>
</body>
</html>`
}

function matchRoute(pathname: string, pattern: string): boolean {
  // Simple route matching (TODO: implement full pattern matching)
  const patternParts = pattern.split('/')
  const pathParts = pathname.split('/')

  if (patternParts.length !== pathParts.length) return false

  return patternParts.every((part, i) => {
    if (part.startsWith(':')) return true
    return part === pathParts[i]
  })
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
