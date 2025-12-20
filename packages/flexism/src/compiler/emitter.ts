/**
 * Flexism Bundle Emitter
 *
 * Uses esbuild to generate server and client bundles
 */

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import type { CompilerOptions, TransformResult, BuildResult, BuildManifest, RouteInfo } from './types'

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

    // Write transformed files
    const serverEntries: string[] = []
    const clientEntries: string[] = []
    const routes: RouteInfo[] = []

    for (const result of this.transformResults) {
      const baseName = path.basename(result.filePath, path.extname(result.filePath))
      const routeDir = path.dirname(result.filePath).replace(/.*routes\/?/, '')

      // Write server code
      if (result.serverCode) {
        const serverFileName = routeDir
          ? `${routeDir.replace(/\//g, '_')}_${baseName}.server.ts`
          : `${baseName}.server.ts`
        const serverPath = path.join(serverOutDir, serverFileName)
        await fs.promises.writeFile(serverPath, result.serverCode)
        serverEntries.push(serverPath)
      }

      // Write client code
      if (result.clientCode) {
        const clientFileName = routeDir
          ? `${routeDir.replace(/\//g, '_')}_${baseName}.client.ts`
          : `${baseName}.client.ts`
        const clientPath = path.join(clientOutDir, clientFileName)
        await fs.promises.writeFile(clientPath, result.clientCode)
        clientEntries.push(clientPath)
      }

      // Collect route info
      routes.push(result.route)
    }

    // Bundle server code
    let serverBundle = ''
    if (serverEntries.length > 0) {
      serverBundle = await this.bundleServer(serverEntries, serverOutDir)
    }

    // Bundle client code
    let clientBundle = ''
    if (clientEntries.length > 0) {
      clientBundle = await this.bundleClient(clientEntries, clientOutDir)
    }

    // Write manifest
    const manifest: BuildManifest = { routes }
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

  private async bundleServer(entries: string[], outDir: string): Promise<string> {
    const outfile = path.join(outDir, 'index.js')

    await esbuild.build({
      entryPoints: entries,
      bundle: true,
      outfile,
      format: 'esm',
      platform: 'node',
      target: this.options.target || 'es2022',
      minify: this.options.minify,
      sourcemap: this.options.sourcemap,
      external: [
        // Node built-ins
        'fs',
        'path',
        'crypto',
        'http',
        'https',
        'net',
        'os',
        'child_process',
        'stream',
        'util',
        'events',
        // Keep flexium external
        'flexium',
        'flexium/*',
      ],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    })

    return outfile
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
