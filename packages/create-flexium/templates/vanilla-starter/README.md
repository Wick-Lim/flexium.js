# Flexium Vanilla Starter

A zero-build-tools starter template for Flexium. Perfect for learning, prototyping, or simple projects.

## Features

- **No Build Tools** - Just HTML, CSS, and JavaScript
- **Single File** - Everything in one file for simplicity
- **No Installation** - Works directly in the browser
- **Fully Commented** - Learn from the code
- **Mobile Responsive** - Works on all devices
- **Production Patterns** - Despite being simple, follows best practices

## Quick Start

### Option 1: Using Python (Recommended)

```bash
cd templates/vanilla-starter
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Using Node.js

```bash
cd templates/vanilla-starter
npx serve
```

Then open `http://localhost:3000` in your browser.

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Why Not file://?

Don't open `index.html` directly with `file://` protocol - this will cause CORS errors with ES6 modules. Always use an HTTP server (even for development).

## What's Inside

The template includes:

1. **Signal Implementation** - Simplified but fully functional reactive system
2. **Counter Component** - Interactive example with state management
3. **Computed Values** - Derived state that updates automatically
4. **Effects** - Side effects that respond to state changes
5. **Event Handling** - Button clicks that update signals
6. **Responsive Design** - Mobile-friendly layout
7. **Comments** - Detailed explanations throughout

## File Structure

```
vanilla-starter/
├── index.html           # Everything in one file!
└── README.md           # This file
```

Yes, that's it! The entire application is in a single HTML file.

## How It Works

### 1. Signals

Signals are reactive values:

```javascript
const count = signal(0)

// Read value
console.log(count.value) // 0

// Update value
count.value++ // All dependent effects run automatically
```

### 2. Computed Values

Computed values derive from signals:

```javascript
const doubled = computed(() => count.value * 2)

// Updates automatically when count changes
console.log(doubled.value) // Always count * 2
```

### 3. Effects

Effects run when dependencies change:

```javascript
effect(() => {
  console.log('Count is:', count.value)
})
// Runs immediately and whenever count changes
```

### 4. Re-rendering

The entire UI re-renders when state changes:

```javascript
effect(() => {
  count.value // Track as dependency
  render() // Re-render when count changes
})
```

## Customization

### Adding More State

```javascript
// Add new signals
const name = signal('World')
const age = signal(25)

// Add computed values
const greeting = computed(() => `Hello, ${name.value}!`)
```

### Adding More UI

Update the `render()` function to include your new components:

```javascript
function render() {
  app.innerHTML = `
    <div class="card">
      <h2>Greeting: ${greeting.value}</h2>
      <input
        type="text"
        value="${name.value}"
        id="name-input"
      />
    </div>
  `

  // Add event listeners
  document.getElementById('name-input')
    .addEventListener('input', (e) => {
      name.value = e.target.value
    })
}
```

### Styling

All styles are in the `<style>` tag in the `<head>`. Modify CSS variables:

```css
:root {
  --color-primary: #your-color;
  --spacing-lg: 32px;
  /* etc */
}
```

## When to Use This Template

### Perfect For:

- Learning Flexium basics
- Quick prototypes and demos
- Teaching reactive programming
- Code pens and JSFiddle-style examples
- Minimal overhead projects
- Sharing simple examples

### Not Ideal For:

- Large production applications
- Complex multi-page apps
- Projects needing TypeScript
- Apps requiring build optimization
- Team projects with many files

For production apps, use the **Vite Starter** instead!

## Upgrading to Production

When you outgrow this template:

1. **Switch to Vite Starter:**
   ```bash
   cd templates/vite-starter
   npm install
   npm run dev
   ```

2. **Install Flexium:**
   ```bash
   npm install flexium
   ```

3. **Import from npm instead:**
   ```javascript
   import { signal, computed, effect } from 'flexium/core'
   ```

4. **Split into multiple files**
5. **Add TypeScript** for type safety
6. **Use proper build tools** for optimization

## Examples

### Todo List

Add a simple todo list:

```javascript
const todos = signal([])
const newTodo = signal('')

function addTodo() {
  if (newTodo.value.trim()) {
    todos.value = [...todos.value, {
      id: Date.now(),
      text: newTodo.value,
      done: false
    }]
    newTodo.value = ''
  }
}

// Update render() to show todos
function render() {
  app.innerHTML = `
    <input id="todo-input" value="${newTodo.value}" />
    <button id="add-btn">Add</button>
    <ul>
      ${todos.value.map(todo => `
        <li>${todo.text}</li>
      `).join('')}
    </ul>
  `

  document.getElementById('todo-input')
    .addEventListener('input', e => newTodo.value = e.target.value)
  document.getElementById('add-btn')
    .addEventListener('click', addTodo)
}
```

### Form Validation

Add reactive form validation:

```javascript
const email = signal('')
const emailError = computed(() => {
  if (!email.value) return 'Email required'
  if (!email.value.includes('@')) return 'Invalid email'
  return null
})

function render() {
  app.innerHTML = `
    <input
      type="email"
      value="${email.value}"
      id="email-input"
    />
    ${emailError.value ? `
      <p class="error">${emailError.value}</p>
    ` : ''}
  `
}
```

## Debugging

Open browser DevTools console to see:

- Signal value changes logged
- Computed value updates
- Effect executions

Add your own logging:

```javascript
effect(() => {
  console.log('State snapshot:', {
    count: count.value,
    doubled: doubled.value
  })
})
```

## Performance

This template re-renders the entire DOM on each state change. For production:

- Use the **Vite Starter** with proper DOM diffing
- Install **Flexium** from npm for optimized rendering
- Use the real Flexium DOM renderer
- Implement virtual scrolling for long lists

But for simple apps, this approach is perfectly fine!

## Browser Support

Works in all modern browsers that support:
- ES6 modules (`<script type="module">`)
- Proxies and getters/setters
- Arrow functions
- Template literals

Essentially: Chrome, Firefox, Safari, Edge (all recent versions)

## Troubleshooting

### Blank Page

**Problem:** Page loads but nothing appears
**Solution:** Check browser console for errors, ensure you're using HTTP server

### CORS Errors

**Problem:** Module loading fails
**Solution:** Use HTTP server, not `file://` protocol

### Changes Don't Appear

**Problem:** Modified code but page looks the same
**Solution:** Hard refresh (Cmd/Ctrl + Shift + R)

## Learn More

- [Flexium Documentation](/docs/API.md)
- [Vite Starter Template](../vite-starter/)
- [Todo App Template](../todo-app-template/)

## Next Steps

1. Open `index.html` in your editor
2. Read through the code and comments
3. Modify the counter logic
4. Add your own signals and components
5. When ready, upgrade to Vite starter!

## License

MIT - Use this template freely in your projects!
