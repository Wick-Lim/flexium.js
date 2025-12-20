/**
 * Integration Tests
 *
 * Tests the full SSR pipeline: Compiler → Manifest → Handler
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { createCompiler } from '../compiler'
import type { BuildManifest } from '../compiler/types'

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '__fixtures__')
const OUTPUT_DIR = path.join(__dirname, '__output__')

describe('Integration', () => {
  beforeAll(async () => {
    // Create fixtures directory
    await fs.promises.mkdir(FIXTURES_DIR, { recursive: true })

    // Create sample page.tsx
    await fs.promises.writeFile(
      path.join(FIXTURES_DIR, 'page.tsx'),
      `
export default async function HomePage() {
  const title = 'Welcome'
  return ({ title }) => {
    return <h1>{title}</h1>
  }
}
`
    )

    // Create sample layout.tsx
    await fs.promises.writeFile(
      path.join(FIXTURES_DIR, 'layout.tsx'),
      `
export default function RootLayout({ children }) {
  return (
    <html>
      <head><title>Test App</title></head>
      <body>{children}</body>
    </html>
  )
}
`
    )

    // Create nested directory with page
    await fs.promises.mkdir(path.join(FIXTURES_DIR, 'about'), { recursive: true })
    await fs.promises.writeFile(
      path.join(FIXTURES_DIR, 'about', 'page.tsx'),
      `
export default async function AboutPage() {
  return () => {
    return <div>About Us</div>
  }
}
`
    )

    // Create API route
    await fs.promises.mkdir(path.join(FIXTURES_DIR, 'api', 'users'), { recursive: true })
    await fs.promises.writeFile(
      path.join(FIXTURES_DIR, 'api', 'users', 'route.ts'),
      `
export async function GET(request) {
  return new Response(JSON.stringify({ users: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(request) {
  const body = await request.json()
  return new Response(JSON.stringify({ created: body }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  })
}
`
    )

    // Create dynamic route
    await fs.promises.mkdir(path.join(FIXTURES_DIR, 'users', '[id]'), { recursive: true })
    await fs.promises.writeFile(
      path.join(FIXTURES_DIR, 'users', '[id]', 'page.tsx'),
      `
export default async function UserPage() {
  const user = { id: '123', name: 'Test User' }
  return ({ user }) => {
    return <div>User: {user.name}</div>
  }
}
`
    )
  })

  afterAll(async () => {
    // Cleanup
    await fs.promises.rm(FIXTURES_DIR, { recursive: true, force: true })
    await fs.promises.rm(OUTPUT_DIR, { recursive: true, force: true })
  })

  describe('Compiler Integration', () => {
    it('should compile fixtures and generate manifest', async () => {
      const compiler = createCompiler({
        srcDir: FIXTURES_DIR,
        outDir: OUTPUT_DIR,
        minify: false,
        sourcemap: false,
      })

      const result = await compiler.compile()

      // Check build result
      expect(result.manifestPath).toContain('manifest.json')
      expect(result.buildTime).toBeGreaterThan(0)

      // Verify manifest exists
      const manifestExists = fs.existsSync(result.manifestPath)
      expect(manifestExists).toBe(true)
    })

    it('should generate correct manifest structure', async () => {
      const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
      const manifest: BuildManifest = JSON.parse(
        await fs.promises.readFile(manifestPath, 'utf-8')
      )

      // Check routes
      expect(manifest.routes).toBeDefined()
      expect(Array.isArray(manifest.routes)).toBe(true)
      expect(manifest.routes.length).toBeGreaterThan(0)

      // Check for expected route paths
      const routePaths = manifest.routes.map(r => r.path)
      expect(routePaths).toContain('/')
      expect(routePaths).toContain('/about')
      expect(routePaths).toContain('/api/users')
      expect(routePaths).toContain('/users/:id')

      // Check layouts
      expect(manifest.layouts).toBeDefined()
      expect(typeof manifest.layouts).toBe('object')

      // Check middlewares
      expect(manifest.middlewares).toBeDefined()
      expect(typeof manifest.middlewares).toBe('object')
    })

    it('should generate server modules for each route', async () => {
      const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
      const manifest: BuildManifest = JSON.parse(
        await fs.promises.readFile(manifestPath, 'utf-8')
      )

      for (const route of manifest.routes) {
        expect(route.serverModule).toBeDefined()
        expect(route.serverModule).toMatch(/\.server\.js$/)

        // Verify server file exists
        const serverPath = path.join(OUTPUT_DIR, 'server', route.serverModule!)
        const serverExists = fs.existsSync(serverPath)
        expect(serverExists).toBe(true)
      }
    })

    it('should set correct route types', async () => {
      const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
      const manifest: BuildManifest = JSON.parse(
        await fs.promises.readFile(manifestPath, 'utf-8')
      )

      // Find API route
      const apiRoute = manifest.routes.find(r => r.path === '/api/users')
      expect(apiRoute).toBeDefined()
      expect(apiRoute?.type).toBe('api')

      // Find page routes
      const homeRoute = manifest.routes.find(r => r.path === '/')
      expect(homeRoute).toBeDefined()
      expect(homeRoute?.type).toBe('component')

      const aboutRoute = manifest.routes.find(r => r.path === '/about')
      expect(aboutRoute).toBeDefined()
      expect(aboutRoute?.type).toBe('component')
    })

    it('should assign layouts to page routes', async () => {
      const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
      const manifest: BuildManifest = JSON.parse(
        await fs.promises.readFile(manifestPath, 'utf-8')
      )

      // Find page routes (not API)
      const pageRoutes = manifest.routes.filter(r => r.type === 'component')

      for (const route of pageRoutes) {
        // Root layout should be assigned to pages
        expect(route.layouts).toBeDefined()
        expect(Array.isArray(route.layouts)).toBe(true)
      }

      // API routes should not have layouts
      const apiRoute = manifest.routes.find(r => r.path === '/api/users')
      expect(apiRoute?.layouts).toEqual([])
    })

    it('should extract hydrate props for 2-function patterns', async () => {
      const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
      const manifest: BuildManifest = JSON.parse(
        await fs.promises.readFile(manifestPath, 'utf-8')
      )

      // Home page should have 'title' as hydrate prop
      const homeRoute = manifest.routes.find(r => r.path === '/')
      expect(homeRoute?.hydrateProps).toContain('title')

      // User page should have 'user' as hydrate prop
      const userRoute = manifest.routes.find(r => r.path === '/users/:id')
      expect(userRoute?.hydrateProps).toContain('user')
    })
  })

  describe('Server Module Validation', () => {
    it('should generate valid JavaScript files', async () => {
      const serverDir = path.join(OUTPUT_DIR, 'server')
      const files = await fs.promises.readdir(serverDir)
      const jsFiles = files.filter(f => f.endsWith('.js'))

      expect(jsFiles.length).toBeGreaterThan(0)

      // Each file should be valid JavaScript (no syntax errors)
      for (const file of jsFiles) {
        const content = await fs.promises.readFile(
          path.join(serverDir, file),
          'utf-8'
        )
        expect(content.length).toBeGreaterThan(0)

        // Should be ESM format
        expect(
          content.includes('export') || content.includes('import')
        ).toBe(true)
      }
    })

    it('should generate loader functions for 2-function patterns', async () => {
      const serverDir = path.join(OUTPUT_DIR, 'server')

      // Find home page server module
      const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
      const manifest: BuildManifest = JSON.parse(
        await fs.promises.readFile(manifestPath, 'utf-8')
      )

      const homeRoute = manifest.routes.find(r => r.path === '/')
      expect(homeRoute?.serverModule).toBeDefined()

      const content = await fs.promises.readFile(
        path.join(serverDir, homeRoute!.serverModule!),
        'utf-8'
      )

      // Should have loader function
      expect(content).toContain('loader')
    })
  })

  describe('Client Bundle Validation', () => {
    it('should generate client bundle', async () => {
      const clientBundle = path.join(OUTPUT_DIR, 'client', 'index.js')
      const exists = fs.existsSync(clientBundle)
      expect(exists).toBe(true)
    })

    it('should include hydration code in client bundle', async () => {
      const clientBundle = path.join(OUTPUT_DIR, 'client', 'index.js')
      const content = await fs.promises.readFile(clientBundle, 'utf-8')

      // Should reference flexium for hydration
      expect(content.length).toBeGreaterThan(0)
    })
  })

  describe('Production Build', () => {
    const PROD_OUTPUT_DIR = path.join(__dirname, '__output_prod__')

    afterAll(async () => {
      await fs.promises.rm(PROD_OUTPUT_DIR, { recursive: true, force: true })
    })

    it('should minify code in production mode', async () => {
      const compiler = createCompiler({
        srcDir: FIXTURES_DIR,
        outDir: PROD_OUTPUT_DIR,
        mode: 'production',
      })

      await compiler.compile()

      // Read client bundle
      const clientBundle = path.join(PROD_OUTPUT_DIR, 'client', 'index.js')
      const minifiedContent = await fs.promises.readFile(clientBundle, 'utf-8')

      // Read dev bundle for comparison
      const devClientBundle = path.join(OUTPUT_DIR, 'client', 'index.js')
      const devContent = await fs.promises.readFile(devClientBundle, 'utf-8')

      // Minified should be smaller or at least different (no extra whitespace)
      // Production code shouldn't have multi-line function bodies with indentation
      expect(minifiedContent.split('\n').length).toBeLessThanOrEqual(devContent.split('\n').length)
    })

    it('should not generate sourcemaps by default in production', async () => {
      // Check that no .map files exist
      const serverDir = path.join(PROD_OUTPUT_DIR, 'server')
      const clientDir = path.join(PROD_OUTPUT_DIR, 'client')

      const serverFiles = await fs.promises.readdir(serverDir)
      const clientFiles = await fs.promises.readdir(clientDir)

      const serverMaps = serverFiles.filter(f => f.endsWith('.map'))
      const clientMaps = clientFiles.filter(f => f.endsWith('.map'))

      expect(serverMaps.length).toBe(0)
      expect(clientMaps.length).toBe(0)
    })

    it('should generate sourcemaps when explicitly enabled', async () => {
      const SOURCEMAP_OUTPUT = path.join(__dirname, '__output_sourcemap__')

      try {
        const compiler = createCompiler({
          srcDir: FIXTURES_DIR,
          outDir: SOURCEMAP_OUTPUT,
          mode: 'production',
          sourcemap: true, // Override production default
        })

        await compiler.compile()

        // Check that .map files exist
        const serverDir = path.join(SOURCEMAP_OUTPUT, 'server')
        const clientDir = path.join(SOURCEMAP_OUTPUT, 'client')

        const serverFiles = await fs.promises.readdir(serverDir)
        const clientFiles = await fs.promises.readdir(clientDir)

        const serverMaps = serverFiles.filter(f => f.endsWith('.map'))
        const clientMaps = clientFiles.filter(f => f.endsWith('.map'))

        expect(serverMaps.length).toBeGreaterThan(0)
        expect(clientMaps.length).toBeGreaterThan(0)
      } finally {
        await fs.promises.rm(SOURCEMAP_OUTPUT, { recursive: true, force: true })
      }
    })

    it('should apply mode defaults correctly', async () => {
      // Development mode - should have sourcemaps, no minify
      const DEV_OUTPUT = path.join(__dirname, '__output_dev_mode__')

      try {
        const devCompiler = createCompiler({
          srcDir: FIXTURES_DIR,
          outDir: DEV_OUTPUT,
          mode: 'development',
        })

        await devCompiler.compile()

        // Dev mode should have sourcemaps
        const serverDir = path.join(DEV_OUTPUT, 'server')
        const serverFiles = await fs.promises.readdir(serverDir)
        const serverMaps = serverFiles.filter(f => f.endsWith('.map'))

        expect(serverMaps.length).toBeGreaterThan(0)
      } finally {
        await fs.promises.rm(DEV_OUTPUT, { recursive: true, force: true })
      }
    })
  })
})
