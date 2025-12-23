# ErrorBoundary

Catch JavaScript errors in child components and display a fallback UI.

## Import

```ts
import { ErrorBoundary } from 'flexium/dom'
```

## Overview

`ErrorBoundary` catches errors that occur during rendering of its children. When an error is caught, it displays a fallback UI instead of crashing the entire application.

## Basic Usage

```tsx
import { ErrorBoundary } from 'flexium/dom'

function App() {
  return (
    <ErrorBoundary fallback={(error) => <div>Something went wrong: {error.message}</div>}>
      <RiskyComponent />
    </ErrorBoundary>
  )
}
```

## With Error Details

Access error information in the fallback:

```tsx
function ErrorFallback(error: Error, info: ErrorInfo | null) {
  return (
    <div class="error-container">
      <h2>Oops! Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
        {info?.componentStack && (
          <pre>{info.componentStack}</pre>
        )}
      </details>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Dashboard />
    </ErrorBoundary>
  )
}
```

## Error Callback

Handle errors for logging or analytics:

```tsx
function App() {
  const handleError = (error: Error, info: ErrorInfo | null) => {
    // Log to error tracking service
    console.error('Caught error:', error)
    console.error('Component stack:', info?.componentStack)
  }

  return (
    <ErrorBoundary
      fallback={<div>Error occurred</div>}
      onError={handleError}
    >
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## Reset on Key Change

Use `resetKey` to reset the error state when a value changes:

```tsx
function App() {
  const [userId, setUserId] = use(1)

  return (
    <div>
      <button onClick={() => setUserId(userId + 1)}>
        Switch User
      </button>
      <ErrorBoundary
        resetKey={userId}
        fallback={<div>Failed to load user</div>}
      >
        <UserProfile id={userId} />
      </ErrorBoundary>
    </div>
  )
}
```

## Nested Error Boundaries

Use multiple boundaries for granular error handling:

```tsx
function App() {
  return (
    <ErrorBoundary fallback={<div>App crashed</div>}>
      <Header />
      <main>
        <ErrorBoundary fallback={<div>Sidebar error</div>}>
          <Sidebar />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Content error</div>}>
          <Content />
        </ErrorBoundary>
      </main>
    </ErrorBoundary>
  )
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `FNodeChild \| ((error: Error, info: ErrorInfo \| null) => FNodeChild)` | UI to display when an error occurs |
| `children` | `FNodeChild` | Content to render |
| `onError` | `(error: Error, info: ErrorInfo \| null) => void` | Callback when an error is caught |
| `resetKey` | `any` | When this value changes, the error state resets |

## ErrorInfo Type

```ts
interface ErrorInfo {
  componentStack?: string
}
```

## How It Works

1. When an error occurs in a child component, ErrorBoundary catches it
2. The `onError` callback is called (if provided)
3. The fallback UI is rendered instead of the children
4. If `resetKey` changes, the error state clears and children render again

## See Also

- [Suspense](/docs/dom/suspense) - Handle loading states
- [lazy()](/docs/dom/lazy) - Code splitting with error handling
