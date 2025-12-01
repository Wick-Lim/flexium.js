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
