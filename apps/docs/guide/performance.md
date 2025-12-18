---
title: Performance - Optimization Guide
description: Learn how Flexium achieves high performance with fine-grained updates, no Virtual DOM, and automatic optimizations.
head:
  - - meta
    - property: og:title
      content: Performance Optimization - Flexium
  - - meta
    - property: og:description
      content: High performance by default with fine-grained reactivity. No Virtual DOM overhead, surgical DOM updates.
---

# Performance

Flexium is designed for high performance by default. With fine-grained reactivity, no Virtual DOM overhead, and intelligent optimizations, your applications run faster with less code. This guide covers performance patterns, optimization techniques, and best practices.

## Core Performance Advantages

### Fine-Grained Updates

Because Flexium uses signals, updates are pinpointed. If a state changes, only the specific text node or attribute bound to that state updates. There's no component re-rendering or VDOM diffing.

```tsx
import { use } from 'flexium/core';

function Counter() {
  const [count, setCount] = use(0);

  // When count changes, ONLY the text node updates
  // The button, div, and everything else remain untouched
  return (
    <div class="container">
      <h1>Counter</h1>
      <p>Count: {count}</p> {/* Only this text updates - count works directly */}
      <button onclick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### No Virtual DOM

There is no Virtual DOM overhead. No diffing phase. No reconciliation. This reduces memory usage and CPU cycles significantly.

**Traditional VDOM approach:**
1. State changes
2. Re-render entire component tree
3. Create new VDOM tree
4. Diff old vs new VDOM
5. Compute patches
6. Apply patches to real DOM

**Flexium approach:**
1. State changes
2. Update DOM directly

This means Flexium can be 2-10x faster than VDOM-based frameworks for many operations.

### Automatic Dependency Tracking

Effects and computed values automatically track only the signals they read. No manual dependency arrays, no risk of stale closures or missing dependencies.

```tsx
import { use } from 'flexium/core';

const [a, setA] = use(1);
const [b, setB] = use(2);

use(() => {
  if (a > 5) {  // Both a() and a work in effects
    // Only when a > 5, this effect depends on 'b'
    console.log('b is', b);
  }
});

// Changing 'b' when a <= 5 won't trigger the effect
setB(10); // No effect runs

// But once a > 5, b becomes a dependency
setA(6);  // Effect runs
setB(20); // Effect runs again
```

## Signal Optimization Patterns

### Use Computed for Derived State

Instead of recalculating values in JSX, use `use()` with `deps` to memoize derived values:

```tsx
import { use } from 'flexium/core';

// Bad - recalculates on every access
function TodoList() {
  const [todos, setTodos] = use([...]);

  return (
    <div>
      <p>Total: {todos.length}</p>
      <p>Completed: {todos.filter(t => t.done).length}</p>
      <p>Active: {todos.filter(t => !t.done).length}</p>
    </div>
  );
}

// Good - computed values with deps
function TodoList() {
  const [todos, setTodos] = use([...]);
  const [total] = use(() => todos.length, [todos]);
  const [completed] = use(() => todos.filter(t => t.done).length, [todos]);
  const [active] = use(() => todos.filter(t => !t.done).length, [todos]);

  return (
    <div>
      <p>Total: {total}</p>
      <p>Completed: {completed}</p>
      <p>Active: {active}</p>
    </div>
  );
}
```

Computed values only recalculate when their dependencies change.

### Prefer Computed Over Effect

When you need a derived value, use `computed()` instead of `use()` with manual state updates:

```tsx
```tsx
import { use } from 'flexium/core';

const [firstName, setFirstName] = use('John');
const [lastName, setLastName] = use('Doe');

// Bad - uses effect to maintain derived state
const [fullName, setFullName] = use('');
use(() => {
  setFullName(`${firstName} ${lastName}`);
});

// Good - computed automatically updates
const [fullNameComputed] = use(() => `${firstName} ${lastName}`);
```

Computed is more efficient because it's lazy (only computes when read) and doesn't trigger unnecessary updates.

### Avoid Nested Signal Reads

Reading signals inside loops or nested structures can create many dependencies:

