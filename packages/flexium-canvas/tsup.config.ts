import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    dom: 'src/dom.ts',
    interactive: 'src/interactive.ts',
  },
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      jsx: 'react-jsx',
      jsxImportSource: 'flexium',
    }
  },
  splitting: true,
  treeshake: true,
  clean: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  outDir: 'dist',
  external: ['flexium', 'flexium/core', 'flexium/jsx-runtime'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'flexium'
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    }
  },
  metafile: true,
})
