---
title: Server-Side Rendering (SSR) - SEO & Performance
description: Implement SSR with Flexium for improved SEO and faster initial page loads. Server entry, hydration, and best practices.
head:
  - - meta
    - property: og:title
      content: Server-Side Rendering - Flexium SSR
  - - meta
    - property: og:description
      content: Generate HTML on the server for better SEO and initial load performance. Complete SSR guide for Flexium.
---

# Server-Side Rendering (SSR)

Flexium supports Server-Side Rendering (SSR) to generate HTML on the server, improving SEO and initial load performance. SSR allows you to render your Flexium components to an HTML string on the server, send it to the client, and then "hydrate" the static HTML to make it interactive.

## Why SSR?

Server-Side Rendering offers several advantages:

- **Better SEO**: Search engines can crawl the fully rendered HTML content
- **Faster First Paint**: Users see content immediately while JavaScript loads
- **Improved Performance**: Reduced Time to Interactive (TTI) on slow networks
- **Social Media Sharing**: Meta tags and Open Graph data are immediately available

## Basic Concepts

SSR in Flexium follows a two-step process:

1. **Server**: Render your app to an HTML string using `renderToString()`
2. **Client**: Hydrate the existing HTML using `hydrate()` to attach event handlers and reactivity

## renderToString() API

The `renderToString()` function converts your Flexium components into an HTML string.

### Import

```tsx
import { renderToString } from 'flexium/server'
```

### Usage

```tsx
import { renderToString } from 'flexium/server'
import App from './App'

const html = renderToString(<App />)
// Returns: '<div id="app">...</div>'
```

### What Gets Rendered

`renderToString()` handles all common Flexium constructs:

```tsx
// Text and numbers
renderToString('Hello') // 'Hello'
renderToString(42) // '42'

// Elements
renderToString(<div class="container">Content</div>)
// '<div class="container">Content</div>'

// Components
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}
renderToString(<Greeting name="World" />)
// '<h1>Hello, World!</h1>'

// Signals (values are extracted)
const count = signal(10)
renderToString(<span>{count}</span>)  // {count} works directly in JSX
// '<span>10</span>'

// Arrays
renderToString([
  <li>Item 1</li>,
  <li>Item 2</li>
])
// '<li>Item 1</li><li>Item 2</li>'
```

### Attribute Handling

Attributes are properly converted and escaped:

```tsx
// className becomes class
renderToString(<div className="container" />)
// '<div class="container"></div>'

// Style objects are converted to CSS strings
renderToString(<div style={{ color: 'red', fontSize: '16px' }} />)
// '<div style="color:red;font-size:16px"></div>'

// Boolean attributes
renderToString(<input type="checkbox" checked={true} />)
// '<input type="checkbox" checked="true"/>'

// Event handlers are ignored (they only work on the client)
renderToString(<button onClick={() => alert('Hi')}>Click</button>)
// '<button>Click</button>'
```

### Void Elements

Self-closing elements are properly handled:

```tsx
renderToString(<img src="/logo.png" alt="Logo" />)
// '<img src="/logo.png" alt="Logo"/>'

renderToString(<input type="text" placeholder="Name" />)
// '<input type="text" placeholder="Name"/>'

// Void elements: area, base, br, col, embed, hr, img, input,
// link, meta, param, source, track, wbr
```

### HTML Escaping

All content is automatically escaped to prevent XSS attacks:

```tsx
renderToString(<div>{"<script>alert('xss')</script>"}</div>)
// '<div>&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;</div>'

renderToString(<div data-value={'"quoted" & <special>'} />)
// '<div data-value="&quot;quoted&quot; &amp; &lt;special&gt;"></div>'
```

## hydrate() Function

The `hydrate()` function attaches event handlers and reactivity to existing server-rendered HTML.

### Import

```tsx
import { hydrate } from 'flexium/dom'
```

### Basic Usage

```tsx
import { hydrate } from 'flexium/dom'
import App from './App'

// Assumes #app contains server-rendered HTML
hydrate(<App />, document.getElementById('app')!)
```

