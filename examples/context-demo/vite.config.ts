import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'flexium'
  },
  server: {
    port: 3003,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      'flexium': '../../packages/flexium/src/index.ts',
      'flexium/core': '../../packages/flexium/src/core/index.ts',
      'flexium/dom': '../../packages/flexium/src/dom.ts',
      'flexium/jsx-runtime': '../../packages/flexium/src/jsx-runtime.ts',
      'flexium/jsx-dev-runtime': '../../packages/flexium/src/jsx-dev-runtime.ts'
    }
  }
})
