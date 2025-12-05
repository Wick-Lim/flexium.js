import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'flexium'
  },
  server: {
    port: 3006,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      'flexium': '../../packages/flexium/src/index.ts',
      'flexium/jsx-runtime': '../../packages/flexium/src/jsx-runtime.ts',
      'flexium/jsx-dev-runtime': '../../packages/flexium/src/jsx-dev-runtime.ts'
    }
  }
})
