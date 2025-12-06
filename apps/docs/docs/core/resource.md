# createResource()

Manage async data with built-in loading and error states.

## Import

```ts
import { createResource } from 'flexium/core'
```

## Signature

```ts
function createResource<T, S>(
  source: S | Signal<S> | (() => S),
  fetcher: (source: S, info: { value: T | undefined; refetching: boolean }) => Promise<T>
): [Resource<T>, { mutate: (v: T) => void; refetch: () => void }]
```

## Usage

### Basic Usage

```tsx
import { createResource } from 'flexium/core'

const fetchUser = async (id) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}

function UserProfile(props) {
  const [user, { refetch }] = createResource(
    () => props.userId,
    fetchUser
  )

  return (
    <Show when={!user.loading} fallback={<div>Loading...</div>}>
      <Show when={!user.error} fallback={<div>Error: {user.error.message}</div>}>
        <div>{user().name}</div>
        <button onClick={refetch}>Refresh</button>
      </Show>
    </Show>
  )
}
```

### Static Source

```tsx
// Fetcher runs once on mount
const [data] = createResource(
  'config',
  async (key) => {
    const res = await fetch(`/api/${key}`)
    return res.json()
  }
)
```

### Reactive Source

```tsx
const [selectedId, setSelectedId] = state(1)

// Refetches when selectedId changes
const [item] = createResource(
  selectedId,
  async (id) => {
    const res = await fetch(`/api/items/${id}`)
    return res.json()
  }
)
```

### With Suspense

```tsx
import { Suspense } from 'flexium/core'

function App() {
  const [data] = createResource(fetchData)

  return (
    <Suspense fallback={<Spinner />}>
      <DataDisplay data={data} />
    </Suspense>
  )
}

function DataDisplay(props) {
  // .read() throws Promise for Suspense
  const data = props.data.read()
  return <div>{data.title}</div>
}
```

## Resource Properties

| Property | Type | Description |
|----------|------|-------------|
| `()` | `T \| undefined` | Current value (reactive) |
| `value` | `T \| undefined` | Current value (reactive) |
| `loading` | `boolean` | True while fetching |
| `error` | `any` | Error if fetch failed |
| `state` | `string` | Current state: `'unresolved'`, `'pending'`, `'ready'`, `'refreshing'`, `'errored'` |
| `latest` | `T \| undefined` | Last successful value |
| `read()` | `T` | For Suspense - throws Promise if pending |

## Actions

| Action | Description |
|--------|-------------|
| `mutate(value)` | Manually update the resource value |
| `refetch()` | Re-run the fetcher |

## Examples

### List with Pagination

```tsx
function PaginatedList() {
  const [page, setPage] = state(1)

  const [items] = createResource(
    page,
    async (pageNum) => {
      const res = await fetch(`/api/items?page=${pageNum}`)
      return res.json()
    }
  )

  return (
    <div>
      <Show when={items.loading}>
        <Spinner />
      </Show>

      <For each={items() ?? []}>
        {(item) => <ItemCard item={item} />}
      </For>

      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
```

### Optimistic Updates

```tsx
function TodoList() {
  const [todos, { mutate, refetch }] = createResource(fetchTodos)

  const addTodo = async (text) => {
    // Optimistic update
    const newTodo = { id: Date.now(), text, completed: false }
    mutate([...todos(), newTodo])

    try {
      await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text })
      })
      refetch() // Get actual server data
    } catch (e) {
      refetch() // Revert on error
    }
  }

  return (
    <div>
      <AddTodoForm onAdd={addTodo} />
      <For each={todos() ?? []}>
        {(todo) => <TodoItem todo={todo} />}
      </For>
    </div>
  )
}
```

### Error Handling

```tsx
function DataWithError() {
  const [data, { refetch }] = createResource(fetchData)

  return (
    <Switch>
      <Match when={data.loading}>
        <Spinner />
      </Match>
      <Match when={data.error}>
        <div class="error">
          <p>Failed to load: {data.error.message}</p>
          <button onClick={refetch}>Retry</button>
        </div>
      </Match>
      <Match when={data()}>
        <DataDisplay data={data()} />
      </Match>
    </Switch>
  )
}
```

### Dependent Resources

```tsx
function UserPosts() {
  const [userId, setUserId] = state(null)

  const [user] = createResource(
    userId,
    (id) => id && fetch(`/api/users/${id}`).then(r => r.json())
  )

  const [posts] = createResource(
    () => user()?.id,
    (id) => id && fetch(`/api/users/${id}/posts`).then(r => r.json())
  )

  return (
    <div>
      <Show when={user()}>
        <h1>{user().name}'s Posts</h1>
      </Show>
      <Show when={!posts.loading}>
        <For each={posts() ?? []}>
          {(post) => <PostCard post={post} />}
        </For>
      </Show>
    </div>
  )
}
```

## State Machine

```
                 ┌─────────────────┐
                 │   unresolved    │ (initial, no fetch yet)
                 └────────┬────────┘
                          │ fetch triggered
                          ▼
                 ┌─────────────────┐
                 │     pending     │ (loading: true)
                 └────────┬────────┘
                     ┌────┴────┐
                success     error
                     ▼         ▼
            ┌────────────┐  ┌─────────┐
            │   ready    │  │ errored │
            └─────┬──────┘  └─────────┘
                  │ refetch()
                  ▼
            ┌─────────────┐
            │ refreshing  │ (loading: true, keeps previous value)
            └─────────────┘
```

## Behavior

- **Auto-tracking**: Fetcher runs when source signal changes
- **Deduplication**: Stale requests are ignored
- **Latest value**: `latest` property holds last successful value during refresh
- **Suspense support**: Use `.read()` to throw for Suspense boundaries

## Notes

- Source can be a signal, function, or static value
- Fetcher receives both source value and metadata
- Use `mutate` for optimistic updates
- `refetch` uses current source value

## See Also

- [Suspense](/docs/core/suspense) - Loading boundaries
- [state()](/docs/core/state) - Reactive state
- [effect()](/docs/core/effect) - Side effects
