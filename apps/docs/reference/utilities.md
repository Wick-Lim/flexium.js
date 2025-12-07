---
title: Utilities - API Reference
description: Complete API reference for Flexium's built-in utility functions. context, router, keyboard, mouse, and errorBoundary for building reactive applications.
head:
  - - meta
    - property: og:title
      content: Utilities API Reference - Flexium
  - - meta
    - property: og:description
      content: Comprehensive guide to Flexium utility functions for context, routing, input handling, animation, and error boundaries.
---

# Utilities

Complete API reference for Flexium's built-in utility functions for context, routing, input handling, animation, and error boundaries.

## Overview

Flexium provides a set of composable utility functions that integrate seamlessly with the signals-based reactivity system. These are factory functions that return signal-based state - not hooks. They work anywhere in your code without special rules.

### Available Utilities

| Function | Package | Description |
| --- | --- | --- |
| [`context()`](#context) | `flexium/core` | Access values from a context provider |
| [`router()`](#router) | `flexium/router` | Access routing state and navigation |
| [`keyboard()`](#keyboard) | `flexium/interactive` | Track keyboard input state |
| [`mouse()`](#mouse) | `flexium/interactive` | Track mouse position and button state |
| [`errorBoundary()`](#errorboundary) | `flexium/core` | Handle errors in components |

---

## Core Utilities

### context

Access values from a Context provider. Works with contexts created by `createContext()`.

#### Signature

```tsx
function context<T>(ctx: Context<T>): T
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `context` | `Context<T>` | Context object created by `createContext()` |

#### Return Value

Returns the current value of the context. If no provider is found in the component tree, returns the context's default value.

#### Usage

```tsx
import { createContext, context } from 'flexium';

// Create a context with a default value
const ThemeContext = createContext<'light' | 'dark'>('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = context(ThemeContext);

  return (
    <button class={`btn-${theme}`}>
      Current theme: {theme}
    </button>
  );
}
```

#### Complex Context Example

```tsx
import { createContext, context, signal } from 'flexium';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: Signal<User | null>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }) {
  const user = signal<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const userData = await response.json();
    user.value = userData;
  };

  const logout = () => {
    user.value = null;
  };

  const isAuthenticated = () => {
    return user.value !== null;
  };

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function UserProfile() {
  const auth = context(AuthContext);

  if (!auth) {
    throw new Error('UserProfile must be used within AuthProvider');
  }

  const currentUser = auth.user();

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>
      <p>Email: {currentUser.email}</p>
      <button onclick={auth.logout}>Log Out</button>
    </div>
  );
}
```

#### Multiple Contexts

```tsx
const ThemeContext = createContext('light');
const LanguageContext = createContext('en');
const UserContext = createContext(null);

function ProfileCard() {
  const theme = context(ThemeContext);
  const lang = context(LanguageContext);
  const user = context(UserContext);

  return (
    <div class={`card-${theme}`}>
      <h2>{lang === 'en' ? 'Profile' : 'Profil'}</h2>
      <p>{user?.name}</p>
    </div>
  );
}
```

#### Best Practices

1. **Provide default values**: Always provide sensible defaults to `createContext()`
2. **Type safety**: Use TypeScript for type-safe context values
3. **Check for null**: When context might not have a provider, check for null
4. **Avoid overuse**: Don't use context for every piece of state - prefer props for local data

---

### errorBoundary

Access the nearest ErrorBoundary context to manually trigger error handling or retry failed operations.

#### Signature

```tsx
function errorBoundary(): ErrorBoundaryContextValue
```

#### Return Value

Returns an object with error handling methods:

| Property | Type | Description |
| --- | --- | --- |
| `setError` | `(error: unknown) => void` | Manually trigger error boundary with an error |
| `clearError` | `() => void` | Clear the current error state |
| `retry` | `() => void` | Retry the failed operation (clears error and increments retry count) |

#### Usage

```tsx
import { errorBoundary } from 'flexium';

function DataFetcher() {
  const { setError } = errorBoundary();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return await response.json();
    } catch (err) {
      // Pass error to nearest ErrorBoundary
      setError(err);
    }
  };

  return (
    <button onclick={fetchData}>
      Load Data
    </button>
  );
}
```

#### With ErrorBoundary Component

```tsx
import { ErrorBoundary, errorBoundary } from 'flexium';

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, reset, retryCount }) => (
        <div class="error-container">
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <p>Retry attempts: {retryCount}</p>
          <button onclick={reset}>Try Again</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Error caught:', error);
        console.error('Timestamp:', errorInfo.timestamp);
      }}
    >
      <DataFetcher />
    </ErrorBoundary>
  );
}

