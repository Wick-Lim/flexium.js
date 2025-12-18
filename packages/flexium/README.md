# Flexium

[![npm version](https://img.shields.io/npm/v/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
[![license](https://img.shields.io/npm/l/flexium.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

**Simpler, Faster, Unified.**

Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `use()`.

## Key Features

- **Unified State API** - No more `useRecoil`, `useQuery` separation. Just `use()`.
- **No Virtual DOM** - Direct DOM updates via Proxy-based fine-grained reactivity.
- **Tiny Bundle** - Minimal footprint with tree-shaking support.
- **Cross-Platform** - DOM, Canvas, Server (SSR) renderers included.
- **TypeScript First** - Full type inference out of the box.
- **Zero-Config JSX** - Works with standard tooling.

## Installation

```bash
npm install flexium
```

## Quick Start

```bash
npm create flexium@latest my-app
cd my-app
npm install
npm run dev
```

## The Only API You Need: `use()`

Flexium unifies all state concepts into one function.

### Local State

```tsx
import { use } from 'flexium/core'
import { render } from 'flexium/dom'

function Counter() {
  const [count, setCount] = use(0)

  return (
    <button onclick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}

render(Counter, document.getElementById('app'))
```

### Global State

Just add a `key` to share state across components. Keys can be strings or arrays.

```tsx
// Define global state with array key
const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

function ThemeToggle() {
  // Access same state anywhere with the same key
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })

  return (
    <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  )
}
```

### Async Resources

Pass an async function to handle data fetching automatically.

```tsx
function UserProfile({ id }) {
  const [user, control] = use(async () => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  })

  if (control.loading) return <div>Loading...</div>
  if (control.error) return <div>Error!</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <button onclick={() => control.refetch()}>Reload</button>
    </div>
  )
}
```

### Computed/Derived State

```tsx
const [count, setCount] = use(1)
const [doubled] = use(() => count * 2, [count])
```

## Package Structure

```
flexium
├── /core         # Core reactivity: use(), sync(), Context
├── /dom          # DOM renderer: render(), hydrate(), Portal, Suspense
├── /ref          # Ref system: useRef(), forwardRef()
├── /router       # SPA routing: Routes, Route, Link, Outlet, useRouter(), useLocation()
├── /server       # SSR: renderToString(), renderToStaticMarkup()
├── /canvas       # Canvas 2D: Canvas, DrawRect, DrawCircle, DrawText
└── /interactive  # Game loop: useLoop(), useKeyboard(), useMouse()
```

## Control Flow

Use native JavaScript for control flow - no special components needed:

```tsx
// Conditional rendering
{isLoggedIn ? <Dashboard /> : <Login />}

// Short-circuit for simple conditions
{isAdmin && <AdminPanel />}

// List rendering
{items.map(item => <Item key={item.id} data={item} />)}
```

## Routing

```tsx
import { Routes, Route, Link, useRouter } from 'flexium/router'

function App() {
  return (
    <Routes>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={UserProfile} />
    </Routes>
  )
}

function UserProfile({ params }) {
  return <h1>User: {params.id}</h1>
}

// Or use the router hook
function UserProfileHook() {
  const r = useRouter()
  return <h1>User: {r.params.id}</h1>
}
```

## Canvas Rendering

```tsx
import { Canvas, DrawRect, DrawCircle, DrawText } from 'flexium/canvas'
import { use } from 'flexium/core'

function App() {
  const [x, setX] = use(100)

  return (
    <Canvas width={400} height={300}>
      <DrawRect x={0} y={0} width={400} height={300} fill="#1a1a2e" />
      <DrawCircle x={x} y={150} radius={30} fill="#e94560" />
      <DrawText x={200} y={50} text="Hello Canvas!" fill="white" />
    </Canvas>
  )
}
```

## Game Development

```tsx
import { use } from 'flexium/core'
import { Canvas, DrawRect } from 'flexium/canvas'
import { useLoop, useKeyboard, Keys } from 'flexium/interactive'

function Game() {
  const [x, setX] = use(100)
  const kb = useKeyboard()

  const gameLoop = useLoop({
    fixedFps: 60,
    onUpdate: (delta) => {
      if (kb.isPressed(Keys.ArrowRight)) setX(x => x + 200 * delta)
      if (kb.isPressed(Keys.ArrowLeft)) setX(x => x - 200 * delta)
    }
  })

  use(({ onCleanup }) => {
    gameLoop.start()
    onCleanup(() => gameLoop.stop())
  }, [])

  return (
    <Canvas width={800} height={600}>
      <DrawRect x={x} y={300} width={50} height={50} fill="red" />
    </Canvas>
  )
}
```

## Server-Side Rendering

```tsx
import { renderToString } from 'flexium/server'
import { hydrate } from 'flexium/dom'

// Server
const { html, state } = renderToString(App, { hydrate: true })

// Client
hydrate(App, document.getElementById('root'), { state })
```

## Built-in Components

### Portal

```tsx
import { Portal } from 'flexium/dom'

<Portal target={document.body}>
  <Modal />
</Portal>
```

### Suspense

```tsx
import { Suspense, lazy } from 'flexium/dom'

const LazyComponent = lazy(() => import('./Heavy'))

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### ErrorBoundary

```tsx
import { ErrorBoundary } from 'flexium/dom'

<ErrorBoundary fallback={(error) => <Error message={error.message} />}>
  <App />
</ErrorBoundary>
```

## Context API

```tsx
import { use, Context } from 'flexium/core'

// Create context with default value
const ThemeCtx = new Context<'light' | 'dark'>('light')

function App() {
  const [theme, setTheme] = use<'light' | 'dark'>('light')

  return (
    <ThemeCtx.Provider value={theme}>
      <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <Child />
    </ThemeCtx.Provider>
  )
}

function Child() {
  const [theme] = use(ThemeCtx)
  return <div class={theme}>Current theme: {theme}</div>
}
```

## Documentation

Full documentation available at [https://flexium.junhyuk.im](https://flexium.junhyuk.im)

## License

MIT
