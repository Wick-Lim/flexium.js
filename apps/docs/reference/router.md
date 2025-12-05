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

#### Deep Nesting

Routes can be nested to any depth:

```tsx
<Router>
  <Route path="/" component={RootLayout}>
    <Route path="/admin" component={AdminLayout}>
      <Route path="/admin/users" component={UsersLayout}>
        <Route index component={UsersList} />
        <Route path="/admin/users/:id" component={UserDetailLayout}>
          <Route index component={UserProfile} />
          <Route path="/admin/users/:id/edit" component={EditUser} />
          <Route path="/admin/users/:id/permissions" component={UserPermissions} />
        </Route>
      </Route>
    </Route>
  </Route>
</Router>
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

#### Navigation with Query Parameters

Pass data through query parameters:

```tsx
function SearchForm() {
  const router = useRouter();

  const handleSearch = (query: string, filters: object) => {
    const params = new URLSearchParams({
      q: query,
      category: filters.category,
      sort: filters.sort
    });
    router.navigate(`/search?${params.toString()}`);
  };

  return <form onsubmit={handleSearch}>{/* form */}</form>;
}
```

#### Conditional Navigation

Navigate based on conditions:

```tsx
function FormSubmit() {
  const router = useRouter();

  const handleSubmit = async (data) => {
    const result = await submitData(data);

    if (result.success) {
      router.navigate(`/success?id=${result.id}`);
    } else if (result.requiresAuth) {
      router.navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
    } else {
      router.navigate('/error');
    }
  };

  return <form onsubmit={handleSubmit}>{/* form */}</form>;
}
```

### Route Guards & Authentication

Protect routes with `beforeEnter` guards. Guards run before the route renders and can prevent navigation by returning `false`.

#### Basic Authentication Guard

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
            window.location.href = '/login';
            return false;
          }
          return true;
        }}
      />
    </Router>
  );
}
```

#### Async Guards

Guards can be asynchronous for API calls or token validation:

```tsx
<Route
  path="/premium"
  component={PremiumContent}
  beforeEnter={async (params) => {
    try {
      const subscription = await checkSubscription();
      return subscription.active;
    } catch (error) {
      return false;
    }
  }}
/>
```

#### Parameter-Based Guards

Use route parameters in guard logic:

```tsx
<Route
  path="/users/:id/edit"
  component={EditUser}
  beforeEnter={(params) => {
    const currentUser = getCurrentUser();
    const targetUserId = params.id;

    // Users can only edit their own profile (unless admin)
    return currentUser.id === targetUserId || currentUser.isAdmin;
  }}
/>
```

#### Role-Based Authorization

Check user roles and permissions:

```tsx
function createRoleGuard(requiredRole: string) {
  return (params: Record<string, string>) => {
    const user = getCurrentUser();

    if (!user) {
      window.location.href = '/login';
      return false;
    }

    if (!user.roles.includes(requiredRole)) {
      window.location.href = '/unauthorized';
      return false;
    }

    return true;
  };
}

// Usage
<Route
  path="/admin"
  component={AdminPanel}
  beforeEnter={createRoleGuard('admin')}
/>

<Route
  path="/moderator"
  component={ModeratorPanel}
  beforeEnter={createRoleGuard('moderator')}
/>
```

#### Multiple Guard Conditions

Combine multiple checks in a single guard:

```tsx
<Route
  path="/workspace/:id"
  component={Workspace}
  beforeEnter={async (params) => {
    const user = getCurrentUser();
    const workspaceId = params.id;

    // Check authentication
    if (!user) {
      window.location.href = '/login';
      return false;
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId);
    if (!hasAccess) {
      window.location.href = '/workspaces';
      return false;
    }

    // Check subscription status
    const subscription = await getSubscription(user.id);
    if (!subscription.active) {
      window.location.href = '/pricing';
      return false;
    }

    return true;
  }}
/>
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

### Query Parameters

Access and manipulate URL query parameters using the location object.

#### Reading Query Parameters

```tsx
import { useRouter } from 'flexium/router';