### How Hydration Works

Hydration walks the existing DOM tree and:

1. **Validates Structure**: Ensures DOM matches the expected component tree
2. **Attaches Events**: Adds event listeners from `onClick`, `onInput`, etc.
3. **Sets Up Reactivity**: Creates `effect()` bindings for signals
4. **Preserves DOM**: Reuses existing nodes instead of recreating them

```tsx
function Counter() {
  const [count, setCount] = state(0)

  return (
    <div>
      <p>Count: {count}</p>  {/* count works directly, no need for count() */}
      {/* Event handler attached during hydration */}
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}

// Server: renders static HTML
const html = renderToString(<Counter />)

// Client: makes it interactive
hydrate(<Counter />, document.getElementById('app')!)
```

### Hydration Options

You can customize hydration behavior with options:

```tsx
interface HydrateOptions {
  /** Called when hydration encounters a mismatch */
  onMismatch?: (message: string, domNode: Node | null, vnode: any) => void
  /** Whether to recover from mismatches by re-rendering */
  recoverMismatch?: boolean
}
```

Example with custom error handling:

```tsx
hydrate(<App />, document.getElementById('app')!, {
  onMismatch: (message, domNode, vnode) => {
    console.error('Hydration mismatch:', message)
    // Send to error tracking service
    trackError({ type: 'hydration-mismatch', message })
  },
  recoverMismatch: true // Attempt to fix mismatches automatically
})
```

## Signal Handling During SSR

Signals behave differently on the server and client:

### Server Behavior

On the server, `renderToString()` extracts the current value of signals:

```tsx
const count = signal(42)
const doubled = computed(() => count.value * 2)

renderToString(
  <div>
    <p>Count: {count.value}</p>
    <p>Doubled: {doubled.value}</p>
  </div>
)
// '<div><p>Count: 42</p><p>Doubled: 84</p></div>'
```

**Important**: Signal reactivity does NOT work during server rendering. Effects are not executed on the server.

### Client Behavior (Hydration)

During hydration, signals become fully reactive:

```tsx
function Timer() {
  const [seconds, setSeconds] = state(0)

  // Effect only runs on the client after hydration
  effect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  })

  return <div>Elapsed: {seconds} seconds</div>  {/* seconds works directly */}
}

// Server: renders '0 seconds'
// Client: starts counting after hydration
```

### Signals in Props

When signals are used as props, hydration sets up reactive bindings:

```tsx
function Display({ value }) {
  // During hydration, this becomes reactive
  return <p class={value}>Content</p>
}

const theme = signal('light')

// Server: renders static class="light"
renderToString(<Display value={theme} />)

// Client: updates class when signal changes
hydrate(<Display value={theme} />, container)
theme.value = 'dark' // DOM updates automatically
```

## Complete Example: Express.js Server with SSR

Here's a full example integrating Flexium SSR with an Express.js server:

### Project Structure

```
my-app/
├── src/
│   ├── App.tsx           # Shared app component
│   ├── client.tsx        # Client entry point
│   └── server.tsx        # Server entry point
├── index.html            # HTML template
├── server.js             # Express server
└── package.json
```

### App Component (src/App.tsx)

```tsx
import { state } from 'flexium/core'

export default function App() {
  const [count, setCount] = state(0)

  return (
    <div>
      <h1>Flexium SSR Example</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### Server Entry (src/server.tsx)

```tsx
import { renderToString } from 'flexium/server'
import App from './App'

export function render() {
  const html = renderToString(<App />)
  return html
}
```

### Client Entry (src/client.tsx)

```tsx
import { hydrate } from 'flexium/dom'
import App from './App'

// Hydrate the server-rendered HTML
hydrate(<App />, document.getElementById('app')!)
```

### Express Server (server.js)

```javascript
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

const app = express()

// Serve static assets
app.use('/assets', express.static(path.resolve(__dirname, './dist/client/assets')))

