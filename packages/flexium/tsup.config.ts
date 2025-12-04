import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    advanced: 'src/advanced.ts',
    dom: 'src/dom.ts',
    canvas: 'src/canvas.ts',
    primitives: 'src/primitives.ts',
    'jsx-runtime': 'src/jsx-runtime.ts',
    'jsx-dev-runtime': 'src/jsx-dev-runtime.ts',
    server: 'src/server/index.ts',
    router: 'src/router/index.ts',
    'test-exports': 'src/test-exports.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  outDir: 'dist',
  // Ensure .mjs extension for ESM builds
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    }
  },
  // Bundle size analysis
  metafile: true,
})
