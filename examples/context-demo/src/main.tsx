/**
 * Flexium Context API Demo
 *
 * Comprehensive demonstration of the Context API including:
 * - Theme context with dark/light mode
 * - Auth context with user state
 * - Nested contexts
 * - Multiple contexts working together
 * - Context with signals for reactivity
 * - Default values and error handling
 */

import { render } from 'flexium/dom'
import { createContext, useContext, signal, effect, type Signal } from 'flexium/core'

// ============================================================================
// Type Definitions
// ============================================================================

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Signal<Theme>
  toggleTheme: () => void
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

interface AuthContextValue {
  user: Signal<User | null>
  isAuthenticated: Signal<boolean>
  login: (user: User) => void
  logout: () => void
}

interface NotificationContextValue {
  notifications: Signal<string[]>
  addNotification: (message: string) => void
  clearNotifications: () => void
}

// ============================================================================
// Context Creation with Default Values
// ============================================================================

// Theme Context - manages application theme
const ThemeContext = createContext<ThemeContextValue>({
  theme: signal<Theme>('light'),
  toggleTheme: () => {
    console.warn('ThemeContext not provided! Using default.')
  }
})

// Auth Context - manages user authentication
const AuthContext = createContext<AuthContextValue>({
  user: signal<User | null>(null),
  isAuthenticated: signal(false),
  login: () => {
    console.warn('AuthContext not provided! Using default.')
  },
  logout: () => {
    console.warn('AuthContext not provided! Using default.')
  }
})

// Notification Context - manages notifications
const NotificationContext = createContext<NotificationContextValue>({
  notifications: signal<string[]>([]),
  addNotification: () => {
    console.warn('NotificationContext not provided! Using default.')
  },
  clearNotifications: () => {
    console.warn('NotificationContext not provided! Using default.')
  }
})

// ============================================================================
// Context Provider Components
// ============================================================================

/**
 * Theme Provider - Provides theme state and controls
 */
function ThemeProvider(props: { children: any }) {
  const theme = signal<Theme>('light')

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme

    // Update body class for global theme styling
    if (newTheme === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }

  const value: ThemeContextValue = {
    theme,
    toggleTheme
  }

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>
}

/**
 * Auth Provider - Provides authentication state and methods
 */
function AuthProvider(props: { children: any }) {
  const user = signal<User | null>(null)
  const isAuthenticated = signal(false)
  const notificationCtx = useContext(NotificationContext)

  const login = (newUser: User) => {
    user.value = newUser
    isAuthenticated.value = true
    notificationCtx.addNotification(`Welcome back, ${newUser.name}!`)
  }

  const logout = () => {
    const userName = user.value?.name
    user.value = null
    isAuthenticated.value = false
    if (userName) {
      notificationCtx.addNotification(`Goodbye, ${userName}!`)
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

/**
 * Notification Provider - Provides notification management
 */
function NotificationProvider(props: { children: any }) {
  const notifications = signal<string[]>([])

  const addNotification = (message: string) => {
    notifications.value = [...notifications.value, message]

    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n !== message)
    }, 5000)
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    clearNotifications
  }

  return <NotificationContext.Provider value={value}>{props.children}</NotificationContext.Provider>
}

// ============================================================================
// Consumer Components - Demonstrating Context Usage
// ============================================================================

/**
 * Theme Toggle Button - Consumes ThemeContext
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <div class="theme-toggle">
      <button onclick={toggleTheme}>
        {() => theme.value === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
    </div>
  )
}

/**
 * Current Theme Display - Shows reactive theme value
 */
function CurrentThemeDisplay() {
  const { theme } = useContext(ThemeContext)

  return (
    <div class="card">
      <h3>Current Theme</h3>
      <p>
        Active theme: <strong>{() => theme.value}</strong>
      </p>
      <p class="description">
        This component automatically updates when the theme changes using signals.
      </p>
    </div>
  )
}

/**
 * Login Form - Demonstrates auth context usage
 */
