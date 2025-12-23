/**
 * Stream Analyzer
 *
 * Analyzes source code to find Stream declarations and extract:
 * - Callback code for SSE endpoint generation
 * - Captured variables from closure
 * - Stream options
 */

import { parse, type Module } from '@swc/core'
import type { StreamAnalysis, CapturedVariable, CodeSpan } from './types'
import { createHash } from 'crypto'

export class StreamAnalyzer {
  private source: string
  private filePath: string
  private ast: Module | null = null
  private baseOffset: number = 0

  constructor(source: string, filePath: string) {
    this.source = source
    this.filePath = filePath
  }

  /**
   * Analyze source code for Stream declarations
   */
  async analyze(): Promise<StreamAnalysis[]> {
    this.ast = await parse(this.source, {
      syntax: 'typescript',
      tsx: true,
      comments: false,
    })

    this.baseOffset = this.ast.span.start
    const streams: StreamAnalysis[] = []
    let streamIndex = 0

    // Walk AST to find `new Stream(...)` expressions, tracking parents
    this.walkNode(this.ast, null, (node, parent) => {
      if (this.isStreamConstruction(node)) {
        const analysis = this.analyzeStreamConstruction(node, parent, streamIndex)
        if (analysis) {
          streams.push(analysis)
          streamIndex++
        }
      }
    })

    return streams
  }

  /**
   * Check if node is `new Stream(...)` expression
   */
  private isStreamConstruction(node: any): boolean {
    return (
      node.type === 'NewExpression' &&
      node.callee?.type === 'Identifier' &&
      node.callee?.value === 'Stream'
    )
  }

  /**
   * Analyze a Stream construction and extract info
   */
  private analyzeStreamConstruction(node: any, parent: any, index: number): StreamAnalysis | null {
    const args = node.arguments || []
    if (args.length === 0) return null

    // SWC uses 'expression' in some versions, 'expr' in others
    const firstArg = args[0]
    const callbackArg = firstArg?.expression ?? firstArg?.expr ?? firstArg
    if (!callbackArg || !callbackArg.span) return null

    // Find the variable name this stream is assigned to
    const variableName = this.findAssignmentTarget(node, parent) || `stream_${index}`

    // Extract callback code
    const callbackSpan: CodeSpan = {
      start: this.adjustSpanStart(callbackArg.span.start),
      end: this.adjustSpanEnd(callbackArg.span.end),
    }
    const callbackCode = this.source.slice(callbackSpan.start, callbackSpan.end)

    // Find captured variables in callback
    const capturedVars = this.findCapturedVariables(callbackArg)

    // Extract options if present
    const secondArg = args[1]
    const optionsArg = secondArg?.expression ?? secondArg?.expr ?? secondArg
    const options = optionsArg?.span ? this.parseOptions(optionsArg) : {}

    // Generate deterministic ID
    const id = this.generateStreamId(index)

    return {
      id,
      variableName,
      position: {
        start: this.adjustSpanStart(node.span.start),
        end: this.adjustSpanEnd(node.span.end),
      },
      callbackCode,
      capturedVars,
      options,
    }
  }

  /**
   * Generate a deterministic stream ID based on file path and index
   */
  private generateStreamId(index: number): string {
    // Create hash from file path for uniqueness
    const pathHash = createHash('md5')
      .update(this.filePath)
      .digest('hex')
      .slice(0, 12)

    // Convert file path to valid identifier
    const pathPart = this.filePath
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(-20) // Take last 20 chars

    return `${pathPart}_${pathHash}_${index}`
  }

  /**
   * Find the variable name the Stream is assigned to
   */
  private findAssignmentTarget(node: any, parent: any): string | null {
    if (!parent) return null

    // Case 1: VariableDeclarator - const Messages = new Stream(...)
    if (parent.type === 'VariableDeclarator') {
      if (parent.id?.type === 'Identifier') {
        return parent.id.value
      }
    }

    // Case 2: AssignmentExpression - Messages = new Stream(...)
    if (parent.type === 'AssignmentExpression') {
      if (parent.left?.type === 'Identifier') {
        return parent.left.value
      }
    }

    // Case 3: Property in object - { messages: new Stream(...) }
    if (parent.type === 'KeyValueProperty') {
      if (parent.key?.type === 'Identifier') {
        return parent.key.value
      }
    }

    return null
  }

