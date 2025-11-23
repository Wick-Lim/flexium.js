# Router

Flexium includes a built-in router for building Single Page Applications (SPA).

## Usage

```tsx
import { Router, Route, Link } from 'flexium/router'

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  )
}
```

## Components

### `<Router>`
The root component that provides the routing context. It manages the history and current location.

### `<Route>`
Renders a component when the current location matches the `path` prop.

- `path`: Path pattern to match (e.g., `/users/:id`).
- `component`: Component to render.

### `<Link>`
A navigation component that renders an `<a>` tag and handles navigation without page reloads.

- `to`: Target URL.
- `class`: CSS class.

## Hooks

### `useRouter()`
Returns the router context, including `location`, `params`, and `navigate` function.

```tsx
const router = useRouter()
console.log(router.params.value.id)
router.navigate('/home')
```
