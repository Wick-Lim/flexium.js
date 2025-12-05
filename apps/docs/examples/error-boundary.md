---
title: Error Boundary - Error Handling
description: Gracefully handle errors in your Flexium application with ErrorBoundary components.
head:
  - - meta
    - property: og:title
      content: Error Boundary Example - Flexium
  - - meta
    - property: og:description
      content: Error handling with ErrorBoundary in Flexium applications.
---

# Error Boundary Example

This example demonstrates graceful error handling with ErrorBoundary components.

## Features Demonstrated

- Basic error boundary with custom fallback
- Detailed error information display
- Nested error boundaries
- Error recovery
- Programmatic error throwing with `useErrorBoundary`

## Basic Usage

```tsx
import { render } from 'flexium/dom'
import { signal } from 'flexium'
import { ErrorBoundary } from 'flexium'

// Component that might throw an error
function BuggyComponent() {
  const count = signal(0)

  return (
    <div>
      <button onClick={() => count.value++}>
        Count: {() => count.value}
      </button>
      {() => {
        if (count.value >= 3) {
          throw new Error('Count reached 3!')
        }
        return null
      }}
    </div>
  )
}

// Simple fallback UI
function SimpleFallback({ error, reset }) {
  return (
    <div class="error">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )
}

// App with ErrorBoundary
function App() {
  return (
    <ErrorBoundary fallback={SimpleFallback}>
      <BuggyComponent />
    </ErrorBoundary>
  )
}
```

## Detailed Fallback

```tsx
function DetailedFallback({ error, errorInfo, reset, retryCount }) {
  return (
    <div class="error-details">
      <h3>Error Details</h3>

      <div class="error-message">
        <strong>Message:</strong>
        <p>{error.message}</p>
      </div>

      <div class="error-stack">
        <strong>Stack:</strong>
        <pre>{error.stack}</pre>
      </div>

      {errorInfo && (
        <div class="error-info">
          <p>Timestamp: {new Date(errorInfo.timestamp).toLocaleString()}</p>
        </div>
      )}

      <div class="retry-count">
        <strong>Retry Attempts:</strong> {retryCount}
      </div>

      <button onClick={reset}>Reset and Try Again</button>
    </div>
  )
}
```

## useErrorBoundary Hook

Throw errors programmatically from async operations:

```tsx
import { useErrorBoundary } from 'flexium'

function AsyncComponent() {
  const { setError } = useErrorBoundary()
  const loading = signal(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to fetch')
      // handle data...
    } catch (err) {
      loading.value = false
      setError(err)  // This triggers the ErrorBoundary
    }
  }

  return (
    <button onClick={fetchData} disabled={() => loading.value}>
      {() => loading.value ? 'Loading...' : 'Fetch Data'}
    </button>
  )
}
```

## Nested Error Boundaries

Isolate errors to specific parts of the UI:

```tsx
function App() {
  return (
    <div class="grid">
      <ErrorBoundary fallback={InlineFallback}>
        <WidgetA />
      </ErrorBoundary>

      <ErrorBoundary fallback={InlineFallback}>
        <WidgetB />
      </ErrorBoundary>

      <ErrorBoundary fallback={InlineFallback}>
        <WidgetC />
      </ErrorBoundary>
    </div>
  )
}

// Each widget has its own error boundary
// If one crashes, the others continue to work
```

## Error Callbacks

Handle errors and resets with callbacks:

```tsx
function App() {
  const errorLog = signal<Error[]>([])

  const handleError = (error: Error, errorInfo) => {
    console.error('Caught error:', error)
    errorLog.value = [...errorLog.value, error]
    // Send to error tracking service
  }

  const handleReset = () => {
    console.log('Error boundary reset')
  }

  return (
    <ErrorBoundary
      fallback={DetailedFallback}
      onError={handleError}
      onReset={handleReset}
    >
      <MyApp />
    </ErrorBoundary>
  )
}
```

## Error Recovery

Fix the error condition and recover:

```tsx
function RecoveryDemo() {
  const shouldError = signal(true)

  function RecoverableComponent() {
    if (shouldError.value) {
      throw new Error('Error condition active')
    }
    return <div>Component recovered successfully!</div>
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={() => shouldError.value}
          onChange={(e) => shouldError.value = e.target.checked}
        />
        Simulate Error
      </label>

      <ErrorBoundary fallback={DetailedFallback}>
        <RecoverableComponent />
      </ErrorBoundary>
    </div>
  )
}
```

## Inline Fallback

Compact error display:

```tsx
function InlineFallback({ error, reset }) {
  return (
    <div class="inline-error">
      <span class="error-icon">!</span>
      <span>{error.message}</span>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```
