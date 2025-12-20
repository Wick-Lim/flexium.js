/**
 * Flexism Code Transformer
 *
 * Transforms source code by splitting server and client code
 */

import { transform, print, parse, type Module } from '@swc/core'
import type { AnalysisResult, TransformResult, ClientBoundary } from './types'

export class Transformer {
  private source: string
  private analysis: AnalysisResult

  constructor(source: string, analysis: AnalysisResult) {
    this.source = source
    this.analysis = analysis
  }

  async transform(): Promise<TransformResult> {
    const componentName = this.extractComponentName()
    const route = this.extractRoute()

    // Generate server code
    const serverCode = await this.generateServerCode(componentName)

    // Generate client code
    const { clientCode, boundaries } = await this.generateClientCode(componentName)

    return {
      serverCode,
      clientCode,
      manifest: {
        route,
        componentName,
        boundaries,
      },
    }
  }

  private extractComponentName(): string {
    // Extract from file path or function name
    const match = this.analysis.filePath.match(/([^/]+)\.(tsx?|jsx?)$/)
    if (match) {
      const name = match[1]
      // Convert to PascalCase
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
    return 'Component'
  }

  private extractRoute(): string {
    // Extract route from file path
    // e.g., routes/user/[id].tsx -> /user/:id
    const match = this.analysis.filePath.match(/routes\/(.+)\.(tsx?|jsx?)$/)
    if (match) {
      return '/' + match[1]
        .replace(/\[([^\]]+)\]/g, ':$1')  // [id] -> :id
        .replace(/\/index$/, '')           // /index -> /
    }
    return '/'
  }

  private async generateServerCode(componentName: string): Promise<string> {
    const { serverCode, clientCode, imports, sharedVariables } = this.analysis

    // If no server code, return minimal loader
    if (serverCode.length === 0) {
      return `
// Generated server code for ${componentName}
export async function loader({ params, request }) {
  return {}
}
`.trim()
    }

    // Build server imports (only server-safe imports)
    const serverImports = imports
      .filter(imp => imp.isServerOnly || !this.isClientOnlyImport(imp.source))
      .map(imp => `import { ${imp.specifiers.join(', ')} } from '${imp.source}'`)
      .join('\n')

    // Extract server-only logic (await expressions, db calls, etc.)
    const serverLogic = this.extractServerLogic()

    // Build the loader function
    const loaderCode = `
// Generated server code for ${componentName}
${serverImports}

export async function loader({ params, request }) {
${serverLogic}
}

export { default as Component } from './${componentName}.server'
`.trim()

    return loaderCode
  }

  private async generateClientCode(componentName: string): Promise<{
    clientCode: string
    boundaries: ClientBoundary[]
  }> {
    const { clientCode: clientRanges, imports } = this.analysis
    const boundaries: ClientBoundary[] = []

    // If no client code, return empty
    if (clientRanges.length === 0) {
      return {
        clientCode: `// No client code needed for ${componentName}`,
        boundaries: [],
      }
    }

    // Build client imports (flexium/core for use(), etc.)
    const clientImports = [
      `import { use } from 'flexium/core'`,
      `import { hydrate } from 'flexium/dom'`,
    ]

    // Extract all use() calls and event handlers
    const useCallRanges = clientRanges.filter(r => r.type === 'use_call')
    const eventHandlerRanges = clientRanges.filter(r => r.type === 'event_handler')

    // Generate hydration components for each client boundary
    let boundaryId = 0
    for (const range of useCallRanges) {
      const id = `${componentName}_boundary_${boundaryId++}`
      boundaries.push({
        id,
        props: this.extractPropsFromRange(range),
        clientComponent: `${componentName}.client`,
      })
    }

    // Build the client hydration code
    const clientCode = `
// Generated client code for ${componentName}
${clientImports.join('\n')}

${boundaries.map(b => this.generateBoundaryComponent(b)).join('\n\n')}

// Hydration entry
export function hydrateAll(container, serverData) {
  ${boundaries.map(b => `
  const ${b.id}_el = container.querySelector('[data-boundary="${b.id}"]')
  if (${b.id}_el) {
    hydrate(${b.id}, ${b.id}_el, serverData.${b.id})
  }`).join('\n')}
}
`.trim()

    return { clientCode, boundaries }
  }

  private extractServerLogic(): string {
    const { serverCode } = this.analysis
    const lines: string[] = []

    // Group by type and generate appropriate code
    const awaitExprs = serverCode.filter(r => r.type === 'await')
    const dbCalls = serverCode.filter(r => r.type === 'db_call')
    const envAccess = serverCode.filter(r => r.type === 'env_access')

    // Add variable declarations for data fetching
    lines.push('  const data = {}')

    // Process await expressions
    for (let i = 0; i < awaitExprs.length; i++) {
      const expr = awaitExprs[i]
      if (expr.content) {
        lines.push(`  const result${i} = ${expr.content}`)
        lines.push(`  data.result${i} = result${i}`)
      }
    }

    // Process db calls
    for (let i = 0; i < dbCalls.length; i++) {
      const call = dbCalls[i]
      if (call.content) {
        lines.push(`  const dbResult${i} = await ${call.content}`)
        lines.push(`  data.dbResult${i} = dbResult${i}`)
      }
    }

    lines.push('  return data')

    return lines.join('\n')
  }

  private extractPropsFromRange(range: any): string[] {
    // Extract variable references from the code range
    // This is a simplified implementation
    const content = range.content || ''
    const matches: string[] = content.match(/\b[a-zA-Z_]\w*\b/g) || []
    const filtered = matches.filter((m: string) =>
      !['use', 'const', 'let', 'var', 'function', 'return', 'if', 'else'].includes(m)
    )
    return [...new Set(filtered)]
  }

  private generateBoundaryComponent(boundary: ClientBoundary): string {
    return `
function ${boundary.id}({ ${boundary.props.join(', ')} }) {
  // Client-side reactive state
  const [state, setState] = use(${boundary.props[0] || 'null'})

  return state
}
`.trim()
  }

  private isClientOnlyImport(source: string): boolean {
    // Imports that are client-only
    return ['flexium/dom', 'flexium/router'].includes(source)
  }
}

/**
 * Transform a source file
 */
export async function transformFile(
  source: string,
  analysis: AnalysisResult
): Promise<TransformResult> {
  const transformer = new Transformer(source, analysis)
  return transformer.transform()
}
