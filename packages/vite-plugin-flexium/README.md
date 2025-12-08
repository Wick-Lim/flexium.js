# vite-plugin-flexium

Official Vite plugin for [Flexium](https://flexium.junhyuk.im) - a fine-grained reactive UI framework.

## Features

- **JSX Transform** - Automatic configuration for Flexium's JSX
- **Hot Module Replacement** - Component-level HMR for fast development
- **DevTools Integration** - Development tools support
- **Auto Imports** - Optionally auto-import common primitives

## Installation

```bash
npm install vite-plugin-flexium -D
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [flexium()],
});
```

## Options

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

## Examples

### Basic Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [flexium()],
});
```

### With Auto Imports

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import flexium from 'vite-plugin-flexium';

export default defineConfig({
  plugins: [
    flexium({
      autoImport: true, // Auto-import signal, effect, computed, etc.
    }),
  ],
});
```

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

Or use pragma comments:

```tsx
/** @jsxImportSource flexium */

function App() {
  const count = signal(0);
  return <button onClick={() => count.set(count() + 1)}>{count()}</button>;
}
```

## HMR

The plugin enables HMR for Flexium components. When you save a file:

1. The module is hot-replaced
2. Signals maintain their state
3. Components re-render with updated logic

## DevTools

In development mode, the plugin adds `window.__FLEXIUM_DEVTOOLS__` for debugging:

```ts
// Access devtools in browser console
window.__FLEXIUM_DEVTOOLS__.signals; // Map of all signals
window.__FLEXIUM_DEVTOOLS__.effects; // Map of all effects
window.__FLEXIUM_DEVTOOLS__.components; // Map of all components
```

## License

MIT
