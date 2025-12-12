---
title: Router - Client-Side Navigation
description: Build Single Page Applications with Flexium's built-in router. Learn about routes, navigation, and dynamic parameters.
head:
  - - meta
    - property: og:title
      content: Router - Flexium SPA Routing
  - - meta
    - property: og:description
      content: Built-in router for Flexium Single Page Applications. Client-side navigation, dynamic routes, and more.
---

# Router

Flexium includes a built-in router for building Single Page Applications (SPA). The router provides declarative routing, nested layouts, route guards, and reactive navigation.

## Quick Start

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

## Core Concepts

### Basic Routing

The router uses three main components to define your application's routes:

```tsx
import { Router, Route, Link, router } from 'flexium/router'

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users/123">User Profile</Link>
      </nav>

      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={UserProfile} />
    </Router>
  )
}

function UserProfile() {
  const r = router()
  const params = r.params

  return <h1>User ID: {params.id}</h1>
}
```

### Dynamic Route Parameters

Use the `:paramName` syntax to create dynamic route segments:

```tsx
// Single parameter
<Route path="/users/:id" component={UserProfile} />

// Multiple parameters
<Route path="/users/:userId/posts/:postId" component={PostDetail} />

// Access parameters in your component
function PostDetail() {
  const r = router()
  const params = r.params

  return (
    <div>
      <h1>User {params.userId}</h1>
      <p>Post {params.postId}</p>
    </div>
  )
}
```

## Nested Routes

Nested routes allow you to create complex layouts where parent components wrap child components. Use the `<Outlet>` component to render child routes.

### Basic Nested Routes

```tsx
import { Router, Route, Outlet, Link } from 'flexium/router'

function App() {
  return (
    <Router>
      <Route path="/dashboard" component={DashboardLayout}>
        <Route index component={DashboardHome} />
        <Route path="/dashboard/profile" component={Profile} />
        <Route path="/dashboard/settings" component={Settings} />
      </Route>
    </Router>
  )
}

function DashboardLayout() {
  return (
    <div class="dashboard">
      <aside class="sidebar">
        <nav>
          <Link to="/dashboard">Home</Link>
          <Link to="/dashboard/profile">Profile</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </nav>
      </aside>

      <main class="content">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  )
}

function DashboardHome() {
  return <h1>Dashboard Home</h1>
}
```

### Multi-Level Nesting

You can nest routes multiple levels deep:

```tsx
<Router>
  <Route path="/" component={RootLayout}>
    <Route index component={HomePage} />

    <Route path="/admin" component={AdminLayout}>
      <Route index component={AdminDashboard} />

      <Route path="/admin/users" component={UsersLayout}>
        <Route index component={UsersList} />
        <Route path="/admin/users/:id" component={UserDetail} />
      </Route>
    </Route>
  </Route>
</Router>
```

### Index Routes

Index routes render when the parent route's path is matched exactly:

```tsx
<Route path="/products" component={ProductsLayout}>
  {/* Renders at /products */}
  <Route index component={ProductsList} />

  {/* Renders at /products/123 */}
  <Route path="/products/:id" component={ProductDetail} />
</Route>
```

## Route Guards & Authentication

Protect routes using the `beforeEnter` guard. This function runs before the route is rendered and can prevent navigation by returning `false`.

### Basic Authentication Guard

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      <Route
        path="/dashboard"
        component={Dashboard}
        beforeEnter={(params) => {
          const isAuthenticated = checkAuth()
          if (!isAuthenticated) {
            // Redirect to login
            window.location.href = '/login'
            return false
          }
          return true
        }}
      />
    </Router>
  )
}
```

### Authorization Guards

Check user roles and permissions:

```tsx
<Route
  path="/admin"
  component={AdminPanel}
  beforeEnter={(params) => {
    const user = getCurrentUser()

    if (!user) {
      r.navigate('/login')
      return false
    }

    if (!user.roles.includes('admin')) {
      r.navigate('/unauthorized')
      return false
    }

    return true
  }}
/>
```

### Async Guards

Guards can be asynchronous for API calls:

```tsx
<Route
  path="/premium"
  component={PremiumContent}
  beforeEnter={async (params) => {
    const subscription = await checkSubscription()

    if (!subscription.active) {
      r.navigate('/pricing')
      return false
    }

    return true
  }}
