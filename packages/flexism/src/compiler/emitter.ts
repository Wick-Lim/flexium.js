/**
 * Flexism Bundle Emitter
 *
 * Uses esbuild to generate server and client bundles
 */

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import type { CompilerOptions, TransformResult, BuildResult, BuildManifest, RouteInfo, LayoutManifestEntry } from './types'

export class Emitter {
  private options: CompilerOptions
  private transformResults: TransformResult[] = []

  constructor(options: CompilerOptions) {
    this.options = options
  }

  addTransformResults(results: TransformResult[]): void {
    this.transformResults.push(...results)
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

    for (const result of this.transformResults) {
      if (result.route.fileType === 'layout') {
        layoutResults.push(result)
      } else {
        pageRouteResults.push(result)
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

      // Write server code
      if (result.serverCode) {
        const serverFileName = `${moduleName}.server.ts`
        const serverPath = path.join(serverOutDir, serverFileName)
        await fs.promises.writeFile(serverPath, result.serverCode)
        serverEntries.push(serverPath)
      }

      // Write client code
      if (result.clientCode) {
        const clientFileName = `${moduleName}.client.ts`
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

    // Process pages and routes
    const routes: RouteInfo[] = []

    for (const result of pageRouteResults) {
      const moduleName = this.routePathToModuleName(result.route.path)

      // Write server code
      if (result.serverCode) {
        const serverFileName = `${moduleName}.server.ts`
        const serverPath = path.join(serverOutDir, serverFileName)
        await fs.promises.writeFile(serverPath, result.serverCode)
        serverEntries.push(serverPath)
        result.route.serverModule = `${moduleName}.server.js`
      }

      // Write client code
      if (result.clientCode) {
        const clientFileName = `${moduleName}.client.ts`
        const clientPath = path.join(clientOutDir, clientFileName)
        await fs.promises.writeFile(clientPath, result.clientCode)
        clientEntries.push(clientPath)
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

      routes.push(result.route)
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
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    })
  }

  private async bundleClient(entries: string[], outDir: string): Promise<string> {
    const outfile = path.join(outDir, 'index.js')

    await esbuild.build({
      entryPoints: entries,
      bundle: true,
      outfile,
      format: 'esm',
      platform: 'browser',
      target: this.options.target || 'es2022',
      minify: this.options.minify,
      sourcemap: this.options.sourcemap,
      external: [
        // Flexium is loaded separately
        'flexium',
        'flexium/*',
      ],
      define: {
        'process.env.NODE_ENV': '"production"',
        'typeof window': '"object"',
      },
      treeShaking: true,
    })

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
