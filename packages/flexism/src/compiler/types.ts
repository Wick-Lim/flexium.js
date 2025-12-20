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

export interface AnalysisResult {
  /** File path */
  filePath: string
  /** Whether the component is async */
  isAsync: boolean
  /** Server-only code ranges */
  serverCode: CodeRange[]
  /** Client-only code ranges */
  clientCode: CodeRange[]
  /** Variables that need to be passed from server to client */
  sharedVariables: SharedVariable[]
  /** Imports used */
  imports: ImportInfo[]
}

export interface CodeRange {
  start: number
  end: number
  type: CodeType
  /** The actual code content */
  content?: string
}

export type CodeType =
  | 'await'           // await expression
  | 'db_call'         // db.*, prisma.*
  | 'fs_call'         // fs.*
  | 'env_access'      // process.env.*
  | 'use_call'        // use()
  | 'event_handler'   // onclick, onChange, etc.
  | 'browser_api'     // document.*, window.*

export interface SharedVariable {
  /** Variable name */
  name: string
  /** Where it's defined (server code) */
  definedAt: number
  /** Where it's used (client code) */
  usedAt: number[]
}

export interface ImportInfo {
  /** Module specifier */
  source: string
  /** Import specifiers */
  specifiers: string[]
  /** Is server-only import */
  isServerOnly: boolean
}

export interface TransformResult {
  /** Server bundle code */
  serverCode: string
  /** Client bundle code */
  clientCode: string
  /** Hydration manifest */
  manifest: HydrationManifest
}

export interface HydrationManifest {
  /** Route path */
  route: string
  /** Component name */
  componentName: string
  /** Client boundaries */
  boundaries: ClientBoundary[]
}

export interface ClientBoundary {
  /** Unique ID for this boundary */
  id: string
  /** Props passed from server */
  props: string[]
  /** Client component path */
  clientComponent: string
}

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

/** Server-only module patterns */
export const SERVER_MODULES = [
  'fs',
  'path',
  'crypto',
  'http',
  'https',
  'net',
  'os',
  'child_process',
  // Database
  'prisma',
  '@prisma/client',
  'mongoose',
  'pg',
  'mysql',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  // ORM
  'drizzle-orm',
  'typeorm',
  'sequelize',
  'knex',
]

/** Browser-only APIs */
export const BROWSER_APIS = [
  'document',
  'window',
  'navigator',
  'localStorage',
  'sessionStorage',
  'location',
  'history',
]
