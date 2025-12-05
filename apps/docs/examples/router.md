---
title: Router - Single Page Application
description: Build a complete SPA with Flexium Router featuring nested routes, dynamic parameters, and programmatic navigation.
head:
  - - meta
    - property: og:title
      content: Router Example - Flexium
  - - meta
    - property: og:description
      content: Complete routing example demonstrating Flexium's SPA capabilities.
---

# Router Example

This example demonstrates building a complete Single Page Application with Flexium Router.

## Features Demonstrated

- Basic route definitions with `Router` and `Route`
- Navigation with `Link` component
- Programmatic navigation with `router.navigate()`
- Dynamic URL parameters (`:id`)
- Nested routes with `Outlet`
- Active link styling
- 404 handling

## Complete Code

```tsx
import { render } from 'flexium'
import { Router, Route, Link, Outlet, useRouter } from 'flexium'

// Layout with Navigation
function Layout() {
  const router = useRouter()

  const isActive = (path: string) => {
    return router.location().pathname === path
  }

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/" class={() => isActive('/') ? 'active' : ''}>Home</Link>
          </li>
          <li>
            <Link to="/users" class={() => isActive('/users') ? 'active' : ''}>Users</Link>
          </li>
        </ul>
      </nav>
      <div class="container">
        <Outlet />
      </div>
    </>
  )
}

// Home Page
function HomePage() {
  const router = useRouter()

  return (
    <div>
      <h1>Welcome to Flexium Router</h1>
      <button onclick={() => router.navigate('/users')}>
        Go to Users
      </button>
    </div>
  )
}

// Users List
function UsersPage() {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <Link to={`/users/${user.id}`}>{user.name}</Link>
      ))}
    </div>
  )
}

// User Detail with Dynamic Parameter
function UserDetailPage() {
  const router = useRouter()
  const params = router.params()

  return (
    <div>
      <h1>User #{params.id}</h1>
      <button onclick={() => router.navigate('/users')}>
        Back to Users
      </button>
    </div>
  )
}

// 404 Page
function NotFoundPage() {
  const router = useRouter()

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Path: {() => router.location().pathname}</p>
      <button onclick={() => router.navigate('/')}>Go Home</button>
    </div>
  )
}

// App with Router Configuration
function App() {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route index component={HomePage} />
        <Route path="users" component={() => <Outlet />}>
          <Route index component={UsersPage} />
          <Route path=":id" component={UserDetailPage} />
        </Route>
        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>
  )
}

render(App, document.getElementById('app')!)
```

## Key Concepts

### Route Configuration

Routes are defined using JSX with nested structure:

```tsx
<Router>
  <Route path="/" component={Layout}>
    <Route index component={HomePage} />
    <Route path="users" component={UsersPage} />
    <Route path="users/:id" component={UserDetailPage} />
    <Route path="*" component={NotFoundPage} />
  </Route>
</Router>
```

### useRouter Hook

Access router context for navigation and location info:

```tsx
const router = useRouter()

// Get current location
router.location().pathname  // "/users/123"
router.location().search    // "?tab=profile"
router.location().hash      // "#section"

// Get URL parameters
router.params()  // { id: "123" }

// Navigate programmatically
router.navigate('/users')
router.navigate('/users/123')
```

### Link Component

Create navigation links without page reloads:

```tsx
<Link to="/users">Users</Link>
<Link to={`/users/${user.id}`}>View User</Link>
<Link to="/" class={() => isActive('/') ? 'active' : ''}>Home</Link>
```

### Nested Routes with Outlet

The `Outlet` component renders child routes:

```tsx
function Layout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <Outlet />  {/* Child routes render here */}
      </main>
    </div>
  )
}
```
