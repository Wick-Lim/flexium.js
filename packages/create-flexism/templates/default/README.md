# Flexism App

Realtime-first Fullstack Framework built with [Flexium](https://github.com/user/flexium).

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (optimized & minified)
- `npm run start` - Start production server
- `npm run preview` - Preview production build

## Development Features

### Hot Module Replacement (HMR)

The dev server includes automatic HMR:

- **CSS Hot Reload** - Style changes apply instantly without page refresh
- **Component Updates** - Modified components reload automatically
- **Build Error Overlay** - Errors display directly in the browser

### Incremental Builds

Only changed files are recompiled:

- **File Hashing** - Detects actual content changes
- **Dependency Tracking** - Rebuilds affected files only
- **Fast Rebuilds** - Sub-second rebuild times

### Memory Optimization

Built-in memory management:

- **LRU Cache** - Efficient caching with size limits
- **Automatic Cleanup** - Clears cache on high memory usage
- **Zero-Copy Streaming** - Minimal memory overhead for large files

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

## Learn More

- [Flexium Documentation](https://flexium.junhyuk.im)
