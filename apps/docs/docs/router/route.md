---
title: Route - Route Definition
---

# &lt;Route /&gt;

Define a route that renders a component when the path matches.

## Import

```tsx
import { Route } from 'flexium/router'
```

## Signature

```tsx
<Route path={pattern} component={Component} />
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `path` | `string` | URL pattern to match |
| `component` | `Component` | Component to render when matched |
| `children` | `Route[]` | Nested route definitions |

## Path Patterns

### Static Paths

```tsx
<Route path="/" component={Home} />
<Route path="/about" component={About} />
<Route path="/contact" component={Contact} />
```

### Dynamic Parameters

```tsx
<Route path="/users/:id" component={UserProfile} />
<Route path="/posts/:slug" component={PostDetail} />
<Route path="/products/:category/:id" component={Product} />
```

### Catch-All

```tsx
<Route path="*" component={NotFound} />
<Route path="/docs/*" component={DocsPage} />
```

## Usage

### Basic Routes

```tsx
<Router>
  <Route path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="*" component={NotFound} />
</Router>
```

### Accessing Parameters

```tsx
import { useRouter } from 'flexium/router'

function UserProfile() {
  const { params } = useRouter()

  return <div>User ID: {params().id}</div>
}

// Route definition
<Route path="/users/:id" component={UserProfile} />
```

### Nested Routes

```tsx
<Route path="/dashboard" component={Dashboard}>
  <Route path="/" component={DashboardHome} />
  <Route path="/settings" component={Settings} />
  <Route path="/profile" component={Profile} />
</Route>
```

### Protected Routes

```tsx
function ProtectedRoute(props) {
  const { user } = useContext(AuthContext)

  return (
    <Show when={() => user() !== null} fallback={<Navigate to="/login" />}>
      {props.children}
    </Show>
  )
}

<Route path="/admin" component={() => (
  <ProtectedRoute>
    <AdminPanel />
  </ProtectedRoute>
)} />
```

### Route with Query Params

```tsx
function SearchPage() {
  const { query } = useRouter()

  return (
    <div>
      Search: {query().q}
      Page: {query().page || 1}
    </div>
  )
}

// URL: /search?q=hello&page=2
<Route path="/search" component={SearchPage} />
```

## Behavior

- Routes are matched **in order**
- First matching route **wins**
- Supports **exact** and **prefix** matching
- Parameters are **extracted** and available via `useRouter`

## Notes

- Place more specific routes before general ones
- Use `*` for catch-all routes at the end
- Nested routes inherit parent path prefix

## See Also

- [&lt;Router /&gt;](/docs/router/router)
- [&lt;Link /&gt;](/docs/router/link)
- [useRouter()](/docs/router/use-router)
