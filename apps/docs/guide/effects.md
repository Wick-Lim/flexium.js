---
title: effect() - Reactive Side Effects
description: Learn how to use Flexium's effect() API to run side effects automatically when reactive dependencies change.
head:
  - - meta
    - property: og:title
      content: effect() API - Flexium Reactive Effects
  - - meta
    - property: og:description
      content: Run side effects automatically when reactive state changes. Handle DOM updates, API calls, and subscriptions with effect().
---

# effect()

`effect()` runs a function when specified dependencies change. It is the bridge between the reactive state and the outside world (DOM updates, API calls, subscriptions, etc.).

## Usage

The `effect` function takes a callback and a dependency array. It executes immediately, and then re-executes whenever any dependency in the array changes.

```tsx
import { state, effect } from 'flexium/core';

const [count, setCount] = state(0);

effect(() => {
  // Runs immediately, then again when 'count' changes
  console.log('The count is now', count);
}, [count]);  // Explicit dependency array
```

## Cleanup

Effects can return a cleanup function. This function runs before the effect re-executes or when the component unmounts. This is useful for cleaning up event listeners, timers, or subscriptions.

```tsx
effect(() => {
  const handler = () => console.log('Window resized');
  window.addEventListener('resize', handler);

  // Cleanup function
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);  // Empty deps = run once on mount
```

## Dependency Array

Like React's `useEffect`, you must specify which values the effect depends on.

```tsx
const [a, setA] = state(1);
const [b, setB] = state(2);

// Runs when 'a' changes
effect(() => {
  console.log('a changed:', a);
}, [a]);

// Runs when 'a' OR 'b' changes
effect(() => {
  console.log('a or b changed:', a, b);
}, [a, b]);

// Runs once on mount (empty dependency array)
effect(() => {
  console.log('mounted');
  return () => console.log('unmounted');
}, []);
```

## Async Effects

Effects can be async. Specify all dependencies in the dependency array.

```tsx
const [userId] = state(1);

effect(async () => {
  const data = await fetchUser(userId);
  console.log('User data:', data);
}, [userId]);  // Re-runs when userId changes
```

For data fetching, prefer using `state(async () => ...)` (Resources) instead of manual effects.
