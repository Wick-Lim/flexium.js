/**
 * Flexism Code Transformer
 *
 * Transforms source code by splitting server and client code
 * based on the 2-function pattern analysis
 */

import type { AnalysisResult, TransformResult, ExportInfo, RouteInfo, FileType, StreamAnalysis } from './types'

export interface TransformContext {
  /** Source directory */
  srcDir: string
  /** Detected file type */
  fileType: FileType
  /** Route path (pre-computed) */
  routePath: string
  /** Middleware chain */
  middlewares: string[]
  /** Layout chain */
  layouts: string[]
  /** Closest error.tsx file path */
  errorFile?: string | null
  /** Closest loading.tsx file path */
  loadingFile?: string | null
  /** Stream declarations in this file */
  streams?: StreamAnalysis[]
}

export class Transformer {
  private source: string
  private analysis: AnalysisResult
  private context: TransformContext

  constructor(source: string, analysis: AnalysisResult, context: TransformContext) {
    this.source = source
    this.analysis = analysis
    this.context = context
  }

  transform(): TransformResult[] {
    const results: TransformResult[] = []

    for (const exp of this.analysis.exports) {
      if (exp.type === 'api') {
        // API handlers stay on server only
        results.push(this.transformApi(exp))
      } else if (exp.type === 'component') {
        // Components get split
        results.push(this.transformComponent(exp))
      }
    }

    return results
  }

  private transformApi(exp: ExportInfo): TransformResult {
    // API handlers: entire function goes to server
    const serverCode = exp.serverBody
      ? this.extractCode(exp.serverBody.start, exp.serverBody.end)
      : ''

    return {
      filePath: this.analysis.filePath,
      serverCode: this.wrapApiHandler(exp.name, serverCode, exp.isAsync),
      clientCode: '', // No client code for APIs
      route: this.createRouteInfo(exp.name, 'api', []),
    }
  }

  private transformComponent(exp: ExportInfo): TransformResult {
    if (!exp.returnsFunction) {
      // Component doesn't return a function - server-only (no hydration)
      const serverCode = exp.serverBody
        ? this.extractCode(exp.serverBody.start, exp.serverBody.end)
        : ''

      return {
        filePath: this.analysis.filePath,
        serverCode: this.wrapServerComponent(exp.name, serverCode, exp.isAsync),
        clientCode: '',
        route: this.createRouteInfo(exp.name, 'component', []),
      }
    }

    // Component returns a function - split server/client
    const serverCode = exp.serverBody
      ? this.extractCode(exp.serverBody.start, exp.serverBody.end)
      : ''

    const clientCode = exp.clientBody
      ? this.extractCode(exp.clientBody.start, exp.clientBody.end)
      : ''

    return {
      filePath: this.analysis.filePath,
      serverCode: this.generateServerLoader(exp.name, serverCode, exp.sharedProps, exp.isAsync),
      clientCode: this.generateClientComponent(exp.name, clientCode, exp.sharedProps),
      route: this.createRouteInfo(exp.name, 'component', exp.sharedProps),
    }
  }

  private createRouteInfo(
    exportName: string,
    type: 'api' | 'component',
    hydrateProps: string[]
  ): RouteInfo {
    return {
      path: this.context.routePath,
      exportName,
      type,
      fileType: this.context.fileType,
      hydrateProps,
      middlewares: this.context.middlewares,
      layouts: this.context.layouts,
      errorModule: this.context.errorFile ?? undefined,
      loadingModule: this.context.loadingFile ?? undefined,
    }
  }

  private extractCode(start: number, end: number): string {
    return this.source.slice(start, end)
  }

  private wrapApiHandler(name: string, body: string, isAsync: boolean): string {
    const asyncKeyword = isAsync ? 'async ' : ''
    const exportPrefix = name === 'default' ? 'export default' : 'export'
    const funcName = name === 'default' ? '' : ` ${name}`
    return `
// API Handler: ${name}
${exportPrefix} ${asyncKeyword}function${funcName}(request, context)${body}
`.trim()
  }

  private wrapServerComponent(name: string, body: string, isAsync: boolean): string {
    const asyncKeyword = isAsync ? 'async ' : ''
    const exportPrefix = name === 'default' ? 'export default' : 'export'
    const funcName = name === 'default' ? '' : ` ${name}`
    return `
// Server Component: ${name} (no hydration)
${exportPrefix} ${asyncKeyword}function${funcName}(props)${body}
`.trim()
  }

