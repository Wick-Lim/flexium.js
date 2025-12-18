# Flexium Architecture

Flexium is built on a **Proxy-based Fine-grained Reactivity** system that provides direct DOM updates without Virtual DOM overhead.

## System Overview

```
+------------------------------------------------------------------+
|                      Application Layer                            |
|                  (Your Components & JSX)                          |
+--------------------------------+---------------------------------+
                                 |
+--------------------------------v---------------------------------+
|                         Renderers                                 |
|  +----------+  +----------+  +----------+  +----------------+    |
|  |   DOM    |  |  Server  |  |  Canvas  |  |  Interactive   |    |
|  | render() |  | toString |  | Canvas() |  | useLoop/input  |    |
|  +----------+  +----------+  +----------+  +----------------+    |
+--------------------------------+---------------------------------+
                                 |
+--------------------------------v---------------------------------+
|                      Core Reactive System                         |
|  +------------------+  +------------------+  +----------------+   |
|  |    reactive()    |  |      use()       |  |    sync()      |   |
|  |  Proxy tracking  |  | Unified hook API |  |    Batching    |   |
|  +------------------+  +------------------+  +----------------+   |
|                                                                   |
|  +------------------+  +------------------+  +----------------+   |
|  |     hook()       |  |    useRef()      |  | new Context()  |   |
|  | Component state  |  |   Mutable ref    |  | Context class  |   |
|  +------------------+  +------------------+  +----------------+   |
+------------------------------------------------------------------+
```

## Module Structure

```
packages/flexium/src/
├── index.ts              # VERSION export
├── jsx-runtime.ts        # JSX transform (jsx, jsxs, Fragment)
├── jsx-dev-runtime.ts    # Development JSX (jsxDEV)
│
├── core/                 # Reactive Core
│   ├── index.ts          # Public exports
│   ├── types.ts          # Type definitions
│   ├── reactive.ts       # Proxy-based reactivity
│   ├── use.ts            # use() - Unified hook API
│   ├── lifecycle.ts      # sync(), effect internals
│   ├── hook.ts           # hook() - Component instance hooks
│   ├── context.ts        # Context implementation
│   └── devtools.ts       # DevTools integration
│
├── ref/                  # Ref System
│   ├── index.ts
│   ├── types.ts
│   └── ref.ts            # useRef()
│
├── context.ts            # Context class
│
├── dom/                  # DOM Renderer
│   ├── index.ts
│   ├── types.ts          # FNode types
│   ├── f.ts              # FNode factory
│   ├── render.ts         # DOM rendering & reconciliation
│   ├── hydrate.ts        # SSR hydration
│   └── components/       # Built-in components
│       ├── Portal.tsx
│       ├── Suspense.tsx
│       ├── ErrorBoundary.tsx
│       └── lazy.ts
│
├── router/               # Client-side Router
│   ├── index.ts
│   ├── types.ts
│   ├── router.ts         # useRouter(), useLocation(), useNavigate(), etc.
│   ├── utils.ts          # Route matching
│   └── dom/              # Router components
│       ├── Routes.tsx
│       ├── Route.tsx
│       ├── Link.tsx
│       └── Outlet.tsx
│
├── server/               # Server-side Rendering
│   ├── index.ts
│   ├── types.ts
│   ├── renderToString.ts # SSR renderer
│   ├── serverState.ts    # Server state management
│   └── escape.ts         # HTML escaping
│
├── canvas/               # Canvas 2D Renderer
│   ├── index.ts
│   ├── types.ts
│   ├── Canvas.tsx        # Canvas component
│   └── dom/              # Draw components
│       ├── DrawRect.tsx
│       ├── DrawCircle.tsx
│       ├── DrawArc.tsx
│       ├── DrawLine.tsx
│       ├── DrawText.tsx
│       └── DrawPath.tsx
│
└── interactive/          # Game Loop & Input
    ├── index.ts
    ├── types.ts
    ├── loop.ts           # useLoop() - Game loop
    ├── keyboard.ts       # useKeyboard() - Keyboard input
    └── mouse.ts          # useMouse() - Mouse input
```

---

## 1. Core Reactive System

### 1.1 Proxy-based Reactivity (`reactive.ts`)

The foundation of Flexium's reactivity is a Proxy-based dependency tracking system.

#### Data Structure

```
targetMap (WeakMap)
  └─ target (object)
       └─ KeyToDepMap (Map)
            └─ key (property) → Dep (Set<ReactiveEffect>)
```

#### Core Functions

```typescript
// Create a reactive proxy
function reactive<T extends object>(target: T): T

// Track dependency (called in getter)
function track(target: object, key: unknown): void

// Trigger updates (called in setter)
function trigger(target: object, key: unknown): void

// Check if value is reactive
function isReactive(value: unknown): boolean
```

