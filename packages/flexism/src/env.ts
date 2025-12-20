/**
 * Flexism Environment Variables
 *
 * Loads and manages environment variables with support for:
 * - .env files
 * - Public env vars (FLEXISM_PUBLIC_*) exposed to client
 * - Type-safe env access
 */

import * as fs from 'fs'
import * as path from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvConfig {
  /** Root directory to search for .env files */
  rootDir?: string
  /** Environment mode (development, production, test) */
  mode?: string
  /** Prefix for public environment variables */
  publicPrefix?: string
}

export interface LoadedEnv {
  /** All environment variables */
  all: Record<string, string>
  /** Public environment variables (safe to expose to client) */
  public: Record<string, string>
  /** Private environment variables (server only) */
  private: Record<string, string>
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PUBLIC_PREFIX = 'FLEXISM_PUBLIC_'

// ─────────────────────────────────────────────────────────────────────────────
// Env Loading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load environment variables from .env files
 *
 * Order of precedence (later files override earlier):
 * 1. .env
 * 2. .env.local
 * 3. .env.[mode]
 * 4. .env.[mode].local
 *
 * @example
 * ```ts
 * const env = loadEnv({ rootDir: process.cwd(), mode: 'development' })
 * console.log(env.all.DATABASE_URL)
 * console.log(env.public.FLEXISM_PUBLIC_API_URL)
 * ```
 */
export function loadEnv(config: EnvConfig = {}): LoadedEnv {
  const {
    rootDir = process.cwd(),
    mode = process.env.NODE_ENV || 'development',
    publicPrefix = DEFAULT_PUBLIC_PREFIX,
  } = config

  // Collect all env files in order
  const envFiles = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`,
  ]

  // Load and merge env files
  const merged: Record<string, string> = {}

  for (const envFile of envFiles) {
    const envPath = path.join(rootDir, envFile)
    const parsed = parseEnvFile(envPath)
    Object.assign(merged, parsed)
  }

  // Also include process.env values (they take precedence)
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      merged[key] = value
    }
  }

  // Separate public and private vars
  const publicVars: Record<string, string> = {}
  const privateVars: Record<string, string> = {}

  for (const [key, value] of Object.entries(merged)) {
    if (key.startsWith(publicPrefix)) {
      publicVars[key] = value
    } else {
      privateVars[key] = value
    }
  }

  return {
    all: merged,
    public: publicVars,
    private: privateVars,
  }
}

/**
 * Parse a .env file and return key-value pairs
 */
export function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {}

  if (!fs.existsSync(filePath)) {
    return result
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      // Parse KEY=VALUE
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()

      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      // Handle escape sequences in double-quoted values
      if (value.includes('\\')) {
        value = value
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
      }

      result[key] = value
    }
  } catch {
    // Ignore file read errors
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Build-time Env Injection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate esbuild define options for env variables
 *
 * @example
 * ```ts
 * const env = loadEnv({ mode: 'production' })
 * const define = getEnvDefine(env, { publicOnly: true })
 * // Use in esbuild config: { define }
 * ```
 */
export function getEnvDefine(
  env: LoadedEnv,
  options: { publicOnly?: boolean } = {}
): Record<string, string> {
  const { publicOnly = false } = options
  const define: Record<string, string> = {}

  const vars = publicOnly ? env.public : env.all

  for (const [key, value] of Object.entries(vars)) {
    define[`process.env.${key}`] = JSON.stringify(value)
  }

  return define
}

/**
 * Generate client-side env script
 * This injects public env vars into the browser
 */
export function generateEnvScript(env: LoadedEnv): string {
  const publicEnv = JSON.stringify(env.public)
  return `<script>window.__FLEXISM_ENV__=${publicEnv}</script>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Env Access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get an environment variable with type safety
 *
 * @example
 * ```ts
 * const dbUrl = getEnv('DATABASE_URL') // string | undefined
 * const apiKey = getEnv('API_KEY', 'default-key') // string
 * ```
 */
export function getEnv(key: string): string | undefined
export function getEnv(key: string, defaultValue: string): string
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue
}

/**
 * Require an environment variable (throws if not set)
 *
 * @example
 * ```ts
 * const dbUrl = requireEnv('DATABASE_URL') // throws if not set
 * ```
 */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Required environment variable "${key}" is not set`)
  }
  return value
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvSchema {
  [key: string]: {
    required?: boolean
    default?: string
    validate?: (value: string) => boolean
  }
}

/**
 * Validate environment variables against a schema
 *
 * @example
 * ```ts
 * validateEnv({
 *   DATABASE_URL: { required: true },
 *   PORT: { default: '3000', validate: (v) => !isNaN(Number(v)) },
 * })
 * ```
 */
export function validateEnv(schema: EnvSchema): void {
  const errors: string[] = []

  for (const [key, config] of Object.entries(schema)) {
    const value = process.env[key]

    if (value === undefined) {
      if (config.required) {
        errors.push(`Missing required environment variable: ${key}`)
      } else if (config.default !== undefined) {
        process.env[key] = config.default
      }
      continue
    }

    if (config.validate && !config.validate(value)) {
      errors.push(`Invalid value for environment variable: ${key}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }
}
