# SSR Architecture Deep Dive

This document explains the technical architecture of Server-Side Rendering in Flexium.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SSR Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CLIENT REQUEST                                                  │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Express Server (server.ts)                               │   │
│  │  ↓                                                        │   │
│  │  1. Load entry-server.tsx                                │   │
│  │  2. Call render() function                               │   │
│  │     ↓                                                     │   │
│  │     renderToString(<App />)                              │   │
│  │     ↓                                                     │   │
│  │     <div class="app">...</div>                           │   │
│  │  3. Inject HTML into index.html template                 │   │
│  │  4. Send complete HTML to browser                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Browser                                                   │   │
│  │  ↓                                                        │   │
│  │  1. Parse and display HTML (content visible!)            │   │
│  │  2. Download main.tsx bundle                             │   │
│  │  3. Execute hydrate(<App />, container)                  │   │
│  │     ↓                                                     │   │
│  │     Walk DOM tree                                        │   │
│  │     Attach event handlers                                │   │
│  │     Setup signal reactivity                              │   │
│  │  4. Application is now interactive!                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. renderToString() - Server-Side Rendering

**Location**: `packages/flexium/src/server/index.ts`

**Purpose**: Converts virtual nodes to HTML strings on the server.

**How it works**:

```typescript
function renderToString(vnode: any): string {
  // 1. Handle primitives (null, undefined, boolean)
  if (vnode === null || vnode === undefined || vnode === false) {
    return ''
  }

  // 2. Handle text and numbers
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return escapeHtml(String(vnode))
  }

  // 3. Extract signal values (without tracking)
  if (isSignal(vnode)) {
    return renderToString(vnode.value)
  }

  // 4. Execute function components
  if (typeof vnode.type === 'function') {
    const result = vnode.type(vnode.props || {})
    return renderToString(result)
  }

  // 5. Render HTML elements
  if (typeof vnode.type === 'string') {
    let html = `<${vnode.type}`

    // Add attributes
    for (const key in props) {
      // Skip event handlers, children, etc.
      if (key === 'children' || key.startsWith('on')) continue
      html += ` ${key}="${escapeHtml(value)}"`
    }

    // Add children
    html += '>'
    html += renderChildren(vnode.children)
    html += `</${vnode.type}>`

    return html
  }
}
```

**Key Features**:
- **XSS Protection**: All content is escaped via `escapeHtml()`
- **Signal Value Extraction**: Reads `.value` from signals without tracking
- **No Side Effects**: Pure function, no state changes
- **Recursive**: Handles deeply nested components
- **Framework Agnostic**: Returns plain HTML strings

### 2. hydrate() - Client-Side Hydration

**Location**: `packages/flexium/src/renderers/dom/hydrate.ts`

**Purpose**: Attaches interactivity to server-rendered HTML.

**How it works**:

```typescript
function hydrate(vnode: any, container: Element) {
  // Walk the DOM tree alongside the virtual tree
  hydrateNode(vnode, container.firstChild, {
    handleMismatch,
    recoverMismatch
  })
}

function hydrateNode(vnode: any, domNode: Node | null, ctx: HydrateContext) {
  // 1. Handle text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    // Validate text content matches
    if (domNode.textContent !== String(vnode)) {
      console.warn('Mismatch detected')
    }
    return domNode.nextSibling
  }

  // 2. Handle signals - create reactive binding
  if (isSignal(vnode)) {
    effect(() => {
      domNode.textContent = String(vnode.value)
    })
    return domNode.nextSibling
  }

  // 3. Handle elements
  if (typeof vnode.type === 'string') {
    // Validate tag name
    if (domNode.tagName.toLowerCase() !== vnode.type) {
      console.warn('Tag mismatch')
    }

    // Hydrate props (attach events, setup reactive bindings)
    hydrateProps(element, vnode.props)

    // Recursively hydrate children
    let childDom = element.firstChild
    for (const child of vnode.children) {
      childDom = hydrateNode(child, childDom, ctx)
    }

    return element.nextSibling
  }
}

function hydrateProps(element: Element, props: Record<string, any>) {
  for (const key in props) {
    const value = props[key]

    // Attach event handlers
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase()
      element.addEventListener(eventName, value)
      continue
    }

    // Setup reactive props (signals)
    if (isSignal(value)) {
      effect(() => {
        element[key] = value.value
      })
      continue
    }

    // Validate static props (dev mode)
    // ...
  }
}
```

**Key Features**:
- **Zero Re-rendering**: Uses existing DOM, doesn't create new elements
- **Event Attachment**: Adds click, input, and other event handlers
- **Signal Binding**: Creates effects for reactive updates
- **Mismatch Detection**: Warns about differences (dev mode)
- **Ref Callbacks**: Calls ref functions with DOM elements

### 3. Signal System Integration

**Signals on the Server**:
```typescript
const count = signal(5)

// During renderToString():
// - count.value returns 5
// - No tracking happens
// - No effects run
// - Result: <div>5</div>
```

