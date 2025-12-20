/**
 * Environment Variable Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import {
  loadEnv,
  parseEnvFile,
  getEnvDefine,
  generateEnvScript,
  getEnv,
  requireEnv,
  validateEnv,
} from '../env'

const TEST_DIR = path.join(__dirname, '__env_test__')

describe('Environment Variables', () => {
  beforeEach(async () => {
    await fs.promises.mkdir(TEST_DIR, { recursive: true })
  })

  afterEach(async () => {
    await fs.promises.rm(TEST_DIR, { recursive: true, force: true })
  })

  describe('parseEnvFile', () => {
    it('should parse simple key-value pairs', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'DATABASE_URL=postgres://localhost/db\nAPI_KEY=secret123'
      )

      const result = parseEnvFile(path.join(TEST_DIR, '.env'))

      expect(result.DATABASE_URL).toBe('postgres://localhost/db')
      expect(result.API_KEY).toBe('secret123')
    })

    it('should handle quoted values', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'SINGLE=\'single quoted\'\nDOUBLE="double quoted"'
      )

      const result = parseEnvFile(path.join(TEST_DIR, '.env'))

      expect(result.SINGLE).toBe('single quoted')
      expect(result.DOUBLE).toBe('double quoted')
    })

    it('should ignore comments and empty lines', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        '# This is a comment\nKEY=value\n\n# Another comment\nKEY2=value2'
      )

      const result = parseEnvFile(path.join(TEST_DIR, '.env'))

      expect(Object.keys(result)).toEqual(['KEY', 'KEY2'])
    })

    it('should handle escape sequences in double quotes', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'MULTILINE="line1\\nline2"'
      )

      const result = parseEnvFile(path.join(TEST_DIR, '.env'))

      expect(result.MULTILINE).toBe('line1\nline2')
    })

    it('should return empty object for non-existent file', () => {
      const result = parseEnvFile(path.join(TEST_DIR, 'nonexistent.env'))
      expect(result).toEqual({})
    })
  })

  describe('loadEnv', () => {
    it('should load .env files in order', async () => {
      // Create multiple env files
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'VAR1=base\nVAR2=base'
      )
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env.local'),
        'VAR2=local\nVAR3=local'
      )

      const result = loadEnv({ rootDir: TEST_DIR })

      expect(result.all.VAR1).toBe('base')
      expect(result.all.VAR2).toBe('local') // Overridden by .env.local
      expect(result.all.VAR3).toBe('local')
    })

    it('should load mode-specific env files', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'VAR=base'
      )
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env.production'),
        'VAR=production'
      )

      const result = loadEnv({ rootDir: TEST_DIR, mode: 'production' })

      expect(result.all.VAR).toBe('production')
    })

    it('should separate public and private vars', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'SECRET_KEY=secret\nFLEXISM_PUBLIC_API_URL=https://api.example.com'
      )

      const result = loadEnv({ rootDir: TEST_DIR })

      expect(result.public.FLEXISM_PUBLIC_API_URL).toBe('https://api.example.com')
      expect(result.public.SECRET_KEY).toBeUndefined()
      expect(result.private.SECRET_KEY).toBe('secret')
      expect(result.private.FLEXISM_PUBLIC_API_URL).toBeUndefined()
    })

    it('should support custom public prefix', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'PUBLIC_VAR=public\nPRIVATE_VAR=private'
      )

      const result = loadEnv({ rootDir: TEST_DIR, publicPrefix: 'PUBLIC_' })

      expect(result.public.PUBLIC_VAR).toBe('public')
      expect(result.private.PRIVATE_VAR).toBe('private')
    })
  })

  describe('getEnvDefine', () => {
    it('should generate esbuild define config', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'DATABASE_URL=postgres://localhost/db\nFLEXISM_PUBLIC_API=https://api.example.com'
      )

      const env = loadEnv({ rootDir: TEST_DIR })
      const define = getEnvDefine(env)

      expect(define['process.env.DATABASE_URL']).toBe('"postgres://localhost/db"')
      expect(define['process.env.FLEXISM_PUBLIC_API']).toBe('"https://api.example.com"')
    })

    it('should filter to public only when requested', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'SECRET=secret\nFLEXISM_PUBLIC_API=public'
      )

      const env = loadEnv({ rootDir: TEST_DIR })
      const define = getEnvDefine(env, { publicOnly: true })

      expect(define['process.env.FLEXISM_PUBLIC_API']).toBe('"public"')
      expect(define['process.env.SECRET']).toBeUndefined()
    })
  })

  describe('generateEnvScript', () => {
    it('should generate client-side env script', async () => {
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.env'),
        'SECRET=secret\nFLEXISM_PUBLIC_API=https://api.example.com'
      )

      const env = loadEnv({ rootDir: TEST_DIR })
      const script = generateEnvScript(env)

      expect(script).toContain('window.__FLEXISM_ENV__')
      expect(script).toContain('FLEXISM_PUBLIC_API')
      expect(script).not.toContain('SECRET')
    })
  })

  describe('getEnv', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return env value', () => {
      process.env.TEST_VAR = 'test_value'
      expect(getEnv('TEST_VAR')).toBe('test_value')
    })

    it('should return undefined for missing var', () => {
      expect(getEnv('NONEXISTENT')).toBeUndefined()
    })

    it('should return default value for missing var', () => {
      expect(getEnv('NONEXISTENT', 'default')).toBe('default')
    })
  })

  describe('requireEnv', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return env value', () => {
      process.env.REQUIRED_VAR = 'required_value'
      expect(requireEnv('REQUIRED_VAR')).toBe('required_value')
    })

    it('should throw for missing var', () => {
      expect(() => requireEnv('NONEXISTENT')).toThrow('Required environment variable')
    })
  })

  describe('validateEnv', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should pass validation for valid env', () => {
      process.env.REQUIRED = 'value'

      expect(() => validateEnv({
        REQUIRED: { required: true },
      })).not.toThrow()
    })

    it('should throw for missing required var', () => {
      delete process.env.REQUIRED

      expect(() => validateEnv({
        REQUIRED: { required: true },
      })).toThrow('Missing required environment variable')
    })

    it('should apply default values', () => {
      delete process.env.WITH_DEFAULT

      validateEnv({
        WITH_DEFAULT: { default: 'default_value' },
      })

      expect(process.env.WITH_DEFAULT).toBe('default_value')
    })

    it('should validate with custom validator', () => {
      process.env.PORT = 'not_a_number'

      expect(() => validateEnv({
        PORT: { validate: (v) => !isNaN(Number(v)) },
      })).toThrow('Invalid value for environment variable')
    })
  })
})
