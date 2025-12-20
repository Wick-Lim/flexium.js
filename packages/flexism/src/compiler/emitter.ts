/**
 * Flexism Bundle Emitter
 *
 * Uses esbuild to generate server and client bundles
 */

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import type { CompilerOptions, TransformResult, BuildResult, HydrationManifest } from './types'

export class Emitter {
  private options: CompilerOptions
  private transformResults: Map<string, TransformResult> = new Map()

  constructor(options: CompilerOptions) {
    this.options = options
  }

  addTransformResult(filePath: string, result: TransformResult): void {
    this.transformResults.set(filePath, result)
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
    const manifests: HydrationManifest[] = []

    for (const [filePath, result] of this.transformResults) {
      const baseName = path.basename(filePath, path.extname(filePath))

      // Write server code
      const serverPath = path.join(serverOutDir, `${baseName}.server.ts`)
      await fs.promises.writeFile(serverPath, result.serverCode)
      serverEntries.push(serverPath)

      // Write client code
      const clientPath = path.join(clientOutDir, `${baseName}.client.ts`)
      await fs.promises.writeFile(clientPath, result.clientCode)
      clientEntries.push(clientPath)

      // Collect manifest
      manifests.push(result.manifest)
    }

    // Bundle server code
    const serverBundle = await this.bundleServer(serverEntries, serverOutDir)

    // Bundle client code
    const clientBundle = await this.bundleClient(clientEntries, clientOutDir)

    // Write manifest
    const manifestPath = path.join(this.options.outDir, 'manifest.json')
    await fs.promises.writeFile(
      manifestPath,
      JSON.stringify({ routes: manifests }, null, 2)
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
      // Tree-shake server code
      treeShaking: true,
      // Inject browser polyfills if needed
      inject: [],
    })

    return outfile
  }
}

/**
 * Emit bundles from transform results
 */
export async function emitBundles(
  options: CompilerOptions,
  transformResults: Map<string, TransformResult>
): Promise<BuildResult> {
  const emitter = new Emitter(options)

  for (const [filePath, result] of transformResults) {
    emitter.addTransformResult(filePath, result)
  }

  return emitter.emit()
}
