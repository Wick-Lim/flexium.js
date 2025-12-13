import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    dom: 'src/dom/index.ts',
    router: 'src/router/index.ts',
    canvas: 'src/canvas/index.ts',
    interactive: 'src/interactive/index.ts',
    'jsx-runtime': 'src/jsx-runtime.ts',
    'jsx-dev-runtime': 'src/jsx-dev-runtime.ts',
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
