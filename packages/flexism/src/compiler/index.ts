/**
 * Flexism Compiler
 *
 * Automatically splits server and client code from unified source files
 */

import * as fs from 'fs'
import * as path from 'path'
import { analyzeFile } from './analyzer'
import { transformFile, type TransformContext } from './transformer'
import { Emitter } from './emitter'
import type {
  CompilerOptions,
  AnalysisResult,
  TransformResult,
  BuildResult,
  FileType,
} from './types'
import { SPECIAL_FILES } from './types'

export * from './types'
export { analyzeFile } from './analyzer'
export { transformFile } from './transformer'
export { emitBundles } from './emitter'

export class Compiler {
  private options: CompilerOptions

  constructor(options: CompilerOptions) {
    this.options = {
      target: 'es2022',
      minify: false,
      sourcemap: true,
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

    for (const filePath of routeFiles) {
      const relativePath = path.relative(this.options.srcDir, filePath)
      const fileType = this.getFileType(path.basename(filePath))

      // Skip middleware files (they're collected but not transformed directly)
      if (fileType === 'middleware') {
        console.log(`[flexism] Found middleware: ${relativePath}`)
        continue
      }

      console.log(`[flexism] Processing ${relativePath}`)

      const source = await fs.promises.readFile(filePath, 'utf-8')

      // Analyze the file
      const analysis = await analyzeFile(source, filePath)
      this.logAnalysis(filePath, analysis)

      // Create transform context
      const context: TransformContext = {
        srcDir: this.options.srcDir,
        fileType: fileType!,
        routePath: this.extractRoutePath(filePath),
        middlewares: this.findMiddlewareChain(filePath),
        layouts: fileType === 'layout' ? [] : this.findLayoutChain(filePath),
      }

      // Transform the file (returns array of results for each export)
      const results = transformFile(source, analysis, context)
      allTransformResults.push(...results)
    }

    // Emit bundles
    const emitter = new Emitter(this.options)
    emitter.addTransformResults(allTransformResults)

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
