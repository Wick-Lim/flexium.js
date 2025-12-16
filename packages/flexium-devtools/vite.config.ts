import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: true,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, 'src/panel/index.ts'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        hook: resolve(__dirname, 'src/hook/index.ts'),
        devtools: resolve(__dirname, 'src/devtools.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    sourcemap: true,
    minify: false,
  },
  publicDir: 'public',
})
