# Deployment Guide

Complete guide for building, optimizing, and deploying Flexium applications to production.

## Table of Contents

- [Development Setup](#development-setup)
- [Building for Production](#building-for-production)
- [Production Optimization](#production-optimization)
- [Hosting Options](#hosting-options)
- [CDN Usage](#cdn-usage)
- [Environment Configuration](#environment-configuration)
- [Performance Monitoring](#performance-monitoring)
- [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- Modern code editor (VS Code recommended)

### Project Initialization

#### Option 1: Using Vite (Recommended)

```bash
# Create new Vite project
npm create vite@latest my-flexium-app -- --template vanilla-ts

# Navigate to project
cd my-flexium-app

# Install Flexium
npm install flexium

# Install dependencies
npm install
```

#### Option 2: Manual Setup

```bash
# Create project directory
mkdir my-flexium-app
cd my-flexium-app

# Initialize package.json
npm init -y

# Install Flexium and dev dependencies
npm install flexium
npm install -D typescript vite @types/node
```

### Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxImportSource: 'flexium'
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          flexium: ['flexium']
        }
      }
    }
  }
})
```

### Project Structure

```
my-flexium-app/
├── src/
│   ├── main.tsx          # App entry point
│   ├── App.tsx           # Root component
│   ├── components/       # Reusable components
│   ├── store/            # Signals and state
│   └── styles/           # CSS files
├── public/               # Static assets
├── index.html            # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Development Server

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## Building for Production

### Vite Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Output**: `dist/` directory with optimized files

### Build Configuration

#### Optimized Vite Config

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    sourcemap: true,             // Enable for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          flexium: ['flexium'],
          vendor: ['other-dependencies']
        }
      }
    },
    chunkSizeWarningLimit: 500   // Warn if chunks > 500KB
  }
})
```

### TypeScript Compilation

If not using Vite:

```bash
# Compile TypeScript
npx tsc

# Or with build script in package.json
npm run build
```

### Webpack Build

If using Webpack, create `webpack.config.js`:

```javascript
const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        flexium: {
          test: /[\\/]node_modules[\\/]flexium/,
          name: 'flexium',
          priority: 10
        }
      }
    }
  }
}
```

---

## Production Optimization

### Code Splitting

Split your app into smaller chunks for faster loading:

```typescript
// Lazy load routes or components
const Dashboard = lazy(() => import('./components/Dashboard'))

function App() {
  return (
    <div>
      <Dashboard />
    </div>
  )
}
```

### Tree Shaking

Only import what you need:

```typescript
// Good - tree-shakeable
import { signal, computed } from 'flexium'
import { render } from 'flexium/dom'

// Avoid - imports everything
import * as Flexium from 'flexium'
```

### Minification

Ensure your build tool minifies code:

**Vite** (built-in):
```typescript
export default defineConfig({
  build: {
    minify: 'terser'  // or 'esbuild' for faster builds
  }
})
```

**esbuild**:
```bash
npx esbuild src/main.tsx --bundle --minify --outfile=dist/main.js
```

### Compression

Enable gzip or brotli compression on your server:

**Node.js (Express)**:
```javascript
const compression = require('compression')
app.use(compression())
```

**Nginx**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_comp_level 6;
```

### Asset Optimization

#### Images
- Use WebP format for images
- Lazy load images
- Use responsive images with `srcset`

```tsx
<img
  src="/hero.webp"
  srcset="/hero-small.webp 480w, /hero-medium.webp 768w, /hero-large.webp 1200w"
  loading="lazy"
  alt="Hero image"
/>
```

#### Fonts
- Use system fonts when possible
- Subset custom fonts
- Preload critical fonts

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

### Bundle Analysis

Analyze your bundle size:

```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [visualizer()]
})

# Build and view report
npm run build
# Open stats.html
```

### Caching Strategy

Configure cache headers:

