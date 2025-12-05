# Flexium SSR Example

A complete Server-Side Rendering (SSR) example demonstrating how to use Flexium for universal rendering with client-side hydration.

## What is SSR?

Server-Side Rendering (SSR) is a technique where the initial page content is rendered on the server and sent to the browser as fully-formed HTML. This provides several benefits:

- **Faster Initial Load**: Users see content immediately without waiting for JavaScript to download and execute
- **Better SEO**: Search engines can crawl and index your content more effectively
- **Progressive Enhancement**: Content is visible even if JavaScript fails to load
- **Improved Performance**: Especially on slower devices and networks

## How SSR Works in Flexium

### 1. Server-Side Rendering

On the server, Flexium uses the `renderToString()` function to convert your components into static HTML:

```tsx
import { renderToString } from 'flexium/server'
import { App } from './App'

// Server renders the component to an HTML string
const html = renderToString(<App />)
```

The `renderToString()` function:
- Executes your component functions
- Reads signal values (without tracking)
- Generates HTML markup
- Handles nested components
- Escapes content for XSS protection

### 2. Client-Side Hydration

On the client, Flexium uses the `hydrate()` function to make the static HTML interactive:

```tsx
import { hydrate } from 'flexium/dom'
import { App } from './App'

// Client hydrates the server-rendered HTML
hydrate(<App />, document.getElementById('app'))
```

The `hydrate()` function:
- Walks the existing DOM tree
- Attaches event handlers (onClick, onInput, etc.)
- Sets up signal reactivity for automatic updates
- Validates DOM matches expected structure
- Creates reactive bindings without re-rendering

### 3. The Hydration Process

```
┌─────────────────────────────────────────────────────────┐
│ 1. SERVER: renderToString(<App />)                     │
│    ↓                                                     │
│    Generates static HTML with initial state             │
├─────────────────────────────────────────────────────────┤
│ 2. NETWORK: Send HTML to browser                       │
│    ↓                                                     │
│    Browser displays content immediately                 │
├─────────────────────────────────────────────────────────┤
│ 3. CLIENT: Load JavaScript bundle                      │
│    ↓                                                     │
│    Execute client code                                  │
├─────────────────────────────────────────────────────────┤
│ 4. CLIENT: hydrate(<App />, container)                 │
│    ↓                                                     │
│    • Attach event handlers                              │
│    • Create signal bindings                             │
│    • Make app interactive                               │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
ssr-example/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Client entry point (hydration)
│   └── entry-server.tsx     # Server entry point (SSR)
├── server.ts                # Express server with SSR
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## How to Run

### Development Mode

```bash
# Install dependencies (from monorepo root)
npm install

# Start the development server with HMR
npm run dev
```

The development server will:
- Run on http://localhost:3000
- Enable Hot Module Replacement (HMR)
- Automatically rebuild on file changes
- Provide source maps for debugging

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

The build process:
1. Builds the client bundle with Vite
2. Builds the server bundle for SSR
3. Optimizes and minifies code
4. Generates source maps

## Key Components

### App.tsx

The main application component demonstrating:
- **Signals**: Reactive state management
- **Computed Values**: Derived state
- **Event Handlers**: User interactions
- **Component Composition**: Nested components

Example:
```tsx
const count = signal(0)
const doubled = computed(() => count.value * 2)

const increment = () => {
  count.value++ // Automatically updates the DOM
}
```

### Server.ts

Express server that:
- Serves static assets in production
- Uses Vite dev server in development
- Renders components with `renderToString()`
- Injects HTML into the template
- Handles errors gracefully

### main.tsx (Client Entry)

Client-side entry point that:
- Imports the App component
- Calls `hydrate()` to make HTML interactive
- Attaches event listeners
- Sets up signal reactivity

## Signal Behavior in SSR

### Server-Side

During `renderToString()`:
- Signals return their current values
- No reactive tracking occurs
- Values are serialized to HTML
- Event handlers are ignored

```tsx
const count = signal(5)
// On server: renders as static HTML with value "5"
```

### Client-Side

During `hydrate()`:
- Signals become reactive
- DOM updates automatically when signals change
- Event handlers are attached
- Effects start running

```tsx
const count = signal(5)
// On client: becomes reactive, updates DOM when changed
```

## Features Demonstrated

### 1. Interactive Counter

A simple counter showing:
- Signal-based state (`signal()`)
- Computed values (`computed()`)
- Event handlers (`onClick`)
- Automatic DOM updates

### 2. Todo List

A more complex example with:
- Array state management
- Form handling
- Conditional rendering
- List rendering with keys
- Multiple computed values

### 3. Hydration

The example demonstrates:
- No flicker or layout shift
- Instant interactivity after hydration
- Preserved server-rendered content
- Seamless transition from static to dynamic

## Benefits of Flexium SSR

1. **Fine-Grained Reactivity**: After hydration, only the specific DOM nodes affected by signal changes are updated - no virtual DOM diffing needed.

2. **Small Bundle Size**: Flexium's runtime is lightweight, meaning less JavaScript to download and parse.

3. **Automatic Signal Extraction**: `renderToString()` automatically extracts signal values without requiring special serialization.

4. **XSS Protection**: HTML content is automatically escaped for security.

5. **Hydration Validation**: In development mode, hydration warns about mismatches between server and client markup.

## Advanced Topics

### Error Handling

The server catches rendering errors and provides useful error messages:

```tsx
try {
  const html = renderToString(<App />)
  res.send(html)
} catch (error) {
  console.error('SSR Error:', error)
  res.status(500).send('Server Error')
}
```

### Streaming SSR

For large applications, consider implementing streaming SSR:
- Render critical content first
- Stream remaining content as it's ready
- Reduce Time to First Byte (TTFB)

(Note: Streaming SSR is not implemented in this example but can be added)

### Data Fetching

For data-dependent components:
1. Fetch data on the server before rendering
2. Pass data as props to components
3. Serialize data in HTML for client hydration
4. Client reuses server-fetched data

Example:
```tsx
// Server
const data = await fetchData()
const html = renderToString(<App data={data} />)

// Client
hydrate(<App data={window.__INITIAL_DATA__} />, container)
```

## Debugging

### Development Mode

In development, hydration warnings will appear in the console if there are mismatches:

```
[Flexium Hydration] Text mismatch: "5" vs "0"
[Flexium Hydration] Expected element, got text node
```

### Production Mode

In production, hydration warnings are disabled for performance. Test thoroughly in development!

## Performance Tips

1. **Minimize Initial Bundle**: Code split large components
2. **Optimize Images**: Use proper formats and sizes
3. **Cache Static Assets**: Set appropriate cache headers
4. **Use CDN**: Serve static files from a CDN
5. **Lazy Load**: Defer non-critical JavaScript

## Common Issues

### Issue: Components not hydrating

**Solution**: Ensure the component structure matches between server and client. Check for:
- Conditional rendering differences
- Random values (use consistent seeds)
- Browser-only APIs called during SSR

### Issue: Event handlers not working

**Solution**: Verify that:
- `hydrate()` is called correctly
- Event handlers are attached to elements
- JavaScript bundle is loaded

### Issue: State mismatch after hydration

**Solution**:
- Use the same initial state on server and client
- Serialize state from server to client
- Avoid random or time-dependent initial values

## Learn More

- [Flexium Documentation](../../README.md)
- [Signal System](../../packages/flexium/src/core/signal.ts)
- [SSR Implementation](../../packages/flexium/src/server/index.ts)
- [Hydration System](../../packages/flexium/src/renderers/dom/hydrate.ts)

## License

MIT
