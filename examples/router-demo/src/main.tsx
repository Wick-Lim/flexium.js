import { render } from 'flexium'
import { Router, Route, Link, Outlet, useRouter } from 'flexium'
import { signal } from 'flexium'

// Mock user data
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', department: 'Engineering' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', department: 'Engineering' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Designer', department: 'Design' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Manager', department: 'Sales' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Developer', department: 'Engineering' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Designer', department: 'Design' },
]

// Root Layout Component with Navigation
function Layout() {
  const router = useRouter()

  const isActive = (path: string) => {
    const currentPath = router.location().pathname
    return currentPath === path ||
           (path !== '/' && currentPath.startsWith(path))
  }

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/" class={() => isActive('/') && !isActive('/about') && !isActive('/users') && !isActive('/settings') ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" class={() => isActive('/about') ? 'active' : ''}>
              About
            </Link>
          </li>
          <li>
            <Link to="/users" class={() => isActive('/users') ? 'active' : ''}>
              Users
            </Link>
          </li>
          <li>
            <Link to="/settings" class={() => isActive('/settings') ? 'active' : ''}>
              Settings
            </Link>
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

  const navigateToUsers = () => {
    router.navigate('/users')
  }

  return (
    <div class="page">
      <h1>Welcome to Flexium Router Demo</h1>
      <p>
        This is a comprehensive demonstration of Flexium's routing capabilities,
        showcasing a complete single-page application (SPA) with navigation.
      </p>

      <h2>Features Demonstrated</h2>

      <div class="card">
        <h3>1. Basic Route Definitions</h3>
        <p>
          Routes are defined using the <code>&lt;Router&gt;</code> and <code>&lt;Route&gt;</code> components.
          Each route has a path and a component to render.
        </p>
      </div>

      <div class="card">
        <h3>2. Navigation with Link Component</h3>
        <p>
          The <code>&lt;Link&gt;</code> component provides declarative navigation without page reloads.
          Check out the navigation bar above!
        </p>
      </div>

      <div class="card">
        <h3>3. Programmatic Navigation</h3>
        <p>
          Use the <code>router.navigate()</code> function to navigate programmatically from your code.
          Try this button:
        </p>
        <button onclick={navigateToUsers}>Go to Users Page</button>
      </div>

      <div class="card">
        <h3>4. Dynamic URL Parameters</h3>
        <p>
          Routes can include dynamic segments using the <code>:param</code> syntax.
          Navigate to the Users page and click on any user to see their details!
        </p>
      </div>

      <div class="card">
        <h3>5. Nested Routes with Outlet</h3>
        <p>
          The <code>&lt;Outlet&gt;</code> component renders child routes within parent layouts.
          The Users section demonstrates nested routing.
        </p>
      </div>

      <div class="card">
        <h3>6. Active Link Styling</h3>
        <p>
          The navigation bar highlights the current page using the <code>router.location()</code> API
          to check which route is active.
        </p>
      </div>

      <div class="card">
        <h3>7. 404 Handling</h3>
        <p>
          Try visiting a non-existent route like <Link to="/nonexistent">/nonexistent</Link> to see
          the custom 404 page.
        </p>
      </div>

      <h2>Get Started</h2>
      <p>
        Explore the different sections using the navigation menu above, or click the button below
        to dive right into the users section!
      </p>
      <button onclick={navigateToUsers}>Explore Users</button>
    </div>
  )
}

// About Page
function AboutPage() {
  return (
    <div class="page">
      <h1>About This Demo</h1>
      <p>
        This demo showcases the Flexium Router, a powerful and lightweight routing solution
        for building single-page applications with Flexium.
      </p>

      <h2>Key Concepts</h2>

      <h3>Router Component</h3>
      <p>
        The <code>&lt;Router&gt;</code> component is the root of your routing configuration.
        It manages the current location and matches it against your route definitions.
      </p>

      <h3>Route Component</h3>
      <p>
        The <code>&lt;Route&gt;</code> component defines a route in your application.
        It specifies a path pattern and the component to render when that path matches.
      </p>

      <h3>Link Component</h3>
      <p>
        The <code>&lt;Link&gt;</code> component creates navigation links that work with the router.
        It prevents full page reloads and updates the URL using the History API.
      </p>

      <h3>Outlet Component</h3>
      <p>
        The <code>&lt;Outlet&gt;</code> component is a placeholder that renders the matched child route.
        It enables nested routing and layout components.
      </p>

      <h3>useRouter Hook</h3>
      <p>
        The <code>useRouter()</code> hook provides access to router context, including:
      </p>
      <ul style="margin-left: 2rem; color: #666;">
        <li><code>location()</code> - Current location object with pathname, search, hash, and query</li>
        <li><code>params()</code> - URL parameters extracted from dynamic route segments</li>
        <li><code>navigate(path)</code> - Function to programmatically navigate to a new path</li>
        <li><code>matches()</code> - Array of matched routes for the current location</li>
      </ul>

      <h2>Technologies</h2>
      <p>
        This demo is built with:
      </p>
      <ul style="margin-left: 2rem; color: #666;">
        <li><strong>Flexium</strong> - A lightweight reactive UI framework</li>
        <li><strong>Flexium Router</strong> - Client-side routing for SPAs</li>
        <li><strong>TypeScript</strong> - Type-safe development</li>
        <li><strong>Vite</strong> - Fast build tool and dev server</li>
      </ul>
    </div>
  )
}

