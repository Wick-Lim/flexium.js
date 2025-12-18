---
title: Vite Plugin - Official Vite Integration
description: Learn how to use vite-plugin-flexium for automatic JSX configuration, HMR, and DevTools integration.
head:
  - - meta
    - property: og:title
      content: Vite Plugin - Flexium
  - - meta
    - property: og:description
      content: Official Vite plugin for Flexium with JSX transform, Hot Module Replacement, and DevTools integration.
---

# Vite Plugin

The official Vite plugin for Flexium provides automatic JSX configuration, Hot Module Replacement (HMR), and DevTools integration.

## Features

- **JSX Transform** - Automatic configuration for Flexium's JSX
- **Hot Module Replacement** - Component-level HMR for fast development
- **DevTools Integration** - Development tools support
- **Auto Imports** - Optionally auto-import common primitives

## Installation

```bash
npm install vite-plugin-flexium -D
```

## Basic Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [flexium()],
});
```

This automatically configures JSX to use Flexium's JSX runtime, eliminating the need for manual `esbuild` or `tsconfig.json` JSX configuration.

## Configuration Options

```ts
interface FlexiumPluginOptions {
  // Enable JSX transform (default: true)
  jsx?: boolean;

  // Enable HMR (default: true)
  hmr?: boolean;

  // Enable DevTools (default: true in development)
  devtools?: boolean;

  // Include patterns (default: [/\.[jt]sx?$/])
  include?: (string | RegExp)[];

  // Exclude patterns (default: [/node_modules/])
  exclude?: (string | RegExp)[];

  // Auto-import Flexium primitives (default: false)
  autoImport?: boolean;
}
```

### JSX Transform

The JSX transform is enabled by default. The plugin automatically configures your project to use Flexium's JSX runtime:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [
    flexium({
      jsx: true, // default
    }),
  ],
});
```

### Auto Imports

Enable automatic imports for common Flexium primitives to reduce boilerplate:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [
    flexium({
      autoImport: true, // Auto-import signal,use, computed, etc.
    }),
  ],
});
```

With `autoImport: true`, you can use Flexium primitives without explicit imports:

```tsx
// Before (without autoImport)
import { use } from 'flexium/core';

function Counter() {
  const [count, setCount] = use(0);
  // ...
}

// After (with autoImport)
function Counter() {
  const [count, setCount] = use(0); // No import needed!
  // ...
}
```

### Custom Include/Exclude Patterns

Control which files the plugin processes:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [
    flexium({
      include: [/\.[jt]sx?$/, /\.vue$/], // Process JSX/TSX and Vue files
      exclude: [/node_modules/, /\.stories\./], // Exclude node_modules and Storybook files
    }),
  ],
});
```

## Hot Module Replacement

The plugin enables HMR for Flexium components automatically. When you save a file:

1. The module is hot-replaced without full page reload
2. Signals maintain their state
3. Components re-render with updated logic

```tsx
// Counter.tsx
import { use } from 'flexium/core';

export function Counter() {
  const [count, setCount] = use(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Edit this file and save - the component updates
// without losing the current count value!
```

### Disabling HMR

If you need to disable HMR:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [
    flexium({
      hmr: false,
    }),
  ],
});
```

## DevTools Integration

In development mode, the plugin automatically enables the Flexium DevTools. Access the DevTools API in the browser console:

```ts
// Access DevTools in browser console
window.__FLEXIUM_DEVTOOLS__.getSignals(); // Map of all signals
window.__FLEXIUM_DEVTOOLS__.getEffects(); // Map of all effects
window.__FLEXIUM_DEVTOOLS__.getComponents(); // Map of all components
```

For more information on using DevTools, see the [DevTools Guide](/guide/devtools).

### Disabling DevTools

DevTools can add overhead in large applications. Disable it if needed:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [
    flexium({
      devtools: false,
    }),
  ],
});
```

## TypeScript Configuration

When using the Vite plugin, you still need to configure TypeScript for JSX:

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

Alternatively, use pragma comments in individual files:

```tsx
/** @jsxImportSource flexium */
import { use } from 'flexium/core';

function App() {
  const [count, setCount] = use(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Troubleshooting

### JSX Not Working

If JSX is not being transformed correctly:

1. Verify the plugin is loaded in `vite.config.ts`
2. Check that your files match the `include` patterns
3. Ensure `tsconfig.json` has the correct JSX configuration
4. Restart the Vite dev server

### HMR Not Preserving State

If HMR is reloading the entire page instead of hot-replacing:

1. Make sure your components are exported (named or default)
2. Avoid side effects at the module level
3. Check the browser console for HMR errors

### Auto Imports Not Working

If auto imports aren't working:

1. Verify `autoImport: true` in the plugin options
2. Restart the Vite dev server after changing the config
3. Check that you're using supported primitives (use(), sync(), etc.)

## Migration from Manual Configuration

If you were previously configuring Flexium manually in Vite, you can simplify your setup:

### Before

```ts
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium',
  },
});
```

### After

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [flexium()],
});
```

The plugin handles JSX configuration automatically and adds HMR and DevTools support.
