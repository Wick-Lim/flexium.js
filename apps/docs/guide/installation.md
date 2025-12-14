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

Before installing Flexium, ensure you have the following:

- **Node.js**: Version 18.0 or higher (20.x LTS recommended)
- **Package Manager**: npm (bundled with Node.js), yarn, pnpm, or bun
- **Operating System**: Windows, macOS, or Linux
- **Browser**: Modern browser with ES2020+ support for development

To verify your Node.js installation:

```bash
node --version  # Should output v18.0.0 or higher
```

## Create a New Project

The fastest way to get started with Flexium is using the official scaffolding tool:

### Using npm

```bash
npm create flexium@latest my-app
cd my-app
npm install
npm run dev
```

### Using Yarn

```bash
yarn create flexium my-app
cd my-app
yarn install
yarn dev
```

### Using pnpm

```bash
pnpm create flexium my-app
cd my-app
pnpm install
pnpm dev
```

### Using Bun

```bash
bun create flexium my-app
cd my-app
bun install
bun dev
```

The scaffolding tool will prompt you to select:
- Project template (basic, router, full-featured)
- TypeScript support
- ESLint configuration
- Prettier setup

## Install in Existing Project

You can add Flexium to an existing project using your preferred package manager:

### Using npm

```bash
npm install flexium
```

For development dependencies:

```bash
npm install -D vite-plugin-flexium @types/node
```

### Using Yarn

```bash
yarn add flexium
```

For development dependencies:

```bash
yarn add -D vite-plugin-flexium @types/node
```

### Using pnpm

```bash
pnpm add flexium
```

For development dependencies:

```bash
pnpm add -D vite-plugin-flexium @types/node
```

### Using Bun

```bash
bun add flexium
```

For development dependencies:

```bash
bun add -D vite-plugin-flexium @types/node
```

## Vite Configuration

Flexium is designed to work seamlessly with Vite. We recommend using the official Vite plugin for automatic configuration.

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

### Advanced Vite Configuration

For more control over your build process, you can customize the Vite configuration:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import flexium from 'vite-plugin-flexium'
import path from 'path'

export default defineConfig({
  plugins: [
    flexium({
      // Plugin options
      hmr: true,
      devtools: true,
      jsx: 'automatic'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores')
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['flexium']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['flexium']
  }
})
```

### Manual Configuration

If you prefer not to use the plugin, you can configure Vite manually:

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium',
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment'
  }
})
```

Note: Manual configuration does not include HMR or DevTools integration.

## TypeScript Setup and Configuration

Flexium has excellent TypeScript support out of the box. Here's how to configure it properly:

### TypeScript Configuration

Create or update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // JSX Configuration
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",

    // Module Configuration
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",

    // Type Checking
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Path Aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"],
      "@stores/*": ["./src/stores/*"]
    },

    // Build Options
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Output
    "outDir": "./dist",
    "removeComments": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### TypeScript Types

Install necessary type definitions:

```bash
npm install -D @types/node
```

### Type-Safe Components

Example of a fully typed Flexium component:

```ts
import { state } from 'flexium/core'

interface CounterProps {
  initialCount?: number
  step?: number
  onCountChange?: (count: number) => void
}

export function Counter({ initialCount = 0, step = 1, onCountChange }: CounterProps) {
  const count = state(initialCount)

  const increment = () => {
    count.set(c => c + step)
    onCountChange?.(count.valueOf())
  }

  return (
    <div>
      <p>Count: {count.valueOf()}</p>
      <button onclick={increment}>Increment</button>
    </div>
  )
}
```

## IDE Setup

### VS Code

Recommended extensions for the best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`) - JavaScript/TypeScript linting
2. **Prettier** (`esbenp.prettier-vscode`) - Code formatting
3. **TypeScript Vue Plugin (Volar)** (`Vue.volar`) - Enhanced TypeScript support
4. **Path Intellisense** (`christian-kohler.path-intellisense`) - Path autocompletion
5. **Error Lens** (`usernamehw.errorlens`) - Inline error highlighting

#### VS Code Settings

Create or update `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "css"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### VS Code Extensions Configuration

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Vue.volar",
    "christian-kohler.path-intellisense",
    "usernamehw.errorlens"
  ]
}
```

### WebStorm / IntelliJ IDEA

WebStorm provides excellent support for Flexium out of the box:

1. Enable **TypeScript** support in Settings > Languages & Frameworks > TypeScript
2. Set **Node interpreter** to your local Node.js installation
3. Enable **Prettier** in Settings > Languages & Frameworks > JavaScript > Prettier
4. Enable **ESLint** in Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint

#### WebStorm Settings

- **Automatic formatting**: Preferences > Tools > Actions on Save > Enable "Reformat code" and "Run eslint --fix"
- **JSX support**: WebStorm automatically recognizes JSX in `.tsx` files
- **Path mapping**: Automatically resolved from `tsconfig.json` paths

## ESLint and Prettier Configuration

### ESLint Setup

Install ESLint and necessary plugins:

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import
```