/>
```

### Parameter-Based Guards

Use route parameters in your guard logic:

```tsx
<Route
  path="/users/:id/edit"
  component={EditUser}
  beforeEnter={(params) => {
    const currentUser = getCurrentUser()
    const targetUserId = params.id

    // Users can only edit their own profile
    if (currentUser.id !== targetUserId && !currentUser.isAdmin) {
      r.navigate(`/users/${targetUserId}`)
      return false
    }

    return true
  }}
/>
```

## Query Parameters

Access and manage URL query parameters using the location object.

### Reading Query Parameters

```tsx
import { router } from 'flexium/router'

function SearchResults() {
  const r = router()
  const location = r.location

  // URL: /search?q=flexium&sort=date&filter=js
  const searchQuery = location.query.q      // "flexium"
  const sortBy = location.query.sort        // "date"
  const filter = location.query.filter      // "js"

  return (
    <div>
      <h1>Search: {searchQuery}</h1>
      <p>Sort: {sortBy}, Filter: {filter}</p>
    </div>
  )
}
```

### Setting Query Parameters

Navigate with query strings to update parameters:

```tsx
function ProductFilter() {
  const r = router()

  const applyFilter = (category: string, price: string) => {
    // Navigate with query parameters
    r.navigate(`/products?category=${category}&maxPrice=${price}`)
  }

  return (
    <div>
      <button onclick={() => applyFilter('electronics', '1000')}>
        Electronics under $1000
      </button>
    </div>
  )
}
```

### Reactive Query Parameters

Query parameters are reactive and will trigger component updates:

```tsx
function FilteredList() {
  const r = router()

  // This will re-run when query params change
  const location = r.location
  const category = location.query.category || 'all'

  return (
    <div>
      <h2>Category: {category}</h2>
      <nav>
        <Link to="/products?category=electronics">Electronics</Link>
        <Link to="/products?category=books">Books</Link>
        <Link to="/products?category=clothing">Clothing</Link>
      </nav>
    </div>
  )
}
```

## Programmatic Navigation

Navigate imperatively using the `navigate` function from `router()`.

### Basic Navigation

```tsx
import { router } from 'flexium/router'

function LoginForm() {
  const r = router()

  const handleSubmit = async (credentials) => {
    const success = await login(credentials)

    if (success) {
      // Navigate after successful login
      r.navigate('/dashboard')
    }
  }

  return <form onsubmit={handleSubmit}>{/* form fields */}</form>
}
```

### Navigation with State

While Flexium router uses browser history, you can pass data through route parameters or query strings:

```tsx
function ProductList() {
  const r = router()

  const viewProduct = (productId: string) => {
    r.navigate(`/products/${productId}`)
  }

  const viewWithFilters = (productId: string, category: string) => {
    r.navigate(`/products/${productId}?from=category&cat=${category}`)
  }

  return (
    <div>
      <button onclick={() => viewProduct('123')}>View Product</button>
      <button onclick={() => viewWithFilters('123', 'electronics')}>
        View with Context
      </button>
    </div>
  )
}
```

### Conditional Navigation

Navigate based on application logic:

```tsx
function CheckoutButton() {
  const r = router()

  const handleCheckout = () => {
    const cart = getCart()
    const user = getCurrentUser()

    if (cart.isEmpty()) {
      alert('Your cart is empty')
      return
    }

    if (!user) {
      r.navigate('/login?redirect=/checkout')
    } else {
      r.navigate('/checkout')
    }
  }

  return <button onclick={handleCheckout}>Proceed to Checkout</button>
}
```

### Navigation in Effects

Navigate in response to data changes:

```tsx
import { effect } from 'flexium/core'
import { router } from 'flexium/router'

function OrderStatus() {
  const r = router()
  const params = r.params()
  const orderId = params.id

  effect(() => {
    const checkStatus = async () => {
      const order = await fetchOrder(orderId)

      if (order.status === 'completed') {
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          r.navigate(`/orders/${orderId}/success`)
        }, 3000)
      }
    }

    checkStatus()
  })

  return <div>Order Status: Processing...</div>
}
```

## Route Transitions

Create smooth transitions between routes using CSS and Flexium's reactive system.

### Basic Fade Transition

```tsx
import { effect, state } from 'flexium/core'
import { router } from 'flexium/router'