#### How It Works

1. **Proxy Creation**: `reactive()` wraps an object with a Proxy
2. **Getter Trap**: When a property is accessed, `track()` registers the current `activeEffect`
3. **Setter Trap**: When a property is set, `trigger()` notifies all registered effects
4. **Deep Reactivity**: Nested objects are automatically wrapped when accessed

```typescript
const obj = reactive({ count: 0, nested: { value: 1 } })

// Reading triggers tracking
console.log(obj.count)  // track(obj, 'count')

// Writing triggers updates
obj.count = 1  // trigger(obj, 'count')

// Nested objects are also reactive
obj.nested.value = 2  // trigger(nested, 'value')
```

#### Symbol Marker

```typescript
export const REACTIVE_SIGNAL = Symbol('flexium.reactive')
// Used to identify already-proxied objects
```

### 1.2 Unified Hook API (`use.ts`)

The `use()` function provides multiple patterns through a single API:

| Pattern | Input | Return | Use Case |
|---------|-------|--------|----------|
| **Signal** | `value` | `[value, setter]` | Local/Global state |
| **Resource** | `async () => Promise` | `[value, ResourceControl]` | Async data |
| **Computed** | `() => T, deps[]` | `[value, ResourceControl]` | Derived values |
| **Effect** | `({ onCleanup }) => void, deps[]` | `void` | Side effects |
| **Context** | `Context` | `[value, undefined]` | Context consumption |

#### Signal Mode

```typescript
const [count, setCount] = use(0)

// Setter supports direct value or updater function
setCount(5)
setCount(prev => prev + 1)
```

#### Resource Mode (Async)

```typescript
const [user, control] = use(async () => fetch('/api/user').then(r => r.json()))

// ResourceControl interface
interface ResourceControl {
  refetch: () => Promise<void>
  readonly loading: boolean
  readonly error: unknown
  readonly status: 'idle' | 'loading' | 'success' | 'error'
}
```

#### Computed Mode (with deps)

```typescript
const [doubled] = use(() => count * 2, [count])
// Re-computes only when deps change
```

#### Effect Mode (with onCleanup)

```typescript
use(({ onCleanup }) => {
  const id = setInterval(() => console.log('tick'), 1000)
  onCleanup(() => clearInterval(id))
}, [])
```

#### Context Mode

```typescript
const [theme] = use(ThemeContext)  // Returns [value, undefined] tuple
```

#### Global Registry

States with `key` option are stored in a global registry:

```typescript
// Component A
const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

// Component B (anywhere)
const [theme] = use('light', { key: ['app', 'theme'] })  // Same state!
```

### 1.3 Effect System (`lifecycle.ts`)

#### ReactiveEffectLike Class

```typescript
class ReactiveEffectLike {
  deps: Set<any>[] = []    // Dependencies this effect depends on
  active = true            // Whether effect is active
  fn: () => void           // Effect function
  scheduler?: () => void   // Custom scheduler

  run()      // Execute effect with tracking
  stop()     // Deactivate effect
  cleanup()  // Remove from all dependencies
}
```

#### Scheduling System

```
State Change
    │
    ▼
trigger() → queueJob(effect) → queue (Set)
                                   │
                                   ▼ (microtask)
                               flush() → Run all queued effects
```

- **Auto-batching**: Multiple state changes in same tick are batched
- **Deduplication**: Same effect queued multiple times runs once
- **Microtask**: Effects run after current synchronous code

#### Public APIs

```typescript
// Manual batching / flush
function sync(fn?: () => void): void
```

### 1.4 Hook System (`hook.ts`)

Component-scoped state management using a hook index pattern.

#### Component Instance

```typescript
interface ComponentInstance {
  hooks: any[]       // Stored hook values
  hookIndex: number  // Current hook index (reset each render)
}
```

#### hook() Function

```typescript
function hook<T>(factory: () => T): T {
  if (!currentComponent) return factory()  // Outside component

  const { hooks, hookIndex } = currentComponent

  if (hookIndex < hooks.length) {
    // Return existing value
    return hooks[hookIndex++]
  }

  // Create and store new value
  const value = factory()
  hooks.push(value)
  return value
}
```

### 1.5 Ref System (`ref/ref.ts`)

```typescript
// Create a mutable ref
const inputRef = useRef<HTMLInputElement>(null)

// Access current value
inputRef.current?.focus()

// Attach to DOM element
<input ref={inputRef} />
```

Refs are passed via props - no special forwarding mechanism needed.

---

## 2. Context API

### 2.1 Context API

