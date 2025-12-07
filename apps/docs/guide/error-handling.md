---
title: Error Handling - ErrorBoundary & Error Codes
description: Handle runtime errors gracefully with Flexium's ErrorBoundary component and standardized error code system.
head:
  - - meta
    - property: og:title
      content: Error Handling - Flexium
  - - meta
    - property: og:description
      content: Catch and handle errors with ErrorBoundary and understand Flexium's error code system.
---

# Error Handling

Flexium provides a robust error handling system with two key features:
1. **ErrorBoundary** - Component for catching and displaying errors gracefully
2. **Error Code System** - Standardized error codes with actionable suggestions

## Error Code System

Flexium uses a standardized error code system (FLXxxx) that provides:
- **Unique error codes** for easy identification
- **Contextual information** about what went wrong
- **Actionable suggestions** to help you fix the issue

### Error Code Format

All Flexium errors follow the format `[Flexium FLXxxx]`:

```
[Flexium FLX101] Effect execution failed
  → Check the effect callback for runtime errors. Consider wrapping async operations in try-catch.
```

### Error Code Reference

| Code | Category | Description |
|------|----------|-------------|
| **FLX1xx** | Signal/Effect | |
| FLX101 | | Effect execution failed |
| FLX102 | | onCleanup called outside effect |
| FLX103 | | Signal updated during render |
| **FLX2xx** | Context | |
| FLX201 | | Context used outside Provider |
| FLX202 | | router() outside Router |
| **FLX3xx** | Form | |
| FLX301 | | Form validation failed |
| FLX302 | | Form submission failed |
| **FLX4xx** | Component | |
| FLX401 | | Button handler failed |
| FLX402 | | IconButton missing aria-label |
| **FLX5xx** | Hydration | |
| FLX501 | | Hydration mismatch |
| FLX502 | | Text content mismatch |
| FLX503 | | Element tag mismatch |
| **FLX7xx** | Render | |
| FLX701 | | Uncaught render error |
| FLX702 | | ErrorBoundary callback failed |

### Reading Error Messages

When you see a Flexium error, it contains:

```typescript
[Flexium FLX301] Form field validation failed (field: "email")
  → Check the validation rules for the field and the input value.
ValidationError: Invalid email format
```

1. **Error code** (`FLX301`) - Use this to search docs or report issues
2. **Message** - What went wrong
3. **Context** (`field: "email"`) - Additional details
4. **Suggestion** (→) - How to fix it
5. **Original error** - The underlying cause

## ErrorBoundary

The `<ErrorBoundary>` component catches JavaScript errors thrown anywhere in their child component tree, logs those errors, and displays a fallback UI.

### Basic Usage

Wrap any part of your application with `ErrorBoundary` to protect it from crashes.

```jsx
import { ErrorBoundary } from 'flexium/core';

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <MyWidget />
    </ErrorBoundary>
  );
}
```

### Fallback with Error Details

Pass a function as `fallback` to access error information and reset functionality:

```jsx
function App() {
  return (
    <ErrorBoundary
      fallback={({ error, errorInfo, reset, retryCount }) => (
        <div class="error-box">
          <h2>Oops! Something went wrong</h2>
          <p>{error.message}</p>
          <p>Attempts: {retryCount}</p>
          <button onclick={reset}>Try Again</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log to external service
        console.error('Caught error:', error);
        console.log('Timestamp:', errorInfo.timestamp);
      }}
    >
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `FNode \| ((props) => FNode)` | UI to show when error occurs |
| `children` | `FNodeChild` | Components to protect |
| `onError` | `(error, errorInfo) => void` | Called when error is caught |
| `onReset` | `() => void` | Called when reset is triggered |

### Fallback Props

When using a function fallback, you receive:

| Prop | Type | Description |
|------|------|-------------|
| `error` | `Error` | The caught error |
| `errorInfo` | `ErrorInfo` | Contains `timestamp` and optional `componentStack` |
| `reset` | `() => void` | Function to clear error and retry |
| `retryCount` | `number` | How many times reset has been called |

### errorBoundary Function

For programmatic error handling, use the `errorBoundary` function:

```jsx
import { errorBoundary } from 'flexium/core';

function MyComponent() {
  const { setError, clearError, retry } = errorBoundary();

  const handleClick = async () => {
    try {
      await riskyOperation();
    } catch (err) {
      setError(err); // Triggers nearest ErrorBoundary
    }
  };

  return <button onclick={handleClick}>Do Something</button>;
}
```

::: warning
If `errorBoundary()` is called outside of an `<ErrorBoundary>`, the error will be thrown and logged with error code `FLX701`.
:::

## Difference from Suspense

| Feature | ErrorBoundary | Suspense |
|---------|---------------|----------|
| **Purpose** | Handle exceptions | Handle async operations |
| **Triggers** | Thrown errors | Pending Promises |
| **Use case** | Error recovery | Loading states |

Combine them for complete async error handling:

```jsx
import { ErrorBoundary, Suspense } from 'flexium/core'

<ErrorBoundary fallback={<div>Error loading data</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <AsyncDataComponent />
  </Suspense>
</ErrorBoundary>
```

## Effect Error Handling

Effects support an `onError` option for localized error handling:

```jsx
import { effect } from 'flexium/core';

effect(
  () => {
    // This might throw
    riskyOperation();
  },
  {
    onError: (error) => {
      console.error('Effect failed:', error);
      // Handle gracefully without crashing
    }
  }
);
```

If no `onError` is provided, effect errors are logged with error code `FLX101`.

## Best Practices

### 1. Granular Error Boundaries

Don't wrap your entire app in one `ErrorBoundary`. Wrap distinct sections:

```jsx
function App() {
  return (
    <div class="layout">
      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>

      <ErrorBoundary fallback={<ContentError />}>
        <MainContent />
      </ErrorBoundary>
    </div>
  );
}
```

### 2. Provide Recovery Options

Always give users a way to recover:

```jsx
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div>
      <p>Failed to load: {error.message}</p>
      <button onclick={reset}>Retry</button>
      <button onclick={() => window.location.href = '/'}>Go Home</button>
    </div>
  )}
>
```

### 3. Log Errors Externally

Use `onError` to send errors to monitoring services:

```jsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to Sentry, LogRocket, etc.
    errorService.capture(error, {
      timestamp: errorInfo.timestamp,
      componentStack: errorInfo.componentStack
    });
  }}
>
```

### 4. Development Mode Debugging

In development, set the `__DEV__` global to enable additional warnings:

```typescript
// vite.config.ts
export default {
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
}
```

This enables hydration mismatch warnings and other development-only diagnostics.
