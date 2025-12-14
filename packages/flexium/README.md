# Flexium

[![npm version](https://img.shields.io/npm/v/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
[![license](https://img.shields.io/npm/l/flexium.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

**Simpler, Faster, Unified.**

Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `state()`.

## Key Features

- **Unified State API** - No more `useState`, `useRecoil`, `useQuery` separation. Just `state()`.
- **No Virtual DOM** - Direct DOM updates for maximum performance and minimal memory usage.
- **Tiny Bundle** - ~8KB (min+gzip) including Router and Motion.
- **Cross-Platform** - DOM, Canvas, and SSR renderers included.
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
import { state } from 'flexium/core';
import { render } from 'flexium/dom';

function Counter() {
  const [count, setCount] = state(0);

  return (
    <button onclick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}

render(<Counter />, document.getElementById('app'));
```

### Global State

Just add a `key` to share state across components. Keys can be strings or arrays.

```tsx
// Define global state with array key
const [theme, setTheme] = state('light', { key: ['app', 'theme'] });

function ThemeToggle() {
  const [theme, setTheme] = state(undefined, { key: ['app', 'theme'] });

  return (
    <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  );
}
```

### Async Resources

Pass an async function to handle data fetching automatically.

```tsx
function UserProfile({ id }) {
  const [user, refetch, isLoading, error] = state(async () => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <button onclick={() => refetch()}>Reload</button>
    </div>
  );
}
```

### Derived State

```tsx
const [count, setCount] = state(1);
const [double] = state(() => count * 2);
```

### Array Keys & Params

```tsx
// Array keys for dynamic caching (like TanStack Query)
const [user] = state(fetchUser, { key: ['user', userId] });

// Explicit params for better DX
const [data] = state(
  async ({ userId, postId }) => fetchPost(userId, postId),
  {
    key: ['posts', userId, postId],
    params: { userId, postId }
  }
);
```

## Package Structure

```
flexium
├── /core       # Core reactivity: state(), effect(), batch()
├── /dom        # DOM renderer: render(), Portal
├── /canvas     # Canvas renderer: Canvas, Rect, Circle, Text
├── /primitives # Cross-platform components: Row, Column, Stack
├── /router     # SPA routing: Router, Route, Link
└── /server     # SSR utilities
```

## Control Flow

Use native JavaScript for control flow - no special components needed:

```tsx
// Conditional rendering
{isLoggedIn() ? <Dashboard /> : <Login />}

// Short-circuit for simple conditions
{isAdmin() && <AdminPanel />}

// List rendering with optimized reconciliation
{items.map(item => <Item key={item.id} data={item} />)}

// Pattern matching with ternary chains
{status() === 'loading' ? <Loading /> :
 status() === 'error' ? <Error /> :
 status() === 'success' ? <Success /> :
 <Default />}
```

## Canvas Rendering

```tsx
import { Canvas, Rect, Circle, Text } from 'flexium/canvas';

function App() {
  const [x, setX] = state(100);

  return (
    <Canvas width={400} height={300}>
      <Rect x={0} y={0} width={400} height={300} fill="#1a1a2e" />
      <Circle x={x} y={150} radius={30} fill="#e94560" />
      <Text x={200} y={50} text="Hello Canvas!" fill="white" />
    </Canvas>
  );
}
```

## Cross-Platform Primitives

```tsx
import { Row, Column, Text, Pressable } from 'flexium/primitives';

function App() {
  return (
    <Column gap={16} padding={20}>
      <Text size="xl" weight="bold">Welcome</Text>
      <Row gap={8}>
        <Pressable onPress={() => console.log('clicked')}>
          <Text>Click me</Text>
        </Pressable>
      </Row>
    </Column>
  );
}
```

## Routing

```tsx
import { Routes, Route, Link } from 'flexium/router';

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
  );
}

function UserProfile({ params }) {
  // Params are passed as props to the component
  return <h1>User: {params.id}</h1>;
}

// Or use the router hook
import { router } from 'flexium/router';

function UserProfileHook() {
  const r = router();
  // Access params directly from router context
  return <h1>User: {r.params.id}</h1>;
}
```

## Documentation

Full documentation available at [https://flexium.junhyuk.im](https://flexium.junhyuk.im)

## License

MIT
