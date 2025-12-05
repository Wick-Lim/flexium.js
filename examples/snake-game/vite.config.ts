import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '../../packages/flexium/dist'
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
      'flexium/jsx-runtime': '../../packages/flexium/dist/jsx-runtime.mjs',
      'flexium/jsx-dev-runtime': '../../packages/flexium/dist/jsx-dev-runtime.mjs',
      'flexium/core': '../../packages/flexium/dist/core.mjs',
      'flexium/dom': '../../packages/flexium/dist/dom.mjs',
      'flexium/canvas': '../../packages/flexium/dist/canvas.mjs',
      'flexium/game': '../../packages/flexium/dist/game.mjs',
      'flexium': '../../packages/flexium/dist/index.mjs'
    }
  }
})
