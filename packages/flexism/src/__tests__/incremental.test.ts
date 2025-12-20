import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import {
  hashContent,
  extractDependencies,
  buildDependencyGraph,
  getAffectedFiles,
  BuildCache,
  getBuildCache,
  resetBuildCache,
} from '../compiler/incremental'

describe('Incremental Build', () => {
  describe('hashContent', () => {
    it('should generate consistent hashes', () => {
      const content = 'const x = 1'
      const hash1 = hashContent(content)
      const hash2 = hashContent(content)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different content', () => {
      const hash1 = hashContent('const x = 1')
      const hash2 = hashContent('const x = 2')

      expect(hash1).not.toBe(hash2)
    })

    it('should return 16 character hash', () => {
      const hash = hashContent('test content')
      expect(hash.length).toBe(16)
    })
  })

  describe('extractDependencies', () => {
    const testDir = '/tmp/test-extract-deps'

    beforeEach(async () => {
      await fs.promises.mkdir(testDir, { recursive: true })
      await fs.promises.writeFile(path.join(testDir, 'foo.ts'), 'export const foo = 1')
      await fs.promises.writeFile(path.join(testDir, 'bar.ts'), 'export const bar = 2')
    })

    afterEach(async () => {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    })

    it('should extract relative imports', async () => {
      const source = `
        import { foo } from './foo'
        import bar from './bar'
      `
      const deps = extractDependencies(source, path.join(testDir, 'index.ts'))

      expect(deps).toContain(path.join(testDir, 'foo.ts'))
      expect(deps).toContain(path.join(testDir, 'bar.ts'))
    })

    it('should ignore external packages', () => {
      const source = `
        import React from 'react'
        import { useState } from 'react'
        import axios from 'axios'
      `
      const deps = extractDependencies(source, path.join(testDir, 'index.ts'))

      expect(deps).toHaveLength(0)
    })

    it('should handle export from', async () => {
      const source = `
        export { foo } from './foo'
        export * from './bar'
      `
      const deps = extractDependencies(source, path.join(testDir, 'index.ts'))

      expect(deps).toContain(path.join(testDir, 'foo.ts'))
      expect(deps).toContain(path.join(testDir, 'bar.ts'))
    })

    it('should handle mixed imports', async () => {
      await fs.promises.mkdir(path.join(testDir, 'components'), { recursive: true })
      await fs.promises.mkdir(path.join(testDir, 'utils'), { recursive: true })
      await fs.promises.writeFile(path.join(testDir, 'components', 'foo.ts'), 'export const foo = 1')
      await fs.promises.writeFile(path.join(testDir, 'utils', 'bar.ts'), 'export const bar = 1')

      const source = `
        import React from 'react'
        import { foo } from './foo'
        import bar from '../utils/bar'
        import axios from 'axios'
      `
      const deps = extractDependencies(source, path.join(testDir, 'components', 'Button.tsx'))

      expect(deps).toHaveLength(2)
      expect(deps).toContain(path.join(testDir, 'components', 'foo.ts'))
      expect(deps).toContain(path.join(testDir, 'utils', 'bar.ts'))
    })
  })

  describe('buildDependencyGraph', () => {
    const testDir = '/tmp/test-deps'

    beforeEach(async () => {
      await fs.promises.mkdir(testDir, { recursive: true })

      // Create test files
      await fs.promises.writeFile(
        path.join(testDir, 'a.ts'),
        `import { b } from './b'\nimport { c } from './c'`
      )
      await fs.promises.writeFile(
        path.join(testDir, 'b.ts'),
        `import { c } from './c'`
      )
      await fs.promises.writeFile(
        path.join(testDir, 'c.ts'),
        `export const c = 1`
      )
    })

    afterEach(async () => {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    })

    it('should build dependency graph', async () => {
      const files = [
        path.join(testDir, 'a.ts'),
        path.join(testDir, 'b.ts'),
        path.join(testDir, 'c.ts'),
      ]

      const graph = await buildDependencyGraph(files)

      // a depends on b and c
      const aDeps = graph.dependencies.get(path.join(testDir, 'a.ts'))
      expect(aDeps?.size).toBe(2)

      // c has a and b as dependents
      const cDependents = graph.dependents.get(path.join(testDir, 'c.ts'))
      expect(cDependents?.size).toBe(2)
    })
  })

  describe('getAffectedFiles', () => {
    it('should return affected files including dependents', () => {
      const graph = {
        dependencies: new Map([
          ['/src/a.ts', new Set(['/src/b.ts'])],
          ['/src/b.ts', new Set(['/src/c.ts'])],
          ['/src/c.ts', new Set()],
        ]),
        dependents: new Map([
          ['/src/c.ts', new Set(['/src/b.ts'])],
          ['/src/b.ts', new Set(['/src/a.ts'])],
        ]),
      }

      // If c changes, b and a are affected
      const affected = getAffectedFiles('/src/c.ts', graph)

      expect(affected.has('/src/c.ts')).toBe(true)
      expect(affected.has('/src/b.ts')).toBe(true)
      expect(affected.has('/src/a.ts')).toBe(true)
    })

    it('should handle circular dependencies', () => {
      const graph = {
        dependencies: new Map([
          ['/src/a.ts', new Set(['/src/b.ts'])],
          ['/src/b.ts', new Set(['/src/a.ts'])],
        ]),
        dependents: new Map([
          ['/src/a.ts', new Set(['/src/b.ts'])],
          ['/src/b.ts', new Set(['/src/a.ts'])],
        ]),
      }

      // Should not infinite loop
      const affected = getAffectedFiles('/src/a.ts', graph)

      expect(affected.has('/src/a.ts')).toBe(true)
      expect(affected.has('/src/b.ts')).toBe(true)
    })
  })

  describe('BuildCache', () => {
    const testDir = '/tmp/test-build-cache'

    beforeEach(async () => {
      resetBuildCache()
      await fs.promises.mkdir(testDir, { recursive: true })
      await fs.promises.writeFile(path.join(testDir, 'file.ts'), 'const x = 1')
    })

    afterEach(async () => {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    })

    it('should cache build outputs', async () => {
      const cache = new BuildCache()
      const filePath = path.join(testDir, 'file.ts')

      await cache.cacheOutput(filePath, 'compiled output', [])

      const cached = cache.getCachedOutput(filePath)
      expect(cached?.output).toBe('compiled output')
    })

    it('should invalidate cache entries', async () => {
      const cache = new BuildCache()
      const filePath = path.join(testDir, 'file.ts')

      await cache.cacheOutput(filePath, 'compiled output', [])
      cache.invalidate(filePath)

      const cached = cache.getCachedOutput(filePath)
      expect(cached).toBeUndefined()
    })

    it('should clear all caches', async () => {
      const cache = new BuildCache()
      await fs.promises.writeFile(path.join(testDir, 'a.ts'), 'const a = 1')
      await fs.promises.writeFile(path.join(testDir, 'b.ts'), 'const b = 2')

      await cache.cacheOutput(path.join(testDir, 'a.ts'), 'output a', [])
      await cache.cacheOutput(path.join(testDir, 'b.ts'), 'output b', [])

      cache.clear()

      expect(cache.getCachedOutput(path.join(testDir, 'a.ts'))).toBeUndefined()
      expect(cache.getCachedOutput(path.join(testDir, 'b.ts'))).toBeUndefined()
    })

    it('should return cache stats', async () => {
      const cache = new BuildCache()
      const filePath = path.join(testDir, 'file.ts')

      await cache.cacheOutput(filePath, 'output', [])

      const stats = cache.stats()
      expect(stats.hashCache).toBeDefined()
      expect(stats.outputCache).toBeDefined()
    })
  })

  describe('getBuildCache', () => {
    beforeEach(() => {
      resetBuildCache()
    })

    it('should return singleton instance', () => {
      const cache1 = getBuildCache()
      const cache2 = getBuildCache()

      expect(cache1).toBe(cache2)
    })

    it('should create new instance after reset', () => {
      const cache1 = getBuildCache()
      resetBuildCache()
      const cache2 = getBuildCache()

      expect(cache1).not.toBe(cache2)
    })
  })
})
