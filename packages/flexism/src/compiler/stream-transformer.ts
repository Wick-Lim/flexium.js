/**
 * Stream Transformer
 *
 * Transforms Stream declarations:
 * - Server: Generates SSE endpoint handlers
 * - Client: Serializes Stream for hydration
 */

import type { StreamAnalysis, StreamEndpoint, CapturedVariable } from './types'

export interface StreamTransformResult {
  /** SSE endpoint definitions */
  endpoints: StreamEndpoint[]
  /** Server-side code additions */
  serverAdditions: string
  /** Client code with Stream serialization */
  clientCode: string
}

/**
 * Transform Stream declarations for server-side
 * Generates SSE handler code
 */
export function generateStreamHandlers(
  streams: StreamAnalysis[],
  originalSource: string
): { handlerCode: string; endpoints: StreamEndpoint[] } {
  if (streams.length === 0) {
    return { handlerCode: '', endpoints: [] }
  }

  const endpoints: StreamEndpoint[] = []
  const handlerLines: string[] = [
    '// Auto-generated Stream SSE handlers',
    'import { sse } from "flexism/server"',
    '',
    'export const __streamHandlers = {',
  ]

  for (const stream of streams) {
    const endpoint: StreamEndpoint = {
      id: stream.id,
      path: `/_flexism/sse/${stream.id}`,
      handlerCode: stream.callbackCode,
      params: stream.capturedVars.map(v => v.path),
    }
    endpoints.push(endpoint)

    // Generate handler function
    const paramsList = stream.capturedVars.map(v => {
      // Convert params.roomId to roomId
      const paramName = v.properties.length > 0 ? v.properties[v.properties.length - 1] : v.base
      return paramName
    })

    const paramsDestructure = paramsList.length > 0
      ? `const { ${paramsList.join(', ')} } = __params`
      : ''

    handlerLines.push(`  "${stream.id}": async function* (__params) {`)
    if (paramsDestructure) {
      handlerLines.push(`    ${paramsDestructure}`)
    }
    handlerLines.push(`    const __callback = ${stream.callbackCode}`)
    handlerLines.push(`    const __iterable = await __callback()`)
    handlerLines.push(`    yield* __iterable`)
    handlerLines.push(`  },`)
  }

  handlerLines.push('};')

  return {
    handlerCode: handlerLines.join('\n'),
    endpoints,
  }
}

/**
 * Generate code to serialize Stream for client
 * This code runs on the server to prepare data for client
 */
export function generateStreamRefCreation(
  streams: StreamAnalysis[],
  variableAssignments: Map<string, string> // position → variable name
): string {
  if (streams.length === 0) return ''

  const lines: string[] = [
    '// Serialize Streams for client hydration',
    'const __streamRefs = {}',
  ]

  for (const stream of streams) {
    const varName = variableAssignments.get(String(stream.position.start)) || stream.variableName
    const captureParams = stream.capturedVars
      .map(v => {
        const paramName = v.properties.length > 0 ? v.properties[v.properties.length - 1] : v.base
        return `"${paramName}": ${v.path}`
      })
      .join(', ')

    lines.push(`__streamRefs["${varName}"] = ${varName}.capture({ ${captureParams} }).toRef()`)
  }

  return lines.join('\n')
}

/**
 * Transform client code for Stream hydration
 */
export function transformClientCode(
  source: string,
  streams: StreamAnalysis[]
): string {
  if (streams.length === 0) return source

  let result = source

  // Replace `new Stream(...)` with placeholder that will be filled from props
  // The actual Stream comes from server-rendered data via Stream.fromJSON()

  // For now, we'll generate code that expects __streams in props
  // and hydrates Stream from it

  // Add import for Stream if not present
  const hasStreamImport = /import\s+.*Stream.*from\s+['"]flexism/.test(result)
  if (!hasStreamImport) {
    result = `import { Stream } from 'flexism/stream'\n${result}`
  }

  // Replace each Stream construction with Stream.fromJSON
  for (const stream of streams) {
    const originalCode = source.slice(stream.position.start, stream.position.end)

    // In client code, Stream comes from serialized data
    // We need to wrap the component to receive stream refs
    const replacement = `(function() {
      if (typeof window !== 'undefined' && window.__FLEXISM_STREAMS__?.["${stream.id}"]) {
        return Stream.fromJSON(window.__FLEXISM_STREAMS__["${stream.id}"])
      }
      // Server-side: return original Stream (will be serialized)
      return ${originalCode}
    })()`

    result = result.replace(originalCode, replacement)
  }

  return result
}

/**
 * Generate stream hydration script for client
 */
export function generateStreamHydrationScript(
  streams: StreamAnalysis[]
): string {
  if (streams.length === 0) return ''

  return `
<script>
  window.__FLEXISM_STREAMS__ = window.__FLEXISM_STREAMS__ || {}
</script>`
}

/**
 * Inject serialized streams into hydration data
 */
export function injectStreamRefs(
  existingState: any,
  streamRefs: Record<string, any>
): any {
  return {
    ...existingState,
    __streams: streamRefs,
  }
}
