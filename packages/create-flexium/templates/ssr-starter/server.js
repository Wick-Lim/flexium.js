import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import compression from 'compression'
import serveStatic from 'serve-static'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173

async function createServer() {
  const app = express()

  // Compression middleware
  app.use(compression())

  let vite
  if (!isProduction) {
    // Create Vite server in middleware mode
    const { createServer: createViteServer } = await import('vite')
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    // Use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    // Serve static files in production
    app.use(serveStatic(resolve(__dirname, 'dist/client'), { index: false }))
  }

  // Serve all routes with SSR
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      // 1. Read index.html
      let template
      let render
      if (!isProduction) {
        // Load fresh template in development
        template = readFileSync(resolve(__dirname, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        // Import server entry point
        render = (await vite.ssrLoadModule('/src/server/entry-server.js')).render
      } else {
        template = readFileSync(resolve(__dirname, 'dist/client/index.html'), 'utf-8')
        render = (await import('./dist/server/entry-server.js')).render
      }

      // 2. Render app HTML
      const appHtml = await render(url)

      // 3. Inject app HTML into template
      const html = template.replace(`<!--ssr-outlet-->`, appHtml)

      // 4. Send response
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      // Handle SSR errors
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e)
      }
      next(e)
    }
  })

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

createServer()