**Vite** (automatic hash-based caching):
- JS/CSS files have content hashes: `main.abc123.js`
- HTML is not cached (max-age=0)

**Custom Headers** (Netlify `_headers`):
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

---

## Hosting Options

### Static Hosting (Recommended)

Flexium apps are pure client-side, perfect for static hosting.

#### Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Deploy**:
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

3. **Continuous Deployment**:
- Connect GitHub repo to Netlify
- Set build command: `npm run build`
- Set publish directory: `dist`

**`netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

#### Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
# Build and deploy
vercel --prod
```

3. **Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

#### GitHub Pages

1. **Install gh-pages**:
```bash
npm install -D gh-pages
```

2. **Add deploy script** to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Deploy**:
```bash
npm run deploy
```

4. **Configure base path** in `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/my-repo-name/'
})
```

---

#### Cloudflare Pages

1. **Connect GitHub repo** to Cloudflare Pages

2. **Build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

3. **Deploy**: Automatic on git push

---

#### AWS S3 + CloudFront

1. **Build**:
```bash
npm run build
```

2. **Upload to S3**:
```bash
aws s3 sync dist/ s3://my-bucket --delete
```

3. **Configure S3**:
   - Enable static website hosting
   - Set index document: `index.html`
   - Set error document: `index.html` (for SPA routing)

4. **CloudFront**:
   - Create distribution pointing to S3 bucket
   - Set default root object: `index.html`
   - Configure error pages: 404 → `/index.html` (200)

---

### Server Hosting

If you need server-side logic:

#### Node.js + Express

```javascript
const express = require('express')
const path = require('path')
const app = express()

// Serve static files
app.use(express.static('dist'))

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(3000, () => console.log('Server running on port 3000'))
```

#### Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## CDN Usage

### Using Flexium from CDN

For quick prototypes or no-build setups:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Flexium CDN Example</title>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    // Import from CDN (when available)
    import { signal, computed, effect } from 'https://cdn.jsdelivr.net/npm/flexium@0.3.0/dist/index.mjs'
    import { h, render } from 'https://cdn.jsdelivr.net/npm/flexium@0.3.0/dist/dom.mjs'

    const count = signal(0)
    const doubled = computed(() => count.value * 2)

    const app = h('div', {}, [
      h('div', {}, [`Count: ${count.value}`]),
      h('div', {}, [`Doubled: ${doubled.value}`]),
      h('button', { onclick: () => count.value++ }, ['Increment'])
    ])

    render(app, document.getElementById('app'))
  </script>
</body>
</html>
```

**CDN Options**:
- jsDelivr: `https://cdn.jsdelivr.net/npm/flexium@0.3.0/dist/index.mjs`
- unpkg: `https://unpkg.com/flexium@0.3.0/dist/index.mjs`
- esm.sh: `https://esm.sh/flexium@0.3.0`

**Note**: CDN is great for prototypes but not recommended for production (slower, less control).

### Hosting Your Own CDN

Use a CDN for your built assets:

1. **Build**: `npm run build`
2. **Upload**: Upload `dist/` to CDN
3. **Configure**: Set long cache headers for hashed files

---

## Environment Configuration

### Environment Variables

**Vite** (`.env` files):
```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-12345678-1
```

**Access in code**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

**Webpack** (`webpack.DefinePlugin`):
```javascript
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify('https://api.example.com')
    })
  ]
}
```

### Build Modes

**Development**:
```bash
npm run dev
# or
NODE_ENV=development npm run build
```

**Production**:
```bash
npm run build
# or
NODE_ENV=production npm run build
```

**Staging**:
```bash
npm run build -- --mode staging
```

---

## Performance Monitoring

### Metrics to Track

1. **Time to First Byte (TTFB)**: < 200ms
2. **First Contentful Paint (FCP)**: < 1.8s
3. **Largest Contentful Paint (LCP)**: < 2.5s
4. **Time to Interactive (TTI)**: < 3.8s
5. **Cumulative Layout Shift (CLS)**: < 0.1
6. **First Input Delay (FID)**: < 100ms

