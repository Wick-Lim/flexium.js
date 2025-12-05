# Flexium Examples Gallery

A comprehensive showcase of all Flexium examples, organized by difficulty level and feature set.

## How to Run Examples

All examples are self-contained and can be run without a build step:

```bash
# Clone the repository
git clone https://github.com/Wick-Lim/flexium.js.git
cd flexium.js

# Start an HTTP server
python3 -m http.server 8000
# OR
npx http-server -p 8000

# Open in browser
# Navigate to http://localhost:8000/examples/
```

**Important**: Don't open HTML files directly with `file://` protocol - this causes CORS errors with ES modules.

---

## Featured Examples

### Complete Showcase - The Ultimate Demo

**Location**: `/examples/showcase`
**Difficulty**: Intermediate
**File**: Single HTML file (38KB, works offline)

The most comprehensive Flexium demonstration featuring 9 interactive components in one beautiful app.

**Features Demonstrated**:
- 15+ reactive signals
- 8 computed values
- 4 side effects with cleanup
- Batch updates
- Fine-grained rendering
- Beautiful UI with gradient backgrounds and glass-morphism

**Components Included**:
1. **Counter** - Signals, computed values, and statistics
2. **Todo List** - Array manipulation and CRUD operations
3. **Form Validation** - Real-time validation with effects
4. **Tabs** - Conditional rendering and state management
5. **Modal Dialog** - Portal-like rendering with animations
6. **Progress Bar** - Dynamic styling and transitions
7. **Timer** - Effect cleanup and interval management
8. **Color Picker** - Random colors and dynamic backgrounds
9. **Global Stats** - Cross-component reactivity

**UI Highlights**:
- Animated gradient background
- Glass-morphism cards with backdrop blur
- Smooth hover effects and transitions
- Professional color palette
- Responsive grid layout
- WCAG accessibility compliant

**Best For**:
- First-time users wanting to see Flexium's capabilities
- Evaluating Flexium for projects
- Learning reactive patterns
- Copy-paste component examples

**Quick Start**:
```bash
open examples/showcase/index.html
```

**Documentation**: See `examples/showcase/README.md`

---

### Production Todo App - Real-World Application

**Location**: `/examples/todo-app`
**Difficulty**: Advanced
**File**: Single HTML file (32KB)

A production-quality todo application demonstrating comprehensive state management and real-world patterns.

**Features**:
- Complete CRUD operations (Create, Read, Update, Delete)
- localStorage persistence with error handling
- Form validation with reactive error messages
- Multiple filter types (status, category, search)
- Statistics dashboard (completion rate, category breakdown)
- Mobile responsive design
- Full accessibility (ARIA labels, keyboard navigation)

**Technical Implementation**:
- 10 reactive signals
- 5 computed values
- 4 effects (localStorage, validation, rendering, logging)
- Proper separation of concerns
- Production-ready patterns

**What You'll Learn**:
- Complex state management without global stores
- Form validation patterns
- localStorage integration
- Filter composition
- Real-time statistics
- Production code organization

**Best For**:
- Understanding production patterns
- Learning complex state management
- Evaluating Flexium for real apps
- Reference implementation

**Quick Start**:
```bash
open examples/todo-app/index.html
```

**Documentation**:
- `examples/todo-app/README.md` - Overview
- `examples/todo-app/FEATURES_DEMONSTRATED.md` - Technical deep-dive
- `examples/todo-app/QUICKSTART.md` - 30-second setup

---

## Beginner Examples

### Simple Counter

**Location**: `/examples/counter`
**Difficulty**: Beginner
**Time**: 5 minutes

The classic counter example - perfect for first-time users.

**What You'll Learn**:
- Creating signals with `signal()`
- Updating values with `.value`
- Event handling with `onclick`
- Basic JSX syntax
- Automatic reactivity

**Code Snippet**:
```tsx
import { signal } from 'flexium/core'

const count = signal(0)

function Counter() {
  return (
    <div>
      <p>Count: {count}</p>
      <button onclick={() => count.value++}>
        Increment
      </button>
    </div>
  )
}
```

**Files**:
- `examples/counter/index.html` - HTML structure
- `examples/counter/app.ts` - Counter implementation

---

### Simple h() Function Test

**Location**: `/examples/simple-h-test.html`
**Difficulty**: Beginner
**Time**: 2 minutes

Minimal example showing the `h()` function without JSX.

**What You'll Learn**:
- Using `h()` function directly
- Creating elements without JSX
- Basic rendering with `render()`

**Code**:
```javascript
import { h, render } from '../dist/dom.mjs'

const button = h('button', {
  onclick: () => alert('Clicked!')
}, ['Click me'])

render(button, document.body)
```

**Best For**: Understanding Flexium without JSX/build tools

