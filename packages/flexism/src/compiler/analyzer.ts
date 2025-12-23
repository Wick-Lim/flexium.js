/**
 * Flexism Code Analyzer
 *
 * Analyzes source code to identify:
 * - Export types (API vs Component)
 * - Server/Client boundaries in 2-function pattern
 */

import { parse, type Module } from '@swc/core'
import type { AnalysisResult, ExportInfo, FunctionAnalysis, CodeSpan, ModuleDeclaration } from './types'
import { HTTP_METHODS } from './types'

export class Analyzer {
  private source: string
  private filePath: string
  private ast: Module | null = null
  private baseOffset: number = 0

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

    // SWC uses global span positions, so we need to adjust relative to our source
    // The AST's span.start gives us the base offset for this source
    this.baseOffset = this.ast.span.start

    const exports: ExportInfo[] = []
    const moduleDeclarations: ModuleDeclaration[] = []

    // Analyze all module-level items
    for (const item of this.ast.body) {
      // Collect module-level variable declarations (const x = css({...}))
      if (item.type === 'VariableDeclaration') {
        const code = this.source.slice(
          this.adjustSpanStart(item.span.start),
          this.adjustSpanEnd(item.span.end)
        )
        moduleDeclarations.push({
          code,
          span: {
            start: this.adjustSpanStart(item.span.start),
            end: this.adjustSpanEnd(item.span.end),
          },
        })
      }

      // export default async function Page() {}
      if (item.type === 'ExportDefaultDeclaration') {
        const decl = item.decl as any
        if (decl.type === 'FunctionExpression' || decl.type === 'FunctionDeclaration') {
          const analysis = this.analyzeFunction(decl)
          exports.push({
            name: 'default',
            type: 'component',
            isAsync: analysis.isAsync,
            returnsFunction: analysis.returnsFunction,
            serverBody: analysis.serverBody,
            clientBody: analysis.clientBody,
            sharedProps: analysis.sharedProps,
            paramPattern: analysis.paramPattern,
          })
        }
      }

      // export async function GET() {} or export async function MyComponent() {}
      if (item.type === 'ExportDeclaration') {
        const decl = item.declaration as any
        if (decl.type === 'FunctionDeclaration' && decl.identifier) {
          const name = decl.identifier.value
          const isApi = (HTTP_METHODS as readonly string[]).includes(name)
          const analysis = this.analyzeFunction(decl)

          exports.push({
            name,
            type: isApi ? 'api' : 'component',
            isAsync: analysis.isAsync,
            returnsFunction: analysis.returnsFunction,
            serverBody: analysis.serverBody,
            clientBody: analysis.clientBody,
            sharedProps: analysis.sharedProps,
            paramPattern: analysis.paramPattern,
          })
        }
      }
    }

