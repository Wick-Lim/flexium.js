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

`effect()` runs a function automatically whenever its reactive dependencies change. It is the bridge between the reactive state and the outside world (DOM updates, API calls, subscriptions, etc.).

## Usage

The `effect` function takes a callback that executes immediately, and then re-executes whenever any tracked signal within it updates.

```tsx
import { state, effect } from 'flexium/core';

const [count, setCount] = state(0);

effect(() => {
  // Runs immediately, then again when 'count' changes
  console.log('The count is now', count);
});
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
});
```

## Automatic Dependency Tracking

You don't need to manually specify dependencies. Flexium automatically detects which signals are read during the execution of the effect.

```tsx
const [a, setA] = state(1);
const [b, setB] = state(2);

effect(() => {
  if (a > 5) {
    // If a > 5, we read b. Now 'b' is a dependency.
    // If a <= 5, we don't read b. 'b' is NOT a dependency.
    console.log(b);
  }
});
```

This dynamic tracking ensures effects only run when absolutely necessary.

## Async Effects

Effects execute synchronously. If you need to perform async operations, you can make the callback async, but remember that dependencies accessed *after* an `await` might not be tracked (depending on the implementation details, but generally tracking is synchronous).

```tsx
effect(async () => {
  const id = userId; // Tracked
  const data = await fetchUser(id);
  // Code after await runs later, dependencies read here might not track
});
```

For data fetching, prefer using `state(async () => ...)` (Resources) instead of manual effects.
