# Flexium Context API Demo

A comprehensive demonstration of Flexium's Context API, showcasing how to share state across component trees without prop drilling. This example demonstrates theme management, authentication, notifications, and advanced context patterns with reactive signals.

## Features Demonstrated

### 1. **Basic Context Usage**
- Creating contexts with `createContext()`
- Providing context values with `Context.Provider`
- Consuming context with `useContext()`
- Default context values

### 2. **Theme Context**
- Dark/light mode toggle
- Global theme state management
- Reactive theme updates across components
- CSS class synchronization with theme state

### 3. **Authentication Context**
- User login/logout functionality
- Protected content based on auth state
- Role-based access control (Admin vs User)
- Authentication state management with signals

### 4. **Notification System**
- Cross-component messaging
- Auto-dismissing notifications
- Centralized notification management
- Multiple contexts coordinating together

### 5. **Advanced Patterns**
- **Nested Contexts**: Multiple contexts working together
- **Context + Signals**: Fine-grained reactivity
- **Context + Effects**: Reactive side effects that respond to context changes
- **Computed Values**: Deriving values from context state
- **Protected Routes**: Conditional rendering based on auth context
- **Context Composition**: Contexts depending on other contexts

### 6. **Type Safety**
- Full TypeScript support
- Type-safe context values
- Strongly typed user objects and roles

## Project Structure

```
context-demo/
├── src/
│   └── main.tsx          # Main application with all demos
├── index.html            # HTML template with dark mode styles
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md            # This file
```

## Running the Demo

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The demo will open at `http://localhost:3003`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## How Context Works in Flexium

### Creating a Context

```tsx
import { createContext } from 'flexium/core'

interface ThemeContextValue {
  theme: Signal<'light' | 'dark'>
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: signal('light'),
  toggleTheme: () => console.warn('No provider')
})
```

### Providing Context Values

```tsx
function ThemeProvider(props: { children: any }) {
  const theme = signal<'light' | 'dark'>('light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const value = { theme, toggleTheme }

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  )
}
```

### Consuming Context

```tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button onclick={toggleTheme}>
      {() => theme.value === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  )
}
```

## Key Concepts

### Context Stack Management
Flexium's Context API uses a stack-based approach to manage nested providers:
- When a Provider is rendered, its value is pushed onto a stack
- Child components access the top of the stack
- When the Provider unmounts, its value is popped from the stack
- This allows for proper nesting and override behavior

### Context + Signals
Combining Context with Signals provides fine-grained reactivity:
- Context values can contain signals
- Components automatically re-render when signal values change
- No need for manual subscriptions or state management
- Optimal performance with minimal re-renders

### Default Values
Every context must have a default value:
- Used when `useContext()` is called outside a Provider
- Prevents runtime errors
- Provides graceful fallbacks
- Useful for testing and error messages

### Multiple Contexts
Components can consume multiple contexts simultaneously:
- Call `useContext()` multiple times for different contexts
- Contexts can depend on other contexts
- Provider order matters for context dependencies
- Natural composition of cross-cutting concerns

## Interactive Demo Sections

### 1. Theme Toggle
- Switch between light and dark modes
- Observe real-time updates across all components
- Body element class changes automatically

### 2. Authentication Flow
- Login as Admin or User
- See role-based content
- Protected content only visible when authenticated
- Logout clears authentication state

### 3. Notifications
- Automatic notifications on login/logout
- Manual test notifications
- Auto-dismiss after 5 seconds
- Clear all notifications button

### 4. Context Inspector
- Real-time JSON view of all context states
- Updates automatically with any state change
- Great for debugging

### 5. Nested Context Consumer
- Single component consuming multiple contexts
- Demonstrates context composition
- Shows current theme and auth state together

### 6. Context with Effects
- Side effects that respond to context changes
- Console logging of state changes
- Counter tracking total context updates

## Code Examples from the Demo

### Multi-Context Provider Pattern

```tsx
function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
          <YourApp />
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  )
}
```

### Context with Reactive Effects

```tsx
function ContextWithEffects() {
  const { theme } = useContext(ThemeContext)
  const auth = useContext(AuthContext)

  effect(() => {
    console.log('Theme changed to:', theme.value)
  })

  effect(() => {
    if (auth.isAuthenticated.value) {
      console.log('User authenticated:', auth.user.value?.name)
    }
  })

  return <div>Check console for effect logs!</div>
}
```

### Protected Content Pattern

```tsx
function ProtectedContent() {
  const auth = useContext(AuthContext)

  return (
    <div>
      {() => auth.isAuthenticated.value ? (
        <div>Protected content here!</div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  )
}
```

## Best Practices Demonstrated

1. **Type Safety**: Use TypeScript interfaces for context values
2. **Default Values**: Always provide meaningful defaults
3. **Signal Integration**: Use signals within context for reactivity
4. **Context Composition**: Compose multiple contexts for complex state
5. **Provider Hierarchy**: Order providers based on dependencies
6. **Separation of Concerns**: Each context handles one aspect of state
7. **Error Handling**: Graceful fallbacks and warning messages
8. **Performance**: Signals ensure minimal re-renders

## Common Patterns

### 1. Authentication Context
```tsx
const AuthContext = createContext<AuthContextValue>({
  user: signal(null),
  isAuthenticated: signal(false),
  login: () => {},
  logout: () => {}
})
```

### 2. Theme Context
```tsx
const ThemeContext = createContext<ThemeContextValue>({
  theme: signal('light'),
  toggleTheme: () => {}
})
```

### 3. Notification/Toast Context
```tsx
const NotificationContext = createContext<NotificationContextValue>({
  notifications: signal([]),
  addNotification: () => {},
  clearNotifications: () => {}
})
```

## Comparison with React Context

### Similarities
- Same conceptual model (Provider/Consumer)
- Context nesting and override behavior
- Default values support

### Differences
- **Signals**: Flexium uses signals for fine-grained reactivity
- **No Re-render Cascades**: Only components using changed signals update
- **Simpler API**: Direct value access without hooks complexity
- **Better Performance**: No virtual DOM diffing overhead
- **TypeScript First**: Built with TypeScript from the ground up

## Learn More

- [Flexium Core Documentation](../../packages/flexium/src/core)
- [Context API Tests](../../packages/flexium/src/core/__tests__/context.test.ts)
- [Signal System](../../packages/flexium/src/core/signal.ts)

## License

MIT - Part of the Flexium framework
