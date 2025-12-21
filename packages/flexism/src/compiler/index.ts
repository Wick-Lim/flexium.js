/**
 * Flexism Compiler
 *
 * Automatically splits server and client code from unified source files
 */

import * as fs from 'fs'
import * as path from 'path'
import { analyzeFile } from './analyzer'
import { analyzeStreams } from './stream-analyzer'
import { transformFile, type TransformContext } from './transformer'
import { Emitter } from './emitter'
import {
  emitStreamHandlers,
  analysesToEndpoints,
} from './stream-emitter'
import type {
  CompilerOptions,
  AnalysisResult,
  TransformResult,
  BuildResult,
  FileType,
  StreamAnalysis,
  StreamEndpoint,
} from './types'
import { SPECIAL_FILES } from './types'

export * from './types'
export { analyzeFile } from './analyzer'
export { transformFile } from './transformer'
export { emitBundles } from './emitter'

// Stream Analysis
export { analyzeStreams, StreamAnalyzer } from './stream-analyzer'

// Stream Transform
export {
  generateStreamHandlers,
  generateStreamRefCreation,
  transformClientCode,
  generateStreamHydrationScript,
  injectStreamRefs,
} from './stream-transformer'
export type { StreamTransformResult } from './stream-transformer'

// Stream Emitter
export {
  emitStreamHandlers,
  analysisToEndpoint,
  analysesToEndpoints,
} from './stream-emitter'
export type { StreamEmitResult, StreamEmitOptions } from './stream-emitter'

// Incremental Build
export {
  BuildCache,
  getBuildCache,
  resetBuildCache,
  hashFile,
  hashContent,
  getFileHash,
  hasFileChanged,
  extractDependencies,
  buildDependencyGraph,
  getAffectedFiles,
} from './incremental'
export type {
  FileHash,
  DependencyGraph,
  BuildCacheEntry,
  IncrementalBuildOptions,
} from './incremental'

export class Compiler {
  private options: CompilerOptions

  constructor(options: CompilerOptions) {
    const isProd = options.mode === 'production'

    this.options = {
      target: 'es2022',
      // Production defaults: minify=true, sourcemap=false
      // Development defaults: minify=false, sourcemap=true
      minify: isProd,
      sourcemap: !isProd,
      ...options,
    }
  }

  /**
   * Compile all route files in the source directory
   */
  async compile(): Promise<BuildResult> {
    console.log(`[flexism] Compiling ${this.options.srcDir}...`)

    // Find all route files
    const routeFiles = await this.findRouteFiles()
    console.log(`[flexism] Found ${routeFiles.length} route files`)

    // Analyze and transform each file
    const allTransformResults: TransformResult[] = []
    const allStreamAnalyses: StreamAnalysis[] = []

    for (const filePath of routeFiles) {
      const relativePath = path.relative(this.options.srcDir, filePath)
      const fileType = this.getFileType(path.basename(filePath))

      // Skip middleware, error, loading files (they're collected but not transformed directly)
      if (fileType === 'middleware' || fileType === 'error' || fileType === 'loading') {
        console.log(`[flexism] Found ${fileType}: ${relativePath}`)
        continue
      }

      console.log(`[flexism] Processing ${relativePath}`)

      const source = await fs.promises.readFile(filePath, 'utf-8')

      // Analyze the file
      const analysis = await analyzeFile(source, filePath)
      this.logAnalysis(filePath, analysis)

      // Analyze Stream declarations
      const streams = await analyzeStreams(source, filePath)
      if (streams.length > 0) {
        console.log(`[flexism]   - Streams: ${streams.length}`)
        allStreamAnalyses.push(...streams)
      }

      // Create transform context
      const context: TransformContext = {
        srcDir: this.options.srcDir,
        fileType: fileType!,
        routePath: this.extractRoutePath(filePath),
        middlewares: this.findMiddlewareChain(filePath),
        // Layouts don't apply to other layouts or API routes
        layouts: (fileType === 'layout' || fileType === 'route') ? [] : this.findLayoutChain(filePath),
        // Find closest error/loading files
        errorFile: this.findErrorFile(filePath),
        loadingFile: this.findLoadingFile(filePath),
        // Pass stream info for code transformation
        streams,
      }

      // Transform the file (returns array of results for each export)
      const results = transformFile(source, analysis, context)
      allTransformResults.push(...results)
    }

    // Check for stream ID collisions
    this.detectStreamCollisions(allStreamAnalyses)

    // Emit stream handlers
    const streamEndpoints: StreamEndpoint[] = analysesToEndpoints(allStreamAnalyses)
    const streamEmitResult = await emitStreamHandlers(streamEndpoints, {
      outDir: this.options.outDir,
      srcDir: this.options.srcDir,
    })

    if (Object.keys(streamEmitResult.manifestEntries).length > 0) {
      console.log(`[flexism] Generated ${Object.keys(streamEmitResult.manifestEntries).length} stream handlers`)
    }

    // Emit bundles
    const emitter = new Emitter(this.options)
    emitter.addTransformResults(allTransformResults)
    emitter.setStreamManifest(streamEmitResult.manifestEntries)

    const buildResult = await emitter.emit()

    console.log(`[flexism] Build completed in ${buildResult.buildTime}ms`)
    console.log(`[flexism] Server: ${buildResult.serverBundle}`)
    console.log(`[flexism] Client: ${buildResult.clientBundle}`)

    return buildResult
  }

