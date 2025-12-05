# Suspense

Suspense lets you display a fallback UI while waiting for async content to load. It works seamlessly with async resources created via `state()`.

## Basic Usage

Wrap async content with `<Suspense>` and provide a fallback:

```tsx
import { Suspense, state, render } from 'flexium'

function UserProfile() {
  const [user] = state(async () => {
    const res = await fetch('/api/user')
    return res.json()
  })

  return (
    <div>
      <h1>{user()?.name}</h1>
      <p>{user()?.email}</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile />
    </Suspense>
  )
}

render(<App />, document.getElementById('app')!)
```

When `UserProfile` is rendered, if the data isn't ready yet, Suspense shows the fallback. Once the promise resolves, it renders the actual content.

## How It Works

1. **Async state detection**: When a component uses `state()` with an async function, it creates a resource that may not have data immediately
2. **Promise registration**: The resource registers its loading promise with the nearest Suspense boundary
3. **Fallback display**: While promises are pending, Suspense renders the fallback
4. **Content reveal**: When all promises resolve, Suspense renders the children

## Multiple Async Resources

Suspense waits for all async resources within its boundary:

```tsx
function Dashboard() {
  const [user] = state(async () => fetchUser())
  const [posts] = state(async () => fetchPosts())
  const [notifications] = state(async () => fetchNotifications())

  return (
    <Column>
      <UserCard user={user()} />
      <PostList posts={posts()} />
      <NotificationBadge count={notifications()?.length} />
    </Column>
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

All three resources load in parallel, and the dashboard shows once everything is ready.

## Nested Suspense Boundaries

You can nest Suspense boundaries for more granular loading states:

```tsx
function App() {
  return (
    <Column>
      {/* Header loads independently */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      {/* Main content has its own boundary */}
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />

        {/* Sidebar can show after main content */}
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </Suspense>
    </Column>
  )
}
```

This allows the header to appear first while other sections continue loading.

## Loading States

Use the `loading` property from state to show inline loading indicators:

```tsx
function UserList() {
  const [users, { refetch }] = state(async () => fetchUsers())

  return (
    <Column>
      <Row>
        <Text>Users</Text>
        <Pressable onPress={refetch} disabled={users.loading}>
          <Text>{users.loading ? 'Refreshing...' : 'Refresh'}</Text>
        </Pressable>
      </Row>

      <Show when={() => !users.loading} fallback={<Spinner />}>
        <For each={users}>
          {(user) => <UserCard user={user} />}
        </For>
      </Show>
    </Column>
  )
}
```

## Error Handling with Suspense

Combine Suspense with ErrorBoundary for complete async handling:

```tsx
import { Suspense, ErrorBoundary } from 'flexium'

function App() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <Column>
          <Text>Something went wrong: {error.message}</Text>
          <Pressable onPress={reset}>
            <Text>Try again</Text>
          </Pressable>
        </Column>
      )}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <AsyncContent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## Skeleton Loading Pattern

Create skeleton components that match your content layout:

```tsx
function CardSkeleton() {
  return (
    <Column style={{ padding: '16px', gap: '8px' }}>
      <div style={{
        width: '60%',
        height: '20px',
        background: '#e0e0e0',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite'
      }} />
      <div style={{
        width: '100%',
        height: '14px',
        background: '#e0e0e0',
        borderRadius: '4px'
      }} />
      <div style={{
        width: '80%',
        height: '14px',
        background: '#e0e0e0',
        borderRadius: '4px'
      }} />
    </Column>
  )
}

function App() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <Card />
    </Suspense>
  )
}
```

## API Reference

### `Suspense`

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `VNodeChild` | UI to show while loading |
| `children` | `VNodeChild` | Async content to render |

### State Loading Properties

When using `state()` with async functions, the getter provides:

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `boolean` | `true` while the promise is pending |
| `error` | `unknown` | Error if the promise rejected |
| `state` | `string` | `'pending'`, `'ready'`, or `'errored'` |

## Best Practices

1. **Place boundaries strategically**: Put Suspense boundaries around independent sections that can load separately

2. **Use skeleton UIs**: Match the skeleton layout to your actual content to prevent layout shift

3. **Combine with ErrorBoundary**: Always handle potential errors from async operations

4. **Avoid suspense waterfalls**: Colocate related async resources to load them in parallel

5. **Show meaningful fallbacks**: Use spinners for quick loads, skeletons for longer waits

## When to Use Suspense

**Use Suspense for:**
- Data fetching with `state(async () => ...)`
- Code splitting and lazy loading
- Any async content that needs a loading state

**Consider alternatives for:**
- Very fast operations (< 100ms) - may cause flicker
- Background refreshes - use inline loading indicators instead
- Non-critical content - load after main content is ready
