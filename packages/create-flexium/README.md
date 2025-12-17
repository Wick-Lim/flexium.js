# create-flexium

Scaffold a new Flexium project with Vite + TypeScript + Tailwind CSS.

## Usage

```bash
npm create flexium@latest my-app
cd my-app
npm install
npm run dev
```

Or with other package managers:

```bash
# Yarn
yarn create flexium my-app

# pnpm
pnpm create flexium my-app

# Bun
bun create flexium my-app
```

## What You Get

- **Vite** - Lightning-fast development server with HMR
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Flexium** - Fine-grained reactive UI framework

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
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Requirements

- Node.js 18.0.0 or higher

## License

MIT
