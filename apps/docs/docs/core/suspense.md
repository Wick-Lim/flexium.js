---
title: Suspense - Async Loading
---

<script setup>
import SuspenseDemo from '../../components/SuspenseDemo.vue'
</script>

# &lt;Suspense /&gt;

Handle async operations with loading states.

## Live Demo

<ClientOnly>
  <SuspenseDemo />
</ClientOnly>

## Import

```tsx
import { Suspense } from 'flexium/core'
```

## Signature

```tsx
<Suspense fallback={loadingElement}>
  {asyncContent}
</Suspense>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `JSX.Element` | Content to show while loading |
| `children` | `JSX.Element` | Async content to render |

## Usage

### Basic Usage

```tsx
<Suspense fallback={<LoadingSpinner />}>
  <AsyncComponent />
</Suspense>
```

### With createResource

```tsx
import { createResource } from 'flexium/core'

const [user] = createResource(() =>
  fetch('/api/user').then(r => r.json())
)

<Suspense fallback={<p>Loading user...</p>}>
  <UserProfile user={user()} />
</Suspense>
```

### Multiple Resources

```tsx
const [user] = createResource(fetchUser)
const [posts] = createResource(fetchPosts)

<Suspense fallback={<FullPageLoader />}>
  <Header user={user()} />
  <PostList posts={posts()} />
</Suspense>
```

### Nested Suspense

```tsx
<Suspense fallback={<LayoutSkeleton />}>
  <Layout>
    <Sidebar />

    <Suspense fallback={<ContentSkeleton />}>
      <MainContent />
    </Suspense>

    <Suspense fallback={<AdsSkeleton />}>
      <Ads />
    </Suspense>
  </Layout>
</Suspense>
```

### Error Handling

```tsx
<ErrorBoundary fallback={<ErrorDisplay />}>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

### Skeleton Loading

```tsx
function UserCardSkeleton() {
  return (
    <div class="skeleton">
      <div class="avatar-skeleton" />
      <div class="text-skeleton" />
    </div>
  )
}

<Suspense fallback={<UserCardSkeleton />}>
  <UserCard />
</Suspense>
```

## Behavior

- Shows `fallback` while **any child is loading**
- Automatically detects **async boundaries**
- Supports **nested Suspense** for granular loading states
- Integrates with `createResource` for data fetching

## Notes

- Combine with `ErrorBoundary` for complete async handling
- Use nested Suspense for progressive loading
- Keep fallback UI similar in size to prevent layout shift

## See Also

- [&lt;ErrorBoundary /&gt;](/docs/core/error-boundary)
- [createResource()](/docs/core/create-resource)
