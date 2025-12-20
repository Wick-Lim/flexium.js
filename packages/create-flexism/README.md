# create-flexism

[![npm version](https://img.shields.io/npm/v/create-flexism.svg)](https://www.npmjs.com/package/create-flexism)
[![license](https://img.shields.io/npm/l/create-flexism.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

Scaffold a new Flexism project - the realtime-first fullstack framework.

## Usage

```bash
npm create flexism@latest my-app
cd my-app
npm install
npm run dev
```

Or with other package managers:

```bash
# Yarn
yarn create flexism my-app

# pnpm
pnpm create flexism my-app

# Bun
bun create flexism my-app
```

## What You Get

- **Flexism** - Realtime-first fullstack framework
- **Flexium** - Fine-grained reactive UI framework
- **Vite** - Lightning-fast development server
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling

### Development Features

- **HMR** - Hot Module Replacement with CSS hot reload (no page refresh)
- **Incremental Builds** - Only changed files recompile
- **Memory Optimization** - LRU cache with automatic cleanup
- **Zero-Copy Streaming** - Efficient handling of large files
- **Error Overlay** - Build errors displayed in browser

## Project Structure

```
my-app/
├── src/
│   ├── main.tsx      # App entry point
│   └── style.css     # Tailwind imports
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Scripts

```bash
npm run dev      # Start dev server with HMR (flexism dev)
npm run build    # Build for production (flexism build)
npm run start    # Start production server (flexism start)
npm run preview  # Preview production build (vite preview)
```

## Requirements

- Node.js 18.0.0 or higher

## License

MIT
