/**
 * Flexism Code Transformer
 *
 * Transforms source code by splitting server and client code
 * based on the 2-function pattern analysis
 */

import type { AnalysisResult, TransformResult, ExportInfo, RouteInfo, FileType } from './types'

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
    const propsObject = sharedProps.length > 0
      ? `{ ${sharedProps.join(', ')} }`
      : '{}'

    return `
// Server Loader for: ${name}
export ${isAsync ? 'async ' : ''}function loader(props) {
  ${this.cleanServerBody(serverBody)}
  return ${propsObject}
}
`.trim()
  }

  private generateClientComponent(
    name: string,
    clientBody: string,
    sharedProps: string[]
  ): string {
    const propsParam = sharedProps.length > 0
      ? `{ ${sharedProps.join(', ')} }`
      : 'props'

    // Generate unique export names based on route path to avoid ESM export conflicts
    const uniqueId = this.routePathToId(this.context.routePath)
    const componentName = `Component_${uniqueId}`
    const hydrateName = `hydrateComponent_${uniqueId}`

    return `
// Client Component: ${name}
import { use } from 'flexium/core'
import { hydrate } from 'flexium/dom'

export function ${componentName}(${propsParam})${clientBody}

// Hydration entry
export function ${hydrateName}(container, serverData) {
  hydrate(${componentName}, container, serverData)
}
`.trim()
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