```tsx
```tsx
import { use } from 'flexium/core';

const [items, setItems] = use([...]);

// Bad - creates dependency on every item property
use(() => {
  const list = items;
  list.forEach(item => {
    console.log(item.name, item.value);
  });
});

// Good - depend only on the array itself
use(() => {
  const list = items;
  console.log('Items changed:', list.length);
});

// Or use granular signals for each item
const itemSignals = items.map(item => use(item));
```

## Computed vs Effect Usage

Understanding when to use `computed()` vs `use()` is crucial for performance.

### Use Computed When:

- **Deriving values from other signals**
- **The result will be read by other computations or UI**
- **You want lazy evaluation** (only computes when accessed)
- **You need memoization**

```tsx
```tsx
import { use } from 'flexium/core';

const [price, setPrice] = use(100);
const [tax, setTax] = use(0.08);

// Computed - perfect for derived values
const [total] = use(() => price * (1 + tax));

// Used in UI - only recalculates when price or tax changes
<div>Total: ${total}</div>
```

### Use Effect When:

- **Performing side effects** (logging, API calls, DOM manipulation)
- **The computation doesn't produce a value for others to use**
- **You need eager execution** (run immediately on changes)
- **Setting up subscriptions or event listeners**

```tsx
```tsx
import { use } from 'flexium/core';

const [userId, setUserId] = use(null);

// Effect - perfect for side effects
use(() => {
  const id = userId;  // userId() works in effects
  if (id) {
    // Side effect: log to analytics
    analytics.track('user_viewed', { userId: id });
  }
});

// Effect with cleanup
use(() => {
  const handler = () => console.log('Window resized');
  window.addEventListener('resize', handler);

  return () => window.removeEventListener('resize', handler);
});
```

### Performance Comparison

```tsx
```tsx
import { use } from 'flexium/core';

const [count, setCount] = use(0);

// Computed - lazy, memoized
const [doubled] = use(() => {
  console.log('Computing doubled');
  return count * 2;
});

// Effect - eager, runs on every change
use(() => {
  console.log('Effect triggered');
  const value = count * 2;
});

setCount(1); // Both run
doubled;   // Returns cached value, no recomputation
doubled;   // Still cached

setCount(2); // Effect runs immediately, computed marks stale
// Computed only recalculates when accessed
doubled;   // Recomputes now
```

## Sync Updates

When making multiple state changes, sync them to avoid intermediate updates:

```tsx
import { useSync } from 'flexium/core';
import { use } from 'flexium/core';

const [firstName, setFirstName] = use('John');
const [lastName, setLastName] = use('Doe');
const [age, setAge] = use(30);

// Bad - triggers 3 separate updates
function updateUser(user) {
  setFirstName(user.first);  // Update 1
  setLastName(user.last);    // Update 2
  setAge(user.age);          // Update 3
  // UI re-renders 3 times!
}

// Good - batches into 1 update
function updateUser(user) {
  sync(() => {
    setFirstName(user.first);
    setLastName(user.last);
    setAge(user.age);
  });
  // UI re-renders once!
}
```

Batching/Syncing is especially important when:
- Updating multiple related signals
- Processing arrays of changes
- Responding to user input that affects multiple states

### Automatic Batching

Flexium automatically batches updates in event handlers:

```tsx
// Updates are automatically batched in event handlers
<button onclick={() => {
  setCount(c => c + 1);
  setName('Updated');
  setActive(true);
  // All 3 updates batched automatically
}}>
  Update
</button>

// But not in async callbacks
setTimeout(() => {
  // These are NOT automatically batched
  setCount(c => c + 1);
  setName('Updated');
  setActive(true);
}, 1000);

// Wrap in sync() for async contexts
setTimeout(() => {
  sync(() => {
    setCount(c => c + 1);
    setName('Updated');
    setActive(true);
  });
}, 1000);
```

### Event Delegation

Flexium uses efficient event delegation for all standard events. Listeners are attached to the document root rather than individual elements, reducing memory usage and setup time.

