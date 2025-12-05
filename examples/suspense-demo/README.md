# Flexium Suspense Demo

A comprehensive demonstration of Flexium's Suspense implementation for handling async data loading with elegant loading states, error boundaries, and nested suspense boundaries.

## Features Demonstrated

This demo showcases:

### 1. Basic Suspense with Loading Fallback
- Simple Suspense boundary with a loading fallback
- Automatic loading state management
- Resource refetching capabilities

### 2. Multiple Independent Suspense Boundaries
- Multiple Suspense boundaries loading independently
- Different loading times for different content
- Non-blocking parallel loading states

### 3. Nested Suspense Boundaries
- Hierarchical data loading (User → Posts → Comments)
- Each level has its own loading state
- Progressive content rendering as data becomes available

### 4. Suspense with Error Handling
- Integration with ErrorBoundary component
- Graceful error handling for failed async operations
- Retry functionality with error state tracking

### 5. createResource API
- Using `createResource` for async data fetching
- Automatic Suspense integration
- Access to loading, error, and state properties
- Resource refetching and mutation

### 6. Manual Promise Registration
- Direct use of `SuspenseCtx` context
- Imperative data fetching scenarios
- Manual control over promise registration

### 7. Parallel Data Fetching
- Multiple resources loading in parallel
- Single Suspense boundary waiting for all resources
- Efficient data loading patterns

## Installation

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

## Project Structure

```
suspense-demo/
├── src/
│   └── main.tsx         # Main application with all examples
├── index.html           # HTML entry point with styles
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite bundler configuration
└── README.md           # This file
```

## Key APIs Used

### Suspense Component

```tsx
import { Suspense } from 'flexium'

<Suspense fallback={<div>Loading...</div>}>
  <AsyncContent />
</Suspense>
```

The Suspense component:
- Shows `fallback` while child content is loading
- Automatically tracks promises from resources
- Supports nested boundaries for granular loading states
- Integrates with ErrorBoundary for error handling

### createResource Hook

```tsx
import { createResource } from 'flexium'

const [data, { refetch, mutate }] = createResource(
  () => sourceValue,  // Source function (tracks dependencies)
  async (source) => {  // Fetcher function
    const response = await fetch('/api/data')
    return response.json()
  }
)

// Access resource properties
data.value      // Current value (undefined while loading)
data.loading    // Boolean loading state
data.error      // Error object if failed
data.state      // 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
data.latest     // Latest known value (doesn't trigger Suspense)
data.read()     // Throws promise if pending (for Suspense)
```

### Manual Promise Registration

```tsx
import { SuspenseCtx, useContext } from 'flexium'

function MyComponent() {
  const suspenseCtx = useContext(SuspenseCtx)

  const handleLoad = () => {
    const promise = fetchData()
    suspenseCtx?.registerPromise(promise)
  }

  return <button onClick={handleLoad}>Load</button>
}
```

### ErrorBoundary Component

```tsx
import { ErrorBoundary } from 'flexium'

<ErrorBoundary
  fallback={({ error, reset, retryCount }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    console.error('Caught error:', error)
  }}
>
  <Suspense fallback={<div>Loading...</div>}>
    <AsyncContent />
  </Suspense>
</ErrorBoundary>
```

## How Suspense Works in Flexium

1. **Promise Tracking**: When a resource is loading, it registers its promise with the nearest Suspense boundary
2. **Fallback Rendering**: While promises are pending, Suspense renders the fallback UI
3. **Content Rendering**: Once all promises resolve, Suspense renders the actual content
4. **Reactive Updates**: Uses signals internally to trigger re-renders when loading state changes
5. **Nested Boundaries**: Each Suspense boundary maintains its own promise count independently

## Resource States

Resources created with `createResource` can be in one of five states:

- **unresolved**: Initial state, before first fetch
- **pending**: Currently fetching for the first time
- **ready**: Data successfully loaded
- **refreshing**: Refetching while previous data is still available
- **errored**: Fetch failed with an error

## Best Practices

1. **Granular Boundaries**: Use multiple Suspense boundaries for better UX
2. **Error Handling**: Always wrap Suspense in ErrorBoundary for production apps
3. **Progressive Loading**: Nest boundaries to show content as it becomes available
4. **Loading States**: Use resource.loading for button disabled states
5. **Parallel Fetching**: Start multiple fetches in parallel when possible
6. **Resource Keys**: Use source function to control when refetching happens

## Browser Support

- Modern browsers with ES2020 support
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Learn More

- [Flexium Documentation](../../README.md)
- [Core Reactivity System](../../packages/flexium/src/core/README.md)
- [Suspense Implementation](../../packages/flexium/src/core/suspense.ts)
- [Resource API](../../packages/flexium/src/core/signal.ts)

## License

MIT
