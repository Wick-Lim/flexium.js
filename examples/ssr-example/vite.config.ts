import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
  },
  resolve: {
    alias: {
      'flexium': '../../packages/flexium/src/index.ts',
      'flexium/core': '../../packages/flexium/src/core.ts',
      'flexium/dom': '../../packages/flexium/src/dom.ts',
      'flexium/server': '../../packages/flexium/src/server/index.ts',
      'flexium/jsx-runtime': '../../packages/flexium/src/jsx-runtime.ts',
      'flexium/jsx-dev-runtime': '../../packages/flexium/src/jsx-dev-runtime.ts',
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'flexium',
  }
})
