import { createServer, IncomingMessage, ServerResponse } from 'http'
import { existsSync, readFileSync, statSync } from 'fs'
import { resolve, join, extname } from 'path'

const cyan = '\x1b[36m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const red = '\x1b[31m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

export async function start() {
  const cwd = process.cwd()
  const distDir = resolve(cwd, 'dist')
  const port = parseInt(process.env.PORT || '3000', 10)
  const host = process.env.HOST || '0.0.0.0'

  // Check if dist exists
  if (!existsSync(distDir)) {
    console.error(`${red}Build output not found at ./dist${reset}`)
    console.log(`Run ${cyan}flexism build${reset} first`)
    process.exit(1)
  }

  console.log(`
${cyan}${bold}  ╔═══════════════════════════════════╗
  ║      flexism production server    ║
  ╚═══════════════════════════════════╝${reset}
`)

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '/'
    let filePath = join(distDir, url === '/' ? 'index.html' : url)

    // Security: prevent directory traversal
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      // Try adding .html
      if (existsSync(filePath + '.html')) {
        filePath = filePath + '.html'
      }
      // SPA fallback - serve index.html for non-file routes
      else if (!extname(filePath)) {
        filePath = join(distDir, 'index.html')
      }
    }

    // Check again after fallback
    if (!existsSync(filePath)) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }

    // Check if it's a directory
    const stat = statSync(filePath)
    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html')
      if (!existsSync(filePath)) {
        res.writeHead(404)
        res.end('Not Found')
        return
      }
    }

    // Get MIME type
    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    try {
      const content = readFileSync(filePath)

      // Cache headers for assets
      if (ext !== '.html') {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'no-cache')
      }

      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    } catch (error) {
      console.error(`Error serving ${filePath}:`, error)
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })

  server.listen(port, host, () => {
    console.log(`${green}Server running at:${reset}`)
    console.log(`  ${cyan}http://localhost:${port}${reset}`)
    if (host === '0.0.0.0') {
      console.log(`  ${cyan}http://${getLocalIP()}:${port}${reset}`)
    }
    console.log(`\n${yellow}Press Ctrl+C to stop${reset}\n`)
  })

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log(`\n${yellow}Shutting down...${reset}`)
    server.close()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    server.close()
    process.exit(0)
  })
}

function getLocalIP(): string {
  const { networkInterfaces } = require('os')
  const nets = networkInterfaces()

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}
