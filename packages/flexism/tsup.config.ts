import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server/index.ts',
    client: 'src/client/index.ts',
    cli: 'src/cli/index.ts',
    compiler: 'src/compiler/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: {
    entry: {
      index: 'src/index.ts',
      server: 'src/server/index.ts',
      client: 'src/client/index.ts',
      compiler: 'src/compiler/index.ts',
    },
  },
  splitting: true,
  treeshake: true,
  clean: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  outDir: 'dist',
  external: ['flexium', 'esbuild', '@swc/core'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    }
  },
})
