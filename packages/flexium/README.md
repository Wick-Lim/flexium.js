# Flexium

[![npm version](https://img.shields.io/npm/v/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
[![license](https://img.shields.io/npm/l/flexium.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

**Simpler, Faster, Unified.**

Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `state()`.

## Key Features

- **Unified State API** - No more `useState`, `useRecoil`, `useQuery` separation. Just `state()`.
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

## The Only API You Need: `state()`

Flexium unifies all state concepts into one function.

### Local State

```tsx
import { state } from 'flexium/core'
import { render } from 'flexium/dom'

function Counter() {
  const [count, setCount] = state(0)

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
const [theme, setTheme] = state('light', { key: ['app', 'theme'] })

function ThemeToggle() {
  // Access same state anywhere with the same key
  const [theme, setTheme] = state('light', { key: ['app', 'theme'] })

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
  const [user, control] = state(async () => {
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
const [count, setCount] = state(1)
const [doubled] = state(() => count * 2, { deps: [count] })
```

## Package Structure

```
flexium
├── /core         # Core reactivity: state(), effect(), sync(), context()
├── /dom          # DOM renderer: render(), hydrate(), Portal, Suspense
├── /ref          # Ref system: ref(), forwardRef()
├── /router       # SPA routing: Routes, Route, Link, Outlet
├── /server       # SSR: renderToString(), renderToStaticMarkup()
├── /canvas       # Canvas 2D: Canvas, DrawRect, DrawCircle, DrawText
└── /interactive  # Game loop: loop(), keyboard(), mouse()
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
import { Routes, Route, Link, router } from 'flexium/router'

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
  const r = router()
  return <h1>User: {r.params.id}</h1>
}
```

## Canvas Rendering

```tsx
import { Canvas, DrawRect, DrawCircle, DrawText } from 'flexium/canvas'

function App() {
  const [x, setX] = state(100)

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
import { state, effect } from 'flexium/core'
import { Canvas, DrawRect } from 'flexium/canvas'
import { loop, keyboard, Keys } from 'flexium/interactive'

function Game() {
  const [x, setX] = state(100)
  const kb = keyboard()

  const gameLoop = loop({
    fixedFps: 60,
    onUpdate: (delta) => {
      if (kb.isPressed(Keys.ArrowRight)) setX(x => x + 200 * delta)
      if (kb.isPressed(Keys.ArrowLeft)) setX(x => x - 200 * delta)
    }
  })

  effect(() => {
    gameLoop.start()
    return () => gameLoop.stop()
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
import { createContext, context } from 'flexium/core'

const ThemeCtx = createContext('light')

function App() {
  return (
    <ThemeCtx.Provider value="dark">
      <Child />
    </ThemeCtx.Provider>
  )
}

function Child() {
  const theme = context(ThemeCtx)
  return <div>Theme: {theme}</div>
}
```

## Documentation

Full documentation available at [https://flexium.junhyuk.im](https://flexium.junhyuk.im)

## License

MIT
