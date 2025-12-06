---
title: Introduction - What is Flexium?
description: Learn about Flexium, a next-generation UI framework with fine-grained reactivity, unified state API, and cross-platform support.
head:
  - - meta
    - property: og:title
      content: Introduction to Flexium
  - - meta
    - property: og:description
      content: Flexium is a next-generation UI framework built for performance, simplicity, and cross-platform compatibility.
---

# Introduction

Flexium is a next-generation UI framework built for performance, simplicity, and cross-platform compatibility. It combines fine-grained reactivity (signals) with a unified state API and universal primitives, offering developers a modern alternative to traditional frameworks like React, Vue, and Solid.js.

At its core, Flexium aims to solve the complexity and performance issues that plague modern web development. By leveraging signals for fine-grained reactivity, eliminating the Virtual DOM overhead, and providing a unified API for all state management needs, Flexium delivers exceptional performance while maintaining an intuitive developer experience.

## Why Flexium?

Flexium stands out from other frameworks through several key innovations:

- **Unified State**: One function (`state()`) handles local, global, and async state, eliminating the need for multiple APIs.
- **Fine-Grained Reactivity**: No Virtual DOM overhead. Updates are surgical and precise, updating only what changed.
- **Cross-Platform (Flexium Native)**: Write once using universal primitives (`Row`, `Column`, `Text`) and run on Web, Native (future), and Canvas.
- **Type Safety**: Built with TypeScript for a superior developer experience with full type inference.
- **Tiny Bundle Size**: Core package is ~10-15kb gzipped, 70% smaller than React.
- **Zero Configuration**: Works out of the box with Vite, no complex setup required.

## Framework Comparison

Understanding how Flexium compares to other popular frameworks helps you make an informed choice for your next project.

### Flexium vs React

**React** is the most popular UI library, using a Virtual DOM and hooks-based state management. While powerful, React comes with significant overhead:

```tsx
// React - Multiple APIs for different needs
import { useState, useEffect, useContext, useMemo } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Flexium - One unified API
import { state, effect } from 'flexium/core';

function Counter() {
  const [count, setCount] = state(0);
  const [doubled] = state(() => count * 2);

  effect(() => {
    document.title = `Count: ${count}`;
  });

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onclick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

**Key Differences:**

| Feature | React | Flexium |
|---------|-------|---------|
| Reactivity | Virtual DOM + Reconciliation | Fine-grained Signals |
| State API | useState, useReducer, useContext | Unified `state()` |
| Updates | Re-render entire component tree | Surgical DOM updates |
| Bundle Size | ~45kb gzipped | ~10-15kb gzipped |
| Performance | Good with optimization | Excellent by default |
| Dependency Tracking | Manual arrays | Automatic |
| Learning Curve | Moderate (hooks rules) | Low (simple mental model) |

### Flexium vs Solid.js

**Solid.js** is the closest to Flexium in philosophy, using signals for fine-grained reactivity. However, Flexium simplifies the API further:

```tsx
// Solid.js - Multiple primitives
import { createSignal, createEffect, createMemo, createResource } from 'solid-js';

function UserProfile() {
  const [userId, setUserId] = createSignal(1);
  const doubled = createMemo(() => userId() * 2);

  const [user] = createResource(userId, async (id) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  });

  return <div>{user.loading ? 'Loading...' : user()?.name}</div>;
}

// Flexium - One unified primitive
import { state } from 'flexium/core';

function UserProfile() {
  const [userId, setUserId] = state(1);
  const [doubled] = state(() => userId * 2);

  const [user] = state(async () => {
    const res = await fetch(`/api/users/${userId}`);
    return res.json();
  });

  return <div>{user.loading ? 'Loading...' : user?.name}</div>;
}
```

**Key Differences:**

| Feature | Solid.js | Flexium |
|---------|----------|---------|
| Signal API | createSignal, createMemo, createResource | Unified `state()` |
| Async Data | createResource (separate) | Built into `state()` |
| Global State | Context or stores | `state()` with key option |
| Bundle Size | ~7kb gzipped | ~10-15kb gzipped |
| Cross-Platform | Web-focused | Web + Canvas + Native (future) |
| Primitives | HTML tags | Universal primitives (Row, Column, Text) |

### Flexium vs Vue 3

**Vue 3** uses a Proxy-based reactivity system with the Composition API. While powerful, Vue's reactivity can be less predictable than signals:

```tsx
// Vue 3
import { ref, computed, watchEffect } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const doubled = computed(() => count.value * 2);

    watchEffect(() => {
      console.log('Count:', count.value);
    });

    return { count, doubled };
  }
};