function SearchResults() {
  const router = useRouter();
  const location = router.location();

  // If URL is /search?q=flexium&sort=date&page=2
  const searchQuery = location.query.q;     // "flexium"
  const sortBy = location.query.sort;       // "date"
  const page = location.query.page;         // "2"

  return (
    <div>
      <h1>Search Results for: {searchQuery}</h1>
      <p>Sorted by: {sortBy}, Page: {page}</p>
    </div>
  );
}
```

#### Reactive Query Parameters

Query parameters are reactive and will trigger component re-renders:

```tsx
function ProductList() {
  const router = useRouter();
  const location = router.location();

  // This will re-run whenever query params change
  const category = location.query.category || 'all';
  const priceRange = location.query.price || 'any';

  return (
    <div>
      <h2>Category: {category}</h2>
      <p>Price: {priceRange}</p>

      {/* Links update query params */}
      <nav>
        <Link to="/products?category=electronics">Electronics</Link>
        <Link to="/products?category=books">Books</Link>
        <Link to="/products?category=clothing&price=under50">
          Clothing Under $50
        </Link>
      </nav>
    </div>
  );
}
```

#### Setting Query Parameters

Update query parameters via navigation:

```tsx
function FilterBar() {
  const router = useRouter();
  const location = router.location();

  const updateFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    router.navigate(`${location.pathname}?${params.toString()}`);
  };

  const applyFilter = () => {
    updateFilters({
      category: 'electronics',
      price: '100-500',
      brand: 'apple',
      sort: 'price-asc'
    });
  };

  return <button onclick={applyFilter}>Apply Filters</button>;
}
```

#### Preserving Existing Query Parameters

Merge new params with existing ones:

```tsx
function Pagination() {
  const router = useRouter();
  const location = router.location();

  const goToPage = (page: number) => {
    // Preserve existing query params
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    router.navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <div>
      <button onclick={() => goToPage(1)}>Page 1</button>
      <button onclick={() => goToPage(2)}>Page 2</button>
      <button onclick={() => goToPage(3)}>Page 3</button>
    </div>
  );
}
```

#### Query Parameter Validation

Validate and provide defaults for query parameters:

```tsx
function DataTable() {
  const router = useRouter();
  const location = router.location();

  const getValidatedParams = () => {
    const query = location.query;

    // Validate and provide defaults
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = [10, 25, 50, 100].includes(parseInt(query.limit || '25', 10))
      ? parseInt(query.limit, 10)
      : 25;
    const sort = ['asc', 'desc'].includes(query.sort)
      ? query.sort
      : 'asc';

    return { page, limit, sort };
  };

  const params = getValidatedParams();

  return (
    <div>
      <p>Page: {params.page}</p>
      <p>Items per page: {params.limit}</p>
      <p>Sort: {params.sort}</p>
    </div>
  );
}
```

### 404 Not Found Handling

Handle unmatched routes by using a wildcard path pattern.

#### Basic 404 Page

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

#### Enhanced 404 with Suggestions

Provide helpful links when a page isn't found:

```tsx
function NotFound() {
  const router = useRouter();
  const location = router.location();

  const suggestions = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/products', label: 'Browse Products', icon: '🛍️' },
    { path: '/about', label: 'About Us', icon: 'ℹ️' },
    { path: '/contact', label: 'Contact Support', icon: '📧' }
  ];

  // Log 404 for analytics
  useEffect(() => {
    logPageNotFound(location.pathname);
  });

  return (
    <div class="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>We couldn't find: <code>{location.pathname}</code></p>

      <h2>Try one of these pages instead:</h2>
      <ul class="suggestions">
        {suggestions.map(item => (
          <li>
            <Link to={item.path}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <button onclick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );
}
```

#### Nested 404 Handling

Handle 404s at different levels of your route hierarchy:

```tsx
<Router>
  <Route path="/" component={RootLayout}>
    <Route index component={Home} />

    <Route path="/admin" component={AdminLayout}>
      <Route index component={AdminDash} />
      <Route path="/admin/users" component={Users} />
      <Route path="/admin/settings" component={Settings} />

      {/* Admin-specific 404 */}
      <Route path="/admin/*" component={AdminNotFound} />
    </Route>

    <Route path="/docs" component={DocsLayout}>
      <Route index component={DocsHome} />
      <Route path="/docs/:page" component={DocPage} />

      {/* Docs-specific 404 */}
      <Route path="/docs/*" component={DocsNotFound} />
    </Route>

    {/* Global 404 - must be last */}
    <Route path="*" component={NotFound} />
  </Route>
</Router>
```

#### Smart 404 with Search

Suggest similar pages based on the requested URL:

```tsx
function SmartNotFound() {
  const router = useRouter();
  const location = router.location();

  const availablePages = [
    '/products',
    '/product/laptop',
    '/product/phone',
    '/about',
    '/contact'
  ];

  // Find similar routes
  const suggestions = availablePages
    .filter(page => {
      const similarity = computeSimilarity(location.pathname, page);
      return similarity > 0.5;
    })
    .slice(0, 3);

  return (
    <div>
      <h1>404 - Page Not Found</h1>

      {suggestions.length > 0 && (
        <>
          <h2>Did you mean?</h2>
          <ul>
            {suggestions.map(path => (
              <li><Link to={path}>{path}</Link></li>
            ))}
          </ul>
        </>
      )}

      <Link to="/">Return Home</Link>
    </div>
  );
}
```

### Route Transitions

Create smooth animations when navigating between routes.

#### Basic Fade Transition

```tsx
import { signal, useEffect } from 'flexium';
import { useRouter } from 'flexium/router';

function TransitionWrapper({ children }) {
  const router = useRouter();
  const location = router.location();
  const isTransitioning = signal(false);

  useEffect(() => {
    // Trigger transition on location change
    isTransitioning.value = true;

    const timeout = setTimeout(() => {
      isTransitioning.value = false;
    }, 300);

    return () => clearTimeout(timeout);
  });

  return (
    <div
      class={() => isTransitioning.value ? 'fade-out' : 'fade-in'}
      style={{
        opacity: isTransitioning.value ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}

// Usage
function App() {
  return (
    <Router>
      <TransitionWrapper>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
      </TransitionWrapper>
    </Router>
  );
}
```

#### Slide Transition

```tsx
function SlideTransition({ children }) {
  const router = useRouter();
  const location = router.location();
  const isAnimating = signal(false);
  const direction = signal<'left' | 'right'>('right');

  useEffect(() => {
    isAnimating.value = true;

    setTimeout(() => {
      isAnimating.value = false;
    }, 400);
  });

  return (
    <div
      class="slide-container"
      style={{
        transform: isAnimating.value
          ? `translateX(${direction.value === 'right' ? '100%' : '-100%'})`
          : 'translateX(0)',
        opacity: isAnimating.value ? 0 : 1,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
}
```

#### Page Load Animation

```tsx
function PageTransition({ children }) {
  const router = useRouter();
  const location = router.location();
  const isLoading = signal(true);

  useEffect(() => {
    isLoading.value = true;

    // Simulate page load
    const timeout = setTimeout(() => {
      isLoading.value = false;
    }, 150);

    return () => clearTimeout(timeout);
  });

  return (
    <>
      {isLoading.value && (
        <div class="page-loader">
          <div class="spinner" />
        </div>
      )}

      <div
        class="page-content"
        style={{
          opacity: isLoading.value ? 0 : 1,
          transform: isLoading.value ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 0.2s, transform 0.2s'
        }}
      >
        {children}
      </div>
    </>
  );
}
```

#### Route-Specific Transitions

Apply different transitions based on routes:

```tsx
function RouteTransition({ children }) {
  const router = useRouter();
  const location = router.location();
  const previousPath = signal('');

  const getTransitionType = () => {
    const current = location.pathname;
    const previous = previousPath.value;

    // Different transitions for different route patterns
    if (current.startsWith('/admin')) return 'slide-left';
    if (previous.startsWith('/admin') && !current.startsWith('/admin')) return 'slide-right';
    if (current.includes('/detail')) return 'fade-up';

    return 'fade';
  };

  useEffect(() => {
    previousPath.value = location.pathname;
  });

  const transitionClass = getTransitionType();

  return (
    <div class={`transition-${transitionClass}`}>
      {children}
    </div>
  );
}
```

### Routing Modes

Flexium's router uses the browser's History API by default for clean URLs.

#### History Mode (Default)

The router uses `pushState` for navigation, creating clean URLs without hash symbols:

```
https://example.com/
https://example.com/about
https://example.com/users/123
https://example.com/products?category=electronics
```

This mode provides the best user experience and SEO benefits.

**Key Features:**
- Clean URLs without `#` symbols
- Browser back/forward buttons work correctly
- URLs are shareable and bookmarkable
- Requires server configuration for direct URL access

#### Server Configuration

For single-page applications, configure your server to serve `index.html` for all routes:

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify (_redirects):**
```
/*    /index.html   200
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Express.js:**
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
```

#### Development Server

When developing locally, ensure your dev server is configured for SPA mode:

**Vite (vite.config.js):**
```javascript
export default {
  // SPA fallback is enabled by default
  server: {
    historyApiFallback: true
  }
}
```

**Webpack DevServer:**
```javascript
module.exports = {
  devServer: {
    historyApiFallback: true
  }
}
```

#### Handling Base Path

If your app is deployed to a subdirectory:

```tsx
// Prepend base path to all routes
const basePath = '/my-app';

function App() {
  return (
    <Router>
      <Route path={`${basePath}/`} component={Home} />
      <Route path={`${basePath}/about`} component={About} />
    </Router>
  );
}

// Update navigation
<Link to={`${basePath}/about`}>About</Link>
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

## Best Practices

### Route Organization

Organize routes hierarchically for maintainability:

```tsx
// Good: Hierarchical organization
<Router>
  <Route path="/" component={RootLayout}>
    <Route index component={Home} />

    {/* User-related routes */}
    <Route path="/users" component={UsersLayout}>
      <Route index component={UsersList} />
      <Route path="/users/:id" component={UserProfile} />
      <Route path="/users/:id/edit" component={EditUser} />
    </Route>

    {/* Admin routes */}
    <Route path="/admin" component={AdminLayout} beforeEnter={checkAdmin}>
      <Route index component={AdminDash} />
      <Route path="/admin/settings" component={AdminSettings} />
    </Route>
  </Route>
</Router>
```

### Loading States

Show loading indicators during navigation:

```tsx
function App() {
  const isLoading = signal(false);

  return (
    <Router>
      {isLoading.value && <LoadingBar />}

      <Route
        path="/data/:id"
        component={DataPage}
        beforeEnter={async (params) => {
          isLoading.value = true;
          try {
            await preloadData(params.id);
            return true;
          } finally {
            isLoading.value = false;
          }
        }}
      />
    </Router>
  );
}
```

### Error Boundaries

Wrap routes in error boundaries:

```tsx
function RouteErrorBoundary({ children }) {
  const hasError = signal(false);
  const error = signal<Error | null>(null);

  try {
    return children;
  } catch (e) {
    hasError.value = true;
    error.value = e as Error;
    return (
      <div class="error-page">
        <h1>Something went wrong</h1>
        <p>{error.value?.message}</p>
        <Link to="/">Go Home</Link>
      </div>
    );
  }
}
```

### Breadcrumbs

Create breadcrumb navigation using route matches:

```tsx
function Breadcrumbs() {
  const router = useRouter();
  const matches = router.matches();

  const breadcrumbs = matches.map((match, index) => ({
    path: match.pathname,
    label: getBreadcrumbLabel(match.route.path, match.params),
    isLast: index === matches.length - 1
  }));

  return (
    <nav class="breadcrumbs">
      {breadcrumbs.map((crumb, index) => (
        <>
          {!crumb.isLast ? (
            <Link to={crumb.path}>{crumb.label}</Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          {!crumb.isLast && <span> / </span>}
        </>
      ))}
    </nav>
  );
}
```

### Route Prefetching

Prefetch data on link hover:

```tsx
function PrefetchLink({ to, children }) {
  const router = useRouter();

  const handleMouseEnter = () => {
    // Prefetch data for the target route
    prefetchRouteData(to);
  };

  return (
    <Link to={to} onmouseenter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

### Active Link Styling

Style active links based on current route:

```tsx
function NavLink({ to, children }) {
  const router = useRouter();
  const location = router.location();

  const isActive = () => location.pathname === to;

  return (
    <Link
      to={to}
      class={() => `nav-link ${isActive() ? 'active' : ''}`}
    >
      {children}
    </Link>
  );
}
```

### Scroll Restoration

Restore scroll position on navigation:

```tsx
function ScrollManager() {
  const router = useRouter();
  const location = router.location();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Or restore scroll position from history
    // const scrollPos = getScrollPosition(location.pathname);
    // if (scrollPos) window.scrollTo(0, scrollPos);
  });

  return null;
}

// Usage
<Router>
  <ScrollManager />
  <Route path="/" component={Home} />
  {/* other routes */}
</Router>
```

### Route Meta Information

Store and access route metadata:

```tsx
const routeConfig = [
  {
    path: '/',
    component: Home,
    meta: { title: 'Home', requiresAuth: false }
  },
  {
    path: '/admin',
    component: Admin,
    meta: { title: 'Admin Panel', requiresAuth: true, roles: ['admin'] }
  }
];

function DocumentTitle() {
  const router = useRouter();
  const location = router.location();

  useEffect(() => {
    const route = findRouteByPath(location.pathname);
    if (route?.meta?.title) {
      document.title = `${route.meta.title} - My App`;
    }
  });

  return null;
}
```

---

## See Also

- [Router Guide](/guide/router) - Introduction to routing in Flexium
- [State Management](/guide/state) - Managing application state
- [Context](/guide/context) - Sharing data with Context