### Tools

#### Lighthouse

```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse https://your-app.com --view
```

#### Web Vitals

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

#### Analytics

**Google Analytics**:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Plausible** (privacy-friendly):
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Error Tracking

**Sentry**:
```bash
npm install @sentry/browser
```

```typescript
import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE
})

// Track errors in effects
effect(() => {
  try {
    // Your code
  } catch (error) {
    Sentry.captureException(error)
  }
})
```

---

## Troubleshooting

### Build Errors

#### "Cannot find module 'flexium'"

**Solution**: Install Flexium
```bash
npm install flexium
```

#### "JSX not working"

**Solution**: Check `tsconfig.json`
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

#### "Types not found"

**Solution**: Rebuild Flexium or check node_modules
```bash
npm install flexium --force
```

### Deployment Errors

#### "Module.require" or "Cannot find module @rollup/rollup-linux-x64-gnu" (Vercel)

**Problem**: Build fails on Vercel (Linux) because `tsup` or `esbuild` cannot find platform-specific binaries, often due to `package-lock.json` being generated on macOS/Windows.

**Solution**: Force installation of Linux binaries before build.

1. Add a `prebuild` script to your package's `package.json`:
```json
"scripts": {
  "prebuild": "npm install --no-save @rollup/rollup-linux-x64-gnu",
  "build": "tsup"
}
```
2. Or configure Vercel **Install Command**: `npm install && npm install --no-save @rollup/rollup-linux-x64-gnu`
3. **Redeploy with Cleared Cache** in Vercel dashboard.

#### "No Output Directory named 'dist' found" (Vercel + VitePress)

**Problem**: Vercel expects the build output in `dist` by default, but VitePress outputs to `.vitepress/dist`.

**Solution**: Configure Output Directory.

1. Go to Vercel Project Settings > **Build & Development Settings**.
2. Change **Output Directory** to: `.vitepress/dist` (or `apps/docs/.vitepress/dist` if root directory is not changed).
3. Alternatively, add `vercel.json`:
```json
{
  "framework": "vitepress",
  "outputDirectory": ".vitepress/dist"
}
```

#### "404 on refresh (SPA routing)"

**Solution**: Configure server to serve `index.html` for all routes

**Netlify**: Add redirect rule
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Nginx**:
```nginx
try_files $uri $uri/ /index.html;
```

#### "CORS errors"

**Solution**: Configure CORS headers on API server
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-app.com')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})
```

#### "Slow initial load"

**Solutions**:
1. Enable compression (gzip/brotli)
2. Use CDN for assets
3. Code split large bundles
4. Lazy load routes
5. Optimize images

### Performance Issues

#### "Large bundle size"

**Solutions**:
1. Check what's in the bundle: `npm run build -- --mode=analyze`
2. Remove unused dependencies
3. Use tree-shaking
4. Code split

#### "Slow updates"

**Solutions**:
1. Use `batch()` for multiple signal updates
2. Use `computed()` for derived values
3. Avoid unnecessary re-renders
4. Check for memory leaks

---

## Checklist

### Pre-Deployment

- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] Check bundle size (target: < 100KB for app code)
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on target browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Verify all environment variables
- [ ] Check error handling
- [ ] Enable analytics
- [ ] Configure error tracking (Sentry)

### Post-Deployment

- [ ] Verify site loads correctly
- [ ] Test all routes/pages
- [ ] Check API connectivity
- [ ] Verify analytics working
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test on slow 3G connection
- [ ] Review accessibility (WAVE, axe)

---

## Resources

- [Vite Documentation](https://vitejs.dev)
- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Sentry](https://docs.sentry.io)

---

**Last Updated**: November 22, 2025

**Questions?** Open an issue on GitHub or check the [main README](/README.md).
