/**
 * Flexism Compiler Types
 */

export interface CompilerOptions {
  /** Source directory */
  srcDir: string
  /** Output directory */
  outDir: string
  /** Build mode - sets sensible defaults for minify/sourcemap */
  mode?: 'development' | 'production'
  /** Enable minification (default: false in dev, true in prod) */
  minify?: boolean
  /** Enable source maps (default: true in dev, false in prod) */
  sourcemap?: boolean
  /** Target environment */
  target?: 'es2020' | 'es2021' | 'es2022' | 'esnext'
  /** Environment variables to inject */
  env?: Record<string, string>
  /** Public env prefix (default: FLEXISM_PUBLIC_) */
  publicEnvPrefix?: string
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
  /** Parameter pattern string for server-only components (e.g., '{ children }') */
  paramPattern: string | null
}

export interface FunctionAnalysis {
  isAsync: boolean
  returnsFunction: boolean
  serverBody: CodeSpan | null
  clientBody: CodeSpan | null
  sharedProps: string[]
  /** Parameter pattern string for server-only components (e.g., '{ children }') */
  paramPattern: string | null
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
  /** Server module path (set by Emitter) */
  serverModule?: string
  /** Client module path (set by Emitter) */
  clientModule?: string
  /** Error module path (closest error.tsx) */
  errorModule?: string
  /** Loading module path (closest loading.tsx) */
  loadingModule?: string
}

/** Special file types */
export type FileType = 'page' | 'layout' | 'route' | 'middleware' | 'error' | 'loading'

/** Special file names */
export const SPECIAL_FILES = {
  page: /^page\.(tsx?|jsx?)$/,
  layout: /^layout\.(tsx?|jsx?)$/,
  route: /^route\.(tsx?|jsx?)$/,
  middleware: /^middleware\.(tsx?|jsx?)$/,
  error: /^error\.(tsx?|jsx?)$/,
  loading: /^loading\.(tsx?|jsx?)$/,
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
  /** Layout modules (path → module name) */
  layouts: Record<string, LayoutManifestEntry>
  /** Middleware modules (path → module name) */
  middlewares: Record<string, string>
  /** Error modules (path → module name) */
  errors: Record<string, string>
  /** Loading modules (path → module name) */
  loadings: Record<string, string>
  /** Stream endpoints (id → manifest entry) */
  streams: Record<string, StreamManifestEntry>
}

export interface LayoutManifestEntry {
  /** Compiled module name */
  module: string
  /** Whether layout uses 2-function pattern */
  hasLoader: boolean
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

// ─────────────────────────────────────────────────────────────────────────────
// Stream Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamAnalysis {
  /** Unique stream ID (deterministic based on file + position) */
  id: string
  /** Variable name the stream is assigned to */
  variableName: string
  /** AST position */
  position: CodeSpan
  /** Extracted callback source code */
  callbackCode: string
  /** Variables captured from closure (e.g., params.roomId) */
  capturedVars: CapturedVariable[]
  /** Stream options */
  options: StreamOptionsAnalysis
}

export interface CapturedVariable {
  /** Full path (e.g., "params.roomId") */
  path: string
  /** Base variable name (e.g., "params") */
  base: string
  /** Property path (e.g., ["roomId"]) */
  properties: string[]
}

export interface StreamOptionsAnalysis {
  /** Initial value expression */
  initial?: string
  /** Once mode */
  once?: boolean
}

export interface StreamEndpoint {
  /** Stream ID */
  id: string
  /** Generated endpoint path */
  path: string
  /** Handler function code */
  handlerCode: string
  /** Required params from URL */
  params: string[]
}

export interface StreamManifestEntry {
  /** Stream ID */
  id: string
  /** SSE endpoint path */
  endpoint: string
  /** Server module containing the handler */
  handlerModule: string
}
