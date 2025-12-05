# Flexium Monorepo Starter

A production-ready monorepo template for Flexium projects using pnpm workspaces.

## Features

- **Monorepo structure** with pnpm workspaces
- **Shared packages**: components and utilities
- **TypeScript** with shared configuration
- **Hot module replacement** in development
- **Cross-package imports** with workspace protocol
- **Unified scripts** for build, lint, and format
- **Efficient dependency management** with pnpm

## Project Structure

```
.
├── packages/
│   ├── app/              # Main application
│   │   ├── src/
│   │   ├── index.html
│   │   └── package.json
│   ├── components/       # Shared component library
│   │   ├── src/
│   │   │   ├── Counter.tsx
│   │   │   └── Button.tsx
│   │   └── package.json
│   └── utils/           # Shared utility functions
│       ├── src/
│       │   ├── formatNumber.ts
│       │   ├── debounce.ts
│       │   ├── throttle.ts
│       │   └── math.ts
│       └── package.json
├── pnpm-workspace.yaml  # Workspace configuration
├── tsconfig.base.json   # Shared TypeScript config
└── package.json         # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

### Install Dependencies

Install dependencies for all packages:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

This will start the main app at [http://localhost:5173](http://localhost:5173).

### Build

Build all packages:

```bash
pnpm build
```

### Lint & Format

Lint all packages:

```bash
pnpm lint
```

Format all packages:

```bash
pnpm format
```

### Clean

Clean all packages (remove dist and node_modules):

```bash
pnpm clean
```

## Working with the Monorepo

### Adding a New Package

1. Create a new directory under `packages/`
2. Add a `package.json` with the name `@monorepo/package-name`
3. Install dependencies using `pnpm install`

### Cross-Package Dependencies

Use the workspace protocol to reference local packages:

```json
{
  "dependencies": {
    "@monorepo/components": "workspace:*",
    "@monorepo/utils": "workspace:*"
  }
}
```

### Importing from Local Packages

```typescript
// Import from components package
import { Counter, Button } from '@monorepo/components'

// Import from utils package
import { formatNumber, debounce } from '@monorepo/utils'
```

## Package Scripts

### Root Level

- `pnpm dev` - Start development server for main app
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all packages
- `pnpm clean` - Clean all packages

### Per Package

Each package has its own scripts:

```bash
# Run script in specific package
pnpm --filter @monorepo/app dev
pnpm --filter @monorepo/components build
pnpm --filter @monorepo/utils test
```

## Advantages of This Setup

### Code Sharing

- Share components between multiple apps
- Reuse utility functions across projects
- Maintain consistency across your codebase

### Development Experience

- Changes in shared packages are instantly reflected
- TypeScript type checking across packages
- Unified linting and formatting rules

### Build Optimization

- Only rebuild changed packages
- Efficient caching with pnpm
- Smaller bundle sizes with tree-shaking

### Scalability

- Easy to add new packages
- Clear separation of concerns
- Independent versioning per package

## Deployment

### Deploy the Main App

The main app in `packages/app` can be deployed like any Vite application:

```bash
# Build
pnpm --filter @monorepo/app build

# Deploy the dist folder
```

### Publish Shared Packages

If you want to publish your shared packages to npm:

```bash
# Build the package
pnpm --filter @monorepo/components build

# Publish (make sure to update package.json first)
cd packages/components
npm publish
```

## TypeScript Configuration

The monorepo uses a shared `tsconfig.base.json` that all packages extend:

- Strict mode enabled
- Path mapping for easy imports
- Modern ES2020 target
- Bundler module resolution

Each package can extend and customize this configuration as needed.

## Best Practices

1. **Keep packages focused** - Each package should have a single, clear purpose
2. **Use path mapping** - Configure TypeScript paths for clean imports
3. **Shared configuration** - Keep ESLint, Prettier, and TypeScript configs in sync
4. **Version dependencies** - Use workspace protocol for local packages
5. **Document exports** - Add JSDoc comments to exported functions and components

## Learn More

- [Flexium Documentation](https://github.com/Wick-Lim/flexium.js)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Vite](https://vitejs.dev/)
