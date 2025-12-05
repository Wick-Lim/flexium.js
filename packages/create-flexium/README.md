# create-flexium

Scaffold a new Flexium project with one command.

## Usage

### With npm 6+

```bash
npm create flexium@latest
```

### With npm 7+

```bash
npm create flexium@latest my-app
```

### With Yarn

```bash
yarn create flexium my-app
```

### With pnpm

```bash
pnpm create flexium my-app
```

### With Bun

```bash
bun create flexium my-app
```

## What You Get

### 1. Vite + TypeScript (Recommended)

Production-ready setup with:
- ⚡ Vite for instant hot module replacement
- 🔷 TypeScript with strict mode
- 📦 Automatic JSX runtime (no `h` imports needed)
- 🎨 Example components
- 🛠️ ESLint + Prettier configured
- 🚀 Optimized build configuration

**Perfect for:** Production apps, learning TypeScript

```bash
npm create flexium@latest my-app
# Choose: Vite + TypeScript (1)
cd my-app
npm install
npm run dev
```

### 2. Vanilla (No Build)

Simple starter with zero build tools:
- 📄 Single HTML file
- 🎯 Works immediately in browser
- 🔄 Live reload with any HTTP server
- 💡 Great for learning

**Perfect for:** Quick experiments, learning basics, no-build projects

```bash
npm create flexium@latest my-app
# Choose: Vanilla (2)
cd my-app
npx serve .
```

### 3. Todo App (Reference)

Complete reference implementation:
- ✅ Full todo application
- 🎨 Best practices demonstrated
- 📝 Comprehensive comments
- 🔍 Real-world patterns

**Perfect for:** Learning patterns, reference implementation

```bash
npm create flexium@latest my-app
# Choose: Todo App (3)
cd my-app
npm install
npm run dev
```

### 4. SSR (Server-Side Rendering)

Server-side rendering for optimal performance:
- 🚀 Express.js server with compression
- 📊 Server-side rendering for better SEO
- 💨 Client-side hydration
- 🔥 Hot module replacement in development
- 📦 Optimized production builds

**Perfect for:** SEO-critical apps, content-heavy sites, optimal performance

```bash
npm create flexium@latest my-app
# Choose: SSR (4)
cd my-app
npm install
npm run dev
```

### 5. PWA (Progressive Web App)

Full PWA with modern features:
- 📱 Install to home screen
- 🔌 Offline support with service worker
- 🔔 Push notifications
- 🔄 Background sync
- 📦 App manifest and icons
- 💾 LocalStorage persistence

**Perfect for:** Mobile-first apps, offline-capable apps, installable web apps

```bash
npm create flexium@latest my-app
# Choose: PWA (5)
cd my-app
npm install
npm run dev
```

### 6. Monorepo (pnpm workspaces)

Monorepo structure with shared packages:
- 📦 pnpm workspaces for efficient package management
- 🧩 Shared component library (@monorepo/components)
- 🛠️ Shared utility library (@monorepo/utils)
- 🔗 Cross-package imports with workspace protocol
- 🎯 Unified build, lint, and format scripts
- 🔥 Hot module replacement across packages

**Perfect for:** Large projects, multiple apps, shared component libraries

```bash
npm create flexium@latest my-app
# Choose: Monorepo (6)
cd my-app
pnpm install  # requires pnpm
pnpm dev
```

## Features

- 🎯 **Interactive CLI** - Choose your template with a beautiful interface
- 📦 **Zero Dependencies** - Pure Node.js, no external packages
- ⚡ **Instant Setup** - Get started in seconds
- 🎨 **6 Templates** - Pick the right starter for your needs
- 🔷 **TypeScript Ready** - Full TypeScript support out of the box
- 🚀 **Production Ready** - Optimized for deployment
- ✅ **Input Validation** - Prevents invalid project names
- 📱 **PWA Support** - Build installable progressive web apps
- 🔄 **SSR Support** - Server-side rendering for optimal performance
- 📦 **Monorepo Support** - Multi-package workspace setup

## Requirements

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher (for monorepo template only)

## Input Validation

The CLI validates project names to ensure they follow npm package naming conventions:

- ✅ Only lowercase letters, numbers, hyphens, and underscores
- ✅ Maximum 214 characters
- ✅ Cannot start with a dot or underscore
- ✅ No reserved names (node_modules, favicon.ico)

**Valid examples:**
```
my-app
my-project-name
my_awesome_app
app-v2
```

**Invalid examples:**
```
MyApp           # uppercase letters not allowed
my app          # spaces not allowed
.myapp          # cannot start with dot
node_modules    # reserved name
```

## Template Comparison

| Feature | Vite | Vanilla | Todo | SSR | PWA | Monorepo |
|---------|------|---------|------|-----|-----|----------|
| TypeScript | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Build Tool | Vite | None | Vite | Vite | Vite | Vite |
| Hot Reload | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Production Build | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| SSR | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Offline Support | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Multi-Package | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Complexity | Low | Minimal | Medium | High | Medium | High |

## Learn More

- [Flexium Documentation](https://github.com/Wick-Lim/flexium.js)
- [Quick Start Guide](https://github.com/Wick-Lim/flexium.js/blob/main/QUICK_START.md)
- [Examples](https://github.com/Wick-Lim/flexium.js/blob/main/EXAMPLES.md)
- [API Reference](https://github.com/Wick-Lim/flexium.js/blob/main/docs/API.md)

## License

MIT
