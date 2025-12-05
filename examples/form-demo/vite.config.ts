import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '../../packages/flexium/dist'
  },
  server: {
    port: 3007,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '../../packages/flexium/dist/jsx-runtime': '../../packages/flexium/dist/jsx-runtime.mjs',
      '../../packages/flexium/dist/jsx-dev-runtime': '../../packages/flexium/dist/jsx-dev-runtime.mjs'
    }
  }
})
