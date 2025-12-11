---
title: Migration to v0.10
description: Guide for migrating from Flexium v0.9 (Signals) to v0.10 (Unified State).
---

# Migration Guide: v0.9 to v0.10

Flexium v0.10 introduces a major architectural shift to the **Unified State API**. This change simplifies the mental model, reduces boilerplate, and provides a more cohesive experience across local, global, and async state.

## Key Changes

| Concept | v0.9 Syntax | v0.10 Syntax |
|---------|-------------|--------------|
| **Local State** | `const c = signal(0)` | `const [c, setC] = state(0)` |
| **Reading** | `c.value` | `c` (direct) |
| **Writing** | `c.value = 1` | `setC(1)` |
| **Computed** | `const d = computed(() => c.value * 2)` | `const [d] = state(() => c * 2)` |
| **Async** | `const [data] = createResource(fetcher)` | `const [data] = state(async () => ...)` |
| **Global** | `createContext` + Providers | `state(val, { key: 'global-key' })` |

## Migration Steps

### 1. Replace `signal()` with `state()`

**Before:**
```typescript
import { signal } from 'flexium';

function Counter() {
  const count = signal(0);
  
  return <button onclick={() => count.value++}>{count.value}</button>;
}
```

**After:**
```typescript
import { state } from 'flexium/core';

function Counter() {
  const [count, setCount] = state(0);
  
  return <button onclick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 2. Replace `computed()` with `state(() => ...)`

**Before:**
```typescript
const count = signal(1);
const double = computed(() => count.value * 2);
```

**After:**
```typescript
const [count, setCount] = state(1);
// Pass a function to create a computed value
const [double] = state(() => count * 2);
```

### 3. Replace `createResource()` with `state(async () => ...)`

**Before:**
```typescript
const [user] = createResource(fetchUser);
// access via user() or user.loading
```

**After:**
```typescript
const [user, refetch, status, error] = state(async () => fetchUser());

// Access properties directly
if (status === 'loading') return <div>Loading...</div>;
return <div>{user.name}</div>;
```

### 4. Global State

Remove explicit Context providers for simple global state.

**Before:**
```typescript
const ThemeContext = createContext();
// ... Provider wrapping ...
const theme = useContext(ThemeContext);
```

**After:**
```typescript
// Anywhere in your app
const [theme, setTheme] = state('light', { key: 'app-theme' });
```

## Why the Change?

1.  **Proxies**: v0.10 uses Proxies to allow direct usage of state in JSX and arithmetic, removing the need for `.value`.
2.  **Unification**: One API (`state`) is easier to learn and remember than many (`signal`, `computed`, `resource`, `atom`, `store`).
3.  **Optimization**: The new architecture allows for smarter optimization of array rendering (`.map`) and batched updates.

## Deprecations

- `signal`, `computed`, `effect` (as top-level exports): Moved to `flexium/advanced` or internal modules. Use `state` and `flexium/core` exports.
- `createResource`: Deprecated in favor of `state(async () => ...)`.
- `batch`: Renamed/Unified into `sync()`.

## Need Help?

If you encounter issues during migration, please open a discussion on GitHub or check the [Examples](/examples) section.