function LoginForm() {
  const auth = useContext(AuthContext)
  const { addNotification } = useContext(NotificationContext)

  const handleLogin = (role: 'admin' | 'user') => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'admin' ? 'Admin User' : 'Regular User',
      email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
      role
    }
    auth.login(user)
    addNotification(`Logged in as ${role}`)
  }

  const handleLogout = () => {
    auth.logout()
    addNotification('Logged out successfully')
  }

  return (
    <div class="controls">
      {() => !auth.isAuthenticated.value ? (
        <>
          <button class="success" onclick={() => handleLogin('admin')}>
            Login as Admin
          </button>
          <button class="success" onclick={() => handleLogin('user')}>
            Login as User
          </button>
        </>
      ) : (
        <button class="danger" onclick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  )
}

/**
 * User Profile Card - Shows authenticated user info
 */
function UserProfile() {
  const auth = useContext(AuthContext)

  return (
    <div class="user-card">
      <h3>User Profile</h3>
      {() => auth.isAuthenticated.value ? (
        <div>
          <p><strong>Name:</strong> {() => auth.user.value?.name}</p>
          <p><strong>Email:</strong> {() => auth.user.value?.email}</p>
          <p><strong>Role:</strong> {() => auth.user.value?.role}</p>
          <span class="status-badge authenticated">Authenticated</span>
        </div>
      ) : (
        <div>
          <p>No user logged in</p>
          <span class="status-badge guest">Guest</span>
        </div>
      )}
    </div>
  )
}

/**
 * Notification Display - Shows active notifications
 */
function NotificationDisplay() {
  const { notifications, clearNotifications } = useContext(NotificationContext)

  return (
    <div class="card">
      <h3>Notifications</h3>
      {() => notifications.value.length > 0 ? (
        <div>
          <ul style="list-style: none; padding: 0;">
            {() => notifications.value.map(notification => (
              <li style="padding: 8px; margin: 4px 0; background: #e3f2fd; border-radius: 4px; border-left: 3px solid #2196F3;">
                {notification}
              </li>
            ))}
          </ul>
          <button class="secondary" onclick={clearNotifications}>
            Clear All
          </button>
        </div>
      ) : (
        <p class="description">No notifications</p>
      )}
    </div>
  )
}

/**
 * Nested Context Consumer - Demonstrates consuming multiple contexts
 */
function NestedContextConsumer() {
  const { theme } = useContext(ThemeContext)
  const auth = useContext(AuthContext)

  return (
    <div class="nested-boundary">
      <h3>Nested Context Consumer</h3>
      <p class="description">
        This component consumes both ThemeContext and AuthContext simultaneously.
      </p>
      <div class="info-box">
        <p><strong>Theme:</strong> {() => theme.value}</p>
        <p><strong>User:</strong> {() => auth.user.value?.name || 'Guest'}</p>
        <p><strong>Status:</strong> {() => auth.isAuthenticated.value ? 'Authenticated' : 'Not authenticated'}</p>
      </div>
    </div>
  )
}

/**
 * Context with Effects - Demonstrates reactive side effects
 */
function ContextWithEffects() {
  const { theme } = useContext(ThemeContext)
  const auth = useContext(AuthContext)
  const changeCount = signal(0)

  // Effect that tracks theme changes
  effect(() => {
    console.log('Theme changed to:', theme.value)
    changeCount.value = changeCount.value + 1
  })

  // Effect that tracks auth changes
  effect(() => {
    if (auth.isAuthenticated.value) {
      console.log('User authenticated:', auth.user.value?.name)
    } else {
      console.log('User logged out')
    }
  })

  return (
    <div class="card">
      <h3>Reactive Effects with Context</h3>
      <p class="description">
        Effects automatically re-run when context values change. Check the console!
      </p>
      <div class="info-box">
        <p>Total context changes detected: <strong>{() => changeCount.value}</strong></p>
      </div>
    </div>
  )
}

/**
 * Context Default Values Demo - Shows behavior without provider
 */
function DefaultValuesDemo() {
  return (
    <div class="demo-section">
      <h2>Context Default Values</h2>
      <p class="description">
        The following component demonstrates what happens when you use a context without a provider.
        It will use the default values specified in createContext().
      </p>

      <div class="nested-boundary">
        <h3>Component Using Default Context</h3>
        <ComponentUsingDefaultContext />
      </div>

      <div class="warning-box">
        <strong>Note:</strong> This component is rendered outside the provider tree,
        so it receives the default context values. Check the console for warnings!
      </div>
    </div>
  )
}

function ComponentUsingDefaultContext() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <div class="card">
      <p>Theme (default): <strong>{() => theme.value}</strong></p>
      <button onclick={toggleTheme}>Try Toggle (will warn)</button>
      <p class="description" style="margin-top: 10px;">
        Since this is using the default context, the toggle button will log a warning.
      </p>
    </div>
  )
}

/**
 * Advanced Context Patterns Demo
 */
