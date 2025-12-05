# Flexium Router Demo

A comprehensive demonstration of Flexium's routing capabilities, showcasing how to build a complete single-page application (SPA) with client-side navigation.

## Features Demonstrated

This demo includes examples of all major routing features:

### 1. Basic Route Definitions
- Using `Router` and `Route` components to define routes
- Path-based routing with multiple pages
- Root layout component pattern

### 2. Navigation with Link Component
- Declarative navigation using `<Link>` component
- Prevents full page reloads
- Clean URL updates using History API

### 3. Programmatic Navigation
- Navigate from code using `router.navigate()`
- Example: Button clicks triggering navigation
- Access router context with `useRouter()` hook

### 4. Dynamic URL Parameters
- Route parameters with `:param` syntax
- Extracting parameters using `router.params()`
- User detail pages with dynamic IDs

### 5. Nested Routes with Outlet
- Parent/child route relationships
- Layout components with `<Outlet>`
- Multi-level navigation hierarchy

### 6. Active Link Styling
- Detecting current route
- Highlighting active navigation items
- Using `router.location()` for current path

### 7. 404 Handling
- Catch-all route with `path="*"`
- Custom not-found page
- Graceful error handling

## Project Structure

```
router-demo/
├── src/
│   └── main.tsx          # Main application with routing setup
├── index.html            # HTML with navigation styling
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── README.md            # This file
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will open at http://localhost:3006

### Build

```bash
# Build for production
npm run build
```

### Preview

```bash
# Preview production build
npm run preview
```

## Application Pages

### Home (`/`)
- Welcome page with feature overview
- Demonstrates programmatic navigation
- Links to all demo sections

### About (`/about`)
- Information about the router
- Key concepts and documentation
- Technical details

### Users (`/users`)
- User directory listing
- Demonstrates nested routes
- Click any user to view details

### User Detail (`/users/:id`)
- Individual user profile page
- Dynamic route parameters
- Back navigation example

### Settings (`/settings`)
- Settings form with reactive inputs
- Demonstrates state management
- Form handling patterns

### 404 (`/*`)
- Custom not-found page
- Catch-all route
- Navigation back to home

## Key Code Examples

### Basic Router Setup

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route index component={HomePage} />
        <Route path="about" component={AboutPage} />
      </Route>
    </Router>
  )
}
```

### Using the Router Hook

```tsx
function MyComponent() {
  const router = useRouter()

  // Access current location
  const pathname = router.location().pathname

  // Access route parameters
  const params = router.params()
  const userId = params.id

  // Navigate programmatically
  const handleClick = () => {
    router.navigate('/users')
  }

  return <button onclick={handleClick}>Go to Users</button>
}
```

### Nested Routes with Outlet

```tsx
function Layout() {
  return (
    <div>
      <nav>{/* Navigation links */}</nav>
      <Outlet /> {/* Child routes render here */}
    </div>
  )
}

// Router configuration
<Route path="/" component={Layout}>
  <Route index component={HomePage} />
  <Route path="about" component={AboutPage} />
</Route>
```

### Active Link Styling

```tsx
function Navigation() {
  const router = useRouter()

  const isActive = (path: string) => {
    return router.location().pathname === path
  }

  return (
    <Link
      to="/about"
      class={() => isActive('/about') ? 'active' : ''}
    >
      About
    </Link>
  )
}
```

### Dynamic Parameters

```tsx
// Route definition
<Route path="users/:id" component={UserDetail} />

// Component implementation
function UserDetail() {
  const router = useRouter()
  const params = router.params()

  const userId = params.id // Extract 'id' from URL

  return <div>User ID: {userId}</div>
}
```

## Router API Reference

### Components

- **`<Router>`** - Root routing provider component
- **`<Route>`** - Defines a route with path and component
- **`<Link>`** - Navigation link component
- **`<Outlet>`** - Renders matched child route

### Hooks

- **`useRouter()`** - Returns router context object

### Router Context

The `useRouter()` hook returns an object with:

- `location()` - Signal containing:
  - `pathname` - Current URL path
  - `search` - Query string
  - `hash` - URL hash
  - `query` - Parsed query parameters object

- `params()` - Signal containing URL parameters from dynamic route segments

- `navigate(path)` - Function to navigate to a new path

- `matches()` - Array of matched routes for current location

## Route Configuration

### Route Props

- `path` - URL path pattern (supports `:param` for dynamic segments)
- `index` - Boolean indicating if this is an index route
- `component` - Component to render when route matches
- `children` - Nested route definitions
- `beforeEnter` - Optional guard function

### Path Patterns

- `/about` - Static path
- `/users/:id` - Dynamic parameter
- `/` - Root path
- `*` - Catch-all (must be last)
- Index routes have no path, render at parent path

## Styling

The demo includes comprehensive CSS styling:

- Gradient navigation bar
- Active link indicators
- Card-based layouts
- Responsive design
- Smooth animations
- Form styling
- Custom 404 page design

All styles are included in `index.html` for simplicity.

## Browser Support

This demo uses modern browser APIs:

- History API for navigation
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- CSS Custom Properties

Supports all modern browsers (Chrome, Firefox, Safari, Edge).

## Learn More

- [Flexium Documentation](../../packages/flexium/README.md)
- [Router Source Code](../../packages/flexium/src/router/)
- [Router Tests](../../packages/flexium/src/router/__tests__/)

## License

This example is part of the Flexium project and follows the same license.