function DataFetcher() {
  const { setError, retry } = errorBoundary();
  const data = signal(null);

  const loadData = async () => {
    try {
      const result = await fetchData();
      data.value = result;
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      <button onclick={loadData}>Load Data</button>
      {data.value && <div>{JSON.stringify(data.value)}</div>}
    </div>
  );
}
```

#### Manual Error Recovery

```tsx
function FormSubmit() {
  const { setError, clearError } = errorBoundary();
  const errors = signal<string[]>([]);

  const handleSubmit = async (formData: FormData) => {
    errors.value = [];
    clearError(); // Clear any previous errors

    try {
      const response = await submitForm(formData);

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Success
      alert('Form submitted!');
    } catch (err) {
      if (err instanceof ValidationError) {
        // Handle validation errors locally
        errors.value = err.messages;
      } else {
        // Pass fatal errors to error boundary
        setError(err);
      }
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      {errors.value.map(err => (
        <div class="error">{err}</div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### Behavior Outside ErrorBoundary

If `errorBoundary()` is called outside an `<ErrorBoundary>` component, it returns a no-op implementation that logs the error and re-throws it.

---

## Router Hooks

### router

Access the complete router context including location, params, navigation, and route matches.

#### Signature

```tsx
function router(): RouterContext
```

#### Return Value

Returns a `RouterContext` object:

| Property | Type | Description |
| --- | --- | --- |
| `location` | `Signal<Location>` | Reactive signal with current location (pathname, search, hash, query) |
| `params` | `Computed<Record<string, string>>` | Reactive computed signal with route parameters |
| `navigate` | `(path: string) => void` | Function to navigate to a new path |
| `matches` | `Computed<RouteMatch[]>` | Reactive computed signal with matched routes (root to leaf) |

#### Usage

```tsx
import { router } from 'flexium/router';

function UserProfile() {
  const router = router();

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
  const goToDashboard = () => {
    router.navigate('/dashboard');
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
  const router = router();
  const query = signal('');

  const handleSearch = () => {
    const searchQuery = query.value;
    router.navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        oninput={(e) => query.value = e.target.value}
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
  const router = router();

  const handleAction = async () => {
    const isAuthorized = await checkPermissions();

    if (!isAuthorized) {
      // Redirect to login with return URL
      const returnUrl = router.location().pathname;
      router.navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Perform action
    await performAction();
    router.navigate('/success');
  };

  return <button onclick={handleAction}>Perform Action</button>;
}
```

#### Error Handling

Throws an error if used outside a `<Router>` component:

```
Error: router() must be called within a <Router> component
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
| `keys` | `Signal<Set<string>>` | Reactive signal that updates when key state changes |
| `clearFrameState()` | `() => void` | Clear just-pressed/released state (call at end of frame) |
| `dispose()` | `() => void` | Remove event listeners and cleanup |

#### Usage

```tsx
import { keyboard, Keys } from 'flexium/interactive';
import { effect } from 'flexium';

function PlayerController() {
  const keyboard = keyboard();
  const position = signal({ x: 0, y: 0 });

  // React to keyboard input
  effect(() => {
    const speed = 5;
    const newPos = { ...position.value };

    if (keyboard.isPressed(Keys.ArrowUp)) {
      newPos.y -= speed;
    }
    if (keyboard.isPressed(Keys.ArrowDown)) {
      newPos.y += speed;
    }
    if (keyboard.isPressed(Keys.ArrowLeft)) {
      newPos.x -= speed;
    }
    if (keyboard.isPressed(Keys.ArrowRight)) {
      newPos.x += speed;
    }

    position.value = newPos;
  });

  return (
    <div style={{
      transform: `translate(${position.value.x}px, ${position.value.y}px)`
    }}>
      Player
    </div>
  );
}
```

#### Game Loop Integration

```tsx
import { keyboard, Keys, createLoop } from 'flexium/interactive';

function Game() {
  const keyboard = keyboard();
  const player = signal({ x: 100, y: 100, jumping: false });

  createLoop((dt) => {
    const pos = { ...player.value };

    // Check for jump
    if (keyboard.isJustPressed(Keys.Space) && !pos.jumping) {
      pos.jumping = true;
    }

    // Movement
    if (keyboard.isPressed(Keys.KeyA)) {
      pos.x -= 200 * dt;
    }
    if (keyboard.isPressed(Keys.KeyD)) {
      pos.x += 200 * dt;
    }

    player.value = pos;

    // Clear frame state at end of update
    keyboard.clearFrameState();
  });

  return (
    <div>
      <div style={{
        position: 'absolute',
        left: `${player.value.x}px`,
        top: `${player.value.y}px`
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
import { Keys } from 'flexium/interactive';

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
  const canvasRef = signal<HTMLCanvasElement | null>(null);
  const kb = keyboard(canvasRef.value || window);

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
  const keyboard = keyboard();

  onCleanup(() => {
    keyboard.dispose();
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
| `position` | `Signal<Vec2>` | Current mouse position `{ x, y }` |
| `delta` | `Signal<Vec2>` | Mouse movement delta since last frame |
| `isPressed(button)` | `(button: number) => boolean` | Check if mouse button is pressed (0=left, 1=middle, 2=right) |
| `isLeftPressed()` | `() => boolean` | Check if left mouse button is pressed |
| `isRightPressed()` | `() => boolean` | Check if right mouse button is pressed |
| `isMiddlePressed()` | `() => boolean` | Check if middle mouse button is pressed |
| `wheelDelta` | `Signal<number>` | Wheel delta (positive = scroll down) |
| `clearFrameState()` | `() => void` | Clear delta and wheel state (call at end of frame) |
| `dispose()` | `() => void` | Remove event listeners and cleanup |

#### Basic Usage

```tsx
import { mouse } from 'flexium/interactive';

function MouseTracker() {
  const mouse = mouse();

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
import { mouse } from 'flexium/interactive';
import { signal, effect } from 'flexium';

function DrawingCanvas() {
  const canvasRef = signal<HTMLCanvasElement | null>(null);
  const mouse = mouse({
    target: window,
    canvas: canvasRef.value || undefined
  });

  effect(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mouse.isLeftPressed()) {
      const pos = mouse.position();
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
import { mouse, createLoop } from 'flexium/interactive';

function ShootingGame() {
  const mouse = mouse();
  const crosshair = signal({ x: 0, y: 0 });
  const projectiles = signal<Array<{ x: number, y: number }>>([]);

  createLoop((dt) => {
    // Update crosshair position
    const pos = mouse.position();
    crosshair.value = { x: pos.x, y: pos.y };

    // Shoot on left click
    if (mouse.isLeftPressed()) {
      const newProjectiles = [...projectiles.value];
      newProjectiles.push({ x: pos.x, y: pos.y });
      projectiles.value = newProjectiles;
    }

    // Clear frame state
    mouse.clearFrameState();
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        left: `${crosshair.value.x}px`,
        top: `${crosshair.value.y}px`,
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        border: '2px solid red',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Projectiles */}
      {projectiles.value.map((p, i) => (
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
  const mouse = mouse();
  const zoom = signal(1);

  effect(() => {
    const wheel = mouse.wheelDelta();
    if (wheel !== 0) {
      const newZoom = zoom.value + (wheel * -0.1);
      zoom.value = Math.max(0.5, Math.min(3, newZoom));
    }
  });

  return (
    <div style={{
      transform: `scale(${zoom.value})`,
      transformOrigin: 'center center',
      transition: 'transform 0.1s'
    }}>
      Zoom level: {zoom.value.toFixed(2)}
    </div>
  );
}
```

#### Mouse Button Constants

```tsx
import { MouseButton } from 'flexium/interactive';

MouseButton.Left    // 0
MouseButton.Middle  // 1
MouseButton.Right   // 2
```

#### Cleanup

```tsx
function GameComponent() {
  const mouse = mouse();

  onCleanup(() => {
    mouse.dispose();
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

## Animation Hooks

### useMotion

Create signal-driven animations using the Web Animations API. Automatically updates when signal values change.

#### Signature

```tsx
function useMotion(
  element: HTMLElement,
  propsSignal: Signal<MotionProps>
): {
  controller: MotionController;
  dispose: () => void;
}
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `element` | `HTMLElement` | The DOM element to animate |
| `propsSignal` | `Signal<MotionProps>` | Reactive signal containing animation properties |

#### Return Value

Returns an object with:

| Property | Type | Description |
| --- | --- | --- |
| `controller` | `MotionController` | Motion controller for advanced animation control |
| `dispose` | `() => void` | Cleanup function to stop animations and dispose resources |

#### MotionProps

```tsx
interface MotionProps {
  initial?: AnimatableProps;   // Starting state
  animate?: AnimatableProps;   // Target state
  exit?: AnimatableProps;      // Exit state
  duration?: number;           // Duration in milliseconds
  spring?: SpringConfig;       // Spring physics config
  easing?: string;             // CSS easing function
  delay?: number;              // Delay before animation starts
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}
```

#### AnimatableProps

```tsx
interface AnimatableProps {
  x?: number;              // Horizontal translation (px)
  y?: number;              // Vertical translation (px)
  scale?: number;          // Uniform scale
  scaleX?: number;         // Horizontal scale
  scaleY?: number;         // Vertical scale
  rotate?: number;         // Rotation (degrees)
  opacity?: number;        // Opacity (0-1)
  width?: number | string; // Width
  height?: number | string; // Height
}
```

#### Basic Usage

```tsx
import { useMotion } from 'flexium/primitives/motion';
import { signal } from 'flexium';

function AnimatedBox() {
  const elementRef = signal<HTMLElement | null>(null);
  const isVisible = signal(false);

  const motionProps = signal<MotionProps>({
    initial: { opacity: 0, y: 20 },
    animate: isVisible.value
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 20 },
    duration: 300,
    easing: 'ease-out'
  });

  effect(() => {
    const element = elementRef.value;
    if (!element) return;

    const motion = useMotion(element, motionProps);

    return () => motion.dispose();
  });

  return (
    <div>
      <button onclick={() => isVisible.value = !isVisible.value}>
        Toggle
      </button>
      <div ref={elementRef}>
        Animated Content
      </div>
    </div>
  );
}
```

#### Spring Animation

```tsx
function SpringBox() {
  const elementRef = signal<HTMLElement | null>(null);
  const position = signal(0);

  const motionProps = signal<MotionProps>({
    animate: { x: position.value },
    spring: {
      tension: 170,  // Stiffness
      friction: 26,  // Damping
      mass: 1        // Mass
    }
  });

  effect(() => {
    if (!elementRef.value) return;
    const motion = useMotion(elementRef.value, motionProps);
    return () => motion.dispose();
  });

  return (
    <div>
      <button onclick={() => position.value = position.value + 100}>
        Move Right
      </button>
      <div ref={elementRef} style={{ width: '50px', height: '50px', background: 'blue' }} />
    </div>
  );
}
```

#### Rotation Animation

```tsx
function RotatingCard() {
  const elementRef = signal<HTMLElement | null>(null);
  const isFlipped = signal(false);

  const motionProps = signal<MotionProps>({
    animate: {
      rotate: isFlipped.value ? 180 : 0,
      scale: isFlipped.value ? 1.1 : 1
    },
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  });

  effect(() => {
    if (!elementRef.value) return;
    const motion = useMotion(elementRef.value, motionProps);
    return () => motion.dispose();
  });

  return (
    <div
      ref={elementRef}
      onclick={() => isFlipped.value = !isFlipped.value}
      style={{
        width: '200px',
        height: '300px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        cursor: 'pointer'
      }}
    >
      Click to flip
    </div>
  );
}
```

#### Sequence Animation

```tsx
function SequenceAnimation() {
  const elementRef = signal<HTMLElement | null>(null);
  const step = signal(0);

  const motionProps = computed(() => {
    const animations = [
      { x: 0, y: 0, opacity: 1 },
      { x: 100, y: 0, opacity: 1 },
      { x: 100, y: 100, opacity: 0.5 },
      { x: 0, y: 100, opacity: 1 },
      { x: 0, y: 0, opacity: 1 }
    ];

    return {
      animate: animations[step.value % animations.length],
      duration: 500,
      easing: 'ease-in-out',
      onAnimationComplete: () => {
        setTimeout(() => step.value++, 200);
      }
    };
  });

  effect(() => {
    if (!elementRef.value) return;
    const motion = useMotion(elementRef.value, motionProps);
    return () => motion.dispose();
  });

  return <div ref={elementRef}>Moving Box</div>;
}
```

#### MotionController Methods

The `MotionController` provides advanced control:

```tsx
const motion = useMotion(element, propsSignal);

// Cancel current animation
motion.controller.cancel();

// Animate to exit state
await motion.controller.animateExit(
  { opacity: 0, scale: 0 },
  300,
  'ease-in'
);

// Enable automatic layout animations
motion.controller.enableLayoutAnimation(300, 'ease-out');

// Disable layout animations
motion.controller.disableLayoutAnimation();

// Cleanup
motion.dispose();
```

#### Notes

- Uses the Web Animations API for performant animations
- Animations automatically update when the props signal changes
- Always call `dispose()` when the component unmounts
- Spring physics are approximated using cubic-bezier curves
- For simple animations, consider using CSS transitions instead

---

## Custom Hooks Patterns

### Creating Custom Hooks

Flexium doesn't have special rules for hooks - you can create custom hooks by combining existing hooks and signals.

#### Form Hook

```tsx
function useForm<T>(initialValues: T) {
  const values = signal(initialValues);
  const errors = signal<Record<string, string>>({});
  const touched = signal<Record<string, boolean>>({});

  const setValue = (field: keyof T, value: unknown) => {
    values.value = { ...values.value, [field]: value };
  };

  const setError = (field: keyof T, error: string) => {
    errors.value = { ...errors.value, [field]: error };
  };

  const setTouched = (field: keyof T) => {
    touched.value = { ...touched.value, [field]: true };
  };

  const validate = (validators: Record<keyof T, (value: unknown) => string | null>) => {
    const newErrors: Record<string, string> = {};

    for (const field in validators) {
      const error = validators[field](values.value[field]);
      if (error) {
        newErrors[field] = error;
      }
    }

    errors.value = newErrors;
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
      console.log('Submit:', form.values.value);
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      <input
        type="email"
        value={form.values.value.email}
        oninput={(e) => form.setValue('email', e.target.value)}
        onblur={() => form.setTouched('email')}
      />
      {form.errors.value.email && form.touched.value.email && (
        <div class="error">{form.errors.value.email}</div>
      )}

      <input
        type="password"
        value={form.values.value.password}
        oninput={(e) => form.setValue('password', e.target.value)}
        onblur={() => form.setTouched('password')}
      />
      {form.errors.value.password && form.touched.value.password && (
        <div class="error">{form.errors.value.password}</div>
      )}

      <button type="submit">Login</button>
    </form>
  );
}
```

#### Fetch Hook

```tsx
function useFetch<T>(url: string) {
  const data = signal<T | null>(null);
  const loading = signal(true);
  const error = signal<Error | null>(null);

  const refetch = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      data.value = json;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  // Fetch on mount
  onMount(() => {
    refetch();
  });

  return { data, loading, error, refetch };
}

// Usage
function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading.value) return <div>Loading...</div>;
  if (error.value) return <div>Error: {error.value.message}</div>;

  return (
    <div>
      <button onclick={refetch}>Refresh</button>
      <ul>
        {data.value?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Local Storage Hook

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const storedValue = localStorage.getItem(key);
  const value = signal<T>(
    storedValue ? JSON.parse(storedValue) : initialValue
  );

  // Save to localStorage on change
  effect(() => {
    localStorage.setItem(key, JSON.stringify(value.value));
  });

  const remove = () => {
    localStorage.removeItem(key);
    value.value = initialValue;
  };

  return [value, remove] as const;
}

// Usage
function ThemeToggle() {
  const [theme, clearTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <button onclick={() => theme.value = theme.value === 'light' ? 'dark' : 'light'}>
        Toggle Theme (Current: {theme.value})
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
function useWindowSize() {
  const width = signal(window.innerWidth);
  const height = signal(window.innerHeight);

  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMount(() => {
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
      <p>Window size: {width.value} x {height.value}</p>
      {width.value < 768 && <div>Mobile view</div>}
      {width.value >= 768 && <div>Desktop view</div>}
    </div>
  );
}
```

---

## When to Use Which Hook

### context
- **Use when**: Sharing state across multiple nested components
- **Don't use when**: Data is only needed by one or two components (use props instead)
- **Example**: Theme, authentication, language settings

### router
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

### useMotion
- **Use when**: Need signal-driven, reactive animations
- **Don't use when**: CSS transitions/animations are sufficient
- **Example**: Interactive UI animations, game sprites, physics simulations

### errorBoundary
- **Use when**: Need to handle errors manually or retry operations
- **Don't use when**: Automatic error catching by `<ErrorBoundary>` is sufficient
- **Example**: Async operations, API calls, manual error reporting

---

## Best Practices

### 1. Always Cleanup Resources

```tsx
function GameComponent() {
  const keyboard = keyboard();
  const mouse = mouse();

  onCleanup(() => {
    keyboard.dispose();
    mouse.dispose();
  });

  return <div>Game</div>;
}
```

### 2. Type Safety with TypeScript

```tsx
import { context, createContext } from 'flexium';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
}

const AppContext = createContext<AppState>({
  user: null,
  theme: 'light'
});

function Component() {
  const state: AppState = context(AppContext);
  // TypeScript ensures correct usage
}
```

### 3. Combine Hooks Effectively

```tsx
function GamePlayer() {
  const router = router();
  const keyboard = keyboard();
  const { setError } = errorBoundary();

  const position = signal({ x: 0, y: 0 });

  effect(() => {
    try {
      // Update position based on keyboard
      if (keyboard.isPressed(Keys.ArrowUp)) {
        position.value = { ...position.value, y: position.value.y - 5 };
      }
      // ...
    } catch (err) {
      setError(err);
    }
  });

  return <div>Game</div>;
}
```

### 4. Memoize Expensive Computations

```tsx
function DataDisplay() {
  const { data } = useFetch('/api/data');

  // Use computed for expensive transformations
  const processedData = computed(() => {
    if (!data.value) return [];
    return expensiveTransformation(data.value);
  });

  return <div>{JSON.stringify(processedData())}</div>;
}
```

### 5. Keep Hooks Simple and Focused

```tsx
// Good: Single responsibility
function useAuth() {
  const user = signal(null);
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  return { user, login, logout };
}

// Bad: Too many responsibilities
function useEverything() {
  const user = signal(null);
  const theme = signal('light');
  const keyboard = keyboard();
  const router = router();
  // Too much!
}
```

---

## See Also

- [State Management](/guide/state) - Working with signals and effects
- [Context API](/guide/context) - Detailed context guide
- [Router Guide](/guide/router) - Complete routing documentation
- [Interactive Apps](/guide/interactive) - Building games with Flexium
- [Animation](/guide/animation) - Animation techniques and patterns
