/**
 * Flexism Bundle Emitter
 *
 * Uses esbuild to generate server and client bundles
 */

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import type { CompilerOptions, TransformResult, BuildResult, BuildManifest, RouteInfo, LayoutManifestEntry, StreamManifestEntry } from './types'

export class Emitter {
  private options: CompilerOptions
  private transformResults: TransformResult[] = []
  private streamManifest: Record<string, StreamManifestEntry> = {}

  constructor(options: CompilerOptions) {
    this.options = options
  }

  addTransformResults(results: TransformResult[]): void {
    this.transformResults.push(...results)
  }

  setStreamManifest(streams: Record<string, StreamManifestEntry>): void {
    this.streamManifest = streams
  }

  async emit(): Promise<BuildResult> {
    const startTime = Date.now()

    // Ensure output directories exist
    const serverOutDir = path.join(this.options.outDir, 'server')
    const clientOutDir = path.join(this.options.outDir, 'client')

    await fs.promises.mkdir(serverOutDir, { recursive: true })
    await fs.promises.mkdir(clientOutDir, { recursive: true })

    // Separate layouts from pages/routes
    const layoutResults: TransformResult[] = []
    const pageRouteResults: TransformResult[] = []

    // Collect unique error/loading files
    const errorFiles = new Set<string>()
    const loadingFiles = new Set<string>()

    for (const result of this.transformResults) {
      if (result.route.fileType === 'layout') {
        layoutResults.push(result)
      } else {
        pageRouteResults.push(result)
      }

      // Collect error/loading file paths
      if (result.route.errorModule) {
        errorFiles.add(result.route.errorModule)
      }
      if (result.route.loadingModule) {
        loadingFiles.add(result.route.loadingModule)
      }
    }

    // Process layouts first and build module map
    const layoutModules: Record<string, LayoutManifestEntry> = {}
    const serverEntries: string[] = []
    const clientEntries: string[] = []

    for (const result of layoutResults) {
      // Use file path as key for lookup
      const layoutKey = result.filePath
      const moduleName = this.filePathToModuleName(result.filePath, 'layout')

      // Write server code (use .tsx for JSX support)
      if (result.serverCode) {
        const serverFileName = `${moduleName}.server.tsx`
        const serverPath = path.join(serverOutDir, serverFileName)
        await fs.promises.writeFile(serverPath, result.serverCode)
        serverEntries.push(serverPath)
      }

      // Write client code (use .tsx for JSX support)
      if (result.clientCode) {
        const clientFileName = `${moduleName}.client.tsx`
        const clientPath = path.join(clientOutDir, clientFileName)
        await fs.promises.writeFile(clientPath, result.clientCode)
        clientEntries.push(clientPath)
      }

      // Add to layout modules map
      layoutModules[layoutKey] = {
        module: `${moduleName}.server.js`,
        hasLoader: result.route.hydrateProps.length > 0,
      }
    }

    // Process error files
    const errorModules: Record<string, string> = {}
    for (const errorFilePath of errorFiles) {
      const moduleName = this.filePathToModuleName(errorFilePath, 'error')
      const source = await fs.promises.readFile(errorFilePath, 'utf-8')

      // Write error component as server module
      const serverFileName = `${moduleName}.server.tsx`
      const serverPath = path.join(serverOutDir, serverFileName)
      await fs.promises.writeFile(serverPath, source)
      serverEntries.push(serverPath)

      errorModules[errorFilePath] = `${moduleName}.server.js`
    }

    // Process loading files
    const loadingModules: Record<string, string> = {}
    for (const loadingFilePath of loadingFiles) {
      const moduleName = this.filePathToModuleName(loadingFilePath, 'loading')
      const source = await fs.promises.readFile(loadingFilePath, 'utf-8')

      // Write loading component as server module
      const serverFileName = `${moduleName}.server.tsx`
      const serverPath = path.join(serverOutDir, serverFileName)
      await fs.promises.writeFile(serverPath, source)
      serverEntries.push(serverPath)

      loadingModules[loadingFilePath] = `${moduleName}.server.js`
    }

    // Process pages and routes - group by route path for API routes with multiple methods
    const routes: RouteInfo[] = []
    const groupedByPath = new Map<string, TransformResult[]>()

    for (const result of pageRouteResults) {
      const existing = groupedByPath.get(result.route.path)
      if (existing) {
        existing.push(result)
      } else {
        groupedByPath.set(result.route.path, [result])
      }
    }

    for (const [routePath, results] of groupedByPath) {
      const moduleName = this.routePathToModuleName(routePath)
      const firstResult = results[0]

      // Combine server code from all exports
      const combinedServerCode = results
        .filter(r => r.serverCode)
        .map(r => r.serverCode)
        .join('\n\n')

      // Write combined server code (use .tsx for JSX support)
      if (combinedServerCode) {
        const serverFileName = `${moduleName}.server.tsx`
        const serverPath = path.join(serverOutDir, serverFileName)
        await fs.promises.writeFile(serverPath, combinedServerCode)
        serverEntries.push(serverPath)
      }

      // Combine client code from all exports
      const combinedClientCode = results
        .filter(r => r.clientCode)
        .map(r => r.clientCode)
        .join('\n\n')

      // Write combined client code (use .tsx for JSX support)
      if (combinedClientCode) {
        const clientFileName = `${moduleName}.client.tsx`
        const clientPath = path.join(clientOutDir, clientFileName)
        await fs.promises.writeFile(clientPath, combinedClientCode)
        clientEntries.push(clientPath)
      }

      // Add route info for each export
      for (const result of results) {
        // Set module paths
        if (combinedServerCode) {
          result.route.serverModule = `${moduleName}.server.js`
        }
        if (combinedClientCode) {
          result.route.clientModule = `${moduleName}.client.js`
        }

        // Convert layout file paths to module names
        const layoutModuleNames: string[] = []
        for (const layoutPath of result.route.layouts) {
          const entry = layoutModules[layoutPath]
          if (entry) {
            layoutModuleNames.push(entry.module)
          }
        }
        result.route.layouts = layoutModuleNames

        // Convert error/loading file paths to module names
        if (result.route.errorModule && errorModules[result.route.errorModule]) {
          result.route.errorModule = errorModules[result.route.errorModule]
        }
        if (result.route.loadingModule && loadingModules[result.route.loadingModule]) {
          result.route.loadingModule = loadingModules[result.route.loadingModule]
        }

        routes.push(result.route)
      }
    }

    // Transpile server files individually
    let serverBundle = serverOutDir
    if (serverEntries.length > 0) {
      await this.transpileServerFiles(serverEntries, serverOutDir)
    }

    // Bundle client code into single file
    let clientBundle = ''
    if (clientEntries.length > 0) {
      clientBundle = await this.bundleClient(clientEntries, clientOutDir)
    }

    // Write manifest
    const manifest: BuildManifest = {
      routes,
      layouts: layoutModules,
      middlewares: {}, // TODO: add middleware support
      errors: errorModules,
      loadings: loadingModules,
      streams: this.streamManifest,
    }
    const manifestPath = path.join(this.options.outDir, 'manifest.json')
    await fs.promises.writeFile(
      manifestPath,
      JSON.stringify(manifest, null, 2)
    )

    const buildTime = Date.now() - startTime

    return {
      serverBundle,
      clientBundle,
      manifestPath,
      buildTime,
    }
  }

