# lazy

Create lazy-loaded components for code splitting.

## Import

```ts
import { lazy } from 'flexium/dom'
```

## Overview

`lazy()` enables code splitting by loading components only when they're needed. This reduces the initial bundle size and improves page load performance.

## Basic Usage

```tsx
import { lazy, Suspense } from 'flexium/dom'

const Dashboard = lazy(() => import('./Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
```

## Route-Based Splitting

Load components based on the current route:

```tsx
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  const [route] = use('home')

  return (
    <Suspense fallback={<PageLoader />}>
      {route === 'home' && <Home />}
      {route === 'about' && <About />}
      {route === 'settings' && <Settings />}
    </Suspense>
  )
}
```

## With Props

Lazy components accept props like regular components:

```tsx
const UserProfile = lazy(() => import('./UserProfile'))

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userId={123} showDetails={true} />
    </Suspense>
  )
}
```

## Multiple Lazy Components

Wrap multiple lazy components in a single Suspense:

```tsx
const Header = lazy(() => import('./Header'))
const Sidebar = lazy(() => import('./Sidebar'))
const Content = lazy(() => import('./Content'))

function App() {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <Header />
      <div class="layout">
        <Sidebar />
        <Content />
      </div>
    </Suspense>
  )
}
```

## Error Handling

Combine with ErrorBoundary for error handling:

```tsx
const Dashboard = lazy(() => import('./Dashboard'))

function App() {
  return (
    <ErrorBoundary fallback={<div>Failed to load dashboard</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## Conditional Loading

Load components conditionally:

```tsx
const AdminPanel = lazy(() => import('./AdminPanel'))

function App() {
  const [isAdmin] = use(false)

  return (
    <div>
      <MainContent />
      {isAdmin && (
        <Suspense fallback={<div>Loading admin panel...</div>}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  )
}
```

## Signature

```ts
function lazy<P = {}>(
  loader: () => Promise<{ default: (props: P) => FNodeChild }>
): LazyComponent<P>
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `loader` | `() => Promise<{ default: Component }>` | A function that returns a dynamic import |

### Returns

A `LazyComponent` that can be rendered inside a `Suspense` boundary.

## Module Requirements

The imported module must have a `default` export:

```tsx
// Dashboard.tsx
export default function Dashboard() {
  return <div>Dashboard Content</div>
}
```

## How It Works

1. When a lazy component is first rendered, the loader function is called
2. The returned promise is registered with the nearest `Suspense` boundary
3. `Suspense` shows the fallback while the component loads
4. Once loaded, the component is cached and renders instantly on subsequent uses
5. If loading fails, the error propagates to the nearest `ErrorBoundary`

## Best Practices

- **Route-level splitting**: Split at the route/page level for maximum benefit
- **Avoid over-splitting**: Don't lazy-load small components; the overhead isn't worth it
- **Meaningful fallbacks**: Show loading skeletons that match the component's layout
- **Error boundaries**: Always wrap lazy components with ErrorBoundary for error handling

## See Also

- [Suspense](/docs/dom/suspense) - Display fallback while loading
- [ErrorBoundary](/docs/dom/error-boundary) - Catch loading errors