---

## Intermediate Examples

### Basic h() Function Examples

**Location**: `/examples/basic-h-function.html`
**Difficulty**: Intermediate
**Time**: 10 minutes

Five comprehensive demos covering `h()` function usage.

**Demos Included**:
1. Basic element creation
2. Props and events
3. Nested elements
4. Reactive counter with signals
5. Complex multi-signal components

**What You'll Learn**:
- Complete `h()` API
- Nested element patterns
- Signal integration
- Event handling

**Documentation**: See `/docs/H_FUNCTION_GUIDE.md`

---

### h() Function Showcase

**Location**: `/examples/h-function-showcase.html`
**Difficulty**: Intermediate
**Time**: 15 minutes

Production-quality showcase with 6 interactive components, all built with `h()` function.

**Components**:
1. Counter with statistics
2. Live input with character count
3. Todo list (add, toggle, delete)
4. Color picker with preview
5. Animated progress bar
6. Timer with start/pause/reset

**What You'll Learn**:
- Building complex UIs without JSX
- Component composition
- State management patterns
- Real-world interactions

---

### Todo List

**Location**: `/examples/todo`
**Difficulty**: Intermediate
**Time**: 15 minutes

Classic todo app with Motion animations.

**Features**:
- Add/remove todos
- Toggle completion
- Filter by status
- Animated list items
- Local state management

**What You'll Learn**:
- Array manipulation in signals
- Computed values for filtering
- Motion component for animations
- List rendering with keys

**Code Snippet**:
```tsx
import { signal, computed } from 'flexium/core'

const todos = signal<Todo[]>([])
const remaining = computed(() =>
  todos.value.filter(t => !t.done).length
)

function addTodo(text: string) {
  todos.value = [...todos.value, { id: Date.now(), text, done: false }]
}
```

---

### Dashboard

**Location**: `/examples/dashboard`
**Difficulty**: Intermediate
**Time**: 25 minutes

Responsive dashboard with real-time updates.

**Features**:
- Grid layout with breakpoints
- Real-time data simulation
- Statistics cards
- Hover interactions
- Responsive design

**What You'll Learn**:
- Grid component with responsive props
- Effect cleanup patterns
- Real-time data updates
- Card-based UI patterns
- Complex nested layouts

**Code Snippet**:
```tsx
<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={20}>
  {stats.value.map(stat => (
    <Card key={stat.id}>
      <Text fontSize={24}>{stat.value}</Text>
      <Text color="gray">{stat.label}</Text>
    </Card>
  ))}
</Grid>

effect(() => {
  const interval = setInterval(() => {
    stats.value = updateRandomStat(stats.value)
  }, 3000)
  return () => clearInterval(interval)
})
```

---

## Advanced Examples

### Automatic Reactivity Demo

**Location**: `/examples/automatic-reactivity-demo.html`
**Difficulty**: Advanced
**File**: Single HTML file with TypeScript source

Comprehensive demonstration of Flexium's automatic reactive bindings.

**Features Demonstrated**:
- Signals as children (automatic text updates)
- Computed values as children
- Signals in props (automatic property updates)
- Multiple signals in one element
- ReactiveText component
- Complex reactive UIs with zero boilerplate

**What You'll Learn**:
- How automatic reactivity works
- When to use `effect()` vs automatic bindings
- Performance characteristics
- Migration from manual effects

**Before/After Comparison**:
```tsx
// OLD WAY (manual effects)
const count = signal(0)
const div = h('div', {}, [])
effect(() => {
  div.textContent = String(count.value)
})

// NEW WAY (automatic)
const count = signal(0)
h('div', {}, [count]) // Just works!
```

**Documentation**: See `/docs/AUTOMATIC_REACTIVITY.md`

---

### Before/After Comparison

**Location**: `/examples/before-after-comparison.ts`
**Difficulty**: Advanced
**Time**: 10 minutes

Side-by-side comparison showing manual vs automatic reactivity.

**Scenarios**:
1. Simple counter with reactive text
2. Multiple computed values
3. Dynamic props with reactive updates

**Best For**:
- Understanding the improvement automatic reactivity brings
- Migration planning
- Performance comparison

---

### Automatic JSX Demo

**Location**: `/examples/automatic-jsx-demo.tsx`
**Difficulty**: Advanced

Demonstrates Flexium's React 17+ style automatic JSX runtime.

**Features**:
- No manual `h` import needed
- Automatic JSX transformation
- Fragment support
- Component composition

**Configuration Required**:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

**Documentation**:
- `/docs/JSX_GUIDE.md`
- `/docs/JSX_RUNTIME_GUIDE.md`

---

## Examples Index

### By Difficulty

**Beginner** (5-10 minutes each):
- Simple Counter
- Simple h() Test
- Basic Element Creation