  /**
   * Find variables captured from closure in callback
   */
  private findCapturedVariables(callbackNode: any): CapturedVariable[] {
    const captured: CapturedVariable[] = []
    const seen = new Set<string>()

    // Known local variables (params of the callback itself)
    const localVars = new Set<string>()

    // Get callback parameters
    if (callbackNode.params) {
      for (const param of callbackNode.params) {
        this.extractIdentifiers(param, localVars)
      }
    }

    // Walk callback body to find member expressions like params.roomId
    this.walkNode(callbackNode.body, null, (node) => {
      if (node.type === 'MemberExpression') {
        const path = this.extractMemberPath(node)
        if (path && !localVars.has(path.base)) {
          const fullPath = path.base + (path.properties.length > 0 ? '.' + path.properties.join('.') : '')
          if (!seen.has(fullPath)) {
            seen.add(fullPath)
            captured.push(path)
          }
        }
      }
    })

    return captured
  }

  /**
   * Extract identifiers from a pattern node
   */
  private extractIdentifiers(node: any, into: Set<string>): void {
    if (!node) return

    if (node.type === 'Identifier') {
      into.add(node.value)
    } else if (node.type === 'ObjectPattern') {
      for (const prop of node.properties || []) {
        if (prop.type === 'KeyValuePatternProperty') {
          this.extractIdentifiers(prop.value, into)
        } else if (prop.type === 'AssignmentPatternProperty') {
          if (prop.key?.type === 'Identifier') {
            into.add(prop.key.value)
          }
        }
      }
    } else if (node.type === 'ArrayPattern') {
      for (const elem of node.elements || []) {
        if (elem) this.extractIdentifiers(elem, into)
      }
    }
  }

  /**
   * Extract member expression path like params.roomId
   */
  private extractMemberPath(node: any): CapturedVariable | null {
    const properties: string[] = []
    let current = node

    while (current.type === 'MemberExpression') {
      if (current.property?.type === 'Identifier') {
        properties.unshift(current.property.value)
      } else if (current.property?.type === 'StringLiteral') {
        properties.unshift(current.property.value)
      } else {
        // Computed property we can't resolve
        return null
      }
      current = current.object
    }

    if (current.type === 'Identifier') {
      const base = current.value
      return {
        path: base + (properties.length > 0 ? '.' + properties.join('.') : ''),
        base,
        properties,
      }
    }

    return null
  }

  /**
   * Parse options object literal
   */
  private parseOptions(node: any): { initial?: string; once?: boolean; sendable?: boolean } {
    const options: { initial?: string; once?: boolean; sendable?: boolean } = {}

    if (node.type !== 'ObjectExpression') return options

    for (const prop of node.properties || []) {
      if (prop.type === 'KeyValueProperty' && prop.key?.type === 'Identifier') {
        const key = prop.key.value
        const value = prop.value

        if (key === 'once' && value?.type === 'BooleanLiteral') {
          options.once = value.value
        }
        if (key === 'sendable' && value?.type === 'BooleanLiteral') {
          options.sendable = value.value
        }
        if (key === 'initial') {
          // Store the source code of initial value
          const span: CodeSpan = {
            start: this.adjustSpanStart(value.span.start),
            end: this.adjustSpanEnd(value.span.end),
          }
          options.initial = this.source.slice(span.start, span.end)
        }
      }
    }

    return options
  }

  /**
   * Walk AST node and call visitor for each node with parent tracking
   */
  private walkNode(node: any, parent: any, visitor: (node: any, parent: any) => void): void {
    if (!node || typeof node !== 'object') return

    visitor(node, parent)

    // Walk children based on node type
    for (const key of Object.keys(node)) {
      const value = node[key]
      if (Array.isArray(value)) {
        for (const item of value) {
          this.walkNode(item, node, visitor)
        }
      } else if (value && typeof value === 'object' && value.type) {
        this.walkNode(value, node, visitor)
      }
    }
  }

  private adjustSpanStart(position: number): number {
    return position - this.baseOffset
  }

  private adjustSpanEnd(position: number): number {
    // SWC spans are [start, end) so end is already exclusive
    return position - this.baseOffset
  }
}

/**
 * Analyze a source file for Stream declarations
 */
export async function analyzeStreams(
  source: string,
  filePath: string
): Promise<StreamAnalysis[]> {
  const analyzer = new StreamAnalyzer(source, filePath)
  return analyzer.analyze()
}