  /**
   * Convert file path to module name
   * /app/src/layout.tsx → _layout
   * /app/src/dashboard/layout.tsx → _dashboard_layout
   */
  private filePathToModuleName(filePath: string, type: string): string {
    const relativePath = path.relative(this.options.srcDir, filePath)
    const dir = path.dirname(relativePath)

    if (dir === '.') {
      return `_${type}`
    }

    return '_' + dir
      .replace(/\//g, '_')
      .replace(/\[/g, '$')
      .replace(/\]/g, '')
      .replace(/\.\.\./g, '$$')
      + `_${type}`
  }

  /**
   * Convert route path to module name
   * /users/:id → _users_$id
   * / → _index
   */
  private routePathToModuleName(routePath: string): string {
    if (routePath === '/') {
      return '_index'
    }

    return routePath
      .replace(/^\//, '_')
      .replace(/\//g, '_')
      .replace(/:/g, '$')
      .replace(/\.\.\./g, '$$')
  }

  /**
   * Build esbuild define config with env vars
   */
  private getDefineConfig(publicOnly: boolean = false): Record<string, string> {
    const define: Record<string, string> = {
      'process.env.NODE_ENV': this.options.mode === 'production'
        ? '"production"'
        : '"development"',
    }

    // Add env vars if provided
    if (this.options.env) {
      const prefix = this.options.publicEnvPrefix || 'FLEXISM_PUBLIC_'

      for (const [key, value] of Object.entries(this.options.env)) {
        // For client, only include public vars
        if (publicOnly && !key.startsWith(prefix)) {
          continue
        }
        define[`process.env.${key}`] = JSON.stringify(value)
      }
    }

    return define
  }

  /**
   * Transpile server files individually (not bundled)
   * This allows dynamic imports at runtime
   */
  private async transpileServerFiles(entries: string[], outDir: string): Promise<void> {
    await esbuild.build({
      entryPoints: entries,
      outdir: outDir,
      format: 'esm',
      platform: 'node',
      target: this.options.target || 'es2022',
      minify: this.options.minify,
      sourcemap: this.options.sourcemap,
      // Don't bundle - keep as individual files
      bundle: false,
      // Keep imports external for runtime resolution
      packages: 'external',
      // Server gets all env vars
      define: this.getDefineConfig(false),
    })
  }

  private async bundleClient(entries: string[], outDir: string): Promise<string> {
    const outfile = path.join(outDir, 'index.js')

    // Create a virtual entry point that imports and hydrates client modules
    const imports: string[] = []

    // Build route matching info for each client module
    const routeConfigs: Array<{ route: string; idx: number; baseName: string }> = []

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const baseName = path.basename(entry, '.tsx').replace('.client', '')
      // Convert _counter -> /counter, _todos -> /todos, _index -> /
      let routePath = baseName.replace(/^_/, '/').replace(/_/g, '/')
      if (routePath === '/index') routePath = '/'

      imports.push(`import * as client_${i} from './${path.basename(entry)}'`)
      routeConfigs.push({ route: routePath, idx: i, baseName })
    }

    // Generate route-based hydration code
    const routeCases = routeConfigs.map(({ route, idx, baseName }) => {
      return `  if (path === '${route}') {
    // Hydrate ${baseName}
    const hydrateFn = Object.values(client_${idx}).find(fn => typeof fn === 'function' && fn.name.startsWith('hydrateComponent'))
    if (hydrateFn) {
      const container = document.querySelector('main') || document.body
      hydrateFn(container, state)
    }
  }`
    }).join(' else ')

    const entryContent = `${imports.join('\n')}

// Route-based hydration - only hydrate component for current route
if (typeof window !== 'undefined') {
  const state = window.__FLEXISM_STATE__ || {}
  const path = window.location.pathname

${routeCases}
}
`

    const entryPath = path.join(outDir, '_entry.tsx')
    await fs.promises.writeFile(entryPath, entryContent)

    await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      outfile,
      format: 'esm',
      platform: 'browser',
      target: this.options.target || 'es2022',
      minify: this.options.minify,
      sourcemap: this.options.sourcemap,
      // Configure JSX
      jsx: 'automatic',
      jsxImportSource: 'flexium',
      // Bundle everything for browser (no external modules)
      // Client only gets public env vars
      define: this.getDefineConfig(true),
      treeShaking: false,  // Keep all exports to ensure components are bundled
    })

    // Clean up entry file
    await fs.promises.unlink(entryPath)

    return outfile
  }
}

/**
 * Emit bundles from transform results
 */
export async function emitBundles(
  options: CompilerOptions,
  transformResults: TransformResult[]
): Promise<BuildResult> {
  const emitter = new Emitter(options)
  emitter.addTransformResults(transformResults)
  return emitter.emit()
}
