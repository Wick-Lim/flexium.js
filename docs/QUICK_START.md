# Quick Start Guide

Get up and running with Flexium in 5 minutes or less!

## What You'll Build

A simple interactive counter application that demonstrates:
- Creating reactive signals
- Building UI with JSX
- Handling user interactions
- Automatic reactivity (no manual subscriptions!)

**Final result**: A working counter with increment/decrement buttons

---

## Step 1: Create a New Project

### Option A: Use Scaffolding Tool (Recommended)

The fastest way to get started:

```bash
npm create flexium@latest my-flexium-app
cd my-flexium-app
npm install
npm run dev
```

**That's it!** Open your browser to the URL shown (usually `http://localhost:5173`).

**What you get:**
- ⚡ Vite dev server with hot reload
- 📦 TypeScript configured
- 🎨 Example components
- 🚀 Ready to customize

**Skip to [Step 5](#step-5-run-the-development-server)** if you used this option.

---

### Option B: Manual Setup

If you prefer manual setup or want to add Flexium to an existing project:

```bash
# Create a new directory
mkdir my-flexium-app
cd my-flexium-app

# Initialize npm project
npm init -y
```

**Expected output**: A `package.json` file is created.

---

## Step 2: Install Flexium (Manual Setup)

```bash
# Install Flexium
npm install flexium

# Install TypeScript (for JSX support)
npm install -D typescript
```

**Expected output**:
```
added 2 packages
```

---

## Step 3: Create TypeScript Config

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

**Why?**: This configures TypeScript to use Flexium's automatic JSX runtime (no manual `h` imports needed!).

---

## Step 4: Create Your App

Create `src/app.tsx`:

```tsx
import { signal, computed } from 'flexium/core'
import { render } from 'flexium/dom'

// Create reactive state
const count = signal(0)
const doubled = computed(() => count.value * 2)

// Create the UI
function App() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h1>Flexium Counter</h1>

      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        margin: '20px 0',
        color: '#3b82f6'
      }}>
        {count}
      </div>

      <p style={{ color: '#6b7280' }}>
        Doubled: {doubled}
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onclick={() => count.value--}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white'
          }}
        >
          Decrement
        </button>

        <button
          onclick={() => count.value++}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          Increment
        </button>
      </div>
    </div>
  )
}

// Render to DOM
render(<App />, document.getElementById('root')!)
```

**What's happening?**:
1. `signal(0)` creates reactive state starting at 0
2. `computed()` creates a derived value that auto-updates
3. JSX creates the UI structure
4. `{count}` and `{doubled}` automatically update when signals change
5. `onclick` handlers update the signal, which triggers UI updates

---

## Step 5: Create HTML File

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexium Quick Start</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #root {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./dist/app.js"></script>
</body>
</html>
```

---

## Step 6: Add Build Script

Update `package.json` to include a build script:

```json
{
  "name": "my-flexium-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "flexium": "^0.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

---

## Step 7: Build Your App

```bash
# Build once
npm run build

# Or watch for changes
npm run dev
```

**Expected output**:
```
Compiled successfully!
dist/app.js created
```

---

## Step 8: Run Your App

```bash
# Option 1: Python HTTP server (recommended)
python3 -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Option 3: VS Code Live Server extension
# Just right-click index.html and select "Open with Live Server"
```

**Open your browser**: Navigate to `http://localhost:8000`

**Expected result**: You should see a beautiful counter app with increment/decrement buttons!

---

## Troubleshooting

### Problem: "Cannot find module 'flexium'"

**Solution**: Make sure you ran `npm install flexium`

### Problem: "JSX element implicitly has type 'any'"

**Solution**: Check your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### Problem: Build creates `.js` files but they don't work

**Solution**: Make sure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

### Problem: "Failed to resolve module specifier 'flexium'"

**Solution**: Don't open `index.html` directly with `file://`. Always use an HTTP server.

### Problem: Changes not showing up

**Solution**:
1. Rebuild with `npm run build`
2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Clear browser cache

---

## Next Steps

Congratulations! You've built your first Flexium app. Here's what to explore next:

### 1. Learn More Patterns

**Arrays and Lists**:
```tsx
const todos = signal<string[]>([])

function TodoList() {
  return (
    <div>
      {todos.value.map(todo => (
        <div key={todo}>{todo}</div>
      ))}
    </div>
  )
}
```

**Effects (Side Effects)**:
```tsx
import { effect } from 'flexium/core'

// Runs when count changes
effect(() => {
  console.log(`Count changed to: ${count.value}`)
})

// Save to localStorage
effect(() => {
  localStorage.setItem('count', String(count.value))
})
```

**Conditional Rendering**:
```tsx
const show = signal(true)

function ConditionalDemo() {
  return (
    <div>
      {show.value && <p>This is shown!</p>}
      {show.value ? <p>Shown</p> : <p>Hidden</p>}
    </div>
  )
}
```

### 2. Explore Examples

Check out our [examples directory](./examples/):
- **[Complete Showcase](./examples/showcase)** - 9 interactive components
- **[Production Todo App](./examples/todo-app)** - Real-world patterns
- **[Dashboard](./examples/dashboard)** - Responsive layouts

### 3. Read Documentation

- [API Reference](./docs/API.md) - Complete API documentation
- [JSX Guide](./docs/JSX_GUIDE.md) - Advanced JSX patterns
- [Migration Guide](./docs/MIGRATION.md) - Coming from React/Vue/Svelte?

### 4. Build Something Real

Try building:
- A todo list with localStorage
- A form with validation
- A data dashboard with charts
- A blog with routing

---

## Using with Bundlers (Vite, Webpack)

### Vite (Recommended)

```bash
# Create Vite project
npm create vite@latest my-app -- --template vanilla-ts
cd my-app

# Install Flexium
npm install flexium

# Update tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}

# Start dev server
npm run dev
```

### Webpack

```bash
# Install dependencies
npm install flexium
npm install -D webpack webpack-cli webpack-dev-server
npm install -D typescript ts-loader

# Create webpack.config.js
module.exports = {
  entry: './src/app.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
}
```

---

## Key Concepts Recap

**Signals**: Reactive primitive values
```tsx
const count = signal(0)
count.value++ // Updates UI automatically
```

**Computed**: Derived values that auto-update
```tsx
const doubled = computed(() => count.value * 2)
```

**Effects**: Side effects that run when dependencies change
```tsx
effect(() => {
  console.log(count.value) // Runs when count changes
})
```

**JSX**: Automatic reactive bindings
```tsx
<div>{count}</div> // Updates when count changes
<button onclick={() => count.value++}>Click</button>
```

---

## Tips for Success

1. **Use signals for all state** - Don't use regular variables for reactive data
2. **Use computed for derived values** - Don't recalculate in render
3. **Use effects for side effects** - localStorage, logging, API calls
4. **Pass signals directly to JSX** - `{count}` not `{count.value}`
5. **Update signals with `.value`** - `count.value++` not `count++`

---

## Need Help?

- Check the [FAQ](./docs/FAQ.md)
- Browse [examples](./examples/)
- Read the [API docs](./docs/API.md)
- Ask in [GitHub Discussions](https://github.com/Wick-Lim/flexium.js/discussions)
- Report bugs in [Issues](https://github.com/Wick-Lim/flexium.js/issues)

---

**Congratulations!** You're now ready to build amazing apps with Flexium!

[Back to Main README](./README.md) | [View Examples](./EXAMPLES.md) | [API Reference](./docs/API.md)