// Users Layout (parent route with nested routes)
function UsersLayout() {
  return <Outlet />
}

// Users List Page
function UsersListPage() {
  const router = useRouter()

  const viewUser = (userId: number) => {
    router.navigate(`/users/${userId}`)
  }

  return (
    <div class="page">
      <h1>Users Directory</h1>
      <p>Click on any user to view their detailed information.</p>

      <div class="user-list">
        {users.map(user => (
          <div class="user-card" onclick={() => viewUser(user.id)}>
            <h3>{user.name}</h3>
            <p>{user.role}</p>
            <p style="font-size: 0.85rem; color: #999;">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// User Detail Page (demonstrates URL parameters)
function UserDetailPage() {
  const router = useRouter()
  const params = router.params()

  const userId = parseInt(params.id || '0')
  const user = users.find(u => u.id === userId)

  const goBack = () => {
    router.navigate('/users')
  }

  if (!user) {
    return (
      <div class="page">
        <h1>User Not Found</h1>
        <p>The user with ID {params.id} could not be found.</p>
        <button onclick={goBack}>Back to Users</button>
      </div>
    )
  }

  const initials = user.name.split(' ').map(n => n[0]).join('')

  return (
    <div class="page">
      <h1>User Profile</h1>

      <div class="user-detail">
        <div class="avatar">{initials}</div>

        <h2>{user.name}</h2>
        <p style="color: #667eea; font-size: 1.1rem; margin-bottom: 0.5rem;">{user.role}</p>

        <div class="info">
          <div class="info-item">
            <strong>User ID</strong>
            {user.id}
          </div>
          <div class="info-item">
            <strong>Email</strong>
            {user.email}
          </div>
          <div class="info-item">
            <strong>Department</strong>
            {user.department}
          </div>
          <div class="info-item">
            <strong>Role</strong>
            {user.role}
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="back-button" onclick={goBack}>
          Back to Users
        </button>
        <button onclick={() => router.navigate('/')}>
          Go Home
        </button>
      </div>
    </div>
  )
}

// Settings Page (demonstrates form handling)
function SettingsPage() {
  const username = signal('JohnDoe')
  const email = signal('john@example.com')
  const theme = signal('light')
  const notifications = signal(true)
  const bio = signal('A passionate developer')

  const saved = signal(false)

  const handleSave = () => {
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }

  return (
    <div class="page">
      <h1>Settings</h1>
      <p>Manage your application preferences and account settings.</p>

      <div class="settings-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            oninput={(e: Event) => {
              username.value = (e.target as HTMLInputElement).value
            }}
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            oninput={(e: Event) => {
              email.value = (e.target as HTMLInputElement).value
            }}
          />
        </div>

        <div class="form-group">
          <label for="theme">Theme</label>
          <select
            id="theme"
            value={theme}
            onchange={(e: Event) => {
              theme.value = (e.target as HTMLSelectElement).value
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              checked={notifications}
              onchange={(e: Event) => {
                notifications.value = (e.target as HTMLInputElement).checked
              }}
              style="width: auto; margin-right: 0.5rem;"
            />
            Enable email notifications
          </label>
        </div>

        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            oninput={(e: Event) => {
              bio.value = (e.target as HTMLTextAreaElement).value
            }}
          />
        </div>

        <button onclick={handleSave}>
          {() => saved.value ? 'Saved!' : 'Save Settings'}
        </button>

        {() => saved.value && (
          <p style="color: #667eea; margin-top: 1rem;">
            Your settings have been saved successfully!
          </p>
        )}
      </div>

      <h2>Current Settings</h2>
      <div class="card">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Theme:</strong> {theme}</p>
        <p><strong>Notifications:</strong> {() => notifications.value ? 'Enabled' : 'Disabled'}</p>
        <p><strong>Bio:</strong> {bio}</p>
      </div>
    </div>
  )
}

// 404 Not Found Page
function NotFoundPage() {
  const router = useRouter()

  return (
    <div class="page not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>
        The page you're looking for doesn't exist.
        The URL is: <code>{() => router.location().pathname}</code>
      </p>
      <button onclick={() => router.navigate('/')}>
        Go to Home Page
      </button>
    </div>
  )
}

// Application with Router Configuration
function App() {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route index component={HomePage} />
        <Route path="about" component={AboutPage} />
        <Route path="users" component={UsersLayout}>
          <Route index component={UsersListPage} />
          <Route path=":id" component={UserDetailPage} />
        </Route>
        <Route path="settings" component={SettingsPage} />
        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>
  )
}

// Mount the application
render(App, document.getElementById('app')!)