**Intermediate** (15-25 minutes each):
- Complete Showcase
- Basic h() Examples
- h() Function Showcase
- Todo List
- Dashboard

**Advanced** (30+ minutes):
- Production Todo App
- Automatic Reactivity Demo
- Before/After Comparison
- Automatic JSX Demo

### By Feature

**Signals & Reactivity**:
- Simple Counter (basic)
- Automatic Reactivity Demo (advanced)
- Before/After Comparison (migration)

**Layout Primitives**:
- Dashboard (Grid layout)
- Todo List (Column/Row)

**UX Components**:
- Complete Showcase (Motion, Form, all components)
- Production Todo App (Form validation)

**Without JSX**:
- Simple h() Test
- Basic h() Examples
- h() Function Showcase

**With JSX**:
- Simple Counter
- Todo List
- Dashboard
- Production Todo App
- Automatic JSX Demo

**Real-World Patterns**:
- Production Todo App (complete app)
- Dashboard (real-time data)
- Complete Showcase (multiple features)

---

## Running Examples Locally

### Option 1: Python HTTP Server (Recommended)

```bash
cd flexium.js
python3 -m http.server 8000
# Open http://localhost:8000/examples/
```

### Option 2: Node.js http-server

```bash
npm install -g http-server
cd flexium.js
http-server -p 8000
# Open http://localhost:8000/examples/
```

### Option 3: VS Code Live Server

1. Install "Live Server" extension
2. Right-click any HTML file
3. Select "Open with Live Server"

---

## Building Your Own Example

Want to create your own example? Here's a template:

### 1. Create HTML File

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Example</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

### 2. Create TypeScript File

```tsx
import { signal, computed, effect } from 'flexium/core'
import { render } from 'flexium/dom'

// Your code here
const state = signal('Hello Flexium!')

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>{state}</h1>
    </div>
  )
}

render(<App />, document.getElementById('app')!)
```

### 3. Configure TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### 4. Build and Run

```bash
npx tsc
python3 -m http.server 8000
```

---

## Common Patterns

### Signal Updates

```tsx
import { signal, computed, effect } from 'flexium/core'

// Primitives
const count = signal(0)
count.value++ // Direct mutation

// Objects
const user = signal({ name: 'Alice' })
user.value = { ...user.value, name: 'Bob' } // New object

// Arrays
const items = signal([1, 2, 3])
items.value = [...items.value, 4] // New array
```

### Computed Values

```tsx
const firstName = signal('John')
const lastName = signal('Doe')
const fullName = computed(() =>
  `${firstName.value} ${lastName.value}`
)
```

### Effects

```tsx
import { signal, computed, effect } from 'flexium/core'

// Run on dependency changes
effect(() => {
  console.log('Count:', count.value)
})

// With cleanup
effect(() => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)
  return () => clearInterval(timer)
})
```

### Conditional Rendering

```tsx
const show = signal(true)

<div>
  {show.value && <p>Shown</p>}
  {show.value ? <p>Yes</p> : <p>No</p>}
</div>
```

### List Rendering

```tsx
const items = signal(['a', 'b', 'c'])

<ul>
  {items.value.map((item, i) => (
    <li key={i}>{item}</li>
  ))}
</ul>
```

---

## Tips for Learning

1. **Start with Simple Counter** - Understand basic signals
2. **Try h() Examples** - Learn without JSX first
3. **Explore Complete Showcase** - See all features together
4. **Study Production Todo App** - Learn real-world patterns
5. **Build Your Own** - Apply what you've learned

---

## Example Statistics

| Example | Lines of Code | Signals | Computed | Effects | Components |
|---------|--------------|---------|----------|---------|------------|
| Simple Counter | ~50 | 1 | 0 | 0 | 1 |
| Todo List | ~200 | 2 | 2 | 1 | 3 |
| Dashboard | ~400 | 3 | 1 | 1 | 5 |
| Complete Showcase | ~800 | 15+ | 8 | 4 | 9 |
| Production Todo | ~600 | 10 | 5 | 4 | 8 |

---

## Need Help?

- **Getting Started**: [QUICK_START.md](./QUICK_START.md)
- **API Reference**: [docs/API.md](./docs/API.md)
- **Guides**: [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)
- **GitHub Issues**: [Report problems](https://github.com/Wick-Lim/flexium.js/issues)
- **Discussions**: [Ask questions](https://github.com/Wick-Lim/flexium.js/discussions)

---

## Next Steps

1. **Run the examples** locally
2. **Modify them** to experiment
3. **Build your own** using the templates
4. **Share your creations** with the community!

[Back to README](./README.md) | [Quick Start](./QUICK_START.md) | [API Docs](./docs/API.md)
