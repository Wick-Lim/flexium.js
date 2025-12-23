# Suspense

Display a fallback UI while async content is loading.

## Import

```ts
import { Suspense } from 'flexium/dom'
```

## Overview

`Suspense` works with `lazy()` to enable code splitting. While lazy-loaded components are being fetched, Suspense shows a fallback UI.

## Basic Usage

```tsx
import { Suspense, lazy } from 'flexium/dom'

const Dashboard = lazy(() => import('./Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
```

## Multiple Lazy Components

Suspense waits for all nested lazy components to load:

```tsx
const Header = lazy(() => import('./Header'))
const Sidebar = lazy(() => import('./Sidebar'))
const Content = lazy(() => import('./Content'))

function App() {
  return (
    <Suspense fallback={<div>Loading app...</div>}>
      <Header />
      <div class="layout">
        <Sidebar />
        <Content />
      </div>
    </Suspense>
  )
}
```

## Nested Suspense

Use nested Suspense boundaries for granular loading states:

```tsx
function App() {
  return (
    <Suspense fallback={<div>Loading layout...</div>}>
      <Header />
      <main>
        <Suspense fallback={<Spinner />}>
          <Dashboard />
        </Suspense>
      </main>
    </Suspense>
  )
}
```

## With Loading Skeleton

```tsx
function DashboardSkeleton() {
  return (
    <div class="dashboard-skeleton">
      <div class="skeleton-header" />
      <div class="skeleton-content">
        <div class="skeleton-card" />
        <div class="skeleton-card" />
        <div class="skeleton-card" />
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  )
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `FNodeChild` | UI to display while loading |
| `children` | `FNodeChild` | Content that may contain lazy components |

## How It Works

1. When a `lazy()` component is rendered, it registers its loading promise with the nearest `Suspense` boundary
2. Suspense shows the fallback while any promises are pending
3. Once all promises resolve, the actual content is rendered
4. If loading fails, the error propagates to the nearest `ErrorBoundary`

## See Also

- [lazy()](/docs/dom/lazy) - Create lazy-loaded components
- [ErrorBoundary](/docs/dom/error-boundary) - Catch and handle errors
