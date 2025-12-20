/**
 * Flexism Code Analyzer
 *
 * Analyzes source code to identify:
 * - Export types (API vs Component)
 * - Server/Client boundaries in 2-function pattern
 */

import { parse, type Module } from '@swc/core'
import type { AnalysisResult, ExportInfo, FunctionAnalysis, CodeSpan } from './types'
import { HTTP_METHODS } from './types'

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

    const exports: ExportInfo[] = []

    // Analyze all exports
    for (const item of this.ast.body) {
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
          })
        }
      }
    }

    return {
      filePath: this.filePath,
      exports,
    }
  }

  private analyzeFunction(node: any): FunctionAnalysis {
    const isAsync = node.async === true
    let returnsFunction = false
    let serverBody: CodeSpan | null = null
    let clientBody: CodeSpan | null = null
    const sharedProps: string[] = []

    if (!node.body) {
      return { isAsync, returnsFunction, serverBody, clientBody, sharedProps }
    }

    const body = node.body
    serverBody = { start: body.span.start, end: body.span.end }

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

        // Extract props from function parameters
        if (returnArg.params && returnArg.params.length > 0) {
          const firstParam = returnArg.params[0]
          if (firstParam.type === 'ObjectPattern') {
            for (const prop of firstParam.properties) {
              if (prop.type === 'KeyValuePatternProperty' || prop.type === 'AssignmentPatternProperty') {
                const key = prop.key || prop.value
                if (key && key.type === 'Identifier') {
                  sharedProps.push(key.value)
                }
              }
              if (prop.type === 'Identifier') {
                sharedProps.push(prop.value)
              }
            }
          }
        }

        // Client body is the inner function
        if (returnArg.body) {
          clientBody = {
            start: returnArg.body.span?.start || returnArg.span.start,
            end: returnArg.body.span?.end || returnArg.span.end,
          }
        }

        // Server body ends before return statement
        serverBody = {
          start: body.span.start,
          end: returnStmt.span.start,
        }
      }
    }

    return { isAsync, returnsFunction, serverBody, clientBody, sharedProps }
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
}

/**
 * Analyze a source file
 */
export async function analyzeFile(source: string, filePath: string): Promise<AnalysisResult> {
  const analyzer = new Analyzer(source, filePath)
  return analyzer.analyze()
}
