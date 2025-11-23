# Installation

## Prerequisites

- Node.js version 18.0 or higher
- npm, yarn, or pnpm

## Create a New Project

```bash
npm create flexium@latest my-app
```

## Install in Existing Project

```bash
npm install flexium
```

## Vite Configuration

Flexium is designed to work seamlessly with Vite.

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium'
  }
})
```

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```
