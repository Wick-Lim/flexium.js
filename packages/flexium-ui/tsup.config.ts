import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['flexium'],
  outExtension: () => ({ js: '.mjs' }),
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'flexium'
  }
})
