---
title: Utilities - API Reference
description: Complete API reference for Flexium's built-in utility functions. context, router, keyboard, and mouse for building reactive applications.
head:
  - - meta
    - property: og:title
      content: Utilities API Reference - Flexium
  - - meta
    - property: og:description
      content: Comprehensive guide to Flexium utility functions for context, routing, and input handling.
---

# Utilities

Complete API reference for Flexium's built-in utility functions for context, routing, and input handling.

## Overview

Flexium provides a set of composable utility functions that integrate seamlessly with the signals-based reactivity system. These are factory functions that return signal-based state - not hooks. They work anywhere in your code without special rules.

### Available Utilities

| Function | Package | Description |
| --- | --- | --- |
| [`use()` with `key`](#usestate-with-key) | `flexium/core` | Share state globally (replaces Context API) |
| [`useRouter()`](#userouter) | `flexium/router` | Access routing state and navigation |
| [`useKeyboard()`](#keyboard) | `flexium-canvas/interactive` | Track keyboard input state |
| [`useMouse()`](#mouse) | `flexium-canvas/interactive` | Track mouse position and button state |

---

## Core Utilities

### Global State

Use `use()` with `key` option to share state across components without Provider boilerplate:


```tsx
import { use } from 'flexium/core';

// Share theme globally - no Provider needed
const [theme, setTheme] = use<'light' | 'dark'>('light', { key: ['app', 'theme'] });

function ThemedButton() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] });
  
  return (
    <button class={`btn-${theme}`}>
      Current theme: {theme}
    </button>
  );
}
```

#### Complex Example: Auth State

```tsx
import { use } from 'flexium/core';

interface User {
  id: string;
  name: string;
  email: string;
}

// Auth state - shared globally
function useAuth() {
  const [user, setUser] = use<User | null>(null, { key: ['app', 'auth', 'user'] });

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return { user, login, logout, isAuthenticated };
}

function UserProfile() {
  const { user, logout } = useAuth();

  const currentUser = user;

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>
      <p>Email: {currentUser.email}</p>
      <button onclick={logout}>Log Out</button>
    </div>
  );
}
```

#### Multiple Global States

```tsx
import { use } from 'flexium/core';

// Theme state
const [theme, setTheme] = use('light', { key: 'app:theme' });

// Language state
const [lang, setLang] = use('en', { key: 'app:language' });

// User state
const [user, setUser] = use(null, { key: 'app:user' });

function ProfileCard() {
  const [theme, setTheme] = use('light', { key: 'app:theme' });
  const [lang, setLang] = use('en', { key: ['app', 'language'] });
  const [user, setUser] = use(null, { key: ['app', 'user'] });

  return (
    <div class={`card-${theme}`}>
      <h2>{lang === 'en' ? 'Profile' : 'Profil'}</h2>
      <p>{user.name}</p>
    </div>
  );
}
```

#### Best Practices

1. **Use descriptive keys**: Use hierarchical keys like `'app:theme'` or `['app', 'auth', 'user']`
2. **Type safety**: Use TypeScript for type-safe state
3. **Cleanup when needed**: Global state is automatically cleaned up when no longer used
4. **Avoid overuse**: Don't use global state for every piece of data - prefer local state when possible

---

## Router Utilities

### useRouter

Access the complete router context including location, params, navigation, and route matches.

#### Signature

```tsx
function useRouter(): RouterContext
```

#### Return Value

Returns a `RouterContext` object:

| Property | Type | Description |
| --- | --- | --- |
| `location` | `StateValue<Location>` | Reactive signal with current location (pathname, search, hash, query) |
| `params` | `StateValue<Record<string, string>>` | Reactive computed signal with route parameters |
| `navigate` | `(path: string) => void` | Function to navigate to a new path |
| `matches` | `StateValue<RouteMatch[]>` | Reactive computed signal with matched routes (root to leaf) |

#### Usage

```tsx
import { useRouter } from 'flexium/router';

function UserProfile() {
  const r = useRouter();

  // Access current location
  const location = r.location;
  console.log(location.pathname); // "/users/123"
  console.log(location.search);   // "?tab=posts"
  console.log(location.hash);     // "#comments"
  console.log(location.query);    // { tab: "posts" }

  // Access route parameters
  const params = r.params;
  console.log(params.id); // "123"

  // Navigate programmatically
  const goToDashboard = () => {
    r.navigate('/dashboard');
  };

  return (
    <div>
      <h1>User {params.id}</h1>
      <button onclick={goToDashboard}>Go to Dashboard</button>
    </div>
  );
}
```

#### Reactive Navigation

```tsx
function SearchBar() {
  const r = useRouter();
  const [query, setQuery] = use('');

  const handleSearch = () => {
    const searchQuery = query;
    r.navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        oninput={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onclick={handleSearch}>Search</button>
    </div>
  );
}
```

#### Conditional Navigation

```tsx
function ProtectedAction() {
  const r = useRouter();

  const handleAction = async () => {
    const isAuthorized = await checkPermissions();

    if (!isAuthorized) {
      // Redirect to login with return URL
      const returnUrl = r.location.pathname;
      r.navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Perform action
    await performAction();
    r.navigate('/success');
  };

  return <button onclick={handleAction}>Perform Action</button>;
}
```

#### Error Handling

Throws an error if used outside a `<Routes>` component:

```
Error: useRouter() must be called within a <Routes> component
```

For complete routing documentation, see the [Router API Reference](/reference/router).

---

## Interactive Hooks

### keyboard

Create a reactive keyboard input handler that tracks key states, just-pressed, and just-released events.

#### Signature

```tsx
function keyboard(target?: EventTarget): KeyboardState
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- |
| `target` | `EventTarget` | `window` | The DOM element to attach keyboard listeners to |

#### Return Value

Returns a `KeyboardState` object:

| Property | Type | Description |
| --- | --- | --- |
| `isPressed(key)` | `(key: string) => boolean` | Check if a key is currently pressed |
| `isJustPressed(key)` | `(key: string) => boolean` | Check if a key was pressed this frame |
| `isJustReleased(key)` | `(key: string) => boolean` | Check if a key was released this frame |
| `getPressedKeys()` | `() => string[]` | Get array of all currently pressed keys |
| `keys` | `() => Set<string>` | Reactive signal getter that updates when key state changes |
| `clearFrameState()` | `() => void` | Clear just-pressed/released state (call at end of frame) |
| `dispose()` | `() => void` | Remove event listeners and cleanup |

#### Usage

```tsx
import { useKeyboard, Keys } from 'flexium-canvas/interactive';
import { use } from 'flexium/core';

function PlayerController() {
  const kb = useKeyboard();
  const [position, setPosition] = use({ x: 0, y: 0 });

  // React to keyboard input
  use(() => {
    const speed = 5;
    const newPos = { ...position };

    if (kb.isPressed(Keys.ArrowUp)) {
      newPos.y -= speed;
    }
    if (kb.isPressed(Keys.ArrowDown)) {
      newPos.y += speed;
    }
    if (kb.isPressed(Keys.ArrowLeft)) {
      newPos.x -= speed;
    }
    if (kb.isPressed(Keys.ArrowRight)) {
      newPos.x += speed;
    }

    setPosition(newPos);
  });

  return (
    <div style={{
      transform: `translate(${position.x}px, ${position.y}px)`
    }}>
      Player
    </div>
  );
}
```

#### Game Loop Integration

```tsx
import { useKeyboard, Keys, useLoop } from 'flexium-canvas/interactive';
import { use } from 'flexium/core';

function Game() {
  const kb = useKeyboard();
  const [player, setPlayer] = use({ x: 100, y: 100, jumping: false });

  useLoop((dt) => {
    const pos = { ...player };

    // Check for jump
    if (kb.isJustPressed(Keys.Space) && !pos.jumping) {
      pos.jumping = true;
    }

    // Movement
    if (kb.isPressed(Keys.KeyA)) {
      pos.x -= 200 * dt;
    }
    if (kb.isPressed(Keys.KeyD)) {
      pos.x += 200 * dt;
    }

    setPlayer(pos);

    // Clear frame state at end of update
    kb.clearFrameState();
  });

  return (
    <div>
      <div style={{
        position: 'absolute',
        left: `${player.x}px`,
        top: `${player.y}px`
      }}>
        🎮
      </div>
    </div>
  );
}
```

#### Key Codes

Flexium provides a `Keys` constant with common key codes:

```tsx
import { Keys } from 'flexium-canvas/interactive';

// Arrow keys
Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight

// WASD
Keys.KeyW, Keys.KeyA, Keys.KeyS, Keys.KeyD

// Common keys
Keys.Space, Keys.Enter, Keys.Escape
Keys.ShiftLeft, Keys.ShiftRight
Keys.ControlLeft, Keys.ControlRight
Keys.Tab

// Numbers
Keys.Digit0, Keys.Digit1, Keys.Digit2, ...
```

#### Custom Target Element

```tsx
function CanvasInput() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const kb = useKeyboard();

  return (
    <canvas
      ref={canvasRef}
      tabindex="0"
      onfocus={() => console.log('Canvas focused')}
    >
      {/* canvas content */}
    </canvas>
  );
}
```

#### Cleanup

```tsx
function GameComponent() {
  const kb = useKeyboard();

  use(() => {
    return () => kb.dispose();
  });

  return <div>Game</div>;
}
```

#### Notes

- Key codes are normalized to lowercase
- When the window loses focus, all keys are cleared automatically
- Call `clearFrameState()` at the end of each frame to reset just-pressed/released states
- The `keys` signal can be used for reactive effects

---

### mouse

Create a reactive mouse input handler that tracks position, button states, and wheel events.

#### Signature

```tsx
function mouse(options?: MouseOptions): MouseState
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `options.target` | `EventTarget` | Element to track mouse relative to (default: `window`) |
| `options.canvas` | `HTMLCanvasElement` | Canvas element for coordinate calculation (optional) |

#### Return Value

Returns a `MouseState` object:

| Property | Type | Description |
| --- | --- | --- |
| `position` | `() => Vec2` | Current mouse position `{ x, y }` |
| `delta` | `() => Vec2` | Mouse movement delta since last frame |
| `isPressed(button)` | `(button: number) => boolean` | Check if mouse button is pressed (0=left, 1=middle, 2=right) |
| `isLeftPressed()` | `() => boolean` | Check if left mouse button is pressed |
| `isRightPressed()` | `() => boolean` | Check if right mouse button is pressed |
| `isMiddlePressed()` | `() => boolean` | Check if middle mouse button is pressed |
| `wheelDelta` | `() => number` | Wheel delta (positive = scroll down) |
| `clearFrameState()` | `() => void` | Clear delta and wheel state (call at end of frame) |
| `dispose()` | `() => void` | Remove event listeners and cleanup |

#### Basic Usage

```tsx
import { mouse } from 'flexium-canvas/interactive';

function MouseTracker() {
  const mouse = useMouse();

  return (
    <div>
      <p>Position: {mouse.position().x}, {mouse.position().y}</p>
      <p>Delta: {mouse.delta().x}, {mouse.delta().y}</p>
      <p>Left Button: {mouse.isLeftPressed() ? 'Pressed' : 'Released'}</p>
      <p>Wheel: {mouse.wheelDelta()}</p>
    </div>
  );
}
```

#### Canvas Drawing

```tsx
import { useMouse } from 'flexium-canvas/interactive';
import { useRef, use } from 'flexium/core';

function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const m = useMouse({
    target: window,
    canvas: canvasRef || undefined
  });

  use(() => {
    const canvas = canvasRef;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (m.isLeftPressed()) {
      const pos = m.position();
      ctx.fillStyle = 'blue';
      ctx.fillRect(pos.x - 5, pos.y - 5, 10, 10);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black' }}
    />
  );
}
```

#### Game Loop Integration

```tsx
import { mouse, useLoop } from 'flexium-canvas/interactive';
import { use } from 'flexium/core';

function ShootingGame() {
  const m = useMouse();
  const [crosshair, setCrosshair] = use({ x: 0, y: 0 });
  const [projectiles, setProjectiles] = use<Array<{ x: number, y: number }>>([]);

  useLoop((dt) => {
    // Update crosshair position
    const pos = m.position();
    setCrosshair({ x: pos.x, y: pos.y });

    // Shoot on left click
    if (m.isLeftPressed()) {
      setProjectiles([...projectiles, { x: pos.x, y: pos.y }]);
    }

    // Clear frame state
    m.clearFrameState();
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        left: `${crosshair.x}px`,
        top: `${crosshair.y}px`,
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        border: '2px solid red',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Projectiles */}
      {projectiles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}px`,
          top: `${p.y}px`,
          width: '5px',
          height: '5px',
          background: 'yellow',
          borderRadius: '50%'
        }} />
      ))}
    </div>
  );
}
```

#### Zoom with Wheel

```tsx
function ZoomableView() {
  const m = useMouse();
  const [zoom, setZoom] = use(1);

  use(() => {
    const wheel = m.wheelDelta();
    if (wheel !== 0) {
      const newZoom = zoom + (wheel * -0.1);
      setZoom(Math.max(0.5, Math.min(3, newZoom)));
    }
  });

  return (
    <div style={{
      transform: `scale(${zoom})`,
      transformOrigin: 'center center',
      transition: 'transform 0.1s'
    }}>
      Zoom level: {zoom.toFixed(2)}
    </div>
  );
}
```

#### Mouse Button Constants

```tsx
import { MouseButton } from 'flexium-canvas/interactive';