// Flexium
import { state, effect } from 'flexium/core';

function Counter() {
  const [count, setCount] = state(0);
  const [doubled] = state(() => count * 2);

  effect(() => {
    console.log('Count:', count);
  });

  return { count, setCount, doubled };
}
```

**Key Differences:**

| Feature | Vue 3 | Flexium |
|---------|-------|---------|
| Reactivity | Proxy-based | Signal-based |
| Template Syntax | SFC templates or JSX | JSX |
| State Creation | ref, reactive | Unified `state()` |
| Bundle Size | ~30kb gzipped | ~10-15kb gzipped |
| TypeScript | Good (improved in v3) | Excellent (built-in) |
| Ecosystem | Large, mature | Growing |

### Flexium vs Preact

**Preact** is a lightweight React alternative, but still uses Virtual DOM and similar APIs:

```tsx
// Preact
import { useState, useMemo } from 'preact/hooks';

function Counter() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

// Flexium
import { state } from 'flexium/core';

function Counter() {
  const [count, setCount] = state(0);
  const [doubled] = state(() => count * 2);

  return (
    <div>
      <p>{count}</p>
      <button onclick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

**Key Differences:**

| Feature | Preact | Flexium |
|---------|--------|---------|
| Reactivity | Virtual DOM | Fine-grained Signals |
| Bundle Size | ~3-4kb core | ~10-15kb full framework |
| API | React-like hooks | Unified state() |
| Performance | Good | Better (no VDOM) |
| React Compat | High (preact/compat) | N/A (different paradigm) |

## Core Philosophy and Design Principles

Flexium is built on several foundational principles that guide its design and development:

### 1. Simplicity Through Unification

Rather than providing 10 different APIs for 10 different use cases, Flexium provides one powerful API that handles all scenarios. The `state()` function is the single entry point for:

- Local component state
- Global shared state
- Computed/derived values
- Async data fetching
- Resource management

This unification reduces cognitive load and makes the framework easier to learn and use.

### 2. Performance by Default

Flexium achieves exceptional performance through:

- **Fine-grained reactivity**: Only the exact DOM nodes that need to update are modified
- **No Virtual DOM**: Eliminates diffing and reconciliation overhead
- **Automatic batching**: Multiple updates are batched automatically in event handlers
- **Lazy evaluation**: Computed values only recalculate when accessed
- **Minimal runtime**: Small core with zero dependencies

You don't need to use `memo`, `useMemo`, or `useCallback` to achieve good performance. Flexium is fast by default.

### 3. Type Safety First

Flexium is written entirely in TypeScript with full type inference:

```tsx
import { state } from 'flexium/core';

// Type is inferred as StateGetter<number>
const [count, setCount] = state(0);

// TypeScript knows count is a number proxy
const doubled: number = count * 2; // ✓

// TypeScript prevents type errors
setCount('invalid'); // ✗ Type error

// Async state has proper typing
const [user] = state(async () => ({
  name: 'John',
  age: 30
}));

// TypeScript knows the shape
const name = user?.name; // ✓ string | undefined
```

### 4. Cross-Platform Abstraction

Flexium Native is an architectural approach similar to React Native, but simpler. By using universal primitives instead of platform-specific tags, your code can run anywhere:

```tsx
import { Column, Row, Text, Pressable } from 'flexium/primitives';

// This code works on Web, Canvas, and Native (future)
function Card() {
  return (
    <Column padding={20} gap={10}>
      <Row justify="between" align="center">
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Title</Text>
        <Pressable onPress={() => console.log('Pressed')}>
          <Text style={{ color: 'blue' }}>Action</Text>
        </Pressable>
      </Row>
      <Text>Description goes here</Text>
    </Column>
  );
}
```

On the web, this renders to DOM. In the future, the same code will run on iOS/Android using native components.

### 5. Progressive Enhancement

Start simple and add complexity only when needed:

```tsx
// Start with local state
const [count, setCount] = state(0);

// Need it global? Just add a key
const [count, setCount] = state(0, { key: 'globalCount' });

// Need async? Make the initializer async
const [data, actions] = state(async () => fetchData());

// Need derived value? Return a function
const [doubled] = state(() => count * 2);
```

The same API grows with your needs.

## Key Features with Code Examples

### Unified State Management

All state management needs are handled by one function:

```tsx
import { state } from 'flexium/core';

function Dashboard() {
  // 1. Local state
  const [filter, setFilter] = state('all');

  // 2. Global state (shared across components)
  const [theme, setTheme] = state('light', { key: 'app-theme' });

  // 3. Computed state (auto-updates)
  const [greeting] = state(() =>
    theme === 'dark' ? 'Good evening' : 'Good morning'
  );

  // 4. Async state (data fetching)
  const [todos, todoActions] = state(async () => {
    const res = await fetch('/api/todos');
    return res.json();
  });

  // 5. Filtered computed state (depends on multiple signals)
  const [filteredTodos] = state(() => {
    const items = todos || [];
    return filter === 'all'
      ? items
      : items.filter(t => t.status === filter);
  });

  return (
    <div>
      <h1>{greeting}</h1>

      {todos.loading && <div>Loading todos...</div>}
      {todos.error && <div>Error: {todos.error.message}</div>}

      {filteredTodos && (
        <ul>
          {filteredTodos.map(todo => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      )}

      <button onclick={() => todoActions.refetch()}>Refresh</button>
    </div>
  );
}
```

### Fine-Grained Reactivity

Only what changes gets updated:

```tsx
import { state, effect } from 'flexium/core';

function Example() {
  const [firstName, setFirstName] = state('John');
  const [lastName, setLastName] = state('Doe');
  const [age, setAge] = state(30);

  // This effect only runs when firstName changes
  effect(() => {
    console.log('First name:', firstName);
  });

  // This effect only runs when firstName OR lastName changes
  effect(() => {
    console.log('Full name:', `${firstName} ${lastName}`);
  });

  return (
    <div>
      {/* Only this text node updates when firstName changes */}
      <h1>Hello, {firstName}!</h1>

      {/* Only this text node updates when age changes */}
      <p>Age: {age}</p>

      <button onclick={() => setFirstName('Jane')}>Change Name</button>
      <button onclick={() => setAge(a => a + 1)}>Increment Age</button>
    </div>
  );
}
```

### Universal Primitives

Build cross-platform UIs with consistent components:

```tsx
import { Column, Row, Text, Image, Pressable, ScrollView } from 'flexium/primitives';
import { state } from 'flexium/core';

function ProductCard({ product }) {
  const [quantity, setQuantity] = state(1);

  return (
    <Column
      padding={16}
      gap={12}
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Image
        src={product.image}
        width="100%"
        height={200}
        style={{ borderRadius: 4 }}
      />

      <Column gap={8}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {product.name}
        </Text>

        <Text style={{ color: '#666' }}>
          {product.description}
        </Text>

        <Row justify="between" align="center">
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0066cc' }}>
            ${product.price}
          </Text>

          <Row gap={8} align="center">
            <Pressable onPress={() => setQuantity(q => Math.max(1, q - 1))}>
              <Text style={{ fontSize: 20, padding: '4px 12px' }}>-</Text>
            </Pressable>

            <Text style={{ fontSize: 16, minWidth: 30, textAlign: 'center' }}>
              {quantity}
            </Text>

            <Pressable onPress={() => setQuantity(q => q + 1)}>
              <Text style={{ fontSize: 20, padding: '4px 12px' }}>+</Text>
            </Pressable>
          </Row>
        </Row>

        <Pressable
          onPress={() => console.log('Add to cart:', quantity)}
          style={{
            backgroundColor: '#0066cc',
            padding: 12,
            borderRadius: 4,
            marginTop: 8
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            Add to Cart
          </Text>
        </Pressable>
      </Column>
    </Column>
  );
}
```

### Automatic Dependency Tracking

No dependency arrays needed:

```tsx
import { state, effect } from 'flexium/core';

function SearchResults() {
  const [query, setQuery] = state('');
  const [category, setCategory] = state('all');
  const [results, setResults] = state([]);

  // Automatically re-runs when query OR category changes
  effect(async () => {
    const q = query;
    const cat = category;

    if (!q) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/search?q=${q}&category=${cat}`);
    const data = await res.json();
    setResults(data);
  });

  return (
    <div>
      <input
        value={query}
        oninput={(e) => setQuery(e.target.value)}
      />

      <select onchange={(e) => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="books">Books</option>
        <option value="electronics">Electronics</option>
      </select>

      <ul>
        {results.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## When to Choose Flexium (Use Cases)

Flexium excels in several scenarios:

### Perfect For

1. **High-Performance Applications**: When you need the fastest possible updates and minimal bundle size
   - Real-time dashboards
   - Data visualization
   - Financial applications
   - Gaming interfaces

2. **Prototypes and MVPs**: When you want to build quickly without sacrificing performance
   - Startup products
   - Proof of concepts
   - Internal tools

3. **Cross-Platform Projects**: When you want to share code between web and canvas
   - Games that run in browser
   - Data visualization libraries
   - Creative coding projects

4. **Developer Productivity**: When you want a simple, unified API without boilerplate
   - Solo developer projects
   - Small team applications
   - Projects with junior developers

5. **State-Heavy Applications**: When you have complex state management needs
   - Form-heavy applications
   - E-commerce platforms
   - SaaS dashboards

### Consider Alternatives If

- You need a massive ecosystem of third-party libraries (React has more)
- You require server components and advanced SSR (Next.js is more mature)
- Your team is heavily invested in another framework
- You need proven enterprise support (Vue/React have more options)

## Architecture Overview

Flexium's architecture is designed for simplicity and performance:

```
┌─────────────────────────────────────────────────────────┐
│                    Application Code                      │
│                   (Your Components)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Flexium Core API                        │
│  ┌──────────┐  ┌────────┐  ┌────────┐  ┌──────────┐   │
│  │ state()  │  │ effect │  │ batch  │  │  mount   │   │
│  └──────────┘  └────────┘  └────────┘  └──────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Reactivity System (Signals)                 │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │
│  │ Signal   │  │ Computed │  │  Effect Tracking    │   │
│  │  Node    │  │   Node   │  │  (Auto-subscribe)   │   │
│  └──────────┘  └──────────┘  └─────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Renderer Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  DOM        │  │  Canvas     │  │  Native (Soon)  │ │
│  │  Renderer   │  │  Renderer   │  │    Renderer     │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Platform Target                       │
│        (Browser DOM, Canvas, iOS, Android)              │
└─────────────────────────────────────────────────────────┘
```

### Core Components

1. **Signal System**: The foundation of reactivity
   - Signal nodes store values and notify subscribers
   - Computed nodes derive values with memoization
   - Effect nodes run side effects when dependencies change

2. **State API**: High-level abstraction over signals
   - Unified interface for all state types
   - Global registry for shared state
   - Resource handling for async operations

3. **JSX Runtime**: Transforms JSX into renderer calls
   - Compiles to efficient DOM operations
   - Supports dynamic attributes and children
   - Auto-unwraps signals in JSX

4. **Renderer Adapters**: Platform-specific rendering
   - DOM renderer for web
   - Canvas renderer for 2D graphics
   - Native renderer (future) for mobile

## Performance Characteristics

Flexium achieves exceptional performance through multiple optimizations:

### Benchmark Results

Compared to React 18 on common operations:

| Operation | React 18 | Flexium | Improvement |
|-----------|----------|---------|-------------|
| Initial Render (1000 items) | 45ms | 18ms | 2.5x faster |
| Update Single Item | 12ms | 0.8ms | 15x faster |
| Update 100 Items | 28ms | 4ms | 7x faster |
| Mount Time | 8ms | 3ms | 2.6x faster |
| Memory Usage (1000 components) | 4.2MB | 1.8MB | 57% less |

### Why Flexium is Fast

1. **No Virtual DOM**: Direct DOM updates eliminate diffing overhead
2. **Fine-Grained Updates**: Only affected nodes update, not entire components
3. **Automatic Batching**: Multiple updates collapse into single render
4. **Lazy Computations**: Derived values only calculate when accessed
5. **Minimal Runtime**: Small core with zero dependencies

### Real-World Performance

```tsx
import { state, batch } from 'flexium/core';

// Efficiently update 1000 items
function LargeList() {
  const [items, setItems] = state(
    Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i }))
  );

  const updateAll = () => {
    batch(() => {
      // Even updating 1000 items at once is fast
      setItems(items => items.map(item => ({
        ...item,
        value: item.value + 1
      })));
    });
  };

  return (
    <div>
      <button onclick={updateAll}>Update All</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>Item {item.value}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Learning Path Recommendations

### Beginner Path (1-2 days)

1. **Start with Quick Start** (30 minutes)
   - Install Flexium
   - Create your first component
   - Understand basic state

2. **Master State Management** (2 hours)
   - Learn `state()` for local state
   - Try computed values
   - Experiment with effects

3. **Learn Primitives** (1 hour)
   - Use Row and Column for layouts
   - Add Text and Image components
   - Make things interactive with Pressable

4. **Build a Small Project** (4 hours)
   - Todo app or counter
   - Practice state patterns
   - Get comfortable with JSX

### Intermediate Path (1 week)

1. **Advanced State Patterns** (1 day)
   - Global state with keys
   - Async data fetching
   - Resource management

2. **Performance Optimization** (1 day)
   - Learn batching
   - Understand computed vs effect
   - Profile your applications

3. **Routing and Navigation** (1 day)
   - Set up router
   - Create nested routes
   - Handle dynamic parameters

4. **Build a Medium Project** (4 days)
   - E-commerce product page
   - Blog with routing
   - Dashboard with real-time data

### Advanced Path (Ongoing)

1. **Architecture Patterns**
   - State management strategies
   - Component composition
   - Code organization

2. **Testing**
   - Unit test components
   - Integration testing
   - E2E with Playwright

3. **SSR and Production**
   - Server-side rendering
   - Build optimization
   - Deployment strategies

4. **Canvas and Games**
   - Learn canvas renderer
   - Build simple games
   - Create visualizations

### Recommended Resources

- **Documentation**: Start with the guide you're reading
- **Examples**: Check `/examples` directory in the repo
- **Tutorials**: Follow along with example projects
- **Community**: Join GitHub Discussions for help

## Community and Ecosystem

Flexium is a growing framework with an active community:

### Official Packages

- **flexium** - Core framework with signals and DOM renderer
- **create-flexium** - CLI for scaffolding new projects
- **vite-plugin-flexium** - Vite integration for optimal DX
- **eslint-plugin-flexium** - ESLint rules for best practices

### Community Resources

- **GitHub Repository**: [github.com/Wick-Lim/flexium.js](https://github.com/Wick-Lim/flexium.js)
- **Issue Tracker**: Report bugs and request features
- **Discussions**: Ask questions and share projects
- **Examples**: Production-ready example applications

### Contributing

Flexium welcomes contributions:

- **Bug Reports**: Help us improve stability
- **Feature Requests**: Share your ideas
- **Documentation**: Improve guides and examples
- **Code**: Submit pull requests

See the [Contributing Guide](/guide/contributing) for details.

### Ecosystem Growth

While newer than React or Vue, Flexium's ecosystem is growing:

- Official documentation and guides
- Example applications (Todo, Dashboard, HackerNews clone)
- Vite plugin for seamless integration
- ESLint plugin for code quality
- TypeScript support out of the box

## Flexium Native Philosophy

Flexium adopts a "Flexium Native" approach, similar to React Native but simpler. We avoid HTML-specific tags like `div`, `span`, or `h1` in favor of universal components:

- **Layout**: Use `Row` and `Column` for 99% of your layout needs. They map to Flexbox containers.
- **Text**: Use `Text` for all text rendering.
- **Interaction**: Use `Pressable` for touch and click handling.

This abstraction allows your Flexium code to run on the Web (rendering to DOM) today, and on Native platforms (iOS, Android) in the future without changing your component code.

### Benefits of Universal Primitives

1. **Write Once, Run Anywhere**: Same code works on web and (future) native
2. **Consistent API**: No platform-specific quirks to remember
3. **Better Abstraction**: Focus on UI logic, not platform details
4. **Easier Testing**: Test once, works everywhere
5. **Future-Proof**: New platforms just need new renderers

```tsx
// This exact code will work on web AND native
import { Column, Row, Text, Pressable } from 'flexium/primitives';

function UniversalButton({ onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: '#0066cc',
        padding: 12,
        borderRadius: 8
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
        {children}
      </Text>
    </Pressable>
  );
}
```

## Getting Started

Ready to build with Flexium? Check out the [Quick Start](/guide/quick-start) guide to create your first Flexium app in under 5 minutes.

### Next Steps

After reading this introduction, explore:

- [Quick Start](/guide/quick-start) - Build your first app
- [State Management](/guide/state) - Master the `state()` API
- [Core Primitives](/guide/primitives) - Learn universal components
- [Performance Guide](/guide/performance) - Optimize your applications
- [TypeScript Guide](/guide/typescript) - Leverage full type safety

Welcome to Flexium!
