import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'flexium',
  },
  test: {
    include: ['src/**/__tests__/*.test.ts', 'src/**/__tests__/*.test.tsx'],
    exclude: ['**/node_modules/**'],
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'threads',
    fileParallelism: false,
    isolate: true,
    alias: {
      'flexium/jsx-runtime': path.resolve(__dirname, '../flexium/src/jsx-runtime.ts'),
      'flexium/jsx-dev-runtime': path.resolve(__dirname, '../flexium/src/jsx-runtime.ts'),
      'flexium/css': path.resolve(__dirname, '../flexium/src/css/index.ts'),
      'flexium': path.resolve(__dirname, '../flexium/src/index.ts'),
    }
  },
})
