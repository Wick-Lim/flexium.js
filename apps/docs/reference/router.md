---
title: Router - API Reference
description: Complete API reference for Flexium's Router. Components, hooks, and utilities for client-side routing.
head:
  - - meta
    - property: og:title
      content: Router API Reference - Flexium
  - - meta
    - property: og:description
      content: Router, Route, Link, Outlet components and hooks for building Single Page Applications with Flexium.
---

# Router

Complete API reference for Flexium's built-in router for Single Page Applications.

## Components

### Router

The root routing component that provides routing context to the application. It manages browser history, location state, and route matching.

#### Usage

```tsx
import { Router, Route } from 'flexium/router';

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `VNodeChild` | - | Route definitions and other content. |

#### Behavior

- Automatically listens to browser history changes (back/forward buttons)
- Parses route configurations from child `<Route>` components
- Provides routing context (`location`, `params`, `navigate`, `matches`) to descendants
- Renders the matched route component or nothing if no route matches
- Supports route guards via `beforeEnter` on routes

---

### Route

A route configuration component that defines a path pattern and the component to render when matched.

#### Usage

```tsx
import { Router, Route } from 'flexium/router';

function App() {
  return (
    <Router>
      {/* Basic route */}
      <Route path="/" component={Home} />

      {/* Route with dynamic parameter */}
      <Route path="/users/:id" component={UserProfile} />

      {/* Nested routes */}
      <Route path="/dashboard" component={DashboardLayout}>
        <Route path="/dashboard" index component={DashboardHome} />
        <Route path="/dashboard/settings" component={Settings} />
      </Route>

      {/* Route with guard */}
      <Route
        path="/admin"
        component={Admin}
        beforeEnter={(params) => {
          // Return false to prevent navigation
          return checkAuth();
        }}
      />
    </Router>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | `string` | `''` | Path pattern to match. Supports dynamic segments with `:param` syntax. |
| `component` | `Function` | - | **Required.** Component to render when route matches. |
| `index` | `boolean` | `false` | Whether this is an index route (renders at parent's exact path). |
| `children` | `VNodeChild` | - | Nested route definitions for creating route hierarchies. |
| `beforeEnter` | `(params: Record<string, string>) => boolean \| Promise<boolean>` | - | Navigation guard. Return `false` to prevent route from rendering. |

#### Path Patterns

Routes support dynamic path segments using the `:paramName` syntax:

- `/users` - Static path
- `/users/:id` - Dynamic segment (matches `/users/123`, `/users/abc`, etc.)
- `/users/:userId/posts/:postId` - Multiple dynamic segments
- `/` - Root path

#### Index Routes

Index routes render when the parent route's path is matched exactly:

```tsx
<Route path="/dashboard" component={DashboardLayout}>
  {/* This renders at /dashboard */}
  <Route index component={DashboardHome} />

  {/* This renders at /dashboard/settings */}
  <Route path="/dashboard/settings" component={Settings} />
</Route>
```

#### Route Guards

The `beforeEnter` function allows you to control access to routes:

```tsx
<Route
  path="/admin"
  component={AdminPanel}
  beforeEnter={(params) => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  }}
/>
```

---

### Link

A navigation component that renders an anchor tag and handles client-side navigation without page reloads.

#### Usage

```tsx
import { Link } from 'flexium/router';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about" class="nav-link">About</Link>
      <Link to="/users/123">User Profile</Link>
    </nav>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `to` | `string` | - | **Required.** Target path to navigate to. |
| `class` | `string` | - | CSS class name for the link. |
| `children` | `VNodeChild` | - | Link content. |

#### Behavior

- Renders an `<a>` tag with the `to` prop as the `href` attribute
- Intercepts click events to prevent default browser navigation
- Uses `router.navigate()` for client-side navigation
- Preserves browser history (back/forward buttons work correctly)

---

### Outlet

Renders child route content in nested routing scenarios. Used in layout components to define where child routes should appear.

#### Usage

```tsx
import { Outlet } from 'flexium/router';

function DashboardLayout() {
  return (
    <div>
      <header>Dashboard Header</header>
      <nav>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>

      {/* Child routes render here */}
      <main>
        <Outlet />
      </main>

      <footer>Dashboard Footer</footer>
    </div>
  );
}

// Route configuration
<Router>
  <Route path="/dashboard" component={DashboardLayout}>
    <Route index component={DashboardHome} />
    <Route path="/dashboard/settings" component={Settings} />
  </Route>
</Router>
```

#### Props

`Outlet` has no props.

#### Behavior

- Renders the component of the next matched route in the route hierarchy
- Maintains route depth internally using context
- Returns `null` if no child route matches
- Respects `beforeEnter` guards on child routes
- Can be nested multiple levels deep for complex route hierarchies

---

## Hooks

### useRouter

Returns the complete router context, providing access to location, params, navigation, and route matches.

#### Usage

```tsx
import { useRouter } from 'flexium/router';

function UserProfile() {
  const router = useRouter();

  // Access current location
  const location = router.location();
  console.log(location.pathname); // "/users/123"
  console.log(location.search);   // "?tab=posts"
  console.log(location.hash);     // "#comments"
  console.log(location.query);    // { tab: "posts" }

  // Access route parameters
  const params = router.params();
  console.log(params.id); // "123"

  // Navigate programmatically
  const handleClick = () => {
    router.navigate('/dashboard');
  };

  // Access route matches
  const matches = router.matches();
  console.log(matches.length); // Number of matched routes

  return (
    <div>
      <h1>User {params.id}</h1>
      <button onclick={handleClick}>Go to Dashboard</button>
    </div>
  );
}
```

#### Return Value

Returns a `RouterContext` object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `location` | `Signal<Location>` | Reactive signal containing current location information. |
| `params` | `Computed<Record<string, string>>` | Reactive computed signal containing route parameters from the current match. |
| `navigate` | `(path: string) => void` | Function to navigate to a new path. |
| `matches` | `Computed<RouteMatch[]>` | Reactive computed signal containing all matched routes (from root to leaf). |

#### Location Object

The `location` signal contains:

```tsx
interface Location {
  pathname: string;              // "/users/123"
  search: string;                // "?tab=posts"
  hash: string;                  // "#comments"
  query: Record<string, string>; // { tab: "posts" }
}
```

#### Route Match Object

Each item in the `matches` array contains:

```tsx
interface RouteMatch {
  route: RouteDef;               // Internal route definition
  params: Record<string, string>; // Extracted parameters
  pathname: string;              // Matched portion of the URL
}
```

#### Error Handling

Throws an error if used outside of a `<Router>` component:

```
Error: useRouter must be used within a <Router> component
```

---

## Utilities

### matchRoutes

Matches a URL pathname against a route configuration tree and returns the matched route hierarchy.

#### Usage

```tsx
import { matchRoutes } from 'flexium/router';

const routes = [
  {
    path: '/users',
    component: UsersLayout,
    children: [
      { path: '/users/:id', component: UserProfile, children: [] }
    ]
  }
];

const matches = matchRoutes(routes, '/users/123');
// Returns: [
//   { route: UsersLayout, params: {}, pathname: '/users' },
//   { route: UserProfile, params: { id: '123' }, pathname: '/users/123' }
// ]
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `routes` | `RouteDef[]` | Array of route definitions to match against. |
| `location` | `string` | URL pathname to match (e.g., `/users/123`). |

#### Return Value

Returns `RouteMatch[] | null`:
- An array of `RouteMatch` objects (from root to leaf) if a route matches
- `null` if no route matches the location

---

### createRoutesFromChildren

Parses VNode children into a route configuration tree. Used internally by the `<Router>` component.

#### Usage

```tsx
import { createRoutesFromChildren } from 'flexium/router';

const routes = createRoutesFromChildren(children);
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `children` | `VNodeChild` | VNode children representing `<Route>` components. |

#### Return Value

Returns `RouteDef[]` - an array of route definitions extracted from the VNode tree.

---

### createLocation

Creates a reactive location signal and navigation function. Used internally by the `<Router>` component.

#### Usage

```tsx
import { createLocation } from 'flexium/router';

const [location, navigate] = createLocation();

// Access current location
console.log(location().pathname);

// Navigate to new path
navigate('/about');
```

#### Return Value

Returns a tuple `[Signal<Location>, (path: string) => void]`:
- `location` - Reactive signal that updates when the URL changes
- `navigate` - Function to navigate to a new path

#### Behavior

- Automatically updates when browser back/forward buttons are used
- Parses query parameters from the URL search string
- Updates browser history using `pushState`

---

### matchPath

Matches a pathname against a single route pattern and extracts parameters.

#### Usage

```tsx
import { matchPath } from 'flexium/router';

const result = matchPath('/users/123', '/users/:id');
// Returns: { matches: true, params: { id: '123' } }

const noMatch = matchPath('/posts/456', '/users/:id');
// Returns: { matches: false, params: {} }
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `pathname` | `string` | Current URL pathname (e.g., `/users/123`). |
| `routePath` | `string` | Route pattern to match (e.g., `/users/:id`). |

#### Return Value

Returns an object with:

```tsx
{
  matches: boolean;              // Whether the path matches
  params: Record<string, string>; // Extracted parameters
}
```

---

## Advanced Patterns

### Nested Routing

Create complex layouts with nested routes using `<Outlet>`:

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={RootLayout}>
        <Route index component={Home} />

        <Route path="/dashboard" component={DashboardLayout}>
          <Route index component={DashboardHome} />
          <Route path="/dashboard/profile" component={Profile} />
          <Route path="/dashboard/settings" component={Settings} />
        </Route>

        <Route path="/users/:id" component={UserProfile} />
      </Route>
    </Router>
  );
}

function RootLayout() {
  return (
    <div>
      <header>App Header</header>
      <Outlet /> {/* Renders Dashboard or Users */}
      <footer>App Footer</footer>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div>
      <aside>Dashboard Sidebar</aside>
      <main>
        <Outlet /> {/* Renders DashboardHome, Profile, or Settings */}
      </main>
    </div>
  );
}
```

### Programmatic Navigation

Navigate using the `navigate` function from `useRouter()`:

```tsx
import { useRouter } from 'flexium/router';

function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (credentials) => {
    const success = await login(credentials);
    if (success) {
      // Navigate to dashboard after login
      router.navigate('/dashboard');
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Navigation Guards

Protect routes with `beforeEnter` guards:

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      {/* Protected route */}
      <Route
        path="/admin"
        component={AdminPanel}
        beforeEnter={(params) => {
          const user = getCurrentUser();
          if (!user || !user.isAdmin) {
            // Redirect to login
            router.navigate('/login');
            return false;
          }
          return true;
        }}
      />
    </Router>
  );
}
```

### Accessing Route Parameters

Access dynamic route parameters using `useRouter()`:

```tsx
import { useRouter } from 'flexium/router';

function UserProfile() {
  const router = useRouter();
  const params = router.params();

  // If route is /users/:id, params.id contains the value
  const userId = params.id;

  return (
    <div>
      <h1>User Profile: {userId}</h1>
    </div>
  );
}

// Route configuration
<Route path="/users/:id" component={UserProfile} />
```

### Accessing Query Parameters

Access URL query parameters from the location object:

```tsx
import { useRouter } from 'flexium/router';

function SearchResults() {
  const router = useRouter();
  const location = router.location();

  // If URL is /search?q=flexium&sort=date
  const searchQuery = location.query.q;    // "flexium"
  const sortBy = location.query.sort;      // "date"

  return (
    <div>
      <h1>Search Results for: {searchQuery}</h1>
      <p>Sorted by: {sortBy}</p>
    </div>
  );
}
```

### 404 Not Found Routes

Handle unmatched routes by using a wildcard path pattern:

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />

      {/* Catch-all route for 404 */}
      <Route path="*" component={NotFound} />
    </Router>
  );
}

function NotFound() {
  const router = useRouter();
  const location = router.location();

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page {location.pathname} does not exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}
```

---

## Type Definitions

### Location

```tsx
interface Location {
  pathname: string;              // Current path (e.g., "/users/123")
  search: string;                // Query string (e.g., "?tab=posts")
  hash: string;                  // URL hash (e.g., "#comments")
  query: Record<string, string>; // Parsed query params
}
```

### RouterContext

```tsx
interface RouterContext {
  location: Signal<Location> | Computed<Location>;
  params: Signal<Record<string, string>> | Computed<Record<string, string>>;
  navigate: (path: string) => void;
  matches: Signal<RouteMatch[]> | Computed<RouteMatch[]>;
}
```

### RouteProps

```tsx
interface RouteProps {
  path?: string;
  index?: boolean;
  component: Function;
  children?: VNodeChild;
  beforeEnter?: (params: Record<string, string>) => boolean | Promise<boolean>;
}
```

### LinkProps

```tsx
interface LinkProps {
  to: string;
  class?: string;
  children?: VNodeChild;
}
```

### RouteMatch

```tsx
interface RouteMatch {
  route: RouteDef;
  params: Record<string, string>;
  pathname: string;
}
```

### RouteDef

```tsx
interface RouteDef {
  path: string;
  index: boolean;
  component: Function;
  children: RouteDef[];
  beforeEnter?: (params: Record<string, string>) => boolean | Promise<boolean>;
}
```

---

## Examples

### Basic Single Page App

```tsx
import { Router, Route, Link } from 'flexium/router';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
    </Router>
  );
}
```

### Blog with Dynamic Routes

```tsx
import { Router, Route, Link, useRouter } from 'flexium/router';

function App() {
  return (
    <Router>
      <Route path="/" component={BlogLayout}>
        <Route index component={PostList} />
        <Route path="/posts/:slug" component={PostDetail} />
        <Route path="/categories/:category" component={CategoryPosts} />
      </Route>
    </Router>
  );
}

function PostDetail() {
  const router = useRouter();
  const params = router.params();

  return <h1>Post: {params.slug}</h1>;
}
```

### Dashboard with Nested Routes

```tsx
import { Router, Route, Outlet, Link } from 'flexium/router';

function App() {
  return (
    <Router>
      <Route path="/dashboard" component={DashboardLayout}>
        <Route index component={Overview} />
        <Route path="/dashboard/analytics" component={Analytics} />
        <Route path="/dashboard/users" component={UserManagement} />
        <Route path="/dashboard/settings" component={Settings} />
      </Route>
    </Router>
  );
}

function DashboardLayout() {
  return (
    <div class="dashboard">
      <nav>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/analytics">Analytics</Link>
        <Link to="/dashboard/users">Users</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

---

## See Also

- [Router Guide](/guide/router) - Introduction to routing in Flexium
- [State Management](/guide/state) - Managing application state
- [Context](/guide/context) - Sharing data with Context