function AdvancedPatternsDemo() {
  const auth = useContext(AuthContext)
  const { addNotification } = useContext(NotificationContext)

  // Computed value based on context
  const userDisplayName = () => {
    if (!auth.isAuthenticated.value) return 'Guest User'
    const user = auth.user.value
    if (user?.role === 'admin') return `${user.name} (Admin)`
    return user?.name || 'Unknown User'
  }

  const sendTestNotification = () => {
    addNotification(`Test notification at ${new Date().toLocaleTimeString()}`)
  }

  return (
    <div class="demo-section">
      <h2>Advanced Context Patterns</h2>

      <div class="card">
        <h3>Computed Values from Context</h3>
        <p>Display Name: <strong>{userDisplayName}</strong></p>
        <p class="description">
          This computed value derives from the auth context and updates reactively.
        </p>
      </div>

      <div class="card">
        <h3>Context-Triggered Actions</h3>
        <button onclick={sendTestNotification}>Send Test Notification</button>
        <p class="description">
          Actions can use multiple contexts to coordinate state changes.
        </p>
      </div>
    </div>
  )
}

/**
 * Protected Content - Only visible to authenticated users
 */
function ProtectedContent() {
  const auth = useContext(AuthContext)

  return (
    <div class="card">
      {() => auth.isAuthenticated.value ? (
        <div>
          <h3>Protected Content</h3>
          <p class="description">
            This content is only visible to authenticated users!
          </p>
          <div class="info-box">
            <p>Welcome, {() => auth.user.value?.name}!</p>
            <p>You have {() => auth.user.value?.role} privileges.</p>
          </div>
          {() => auth.user.value?.role === 'admin' && (
            <div class="warning-box">
              <strong>Admin Panel:</strong> You have access to administrative features.
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Protected Content</h3>
          <p class="description">Please log in to view this content.</p>
        </div>
      )}
    </div>
  )
}

/**
 * Context Inspector - Debug view of all contexts
 */
function ContextInspector() {
  const { theme } = useContext(ThemeContext)
  const auth = useContext(AuthContext)
  const { notifications } = useContext(NotificationContext)

  return (
    <div class="demo-section">
      <h2>Context Inspector</h2>
      <p class="description">
        Real-time view of all context states. This updates automatically thanks to signals!
      </p>

      <pre>{() => JSON.stringify({
        theme: {
          current: theme.value
        },
        auth: {
          isAuthenticated: auth.isAuthenticated.value,
          user: auth.user.value
        },
        notifications: {
          count: notifications.value.length,
          messages: notifications.value
        }
      }, null, 2)}</pre>
    </div>
  )
}

// ============================================================================
// Main Application Component
// ============================================================================

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
          <div class="container">
            <h1>Flexium Context API Demo</h1>
            <p class="description">
              Comprehensive demonstration of Flexium's Context API with reactive signals,
              nested providers, and multiple contexts working together.
            </p>

            {/* Theme Controls */}
            <ThemeToggle />

            {/* Basic Context Usage */}
            <div class="demo-section">
              <h2>1. Basic Context Usage</h2>
              <div class="grid">
                <CurrentThemeDisplay />
                <UserProfile />
              </div>
            </div>

            {/* Authentication Demo */}
            <div class="demo-section">
              <h2>2. Authentication Context</h2>
              <LoginForm />
              <ProtectedContent />
            </div>

            {/* Multiple Contexts */}
            <div class="demo-section">
              <h2>3. Multiple Contexts</h2>
              <NestedContextConsumer />
              <NotificationDisplay />
            </div>

            {/* Context with Effects */}
            <div class="demo-section">
              <h2>4. Context with Reactive Effects</h2>
              <ContextWithEffects />
            </div>

            {/* Advanced Patterns */}
            <AdvancedPatternsDemo />

            {/* Context Inspector */}
            <ContextInspector />

            {/* Features List */}
            <div class="demo-section">
              <h2>Features Demonstrated</h2>
              <div class="info-box">
                <ul style="margin-left: 20px; line-height: 1.8;">
                  <li><strong>Theme Context:</strong> Dark/light mode with reactive updates</li>
                  <li><strong>Auth Context:</strong> User authentication and role-based access</li>
                  <li><strong>Notification Context:</strong> Cross-component messaging</li>
                  <li><strong>Nested Contexts:</strong> Multiple contexts working together</li>
                  <li><strong>Context + Signals:</strong> Fine-grained reactivity</li>
                  <li><strong>Context + Effects:</strong> Reactive side effects</li>
                  <li><strong>Default Values:</strong> Graceful fallbacks without providers</li>
                  <li><strong>Type Safety:</strong> Full TypeScript support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Separate section for default values demo (outside provider) */}
          <div class="container">
            <DefaultValuesDemo />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  )
}

// ============================================================================
// Render Application
// ============================================================================

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
