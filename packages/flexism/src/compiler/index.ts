/**
 * Flexism Compiler
 *
 * Automatically splits server and client code from unified source files
 */

import * as fs from 'fs'
import * as path from 'path'
import { analyzeFile } from './analyzer'
import { transformFile } from './transformer'
import { Emitter } from './emitter'
import type {
  CompilerOptions,
  AnalysisResult,
  TransformResult,
  BuildResult,
} from './types'

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
    const transformResults = new Map<string, TransformResult>()

    for (const filePath of routeFiles) {
      console.log(`[flexism] Processing ${path.relative(this.options.srcDir, filePath)}`)

      const source = await fs.promises.readFile(filePath, 'utf-8')

      // Analyze the file
      const analysis = await analyzeFile(source, filePath)
      this.logAnalysis(filePath, analysis)

      // Transform the file
      const result = await transformFile(source, analysis)
      transformResults.set(filePath, result)
    }

    // Emit bundles
    const emitter = new Emitter(this.options)
    for (const [filePath, result] of transformResults) {
      emitter.addTransformResult(filePath, result)
    }

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
        if (!this.isRouteFile(filename)) return

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

  private async findRouteFiles(): Promise<string[]> {
    const routesDir = path.join(this.options.srcDir, 'routes')

    if (!fs.existsSync(routesDir)) {
      console.warn(`[flexism] No routes directory found at ${routesDir}`)
      return []
    }

    return this.walkDir(routesDir)
  }

  private async walkDir(dir: string): Promise<string[]> {
    const files: string[] = []
    const entries = await fs.promises.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...await this.walkDir(fullPath))
      } else if (this.isRouteFile(entry.name)) {
        files.push(fullPath)
      }
    }

    return files
  }

  private isRouteFile(filename: string): boolean {
    return /\.(tsx?|jsx?)$/.test(filename) && !filename.includes('.test.')
  }

  private logAnalysis(filePath: string, analysis: AnalysisResult): void {
    const serverCount = analysis.serverCode.length
    const clientCount = analysis.clientCode.length

    if (serverCount > 0 || clientCount > 0) {
      console.log(
        `[flexism]   - Server patterns: ${serverCount}, Client patterns: ${clientCount}`
      )
    }

    if (analysis.isAsync) {
      console.log(`[flexism]   - Async component detected`)
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
