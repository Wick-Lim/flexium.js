/**
 * Stream Emitter
 *
 * Generates SSE handler modules and manifest entries for Stream declarations
 */

import * as fs from 'fs'
import * as path from 'path'
import { createHash } from 'crypto'
import type { StreamEndpoint, StreamManifestEntry, StreamAnalysis } from './types'

export interface StreamEmitResult {
  /** Generated handler module paths */
  handlerModules: Map<string, string>
  /** Manifest entries for streams */
  manifestEntries: Record<string, StreamManifestEntry>
}

export interface StreamEmitOptions {
  /** Output directory */
  outDir: string
  /** Source directory (for relative path calculation) */
  srcDir: string
}

/**
 * Emit Stream SSE handler modules
 */
export async function emitStreamHandlers(
  endpoints: StreamEndpoint[],
  options: StreamEmitOptions
): Promise<StreamEmitResult> {
  const { outDir, srcDir } = options
  const handlerModules = new Map<string, string>()
  const manifestEntries: Record<string, StreamManifestEntry> = {}

  if (endpoints.length === 0) {
    return { handlerModules, manifestEntries }
  }

  // Ensure server output directory exists
  const serverOutDir = path.join(outDir, 'server')
  await fs.promises.mkdir(serverOutDir, { recursive: true })

  // Group endpoints by source file (embedded in ID)
  const bySourceHash = groupEndpointsBySource(endpoints)

  for (const [sourceHash, groupEndpoints] of bySourceHash) {
    // Generate handler module code
    const code = generateHandlerModule(groupEndpoints)

    // Write module file
    const moduleName = `__stream_${sourceHash}.js`
    const modulePath = path.join(serverOutDir, moduleName)
    await fs.promises.writeFile(modulePath, code)

    handlerModules.set(sourceHash, moduleName)

    // Create manifest entries
    for (const endpoint of groupEndpoints) {
      manifestEntries[endpoint.id] = {
        id: endpoint.id,
        endpoint: endpoint.path,
        handlerModule: moduleName,
      }
    }
  }

  return { handlerModules, manifestEntries }
}

/**
 * Group endpoints by source file hash (extracted from ID)
 */
function groupEndpointsBySource(
  endpoints: StreamEndpoint[]
): Map<string, StreamEndpoint[]> {
  const groups = new Map<string, StreamEndpoint[]>()

  for (const endpoint of endpoints) {
    // ID format: pathPart_hash_index
    // Extract hash from ID
    const parts = endpoint.id.split('_')
    const hash = parts.length >= 2 ? parts[parts.length - 2] : 'default'

    const group = groups.get(hash) || []
    group.push(endpoint)
    groups.set(hash, group)
  }

  return groups
}

/**
 * Generate SSE handler module code
 */
function generateHandlerModule(endpoints: StreamEndpoint[]): string {
  const handlers = endpoints.map((endpoint) => {
    const paramNames = endpoint.params.map((p) => {
      // Extract last part of path (e.g., "params.roomId" → "roomId")
      const parts = p.split('.')
      return parts[parts.length - 1]
    })

    const paramsDestructure =
      paramNames.length > 0
        ? `const { ${paramNames.join(', ')} } = __params`
        : ''

    return `  "${endpoint.id}": async function* (__params) {
${paramsDestructure ? `    ${paramsDestructure}\n` : ''}    const __callback = ${endpoint.handlerCode}
    const __iterable = await Promise.resolve(__callback())
    yield* __iterable
  }`
  })

  return `// Auto-generated Stream SSE handlers
// Do not edit manually

export const __streamHandlers = {
${handlers.join(',\n')}
}
`
}

/**
 * Generate deterministic hash for a file path
 */
export function hashFilePath(filePath: string): string {
  return createHash('md5').update(filePath).digest('hex').slice(0, 8)
}

/**
 * Convert StreamAnalysis to StreamEndpoint
 */
export function analysisToEndpoint(analysis: StreamAnalysis): StreamEndpoint {
  return {
    id: analysis.id,
    path: `/_flexism/sse/${analysis.id}`,
    handlerCode: analysis.callbackCode,
    params: analysis.capturedVars.map((v) => v.path),
  }
}

/**
 * Batch convert multiple analyses to endpoints
 */
export function analysesToEndpoints(
  analyses: StreamAnalysis[]
): StreamEndpoint[] {
  return analyses.map(analysisToEndpoint)
}
