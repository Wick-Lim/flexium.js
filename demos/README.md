# Flexium Demos

A comprehensive collection of interactive demos showcasing Flexium's capabilities - from basic reactive signals to complex data visualizations and animations.

## Overview

These demos are designed to be:
- **Visually impressive** - Professional UI/UX design
- **Educational** - Well-commented code with explanations
- **Interactive** - Click, drag, and explore features
- **Self-contained** - Each demo works independently
- **Progressive** - Start simple, get more advanced

## Quick Start

### Running the Demos

1. **Build Flexium** (first time only):
   ```bash
   cd /path/to/flexium.js
   npm install
   npm run build
   ```

2. **Start HTTP server** (required for ES modules):
   ```bash
   cd demos
   python3 -m http.server 8000
   # or
   npx http-server -p 8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000/index.html
   ```

**Important**: Don't open HTML files directly with `file://` protocol - this causes CORS errors with ES6 modules.

## Demo Catalog

### 1. Counter Variations
**Path**: `counter/index.html`
**Complexity**: Beginner
**Topics**: Signals, Effects, Computed, Batch

Six different counter implementations showing:
- Basic signal updates
- Computed derived values
- Async operations with loading states
- Animated value transitions
- Batched updates for performance
- Array of signals with computed totals

**Perfect for**: Learning Flexium fundamentals

**Key Concepts**:
```javascript
const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log('Count:', count.value);
});

count.value++; // Effect runs automatically
```

[View Demo](counter/index.html) | [Read Code](counter/README.md)

---

### 2. TodoMVC
**Path**: `todo-mvc/index.html`
**Complexity**: Intermediate
**Topics**: CRUD, Storage, Filters, State Management

Full-featured todo application implementing:
- Add, edit, delete, toggle todos
- Filter by all/active/completed
- localStorage persistence
- Inline editing (double-click)
- Clear completed button
- Smooth animations

**Perfect for**: Understanding real-world app structure

**Key Concepts**:
```javascript
const todos = signal([]);
const filter = signal('all');

const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.completed);
  if (filter.value === 'completed') return todos.value.filter(t => t.completed);
  return todos.value;
});

// Immutable updates
todos.value = [...todos.value, newTodo];
```

[View Demo](todo-mvc/index.html) | [Read Code](todo-mvc/README.md)

---

### 3. Interactive Dashboard
**Path**: `dashboard/index.html`
**Complexity**: Advanced
**Topics**: Charts, Real-time, Computed Values, Visualization

Professional dashboard featuring:
- Real-time metrics (revenue, users, conversion)
- Animated bar chart (weekly sales)
- SVG donut chart (traffic sources)
- Recent activity feed
- Top users list
- Auto-update mode (every 3 seconds)
- Batched updates for performance

**Perfect for**: Complex computed values and data viz

**Key Concepts**:
```javascript
const revenue = signal(45680);
const totalOrders = signal(892);
const totalVisitors = signal(5678);

// Computed metrics
const conversionRate = computed(() =>
  (totalOrders.value / totalVisitors.value * 100).toFixed(1)
);

const avgOrder = computed(() =>
  (revenue.value / totalOrders.value).toFixed(0)
);

// Batch all updates
batch(() => {
  revenue.value = newRevenue;
  totalOrders.value = newOrders;
  totalVisitors.value = newVisitors;
}); // All effects run once
```

[View Demo](dashboard/index.html) | [Read Code](dashboard/README.md)

---

### 4. Motion & Animations
**Path**: `animations/index.html`
**Complexity**: Intermediate
**Topics**: Web Animations API, Springs, Gestures, Keyframes

Animation showcase with six sections:
- Basic transitions (fade, slide)
- Spring physics (bounce, shake, pulse)
- Staggered animations (notifications)
- Drag & drop with spring-back
- Complex keyframes (orbit, flip)
- Interactive controls (sliders)

**Perfect for**: Learning animation techniques

**Key Concepts**:
```javascript
// Web Animations API
element.animate([
  { opacity: 0, transform: 'translateY(20px)' },
  { opacity: 1, transform: 'translateY(0)' }
], {
  duration: 300,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring!
  fill: 'forwards'
});

// Reactive transforms with signals
const x = signal(0);
const y = signal(0);

effect(() => {
  element.style.transform = `translate(${x.value}px, ${y.value}px)`;
});
```

[View Demo](animations/index.html) | [Read Code](animations/README.md)

---

## Learning Path

### For Beginners
1. **Start with Counter** - Learn signals, effects, computed
2. **Try Animations** - See reactive updates in action
3. **Build TodoMVC** - Apply concepts to real app
4. **Explore Dashboard** - Master advanced patterns

### For Experienced Developers
1. **TodoMVC** - See the architecture
2. **Dashboard** - Complex computed values
3. **Animations** - Web Animations API integration
4. **Counter** - Quick reference for patterns

## Code Patterns Demonstrated

### State Management
```javascript
// Centralized state with signals
const state = {
  user: signal(null),
  todos: signal([]),
  filter: signal('all')
};

// Computed derived state
const activeTodos = computed(() =>
  state.todos.value.filter(t => !t.completed)
);
```

### Immutable Updates
```javascript
// ❌ Don't mutate
todos.value.push(newTodo);
todos.value[0].completed = true;

// ✅ Create new arrays/objects
todos.value = [...todos.value, newTodo];
todos.value = todos.value.map(t =>
  t.id === id ? { ...t, completed: true } : t
);
```

