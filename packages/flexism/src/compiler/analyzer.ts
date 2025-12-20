/**
 * Flexism Code Analyzer
 *
 * Analyzes source code to identify server-only and client-only patterns
 */

import { parse, type Module, type ModuleItem } from '@swc/core'
import type {
  AnalysisResult,
  CodeRange,
  CodeType,
  SharedVariable,
  ImportInfo,
} from './types'
import { SERVER_MODULES, BROWSER_APIS } from './types'

export class Analyzer {
  private source: string
  private filePath: string
  private ast: Module | null = null

  constructor(source: string, filePath: string) {
    this.source = source
    this.filePath = filePath
  }

  async analyze(): Promise<AnalysisResult> {
    // Parse source with SWC
    this.ast = await parse(this.source, {
      syntax: 'typescript',
      tsx: true,
      comments: false,
    })

    const serverCode: CodeRange[] = []
    const clientCode: CodeRange[] = []
    const sharedVariables: SharedVariable[] = []
    const imports: ImportInfo[] = []
    let isAsync = false

    // Analyze imports
    for (const item of this.ast.body) {
      if (item.type === 'ImportDeclaration') {
        const importInfo = this.analyzeImport(item)
        imports.push(importInfo)
      }
    }

    // Analyze function declarations
    for (const item of this.ast.body) {
      if (item.type === 'FunctionDeclaration' || item.type === 'ExportDefaultDeclaration') {
        const funcAnalysis = this.analyzeFunction(item)
        isAsync = isAsync || funcAnalysis.isAsync
        serverCode.push(...funcAnalysis.serverCode)
        clientCode.push(...funcAnalysis.clientCode)
        sharedVariables.push(...funcAnalysis.sharedVariables)
      }
    }

    return {
      filePath: this.filePath,
      isAsync,
      serverCode,
      clientCode,
      sharedVariables,
      imports,
    }
  }

  private analyzeImport(node: any): ImportInfo {
    const source = node.source.value
    const specifiers = node.specifiers.map((s: any) => {
      if (s.type === 'ImportDefaultSpecifier') {
        return s.local.value
      }
      return s.imported?.value || s.local.value
    })

    const isServerOnly = SERVER_MODULES.some(mod =>
      source === mod || source.startsWith(mod + '/')
    )

    return { source, specifiers, isServerOnly }
  }

  private analyzeFunction(node: any): {
    isAsync: boolean
    serverCode: CodeRange[]
    clientCode: CodeRange[]
    sharedVariables: SharedVariable[]
  } {
    const serverCode: CodeRange[] = []
    const clientCode: CodeRange[] = []
    const sharedVariables: SharedVariable[] = []

    // Get the actual function node
    let funcNode = node
    if (node.type === 'ExportDefaultDeclaration') {
      funcNode = node.decl
    }

    const isAsync = funcNode.async === true

    // Walk the function body
    if (funcNode.body) {
      this.walkNode(funcNode.body, serverCode, clientCode, sharedVariables)
    }

    return { isAsync, serverCode, clientCode, sharedVariables }
  }

  private walkNode(
    node: any,
    serverCode: CodeRange[],
    clientCode: CodeRange[],
    sharedVariables: SharedVariable[]
  ): void {
    if (!node) return

    // Check for await expressions (server)
    if (node.type === 'AwaitExpression') {
      serverCode.push({
        start: node.span.start,
        end: node.span.end,
        type: 'await',
        content: this.source.slice(node.span.start, node.span.end),
      })
    }

    // Check for use() calls (client)
    if (node.type === 'CallExpression') {
      const callee = node.callee
      if (callee.type === 'Identifier' && callee.value === 'use') {
        clientCode.push({
          start: node.span.start,
          end: node.span.end,
          type: 'use_call',
          content: this.source.slice(node.span.start, node.span.end),
        })
      }

      // Check for db.*, prisma.* calls (server)
      if (callee.type === 'MemberExpression') {
        const objName = this.getMemberExpressionRoot(callee)
        if (['db', 'prisma', 'fs'].includes(objName)) {
          serverCode.push({
            start: node.span.start,
            end: node.span.end,
            type: objName === 'fs' ? 'fs_call' : 'db_call',
            content: this.source.slice(node.span.start, node.span.end),
          })
        }

        // Check for browser APIs (client)
        if (BROWSER_APIS.includes(objName)) {
          clientCode.push({
            start: node.span.start,
            end: node.span.end,
            type: 'browser_api',
            content: this.source.slice(node.span.start, node.span.end),
          })
        }
      }
    }

    // Check for process.env access (server)
    if (node.type === 'MemberExpression') {
      const root = this.getMemberExpressionChain(node)
      if (root.startsWith('process.env')) {
        serverCode.push({
          start: node.span.start,
          end: node.span.end,
          type: 'env_access',
          content: this.source.slice(node.span.start, node.span.end),
        })
      }
    }

    // Check for JSX attributes (event handlers -> client)
    if (node.type === 'JSXAttribute') {
      const name = node.name?.value || ''
      if (/^on[A-Z]/.test(name) || name.startsWith('on')) {
        clientCode.push({
          start: node.span.start,
          end: node.span.end,
          type: 'event_handler',
          content: this.source.slice(node.span.start, node.span.end),
        })
      }
    }

    // Recursively walk child nodes
    for (const key of Object.keys(node)) {
      const child = node[key]
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && item.type) {
            this.walkNode(item, serverCode, clientCode, sharedVariables)
          }
        }
      } else if (child && typeof child === 'object' && child.type) {
        this.walkNode(child, serverCode, clientCode, sharedVariables)
      }
    }
  }

  private getMemberExpressionRoot(node: any): string {
    if (node.type === 'Identifier') {
      return node.value
    }
    if (node.type === 'MemberExpression') {
      return this.getMemberExpressionRoot(node.object)
    }
    return ''
  }

  private getMemberExpressionChain(node: any): string {
    if (node.type === 'Identifier') {
      return node.value
    }
    if (node.type === 'MemberExpression') {
      const obj = this.getMemberExpressionChain(node.object)
      const prop = node.property.value || node.property.name || ''
      return `${obj}.${prop}`
    }
    return ''
  }
}

/**
 * Analyze a source file
 */
export async function analyzeFile(source: string, filePath: string): Promise<AnalysisResult> {
  const analyzer = new Analyzer(source, filePath)
  return analyzer.analyze()
}
