import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'f',
    jsxFragment: 'Fragment',
    jsxInject: `import { f, Fragment } from 'flexium/dom'`,
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
