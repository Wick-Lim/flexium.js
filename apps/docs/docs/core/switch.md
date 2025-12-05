---
title: Switch & Match - Multi-Condition Rendering
---

# &lt;Switch /&gt; & &lt;Match /&gt;

Render content based on multiple conditions, similar to switch/case.

## Import

```tsx
import { Switch, Match } from 'flexium/core'
```

## Signature

```tsx
<Switch fallback={fallbackElement}>
  <Match when={condition1}>
    {content1}
  </Match>
  <Match when={condition2}>
    {content2}
  </Match>
</Switch>
```

## Props

### Switch

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `JSX.Element` | Content when no Match conditions are true |
| `children` | `Match[]` | Match components to evaluate |

### Match

| Prop | Type | Description |
|------|------|-------------|
| `when` | `boolean \| Accessor<boolean>` | Condition for this case |
| `children` | `JSX.Element` | Content to render when condition is true |

## Usage

### Basic Usage

```tsx
const [status, setStatus] = state('loading')

<Switch fallback={<p>Unknown status</p>}>
  <Match when={() => status() === 'loading'}>
    <LoadingSpinner />
  </Match>
  <Match when={() => status() === 'success'}>
    <SuccessMessage />
  </Match>
  <Match when={() => status() === 'error'}>
    <ErrorMessage />
  </Match>
</Switch>
```

### User Roles

```tsx
const [role, setRole] = state('guest')

<Switch fallback={<GuestView />}>
  <Match when={() => role() === 'admin'}>
    <AdminDashboard />
  </Match>
  <Match when={() => role() === 'moderator'}>
    <ModeratorPanel />
  </Match>
  <Match when={() => role() === 'user'}>
    <UserProfile />
  </Match>
</Switch>
```

### Request States

```tsx
const [request, setRequest] = state({ status: 'idle', data: null, error: null })

<Switch>
  <Match when={() => request().status === 'idle'}>
    <button onclick={fetchData}>Load Data</button>
  </Match>
  <Match when={() => request().status === 'loading'}>
    <Spinner />
  </Match>
  <Match when={() => request().status === 'success'}>
    <DataDisplay data={request().data} />
  </Match>
  <Match when={() => request().status === 'error'}>
    <ErrorDisplay error={request().error} />
  </Match>
</Switch>
```

### View Modes

```tsx
const [view, setView] = state('grid')

<div>
  <button onclick={() => setView('grid')}>Grid</button>
  <button onclick={() => setView('list')}>List</button>
  <button onclick={() => setView('table')}>Table</button>

  <Switch>
    <Match when={() => view() === 'grid'}>
      <GridView items={items()} />
    </Match>
    <Match when={() => view() === 'list'}>
      <ListView items={items()} />
    </Match>
    <Match when={() => view() === 'table'}>
      <TableView items={items()} />
    </Match>
  </Switch>
</div>
```

## Behavior

- **First matching** `Match` is rendered
- Other matches are **not evaluated** after a match is found
- `fallback` renders when **no conditions** match
- Conditions are evaluated **in order**

## Notes

- Use `Switch/Match` instead of nested `Show` components
- All `when` props should be mutually exclusive for predictable behavior
- Supports reactive accessors for dynamic switching

## See Also

- [&lt;Show /&gt;](/docs/core/show)
- [&lt;For /&gt;](/docs/core/for)
