# Flexium

[![npm version](https://img.shields.io/npm/v/flexium.svg)](https://www.npmjs.com/package/flexium)
[![npm downloads](https://img.shields.io/npm/dm/flexium.svg)](https://www.npmjs.com/package/flexium)
[![license](https://img.shields.io/npm/l/flexium.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

**Simpler, Faster, Unified.**

Flexium is a next-generation UI framework that unifies state management, async data fetching, and global state into a single, powerful API: `state()`.

## Key Features

- **Unified State API** - No more `useState`, `useRecoil`, `useQuery` separation. Just `state()`.
- **Fine-Grained Reactivity** - Updates only what changed. No Virtual DOM overhead.
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

Just add a `key` to share state across components.

```tsx
// Define global state
const [theme, setTheme] = state('light', { key: 'theme' });

function ThemeToggle() {
  const [theme, setTheme] = state(undefined, { key: 'theme' });

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
  const [user, actions] = state(async () => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });

  return () => {
    if (user.loading) return <div>Loading...</div>;
    if (user.error) return <div>Error!</div>;

    return (
      <div>
        <h1>{user().name}</h1>
        <button onclick={() => actions.refetch()}>Reload</button>
      </div>
    );
  };
}
```

### Derived State

```tsx
const [count, setCount] = state(1);
const [double] = state(() => count() * 2);
```

## Package Structure

```
flexium
├── /core       # Core reactivity: state(), effect(), For, Show, Switch
├── /dom        # DOM renderer: render(), Portal
├── /canvas     # Canvas renderer: Canvas, Rect, Circle, Text
├── /primitives # Cross-platform components: Row, Column, Stack
├── /router     # SPA routing: Router, Route, Link
└── /server     # SSR utilities
```

## Control Flow

```tsx
import { For, Show, Switch, Match } from 'flexium/core';

// Conditional rendering
<Show when={isLoggedIn} fallback={<Login />}>
  <Dashboard />
</Show>

// List rendering with keyed reconciliation
<For each={items}>
  {(item) => <Item data={item} />}
</For>

// Pattern matching
<Switch fallback={<Default />}>
  <Match when={status === 'loading'}><Loading /></Match>
  <Match when={status === 'error'}><Error /></Match>
  <Match when={status === 'success'}><Success /></Match>
</Switch>
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
import { Router, Route, Link } from 'flexium/router';

function App() {
  return (
    <Router>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={UserProfile} />
    </Router>
  );
}
```

## Documentation

Full documentation available at [https://flexium.dev](https://flexium.dev)

## License

MIT
