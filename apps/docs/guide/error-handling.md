# Error Handling

Flexium provides a robust way to handle runtime errors in your component tree using the `ErrorBoundary` component. This allows you to catch errors in child components and display a fallback UI instead of crashing the entire application.

## ErrorBoundary

The `<ErrorBoundary>` component catches JavaScript errors thrown anywhere in their child component tree, logs those errors, and displays a fallback UI.

### Basic Usage

Wrap any part of your application with `ErrorBoundary` to protect it from crashes.

```jsx
import { h, ErrorBoundary } from 'flexium';

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <MyWidget />
    </ErrorBoundary>
  );
}
```

### Fallback Component

You can pass a component function as the `fallback` prop to receive the error object. This is useful for displaying detailed error messages.

```jsx
function ErrorFallback(props) {
  return (
    <div class="error-box">
      <h2>Oops!</h2>
      <p>{props.error.message}</p>
      <button onclick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### How it Works

- `ErrorBoundary` uses Flexium's reactive system to track errors.
- When a child component throws an error during rendering or effect execution, the error is caught.
- The `ErrorBoundary` then switches its content to the provided `fallback`.
- Errors are propagated up to the nearest `ErrorBoundary`.

### Difference from Suspense

- **Suspense**: Handles **async** operations (Promises), typically for data loading. It shows a fallback while waiting.
- **ErrorBoundary**: Handles **exceptions** (Errors). It shows a fallback when something breaks.

You can combine them to handle both loading states and errors:

```jsx
<ErrorBoundary fallback={<div>Error loading data</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <AsyncDataComponent />
  </Suspense>
</ErrorBoundary>
```

## Best Practices

1. **Granular Handling**: Don't just wrap your entire app in one `ErrorBoundary`. Wrap distinct sections (e.g., Sidebar, MainContent) so that if one part fails, the rest of the app remains usable.
2. **User Feedback**: Always provide a clear message and, if possible, a way to recover (like a retry button).
3. **Logging**: You can use the error information passed to the fallback to log errors to an external service.
