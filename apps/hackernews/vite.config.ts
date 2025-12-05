import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    resolve: {
        alias: {
            'flexium/jsx-dev-runtime': path.resolve(__dirname, '../../packages/flexium/src/jsx-dev-runtime.ts'),
            'flexium/jsx-runtime': path.resolve(__dirname, '../../packages/flexium/src/jsx-runtime.ts'),
            'flexium/dom': path.resolve(__dirname, '../../packages/flexium/src/dom.ts'),
            'flexium/router': path.resolve(__dirname, '../../packages/flexium/src/router/index.ts'),
            'flexium': path.resolve(__dirname, '../../packages/flexium/src/index.ts')
        }
    }
})
