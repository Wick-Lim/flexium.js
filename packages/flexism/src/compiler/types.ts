/**
 * Flexism Compiler Types
 */

export interface CompilerOptions {
  /** Source directory */
  srcDir: string
  /** Output directory */
  outDir: string
  /** Enable minification */
  minify?: boolean
  /** Enable source maps */
  sourcemap?: boolean
  /** Target environment */
  target?: 'es2020' | 'es2021' | 'es2022' | 'esnext'
}

// ─────────────────────────────────────────────────────────────────────────────
// Analysis Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  /** File path */
  filePath: string
  /** All exports in the file */
  exports: ExportInfo[]
}

export interface ExportInfo {
  /** Export name ('default' or named) */
  name: string
  /** Type of export */
  type: 'api' | 'component'
  /** Whether the function is async */
  isAsync: boolean
  /** Whether it returns a function (component pattern) */
  returnsFunction: boolean
  /** Server code body range */
  serverBody: CodeSpan | null
  /** Client code body range */
  clientBody: CodeSpan | null
  /** Props passed from server to client */
  sharedProps: string[]
}

export interface FunctionAnalysis {
  isAsync: boolean
  returnsFunction: boolean
  serverBody: CodeSpan | null
  clientBody: CodeSpan | null
  sharedProps: string[]
}

export interface CodeSpan {
  start: number
  end: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Transform Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TransformResult {
  /** Original file path */
  filePath: string
  /** Server module code */
  serverCode: string
  /** Client module code */
  clientCode: string
  /** Route manifest info */
  route: RouteInfo
}

export interface RouteInfo {
  /** Route path pattern (e.g., /user/:id) */
  path: string
  /** Export name */
  exportName: string
  /** Type */
  type: 'api' | 'component'
  /** File type */
  fileType: FileType
  /** Props to hydrate */
  hydrateProps: string[]
  /** Middleware chain (file paths) */
  middlewares: string[]
  /** Layout chain (file paths, innermost first) */
  layouts: string[]
}

/** Special file types */
export type FileType = 'page' | 'layout' | 'route' | 'middleware'

/** Special file names */
export const SPECIAL_FILES = {
  page: /^page\.(tsx?|jsx?)$/,
  layout: /^layout\.(tsx?|jsx?)$/,
  route: /^route\.(tsx?|jsx?)$/,
  middleware: /^middleware\.(tsx?|jsx?)$/,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Build Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildResult {
  /** Server bundle path */
  serverBundle: string
  /** Client bundle path */
  clientBundle: string
  /** Manifest path */
  manifestPath: string
  /** Build time in ms */
  buildTime: number
}

export interface BuildManifest {
  routes: RouteInfo[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** HTTP methods that indicate an API handler */
export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
] as const

export type HttpMethod = typeof HTTP_METHODS[number]
