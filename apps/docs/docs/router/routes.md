---
title: Routes - Client-Side Routing
---

# &lt;Routes /&gt;

Root component that enables client-side routing, handling both context and route matching.

## Import

```tsx
import { Routes, Route } from 'flexium/router'
```

## Signature

```tsx
<Routes>
  <Nav />
  {route definitions}
</Routes>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `JSX.Element \| Route[]` | App content and route definitions |

## Usage

### Basic Setup

```tsx
import { Routes, Route } from 'flexium/router'

function App() {
  return (
    <Routes>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
    </Routes>
  )
}
```

### With Navigation

```tsx
import { Routes, Route, Link } from 'flexium/router'

function App() {
  return (
    <Routes>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Routes>
  )
}
```

### With Layout

```tsx
function App() {
  return (
    <Routes>
      <Header />
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Footer />
    </Routes>
  )
}
```

### Nested Routes

```tsx
<Routes>
  <Route path="/" component={Home} />
  <Route path="/users" component={Users}>
    <Route path="/" component={UserList} />
    <Route path="/:id" component={UserDetail} />
    <Route path="/:id/edit" component={UserEdit} />
  </Route>
</Routes>
```

## Behavior

- Uses **History API** for navigation
- Handles **browser back/forward**
- Provides **route context** to all children
- Non-Route children (like Nav) are rendered alongside matched routes

## Notes

- Only one Routes component should be at the root of your app
- All children have access to router context via `router()` hook
- Combine with Link for navigation
- Route and non-Route children can be mixed freely

## Demo

<script setup>
import RouterDemo from '../../components/RouterDemo.vue'
</script>

<RouterDemo />

## See Also

- [&lt;Route /&gt;](/docs/router/route) - Define route patterns
- [&lt;Link /&gt;](/docs/router/link) - Navigate between routes
- [&lt;Outlet /&gt;](/docs/router/outlet) - Render nested routes
- [router()](/docs/router/router) - Access router context
