/**
 * Stream Emitter
 *
 * Generates SSE handler modules and manifest entries for Stream declarations
 */

import * as fs from 'fs'
import * as path from 'path'
import { transformSync } from 'esbuild'
import type { StreamEndpoint, StreamManifestEntry, StreamAnalysis } from './types'

/**
 * Strip TypeScript annotations from code, converting it to plain JavaScript
 */
function stripTypeScript(code: string): string {
  try {
    const result = transformSync(code, {
      loader: 'ts',
      target: 'es2020',
      minify: false,
      keepNames: false,
    })
    return result.code.trim()
  } catch {
    // If transformation fails, return original code
    return code
  }
}

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

  // Process all streams - both sendable and non-sendable
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
 * Validate that a string is a valid JavaScript identifier
 */
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)
}

/**
 * Generate SSE handler module code
 */
function generateHandlerModule(endpoints: StreamEndpoint[]): string {
  const handlers = endpoints.map((endpoint) => {
    // Sendable streams receive params directly from client
    if (endpoint.sendable) {
      // Strip TypeScript annotations from callback code
      const jsCallback = stripTypeScript(`const __cb = ${endpoint.handlerCode}`)
        .replace(/^const __cb = /, '')
        .replace(/;$/, '')
      return `  "${endpoint.id}": async function* (__params) {
    const __callback = ${jsCallback}
    yield* __callback(__params)
  }`
    }

    // Non-sendable streams reconstruct captured variables
    // Group captured vars by their base (e.g., params.roomId → params: {roomId})
    const varsByBase = new Map<string, string[]>()
    for (const paramPath of endpoint.params) {
      const parts = paramPath.split('.')
      const base = parts[0]

      // Security: validate base is a valid JS identifier
      if (!isValidIdentifier(base)) {
        throw new Error(`[flexism] Invalid variable name in stream params: "${base}"`)
      }

      const rest = parts.slice(1).join('.')
      const existing = varsByBase.get(base) || []
      if (rest) {
        existing.push(rest)
      }
      varsByBase.set(base, existing)
    }

    // Build variable reconstruction code
    const reconstructions: string[] = []
    for (const [base, props] of varsByBase) {
      if (props.length === 0) {
        // Simple variable like `userId` - just extract it
        reconstructions.push(`    const ${base} = __params["${base}"]`)
      } else {
        // Nested like params.roomId or params.user.id - reconstruct the object
        const nestedObj = buildNestedObject(props)
        reconstructions.push(`    const ${base} = ${nestedObj}`)
      }
    }

    const reconstructionCode = reconstructions.length > 0
      ? reconstructions.join('\n') + '\n'
      : ''

    return `  "${endpoint.id}": async function* (__params) {
${reconstructionCode}    const __callback = ${endpoint.handlerCode}
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
 * Build nested object literal from property paths
 * e.g., ["roomId", "user.id", "user.name"] → { roomId: __params["roomId"], user: { id: __params["user_id"], name: __params["user_name"] } }
 */
function buildNestedObject(props: string[]): string {
  // Build a tree structure first
  const tree: Record<string, any> = {}

  for (const prop of props) {
    const parts = prop.split('.')
    let current = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLeaf = i === parts.length - 1

      if (isLeaf) {
        // Leaf node - use full prop path with underscores as param key
        // This matches the key format used in transformer.ts
        current[part] = { __leaf: true, key: prop.replace(/\./g, '_') }
      } else {
        // Branch node
        if (!current[part]) {
          current[part] = {}
        }
        current = current[part]
      }
    }
  }

  // Convert tree to object literal string
  return treeToObjectLiteral(tree)
}

function treeToObjectLiteral(tree: Record<string, any>): string {
  const entries: string[] = []

  for (const [key, value] of Object.entries(tree)) {
    if (value.__leaf) {
      // Leaf node - reference __params
      entries.push(`${key}: __params["${value.key}"]`)
    } else {
      // Branch node - recurse
      entries.push(`${key}: ${treeToObjectLiteral(value)}`)
    }
  }

  return `{ ${entries.join(', ')} }`
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
    sendable: analysis.options.sendable,
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
