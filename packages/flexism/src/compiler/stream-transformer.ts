/**
 * Stream Transformer
 *
 * Transforms Stream declarations:
 * - Server: Generates SSE endpoint handlers
 * - Client: Replaces Stream with StreamRef
 */

import type { StreamAnalysis, StreamEndpoint, CapturedVariable } from './types'

export interface StreamTransformResult {
  /** SSE endpoint definitions */
  endpoints: StreamEndpoint[]
  /** Server-side code additions */
  serverAdditions: string
  /** Client code with Stream → StreamRef replacement */
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
 * Generate code to create StreamRef from Stream at runtime
 * This code runs on the server to prepare data for client
 */
export function generateStreamRefCreation(
  streams: StreamAnalysis[],
  variableAssignments: Map<string, string> // position → variable name
): string {
  if (streams.length === 0) return ''

  const lines: string[] = [
    '// Convert Streams to StreamRefs for client',
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
 * Transform client code to use StreamRef instead of Stream
 */
export function transformClientCode(
  source: string,
  streams: StreamAnalysis[]
): string {
  if (streams.length === 0) return source

  let result = source

  // Replace `new Stream(...)` with placeholder that will be filled from props
  // The actual StreamRef comes from server-rendered data

  // For now, we'll generate code that expects __streamRefs in props
  // and hydrates StreamRef from it

  // Add import for StreamRef
  const hasStreamImport = /import\s+.*Stream.*from\s+['"]flexism/.test(result)
  if (!hasStreamImport) {
    result = `import { StreamRef } from 'flexism/stream'\n${result}`
  } else {
    // Add StreamRef to existing import
    result = result.replace(
      /import\s+{([^}]*Stream[^}]*)}\s+from\s+['"]flexism['"]/,
      (match, imports) => {
        if (imports.includes('StreamRef')) return match
        return `import {${imports}, StreamRef } from 'flexism'`
      }
    )
  }

  // Replace each Stream construction with StreamRef.fromJSON
  for (const stream of streams) {
    const originalCode = source.slice(stream.position.start, stream.position.end)

    // In client code, Stream comes from serialized data
    // We need to wrap the component to receive stream refs
    const replacement = `(function() {
      if (typeof window !== 'undefined' && window.__FLEXISM_STREAMS__?.["${stream.id}"]) {
        return StreamRef.fromJSON(window.__FLEXISM_STREAMS__["${stream.id}"])
      }
      // Server-side: return original Stream (will be converted to ref)
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
 * Inject stream refs into hydration data
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