function TransitionWrapper({ children }) {
  const r = router()
  const location = r.location
  const [isTransitioning, setIsTransitioning] = state(false)

  effect(() => {
    // Trigger transition on location change
    setIsTransitioning(true)

    const timeout = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timeout)
  })

  return (
    <div class={() => isTransitioning() ? 'fade-out' : 'fade-in'}>
      {children}
    </div>
  )
}

// CSS
// .fade-in { animation: fadeIn 0.3s ease-in; }
// .fade-out { animation: fadeOut 0.3s ease-out; }
```

### Page Transition Component

```tsx
function PageTransition({ children }) {
  const r = router()
  const location = r.location
  const [currentPath, setCurrentPath] = state('')
  const [isAnimating, setIsAnimating] = state(false)

  effect(() => {
    const newPath = location().pathname

    if (currentPath() !== newPath) {
      setIsAnimating(true)

      setTimeout(() => {
        setCurrentPath(newPath)
        setIsAnimating(false)
      }, 200)
    }
  })

  return (
    <div
      class={() => `page-container ${isAnimating() ? 'transitioning' : ''}`}
      style={{
        opacity: isAnimating() ? 0 : 1,
        transform: isAnimating() ? 'translateY(20px)' : 'translateY(0)',
        transition: 'opacity 0.2s, transform 0.2s'
      }}
    >
      {children}
    </div>
  )
}
```

## 404 Handling

Handle unmatched routes to create a 404 Not Found page.

### Basic 404 Page

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={UserProfile} />

      {/* This will render when no other route matches */}
      <Route path="*" component={NotFound} />
    </Router>
  )
}

function NotFound() {
  const r = router()
  const location = r.location

  return (
    <div class="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page <code>{location.pathname}</code> does not exist.</p>
      <Link to="/">Return to Home</Link>
    </div>
  )
}
```

### Custom 404 with Suggestions

```tsx
function NotFound() {
  const r = router()
  const location = r.location

  const suggestions = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Browse Products' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' }
  ]

  return (
    <div class="not-found">
      <h1>404 - Page Not Found</h1>
      <p>We couldn't find: <code>{location.pathname}</code></p>

      <h2>Try one of these pages:</h2>
      <ul>
        {suggestions.map(item => (
          <li>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>

      <button onclick={() => r.navigate(-1)}>Go Back</button>
    </div>
  )
}
```

### Nested 404 Handling

Handle 404s at different route levels:

```tsx
<Router>
  <Route path="/" component={RootLayout}>
    <Route index component={Home} />

    <Route path="/admin" component={AdminLayout}>
      <Route index component={AdminDash} />
      <Route path="/admin/users" component={Users} />

      {/* Admin-specific 404 */}
      <Route path="/admin/*" component={AdminNotFound} />
    </Route>

    {/* Global 404 */}
    <Route path="*" component={NotFound} />
  </Route>
</Router>
```

## Security Features

Flexium's router includes built-in security features to protect your application from common vulnerabilities.

### XSS Prevention

The router automatically blocks navigation to dangerous protocols that could be used for XSS attacks:

```tsx
// These are automatically blocked:
r.navigate('javascript:alert(1)')      // Blocked
r.navigate('data:text/html,...')       // Blocked
r.navigate('vbscript:MsgBox(1)')       // Blocked
r.navigate('file:///etc/passwd')       // Blocked

// These are allowed (normal navigation):
r.navigate('/users/123')               // Allowed
r.navigate('https://example.com')      // Allowed (but may leave SPA)
r.navigate('/page?query=value')        // Allowed
```

When an unsafe path is detected, the navigation is blocked and an error is logged:

```
[Flexium Router] Blocked navigation to unsafe path: javascript:alert(1)
```

### Blocked Protocols

| Protocol | Reason |
|----------|--------|
| `javascript:` | Executes arbitrary JavaScript (XSS) |
| `data:` | Can embed executable content |
| `vbscript:` | Executes VBScript (IE legacy) |
| `file:` | Accesses local filesystem |

