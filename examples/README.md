# Flexium Examples

Complete, runnable examples demonstrating Flexium's features and best practices.

> **NEW:** Flexium now supports automatic JSX runtime (React 17+ style)! No need to import `h` anymore. See the [JSX Guide](/docs/JSX_GUIDE.md) for details.

## Running Examples

Each example is self-contained and can be run independently:

```bash
# Using a development server (from project root)
python3 -m http.server 8000

# Or using Node.js
npx http-server

# Then open http://localhost:8000/examples/ in your browser
```

## Quick Navigation

- [Featured Examples](#-featured-examples) - Production-ready showcase apps
- [Examples by Difficulty](#examples-by-difficulty) - Organized learning path
- [Advanced Examples](#-advanced-examples) - Complex features and patterns
- [Feature Matrix](#feature-matrix) - Find examples by feature
- [Common Patterns](#common-patterns) - Code snippets and best practices

---

## 🌟 FEATURED EXAMPLES

### 1. Todo App (`/todo-app`) ⭐ PRODUCTION DEMO

**A comprehensive, production-ready Todo application showcasing ALL Flexium features**

This is the most complete real-world example, built specifically to prove Flexium can handle production use cases.

**Features**:
- ✅ **10 signals** - Complete state management (todos, form, filters, validation)
- ✅ **5 computed values** - Statistics, filtered todos, completion percentage
- ✅ **4 effects** - localStorage, validation, rendering, logging
- ✅ **CRUD operations** - Create, read, update, delete with proper patterns
- ✅ **Form validation** - Real-time reactive error handling
- ✅ **Multiple filters** - Status (all/active/completed), category, search
- ✅ **Data persistence** - Auto-save to localStorage with error handling
- ✅ **Mobile responsive** - Professional UI that works on all devices
- ✅ **Accessibility** - Proper labels, ARIA, keyboard navigation

**Quick Start**: `open todo-app/index.html` (no build required!)

**Documentation**:
- `README.md` - Complete feature documentation
- `FEATURES_DEMONSTRATED.md` - 17KB technical deep-dive
- `ISSUES_AND_LIMITATIONS.md` - Honest assessment and recommendations
- `QUICKSTART.md` - Get running in 30 seconds

**Best For**: Understanding production patterns, real-world state management, evaluating Flexium

---

### 2. Complete Showcase (`/showcase`)

**THE ULTIMATE FLEXIUM DEMO - Multiple components in one app**

🎯 **Perfect for:**
- First-time users wanting to see what Flexium can do
- Developers evaluating Flexium for projects
- Learning reactive patterns and best practices
- README/documentation main demo
- Copy-paste component examples

✨ **9 Interactive Components:**
1. **Counter** - Signals and computed values with stats
2. **Todo List** - Array manipulation, CRUD operations
3. **Form Validation** - Real-time validation with effects
4. **Tabs** - Conditional rendering and state management
5. **Modal Dialog** - Portal-like rendering with animations
6. **Progress Bar** - Dynamic styling and smooth transitions
7. **Timer** - Effect cleanup, interval management
8. **Color Picker** - Random colors, dynamic backgrounds
9. **Global Stats** - Cross-component reactivity

🎨 **Beautiful Design:**
- Animated gradient background
- Glass-morphism cards with backdrop blur
- Smooth hover effects and transitions
- Professional color palette
- Responsive grid layout
- Modern UI/UX patterns

📊 **Technical Features:**
- 15+ reactive signals
- 8 computed values
- 4 side effects with cleanup
- Batch updates
- Fine-grained rendering
- WCAG accessibility compliant

📦 **One File, Zero Build:**
- 38KB single HTML file
- Works offline
- No build step needed
- Just open in browser!

**Quick Start:**
```bash
open examples/showcase/index.html
```

**Documentation:**
- `README.md` - Developer guide
- `VISUAL_DESCRIPTION.md` - UI/UX details
- `FEATURES_SUMMARY.md` - Complete feature list

---

## Examples by Difficulty

### Beginner Examples

Perfect for getting started with Flexium basics.

#### 1. Counter (`/counter`)

**Learn the fundamentals of reactive state**

**Demonstrates:**
- Basic signal() usage
- Layout primitives (Row, Column)
- Event handling
- Fine-grained reactivity

**Key Concepts:**
```typescript
const count = signal(0)
count.value++ // Direct mutation triggers updates
```

**Files:**
- `/counter/index.html` - HTML setup with styling
- `/counter/app.ts` - Flexium counter implementation

**What You'll Learn:**
- How to create and use signals
- How Row and Column work for layouts
- How Button and Text components handle styling
- Why Flexium only updates changed elements (no re-render)

**Time to Complete:** 5 minutes

---

### Intermediate Examples

Build on the basics with more complex state and interactions.

#### 2. Todo App (`/todo`)

**Master array manipulation and derived state**

**Demonstrates:**
- Array signals and list rendering
- computed() for derived values
- Motion component for animations
- Complex state management
- Conditional rendering
- Multiple filters

**Key Concepts:**
```typescript
const todos = signal<Todo[]>([])
const remaining = computed(() =>
  todos.value.filter(t => !t.done).length
)
```

**Files:**
- `/todo/index.html` - HTML setup
- `/todo/app.ts` - Full-featured todo app with animations

**What You'll Learn:**
- Working with arrays in signals
- Using computed for derived state
- Animating list items with Motion
- Building filters and actions
- Managing complex application state

**Time to Complete:** 15 minutes

---

#### 3. Snake Game (`/snake-game`) 🎮

**Build an interactive game with Flexium**

**Demonstrates:**
- Game Module APIs (useKeyboard, useMouse, createGameLoop)
- Canvas primitives (Canvas, DrawRect, DrawText)
- Frame-independent movement with delta time
- Reactive game state management
- Collision detection
- Progressive difficulty

**Features:**
- Arrow keys or WASD for movement
- Space or mouse click to pause
- Speed increases with score
- Visual grid and smooth rendering

**Game Mechanics:**
- Snake grows by eating food
- Game over on collision
- Restart with Enter key

**What You'll Learn:**
- Using game-specific APIs
- Canvas rendering with JSX
- Input handling (keyboard & mouse)
- Game loop patterns
- State-driven game logic

**Time to Complete:** 20 minutes

---

#### 4. Error Boundary (`/error-boundary`)

**Handle errors gracefully in your apps**

**Demonstrates:**
- ErrorBoundary component usage
- Custom fallback UI patterns
- Error recovery strategies
- Nested error boundaries
- useErrorBoundary hook
- Async error handling

**Features:**
- Basic error catching with fallback
- Detailed error information display
- Independent error boundaries
- Retry/recovery mechanisms
- Error logging callbacks

**What You'll Learn:**
- Isolating errors to prevent app crashes
- Creating user-friendly error UI
- Programmatic error triggering
- Error boundary best practices

**Time to Complete:** 15 minutes

---

#### 5. Suspense Demo (`/suspense-demo`)

**Master async data loading patterns**

**Demonstrates:**
- Suspense component for loading states
- createResource API for data fetching
- Nested suspense boundaries
- Integration with ErrorBoundary
- Parallel data fetching
- Manual promise registration

**Features:**
- Basic suspense with loading fallback
- Multiple independent boundaries
- Nested hierarchical loading
- Error handling with retry
- Progressive content rendering

**What You'll Learn:**
- Managing async state elegantly
- Creating loading skeletons
- Handling loading errors
- Progressive data loading
- Resource refetching patterns

**Time to Complete:** 20 minutes

---

### Advanced Examples

Complex real-world patterns and performance optimizations.

#### 6. Dashboard (`/dashboard`)

**Build complex, responsive layouts**

**Demonstrates:**
- Grid layout with responsive breakpoints
- Real-time data updates with effect()
- Complex nested layouts
- Multiple signals and computed values
- Hover states and interactions
- Card-based UI patterns

**Key Concepts:**
```typescript
<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={20}>
  {stats.value.map(stat => <Card key={stat.id}>...)}
</Grid>

effect(() => {
  // Simulate real-time updates
  const interval = setInterval(() => {
    stats.value = updateRandomStat(stats.value)
  }, 3000)
  return () => clearInterval(interval)
})
```

**Files:**
- `/dashboard/index.html` - HTML setup
- `/dashboard/app.ts` - Full dashboard with real-time updates

**What You'll Learn:**
- Building responsive layouts with Grid
- Handling real-time data updates
- Using effects for side effects (timers, subscriptions)
- Creating complex nested component structures
- Proper cleanup with effect return functions
- Building production-ready UI patterns

**Time to Complete:** 25 minutes

---

#### 7. List (`/virtual-list`)

**Efficiently render massive datasets**

**Demonstrates:**
- List component with virtual mode for performance
- Windowing/virtualization techniques
- Fixed item heights
- Programmatic scrolling
- Overscan buffer configuration
- Real-time statistics

**Features:**
- Handle 10,000+ items effortlessly
- Only render visible items (when virtual mode enabled)
- Smooth 60fps scrolling
- Custom item rendering
- Scroll to any position
- Accessibility support

**Performance:**
- ~20-30 DOM nodes (vs 100,000)
- <1MB memory (vs 50-100MB)
- Fast initial render
- Minimal CPU usage

**What You'll Learn:**
- When and why to use virtualization
- Optimizing large list rendering
- Scroll performance techniques
- Memory management patterns

**Time to Complete:** 20 minutes

---

#### 8. SSR Example (`/ssr-example`)

**Server-Side Rendering with hydration**

**Demonstrates:**
- renderToString() for SSR
- hydrate() for client activation
- Universal component rendering
- Signal behavior in SSR
- Express server setup
- Vite SSR configuration

**Features:**
- Server renders static HTML
- Client hydrates for interactivity
- No layout shift or flicker
- SEO-friendly content
- Fast initial load
- Progressive enhancement

**What You'll Learn:**
- How SSR works in Flexium
- Setting up SSR with Express
- Hydration process and patterns
- Signal serialization
- Error handling in SSR
- Data fetching strategies

**Time to Complete:** 30 minutes

---

#### 9. Accessibility Demo (`/accessibility`)

**Build WCAG 2.1 AA compliant apps**

**Demonstrates:**
- ARIA attributes and semantic HTML
- Keyboard navigation patterns
- Focus management and trapping
- Form accessibility
- Screen reader support
- Color contrast compliance
- Modal dialog patterns
- Live region announcements
- Reduced motion support

**Features:**
- Skip link to main content
- Focus indicators on all elements
- Proper label associations
- Error announcements
- High contrast support
- Toast notifications
- WCAG 2.1 AA checklist

**What You'll Learn:**
- Building inclusive web apps
- ARIA roles, states, and properties
- Keyboard navigation best practices
- Screen reader testing
- Accessibility testing tools
- Common a11y pitfalls to avoid

**Time to Complete:** 35 minutes

---

## 🆕 Advanced Examples

### Game Development

#### Snake Game (`/snake-game`) 🎮
Classic snake game demonstrating Flexium's game development capabilities with keyboard/mouse input, canvas rendering, and frame-independent movement.

**APIs:** useKeyboard(), useMouse(), createGameLoop(), Canvas, DrawRect, DrawText

**Difficulty:** Intermediate

---

### Error Handling

#### Error Boundary (`/error-boundary`)
Comprehensive error handling patterns with error boundaries, fallback UI, recovery strategies, and nested boundaries.

**APIs:** ErrorBoundary, useErrorBoundary, fallback props, onError/onReset callbacks

**Difficulty:** Intermediate

---

### Async Patterns

#### Suspense Demo (`/suspense-demo`)
Elegant async data loading with suspense boundaries, loading states, error handling, and nested hierarchical loading.

**APIs:** Suspense, createResource, ErrorBoundary, SuspenseCtx, manual promise registration

**Difficulty:** Intermediate

---

### Performance

#### List (`/virtual-list`)
High-performance list rendering for thousands of items using virtualization/windowing techniques.

**APIs:** List, virtual, itemSize, overscan, programmatic scrolling, getKey

**Difficulty:** Advanced

---

### Server-Side Rendering

#### SSR Example (`/ssr-example`)
Complete SSR implementation with Express server, renderToString(), client hydration, and universal rendering.

**APIs:** renderToString, hydrate, Express middleware, Vite SSR config

**Difficulty:** Advanced

---

### Accessibility

#### Accessibility Demo (`/accessibility`)
WCAG 2.1 AA compliant application showcasing keyboard navigation, screen readers, ARIA attributes, focus management, and inclusive design patterns.

**APIs:** ARIA roles/properties/states, semantic HTML, live regions, focus trap

**Difficulty:** Advanced

---

## Feature Matrix

Find examples by the features they demonstrate:

| Example | Signals | Computed | Effects | Arrays | Forms | Canvas | SSR | Game | A11y | Perf |
|---------|---------|----------|---------|--------|-------|--------|-----|------|------|------|
| **Counter** | ✅ | ✅ | - | - | - | - | - | - | ✅ | - |
| **Todo** | ✅ | ✅ | ✅ | ✅ | - | - | - | - | - | - |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | - | - | - | - | - | - |
| **Todo App** | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | - | ✅ | - |
| **Showcase** | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | - | ✅ | - |
| **Snake Game** | ✅ | ✅ | ✅ | ✅ | - | ✅ | - | ✅ | - | ✅ |
| **Error Boundary** | ✅ | - | - | - | - | - | - | - | - | - |
| **Suspense Demo** | ✅ | - | - | - | - | - | - | - | - | - |
| **Virtual List** | ✅ | ✅ | - | ✅ | - | - | - | - | ✅ | ✅ |
| **SSR Example** | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ | - | - | - |
| **Accessibility** | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | - | ✅ | - |

**Legend:**
- **Signals**: Reactive state with signal()
- **Computed**: Derived values with computed()
- **Effects**: Side effects with effect()
- **Arrays**: Array manipulation and list rendering
- **Forms**: Form handling and validation
- **Canvas**: Canvas rendering and drawing
- **SSR**: Server-Side Rendering
- **Game**: Game development features
- **A11y**: Accessibility features
- **Perf**: Performance optimizations

---

## 🆕 Automatic Reactivity Examples

### auto-reactive-demo.ts
**NEW FEATURE: Automatic Reactive Bindings**

Comprehensive demonstration showing how signals automatically update the DOM without manual `effect()` calls:
- Signals as children (automatically reactive text)
- Computed values as children
- Signals in props (automatic property updates)
- Multiple signals in one element
- ReactiveText component for explicit reactive text
- Complex reactive UIs with zero boilerplate

**Quick Start:**
```bash
# Build and run
npm run dev
# Navigate to auto-reactive-demo
```

### before-after-comparison.ts
**NEW FEATURE: Migration Guide**

Side-by-side comparison demonstrating:
- **OLD WAY**: Manual `effect()` calls (tedious and error-prone)
- **NEW WAY**: Automatic reactive bindings (clean and simple)

Shows three scenarios:
1. Simple counter with reactive text
2. Multiple computed values
3. Dynamic props with reactive updates

This is the perfect example for understanding the improvement automatic reactivity brings!

**Key Takeaway:**
```typescript
// BEFORE (manual effects)
effect(() => {
  element.textContent = count.value;
});

// AFTER (automatic)
h('div', {}, [count]) // Just works!
```

**See also:** `/docs/AUTOMATIC_REACTIVITY.md` for complete documentation.

---

## h() Function Examples

### simple-h-test.html
**Minimal working example** - Exactly as requested:
```javascript
import { h, render } from '../dist/dom.mjs';
const button = h('button', { onclick: () => alert('clicked') }, ['Click me']);
render(button, document.body);
```

### basic-h-function.html
**5 comprehensive demos** covering:
- Basic element creation
- Props and events
- Nested elements
- Reactive counter with signals
- Complex multi-signal components

### h-function-showcase.html
**Production-quality showcase** with 6 interactive components:
- Counter with computed values
- Live input with character count
- Todo list (add/toggle/delete)
- Color picker
- Progress bar
- Timer with start/pause

**Documentation:** See `/docs/H_FUNCTION_GUIDE.md` for complete API reference.

---

## Common Patterns

### Signal Updates

```typescript
// Primitives - direct mutation
const count = signal(0)
count.value++

// Objects - create new object
const user = signal({ name: 'Alice', age: 25 })
user.value = { ...user.value, age: 26 }

// Arrays - create new array
const items = signal([1, 2, 3])
items.value = [...items.value, 4]
items.value = items.value.filter(x => x !== 2)
```

### Layout Patterns

```typescript
// Horizontal row with space-between
<Row justify="space-between" align="center">
  <Text>Left</Text>
  <Button>Right</Button>
</Row>

// Vertical stack with gap
<Column gap={16}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Column>

// Responsive grid
<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={20}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</Grid>
```

### Animation Patterns

```typescript
// Fade in on mount
<Motion initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  <Text>Fades in</Text>
</Motion>

// Slide in from left
<Motion initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
  <Card>Slides in</Card>
</Motion>

// Stagger list animations
{items.map((item, i) => (
  <Motion
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
  >
    <Card>{item}</Card>
  </Motion>
))}
```

---

## Building from Scratch

Want to build your own example? Here's the basic structure:

### 1. Create HTML file

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Flexium App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

### 2. Create TypeScript file with JSX

```tsx
// NEW: No h import needed with automatic JSX runtime!
import { signal } from 'flexium/core'
import { render } from 'flexium/dom'

function App() {
  const message = signal('Hello Flexium!')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      <div style={{ fontSize: '24px' }}>{message.value}</div>
      <button onclick={() => message.value = 'Clicked!'}>
        Click Me
      </button>
    </div>
  )
}

render(<App />, document.getElementById('app')!)
```

### 3. Configure TypeScript for automatic JSX

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### 4. Build and run

```bash
# Install dependencies
npm install flexium

# Using Vite (recommended)
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install flexium
npm run dev

# Or build manually with TypeScript
npm install -D typescript
npx tsc app.tsx

# Serve
npx serve .
```

**Note:** With automatic JSX runtime, you no longer need to import `h`! Just configure `tsconfig.json` and start writing JSX. See the [JSX Guide](/docs/JSX_GUIDE.md) for more details.

---

## Tips & Best Practices

### Performance

1. **Use computed() for derived values** - Don't recalculate in render
   ```typescript
   // Good
   const doubled = computed(() => count.value * 2)

   // Bad
   return <Text>{count.value * 2}</Text> // Recalculates every time
   ```

2. **Batch signal updates** - Update multiple signals before component reads them
   ```typescript
   // Good
   firstName.value = 'John'
   lastName.value = 'Doe'
   // Component updates once

   // Also good - updates are batched automatically
   ```

3. **Use keys in lists** - Helps with animations and performance
   ```typescript
   {items.value.map(item => (
     <Card key={item.id}>{item.name}</Card>
   ))}
   ```

### Code Organization

1. **Extract signals to separate files**
   ```typescript
   // store.ts
   export const user = signal(null)
   export const theme = signal('light')

   // App.tsx
   import { user, theme } from './store'
   ```

2. **Create reusable components**
   ```typescript
   function Card({ title, children }) {
     return (
       <Column gap={8} padding={16} backgroundColor="white">
         <Text fontWeight="bold">{title}</Text>
         {children}
       </Column>
     )
   }
   ```

3. **Use TypeScript for better DX**
   ```typescript
   interface Todo {
     id: number
     text: string
     done: boolean
   }

   const todos = signal<Todo[]>([])
   ```

---

## Next Steps

1. Run each example and explore the code
2. Modify examples to experiment with different features
3. Build your own example using these as templates
4. Read the [API Documentation](/docs/API.md) for complete reference
5. Check the [Migration Guide](/docs/MIGRATION.md) if coming from React/Vue/Svelte

---

## Need Help?

- [API Documentation](/docs/API.md)
- [Migration Guide](/docs/MIGRATION.md)
- [GitHub Issues](https://github.com/flexium/flexium/issues)
- [Discord Community](https://discord.gg/flexium)

---

Happy coding with Flexium!