```typescript
import { Context, use } from 'flexium/core'

// Create context with default value
const ThemeCtx = new Context('light')

// Provider component
<ThemeCtx.Provider value="dark">
  <App />
</ThemeCtx.Provider>

// Consume context via use()
const [theme] = use(ThemeCtx)  // Returns [value, undefined] tuple
```

#### Internal Implementation

- `contextMap: Map<symbol, value>` - Global context storage
- `pushContext()` / `popContext()` - Stack management during render
- `snapshotContext()` / `runWithContext()` - Context capture for async

---

## 3. DOM Renderer (`dom/`)

### 3.1 FNode (Virtual Node)

```typescript
interface FNode {
  type: string | Function   // Tag name or component
  props: Record<string, any>
  children: FNodeChild[]
  key?: any
}

type FNodeChild =
  | FNode
  | string | number | boolean
  | null | undefined
  | FNodeChild[]
  | (() => FNode)
```

### 3.2 Rendering Flow

```
render(app, container)
         │
         ▼
    renderNode(fnode, parent)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 string    function
   type      type
    │         │
    ▼         ▼
createElement  renderComponent()
    │              │
    ▼              ▼
appendChild   ComponentInstance
              + unsafeEffect()
              for reactive updates
```

### 3.3 Component Instance (DOM)

```typescript
interface DOMComponentInstance extends ComponentInstance {
  nodes: Node[]                      // Rendered DOM nodes
  parent: HTMLElement                // Parent container
  fnode: FNode                       // Current FNode
  props: any                         // Merged props
  key?: any                          // For reconciliation
  renderFn?: () => void              // Re-render trigger
  children: Set<DOMComponentInstance>
  parentInstance?: DOMComponentInstance
}
```

### 3.4 Reconciliation

DOM updates use a simple reconciliation strategy:

1. **Text Nodes**: Direct `nodeValue` update
2. **Element Nodes**:
   - Update attributes (diff old vs new)
   - Update event handlers
   - Recursively reconcile children
3. **Different Types**: Replace entire node

### 3.5 Built-in Components

| Component | Purpose |
|-----------|---------|
| `Portal` | Render children into different DOM node |
| `Suspense` | Show fallback while async children load |
| `ErrorBoundary` | Catch and handle errors in children |
| `lazy()` | Code splitting with dynamic import |

---

## 4. Router (`router/`)

### 4.1 Router Hooks

```typescript
// Get current location and navigate function
const [location, navigate] = useLocation()

// Get full router context
const router = useRouter()

// Shorthand for navigation
const navigate = useNavigate()

// Get route params
const params = useParams<{ id: string }>()

// Get query string params
const query = useQuery<{ page: string }>()
```

### 4.2 Location State

```typescript
interface Location {
  pathname: string
  search: string
  hash: string
  query: Record<string, string>
}
```

### 4.3 Route Matching

```typescript
interface RouteMatch {
  route: RouteDefinition
  params: Record<string, string>  // :id → { id: '123' }
  pathname: string
}

// Simple segment matching with param extraction
// /user/:id matches /user/123 → params: { id: '123' }
```

### 4.4 Components

```tsx
<Routes>
  <Route path="/" component={Home} />
  <Route path="/user/:id" component={User}>
    <Route path="/posts" component={UserPosts} />  {/* Nested */}
  </Route>
</Routes>

<Link to="/user/123">User</Link>

// In nested routes
<Outlet />  {/* Renders child route */}
```

### 4.5 Security

- Path length limit (2048 chars)
- Prototype pollution prevention (`__proto__`, `constructor`)
- XSS prevention (`javascript:` protocol blocked)

---

## 5. Server Renderer (`server/`)

### 5.1 renderToString()

```typescript
const { html, state } = renderToString(App, {
  hydrate: true  // Include data-fid markers
})

// Result
interface SSRResult {
  html: string           // Rendered HTML
  state: SerializedState // State for hydration
}
```

### 5.2 Rendering Rules

- HTML entities escaped (`<`, `>`, `&`, `"`, `'`)
- Self-closing tags for void elements (`<br>`, `<img>`, etc.)
- Boolean attributes rendered without value (`disabled`, `checked`)
- Style objects converted to CSS strings
- Event handlers and refs skipped (client-only)

### 5.3 Hydration

```typescript
hydrate(App, container, {
  state: serializedState,  // From server
  onHydrated: () => {},    // Success callback
  onMismatch: (error) => {} // Fallback to full render
})
```

---

## 6. Canvas Renderer (`canvas/`)

### 6.1 Architecture

```
<Canvas>
  <DrawRect />   →  queueDraw({ type: 'rect', props })
  <DrawCircle /> →  queueDraw({ type: 'circle', props })
</Canvas>
        │
        ▼
Canvas use() →
  1. clearRect()
  2. Process drawQueue
  3. Execute drawNode() for each
```

