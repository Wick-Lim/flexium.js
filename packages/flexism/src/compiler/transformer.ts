/**
 * Flexism Code Transformer
 *
 * Transforms source code by splitting server and client code
 * based on the 2-function pattern analysis
 */

import type { AnalysisResult, TransformResult, ExportInfo, RouteInfo, FileType, StreamAnalysis, ModuleDeclaration } from './types'

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
  /** Module-level variable declarations */
  moduleDeclarations?: ModuleDeclaration[]
}

export class Transformer {
  private source: string
  private analysis: AnalysisResult
  private context: TransformContext
  private imports: string[]

  constructor(source: string, analysis: AnalysisResult, context: TransformContext) {
    this.source = source
    this.analysis = analysis
    this.context = context
    this.imports = this.extractImports()
  }

  /**
   * Extract all import statements from source code
   */
  private extractImports(): string[] {
    const imports: string[] = []
    // Match import statements (both single and multi-line)
    const importRegex = /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]\s*;?\s*$/gm
    let match
    while ((match = importRegex.exec(this.source)) !== null) {
      imports.push(match[0].trim())
    }
    return imports
  }

  /**
   * Get imports that should be included in server code
   * Filters out client-only imports like 'flexium/dom'
   */
  private getServerImports(): string {
    const clientOnlyModules = ['flexium/dom']
    const filtered = this.imports.filter(imp => {
      return !clientOnlyModules.some(mod => imp.includes(`'${mod}'`) || imp.includes(`"${mod}"`))
    })
    return filtered.length > 0 ? filtered.join('\n') + '\n\n' : ''
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

      // Use the parameter pattern from analysis (e.g., '{ children }')
      const paramPattern = exp.paramPattern || 'props'

      return {
        filePath: this.analysis.filePath,
        serverCode: this.wrapServerComponent(exp.name, serverCode, exp.isAsync, paramPattern),
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
      serverCode: this.generateServerCode(exp.name, serverCode, clientCode, exp.sharedProps, exp.isAsync),
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

  /**
   * Get module-level declarations code block (e.g., const container = css({...}))
   */
  private getModuleDeclarationsBlock(): string {
    const moduleDecls = this.analysis.moduleDeclarations || []
    if (moduleDecls.length === 0) return ''
    return '\n// Module-level declarations\n' + moduleDecls.map(d => d.code).join('\n') + '\n'
  }

  private wrapApiHandler(name: string, body: string, isAsync: boolean): string {
    const asyncKeyword = isAsync ? 'async ' : ''
    const exportPrefix = name === 'default' ? 'export default' : 'export'
    const funcName = name === 'default' ? '' : ` ${name}`
    const imports = this.getServerImports()
    return `${imports}// API Handler: ${name}
${exportPrefix} ${asyncKeyword}function${funcName}(request, context)${body}
`.trim()
  }

  private wrapServerComponent(name: string, body: string, isAsync: boolean, paramPattern: string): string {
    const asyncKeyword = isAsync ? 'async ' : ''
    const exportPrefix = name === 'default' ? 'export default' : 'export'
    const funcName = name === 'default' ? '' : ` ${name}`
    const imports = this.getServerImports()
    return `${imports}// Server Component: ${name} (no hydration)
${exportPrefix} ${asyncKeyword}function${funcName}(${paramPattern})${body}
`.trim()
  }

  private generateServerCode(
    name: string,
    serverBody: string,
    clientBody: string,
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

      // For sendable streams, skip .capture() - params come from client request
      // For non-sendable streams, capture closure variables to pass as URL params
      if (stream.options.sendable) {
        // Sendable streams get params at request time, just call toRef()
        streamConversions.push(`  const __streamRef_${varName} = ${varName}.toRef()`)
      } else {
        // Non-sendable streams need captured variables from closure
        const captureParams = stream.capturedVars
          .map(v => {
            // Use full property path with underscores to avoid collisions
            // e.g., params.user.id → "user_id", params.roomId → "roomId"
            const paramName = v.properties.length > 0 ? v.properties.join('_') : v.base
            return `"${paramName}": ${v.path}`
          })
          .join(', ')

        streamConversions.push(`  const __streamRef_${varName} = ${varName}.capture({ ${captureParams} }).toRef()`)
      }
    }

    // Add __streams object with all stream refs (outside loop to avoid duplicates)
    if (hasStreams) {
      const streamsObject = streams.map((s, i) => {
        const varName = s.variableName || `__stream_${i}`
        return `${varName}: __streamRef_${varName}.toJSON()`
      }).join(', ')
      propsEntries.push(`__streams: { ${streamsObject} }`)
    }

    const propsObject = propsEntries.length > 0
      ? `{ ${propsEntries.join(', ')} }`
      : '{}'

    const streamImport = hasStreams ? `import { Stream } from 'flexism/stream'\n` : ''
    // Note: Stream is only used on server for .toRef() call
    const streamConversionCode = streamConversions.length > 0 ? '\n' + streamConversions.join('\n') + '\n' : ''

    // Get stream variable names to exclude from props (same as client)
    const streamVarNames = new Set(
      streams.map(s => s.variableName || `__stream_${streams.indexOf(s)}`)
    )

    // Build props for Component (excluding stream variables)
    const componentProps = sharedProps.filter(prop => !streamVarNames.has(prop))
    if (hasStreams) {
      componentProps.push('__streams')
    }

    const componentPropsParam = componentProps.length > 0
      ? `{ ${componentProps.join(', ')} }`
      : 'props'

    // Generate stream restoration code for Component (same as client)
    // Stream.fromJSON() handles both regular and sendable streams
    // Memoize with use() to prevent creating new Stream instances on each render
    // use() with deps returns [value, meta], so we destructure to get just the value
    const streamRestoration = streams.map(stream => {
      const varName = stream.variableName || `__stream_${streams.indexOf(stream)}`
      return `  const [${varName}] = use(() => __streams?.${varName} ? Stream.fromJSON(__streams.${varName}) : null, [])`
    }).join('\n')

    const streamRestorationBlock = hasStreams ? `\n${streamRestoration}\n` : ''
    const streamRefImport = hasStreams
      ? `import { Stream } from 'flexism/stream'\n`
      : ''

    // Get additional imports (CSS, etc.) excluding flexium/core and flexium/dom
    const excludedModules = ['flexium/core', 'flexium/dom', 'flexism/stream']
    const additionalImports = this.imports.filter(imp => {
      return !excludedModules.some(mod => imp.includes(`'${mod}'`) || imp.includes(`"${mod}"`))
    }).join('\n')
    const additionalImportsBlock = additionalImports ? additionalImports + '\n' : ''

    // Get module-level declarations
    const moduleDeclarationsBlock = this.getModuleDeclarationsBlock()

    return `
${streamImport}${streamRefImport}import { use } from 'flexium/core'
${additionalImportsBlock}${moduleDeclarationsBlock}
// Server Loader for: ${name}
export ${isAsync ? 'async ' : ''}function loader(props) {
  ${this.cleanServerBody(serverBody)}${streamConversionCode}
  return ${propsObject}
}

// Server Component for SSR
export function Component(${componentPropsParam}) {${streamRestorationBlock}${this.cleanClientBody(clientBody)}
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

    // Get stream variable names to exclude from props
    // (they're restored from __streams, not passed directly)
    const streamVarNames = new Set(
      streams.map(s => s.variableName || `__stream_${streams.indexOf(s)}`)
    )

    // Build props with __streams, excluding stream variables
    const allProps = sharedProps.filter(prop => !streamVarNames.has(prop))
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
    // Stream.fromJSON() handles both regular and sendable streams
    // Memoize with use() to prevent creating new Stream instances on each render
    // use() with deps returns [value, meta], so we destructure to get just the value
    const streamImport = hasStreams
      ? `import { Stream } from 'flexism/stream'\n`
      : ''
    const streamRestoration = streams.map(stream => {
      const varName = stream.variableName || `__stream_${streams.indexOf(stream)}`
      return `  const [${varName}] = use(() => __streams?.${varName} ? Stream.fromJSON(__streams.${varName}) : null, [])`
    }).join('\n')

    const streamRestorationBlock = hasStreams ? `\n${streamRestoration}\n` : ''

    // Get additional imports (CSS, etc.) excluding flexium/core, flexium/dom, flexism/stream
    const excludedModules = ['flexium/core', 'flexium/dom', 'flexism/stream']
    const additionalImports = this.imports.filter(imp => {
      return !excludedModules.some(mod => imp.includes(`'${mod}'`) || imp.includes(`"${mod}"`))
    }).join('\n')
    const additionalImportsBlock = additionalImports ? additionalImports + '\n' : ''

    // Get module-level declarations (CSS variables, etc.)
    const moduleDeclarationsBlock = this.getModuleDeclarationsBlock()

    return `
// Client Component: ${name}
${streamImport}import { use } from 'flexium/core'
import { hydrate } from 'flexium/dom'
${additionalImportsBlock}${moduleDeclarationsBlock}
export function ${componentName}(${propsParam}) {${streamRestorationBlock}${this.cleanClientBody(clientBody)}
}

// Hydration entry
export function ${hydrateName}(container, serverData) {
  hydrate({ type: ${componentName}, props: serverData, children: [], key: undefined }, container, {})
}
`.trim()
  }

  private cleanClientBody(body: string): string {
    // For client body, we need to extract just the inner content
    let cleaned = body.trim()

    // Check if this is a block body with braces
    if (cleaned.startsWith('{')) {
      // Find the matching closing brace for the first opening brace
      // This handles cases where SWC spans include extra content
      let braceCount = 0
      let matchingEnd = -1

      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i]
        if (char === '{') {
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            matchingEnd = i
            break
          }
        }
      }

      if (matchingEnd !== -1) {
        // Extract content between first { and its matching }
        cleaned = cleaned.slice(1, matchingEnd).trim()
      }
    } else {
      // Arrow function with expression body (implicit return)
      // e.g., () => <div>Hello</div>
      // Need to add return statement
      if (!cleaned.startsWith('return ') && !cleaned.startsWith('return\n')) {
        cleaned = `return ${cleaned}`
      }
    }

    return cleaned
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

    // Inject deterministic IDs into Stream constructor calls
    cleaned = this.injectStreamIds(cleaned)

    // Don't remove trailing braces - they belong to statements in the body
    return cleaned.trim()
  }

  /**
   * Inject deterministic IDs into Stream constructor calls
   * Transforms: new Stream(callback, options)
   * Into: new Stream(callback, options, "deterministic_id")
   * Handles multi-line Stream constructions
   */
  private injectStreamIds(code: string): string {
    const streams = this.context.streams || []
    if (streams.length === 0) return code

    let result = code

    // Process streams in reverse order of their appearance
    // to avoid position shifts when modifying code
    const sortedStreams = [...streams].sort(
      (a, b) => (b.position?.start || 0) - (a.position?.start || 0)
    )

    for (const stream of sortedStreams) {
      // Find all occurrences of "new Stream" for this variable
      result = this.injectIdIntoStreamConstruction(result, stream.variableName, stream.id)
    }

    return result
  }

  /**
   * Inject ID into a multi-line Stream constructor call
   * Finds the Stream construction and injects ID before the final closing paren
   */
  private injectIdIntoStreamConstruction(code: string, varName: string, id: string): string {
    // Find pattern: varName = new Stream<...>(
    // The type parameters are optional
    const varPattern = new RegExp(
      `(${varName}\\s*=\\s*new\\s+Stream)(?:<[^>]*>)?\\s*\\(`,
      'g'
    )

    const match = varPattern.exec(code)
    if (!match || match.index === undefined) return code

    // Find the opening paren position
    const openParenIdx = code.indexOf('(', match.index + match[0].length - 1)
    if (openParenIdx === -1) return code

    // Track parentheses to find the matching close paren
    let parenCount = 1
    let closeParenIdx = openParenIdx + 1

    for (let i = openParenIdx + 1; i < code.length && parenCount > 0; i++) {
      const char = code[i]
      if (char === '(') parenCount++
      else if (char === ')') {
        parenCount--
        if (parenCount === 0) {
          closeParenIdx = i
          break
        }
      }
    }

    // Insert the ID before the closing paren
    const before = code.slice(0, closeParenIdx)
    const after = code.slice(closeParenIdx)

    return `${before}, "${id}"${after}`
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
