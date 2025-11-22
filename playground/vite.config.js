import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '../dist'
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      'flexium/jsx-runtime': '../dist/jsx-runtime.mjs',
      'flexium/jsx-dev-runtime': '../dist/jsx-dev-runtime.mjs'
    }
  }
})
