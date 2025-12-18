---
title: DevTools - Debugging & Inspection
description: Use Flexium DevTools to inspect signals, effects, and component state in your application.
head:
  - - meta
    - property: og:title
      content: DevTools - Flexium
  - - meta
    - property: og:description
      content: Debug and inspect your Flexium application with the built-in DevTools integration.
---

# DevTools

Flexium includes a built-in DevTools integration for inspecting signals, effects, and component state during development.

## Enabling DevTools

Enable DevTools in your application entry point (development mode only):

```typescript
import { enableDevTools } from 'flexium/core';

if (process.env.NODE_ENV !== 'production') {
  enableDevTools();
}
```

When enabled, you'll see a confirmation in the console:

```
[Flexium DevTools] Enabled
```

## Automatic Tracking

Once enabled, DevTools automatically tracks:

- **Signals** - Creation, updates, and subscriber counts
- **Effects** - Creation, execution, and errors
- **Components** - Mount/unmount lifecycle

No manual registration is required - all signals and effects created after `enableDevTools()` are automatically tracked.

## Browser Console API

DevTools exposes an API on `window.__FLEXIUM_DEVTOOLS__`:

```javascript
// Get all tracked signals
window.__FLEXIUM_DEVTOOLS__.getSignals()
// Returns: SignalInfo[]

// Get all tracked effects
window.__FLEXIUM_DEVTOOLS__.getEffects()
// Returns: EffectInfo[]

// Get all tracked components
window.__FLEXIUM_DEVTOOLS__.getComponents()
// Returns: ComponentInfo[]

// Get full state
window.__FLEXIUM_DEVTOOLS__.getState()
// Returns: { enabled, signals, effects, components }

// Subscribe to events
const unsubscribe = window.__FLEXIUM_DEVTOOLS__.subscribe((event, data) => {
  console.log('DevTools event:', event, data);
});
```

## Signal Information

Each tracked signal includes:

```typescript
interface SignalInfo {
  id: number;           // Unique identifier
  name?: string;        // Optional name
  value: unknown;       // Current value
  subscribers: number;  // Number of effects listening
  createdAt: number;    // Timestamp
  lastUpdated: number;  // Last update timestamp
  updateCount: number;  // Total updates
}
```

### Inspecting Signals

```javascript
// In browser console
const signals = window.__FLEXIUM_DEVTOOLS__.getSignals();

signals.forEach(sig => {
  console.log(`Signal #${sig.id}: ${sig.value} (${sig.updateCount} updates)`);
});
```

## Effect Information

Each tracked effect includes:

```typescript
interface EffectInfo {
  id: number;                           // Unique identifier
  name?: string;                        // Optional name (use options.name)
  dependencies: number[];               // Signal IDs this effect depends on
  lastRun: number;                      // Last execution timestamp
  runCount: number;                     // Total executions
  status: 'idle' | 'running' | 'error'; // Current status
  error?: Error;                        // Last error (if status is 'error')
}
```

### Naming Effects

Give effects a name for easier debugging:

```typescript
useEffect(
  () => {
    console.log('Count changed:', count);  // count works directly in effects
  },
  { name: 'countLogger' }  // This name appears in DevTools
);
```

## Event Subscription

Subscribe to DevTools events for real-time monitoring:

```javascript
const unsubscribe = window.__FLEXIUM_DEVTOOLS__.subscribe((event, data) => {
  switch (event) {
    case 'signal-create':
      console.log('New signal:', data.id);
      break;
    case 'signal-update':
      console.log('Signal updated:', data.id, data.value);
      break;
    case 'effect-create':
      console.log('New effect:', data.id);
      break;
    case 'effect-run':
      console.log('Effect ran:', data.id, data.status);
      break;
    case 'component-mount':
      console.log('Component mounted:', data.id);
      break;
    case 'component-unmount':
      console.log('Component unmounted:', data.id);
      break;
  }
});

// Later: stop listening
unsubscribe();
```

## Disabling DevTools

Disable DevTools at runtime:

```typescript
import { disableDevTools } from 'flexium/core';

disableDevTools();
```

This clears all tracked state and removes the window API.

## Performance Considerations

::: warning
DevTools adds overhead to signal and effect operations. Only enable it in development.
:::

```typescript
// Recommended pattern
if (import.meta.env.DEV) {
  enableDevTools();
}
```

## Building Custom Tools

Use the DevTools API to build custom debugging tools:

```typescript
// Simple signal watcher
function watchSignals() {
  const devtools = (window as any).__FLEXIUM_DEVTOOLS__;
  if (!devtools) return;

  setInterval(() => {
    const signals = devtools.getSignals();
    console.table(signals.map(s => ({
      id: s.id,
      value: s.value,
      updates: s.updateCount
    })));
  }, 1000);
}

// Effect performance monitor
function monitorEffects() {
  const devtools = (window as any).__FLEXIUM_DEVTOOLS__;
  if (!devtools) return;

  devtools.subscribe((event, data) => {
    if (event === 'effect-run' && data.status === 'error') {
      console.error('Effect failed:', data.id, data.error);
    }
  });
}
```

## Integration with Browser Extensions

The `window.__FLEXIUM_DEVTOOLS__` API is designed for browser extension integration. Future Flexium DevTools browser extensions can connect to this API for a visual debugging experience.

## Troubleshooting

### DevTools Not Showing Data

1. Ensure `enableDevTools()` is called **before** creating signals
2. Check that you're not in production mode
3. Verify the console shows "[Flexium DevTools] Enabled"

### Too Many Signals

Large applications may create many signals. Filter by name:

```javascript
const signals = window.__FLEXIUM_DEVTOOLS__.getSignals()
  .filter(s => s.name?.includes('user'));
```

### Effect Not Appearing

Effects without the `name` option will have `name: undefined`. Consider naming important effects for easier debugging.