- **Smart Traversal**: Uses `event.composedPath()` for fast target resolution, even through Shadow DOM.
- **Automatic Cleanup**: Global listeners are managed automatically.
- **Automatic Batching**: Event handlers automatically batch state updates.

## Memory Management

### Root Scopes

Use `root()` to create disposal scopes for effects and computations:

```tsx
import { use } from 'flexium/core';
import { root } from 'flexium/core';

const [count, setCount] = use(0);

// Bad - effect never gets cleaned up
function createWatcher() {
  use(() => {
    console.log('Count:', count);
  });
}

createWatcher(); // Creates effect
createWatcher(); // Creates another effect - memory leak!

// Good - effect is properly cleaned up
function createWatcher() {
  return root(dispose => {
    use(() => {
      console.log('Count:', count);
    });

    return dispose; // Return cleanup function
  });
}

const cleanup1 = createWatcher();
const cleanup2 = createWatcher();

// Clean up when done
cleanup1();
cleanup2();
```

### Component Cleanup

In components, effects are automatically cleaned up when the component unmounts:

```tsx
function Timer() {
  const [time, setTime] = use(0);

  // This effect is automatically cleaned up on unmount
  use(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  });

  return <div>Time: {time}</div>;  {/* time works directly */}
}
```

### Untrack for Read-Only Access

Use `untrack()` to read a signal without creating a dependency:

```tsx
import { use } from 'flexium/core';
import { untrack } from 'flexium/core';

const [count, setCount] = use(0);
const [multiplier, setMultiplier] = use(2);

// This effect only tracks 'count', not 'multiplier'
use(() => {
  const c = count;
  const m = untrack(() => multiplier); // Read without tracking
  console.log('Result:', c * m);
});

setCount(5);      // Effect runs
setMultiplier(3); // Effect does NOT run
```

This is useful for:
- Reading initial/default values
- Logging or debugging without creating dependencies
- Conditional logic where you don't want tracking

### Untrack for Untracked Access

Use `untrack()` for reading values without creating dependencies:

```tsx
import { use } from 'flexium/core';

const [count, setCount] = use(0);

use(() => {
  // Tracked access
  const current = count;

  // Untracked access
  const initial = untrack(() => count);

  console.log(`Changed from ${initial} to ${current}`);
});
```

## List for Large Lists

When rendering thousands of items, use `List` with `virtual` mode to only render visible items:

```tsx
import { List } from 'flexium/primitives';
import { use } from 'flexium/core';

function BigList() {
  const [items, setItems] = use(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
  );

  return (
    <List
      items={items}
      virtual
      height={600}
      itemSize={50}
      overscan={5}
      getKey={item => item.id}
    >
      {(item, index) => (
        <div style={{ padding: '10px' }}>
          {index}: {item.name}
        </div>
      )}
    </List>
  );
}
```

**Performance benefits:**
- **Constant memory usage** regardless of list size
- **Smooth scrolling** even with 100,000+ items
- **Fast initial render** - only visible items rendered
- **Efficient updates** - only visible items re-render

### List Best Practices

1. **Use stable keys** - Provide `getKey` for efficient reconciliation
2. **Fixed item heights** - Best performance with consistent heights
3. **Optimize overscan** - Balance smoothness vs memory (default: 3)
4. **Memoize renderers** - Avoid recreating render functions

```tsx
import { List } from 'flexium/primitives';
import { use } from 'flexium/core';

function OptimizedList() {
  const [items, setItems] = use([...]); // 100,000 items

  // List component automatically optimizes rendering
  return (
    <List items={items}>
      {(item, index) => (
        <div class="item">
          <span>{index}</span>
          <span>{item.name}</span>
        </div>
      )}
    </List>
  );

  return (
    <List
      items={items}
      virtual
      height={600}
      itemSize={40}
      overscan={3}
      getKey={item => item.id}
    >
      {renderItem}
    </List>
  );
}
```

## Lazy Loading Patterns

### Code Splitting with Dynamic Imports

Split your application into smaller chunks that load on demand:

```tsx
// Use dynamic imports with use() for code splitting
function App() {
  const [route, setRoute] = use('dashboard');
  const [components, setComponents] = use({
    dashboard: null,
    settings: null,
    profile: null
  });

  // Load components on demand
  use(() => {
    if (route === 'dashboard' && !components.dashboard) {
      import('./Dashboard').then(m => setComponents(prev => ({ ...prev, dashboard: m.default })));
    }
    if (route === 'settings' && !components.settings) {
      import('./Settings').then(m => setComponents(prev => ({ ...prev, settings: m.default })));
    }
    if (route === 'profile' && !components.profile) {
      import('./Profile').then(m => setComponents(prev => ({ ...prev, profile: m.default })));
    }
  });

  return (
    <div>
      <nav>
        <button onclick={() => setRoute('dashboard')}>Dashboard</button>
        <button onclick={() => setRoute('settings')}>Settings</button>
        <button onclick={() => setRoute('profile')}>Profile</button>
      </nav>

      {route === 'dashboard' && (components.dashboard ? <components.dashboard /> : <div>Loading...</div>)}
      {route === 'settings' && (components.settings ? <components.settings /> : <div>Loading...</div>)}
      {route === 'profile' && (components.profile ? <components.profile /> : <div>Loading...</div>)}
    </div>
  );
}
```

### Route-Based Code Splitting

With Flexium Router, automatically split by route:

```tsx
import { Routes, Route } from 'flexium/router';
// Use dynamic imports with use() for code splitting
const [Home, setHome] = use(null);
const [About, setAbout] = use(null);
const [Contact, setContact] = use(null);

// Load on demand
import('./pages/Home').then(m => setHome(m.default));
import('./pages/About').then(m => setAbout(m.default));
import('./pages/Contact').then(m => setContact(m.default));

function App() {
  return (
    <Routes>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
    </Routes>
  );
}
```

### Lazy Data Loading

Load data only when needed:

```tsx
import { use } from 'flexium/core';

function UserProfile({ userId }) {
  const [expanded, setExpanded] = use(false);
  const [details, setDetails] = use(null);

  // Only fetch when expanded
  use(() => {
    if (expanded && !details) {
      fetch(`/api/users/${userId}/details`)
        .then(res => res.json())
        .then(data => setDetails(data));
    }
  });

  return (
    <div>
      <h2>User {userId}</h2>
      <button onclick={() => setExpanded(e => !e)}>
        {expanded ? 'Hide' : 'Show'} Details
      </button>

      {expanded && details && (
        !details.loading ? (
          <div>{details?.bio}</div>
        ) : (
          <div>Loading...</div>
        )
      )}
    </div>
  );
}
```

### Image Lazy Loading

Use native lazy loading for images:

```tsx
import { Image } from 'flexium/primitives';

function Gallery({ images }) {
  return (
    <div class="gallery">
      {images.map((img) => (
        <Image
          key={img.url}
          src={img.url}
          alt={img.title}
          loading="lazy"
          width={300}
          height={200}
        />
      ))}
    </div>
  );
}
```

## Bundle Size Optimization

### Tree Shaking

Flexium is designed for excellent tree shaking. Import only what you use:

```tsx
// Bad - imports everything
import * as Flexium from 'flexium';

// Good - imports only what you need
import { use } from 'flexium/core';
import { Column, Row, Text } from 'flexium/primitives';
```

### Entry Points

Flexium provides multiple entry points for optimal bundling:

```tsx
// Core reactivity (smallest)
import { use } from 'flexium/core';

// DOM rendering
import { render } from 'flexium/dom';

// Primitives
import { Column, Row, Text } from 'flexium/primitives';

// Advanced APIs
import { root, untrack } from 'flexium/core';

// Router
import { Routes, Route, Link } from 'flexium/router';

// Canvas
import { Canvas } from 'flexium-canvas';

// Interactive utilities
import { useKeyboard, useMouse, useLoop } from 'flexium-canvas';
```

### Analyze Bundle Size

Use your bundler's analysis tools:

```bash
# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer

# Rollup
npx rollup-plugin-visualizer
```

Look for:
- Unexpectedly large dependencies
- Duplicate packages
- Unused code that wasn't tree-shaken

### Dynamic Imports for Large Libraries