MouseButton.Left    // 0
MouseButton.Middle  // 1
MouseButton.Right   // 2
```

#### Cleanup

```tsx
import { use } from 'flexium/core'

function GameComponent() {
  const m = useMouse();

  use(() => {
    return () => m.dispose();
  });

  return <div>Game</div>;
}
```

#### Notes

- When using a canvas, coordinates are automatically scaled to canvas resolution
- Mouse buttons are cleared when mouse leaves the target element
- Call `clearFrameState()` at the end of each frame to reset deltas
- The `position`, `delta`, and `wheelDelta` signals can be used in reactive effects

---

## Animation

See the [Motion API Reference](/reference/primitives/motion) for detailed documentation on using `MotionController` for animations.

---

## Custom Hooks Patterns

### Creating Custom Hooks

Flexium doesn't have special rules for hooks - you can create custom hooks by combining existing hooks and signals.

#### Form Hook

```tsx
import { use } from 'flexium/core';

function useForm<T>(initialValues: T) {
  const [values, setValues] = use(initialValues);
  const [errors, setErrors] = use<Record<string, string>>({});
  const [touched, setTouched] = use<Record<string, boolean>>({});

  const setValue = (field: keyof T, value: unknown) => {
    setValues({ ...values, [field]: value });
  };

  const setError = (field: keyof T, error: string) => {
    setErrors({ ...errors, [field]: error });
  };

  const setTouched = (field: keyof T) => {
    setTouched({ ...touched, [field]: true });
  };

  const validate = (validators: Record<keyof T, (value: unknown) => string | null>) => {
    const newErrors: Record<string, string> = {};

    for (const field in validators) {
      const error = validators[field](values[field]);
      if (error) {
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    validate
  };
}

// Usage
function LoginForm() {
  const form = useForm({ email: '', password: '' });

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const isValid = form.validate({
      email: (val) => !val ? 'Email is required' : null,
      password: (val) => !val || val.length < 6 ? 'Password must be at least 6 characters' : null
    });

    if (isValid) {
      console.log('Submit:', form.values);
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      <input
        type="email"
        value={form.values.email}
        oninput={(e) => form.setValue('email', e.target.value)}
        onblur={() => form.setTouched('email')}
      />
      {form.errors.email && form.touched.email && (
        <div class="error">{form.errors.email}</div>
      )}

      <input
        type="password"
        value={form.values.password}
        oninput={(e) => form.setValue('password', e.target.value)}
        onblur={() => form.setTouched('password')}
      />
      {form.errors.password && form.touched.password && (
        <div class="error">{form.errors.password}</div>
      )}

      <button type="submit">Login</button>
    </form>
  );
}
```

#### Fetch Hook

```tsx
import { use } from 'flexium/core';

function useFetch<T>(url: string) {
  const [data, setData] = use<T | null>(null);
  const [loading, setLoading] = use(true);
  const [error, setError] = use<Error | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  use(() => {
    refetch();
  });

  return { data, loading, error, refetch };
}

// Usage
function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onclick={refetch}>Refresh</button>
      <ul>
        {data?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Local Storage Hook

```tsx
import { use } from 'flexium/core';

function useLocalStorage<T>(key: string, initialValue: T) {
  const storedValue = localStorage.getItem(key);
  const [value, setValue] = use<T>(
    storedValue ? JSON.parse(storedValue) : initialValue
  );

  // Save to localStorage on change
  use(() => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  const remove = () => {
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  return [value, remove] as const;
}

// Usage
function ThemeToggle() {
  const [theme, clearTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <button onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme (Current: {theme})
      </button>
      <button onclick={clearTheme}>
        Reset Theme
      </button>
    </div>
  );
}
```

#### Window Size Hook

```tsx
import { use } from 'flexium/core';

function useWindowSize() {
  const [width, setWidth] = use(window.innerWidth);
  const [height, setHeight] = use(window.innerHeight);

  const handleResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  use(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return { width, height };
}

// Usage
function ResponsiveComponent() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Window size: {width} x {height}</p>
      {width < 768 && <div>Mobile view</div>}
      {width >= 768 && <div>Desktop view</div>}
    </div>
  );
}
```

---

## When to Use Which Hook

### Global State (`use()` with `key`)
- **Use when**: Sharing state across multiple nested components
- **Don't use when**: Data is only needed by one or two components (use props instead)
- **Example**: Theme, authentication, language settings

### useRouter
- **Use when**: Need access to URL, params, or navigation in any component
- **Don't use when**: Simple links suffice (use `<Link>` component)
- **Example**: Programmatic navigation, reading query params, route guards

### keyboard
- **Use when**: Building games, interactive applications, keyboard shortcuts
- **Don't use when**: Standard form inputs suffice
- **Example**: Game controls, canvas editors, keyboard navigation

### mouse
- **Use when**: Building games, drawing apps, custom interactions
- **Don't use when**: Standard click handlers suffice
- **Example**: Drawing tools, drag-and-drop, game targeting

---

## Best Practices

### 1. Always Cleanup Resources

```tsx
import { use } from 'flexium/core'

function GameComponent() {
  const kb = useKeyboard();
  const m = useMouse();

  use(() => {
    return () => {
      kb.dispose();
      m.dispose();
    };
  });

  return <div>Game</div>;
}
```

### 2. Type Safety with TypeScript

```tsx
import { use } from 'flexium/core';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
}

// Use use() with key instead of Context
const [appState, setAppState] = use<AppState>({
  user: null,
  theme: 'light'
}, { key: ['app', 'state'] });

function Component() {
  const [appState, setAppState] = use<AppState>({
    user: null,
    theme: 'light'
  }, { key: ['app', 'state'] });
  // TypeScript ensures correct usage
}
```

### 3. Combine Utilities Effectively

```tsx
import { use } from 'flexium/core';
import { useRouter } from 'flexium/router';
import { useKeyboard, Keys } from 'flexium-canvas/interactive';

function GamePlayer() {
  const { navigate } = useRouter();
  const kb = useKeyboard();
  const [position, setPosition] = use({ x: 0, y: 0 });

  use(() => {
    // Update position based on keyboard
    if (kb.isPressed(Keys.ArrowUp)) {
      setPosition(p => ({ ...p, y: p.y - 5 }));
    }
    // ...
  });

  return <div>Game</div>;
}
```

### 4. Memoize Expensive Computations

```tsx
function DataDisplay() {
  const { data } = useFetch('/api/data');

  // Use derived state for expensive transformations
  const [processedData] = use(() => {
    if (!data) return [];
    return expensiveTransformation(data);
  });

  return <div>{JSON.stringify(processedData)}</div>;
}
```

### 5. Keep Hooks Simple and Focused

```tsx
import { use } from 'flexium/core';

// Good: Single responsibility
function useAuth() {
  const [user, setUser] = use(null);
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  return { user, login, logout };
}

// Bad: Too many responsibilities
function useEverything() {
  const [user, setUser] = use(null);
  const [theme, setTheme] = use('light');
  const kb = useKeyboard();
  const r = useRouter();
  // Too much!
}
```

---

## See Also

- [State Management](/guide/state) - Working with signals and effects
- [Global State Sharing](/guide/context) - Using use() with key for global state
- [Router Guide](/guide/router) - Complete routing documentation
- [Interactive Apps](/guide/interactive) - Building games with Flexium
- [Animation](/guide/animation) - Animation techniques and patterns