app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl

    let template
    let render

    if (!isProduction) {
      // Development: load files directly
      template = await fs.readFile('./index.html', 'utf-8')
      render = (await import('./src/server.tsx')).render
    } else {
      // Production: load built files
      template = await fs.readFile('./dist/client/index.html', 'utf-8')
      render = (await import('./dist/server/server.js')).render
    }

    // Render the app to HTML
    const appHtml = render(url)

    // Inject the app HTML into the template
    const html = template.replace('<!--app-html-->', appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    console.error(e.stack)
    res.status(500).end(e.stack)
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
```

### HTML Template (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexium SSR App</title>
</head>
<body>
  <div id="app"><!--app-html--></div>
  <script type="module" src="/src/client.tsx"></script>
</body>
</html>
```

### Package.json Scripts

```json
{
  "type": "module",
  "scripts": {
    "dev": "node server.js",
    "build": "vite build --outDir dist/client && vite build --ssr src/server.tsx --outDir dist/server",
    "preview": "NODE_ENV=production node server.js"
  }
}
```

## Hydration Mismatch Handling

Hydration mismatches occur when the server-rendered HTML doesn't match what the client expects to render.

### Common Causes

1. **Date/Time Dependencies**: Different server and client times
2. **Random Values**: `Math.random()` produces different results
3. **Conditional Rendering**: Different logic on server vs client
4. **Browser-Only APIs**: Using `window`, `localStorage`, etc. during render

### Example Mismatch

```tsx
// BAD: Will cause hydration mismatch
function Clock() {
  const time = new Date().toLocaleTimeString()
  return <div>Current time: {time}</div>
}
```

Server renders `10:30:15`, client hydrates at `10:30:16` - mismatch!

### Solutions

#### 1. Use Effects for Client-Only Code

```tsx
function Clock() {
  const [time, setTime] = state('')

  // Only runs on client after hydration
  effect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  })

  return <div>Current time: {time || 'Loading...'}</div>  {/* time works directly */}
}
```

#### 2. Detect Environment

```tsx
function BrowserOnly({ children }) {
  const [isBrowser, setIsBrowser] = state(false)

  effect(() => {
    setIsBrowser(true)
  })

  return isBrowser ? children : null  // isBrowser works directly
}

// Usage
<BrowserOnly>
  <div>This only renders on the client</div>
</BrowserOnly>
```

#### 3. Suppress Hydration Warnings

In development mode, Flexium warns about mismatches. You can suppress them:

```tsx
hydrate(<App />, document.getElementById('app')!, {
  onMismatch: (message) => {
    // Ignore expected mismatches
    if (message.includes('time')) return
    console.warn('Hydration issue:', message)
  }
})
```

## Best Practices for SSR

### 1. Keep Initial State Serializable

Avoid complex objects that can't be JSON-serialized:

```tsx
// GOOD
const [user, setUser] = state({ name: 'John', id: 123 })

// BAD (functions don't serialize)
const [user, setUser] = state({
  name: 'John',
  greet: () => 'Hello'
})
```

### 2. Use Effects for Side Effects

Side effects should only run on the client:

```tsx
function Component() {
  const [data, setData] = state(null)

  // Runs only on client
  effect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  })

  return <div>{data ? data.title : 'Loading...'}</div>  {/* data works directly */}
}
```

### 3. Avoid Browser APIs During Render

Check for browser environment before using browser-specific APIs:

```tsx
function Component() {
  // BAD: window is undefined on server
  // const width = window.innerWidth

  // GOOD: Check environment first
  const [width, setWidth] = state(0)

  effect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth)
    }
  })

  return <div>Width: {width}</div>  {/* width works directly */}
}
```

### 4. Optimize Bundle Size

Split server and client code:

```tsx
// client-utils.ts (only imported on client)
export function setupAnalytics() {
  // Browser-specific code
}

// Component.tsx
function Component() {
  effect(async () => {
    if (typeof window !== 'undefined') {
      const { setupAnalytics } = await import('./client-utils')
      setupAnalytics()
    }
  })

  return <div>App</div>
}
```

### 5. Provide Initial Data

Pass server data to the client to avoid double-fetching:

```tsx
// Server
const initialData = await fetchData()
const html = renderToString(<App initialData={initialData} />)

// Embed in HTML
const script = `window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}`

// Client
function App({ initialData }) {
  const [data, setData] = state(
    typeof window !== 'undefined'
      ? window.__INITIAL_DATA__
      : initialData
  )

  return <div>{data.title}</div>  {/* data works directly */}
}
```

