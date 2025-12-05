---
title: Suspense - Async Data Loading
description: Handle async data loading elegantly with Suspense, createResource, and ErrorBoundary.
head:
  - - meta
    - property: og:title
      content: Suspense Example - Flexium
  - - meta
    - property: og:description
      content: Async data loading with Suspense and createResource in Flexium.
---

# Suspense Example

This example demonstrates handling async data loading with Suspense boundaries.

## Features Demonstrated

- Basic Suspense with loading fallback
- Multiple independent Suspense boundaries
- Nested Suspense boundaries
- Suspense with ErrorBoundary
- `createResource` for async data fetching
- Parallel data fetching

## Basic Usage

```tsx
import { render } from 'flexium'
import { createResource, Suspense } from 'flexium'

// Fetch function
const fetchUser = async (id: number) => {
  await delay(1500)
  return { id, name: `User ${id}`, email: `user${id}@example.com` }
}

function UserProfile() {
  const [user, { refetch }] = createResource(
    () => 1,  // source signal
    async (id) => fetchUser(id)  // fetcher
  )

  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <div>
        <h2>{user.value?.name}</h2>
        <p>{user.value?.email}</p>
        <button onClick={refetch}>Reload</button>
      </div>
    </Suspense>
  )
}
```

## Multiple Suspense Boundaries

Independent boundaries load separately:

```tsx
function Dashboard() {
  const [fastData] = createResource(() => true, fetchFastData)
  const [slowData] = createResource(() => true, fetchSlowData)

  return (
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <Suspense fallback={<Loading message="Loading fast..." />}>
        <FastComponent data={fastData.value} />
      </Suspense>

      <Suspense fallback={<Loading message="Loading slow..." />}>
        <SlowComponent data={slowData.value} />
      </Suspense>
    </div>
  )
}
```

## Nested Suspense

Each level can have its own loading state:

```tsx
function UserProfile({ userId }) {
  const [user] = createResource(() => userId, fetchUser)

  return (
    <div>
      <h2>{user.value?.name}</h2>

      <Suspense fallback={<Loading message="Loading posts..." />}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  )
}

function UserPosts({ userId }) {
  const [posts] = createResource(() => userId, fetchPosts)

  return (
    <div>
      {posts.value?.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>

          <Suspense fallback={<Loading message="Loading comments..." />}>
            <PostComments postId={post.id} />
          </Suspense>
        </div>
      ))}
    </div>
  )
}
```

## With ErrorBoundary

Handle errors gracefully:

```tsx
import { Suspense, ErrorBoundary } from 'flexium'

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, reset, retryCount }) => (
        <div class="error">
          <h4>Error: {error.message}</h4>
          <p>Attempt #{retryCount + 1}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    >
      <Suspense fallback={<Loading />}>
        <UnstableComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## createResource API

The resource object provides:

```tsx
const [data, { refetch }] = createResource(source, fetcher)

// Resource properties
data.value     // The resolved data
data.loading   // true while loading
data.error     // Error if fetch failed
data.state     // 'pending' | 'ready' | 'error'
data.latest    // Last successful value (for stale-while-revalidate)

// Refetch data
refetch()
```

## Loading Component

```tsx
function Loading({ message }) {
  return (
    <div class="loading">
      <span class="spinner"></span>
      {message}
    </div>
  )
}
```
