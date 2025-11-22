# Flexium Vite Starter

A modern starter template for Flexium with Vite, TypeScript, and Hot Module Replacement (HMR).

## Features

- **Vite** - Lightning-fast builds and HMR
- **TypeScript** - Type safety and better DX
- **JSX Support** - Automatic JSX runtime (no h import needed)
- **ESLint** - Code linting with recommended rules
- **Prettier** - Code formatting
- **Production Optimized** - Minification and tree-shaking

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Start Development Server

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:3000` with Hot Module Replacement enabled. Any changes you make to the code will be reflected immediately in the browser.

### 3. Build for Production

```bash
npm run build
```

This will:
- Run TypeScript type checking
- Bundle your application
- Minify the output
- Generate source maps
- Output to the `dist/` directory

### 4. Preview Production Build

```bash
npm run preview
```

This serves your production build locally so you can test it before deploying.

## Project Structure

```
vite-starter/
├── src/
│   ├── main.tsx          # Application entry point
│   └── style.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── .gitignore           # Git ignore patterns
└── README.md            # This file
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development Guide

### Adding Components

Create new components in the `src/` directory:

```tsx
// src/MyComponent.tsx
import { signal } from 'flexium'

export function MyComponent() {
  const count = signal(0)

  return (
    <div>
      <p>Count: {count.value}</p>
      <button onclick={() => count.value++}>
        Increment
      </button>
    </div>
  )
}
```

Then import and use in `main.tsx`:

```tsx
import { MyComponent } from './MyComponent'

function App() {
  return (
    <div>
      <MyComponent />
    </div>
  )
}
```

### Using Signals

Signals are the core of Flexium's reactivity:

```tsx
import { signal, computed, effect } from 'flexium'

// Create a signal
const count = signal(0)

// Read signal value
console.log(count.value) // 0

// Update signal value
count.value++ // Triggers reactive updates

// Create computed (derived) values
const doubled = computed(() => count.value * 2)

// Run side effects
effect(() => {
  console.log('Count changed:', count.value)
})
```

### Styling

This template uses vanilla CSS in `src/style.css`. You can:

1. **Keep using vanilla CSS** - Simple and straightforward
2. **Add CSS Modules** - Vite supports them out of the box
3. **Use CSS-in-JS** - Import any library you prefer
4. **Add Tailwind CSS** - Follow Tailwind's Vite integration guide

### TypeScript

TypeScript is configured with strict mode enabled. Key settings:

- `strict: true` - All strict type checks enabled
- `noUnusedLocals: true` - Error on unused variables
- `noUnusedParameters: true` - Error on unused parameters
- `jsx: "react-jsx"` - Automatic JSX runtime
- `jsxImportSource: "flexium"` - Use Flexium's JSX factory

### ESLint & Prettier

Code quality tools are preconfigured:

- ESLint enforces code standards
- Prettier handles formatting
- Both work together seamlessly

Run them manually:
```bash
npm run lint    # Check for issues
npm run format  # Auto-format code
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My Flexium App
```

Access in your code:

```tsx
const apiUrl = import.meta.env.VITE_API_URL
```

Note: Only variables prefixed with `VITE_` are exposed to the client.

## Deployment

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to GitHub Pages

1. Update `vite.config.ts`:
```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ... other config
})
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

## Troubleshooting

### Module Not Found

**Problem:** Import errors after cloning
**Solution:** Run `npm install`

### TypeScript Errors

**Problem:** Type errors in editor
**Solution:** Restart your TypeScript server (VS Code: Cmd+Shift+P -> "Restart TS Server")

### HMR Not Working

**Problem:** Changes don't reflect immediately
**Solution:** Check browser console for errors, restart dev server

### Port Already in Use

**Problem:** Port 3000 is already taken
**Solution:** Change port in `vite.config.ts`:
```ts
server: {
  port: 3001, // Use different port
}
```

## Learn More

- [Flexium Documentation](/docs/API.md)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

## Next Steps

1. Explore the example counter in `src/main.tsx`
2. Read about Flexium signals in the docs
3. Build your first component
4. Add routing if needed
5. Deploy your app

## License

MIT - Use this template freely in your projects!
