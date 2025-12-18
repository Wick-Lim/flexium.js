# &lt;Outlet /&gt;

Renders the child route component in nested routing.

## Import

```tsx
import { Outlet } from 'flexium/router'
```

## Signature

```tsx
<Outlet />
```

## Usage

### Basic Layout

```tsx
import { Routes, Route, Outlet } from 'flexium/router'

function App() {
  return (
    <Routes>
      <Route path="/" component={Layout}>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
      </Route>
    </Routes>
  )
}

function Layout() {
  return (
    <div class="app">
      <Header />
      <main>
        <Outlet /> {/* Renders Home, About, or Contact */}
      </main>
      <Footer />
    </div>
  )
}
```

### Nested Routes

```tsx
<Routes>
  <Route path="/dashboard" component={DashboardLayout}>
    <Route path="/" component={DashboardHome} />
    <Route path="/analytics" component={Analytics} />
    <Route path="/settings" component={SettingsLayout}>
      <Route path="/" component={SettingsGeneral} />
      <Route path="/profile" component={SettingsProfile} />
      <Route path="/security" component={SettingsSecurity} />
    </Route>
  </Route>
</Routes>

function DashboardLayout() {
  return (
    <div class="dashboard">
      <Sidebar />
      <div class="content">
        <Outlet /> {/* DashboardHome, Analytics, or SettingsLayout */}
      </div>
    </div>
  )
}

function SettingsLayout() {
  return (
    <div class="settings">
      <SettingsNav />
      <div class="settings-content">
        <Outlet /> {/* SettingsGeneral, Profile, or Security */}
      </div>
    </div>
  )
}
```

### With Authentication

```tsx
function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const r = useRouter()

  if (!isAuthenticated()) {
    r.navigate('/login')
    return null
  }

  return (
    <div class="protected">
      <AuthenticatedHeader />
      <Outlet /> {/* Protected child routes */}
    </div>
  )
}

// Routes
<Routes>
  <Route path="/login" component={Login} />
  <Route path="/app" component={ProtectedLayout}>
    <Route path="/" component={Dashboard} />
    <Route path="/profile" component={Profile} />
  </Route>
</Routes>
```

### Multiple Layouts

```tsx
<Routes>
  {/* Public layout */}
  <Route path="/" component={PublicLayout}>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
  </Route>

  {/* Admin layout */}
  <Route path="/admin" component={AdminLayout}>
    <Route path="/" component={AdminDashboard} />
    <Route path="/users" component={AdminUsers} />
  </Route>

  {/* Auth layout (no nav) */}
  <Route path="/auth" component={AuthLayout}>
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
  </Route>
</Routes>
```

## Behavior

- Renders the **matched child route** component
- Automatically tracks **route depth** for nested outlets
- Returns **null** if no matching child route
- Respects **beforeEnter** guards on child routes

## How It Works

```
URL: /dashboard/settings/profile

Route Tree:
└── /dashboard (DashboardLayout)
    └── /settings (SettingsLayout)
        └── /profile (SettingsProfile)

Render Order:
1. DashboardLayout renders
2. DashboardLayout's Outlet → SettingsLayout
3. SettingsLayout's Outlet → SettingsProfile
```

## Common Patterns

### Sidebar Navigation

```tsx
function SidebarLayout() {
  return (
    <Row style={{ minHeight: '100vh' }}>
      <Column width={240} padding={16}>
        <Nav>
          <Link to="/app">Dashboard</Link>
          <Link to="/app/projects">Projects</Link>
          <Link to="/app/settings">Settings</Link>
        </Nav>
      </Column>
      <Column flex={1} padding={24}>
        <Outlet />
      </Column>
    </Row>
  )
}
```

### Tab-based Navigation

```tsx
function TabLayout() {
  const r = useRouter()
  const currentPath = r.location.pathname

  return (
    <Column gap={16}>
      <Row gap={8} class="tabs">
        <button
          class={currentPath === '/settings' ? 'active' : ''}
          onClick={() => r.navigate('/settings')}
        >
          General
        </button>
        <button
          class={currentPath === '/settings/profile' ? 'active' : ''}
          onClick={() => r.navigate('/settings/profile')}
        >
          Profile
        </button>
      </Row>
      <Outlet />
    </Column>
  )
}
```

### Loading States

```tsx
function LoadingLayout() {
  const r = useRouter()
  const [isLoading, setIsLoading] = use(false)

  // Track route changes
  use(() => {
    const path = r.location.pathname
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500)
  })

  return (
    <div class="layout">
      <Header />
      {isLoading ? <Spinner /> : <Outlet />}
    </div>
  )
}
```

## Notes

- Must be used inside a component rendered by `<Route>`
- Each layout level needs its own `<Outlet>`
- No props are passed - child components receive route params via `useRouter()`

## See Also

- [&lt;Routes /&gt;](/docs/router/routes) - Root routing component
- [&lt;Route /&gt;](/docs/router/route) - Route definitions
- [&lt;Link /&gt;](/docs/router/link) - Navigation links
- [useRouter()](/docs/router/use-router) - Access router context