For large third-party libraries, use dynamic imports:

```tsx
import { use } from 'flexium/core';

function ChartComponent({ data }) {
  const [Chart, setChart] = use(null);

  // Load chart library only when needed
  use(() => {
    if (data.length > 0 && !Chart) {
      import('chart.js').then(module => {
        setChart(module.default);
      });
    }
  });

  return (
    <div>
      {Chart ? (
        <ChartRenderer Chart={Chart} data={data} />
      ) : (
        <div>Loading chart...</div>
      )}
    </div>
  );
}
```

## Component Optimization

### Avoid Unnecessary Nesting

Flat component structures are more efficient:

```tsx
// Less efficient - extra nesting
function UserCard({ user }) {
  return (
    <Column>
      <Row>
        <Column>
          <Text>{user.name}</Text>
        </Column>
      </Row>
    </Column>
  );
}

// More efficient - flatter structure
function UserCard({ user }) {
  return (
    <Column>
      <Text>{user.name}</Text>
    </Column>
  );
}
```

### Keep Components Small

Smaller components are easier to optimize and maintain:

```tsx
// Large monolithic component
function Dashboard() {
  // 500+ lines of code
  // Multiple states
  // Complex logic
}

// Better - split into focused components
function Dashboard() {
  return (
    <Column>
      <DashboardHeader />
      <DashboardStats />
      <DashboardChart />
      <DashboardTable />
    </Column>
  );
}
```

### Memoize Expensive Computations

For expensive calculations, use `use()` with the `deps` option to control when recomputation occurs:

```tsx
import { use } from 'flexium/core';

function DataTable({ rawData, filterStatus }) {
  // Expensive computation - only re-runs when deps change
  const [processedData] = use(() => {
    return rawData
      .filter(item => filterStatus === 'all' || item.status === filterStatus)
      .map(item => ({
        ...item,
        score: calculateComplexScore(item)
      }))
      .sort((a, b) => b.score - a.score);
  }, [rawData, filterStatus]);

  return (
    <table>
      {processedData.map((row) => <TableRow key={row.id} data={row} />)}
    </table>
  );
}
```

## Measuring Performance

### Browser DevTools

Use browser performance tools:

```tsx
// Mark performance checkpoints
performance.mark('app-init-start');

render(<App />, root);

performance.mark('app-init-end');
performance.measure('app-init', 'app-init-start', 'app-init-end');
```

### Custom Performance Monitoring

Track specific operations:

```tsx
import { use } from 'flexium/core';

function measureEffect(name, fn) {
  return use(() => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (end - start > 16) { // Slower than one frame
      console.warn(`Slow effect "${name}": ${end - start}ms`);
    }

    return result;
  });
}

// Usage
measureEffect('user-data-sync', () => {
  const user = userData;  // userData works directly
  syncToLocalStorage(user);
});
```

### React DevTools Profiler

Flexium works with React DevTools for component profiling:

```bash
# Install the browser extension
# Then profile your app to find bottlenecks
```

## Best Practices Summary

1. **Use computed for derived values** - Lazy, memoized, efficient
2. **Batch multiple updates** - Reduce intermediate renders
3. **Leverage List with virtual mode for long lists** - Constant memory, smooth scrolling
4. **Code split with dynamic imports** - Smaller initial bundles
5. **Import only what you need** - Better tree shaking
6. **Use untrack() judiciously** - Prevent unnecessary dependencies
7. **Clean up effects in root scopes** - Avoid memory leaks
8. **Profile before optimizing** - Measure, don't guess
9. **Keep components small** - Easier to optimize and maintain
10. **Use conditional rendering with && or ternary** - Optimized for reactivity

## Benchmarks

Flexium's fine-grained reactivity and no-VDOM architecture provide significant performance advantages:

- **Initial render**: 2-3x faster than React
- **Update performance**: 3-10x faster than React (no diffing)
- **Memory usage**: 40-60% less than React (no VDOM)
- **Bundle size**: ~10KB gzipped (vs 45kb+ for React)

For detailed benchmarks and comparisons, see our [benchmark repository](https://github.com/flexium-js/benchmarks).
