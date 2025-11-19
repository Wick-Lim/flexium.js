# Flexium Examples

Complete, runnable examples demonstrating Flexium's features and best practices.

## Running Examples

Each example is self-contained and can be run independently:

```bash
# Using a development server (from project root)
python3 -m http.server 8000

# Or using Node.js
npx http-server

# Then open http://localhost:8000/examples/ in your browser
```

## h() Function Examples (NEW!)

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

## Examples Overview

### 1. Counter (`/counter`)

**Difficulty:** Beginner

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

### 2. Todo App (`/todo`)

**Difficulty:** Intermediate

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

### 3. Dashboard (`/dashboard`)

**Difficulty:** Advanced

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

### 2. Create TypeScript file

```typescript
import { signal } from 'flexium'
import { render, Column, Text, Button } from 'flexium/dom'

function App() {
  const message = signal('Hello Flexium!')

  return (
    <Column gap={16} padding={24}>
      <Text fontSize={24}>{message.value}</Text>
      <Button onPress={() => message.value = 'Clicked!'}>
        Click Me
      </Button>
    </Column>
  )
}

render(<App />, document.getElementById('app')!)
```

### 3. Build and run

```bash
# Install dependencies
npm install flexium

# Build (if using TypeScript)
npm install -D typescript
npx tsc app.ts

# Serve
npx serve .
```

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

## Next Steps

1. Run each example and explore the code
2. Modify examples to experiment with different features
3. Build your own example using these as templates
4. Read the [API Documentation](/docs/API.md) for complete reference
5. Check the [Migration Guide](/docs/MIGRATION.md) if coming from React/Vue/Svelte

## Need Help?

- [API Documentation](/docs/API.md)
- [Migration Guide](/docs/MIGRATION.md)
- [GitHub Issues](https://github.com/flexium/flexium/issues)
- [Discord Community](https://discord.gg/flexium)

---

Happy coding with Flexium!