## Performance Considerations

### Streaming SSR (Future)

Currently, `renderToString()` returns the complete HTML synchronously. In the future, Flexium may support streaming SSR for better TTFB (Time To First Byte).

### Caching

Cache rendered HTML for static or semi-static pages:

```javascript
const cache = new Map()

app.get('*', async (req, res) => {
  const url = req.originalUrl

  // Check cache
  if (cache.has(url)) {
    return res.send(cache.get(url))
  }

  // Render
  const html = await renderPage(url)

  // Store in cache
  cache.set(url, html)

  res.send(html)
})
```

### Progressive Enhancement

Start with SSR for fast initial load, then enhance with client-side features:

```tsx
function SearchBox() {
  const [query, setQuery] = state('')
  const [suggestions, setSuggestions] = state([])

  // Server: Renders empty search box
  // Client: Adds autocomplete
  effect(() => {
    if (query.length > 2) {  // query works directly in effect (both query() and query work)
      fetchSuggestions(query).then(setSuggestions)
    }
  })

  return (
    <div>
      <input
        value={query}
        onInput={e => setQuery(e.target.value)}
      />
      <ul>
        {suggestions.map(s => <li>{s}</li>)}
      </ul>
    </div>
  )
}
```

## Integration with Vite SSR

Vite provides excellent SSR support. Here's how to integrate Flexium with Vite's SSR mode:

### Vite Config (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import flexium from '@flexium/vite-plugin'

export default defineConfig({
  plugins: [flexium()],
  build: {
    ssr: true,
    rollupOptions: {
      input: {
        server: './src/server.tsx',
        client: './src/client.tsx'
      }
    }
  },
  ssr: {
    noExternal: ['flexium'] // Bundle Flexium in SSR build
  }
})
```

### Development Server

```javascript
import { createServer } from 'vite'

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

app.use(vite.middlewares)

app.use('*', async (req, res) => {
  const url = req.originalUrl

  try {
    // Transform index.html with Vite
    let template = await fs.readFile('./index.html', 'utf-8')
    template = await vite.transformIndexHtml(url, template)

    // Load server entry (Vite handles HMR)
    const { render } = await vite.ssrLoadModule('/src/server.tsx')

    const appHtml = render(url)
    const html = template.replace('<!--app-html-->', appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    vite.ssrFixStacktrace(e)
    console.error(e)
    res.status(500).end(e.message)
  }
})
```

### Production Build

```bash
# Build client bundle
vite build --outDir dist/client

# Build SSR bundle
vite build --ssr src/server.tsx --outDir dist/server
```

## Troubleshooting

### "Text mismatch" Warnings

**Cause**: Text content differs between server and client render.

**Fix**: Ensure deterministic rendering or use effects for dynamic content.

### "Expected element node, got [nodeType]"

**Cause**: DOM structure doesn't match expected component tree.

**Fix**: Verify that server and client render the same components in the same order.

### "No DOM node found for vnode"

**Cause**: Client expects more nodes than exist in the DOM.

**Fix**: Check for conditional rendering that differs between server and client.

### Event Handlers Not Working

**Cause**: Hydration failed or didn't complete.

**Fix**: Check console for hydration errors. Ensure `hydrate()` is called correctly.

## Summary

Server-Side Rendering with Flexium:

1. Use `renderToString()` on the server to generate HTML
2. Use `hydrate()` on the client to make HTML interactive
3. Signals extract values during SSR, become reactive during hydration
4. Use effects for client-only code to avoid mismatches
5. Keep renders deterministic between server and client
6. Cache rendered pages for better performance
7. Integrate with Vite for optimal DX and HMR

With SSR, you get the best of both worlds: fast initial page loads with server-rendered HTML, and rich interactivity with client-side hydration.