    return {
      filePath: this.filePath,
      exports,
      moduleDeclarations,
    }
  }

  /**
   * Adjust a span start position to be relative to source string
   */
  private adjustSpanStart(position: number): number {
    return position - this.baseOffset
  }

  /**
   * Adjust a span end position to be relative to source string
   * SWC spans are [start, end) - end is already exclusive (position after last char)
   */
  private adjustSpanEnd(position: number): number {
    return position - this.baseOffset
  }

  private analyzeFunction(node: any): FunctionAnalysis {
    const isAsync = node.async === true
    let returnsFunction = false
    let serverBody: CodeSpan | null = null
    let clientBody: CodeSpan | null = null
    const sharedProps: string[] = []

    // Build parameter pattern string from AST structure
    // (extracting from source is unreliable due to SWC span offsets)
    let paramPattern: string | null = null
    if (node.params && node.params.length > 0) {
      const firstParam = node.params[0]
      // Handle Parameter wrapper (SWC wraps params in a Parameter node)
      const pat = firstParam.pat || firstParam
      paramPattern = this.buildPatternString(pat)
    }

    if (!node.body) {
      return { isAsync, returnsFunction, serverBody, clientBody, sharedProps, paramPattern }
    }

    const body = node.body
    serverBody = { start: this.adjustSpanStart(body.span.start), end: this.adjustSpanEnd(body.span.end) }

    // Find return statement
    const returnStmt = this.findReturnStatement(body)

    if (returnStmt && returnStmt.argument) {
      const returnArg = returnStmt.argument

      // Check if returns a function: return () => JSX or return function() {}
      if (
        returnArg.type === 'ArrowFunctionExpression' ||
        returnArg.type === 'FunctionExpression'
      ) {
        returnsFunction = true

        // Auto-detect shared props: find server variables used in client body
        // 1. Collect all variable declarations from server body (before return)
        const serverVars = this.collectVariableDeclarations(body, returnStmt)

        // 2. Collect all identifier references from client body
        const clientRefs = this.collectIdentifierReferences(returnArg.body)

        // 3. Intersection: server vars that are referenced in client
        for (const varName of serverVars) {
          if (clientRefs.has(varName)) {
            sharedProps.push(varName)
          }
        }

        // Client body is the inner function
        if (returnArg.body) {
          const clientStart = returnArg.body.span?.start || returnArg.span.start
          const clientEnd = returnArg.body.span?.end || returnArg.span.end
          clientBody = {
            start: this.adjustSpanStart(clientStart),
            end: this.adjustSpanEnd(clientEnd),
          }
        }

        // Server body ends before return statement
        serverBody = {
          start: this.adjustSpanStart(body.span.start),
          end: this.adjustSpanStart(returnStmt.span.start),
        }
      }
    }

    return { isAsync, returnsFunction, serverBody, clientBody, sharedProps, paramPattern }
  }

  /**
   * Build a parameter pattern string from AST node
   */
  private buildPatternString(node: any): string {
    if (!node) return 'props'

    switch (node.type) {
      case 'Identifier':
        return node.value

      case 'ObjectPattern': {
        const props = node.properties
          .map((prop: any) => {
            if (prop.type === 'AssignmentPatternProperty') {
              return prop.key?.value || prop.value?.value
            }
            if (prop.type === 'KeyValuePatternProperty') {
              return prop.key?.value
            }
            if (prop.type === 'RestElement') {
              return `...${this.buildPatternString(prop.argument)}`
            }
            return null
          })
          .filter(Boolean)
        return `{ ${props.join(', ')} }`
      }

      case 'ArrayPattern': {
        const elements = node.elements
          .map((el: any) => el ? this.buildPatternString(el) : '')
          .join(', ')
        return `[${elements}]`
      }

      case 'RestElement':
        return `...${this.buildPatternString(node.argument)}`

      case 'AssignmentPattern':
        return this.buildPatternString(node.left)

      default:
        return 'props'
    }
  }

  private findReturnStatement(body: any): any | null {
    if (!body.stmts) return null

    for (const stmt of body.stmts) {
      if (stmt.type === 'ReturnStatement') {
        return stmt
      }
    }

    return null
  }

  /**
   * Collect variable declarations from server body (statements before return)
   */
  private collectVariableDeclarations(body: any, returnStmt: any): Set<string> {
    const vars = new Set<string>()
    if (!body.stmts) return vars

    for (const stmt of body.stmts) {
      // Stop at return statement
      if (stmt === returnStmt) break

      // Handle variable declarations: const x = ..., let y = ...
      if (stmt.type === 'VariableDeclaration') {
        for (const decl of stmt.declarations || []) {
          if (decl.id?.type === 'Identifier') {
            vars.add(decl.id.value)
          }
          // Handle destructuring: const { a, b } = ...
          if (decl.id?.type === 'ObjectPattern') {
            this.collectPatternIdentifiers(decl.id, vars)
          }
          // Handle array destructuring: const [a, b] = ...
          if (decl.id?.type === 'ArrayPattern') {
            this.collectPatternIdentifiers(decl.id, vars)
          }
        }
      }
    }

    return vars
  }

  /**
   * Collect identifiers from destructuring patterns
   */
  private collectPatternIdentifiers(pattern: any, vars: Set<string>): void {
    if (pattern.type === 'Identifier') {
      vars.add(pattern.value)
    } else if (pattern.type === 'ObjectPattern') {
      for (const prop of pattern.properties || []) {
        if (prop.type === 'KeyValuePatternProperty') {
          this.collectPatternIdentifiers(prop.value, vars)
        } else if (prop.type === 'AssignmentPatternProperty') {
          if (prop.key?.type === 'Identifier') {
            vars.add(prop.key.value)
          }
        } else if (prop.type === 'RestElement') {
          this.collectPatternIdentifiers(prop.argument, vars)
        }
      }
    } else if (pattern.type === 'ArrayPattern') {
      for (const element of pattern.elements || []) {
        if (element) {
          this.collectPatternIdentifiers(element, vars)
        }
      }
    }
  }

  /**
   * Collect all identifier references from an AST node (client body)
   */
  private collectIdentifierReferences(node: any): Set<string> {
    const refs = new Set<string>()
    this.walkNode(node, (n: any) => {
      if (n.type === 'Identifier') {
        refs.add(n.value)
      }
    })
    return refs
  }

  /**
   * Walk AST node and call visitor for each node
   */
  private walkNode(node: any, visitor: (n: any) => void): void {
    if (!node || typeof node !== 'object') return

    visitor(node)

    for (const key of Object.keys(node)) {
      const value = node[key]
      if (Array.isArray(value)) {
        for (const item of value) {
          this.walkNode(item, visitor)
        }
      } else if (value && typeof value === 'object') {
        this.walkNode(value, visitor)
      }
    }
  }
}

/**
 * Analyze a source file
 */
export async function analyzeFile(source: string, filePath: string): Promise<AnalysisResult> {
  const analyzer = new Analyzer(source, filePath)
  return analyzer.analyze()
}