### 6.2 Draw Components

| Component | Canvas API |
|-----------|------------|
| `DrawRect` | `fillRect()`, `strokeRect()` |
| `DrawCircle` | `arc()` with full circle |
| `DrawArc` | `arc()` with angles |
| `DrawLine` | `moveTo()`, `lineTo()` |
| `DrawText` | `fillText()` |
| `DrawPath` | `Path2D` from SVG path |

### 6.3 Reactive Props

All Draw component props support getter functions for reactivity:

```tsx
const [x, setX] = use(100)

// x updates automatically when state changes
<DrawRect x={x} y={100} width={50} height={50} fill="red" />
```

---

## 7. Interactive Module (`interactive/`)

### 7.1 Game Loop

```typescript
const gameLoop = useLoop({
  fixedFps: 60,  // Physics update rate

  onUpdate(delta) {
    // Variable timestep (render rate)
    // delta = seconds since last frame
  },

  onFixedUpdate(fixedDelta) {
    // Fixed timestep (physics)
    // fixedDelta = 1/60 seconds
  },

  onRender(alpha) {
    // Interpolation factor for smooth rendering
    // alpha = accumulated time / fixedDelta
  }
})

gameLoop.start()
gameLoop.stop()
gameLoop.isRunning()
gameLoop.getFps()
```

**Features**:
- Fixed + variable timestep hybrid
- Accumulator pattern for physics stability
- Max delta cap (0.25s) prevents "spiral of death"

### 7.2 Keyboard Input

```typescript
const kb = useKeyboard()

// Polling API
kb.isPressed(Keys.Space)      // Currently held
kb.isJustPressed(Keys.KeyW)   // Pressed this frame
kb.isJustReleased(Keys.KeyA)  // Released this frame
kb.getPressedKeys()           // All pressed keys

// Frame cleanup (call at end of game loop)
kb.clearFrameState()

// Cleanup
kb.dispose()
```

### 7.3 Mouse Input

```typescript
const m = useMouse({ canvas: canvasElement })

// Position
m.x, m.y           // Current position
m.deltaX, m.deltaY // Movement since last frame
m.wheelDelta       // Scroll amount

// Buttons
m.isPressed(MouseButton.Left)
m.isLeftPressed()
m.isRightPressed()
m.isMiddlePressed()

// Cleanup
m.clearFrameState()
m.dispose()
```

---

## 8. JSX Runtime

### Production (`jsx-runtime.ts`)

```typescript
function jsx(type, props, key?): FNode {
  const { children, ...otherProps } = props
  return {
    type,
    props: otherProps,
    children: Array.isArray(children) ? children : (children != null ? [children] : []),
    key
  }
}

function jsxs(type, props, key?): FNode  // Same as jsx
function Fragment(props): FNodeChild     // Returns children directly
```

### Development (`jsx-dev-runtime.ts`)

```typescript
function jsxDEV(type, props, key, isStaticChildren, source, self) {
  return jsx(type, props, key)  // Additional params ignored
}
```

---

## 9. DevTools Integration

```typescript
// Browser extension hook
window.__FLEXIUM_DEVTOOLS__ = {
  signals: Map<number, SignalInfo>,
  onSignalCreate: (info) => {},
  onSignalUpdate: (id, value) => {},
  onRender: (event) => {}
}

// Internal tracking
registerSignal(container, name?)  // On signal creation
updateSignal(container, value)    // On signal update
reportRender(componentName, trigger, duration)
```

---

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| State read | O(1) | Proxy property access |
| State write | O(subscribers) | Triggers dependent effects |
| Effect tracking | O(1) | Set.add() |
| Effect cleanup | O(deps) | Remove from all dep sets |
| DOM reconciliation | O(children) | Per-level, not tree-wide |

## Memory Model

- **Proxy Caching**: `reactiveMap` (WeakMap) prevents duplicate proxies
- **Effect Cleanup**: Automatic when component unmounts
- **Context Scope**: Stack-based, restored after render
- **Global Registry**: Persistent for keyed states

## Key Design Decisions

### Why Proxy over Signals?

- No `.value` access needed
- Works transparently in JSX
- Deep reactivity automatic
- Familiar object syntax

### Why Hook Index Pattern?

- Simple implementation
- No explicit dependencies
- Works with function components
- Predictable behavior

### Why Separate Renderers?

- Same reactive core, different outputs
- No DOM code in Canvas renderer
- Tree-shaking friendly
- Platform-specific optimizations

### Why Microtask Batching?

- Natural batching for event handlers
- No explicit batch() calls needed
- Synchronous when needed via sync()