  private generateServerLoader(
    name: string,
    serverBody: string,
    sharedProps: string[],
    isAsync: boolean
  ): string {
    const streams = this.context.streams || []
    const hasStreams = streams.length > 0

    // Build props object with stream refs
    const propsEntries = [...sharedProps]
    const streamConversions: string[] = []

    for (const stream of streams) {
      const varName = stream.variableName || `__stream_${streams.indexOf(stream)}`
      // Add capture and toRef conversion
      const captureParams = stream.capturedVars
        .map(v => {
          const paramName = v.properties.length > 0 ? v.properties[v.properties.length - 1] : v.base
          return `"${paramName}": ${v.path}`
        })
        .join(', ')

      streamConversions.push(`  const __streamRef_${varName} = ${varName}.capture({ ${captureParams} }).toRef()`)
      propsEntries.push(`__streams: { ${streams.map((s, i) => `${s.variableName || `__stream_${i}`}: __streamRef_${s.variableName || `__stream_${i}`}.toJSON()`).join(', ')} }`)
    }

    const propsObject = propsEntries.length > 0
      ? `{ ${propsEntries.filter((v, i, arr) => arr.indexOf(v) === i).join(', ')} }`
      : '{}'

    const streamImport = hasStreams ? `import { Stream } from 'flexism/stream'\n` : ''
    const streamConversionCode = streamConversions.length > 0 ? '\n' + streamConversions.join('\n') + '\n' : ''

    return `
${streamImport}// Server Loader for: ${name}
export ${isAsync ? 'async ' : ''}function loader(props) {
  ${this.cleanServerBody(serverBody)}${streamConversionCode}
  return ${propsObject}
}
`.trim()
  }

  private generateClientComponent(
    name: string,
    clientBody: string,
    sharedProps: string[]
  ): string {
    const streams = this.context.streams || []
    const hasStreams = streams.length > 0

    // Build props with __streams
    const allProps = [...sharedProps]
    if (hasStreams) {
      allProps.push('__streams')
    }

    const propsParam = allProps.length > 0
      ? `{ ${allProps.join(', ')} }`
      : 'props'

    // Generate unique export names based on route path to avoid ESM export conflicts
    const uniqueId = this.routePathToId(this.context.routePath)
    const componentName = `Component_${uniqueId}`
    const hydrateName = `hydrateComponent_${uniqueId}`

    // Generate stream restoration code
    const streamImport = hasStreams ? `import { StreamRef } from 'flexism/stream'\n` : ''
    const streamRestoration = streams.map(stream => {
      const varName = stream.variableName || `__stream_${streams.indexOf(stream)}`
      return `  const ${varName} = __streams?.${varName} ? StreamRef.fromJSON(__streams.${varName}) : null`
    }).join('\n')

    const streamRestorationBlock = hasStreams ? `\n${streamRestoration}\n` : ''

    return `
// Client Component: ${name}
${streamImport}import { use } from 'flexium/core'
import { hydrate } from 'flexium/dom'

export function ${componentName}(${propsParam}) {${streamRestorationBlock}${this.cleanClientBody(clientBody)}
}

// Hydration entry
export function ${hydrateName}(container, serverData) {
  hydrate(${componentName}, container, serverData)
}
`.trim()
  }

  private cleanClientBody(body: string): string {
    // For client body, we need to extract just the inner content
    let cleaned = body.trim()

    // Remove surrounding braces if present
    if (cleaned.startsWith('{')) {
      cleaned = cleaned.slice(1)
    }
    if (cleaned.endsWith('}')) {
      cleaned = cleaned.slice(0, -1)
    }

    return cleaned.trim()
  }

  private routePathToId(routePath: string): string {
    // Convert route path to a valid identifier
    // /users/:id -> users_$id
    // / -> index
    if (routePath === '/') return 'index'
    return routePath
      .slice(1)  // Remove leading /
      .replace(/\//g, '_')
      .replace(/:/g, '$')
  }

  private cleanServerBody(body: string): string {
    // For 2-function patterns, body is the content before `return`
    // We only need to remove the leading function body brace if present
    let cleaned = body.trim()

    // Only remove leading brace if it's the function body opener
    // (starts with `{` followed by whitespace/newline, not part of an expression)
    if (cleaned.startsWith('{') && (cleaned.length === 1 || /\s/.test(cleaned[1]))) {
      cleaned = cleaned.slice(1)
    }

    // Don't remove trailing braces - they belong to statements in the body
    return cleaned.trim()
  }
}

/**
 * Transform a source file based on analysis
 */
export function transformFile(
  source: string,
  analysis: AnalysisResult,
  context: TransformContext
): TransformResult[] {
  const transformer = new Transformer(source, analysis, context)
  return transformer.transform()
}
