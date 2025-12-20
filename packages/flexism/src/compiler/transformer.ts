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
    return `
// API Handler: ${name}
export ${asyncKeyword}function ${name}(request, context) ${body}
`.trim()
  }

  private wrapServerComponent(name: string, body: string, isAsync: boolean): string {
    const asyncKeyword = isAsync ? 'async ' : ''
    return `
// Server Component: ${name} (no hydration)
export ${asyncKeyword}function ${name}(props) ${body}
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

    return `
// Client Component: ${name}
import { use } from 'flexium/core'
import { hydrate } from 'flexium/dom'

export function Component(${propsParam}) ${clientBody}

// Hydration entry
export function hydrateComponent(container, serverData) {
  hydrate(Component, container, serverData)
}
`.trim()
  }

  private cleanServerBody(body: string): string {
    // Remove leading/trailing braces if present
    let cleaned = body.trim()
    if (cleaned.startsWith('{')) {
      cleaned = cleaned.slice(1)
    }
    if (cleaned.endsWith('}')) {
      cleaned = cleaned.slice(0, -1)
    }
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
