# ErrorBoundary Example

A comprehensive demonstration of Flexium's `ErrorBoundary` component, showcasing error handling, recovery, and fallback UI patterns.

## Features Demonstrated

### 1. Basic ErrorBoundary Usage
- Simple error boundary with custom fallback component
- Automatic error catching during component render
- One-click recovery with the `reset` function

### 2. Detailed Error Information
- Comprehensive fallback UI showing:
  - Error message and stack trace
  - Error timestamp and component stack
  - Retry count tracking
- `onError` and `onReset` callbacks for logging and cleanup

### 3. Nested Error Boundaries
- Multiple independent error boundaries
- Isolated error handling - one component's error doesn't affect others
- Different fallback strategies for different parts of the UI

### 4. Error Recovery
- Demonstrates fixing error conditions before retry
- Shows how to recover from errors by changing state
- Custom reset handlers for cleanup operations

### 5. Complex Nested Boundaries
- Multiple levels of error boundaries
- Inner boundaries catch errors before outer boundaries
- Fallback UI hierarchy demonstration

## Error Triggering Mechanisms

The example includes several ways to trigger errors:

1. **Render Errors**: `BuggyComponent` throws when count reaches 3
2. **Async Errors**: `AsyncErrorComponent` simulates failed async operations
3. **Programmatic Errors**: Using `useErrorBoundary().setError()`
4. **Random Errors**: 50% chance error trigger for testing

## API Usage

### ErrorBoundary Props

```tsx
<ErrorBoundary
  fallback={({ error, errorInfo, reset, retryCount }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    console.error('Caught:', error)
  }}
  onReset={() => {
    console.log('Reset')
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### useErrorBoundary Hook

```tsx
function MyComponent() {
  const { setError, clearError, retry } = useErrorBoundary()

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation()
    } catch (err) {
      setError(err)
    }
  }

  return <button onClick={handleAsyncOperation}>Try</button>
}
```

## Fallback Component Props

- `error: Error` - The caught error object
- `errorInfo: ErrorInfo | null` - Additional error information
  - `timestamp: number` - When the error occurred
  - `componentStack?: string` - Component stack trace
- `reset: () => void` - Function to clear error and retry
- `retryCount: number` - Number of times retry has been called

## Running the Example

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Concepts

### Error Isolation
Each ErrorBoundary creates an isolated error boundary. Errors caught by an inner boundary won't propagate to outer boundaries.

### Error Recovery
The `reset` function clears the error state and re-renders the children. For successful recovery:
1. Fix the underlying error condition
2. Call `reset` to retry rendering

### Async Error Handling
For errors in async operations (event handlers, useEffect, etc.), use `useErrorBoundary().setError()` to programmatically trigger the error boundary.

### Fallback UI Patterns

1. **Simple Fallback**: Basic error message with retry button
2. **Detailed Fallback**: Full error information for debugging
3. **Inline Fallback**: Compact error display for smaller components
4. **Custom Fallback**: Application-specific error handling

## Best Practices

1. **Granular Boundaries**: Place error boundaries around logical sections
2. **Meaningful Fallbacks**: Provide clear error messages and recovery options
3. **Error Logging**: Use `onError` for error tracking and monitoring
4. **Graceful Degradation**: Keep critical UI functional even when parts fail
5. **User Feedback**: Always provide a way for users to recover or retry

## Technical Notes

- Error boundaries catch errors during render, not in event handlers
- Use `useErrorBoundary()` to propagate errors from async code
- Errors in error boundary callbacks are logged but don't crash the app
- The `retry` function increments `retryCount` for tracking attempts

## Learn More

- [Flexium Documentation](../../README.md)
- [Error Handling Guide](../../packages/flexium/src/core/error-boundary.ts)
- [More Examples](../README.md)