### User Input Sanitization

When accepting navigation paths from user input, the router's built-in protection will block malicious attempts. However, you should still validate and sanitize user input:

```tsx
function SearchBar() {
  const r = router()

  const handleSearch = (query: string) => {
    // Validate query before using in navigation
    const sanitizedQuery = encodeURIComponent(query)
    r.navigate(`/search?q=${sanitizedQuery}`)
  }

  return (
    <input
      type="text"
      oninput={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### Combining Guards with Security

For sensitive routes, combine built-in XSS protection with authentication guards:

```tsx
<Route
  path="/admin"
  component={AdminPanel}
  beforeEnter={(params) => {
    // Custom authentication check
    const user = getCurrentUser()
    if (!user || !user.isAdmin) {
      r.navigate('/login')
      return false
    }

    // Log access for audit trail
    logAccess(user.id, '/admin')

    return true
  }}
/>
```

### SSR Safety

The router includes SSR guards to prevent errors in server-side environments:

```tsx
// Safe to call in SSR - no-op on server
r.navigate('/dashboard')  // Does nothing on server

// Location defaults safely on server
r.location.pathname  // Returns '/' on server
r.location.query     // Returns {} on server
```

## Routing Modes

Flexium's router uses the browser's History API for clean URLs.

### History Mode (Default)

The router uses `pushState` for navigation, creating clean URLs without hash symbols:

```
https://example.com/
https://example.com/about
https://example.com/users/123
```

This is the default and recommended mode. Ensure your server is configured to serve `index.html` for all routes.

### Server Configuration

For single-page apps, configure your server to fall back to `index.html`:

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
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

## Components

### `<Router>`
The root component that provides the routing context. It manages the history and current location.

### `<Route>`
Renders a component when the current location matches the `path` prop.

- `path`: Path pattern to match (e.g., `/users/:id`)
- `component`: Component to render
- `index`: Whether this is an index route
- `beforeEnter`: Navigation guard function
- `children`: Nested route definitions

### `<Link>`
A navigation component that renders an `<a>` tag and handles navigation without page reloads.

- `to`: Target URL
- `class`: CSS class

### `<Outlet>`
Renders child route content in nested routing scenarios.

## Hooks

### `router()`
Returns the router context, including `location`, `params`, `navigate`, and `matches`.

```tsx
const r = router()

// Access location
const location = r.location
console.log(location.pathname)  // "/users/123"
console.log(location.query)     // { tab: "posts" }

// Access params
const params = r.params
console.log(params.id)  // "123"

// Navigate
r.navigate('/home')

// Access route matches
const matches = r.matches()
console.log(matches.length)
```

## Examples

### Blog Application

```tsx
import { Router, Route, Link, Outlet, router } from 'flexium/router'

function App() {
  return (
    <Router>
      <Route path="/" component={BlogLayout}>
        <Route index component={PostList} />
        <Route path="/posts/:slug" component={PostDetail} />
        <Route path="/categories/:category" component={CategoryPosts} />
        <Route path="/authors/:id" component={AuthorProfile} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  )
}

function BlogLayout() {
  return (
    <div>
      <header>
        <Link to="/">My Blog</Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

### E-Commerce Application

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={MainLayout}>
        <Route index component={HomePage} />

        <Route path="/products" component={ProductsLayout}>
          <Route index component={ProductsList} />
          <Route path="/products/:id" component={ProductDetail} />
        </Route>

        <Route path="/cart" component={Cart} />

        <Route
          path="/checkout"
          component={Checkout}
          beforeEnter={() => checkAuthentication()}
        />

        <Route
          path="/account"
          component={AccountLayout}
          beforeEnter={() => checkAuthentication()}
        >
          <Route index component={AccountDashboard} />
          <Route path="/account/orders" component={Orders} />
          <Route path="/account/settings" component={Settings} />
        </Route>
      </Route>
    </Router>
  )
}
```

## Next Steps

- [Router API Reference](/reference/router) - Complete API documentation
- [State Management](/guide/state) - Managing application state
- [Global State](/guide/context) - Sharing state globally with state() key
