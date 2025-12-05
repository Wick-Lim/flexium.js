---
title: Installation - Setting Up Flexium
description: Learn how to install Flexium in your project. Prerequisites, package installation, and configuration guide.
head:
  - - meta
    - property: og:title
      content: Installation - Flexium
  - - meta
    - property: og:description
      content: Complete installation guide for Flexium. Set up your development environment and configure your project.
---

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

Flexium is designed to work seamlessly with Vite. We recommend using the official Vite plugin for automatic configuration:

### Recommended: Using vite-plugin-flexium

Install the official Vite plugin:

```bash
npm install vite-plugin-flexium -D
```

Then configure it in your Vite config:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import flexium from 'vite-plugin-flexium'

export default defineConfig({
  plugins: [flexium()]
})
```

The plugin automatically configures JSX, enables Hot Module Replacement (HMR), and integrates DevTools. See the [Vite Plugin Guide](/guide/vite-plugin) for more details.

### Manual Configuration

If you prefer not to use the plugin, you can configure Vite manually:

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium'
  }
})
```

Note: Manual configuration does not include HMR or DevTools integration.

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
