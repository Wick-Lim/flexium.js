/**
 * Incremental Build System
 *
 * File-level caching and dependency tracking for fast rebuilds
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { LRUCache } from '../utils/lru-cache'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FileHash {
  path: string
  hash: string
  mtime: number
  size: number
}

export interface DependencyGraph {
  /** Map of file path to its dependencies */
  dependencies: Map<string, Set<string>>
  /** Map of file path to files that depend on it */
  dependents: Map<string, Set<string>>
}

export interface BuildCacheEntry {
  hash: string
  output: string
  dependencies: string[]
  timestamp: number
}

export interface IncrementalBuildOptions {
  /** Cache directory for build artifacts */
  cacheDir?: string
  /** Maximum cache size in entries */
  maxCacheSize?: number
  /** Enable dependency tracking */
  trackDependencies?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// File Hashing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate content hash for a file
 */
export function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath)
  return crypto.createHash('xxhash64' in crypto ? 'xxhash64' : 'md5')
    .update(content)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Calculate hash from content string
 */
export function hashContent(content: string): string {
  return crypto.createHash('xxhash64' in crypto ? 'xxhash64' : 'md5')
    .update(content)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Get file metadata for change detection
 */
export async function getFileHash(filePath: string): Promise<FileHash | null> {
  try {
    const stat = await fs.promises.stat(filePath)
    const hash = hashFile(filePath)
    return {
      path: filePath,
      hash,
      mtime: stat.mtimeMs,
      size: stat.size,
    }
  } catch {
    return null
  }
}

/**
 * Check if file has changed based on hash
 */
export function hasFileChanged(current: FileHash, cached: FileHash | undefined): boolean {
  if (!cached) return true
  return current.hash !== cached.hash
}

// ─────────────────────────────────────────────────────────────────────────────
// Dependency Tracking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract import/export dependencies from source code
 */
export function extractDependencies(source: string, filePath: string): string[] {
  const dependencies: string[] = []
  const dir = path.dirname(filePath)

  // Match import statements
  const importRegex = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(source)) !== null) {
    const importPath = match[1]

    // Skip external packages
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      continue
    }

    // Resolve relative path
    const resolved = resolveImportPath(importPath, dir)
    if (resolved) {
      dependencies.push(resolved)
    }
  }

  return dependencies
}

/**
 * Resolve import path to absolute file path
 */
function resolveImportPath(importPath: string, fromDir: string): string | null {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
  const basePath = path.resolve(fromDir, importPath)

  // Try exact path
  for (const ext of ['', ...extensions]) {
    const fullPath = basePath + ext
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath
    }
  }

  // Try index files
  for (const ext of extensions) {
    const indexPath = path.join(basePath, `index${ext}`)
    if (fs.existsSync(indexPath)) {
      return indexPath
    }
  }

  return null
}

/**
 * Build dependency graph from file list
 */
export async function buildDependencyGraph(
  files: string[]
): Promise<DependencyGraph> {
  const dependencies = new Map<string, Set<string>>()
  const dependents = new Map<string, Set<string>>()

  for (const file of files) {
    try {
      const source = await fs.promises.readFile(file, 'utf-8')
      const deps = extractDependencies(source, file)

      dependencies.set(file, new Set(deps))

      // Build reverse mapping
      for (const dep of deps) {
        if (!dependents.has(dep)) {
          dependents.set(dep, new Set())
        }
        dependents.get(dep)!.add(file)
      }
    } catch {
      dependencies.set(file, new Set())
    }
  }

  return { dependencies, dependents }
}

/**
 * Get all files affected by a change (including dependents)
 */
