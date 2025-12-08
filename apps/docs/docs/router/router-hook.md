# router()

Access router state and navigation functions.

## Import

```tsx
import { router } from 'flexium/router'
```

## Signature

```ts
function router(): RouterContext

interface RouterContext {
  path: Accessor<string>
  params: Accessor<Record<string, string>>
  query: Accessor<Record<string, string>>
  navigate: (path: string, options?: NavigateOptions) => void
  back: () => void
  forward: () => void
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `path` | `Accessor<string>` | Current route path |
| `params` | `Accessor<Record<string, string>>` | Route parameters |
| `query` | `Accessor<Record<string, string>>` | Query string parameters |
| `navigate` | `(path, options?) => void` | Navigate programmatically |
| `back` | `() => void` | Go back in history |
| `forward` | `() => void` | Go forward in history |

## Usage

### Access Current Path

```tsx
function Breadcrumb() {
  const { path } = router()

  return <span>Current: {path()}</span>
}
```

### Access Route Parameters

```tsx
// Route: /users/:id
function UserProfile() {
  const { params } = router()

  return <div>User ID: {params().id}</div>
}
```

### Access Query Parameters

```tsx
// URL: /search?q=hello&sort=date
function SearchPage() {
  const { query } = router()

  return (
    <div>
      <p>Search: {query().q}</p>
      <p>Sort: {query().sort}</p>
    </div>
  )
}
```

### Programmatic Navigation

```tsx
function LoginForm() {
  const { navigate } = router()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(credentials)
    navigate('/dashboard')
  }

  return <form onsubmit={handleSubmit}>...</form>
}
```

### Navigate with Options

```tsx
const { navigate } = router()

// Replace current history entry
navigate('/login', { replace: true })

// With state
navigate('/checkout', { state: { cartId: '123' } })
```

### History Navigation

```tsx
function NavigationControls() {
  const { back, forward } = router()

  return (
    <div>
      <button onclick={back}>← Back</button>
      <button onclick={forward}>Forward →</button>
    </div>
  )
}
```

### Conditional Redirect

```tsx
function ProtectedPage() {
  const { navigate } = router()
  const { user } = context(AuthContext)

  effect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  })

  return user ? <Dashboard /> : null
}
```

### Dynamic Route Updates

```tsx
function Pagination() {
  const { query, navigate, path } = router()

  const goToPage = (page) => {
    navigate(`${path()}?page=${page}`)
  }

  return (
    <div>
      <span>Page {query().page || 1}</span>
      <button onclick={() => goToPage((parseInt(query().page) || 1) + 1)}>
        Next
      </button>
    </div>
  )
}
```

## Behavior

- Returns **reactive accessors** for route state
- `navigate` uses **History API**
- Parameters update **reactively** on route change

## Notes

- Must be used within a `Router` component
- All return values are reactive signals
- Use effects to react to route changes

## Demo

<script setup>
import UseRouterDemo from '../../components/UseRouterDemo.vue'
</script>

<UseRouterDemo />

## See Also

- [&lt;Router /&gt;](/docs/router/router)
- [&lt;Route /&gt;](/docs/router/route)
- [&lt;Link /&gt;](/docs/router/link)