  /**
   * Watch mode - recompile on file changes
   */
  async watch(callback?: (result: BuildResult) => void): Promise<void> {
    console.log(`[flexism] Watching ${this.options.srcDir}...`)

    // Initial build
    const result = await this.compile()
    callback?.(result)

    // Watch for changes
    const watcher = fs.watch(
      this.options.srcDir,
      { recursive: true },
      async (event, filename) => {
        if (!filename) return
        if (!this.getFileType(path.basename(filename))) return

        console.log(`[flexism] File changed: ${filename}`)

        try {
          const result = await this.compile()
          callback?.(result)
        } catch (error) {
          console.error(`[flexism] Build error:`, error)
        }
      }
    )

    // Handle cleanup
    process.on('SIGINT', () => {
      watcher.close()
      process.exit(0)
    })
  }

  /**
   * Find all special files (page, layout, route, middleware)
   */
  private async findRouteFiles(): Promise<string[]> {
    if (!fs.existsSync(this.options.srcDir)) {
      console.warn(`[flexism] Source directory not found: ${this.options.srcDir}`)
      return []
    }

    return this.walkDir(this.options.srcDir)
  }

  private async walkDir(dir: string): Promise<string[]> {
    const files: string[] = []
    const entries = await fs.promises.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue
        }
        files.push(...await this.walkDir(fullPath))
      } else if (this.getFileType(entry.name)) {
        files.push(fullPath)
      }
    }

    return files
  }

  /**
   * Get the file type based on filename
   */
  private getFileType(filename: string): FileType | null {
    if (SPECIAL_FILES.page.test(filename)) return 'page'
    if (SPECIAL_FILES.layout.test(filename)) return 'layout'
    if (SPECIAL_FILES.route.test(filename)) return 'route'
    if (SPECIAL_FILES.middleware.test(filename)) return 'middleware'
    if (SPECIAL_FILES.error.test(filename)) return 'error'
    if (SPECIAL_FILES.loading.test(filename)) return 'loading'
    return null
  }

  /**
   * Extract route path from file path
   * e.g., src/blog/[slug]/page.tsx -> /blog/:slug
   */
  private extractRoutePath(filePath: string): string {
    // Get relative path from srcDir
    let relativePath = path.relative(this.options.srcDir, filePath)

    // Remove the filename (page.tsx, route.ts, etc.)
    relativePath = path.dirname(relativePath)

    // Handle root case
    if (relativePath === '.') {
      return '/'
    }

    // Process path segments
    const segments = relativePath.split(path.sep)
    const routeSegments: string[] = []

    for (const segment of segments) {
      // Skip route groups (parentheses)
      if (segment.startsWith('(') && segment.endsWith(')')) {
        continue
      }

      // Convert [param] to :param
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const param = segment.slice(1, -1)
        // Handle catch-all [...slug]
        if (param.startsWith('...')) {
          routeSegments.push(`:${param}`)
        } else {
          routeSegments.push(`:${param}`)
        }
      } else {
        routeSegments.push(segment)
      }
    }

    return '/' + routeSegments.join('/')
  }

  /**
   * Find middleware files that apply to a route
   */
  private findMiddlewareChain(filePath: string): string[] {
    const middlewares: string[] = []
    let currentDir = path.dirname(filePath)
    const srcDir = this.options.srcDir

    // Walk up from the file to srcDir
    while (currentDir.startsWith(srcDir)) {
      const middlewarePath = path.join(currentDir, 'middleware.ts')
      const middlewarePathTsx = path.join(currentDir, 'middleware.tsx')

      if (fs.existsSync(middlewarePath)) {
        middlewares.unshift(middlewarePath) // Add to front (outermost first)
      } else if (fs.existsSync(middlewarePathTsx)) {
        middlewares.unshift(middlewarePathTsx)
      }

      if (currentDir === srcDir) break
      currentDir = path.dirname(currentDir)
    }

    return middlewares
  }

  /**
   * Find layout files that apply to a route
   */
  private findLayoutChain(filePath: string): string[] {
    const layouts: string[] = []
    let currentDir = path.dirname(filePath)
    const srcDir = this.options.srcDir

    // Walk up from the file to srcDir
    while (currentDir.startsWith(srcDir)) {
      const layoutPath = path.join(currentDir, 'layout.tsx')
      const layoutPathTs = path.join(currentDir, 'layout.ts')

      if (fs.existsSync(layoutPath)) {
        layouts.unshift(layoutPath) // Add to front (outermost first)
      } else if (fs.existsSync(layoutPathTs)) {
        layouts.unshift(layoutPathTs)
      }

      if (currentDir === srcDir) break
      currentDir = path.dirname(currentDir)
    }

    return layouts
  }

  /**
   * Find the closest error.tsx file for a route
   */
  private findErrorFile(filePath: string): string | null {
    let currentDir = path.dirname(filePath)
    const srcDir = this.options.srcDir

    while (currentDir.startsWith(srcDir)) {
      const errorPath = path.join(currentDir, 'error.tsx')
      const errorPathTs = path.join(currentDir, 'error.ts')

      if (fs.existsSync(errorPath)) return errorPath
      if (fs.existsSync(errorPathTs)) return errorPathTs

      if (currentDir === srcDir) break
      currentDir = path.dirname(currentDir)
    }

    return null
  }

  /**
   * Find the closest loading.tsx file for a route
   */
  private findLoadingFile(filePath: string): string | null {
    let currentDir = path.dirname(filePath)
    const srcDir = this.options.srcDir

    while (currentDir.startsWith(srcDir)) {
      const loadingPath = path.join(currentDir, 'loading.tsx')
      const loadingPathTs = path.join(currentDir, 'loading.ts')

      if (fs.existsSync(loadingPath)) return loadingPath
      if (fs.existsSync(loadingPathTs)) return loadingPathTs

      if (currentDir === srcDir) break
      currentDir = path.dirname(currentDir)
    }

    return null
  }

  private logAnalysis(filePath: string, analysis: AnalysisResult): void {
    const apiCount = analysis.exports.filter(e => e.type === 'api').length
    const componentCount = analysis.exports.filter(e => e.type === 'component').length

    if (analysis.exports.length > 0) {
      console.log(
        `[flexism]   - APIs: ${apiCount}, Components: ${componentCount}`
      )
    }

    const asyncExports = analysis.exports.filter(e => e.isAsync)
    if (asyncExports.length > 0) {
      console.log(`[flexism]   - Async exports: ${asyncExports.map(e => e.name).join(', ')}`)
    }
  }

  /**
   * Detect stream ID collisions across all analyzed streams
   */
  private detectStreamCollisions(streams: StreamAnalysis[]): void {
    const seen = new Map<string, StreamAnalysis>()

    for (const stream of streams) {
      const existing = seen.get(stream.id)
      if (existing) {
        throw new Error(
          `[flexism] Stream ID collision detected: "${stream.id}"\n` +
          `  - First: ${existing.variableName} at position ${existing.position.start}\n` +
          `  - Second: ${stream.variableName} at position ${stream.position.start}\n` +
          `This is likely a bug. Please report this issue.`
        )
      }
      seen.set(stream.id, stream)
    }
  }
}

/**
 * Create a compiler instance
 */
export function createCompiler(options: CompilerOptions): Compiler {
  return new Compiler(options)
}

/**
 * Build project (convenience function)
 */
export async function build(options: CompilerOptions): Promise<BuildResult> {
  const compiler = createCompiler(options)
  return compiler.compile()
}
