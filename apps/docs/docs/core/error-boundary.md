---
title: ErrorBoundary - Error Handling
---

# &lt;ErrorBoundary /&gt;

Catch and handle errors gracefully in your component tree.

<script setup>
import ErrorBoundaryDemo from '../../components/ErrorBoundaryDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <ErrorBoundaryDemo />
</ClientOnly>

## Import

```tsx
import { ErrorBoundary, useErrorBoundary } from 'flexium/core'
```

## Signature

```tsx
<ErrorBoundary fallback={errorFallback} onError={errorHandler}>
  {children}
</ErrorBoundary>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `(props: FallbackProps) => JSX.Element` | Render function for error UI |
| `onError` | `(error: Error, info: ErrorInfo) => void` | Optional error callback |
| `onReset` | `() => void` | Optional callback when reset is triggered |
| `children` | `JSX.Element` | Content to render |

### FallbackProps

| Prop | Type | Description |
|------|------|-------------|
| `error` | `Error` | The caught error |
| `reset` | `() => void` | Function to reset the error boundary |
| `retryCount` | `number` | Number of retry attempts |

## Usage

### Basic Usage

```tsx
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div>
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onclick={reset}>Try Again</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

### With Error Logging

```tsx
<ErrorBoundary
  fallback={ErrorFallback}
  onError={(error, info) => {
    console.error('Error caught:', error)
    logToService(error, info)
  }}
>
  <App />
</ErrorBoundary>
```

### useErrorBoundary Hook

Programmatically trigger errors from async operations:

```tsx
function AsyncComponent() {
  const { setError } = useErrorBoundary()

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('Failed to fetch')
    } catch (err) {
      setError(err)
    }
  }

  return <button onclick={fetchData}>Load</button>
}
```

### Nested Boundaries

```tsx
<ErrorBoundary fallback={<AppError />}>
  <Header />

  <ErrorBoundary fallback={<WidgetError />}>
    <Widget />
  </ErrorBoundary>

  <ErrorBoundary fallback={<SidebarError />}>
    <Sidebar />
  </ErrorBoundary>
</ErrorBoundary>
```

### Retry Logic

```tsx
function ErrorFallback({ error, reset, retryCount }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <p>Attempts: {retryCount}</p>
      {retryCount < 3 ? (
        <button onclick={reset}>Retry</button>
      ) : (
        <p>Max retries reached. Please refresh.</p>
      )}
    </div>
  )
}
```

### With Suspense

```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

## Behavior

- **Catches errors** during rendering and in effects
- **Isolates errors** to prevent entire app crash
- Provides **reset mechanism** to recover from errors
- Tracks **retry count** for retry logic

## Notes

- Place at strategic points in your component tree
- Use `useErrorBoundary` for async error handling
- Combine with Suspense for complete async handling
- Log errors to monitoring services in production

## See Also

- [&lt;Suspense /&gt;](/docs/core/suspense)
- [useErrorBoundary()](/docs/core/error-boundary#useerrorboundary-hook)
