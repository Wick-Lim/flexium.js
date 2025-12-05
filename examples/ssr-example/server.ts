/**
 * Express Server with SSR
 *
 * This server:
 * 1. Renders the App component to HTML using renderToString()
 * 2. Injects the HTML into an HTML template
 * 3. Serves the HTML to the browser
 * 4. Serves the client bundle for hydration
 */

import express from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const port = process.env.PORT || 3000
const isProduction = process.env.NODE_ENV === 'production'

// In development, we use Vite's dev server for HMR
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      // 1. Read index.html
      let template = readFileSync(resolve(__dirname, 'index.html'), 'utf-8')

      // 2. Apply Vite HTML transforms (injects HMR client, etc)
      template = await vite.transformIndexHtml(url, template)

      // 3. Load the server entry (App component)
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')

      // 4. Render the app to HTML
      const appHtml = await render()

      // 5. Inject the app HTML into the template
      const html = template.replace('<!--app-html-->', appHtml)

      // 6. Send the rendered HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      // If an error occurs, let Vite fix the stack trace
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })
} else {
  // Production mode: serve pre-built static files
  app.use(express.static(resolve(__dirname, 'dist/client')))

  app.use('*', async (req, res) => {
    try {
      // 1. Read the built index.html
      const template = readFileSync(
        resolve(__dirname, 'dist/client/index.html'),
        'utf-8'
      )

      // 2. Import the built server module
      const { render } = await import('./dist/server/entry-server.js')

      // 3. Render the app to HTML
      const appHtml = await render()

      // 4. Inject the app HTML
      const html = template.replace('<!--app-html-->', appHtml)

      // 5. Send the rendered HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      console.error((e as Error).stack)
      res.status(500).end((e as Error).stack)
    }
  })
}

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
  console.log(`📦 Mode: ${isProduction ? 'production' : 'development'}`)
})
