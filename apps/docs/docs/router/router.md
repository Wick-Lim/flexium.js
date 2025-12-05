# &lt;Router /&gt;

Root component that enables client-side routing.

## Import

```tsx
import { Router } from 'flexium/router'
```

## Signature

```tsx
<Router>
  {routes}
</Router>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `JSX.Element` | Route definitions |

## Usage

### Basic Setup

```tsx
import { Router, Route } from 'flexium/router'

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
    </Router>
  )
}
```

### With Layout

```tsx
function App() {
  return (
    <Router>
      <Layout>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
      </Layout>
    </Router>
  )
}

function Layout(props) {
  return (
    <div class="app">
      <Header />
      <main>{props.children}</main>
      <Footer />
    </div>
  )
}
```

### Nested Routes

```tsx
<Router>
  <Route path="/" component={Home} />
  <Route path="/users" component={Users}>
    <Route path="/" component={UserList} />
    <Route path="/:id" component={UserDetail} />
    <Route path="/:id/edit" component={UserEdit} />
  </Route>
</Router>
```

### With Navigation

```tsx
import { Router, Route, Link } from 'flexium/router'

function App() {
  return (
    <Router>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>

      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  )
}
```

## Behavior

- Uses **History API** for navigation
- Supports **hash routing** option
- Handles **browser back/forward**
- Provides **route context** to children

## Notes

- Only one Router should be at the root of your app
- Wrap your entire app for global routing
- Combine with Link for navigation

## See Also

- [&lt;Route /&gt;](/docs/router/route)
- [&lt;Link /&gt;](/docs/router/link)
- [useRouter()](/docs/router/use-router)