export function getAffectedFiles(
  changedFile: string,
  graph: DependencyGraph,
  visited: Set<string> = new Set()
): Set<string> {
  if (visited.has(changedFile)) {
    return visited
  }

  visited.add(changedFile)

  // Get all files that depend on this file
  const deps = graph.dependents.get(changedFile)
  if (deps) {
    for (const dep of deps) {
      getAffectedFiles(dep, graph, visited)
    }
  }

  return visited
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Cache
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Incremental build cache manager
 */
export class BuildCache {
  private hashCache: LRUCache<string, FileHash>
  private outputCache: LRUCache<string, BuildCacheEntry>
  private dependencyGraph: DependencyGraph | null = null
  private options: Required<IncrementalBuildOptions>

  constructor(options: IncrementalBuildOptions = {}) {
    this.options = {
      cacheDir: options.cacheDir ?? '.flexism/cache',
      maxCacheSize: options.maxCacheSize ?? 1000,
      trackDependencies: options.trackDependencies ?? true,
    }

    this.hashCache = new LRUCache<string, FileHash>({
      maxSize: this.options.maxCacheSize,
    })

    this.outputCache = new LRUCache<string, BuildCacheEntry>({
      maxSize: this.options.maxCacheSize,
    })
  }

  /**
   * Check if file needs rebuild
   */
  async needsRebuild(filePath: string): Promise<boolean> {
    const current = await getFileHash(filePath)
    if (!current) return true

    const cached = this.hashCache.get(filePath)
    return hasFileChanged(current, cached)
  }

  /**
   * Get cached output for file
   */
  getCachedOutput(filePath: string): BuildCacheEntry | undefined {
    const current = this.hashCache.get(filePath)
    const cached = this.outputCache.get(filePath)

    if (!cached || !current) return undefined

    // Verify hash matches
    if (cached.hash !== current.hash) {
      return undefined
    }

    // Check if any dependency has changed
    if (this.options.trackDependencies && this.dependencyGraph) {
      for (const dep of cached.dependencies) {
        const depHash = this.hashCache.get(dep)
        if (!depHash) return undefined

        const currentDepHash = this.hashCache.get(dep)
        if (!currentDepHash || depHash.hash !== currentDepHash.hash) {
          return undefined
        }
      }
    }

    return cached
  }

  /**
   * Cache build output
   */
  async cacheOutput(
    filePath: string,
    output: string,
    dependencies: string[] = []
  ): Promise<void> {
    const fileHash = await getFileHash(filePath)
    if (!fileHash) return

    this.hashCache.set(filePath, fileHash)

    this.outputCache.set(filePath, {
      hash: fileHash.hash,
      output,
      dependencies,
      timestamp: Date.now(),
    })
  }

  /**
   * Update hash cache for file
   */
  async updateHash(filePath: string): Promise<FileHash | null> {
    const hash = await getFileHash(filePath)
    if (hash) {
      this.hashCache.set(filePath, hash)
    }
    return hash
  }

  /**
   * Get files that need rebuild based on changes
   */
  async getChangedFiles(files: string[]): Promise<string[]> {
    const changed: string[] = []

    for (const file of files) {
      if (await this.needsRebuild(file)) {
        changed.push(file)
      }
    }

    // If tracking dependencies, include affected files
    if (this.options.trackDependencies && this.dependencyGraph && changed.length > 0) {
      const affected = new Set<string>()
      for (const file of changed) {
        for (const dep of getAffectedFiles(file, this.dependencyGraph)) {
          affected.add(dep)
        }
      }
      return Array.from(affected)
    }

    return changed
  }

  /**
   * Build and cache dependency graph
   */
  async buildGraph(files: string[]): Promise<DependencyGraph> {
    this.dependencyGraph = await buildDependencyGraph(files)
    return this.dependencyGraph
  }

  /**
   * Invalidate cache for file and its dependents
   */
  invalidate(filePath: string): void {
    this.hashCache.delete(filePath)
    this.outputCache.delete(filePath)

    // Invalidate dependents
    if (this.dependencyGraph) {
      const affected = getAffectedFiles(filePath, this.dependencyGraph)
      for (const file of affected) {
        this.hashCache.delete(file)
        this.outputCache.delete(file)
      }
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.hashCache.clear()
    this.outputCache.clear()
    this.dependencyGraph = null
  }

  /**
   * Get cache stats
   */
  stats(): { hashCache: ReturnType<typeof this.hashCache.stats>; outputCache: ReturnType<typeof this.outputCache.stats> } {
    return {
      hashCache: this.hashCache.stats(),
      outputCache: this.outputCache.stats(),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────────────────────

let defaultBuildCache: BuildCache | null = null

/**
 * Get or create default build cache
 */
export function getBuildCache(options?: IncrementalBuildOptions): BuildCache {
  if (!defaultBuildCache) {
    defaultBuildCache = new BuildCache(options)
  }
  return defaultBuildCache
}

/**
 * Reset default build cache
 */
export function resetBuildCache(): void {
  defaultBuildCache?.clear()
  defaultBuildCache = null
}