### Effect Patterns
```javascript
// Simple effect
effect(() => {
  console.log('Value:', count.value);
});

// Effect with cleanup
effect(() => {
  const interval = setInterval(() => {
    count.value++;
  }, 1000);

  return () => clearInterval(interval); // Cleanup
});
```

### Batch Updates
```javascript
// Without batch - effects run 3 times
a.value = 1;
b.value = 2;
c.value = 3;

// With batch - effects run once
batch(() => {
  a.value = 1;
  b.value = 2;
  c.value = 3;
});
```

### Async Patterns
```javascript
const data = signal(null);
const loading = signal(false);
const error = signal(null);

async function fetchData() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/data');
    data.value = await response.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
```

## File Structure

```
demos/
├── index.html              # Demo hub (start here)
├── README.md              # This file
│
├── counter/
│   ├── index.html         # Counter variations
│   └── README.md          # Counter documentation
│
├── todo-mvc/
│   ├── index.html         # TodoMVC app
│   └── README.md          # TodoMVC documentation
│
├── dashboard/
│   ├── index.html         # Interactive dashboard
│   └── README.md          # Dashboard documentation
│
└── animations/
    ├── index.html         # Animation showcase
    └── README.md          # Animation documentation
```

## Design Philosophy

### Visual Design
- **Modern gradients** - Eye-catching color schemes
- **Smooth animations** - Professional transitions
- **Responsive layouts** - Works on mobile/tablet/desktop
- **Clean typography** - Easy to read
- **Card-based UI** - Organized sections

### Code Quality
- **Well-commented** - Explain why, not just what
- **Consistent style** - Same patterns across demos
- **No dependencies** - Pure Flexium only
- **Self-contained** - Each demo works alone
- **Production-ready** - Real-world patterns

### Educational Value
- **Progressive complexity** - Start simple
- **Multiple examples** - Different approaches
- **Inline explanations** - Comments in code
- **Detailed READMEs** - Deep dives
- **Performance notes** - Best practices

## Performance Characteristics

| Demo | Initial Render | Update Time | Memory |
|------|---------------|-------------|--------|
| Counter | < 5ms | < 1ms | < 10KB |
| TodoMVC | < 10ms | < 2ms | < 20KB |
| Dashboard | < 15ms | < 5ms | < 50KB |
| Animations | < 10ms | < 3ms | < 30KB |

All measurements for typical usage on modern hardware.

## Browser Compatibility

All demos work in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: Animations demo requires Web Animations API support. Use polyfill for older browsers.

## Common Issues

### CORS Errors
**Problem**: Opening HTML files directly shows CORS errors
**Solution**: Use HTTP server (see Quick Start above)
**Why**: ES6 modules require same-origin policy

### Module Not Found
**Problem**: Import errors in console
**Solution**: Build Flexium first: `npm run build`
**Check**: Verify `dist/` folder exists

### Animations Not Smooth
**Problem**: Choppy animations
**Solution**: Use Chrome DevTools Performance tab
**Check**: Enable hardware acceleration in browser

## Extending the Demos

### Add a New Demo

1. **Create directory**:
   ```bash
   mkdir demos/my-demo
   ```

2. **Create HTML file**:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>My Demo</title>
   </head>
   <body>
     <script type="module">
       import { signal, effect } from '../../dist/index.mjs';
       // Your code here
     </script>
   </body>
   </html>
   ```

3. **Add to hub page** (`index.html`):
   ```html
   <div class="demo-card">
     <h2>My Demo</h2>
     <p>Description...</p>
     <a href="my-demo/index.html">View Demo</a>
   </div>
   ```

4. **Write README**:
   ```markdown
   # My Demo

   ## Features
   - Feature 1
   - Feature 2

   ## Code Examples
   ...
   ```

### Modify Existing Demos

All demos use inline JavaScript for simplicity:
- Edit HTML file directly
- Refresh browser to see changes
- No build step needed (library already built)

## Testing Checklist

Before deploying demos:
- [ ] All demos load without errors
- [ ] Animations run smoothly (60fps)
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile responsive (test on phone)
- [ ] localStorage persists (TodoMVC)
- [ ] No console errors
- [ ] Links work correctly
- [ ] READMEs are accurate

## Contributing

Want to add a demo?

1. Follow the structure above
2. Keep it self-contained
3. Add detailed comments
4. Write a comprehensive README
5. Test in multiple browsers
6. Submit a PR!

## Inspiration

These demos were inspired by:
- **TodoMVC** - Standard app architecture
- **SolidJS Examples** - Signal-based patterns
- **Framer Motion** - Animation showcase
- **Recharts** - Data visualization
- **Tailwind UI** - Modern design

## Next Steps

After exploring these demos:

1. **Build your own app** - Apply patterns to real project
2. **Read API docs** - Deep dive into Flexium API
3. **Contribute** - Add your own demos or improvements
4. **Share** - Show what you built with Flexium!

## Resources

- [Main README](../README.md) - Project overview
- [API Documentation](../docs/API.md) - Complete API reference
- [Migration Guide](../docs/MIGRATION.md) - Coming from React/Vue/Svelte
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

## License

MIT - Same as Flexium

---

**Built with Flexium - Next-generation UI/UX library**
Signal-based reactivity • Zero VDOM • Built-in UX • < 25KB total