Create `.eslintrc.json`:

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }]
  },
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  }
}
```

Create `.eslintignore`:

```
node_modules
dist
build
coverage
*.config.js
*.config.ts
```

### Prettier Setup

Install Prettier:

```bash
npm install -D prettier eslint-config-prettier
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
node_modules
dist
build
coverage
pnpm-lock.yaml
package-lock.json
yarn.lock
```

Update `.eslintrc.json` to include Prettier:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier"
  ]
}
```

### Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\""
  }
}
```

## Project Structure Recommendations

Here's a recommended project structure for Flexium applications:

```
my-flexium-app/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── features/
│   │       ├── TodoList.tsx
│   │       └── UserProfile.tsx
│   ├── stores/
│   │   ├── userStore.ts
│   │   ├── todoStore.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── api.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

### Directory Structure Guidelines

- **components/**: Reusable UI components
  - `common/`: Generic reusable components
  - `layout/`: Layout-specific components
  - `features/`: Feature-specific components
- **stores/**: State management stores
- **utils/**: Utility functions and helpers
- **types/**: TypeScript type definitions
- **styles/**: Global styles and CSS variables

## Development Workflow

### Running the Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The server will typically run on `http://localhost:5173` (or the next available port).

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be output to the `dist/` directory.

### Previewing Production Build

Preview the production build locally:

```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

## Build Configuration

### Production Optimization

Configure optimizations in `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import flexium from 'vite-plugin-flexium'

export default defineConfig({
  plugins: [flexium()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['flexium'],
          utils: ['./src/utils/helpers']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### Asset Handling

Configure how Vite handles static assets:

```ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 4kb
    assetsDir: 'assets'
  }
})
```

## Environment Variables Setup

### Creating Environment Files

Create environment files for different stages:

**.env** (default):
```
VITE_APP_TITLE=Flexium App
VITE_API_URL=http://localhost:3000
```

**.env.development**:
```
VITE_APP_TITLE=Flexium App (Dev)
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

**.env.production**:
```
VITE_APP_TITLE=Flexium App
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

### Using Environment Variables

Access environment variables in your code:

```ts
const apiUrl = import.meta.env.VITE_API_URL
const isDebug = import.meta.env.VITE_DEBUG === 'true'
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

### Type-Safe Environment Variables

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Security Note

Never commit `.env.local` or `.env.*.local` files. Add them to `.gitignore`:

```
# Environment files
.env.local
.env.*.local
```

## Troubleshooting Common Issues

### Issue: JSX is not recognized

**Symptom**: Error "React is not defined" or JSX syntax not recognized.

**Solution**: Ensure `jsxImportSource` is set in both `tsconfig.json` and `vite.config.ts`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### Issue: Module not found errors with path aliases

**Symptom**: TypeScript can't resolve path aliases like `@/components`.

**Solution**: Ensure path aliases are configured in both `tsconfig.json` and `vite.config.ts`:

```ts
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Issue: Hot Module Replacement not working

**Symptom**: Changes don't reflect without manual refresh.

**Solution**:
1. Ensure `vite-plugin-flexium` is installed and configured
2. Check that HMR is enabled in the plugin options
3. Verify your component exports are named exports

### Issue: Build fails with TypeScript errors

**Symptom**: Production build fails but development works.

**Solution**:
1. Run `npm run type-check` to identify type errors
2. Enable `skipLibCheck: true` in `tsconfig.json` as a temporary workaround
3. Fix type errors in your code

### Issue: Large bundle size

**Symptom**: Production bundle is larger than expected.

**Solution**:
1. Use dynamic imports for code splitting:
```ts
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```
2. Configure manual chunks in `vite.config.ts`
3. Run `npm run build -- --mode analyze` to visualize bundle

### Issue: Port already in use

**Symptom**: Development server fails to start.

**Solution**: Change the port in `vite.config.ts`:

```ts
export default defineConfig({
  server: {
    port: 3001
  }
})
```

### Issue: CORS errors in development

**Symptom**: API requests fail with CORS errors.

**Solution**: Configure proxy in `vite.config.ts`:

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### Getting Help

If you encounter issues not covered here:
- Check the [GitHub Issues](https://github.com/flexium/flexium/issues)
- Join the [Discord Community](https://discord.gg/flexium)
- Read the [FAQ](/guide/faq)

## Next Steps

Now that you have Flexium installed and configured, you're ready to start building:

- Learn the [Core Concepts](/guide/core-concepts)
- Build your first [Component](/guide/components)
- Explore [State Management](/guide/state)
- Check out [Examples](/examples)
