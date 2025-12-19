# CLI Commands

Flexism CLI provides development, build, and production commands.

## Installation

The CLI is included with the `flexism` package:

```bash
npm install flexism
```

Or create a new project with everything configured:

```bash
npm create flexism@latest my-app
```

## Commands

### flexism dev

Start the development server with hot module replacement.

```bash
flexism dev
```

Options:
- `--port <port>` - Server port (default: 3000)
- `--host` - Expose to network
- `--open` - Open browser automatically

Under the hood, this runs Vite's dev server with Flexium configuration.

### flexism build

Build for production.

```bash
flexism build
```

Options:
- `--outDir <dir>` - Output directory (default: dist)
- `--sourcemap` - Generate sourcemaps

Runs TypeScript compilation and Vite build.

### flexism start

Start a production server.

```bash
flexism start
```

Options:
- `--port <port>` - Server port (default: 3000)
- `--host` - Listen host (default: localhost)

Serves the built files from the `dist` directory.

## package.json Scripts

Typical setup:

```json
{
  "scripts": {
    "dev": "flexism dev",
    "build": "flexism build",
    "start": "flexism start",
    "preview": "vite preview"
  }
}
```

## Project Structure

```
my-app/
├── src/
│   ├── main.tsx      # App entry point
│   └── style.css     # Styles
├── public/           # Static assets
├── dist/             # Build output
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Vite Configuration

The default `vite.config.ts`:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'flexium/dom'`
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true
  }
})
```

## See Also

- [Quick Start](/guide/quick-start) - Getting started guide
- [Stream](/docs/flexism/stream) - SSE streaming