**Signals on the Client**:
```typescript
const count = signal(5)

// During hydrate():
// - Effect is created: effect(() => domNode.textContent = count.value)
// - Updates DOM when count changes
// - count.value++ triggers re-render of only that text node

// Later, when user clicks button:
count.value++ // Only updates the specific DOM node, no VDOM diff!
```

## File Responsibilities

### server.ts - HTTP Server

**Responsibilities**:
- Accept HTTP requests
- Serve static files (CSS, JS, images)
- Load and execute SSR code
- Inject rendered HTML into template
- Handle errors

**Development vs Production**:

Development:
- Uses Vite middleware for HMR
- Transforms code on-the-fly
- Better error messages
- Source maps

Production:
- Serves pre-built bundles
- No Vite overhead
- Optimized and minified
- Faster response times

### src/entry-server.tsx - Server Entry

**Responsibilities**:
- Export `render()` function
- Call `renderToString()`
- Can fetch data before rendering
- Can pass server-side data to components

**Example with Data Fetching**:
```typescript
export async function render(url: string) {
  // Fetch data on server
  const data = await fetchUserData(url)

  // Render with data
  const html = renderToString(<App data={data} />)

  // Return both HTML and data for serialization
  return { html, data }
}
```

### src/main.tsx - Client Entry

**Responsibilities**:
- Import and call `hydrate()`
- Attach to DOM element
- Initialize client-side code
- Can deserialize server data

**Example with Data Hydration**:
```typescript
// Server serialized data in HTML:
// <script>window.__DATA__ = {...}</script>

// Client reuses it:
const initialData = window.__DATA__
hydrate(<App data={initialData} />, container)
```

### src/App.tsx - Application Code

**Responsibilities**:
- Define components
- Manage state with signals
- Handle user interactions
- **Must be isomorphic** (run on both server and client)

**Isomorphic Code Guidelines**:

✅ **Do**:
- Use signals for state
- Use props for data
- Use event handlers for interactions
- Use conditional rendering
- Use `typeof window !== 'undefined'` checks

❌ **Don't**:
- Use `window` or `document` globally
- Use browser-only APIs without checks
- Use different logic on server vs client
- Use random values or timestamps without seeds

## Performance Optimizations

### 1. Selective Hydration

Hydrate only interactive parts:

```tsx
function StaticContent() {
  return <div>This is static, no hydration needed</div>
}

function InteractiveButton() {
  const [count, setCount] = signal(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### 2. Lazy Hydration

Defer hydration until element is visible:

```tsx
function LazyComponent() {
  const [hydrated, setHydrated] = signal(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHydrated(true)
      }
    })
    observer.observe(element)
  }, [])

  return hydrated.value ? <InteractiveComponent /> : <StaticComponent />
}
```

### 3. Code Splitting

Split large components:

```tsx
// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyChart />
    </Suspense>
  )
}
```

## Security Considerations

### XSS Prevention

**renderToString()** escapes all content:

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

**Result**:
```tsx
// Input:
<div>{userInput}</div>

// If userInput = '<script>alert("xss")</script>'
// Output:
<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>
```

### Safe Data Serialization

When serializing data for client:

```typescript
// ❌ Unsafe (XSS vulnerability):
const html = `<script>window.__DATA__ = ${JSON.stringify(data)}</script>`

// ✅ Safe:
const html = `<script>window.__DATA__ = ${JSON.stringify(data)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')}</script>`
```

## Debugging Tips

### Enable Hydration Warnings

In development, mismatches are logged:

```typescript
// packages/flexium/src/renderers/dom/hydrate.ts
if (__DEV__) {
  console.warn('[Flexium Hydration]', message)
}
```

### Inspect Hydration Process

Add logging to hydrate:

```typescript
hydrate(<App />, container, {
  onMismatch: (message, domNode, vnode) => {
    console.error('Hydration mismatch:', {
      message,
      domNode,
      vnode
    })
  }
})
```

### Compare Server vs Client Output

```bash
# Server output
curl http://localhost:3000 > server.html

# Compare with client-rendered
# Use browser DevTools to copy rendered HTML
diff server.html client.html
```

## Future Enhancements

### Streaming SSR

Render and stream HTML as it's generated:

```typescript
async function* renderToStream(vnode) {
  // Yield chunks as they're ready
  yield '<div class="app">'
  yield await renderHeader()
  yield await renderBody()
  yield '</div>'
}
```

### Progressive Hydration

Hydrate critical content first, defer rest:

```typescript
// Hydrate above-the-fold first
hydrate(<AboveTheFold />, container, { priority: 'high' })

// Hydrate below-the-fold later
requestIdleCallback(() => {
  hydrate(<BelowTheFold />, container, { priority: 'low' })
})
```

### Resumability

Serialize reactive graph from server:

```typescript
// Server: serialize signal state
const state = serializeSignals(app)

// Client: resume from serialized state
resumeFromState(state)
```

## Learn More

- [Flexium Source](../../packages/flexium/src)
- [SSR Tests](../../packages/flexium/src/server/__tests__)
- [Hydration Tests](../../packages/flexium/src/renderers/dom/__tests__/hydrate.test.ts)
