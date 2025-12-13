---
title: Quick Start - Get Started with Flexium
description: Get up and running with Flexium in under 5 minutes. Learn how to create your first project, configure JSX, and build components.
head:
  - - meta
    - property: og:title
      content: Quick Start - Flexium
  - - meta
    - property: og:description
      content: Get up and running with Flexium in under 5 minutes. Create your first reactive UI application.
---

# Quick Start

Get up and running with Flexium in under 5 minutes.

## Create a New Project

The fastest way to start is using the official CLI:

```bash
npm create flexium@latest my-app
cd my-app
npm install
npm run dev
```

## Manual Installation

Add Flexium to an existing Vite project:

```bash
npm install flexium
```

### Configure JSX

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

## Your First Component

Create `src/App.tsx`:

```tsx
import { state } from 'flexium/core'

export function App() {
  const count = state(0)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Counter: {count}</h1>
      <button
        onclick={() => count.set(c => c + 1)}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Increment
      </button>
    </div>
  )
}
```

### Mount to DOM

Create `src/main.tsx`:

```tsx
import { render } from 'flexium/dom'
import { App } from './App'

import { render } from 'flexium/dom'
render(<App />, document.getElementById('app')!)
```

## Understanding the API

### 1. Local State

```tsx
const count = state(0);
// count -> use directly as value
// count.set(1) or count.set(c => c + 1) -> set value
```

### 2. Global State

Share state between components easily using a unique `key`.

```tsx
// In Header.tsx
const theme = state('light', { key: ['theme'] });

// Or with explicit undefined for async loading scenarios
const theme = state(undefined, { key: ['theme'] });
```

### 3. Async State (Resources)

Flexium handles loading and error states for you.

```tsx
// status: 'idle' | 'loading' | 'success' | 'error'
const user = state(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

return (
  <div>
    {user.status === 'loading' && <p>Loading...</p>}
    {user.error && <p>Error: {user.error.message}</p>}
    {user.valueOf() && <p>Welcome, {user.name}</p>}
  </div>
);
```

### 4. Computed State

Pass a function to `state()` to create a value that updates automatically when dependencies change.

```tsx
const count = state(0);
const double = state(() => count * 2);  // Use count directly
```

## Next Steps

- Learn about [State Management](/guide/state) in depth.
- Explore [Cross-Platform Primitives](/guide/primitives).